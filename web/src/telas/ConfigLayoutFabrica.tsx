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
} from '../lib/parsers';

type Props = {
  fabrica: FabricaAdmin;
  onFechar: () => void;
  onSalvo: () => void;
};

type MapaTela = Partial<Record<Campo, number | ''>>;

const SEPARADORES: ReadonlyArray<{ valor: string; rotulo: string }> = [
  { valor: ';', rotulo: '; ponto e vírgula' },
  { valor: '\t', rotulo: 'TAB' },
  { valor: '|', rotulo: '| barra vertical' },
  { valor: ',', rotulo: ', vírgula' },
];

/**
 * Assistente de layout — a mesma ideia do "Importar dados TXT" do Excel:
 *   1. o usuário escolhe um arquivo de exemplo da fábrica;
 *   2. o sistema adivinha o separador, a linha inicial e se a 1ª linha é
 *      cabeçalho, e sugere o de-para campo × coluna;
 *   3. o usuário confere/ajusta tudo vendo a prévia e os contadores;
 *   4. salva — a importação passa a ler os arquivos dessa fábrica assim.
 *
 * Leitura em UTF-8 (decisão do projeto); quando o arquivo vem em ANSI/ISO o
 * assistente avisa porque os acentos aparecem corrompidos.
 */
export default function ConfigLayoutFabrica({ fabrica, onFechar, onSalvo }: Props) {
  const [conteudo, setConteudo] = useState('');
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [delimitador, setDelimitador] = useState(';');
  const [linhaInicial, setLinhaInicial] = useState(1);
  const [temCabecalho, setTemCabecalho] = useState(false);
  const [campos, setCampos] = useState<MapaTela>({});
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
        setDelimitador(salvo.delimitador || ';');
        setLinhaInicial(Number(salvo.linha_inicial) || 1);
        setTemCabecalho(!!salvo.tem_cabecalho);
        setCampos((salvo.campos ?? {}) as MapaTela);
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

  /* ------------------------------------------------------------- prévia --- */

  const previa = useMemo(
    () => (conteudo ? preverColunas(conteudo, { delimitador, linhaInicial, temCabecalho }) : null),
    [conteudo, delimitador, linhaInicial, temCabecalho],
  );

  const totalColunas = previa ? previa.linhas.reduce((maior, l) => Math.max(maior, l.length), 0) : 0;
  const primeiraLinha = previa?.linhas[0] ?? [];
  const linhaDados = previa ? (temCabecalho ? (previa.linhas[1] ?? []) : (previa.linhas[0] ?? [])) : [];

  const camposNumericos = useMemo(() => {
    const mapa: Partial<Record<Campo, number>> = {};
    for (const { campo } of CAMPOS_MAPEAIVEIS) {
      const valor = campos[campo];
      if (valor !== undefined && valor !== '') mapa[campo] = Number(valor);
    }
    return mapa;
  }, [campos]);

  const etiquetaMapeada = camposNumericos.etiqueta !== undefined;

  /** Roda a leitura de verdade com o que está na tela — é o teste antes de salvar. */
  const resultado = useMemo(() => {
    if (!conteudo) return null;
    return analisarArquivo(conteudo, {
      idlayout: fabrica.controle,
      nomeArquivo: nomeArquivo || 'exemplo.txt',
      fabrica: fabrica.nome,
      layout: { delimitador, linhaInicial, temCabecalho, campos: camposNumericos },
    });
  }, [conteudo, delimitador, linhaInicial, temCabecalho, camposNumericos, fabrica, nomeArquivo]);

  /** Quais campos estão ligados a cada coluna (para marcar o cabeçalho da prévia). */
  const porColuna = useMemo(() => {
    const mapa = new Map<number, string[]>();
    for (const { campo, titulo } of CAMPOS_MAPEAIVEIS) {
      const valor = campos[campo];
      if (valor === undefined || valor === '') continue;
      const lista = mapa.get(Number(valor)) ?? [];
      lista.push(titulo);
      mapa.set(Number(valor), lista);
    }
    return mapa;
  }, [campos]);

  /* ------------------------------------------------------------ ações ----- */

  async function lerArquivo(arquivo: File) {
    setErro('');
    setMensagem('');
    if (arquivo.size > 10 * 1024 * 1024) {
      setErro('Use um arquivo de exemplo menor (até 10 MB) — só as primeiras linhas são lidas.');
      return;
    }
    try {
      const texto = await arquivo.text();
      setConteudo(texto);
      setNomeArquivo(arquivo.name);

      /* primeira leitura: adivinha separador, onde os dados começam, se há
         cabeçalho e o de-para das colunas — depois o usuário confere/ajusta */
      const palpite = preverColunas(texto);
      setDelimitador(palpite.separador);
      setLinhaInicial(palpite.linhaSugerida);
      setTemCabecalho(palpite.cabecalhoSugerido);
      setCampos(palpite.camposSugeridos as MapaTela);
      setMensagem(
        palpite.linhaSugerida > 1
          ? `O assistente achou o cabeçalho na linha ${palpite.linhaSugerida} — confira a prévia.`
          : 'Arquivo lido: confira a prévia e o de-para das colunas.',
      );
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao ler o arquivo.');
    }
  }

  function sugerir() {
    if (!previa) return;
    setDelimitador(previa.separador);
    setLinhaInicial(previa.linhaSugerida);
    setTemCabecalho(previa.cabecalhoSugerido);
    setCampos(previa.camposSugeridos as MapaTela);
    setMensagem('Sugestão do assistente aplicada — confira a prévia e ajuste o que precisar.');
  }

  async function salvar() {
    setErro('');
    setMensagem('');
    if (!etiquetaMapeada) {
      setErro('Escolha qual coluna do arquivo tem a ETIQUETA (código de barras).');
      return;
    }
    setSalvando(true);
    try {
      await salvarLayoutFabrica(fabrica.controle, {
        delimitador,
        linha_inicial: linhaInicial,
        tem_cabecalho: temCabecalho,
        campos: camposNumericos,
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

  /* -------------------------------------------------------------- tela ---- */

  const classeSelect = 'rounded border border-slate-300 px-2 py-1 text-xs';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="flex h-[92vh] w-full max-w-[1150px] flex-col rounded-lg border border-slate-300 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
          <h2 className="text-sm font-semibold text-slate-700">
            Layout do arquivo — {fabrica.nome}
            {temLayoutSalvo && <span className="ml-2 text-[11px] text-emerald-700">(já configurado)</span>}
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
              Use um arquivo real (pode ser pequeno, de um dia de pedidos). O sistema lê as primeiras
              linhas para você montar o de-para das colunas. Codificação esperada: UTF-8.
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
              {previa && (
                <span className="text-[11px] text-slate-500">
                  {previa.totalLinhas} linha(s) lida(s) · {totalColunas} coluna(s)
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
            <div className="flex flex-wrap items-end gap-4">
              <label className="text-[11px] text-slate-600">
                <span className="block">Separador das colunas</span>
                <select
                  value={delimitador}
                  onChange={(e) => setDelimitador(e.target.value)}
                  className={classeSelect}
                >
                  {SEPARADORES.map((s) => (
                    <option key={s.rotulo} value={s.valor}>
                      {s.rotulo}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-[11px] text-slate-600">
                <span className="block">Começar na linha</span>
                <input
                  type="number"
                  min={1}
                  value={linhaInicial}
                  onChange={(e) => setLinhaInicial(Math.max(1, Number(e.target.value) || 1))}
                  className={`${classeSelect} w-20`}
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
                disabled={!previa}
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
              3. Prévia — confira se as colunas estão separadas corretamente
            </p>
            {!previa ? (
              <p className="text-[11px] text-slate-500">
                Escolha um arquivo no passo 1 para ver a prévia.
              </p>
            ) : (
              <div className="max-h-56 overflow-auto rounded border border-slate-300">
                <table className="min-w-full text-[11px]">
                  <thead className="bg-slate-100 text-left text-slate-600">
                    <tr>
                      {Array.from({ length: totalColunas }, (_, i) => (
                        <th key={i} className="whitespace-nowrap border-r border-slate-200 px-2 py-1">
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
                          temCabecalho && r === 0 ? 'bg-sky-50 text-sky-800' : 'border-t border-slate-200'
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
            )}
            {previa && primeiraLinha.length > 0 && (
              <p className="mt-1 text-[11px] text-slate-500">
                {temCabecalho
                  ? 'A primeira linha é tratada como cabeçalho e não vira pedido.'
                  : 'Todas as linhas úteis viram pedido.'}
              </p>
            )}
          </section>

          {/* 4. de-para ------------------------------------------------------- */}
          <section className="rounded border border-slate-200 p-3">
            <p className="mb-2 text-xs font-semibold text-slate-700">
              4. O que é cada coluna (de-para)
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-2">
              {CAMPOS_MAPEAIVEIS.map(({ campo, titulo, obrigatorio }) => (
                <label key={campo} className="flex items-center gap-2 text-[11px] text-slate-600">
                  <span className="w-52 shrink-0">
                    {titulo}
                    {obrigatorio && <span className="text-red-600"> *</span>}
                  </span>
                  <select
                    value={campos[campo] ?? ''}
                    onChange={(e) =>
                      setCampos((atual) => ({
                        ...atual,
                        [campo]: e.target.value === '' ? '' : Number(e.target.value),
                      }))
                    }
                    className={`${classeSelect} w-full`}
                  >
                    <option value="">— não usar —</option>
                    {Array.from({ length: totalColunas }, (_, i) => {
                      const amostra = linhaDados[i] ?? primeiraLinha[i] ?? '';
                      return (
                        <option key={i} value={i}>
                          Col {i + 1}
                          {amostra ? ` — ${amostra.slice(0, 22)}` : ''}
                        </option>
                      );
                    })}
                  </select>
                </label>
              ))}
            </div>
            {!etiquetaMapeada && (
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
                    são descartadas (sem etiqueta nem produto)
                  </>
                )}
                . Origem do mapeamento:{' '}
                {resultado.origem === 'layout' ? 'layout desta tela' : resultado.origem}.
              </p>
              {resultado.linhas.length === 0 && (
                <p className="mt-1 text-[11px] text-red-700">
                  Nenhum pedido reconhecido — revise o separador, a linha inicial e o de-para acima.
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
              disabled={salvando || !etiquetaMapeada}
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
