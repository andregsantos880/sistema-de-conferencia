import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AVISO_MIGRACAO,
  excluirLayoutFabrica,
  lerLayoutFabrica,
  migracaoPendente,
  salvarLayoutFabrica,
  type FabricaAdmin,
} from '../lib/api';
import {
  analisarArquivo,
  CAMPOS_MAPEAIVEIS,
  preverColunas,
  rotuloSeparador,
  type Campo,
  type CampoPosicional,
  type LayoutFabrica,
  type RegraDerivada,
  type TipoLayout,
} from '../lib/parsers';
import { lerTextoDoArquivo } from '../lib/arquivo';

type Props = {
  fabrica: FabricaAdmin;
  onFechar: () => void;
  onSalvo: () => void;
};

/** De-para no modo delimitado: índice da coluna. */
type MapaColunas = Partial<Record<Campo, string>>;

/** De-para no modo posicional: onde começa e quanto ocupa. */
type Geom = { pos: string; len: string; zeros: boolean };

/** Regra de campo montado a partir de outro (ex.: produto dentro da etiqueta). */
type Regra = {
  ativa: boolean;
  de: Campo;
  modo: 'pedaco' | 'ultimos';
  pos: string;
  len: string;
  zeros: boolean;
  sePrefixo: string;
  senaoPos: string;
  senaoLen: string;
  senaoZeros: boolean;
  ultimos: string;
  padrao: string;
};

const REGRA_VAZIA: Regra = {
  ativa: false,
  de: 'etiqueta',
  modo: 'pedaco',
  pos: '',
  len: '',
  zeros: false,
  sePrefixo: '',
  senaoPos: '',
  senaoLen: '',
  senaoZeros: false,
  ultimos: '',
  padrao: '',
};

const SEPARADORES: ReadonlyArray<{ valor: string; rotulo: string }> = [
  { valor: ';', rotulo: '; ponto e vírgula' },
  { valor: '\t', rotulo: 'TAB' },
  { valor: '|', rotulo: '| barra vertical' },
  { valor: ',', rotulo: ', vírgula' },
];

const numero = (valor: string, padrao = 0): number => {
  const n = Number(String(valor).replace(',', '.'));
  return Number.isFinite(n) ? n : padrao;
};

/** Régua de referência: 0····10····20····30 (ajuda a achar a posição no arquivo). */
function regua(tamanho: number): string {
  const largura = Math.max(tamanho, 80);
  const chars = Array.from({ length: largura }, () => '·');
  for (let i = 0; i < largura; i += 10) {
    const rotulo = String(i);
    for (let j = 0; j < rotulo.length && i + j < largura; j++) chars[i + j] = rotulo[j];
  }
  return chars.join('');
}

/** Converte a regra da tela para o JSON que o banco guarda. */
function regraParaApi(regra: Regra): RegraDerivada {
  const saida: RegraDerivada = { de: regra.de };
  if (regra.modo === 'ultimos') {
    if (regra.ultimos !== '') saida.ultimos = numero(regra.ultimos);
    if (regra.padrao) saida.padrao = regra.padrao;
    return saida;
  }
  if (regra.pos !== '') saida.pos = numero(regra.pos);
  if (regra.len !== '') saida.len = numero(regra.len);
  if (regra.zeros) saida.zeros = true;
  if (regra.sePrefixo) {
    saida.se_prefixo = regra.sePrefixo;
    if (regra.senaoPos !== '') saida.senao_pos = numero(regra.senaoPos);
    if (regra.senaoLen !== '') saida.senao_len = numero(regra.senaoLen);
    if (regra.senaoZeros) saida.senao_zeros = true;
  }
  if (regra.padrao) saida.padrao = regra.padrao;
  return saida;
}

/** Converte a regra que veio do banco para o estado da tela. */
function regraDaApi(bruta: Record<string, unknown>): Regra {
  const texto = (valor: unknown): string =>
    valor === undefined || valor === null ? '' : String(valor);
  return {
    ativa: true,
    de: (bruta.de as Campo) ?? 'etiqueta',
    modo: bruta.ultimos !== undefined && bruta.ultimos !== null ? 'ultimos' : 'pedaco',
    pos: texto(bruta.pos),
    len: texto(bruta.len),
    zeros: !!bruta.zeros,
    sePrefixo: texto(bruta.se_prefixo),
    senaoPos: texto(bruta.senao_pos),
    senaoLen: texto(bruta.senao_len),
    senaoZeros: !!bruta.senao_zeros,
    ultimos: texto(bruta.ultimos),
    padrao: texto(bruta.padrao),
  };
}

/**
 * Assistente de layout — a mesma ideia do "Importar dados TXT" do Excel:
 *   1. o usuário escolhe um arquivo de exemplo da fábrica;
 *   2. o sistema identifica o formato (separado por caractere ou LARGURA FIXA),
 *      a linha inicial, o cabeçalho e as posições;
 *   3. o usuário confere na prévia — no posicional, com régua e recorte destacado;
 *   4. salva; a importação passa a ler os arquivos dessa fábrica assim.
 */
export default function ConfigLayoutFabrica({ fabrica, onFechar, onSalvo }: Props) {
  const [conteudo, setConteudo] = useState('');
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [tipo, setTipo] = useState<TipoLayout>('delimitado');
  const [delimitador, setDelimitador] = useState(';');
  const [linhaInicial, setLinhaInicial] = useState('1');
  const [temCabecalho, setTemCabecalho] = useState(false);
  const [linhaMinima, setLinhaMinima] = useState('0');
  const [colunas, setColunas] = useState<MapaColunas>({});
  const [geoms, setGeoms] = useState<Partial<Record<Campo, Geom>>>({});
  const [fixos, setFixos] = useState<Partial<Record<Campo, string>>>({});
  const [regras, setRegras] = useState<Partial<Record<Campo, Regra>>>({});
  const [avancado, setAvancado] = useState<Campo | null>(null);
  const [temLayoutSalvo, setTemLayoutSalvo] = useState(false);
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [salvando, setSalvando] = useState(false);
  const arquivoRef = useRef<HTMLInputElement>(null);

  /* ao abrir, traz o que já estava configurado para esta fábrica */
  useEffect(() => {
    let cancelado = false;
    lerLayoutFabrica(fabrica.controle)
      .then((salvo) => {
        if (cancelado || !salvo) return;
        setTipo(salvo.tipo === 'posicional' ? 'posicional' : 'delimitado');
        setDelimitador(salvo.delimitador || ';');
        setLinhaInicial(String(salvo.linha_inicial ?? 1));
        setTemCabecalho(!!salvo.tem_cabecalho);
        setLinhaMinima(String(salvo.linha_minima ?? 0));

        const colunasSalvas: MapaColunas = {};
        const geomsSalvos: Partial<Record<Campo, Geom>> = {};
        for (const { campo } of CAMPOS_MAPEAIVEIS) {
          const valor = (salvo.campos ?? {})[campo];
          if (valor === undefined || valor === null) continue;
          if (typeof valor === 'number') colunasSalvas[campo] = String(valor);
          else
            geomsSalvos[campo] = {
              pos: String(valor.pos ?? 0),
              len: String(valor.len ?? 0),
              zeros: !!valor.zeros,
            };
        }
        setColunas(colunasSalvas);
        setGeoms(geomsSalvos);
        setFixos(
          Object.fromEntries(
            Object.entries(salvo.fixos ?? {}).map(([campo, valor]) => [campo, String(valor)]),
          ),
        );
        setRegras(
          Object.fromEntries(
            Object.entries(salvo.derivados ?? {}).map(([campo, regra]) => [
              campo,
              regraDaApi(regra as Record<string, unknown>),
            ]),
          ),
        );
        setTemLayoutSalvo(true);
      })
      .catch((falha) => {
        if (!cancelado && !migracaoPendente(falha)) {
          setErro(falha instanceof Error ? falha.message : 'Falha ao ler o layout atual.');
        }
      });
    return () => {
      cancelado = true;
    };
  }, [fabrica.controle]);

  /* ------------------------------------------------------------- layout ---- */

  /** O layout como a leitura entende — é ele que roda o teste do passo 5. */
  const layoutAtual: LayoutFabrica = useMemo(() => {
    const campos: Partial<Record<Campo, number | CampoPosicional>> = {};
    const derivados: Partial<Record<Campo, RegraDerivada>> = {};
    const valoresFixos: Partial<Record<Campo, string | number>> = {};

    for (const { campo } of CAMPOS_MAPEAIVEIS) {
      const regra = regras[campo];
      if (regra?.ativa) {
        derivados[campo] = regraParaApi(regra);
      } else if (tipo === 'posicional') {
        const g = geoms[campo];
        if (g && g.pos !== '') {
          campos[campo] = { pos: numero(g.pos), len: numero(g.len), zeros: g.zeros };
        }
      } else {
        const valor = colunas[campo];
        if (valor !== undefined && valor !== '') campos[campo] = numero(valor);
      }

      const fixo = fixos[campo];
      if (fixo !== undefined && fixo !== '') valoresFixos[campo] = fixo;
    }

    return {
      tipo,
      delimitador,
      linhaInicial: Math.max(1, numero(linhaInicial, 1)),
      temCabecalho,
      linhaMinima: Math.max(0, numero(linhaMinima)),
      campos,
      fixos: valoresFixos,
      derivados,
    };
  }, [tipo, delimitador, linhaInicial, temCabecalho, linhaMinima, colunas, geoms, fixos, regras]);

  const temEtiqueta = layoutAtual.campos.etiqueta !== undefined;

  /* ------------------------------------------------------------- prévia ---- */

  const previa = useMemo(
    () =>
      conteudo && tipo === 'delimitado'
        ? preverColunas(conteudo, {
            delimitador,
            linhaInicial: numero(linhaInicial, 1),
            temCabecalho,
          })
        : null,
    [conteudo, tipo, delimitador, linhaInicial, temCabecalho],
  );

  const linhasArquivo = useMemo(
    () =>
      conteudo
        .split(/\r?\n/)
        .map((linha) => linha.trimEnd())
        .filter((linha) => linha.trim().length > 0),
    [conteudo],
  );

  /** Linhas mostradas na prévia posicional (já pulando as linhas iniciais). */
  const linhasPosicionais = useMemo(() => {
    if (!conteudo || tipo !== 'posicional') return [];
    const inicio = Math.max(0, numero(linhaInicial, 1) - 1);
    return linhasArquivo.slice(inicio, inicio + 6);
  }, [conteudo, tipo, linhaInicial, linhasArquivo]);

  const totalColunas = previa
    ? previa.linhas.reduce((maior, l) => Math.max(maior, l.length), 0)
    : 0;
  const linhaBase = previa
    ? ((temCabecalho ? previa.linhas[1] : previa.linhas[0]) ?? previa.linhas[0] ?? [])
    : [];

  /** Roda a leitura de verdade com o que está na tela — é o teste antes de salvar. */
  const resultado = useMemo(() => {
    if (!conteudo) return null;
    return analisarArquivo(conteudo, {
      idlayout: fabrica.controle,
      nomeArquivo: nomeArquivo || 'exemplo.txt',
      fabrica: fabrica.nome,
      layout: layoutAtual,
    });
  }, [conteudo, layoutAtual, fabrica, nomeArquivo]);

  const porColuna = useMemo(() => {
    const mapa = new Map<number, string[]>();
    for (const { campo, titulo } of CAMPOS_MAPEAIVEIS) {
      const valor = colunas[campo];
      if (valor === undefined || valor === '') continue;
      const lista = mapa.get(numero(valor)) ?? [];
      lista.push(titulo);
      mapa.set(numero(valor), lista);
    }
    return mapa;
  }, [colunas]);

  /* -------------------------------------------------------------- ações ---- */

  async function lerArquivo(arquivo: File) {
    setErro('');
    setMensagem('');
    if (arquivo.size > 10 * 1024 * 1024) {
      setErro('Use um arquivo de exemplo menor (até 10 MB) — só as primeiras linhas são lidas.');
      return;
    }
    try {
      const { texto, codificacao } = await lerTextoDoArquivo(arquivo);
      setConteudo(texto);
      setNomeArquivo(arquivo.name);

      const palpite = preverColunas(texto);
      const notaCodificacao =
        codificacao === 'UTF-8' ? '' : ` Arquivo lido como ${codificacao} (acentos).`;

      if (palpite.posicionalSugerido) {
        /* sem separador e com linhas longas: largura fixa */
        setTipo('posicional');
        setLinhaInicial(String(palpite.linhaSugerida));
        setTemCabecalho(false);
        setLinhaMinima('0');
        setColunas({});
        setMensagem(
          'O arquivo não tem separador e as linhas são longas — abri como LARGURA FIXA. ' +
            'Informe a posição e o tamanho de cada campo no passo 4.' +
            notaCodificacao,
        );
      } else {
        setTipo('delimitado');
        setDelimitador(palpite.separador);
        setLinhaInicial(String(palpite.linhaSugerida));
        setTemCabecalho(palpite.cabecalhoSugerido);
        setColunas(
          Object.fromEntries(
            Object.entries(palpite.camposSugeridos).map(([campo, i]) => [campo, String(i)]),
          ),
        );
        setMensagem(
          (palpite.linhaSugerida > 1
            ? `O assistente achou o cabeçalho na linha ${palpite.linhaSugerida} — confira a prévia.`
            : 'Arquivo lido: confira a prévia e o de-para das colunas.') + notaCodificacao,
        );
      }
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao ler o arquivo.');
    }
  }

  function sugerir() {
    if (!conteudo) return;
    const palpite = preverColunas(conteudo);
    if (palpite.posicionalSugerido) {
      setTipo('posicional');
      setLinhaInicial(String(palpite.linhaSugerida));
    } else {
      setTipo('delimitado');
      setDelimitador(palpite.separador);
      setLinhaInicial(String(palpite.linhaSugerida));
      setTemCabecalho(palpite.cabecalhoSugerido);
      setColunas(
        Object.fromEntries(
          Object.entries(palpite.camposSugeridos).map(([campo, i]) => [campo, String(i)]),
        ),
      );
    }
    setMensagem('Sugestão do assistente aplicada — confira a prévia e ajuste o que precisar.');
  }

  async function salvar() {
    setErro('');
    setMensagem('');
    if (!temEtiqueta) {
      setErro(
        tipo === 'posicional'
          ? 'Informe a posição e o tamanho da ETIQUETA (código de barras).'
          : 'Escolha qual coluna do arquivo tem a ETIQUETA (código de barras).',
      );
      return;
    }
    setSalvando(true);
    try {
      await salvarLayoutFabrica(fabrica.controle, {
        tipo: layoutAtual.tipo,
        delimitador: layoutAtual.delimitador,
        linha_inicial: layoutAtual.linhaInicial,
        tem_cabecalho: layoutAtual.temCabecalho,
        linha_minima: layoutAtual.linhaMinima ?? 0,
        campos: layoutAtual.campos as Record<string, number | CampoPosicional>,
        fixos: (layoutAtual.fixos ?? {}) as Record<string, string | number>,
        derivados: (layoutAtual.derivados ?? {}) as Record<string, Record<string, unknown>>,
      });
      onSalvo();
    } catch (falha) {
      setErro(
        migracaoPendente(falha)
          ? AVISO_MIGRACAO
          : falha instanceof Error
            ? falha.message
            : 'Falha ao salvar o layout.',
      );
    } finally {
      setSalvando(false);
    }
  }

  async function remover() {
    if (!confirm(`Remover o layout configurado de "${fabrica.nome}"?`)) return;
    setErro('');
    setSalvando(true);
    try {
      await excluirLayoutFabrica(fabrica.controle);
      onSalvo();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao remover o layout.');
    } finally {
      setSalvando(false);
    }
  }

  /* --------------------------------------------------------------- tela ---- */

  const caixa = 'rounded border border-slate-300 px-2 py-1 text-xs';
  const campoPequeno = `${caixa} w-20`;

  const etiquetaLinha = linhasPosicionais[0] ?? '';

  /** Recorte de um campo na linha de exemplo (o usuário vê o que pegou). */
  function recorte(campo: Campo): string {
    const regra = regras[campo];
    if (regra?.ativa) {
      const texto = recorteDaRegra(regra);
      return texto ? `→ "${texto.slice(0, 24)}"` : '→ (vazio)';
    }
    if (tipo !== 'posicional') {
      const valor = colunas[campo];
      if (valor === undefined || valor === '') return '';
      const amostra = linhaBase[numero(valor)] ?? '';
      return amostra ? `→ "${amostra.slice(0, 24)}"` : '';
    }
    const g = geoms[campo];
    if (!g || g.pos === '' || !etiquetaLinha) return '';
    const pos = numero(g.pos);
    const len = numero(g.len);
    const texto = (len > 0 ? etiquetaLinha.substr(pos, len) : etiquetaLinha.substring(pos)).trim();
    return texto ? `→ "${texto.slice(0, 24)}"` : '→ (vazio)';
  }

  function recorteDaRegra(regra: Regra): string {
    const g = geoms[regra.de];
    if (!g || g.pos === '' || !etiquetaLinha) return '';
    const pos = numero(g.pos);
    const len = numero(g.len);
    const origem = (len > 0 ? etiquetaLinha.substr(pos, len) : etiquetaLinha.substring(pos)).trim();
    if (!origem) return '';

    if (regra.modo === 'ultimos') {
      const n = numero(regra.ultimos);
      return n > 0 && origem.length >= n ? origem.substring(origem.length - n) : '';
    }

    const fatia = (p: string, l: string, zeros: boolean): string => {
      const inicio = numero(p);
      const tamanho = numero(l);
      const texto = (tamanho > 0 ? origem.substr(inicio, tamanho) : origem.substring(inicio)).trim();
      return zeros ? texto.replace(/^0+/, '') : texto;
    };

    if (regra.sePrefixo) {
      if (origem.startsWith(regra.sePrefixo)) return fatia(regra.pos, regra.len, false);
      return fatia(regra.senaoPos, regra.senaoLen, regra.senaoZeros) || regra.padrao;
    }
    return fatia(regra.pos, regra.len, false);
  }

  /** Divide a linha em pedaços marcando o que cada campo ocupa (sobreposição junta). */
  function comMarcas(linha: string): Array<{ texto: string; titulos: string[] }> {
    const dono = new Map<number, string[]>();
    for (const { campo, titulo } of CAMPOS_MAPEAIVEIS) {
      if (regras[campo]?.ativa) continue;
      const g = geoms[campo];
      if (!g || g.pos === '') continue;
      const pos = numero(g.pos);
      const len = numero(g.len);
      const fim = len > 0 ? pos + len : linha.length;
      for (let i = pos; i < fim; i++) dono.set(i, [...(dono.get(i) ?? []), titulo]);
    }

    const partes: Array<{ texto: string; titulos: string[] }> = [];
    let inicio = 0;
    let atual = dono.get(0) ?? [];
    for (let i = 1; i <= linha.length; i++) {
      const proximo = i < linha.length ? (dono.get(i) ?? []) : [];
      if (proximo.join('|') !== atual.join('|')) {
        partes.push({ texto: linha.slice(inicio, i), titulos: atual });
        inicio = i;
        atual = proximo;
      }
    }
    return partes.filter((parte) => parte.texto.length > 0);
  }

  const ajustarGeom = (campo: Campo, mudanca: Partial<Geom>) =>
    setGeoms((atual) => ({
      ...atual,
      [campo]: {
        pos: atual[campo]?.pos ?? '0',
        len: atual[campo]?.len ?? '0',
        zeros: atual[campo]?.zeros ?? false,
        ...mudanca,
      },
    }));

  const ajustarRegra = (campo: Campo, mudanca: Partial<Regra>) =>
    setRegras((atual) => ({
      ...atual,
      [campo]: { ...(atual[campo] ?? REGRA_VAZIA), ativa: true, ...mudanca },
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[92vh] w-full max-w-[1250px] flex-col rounded-lg border border-slate-300 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
          <h2 className="text-sm font-semibold text-slate-700">
            Layout do arquivo — {fabrica.nome}
            {temLayoutSalvo && (
              <span className="ml-2 text-[11px] text-emerald-700">(já configurado)</span>
            )}
          </h2>
          <button
            onClick={onFechar}
            className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
          >
            Fechar
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-auto p-4">
          {/* 1. arquivo de exemplo ------------------------------------------- */}
          <section className="rounded border border-slate-200 p-3">
            <p className="mb-1 text-xs font-semibold text-slate-700">
              1. Escolha um arquivo de exemplo desta fábrica
            </p>
            <p className="mb-2 text-[11px] text-slate-500">
              Use um arquivo real (pode ser pequeno, de um dia de pedidos). O sistema identifica o
              formato e você confere/ajusta. Codificação esperada: UTF-8.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => arquivoRef.current?.click()}
                className="rounded border border-slate-400 bg-slate-100 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200"
              >
                Escolher arquivo...
              </button>
              <input
                ref={arquivoRef}
                type="file"
                accept=".txt,.csv,.dat,.tsv,.prn,text/plain"
                className="hidden"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];
                  if (arquivo) void lerArquivo(arquivo);
                  e.target.value = '';
                }}
              />
              {nomeArquivo && <span className="text-[11px] text-slate-600">{nomeArquivo}</span>}
              {conteudo && (
                <span className="text-[11px] text-slate-500">
                  {linhasArquivo.length} linha(s) lida(s)
                  {previa ? ` · ${totalColunas} coluna(s)` : ''}
                </span>
              )}
            </div>
            {previa?.suspeitaCodificacao && (
              <p className="mt-2 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
                O arquivo parece não estar em UTF-8 (acentos corrompidos). Salve-o como UTF-8 no
                sistema da fábrica antes de importar.
              </p>
            )}
          </section>

          {/* 2. formato ------------------------------------------------------- */}
          <section className="rounded border border-slate-200 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-700">2. Formato do arquivo</p>
            <div className="mb-3 flex gap-4 text-xs text-slate-700">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={tipo === 'delimitado'}
                  onChange={() => setTipo('delimitado')}
                />
                Separado por caractere (CSV/TXT)
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={tipo === 'posicional'}
                  onChange={() => setTipo('posicional')}
                />
                Largura fixa (posicional)
              </label>
            </div>

            <div className="flex flex-wrap items-end gap-4">
              {tipo === 'delimitado' ? (
                <label className="text-[11px] text-slate-600">
                  <span className="block">Separador das colunas</span>
                  <select
                    value={delimitador}
                    onChange={(e) => setDelimitador(e.target.value)}
                    className={caixa}
                  >
                    {SEPARADORES.map((s) => (
                      <option key={s.rotulo} value={s.valor}>
                        {s.rotulo}
                      </option>
                    ))}
                  </select>
                </label>
              ) : (
                <label className="text-[11px] text-slate-600">
                  <span className="block">Ignorar linhas menores que (caracteres)</span>
                  <input
                    type="number"
                    min={0}
                    value={linhaMinima}
                    onChange={(e) => setLinhaMinima(e.target.value)}
                    className={campoPequeno}
                  />
                </label>
              )}

              <label className="text-[11px] text-slate-600">
                <span className="block">Começar na linha</span>
                <input
                  type="number"
                  min={1}
                  value={linhaInicial}
                  onChange={(e) => setLinhaInicial(e.target.value)}
                  className={campoPequeno}
                />
              </label>
              <label className="flex items-center gap-1 text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  checked={temCabecalho}
                  onChange={(e) => setTemCabecalho(e.target.checked)}
                />
                A primeira linha é cabeçalho (nomes das colunas)
              </label>
              <button
                onClick={sugerir}
                disabled={!conteudo}
                className="rounded border border-slate-400 bg-slate-100 px-2 py-1 text-[11px] hover:bg-slate-200 disabled:opacity-50"
              >
                Sugerir automaticamente
              </button>
              {previa && (
                <span className="text-[11px] text-slate-500">
                  Detectado: separador “{rotuloSeparador(previa.separador)}”
                  {previa.cabecalhoSugerido ? ', com cabeçalho' : ', sem cabeçalho'}
                </span>
              )}
            </div>
          </section>

          {/* 3. prévia -------------------------------------------------------- */}
          <section className="rounded border border-slate-200 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-700">
              3. Prévia — confira se os campos caem nos lugares certos
            </p>

            {!conteudo && (
              <p className="text-[11px] text-slate-500">
                Escolha um arquivo no passo 1 para ver a prévia.
              </p>
            )}

            {conteudo && tipo === 'delimitado' && previa && (
              <>
                <div className="max-h-56 overflow-auto rounded border border-slate-300">
                  <table className="min-w-full text-[11px]">
                    <thead className="bg-slate-100 text-left text-slate-600">
                      <tr>
                        {Array.from({ length: totalColunas }, (_, i) => (
                          <th
                            key={i}
                            className="whitespace-nowrap border-r border-slate-200 px-2 py-1"
                          >
                            <div className="font-semibold">Col {i + 1}</div>
                            {porColuna.has(i) && (
                              <div className="font-normal text-emerald-700">
                                {porColuna.get(i)?.join(' + ')}
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previa.linhas.map((linha, r) => (
                        <tr
                          key={r}
                          className={
                            temCabecalho && r === 0
                              ? 'bg-sky-50 text-sky-800'
                              : 'border-t border-slate-200'
                          }
                        >
                          {Array.from({ length: totalColunas }, (_, c) => (
                            <td key={c} className="whitespace-nowrap px-2 py-1 font-mono">
                              {linha[c] ?? ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  {temCabecalho
                    ? 'A primeira linha é tratada como cabeçalho e não vira pedido.'
                    : 'Todas as linhas úteis viram pedido.'}
                </p>
              </>
            )}

            {conteudo && tipo === 'posicional' && (
              <>
                <p className="mb-1 text-[11px] text-slate-500">
                  A régua mostra a posição de cada caractere. O trecho destacado é o que cada campo
                  captura; trecho em <span className="bg-amber-100 px-1">amarelo</span> indica dois
                  campos usando o mesmo pedaço da linha.
                </p>
                <div className="overflow-auto rounded border border-slate-300 bg-white p-2 font-mono text-[11px] leading-5">
                  <div className="whitespace-pre text-slate-400">
                    {regua(etiquetaLinha.length)}
                  </div>
                  {linhasPosicionais.map((linha, i) => (
                    <div key={i} className="whitespace-pre">
                      {comMarcas(linha).map((parte, j) => (
                        <span
                          key={j}
                          title={parte.titulos.join(' + ')}
                          className={
                            parte.titulos.length === 0
                              ? 'text-slate-400'
                              : parte.titulos.length > 1
                                ? 'bg-amber-100'
                                : 'bg-sky-100'
                          }
                        >
                          {parte.texto}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-[10px] text-slate-500">
                  {CAMPOS_MAPEAIVEIS.filter(
                    ({ campo }) => geoms[campo] && geoms[campo]?.pos !== '' && !regras[campo]?.ativa,
                  )
                    .map(
                      ({ campo, titulo }) =>
                        `[${titulo}: ${geoms[campo]?.pos}+${numero(geoms[campo]?.len ?? '0') || 'fim'}]`,
                    )
                    .join(' ')}
                  {Object.keys(regras).length > 0 &&
                    ' · campos por regra: ' +
                      Object.entries(regras)
                        .filter(([, regra]) => regra.ativa)
                        .map(([campo, regra]) => `${campo} (de ${regra.de})`)
                        .join(', ')}
                </p>
              </>
            )}
          </section>

          {/* 4. de-para ------------------------------------------------------- */}
          <section className="rounded border border-slate-200 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-700">
              4. O que é cada campo ({tipo === 'posicional' ? 'posição e tamanho' : 'de-para'})
            </p>

            <div className="space-y-1">
              {CAMPOS_MAPEAIVEIS.map(({ campo, titulo, obrigatorio }) => {
                const regra = regras[campo];
                const g = geoms[campo];
                return (
                  <div key={campo} className="rounded border border-slate-100 px-2 py-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                      <span className="w-52 shrink-0">
                        {titulo}
                        {obrigatorio && <span className="text-red-600"> *</span>}
                      </span>

                      {tipo === 'delimitado' ? (
                        <select
                          value={colunas[campo] ?? ''}
                          onChange={(e) =>
                            setColunas((atual) => ({ ...atual, [campo]: e.target.value }))
                          }
                          className={`${caixa} w-72`}
                        >
                          <option value="">— não usar —</option>
                          {Array.from({ length: totalColunas }, (_, i) => {
                            const amostra = linhaBase[i] ?? '';
                            return (
                              <option key={i} value={i}>
                                Col {i + 1}
                                {amostra ? ` — ${amostra.slice(0, 22)}` : ''}
                              </option>
                            );
                          })}
                        </select>
                      ) : (
                        <>
                          <label className="flex items-center gap-1">
                            pos
                            <input
                              type="number"
                              min={0}
                              disabled={regra?.ativa}
                              value={g?.pos ?? ''}
                              onChange={(e) => ajustarGeom(campo, { pos: e.target.value })}
                              className={`${campoPequeno} disabled:bg-slate-100`}
                            />
                          </label>
                          <label className="flex items-center gap-1">
                            tam
                            <input
                              type="number"
                              min={0}
                              disabled={regra?.ativa}
                              value={g?.len ?? ''}
                              onChange={(e) => ajustarGeom(campo, { len: e.target.value })}
                              title="0 = até o fim da linha"
                              className={`${campoPequeno} disabled:bg-slate-100`}
                            />
                          </label>
                          <label className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              disabled={regra?.ativa}
                              checked={g?.zeros ?? false}
                              onChange={(e) => ajustarGeom(campo, { zeros: e.target.checked })}
                            />
                            sem zeros à esquerda
                          </label>
                        </>
                      )}

                      {campo !== 'etiqueta' && (
                        <>
                          <label className="flex items-center gap-1">
                            se vazio
                            <input
                              type="text"
                              value={fixos[campo] ?? ''}
                              onChange={(e) =>
                                setFixos((atual) => ({ ...atual, [campo]: e.target.value }))
                              }
                              placeholder="(do arquivo)"
                              className={`${caixa} w-32`}
                            />
                          </label>
                          <button
                            onClick={() => setAvancado((atual) => (atual === campo ? null : campo))}
                            className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100"
                          >
                            {regra?.ativa ? 'regra ✓' : 'montar de outro campo'}
                          </button>
                        </>
                      )}

                      <span className="font-mono text-emerald-700">{recorte(campo)}</span>
                    </div>

                    {avancado === campo && (
                      <div className="mt-2 flex flex-wrap items-center gap-2 rounded bg-slate-50 p-2 text-[11px] text-slate-600">
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={regra?.ativa ?? false}
                            onChange={(e) => ajustarRegra(campo, { ativa: e.target.checked })}
                          />
                          usar regra
                        </label>
                        <label className="flex items-center gap-1">
                          de
                          <select
                            value={regra?.de ?? 'etiqueta'}
                            onChange={(e) => ajustarRegra(campo, { de: e.target.value as Campo })}
                            className={caixa}
                          >
                            {CAMPOS_MAPEAIVEIS.filter((c) => c.campo !== campo).map((c) => (
                              <option key={c.campo} value={c.campo}>
                                {c.titulo}
                              </option>
                            ))}
                          </select>
                        </label>

                        <select
                          value={regra?.modo ?? 'pedaco'}
                          onChange={(e) => ajustarRegra(campo, { modo: e.target.value as Regra['modo'] })}
                          className={caixa}
                        >
                          <option value="pedaco">um pedaço</option>
                          <option value="ultimos">os últimos dígitos</option>
                        </select>

                        {(regra?.modo ?? 'pedaco') === 'pedaco' ? (
                          <>
                            <label className="flex items-center gap-1">
                              pos
                              <input
                                type="number"
                                value={regra?.pos ?? ''}
                                onChange={(e) => ajustarRegra(campo, { pos: e.target.value })}
                                className={campoPequeno}
                              />
                            </label>
                            <label className="flex items-center gap-1">
                              tam
                              <input
                                type="number"
                                value={regra?.len ?? ''}
                                onChange={(e) => ajustarRegra(campo, { len: e.target.value })}
                                className={campoPequeno}
                              />
                            </label>
                            <label className="flex items-center gap-1">
                              <input
                                type="checkbox"
                                checked={regra?.zeros ?? false}
                                onChange={(e) => ajustarRegra(campo, { zeros: e.target.checked })}
                              />
                              sem zeros à esquerda
                            </label>
                            <label className="flex items-center gap-1">
                              se começa com
                              <input
                                type="text"
                                value={regra?.sePrefixo ?? ''}
                                onChange={(e) => ajustarRegra(campo, { sePrefixo: e.target.value })}
                                placeholder="(sempre)"
                                className={`${caixa} w-24`}
                              />
                            </label>
                            {regra?.sePrefixo ? (
                              <>
                                <span>senão: pos</span>
                                <input
                                  type="number"
                                  value={regra.senaoPos}
                                  onChange={(e) => ajustarRegra(campo, { senaoPos: e.target.value })}
                                  className={campoPequeno}
                                />
                                <span>tam</span>
                                <input
                                  type="number"
                                  value={regra.senaoLen}
                                  onChange={(e) => ajustarRegra(campo, { senaoLen: e.target.value })}
                                  className={campoPequeno}
                                />
                                <label className="flex items-center gap-1">
                                  <input
                                    type="checkbox"
                                    checked={regra.senaoZeros}
                                    onChange={(e) =>
                                      ajustarRegra(campo, { senaoZeros: e.target.checked })
                                    }
                                  />
                                  sem zeros
                                </label>
                              </>
                            ) : null}
                            <label className="flex items-center gap-1">
                              padrão
                              <input
                                type="text"
                                value={regra?.padrao ?? ''}
                                onChange={(e) => ajustarRegra(campo, { padrao: e.target.value })}
                                className={`${caixa} w-20`}
                              />
                            </label>
                          </>
                        ) : (
                          <label className="flex items-center gap-1">
                            últimos
                            <input
                              type="number"
                              value={regra?.ultimos ?? ''}
                              onChange={(e) => ajustarRegra(campo, { ultimos: e.target.value })}
                              className={campoPequeno}
                            />
                            dígitos
                          </label>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!temEtiqueta && (
              <p className="mt-2 text-[11px] text-amber-800">
                A <strong>etiqueta</strong> (código de barras) é obrigatória: é por ela que a
                conferência dá baixa no pedido.
              </p>
            )}
          </section>

          {/* 5. resultado ----------------------------------------------------- */}
          {resultado && (
            <section className="rounded border border-slate-200 bg-slate-50 p-3">
              <p className="mb-1 text-xs font-semibold text-slate-700">5. Teste da leitura</p>
              <p className="text-[11px] text-slate-600">
                Com esta configuração, o arquivo gera{' '}
                <strong className="text-emerald-700">{resultado.linhas.length} pedido(s)</strong>
                {resultado.descartadas > 0 && (
                  <>
                    {' '}
                    e <strong className="text-amber-700">{resultado.descartadas} linha(s)</strong>{' '}
                    são descartadas
                  </>
                )}
                . Origem do mapeamento:{' '}
                {resultado.origem === 'layout' ? 'layout desta tela' : resultado.origem}.
              </p>

              {resultado.linhas.length > 0 && (
                <div className="mt-2 max-h-40 overflow-auto rounded border border-slate-300 bg-white">
                  <table className="min-w-full text-[11px]">
                    <thead className="bg-slate-100 text-left text-slate-600">
                      <tr>
                        <th className="px-2 py-1">OC / carga</th>
                        <th className="px-2 py-1">Etiqueta</th>
                        <th className="px-2 py-1">Produto</th>
                        <th className="px-2 py-1">Descrição</th>
                        <th className="px-2 py-1">Qtde</th>
                        <th className="px-2 py-1">Volume</th>
                        <th className="px-2 py-1">Seq.</th>
                        <th className="px-2 py-1">Cliente</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultado.linhas.slice(0, 5).map((linha, i) => (
                        <tr key={i} className="border-t border-slate-200 font-mono">
                          <td className="px-2 py-1">{linha.ordcompra}</td>
                          <td className="px-2 py-1">{linha.etiqueta}</td>
                          <td className="px-2 py-1">{linha.produto}</td>
                          <td className="px-2 py-1">{linha.descricao1}</td>
                          <td className="px-2 py-1">{linha.qtde}</td>
                          <td className="px-2 py-1">{linha.volume}</td>
                          <td className="px-2 py-1">{linha.sequencia}</td>
                          <td className="px-2 py-1">{linha.cliente}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {resultado.linhas.length === 0 && (
                <p className="mt-1 text-[11px] text-red-700">
                  Nenhum pedido reconhecido — revise a linha inicial, as posições e o de-para acima.
                </p>
              )}
            </section>
          )}

          {erro && (
            <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-[11px] text-red-700">
              {erro}
            </p>
          )}
          {mensagem && (
            <p className="rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800">
              {mensagem}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-2">
          <span className="text-[11px] text-slate-500">
            Depois de salvar, a importação desta fábrica passa a usar este layout — sem depender de
            programação.
          </span>
          <div className="flex gap-2">
            {temLayoutSalvo && (
              <button
                onClick={() => void remover()}
                disabled={salvando}
                className="rounded border border-red-300 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
              >
                Remover layout
              </button>
            )}
            <button
              onClick={onFechar}
              className="rounded border border-slate-300 px-3 py-1.5 text-xs hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              onClick={() => void salvar()}
              disabled={salvando || !temEtiqueta}
              className="rounded border border-emerald-600 bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {salvando ? 'Salvando...' : 'Salvar layout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
