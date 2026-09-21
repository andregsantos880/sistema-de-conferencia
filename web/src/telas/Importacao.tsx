import { useEffect, useMemo, useRef, useState } from 'react';
import {
  lerLayoutFabrica,
  inserirPedidos,
  registrarImportacao,
  migracaoPendente,
  AVISO_IMPORTACOES,
  type Empresa,
  type Fabrica,
  type LayoutSalvo,
  type PedidoNovo,
} from '../lib/api';
import { analisarArquivo, comoLayoutFabrica, PARSERS, rotuloSeparador } from '../lib/parsers';
import { arquivoParaBase64, lerTextoDoArquivo } from '../lib/arquivo';
import { somErro, somOk } from '../lib/audio';
import { ComboboxMultiplo } from '../lib/multiselecao';

/**
 * Grupo do arquivo: a ORD.COMPRA inteira (é o que a importação trata como
 * “loja”). `texto` acumula o que o filtro procura e vira `busca` sem acento.
 */
type GrupoDoArquivo = {
  ordcompra: string;
  quantidade: number;
  cliente: string;
  loja: string;
  busca: string;
  texto: string;
};

/** Compara textos sem acento e sem diferenciar maiúsculas (filtro da lista). */
function semAcento(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

type Props = {
  empresa: Empresa;
  fabricas: Fabrica[];
  fabricaId: number | null;
  onTrocarFabrica: (id: number) => void;
  onConcluir: () => void;
  onVoltar: () => void;
};

/**
 * Erros do banco traduzidos para o operador. O caso real: a descrição de uma
 * peça maior que a coluna reservada (a Romanzza manda 86 caracteres e a coluna
 * tem 80) derruba a importação inteira com um texto técnico em inglês.
 */
function mensagemDeImportacao(falha: unknown): string {
  const texto = falha instanceof Error ? falha.message : String(falha);
  const campoLongo = /too long for type character varying\((\d+)\)/.exec(texto);
  if (campoLongo) {
    return (
      `Um texto do arquivo é maior do que o espaço reservado no banco ` +
      `(${campoLongo[1]} caracteres) — a peça mais longa deste arquivo não cabe. ` +
      'Nada foi importado. Avise o suporte para ampliar a coluna de descrição.'
    );
  }
  return texto || 'Falha ao importar.';
}

/**
 * Recriação da tela TabeLayo (importação de arquivos):
 * combo de fábrica, botão "Arquivo...", barra de progresso, lista de lojas
 * com checkbox e o botão "Incluir lojas selecionadas.".
 * Os pedidos importados ficam vinculados à empresa logada.
 */
export default function Importacao({ empresa, fabricas, fabricaId, onTrocarFabrica, onConcluir, onVoltar }: Props) {
  const [linhas, setLinhas] = useState<PedidoNovo[]>([]);
  const [nomeArquivo, setNomeArquivo] = useState('');
  /** O File escolhido: guardado para registrar a importação (com o original) e baixar depois. */
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [descartadas, setDescartadas] = useState(0);
  const [gruposMarcados, setGruposMarcados] = useState<Set<string>>(new Set());
  const [progresso, setProgresso] = useState(0);
  /** Filtro da lista de pedidos do arquivo: lojas (cliente) e busca livre. */
  const [lojasFiltradas, setLojasFiltradas] = useState<string[]>([]);
  const [filtroPedido, setFiltroPedido] = useState('');
  const [etapa, setEtapa] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  /** Layout que o administrador configurou para a fábrica (tela Fábricas). */
  const [layout, setLayout] = useState<LayoutSalvo | null>(null);
  const [layoutEmUso, setLayoutEmUso] = useState<{
    origem: string;
    separador: string;
    tipo: string;
    codificacao?: string;
  } | null>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);

  /* Ao trocar de fábrica, busca o layout dela. Sem migração 00104 (ou sem layout
     configurado) segue o caminho antigo: detecção automática + PARSERS. */
  useEffect(() => {
    let cancelado = false;
    setLayout(null);
    setLayoutEmUso(null);

    if (fabricaId === null) return;

    lerLayoutFabrica(fabricaId)
      .then((salvo) => {
        if (!cancelado) setLayout(salvo);
      })
      .catch(() => {
        if (!cancelado) setLayout(null);
      });

    return () => {
      cancelado = true;
    };
  }, [fabricaId]);

  const fabrica = fabricas.find((f) => f.controle === fabricaId) ?? null;
  /* Fábricas COM INTEGRAÇÃO ficam fixadas no topo do combo (ver lib/integracao.ts). */
  const fabricasIntegradas = fabricas.filter((f) => f.integrada);
  const fabricasSemIntegracao = fabricas.filter((f) => !f.integrada);

  /**
   * Grupos do arquivo: a ORD.COMPRA inteira é o agrupamento (não o CLIENTE, que
   * na maioria dos arquivos vem "NÃO INFORMADO"). Cada grupo guarda a LOJA (o
   * cliente) e um texto normalizado que alimenta o filtro da lista.
   */
  const grupos = useMemo<GrupoDoArquivo[]>(() => {
    const mapa = new Map<string, GrupoDoArquivo>();
    linhas.forEach((linha) => {
      const ordcompra = String(linha.ordcompra ?? '');
      const cliente = String(linha.cliente ?? '').trim();
      const produto = String(linha.produto ?? '');
      const descricao = String(linha.descricao1 ?? '');
      const atual = mapa.get(ordcompra);

      if (atual) {
        atual.quantidade += 1;
        if (!atual.cliente) atual.cliente = cliente;
        atual.texto += ` ${produto} ${descricao}`;
      } else {
        mapa.set(ordcompra, {
          ordcompra,
          quantidade: 1,
          cliente,
          loja: '',
          busca: '',
          texto: `${String(linha.pecliente ?? '')} ${produto} ${descricao}`,
        });
      }
    });

    return [...mapa.values()]
      .map((grupo) => {
        /* “NÃO INFORMADO” é o que os arquivos mandam quando a loja não vem */
        const informado = grupo.cliente && grupo.cliente.toUpperCase() !== 'NÃO INFORMADO';
        const loja = informado ? grupo.cliente : '(sem loja)';
        return {
          ...grupo,
          loja,
          busca: semAcento(`${grupo.ordcompra} ${loja} ${grupo.texto}`),
        };
      })
      .sort((a, b) => a.ordcompra.localeCompare(b.ordcompra, 'pt-BR'));
  }, [linhas]);

  /** Lojas encontradas no arquivo, com quantos pedidos cada uma tem. */
  const lojasDoArquivo = useMemo(() => {
    const contagem = new Map<string, number>();
    grupos.forEach((grupo) => contagem.set(grupo.loja, (contagem.get(grupo.loja) ?? 0) + 1));
    return [...contagem.entries()]
      .map(([loja, pedidos]) => ({ valor: loja, rotulo: loja, contagem: pedidos }))
      .sort((a, b) => a.rotulo.localeCompare(b.rotulo, 'pt-BR'));
  }, [grupos]);

  /**
   * Pedidos que a lista mostra. Filtrar NÃO mexe no que está marcado: o que
   * ficar escondido continua com a marcação anterior.
   */
  const gruposExibidos = useMemo(() => {
    const alvo = semAcento(filtroPedido.trim());
    return grupos.filter((grupo) => {
      if (lojasFiltradas.length > 0 && !lojasFiltradas.includes(grupo.loja)) return false;
      return !alvo || grupo.busca.includes(alvo);
    });
  }, [grupos, lojasFiltradas, filtroPedido]);

  /** Pedidos exibidos que estão marcados para importar. */
  const marcadosNaLista = gruposExibidos.filter((grupo) => gruposMarcados.has(grupo.ordcompra)).length;

  const selecionadas = linhas.filter((l) => gruposMarcados.has(String(l.ordcompra ?? ''))).length;

  /** Marca (ou desmarca) de uma vez os pedidos que estão na lista filtrada. */
  function marcarExibidos(marcar: boolean) {
    setGruposMarcados((atual) => {
      const novo = new Set(atual);
      gruposExibidos.forEach((grupo) => {
        if (marcar) novo.add(grupo.ordcompra);
        else novo.delete(grupo.ordcompra);
      });
      return novo;
    });
  }

  async function lerArquivo(arquivo: File) {
    setErro('');
    setAviso('');
    setProgresso(0);

    if (fabricaId === null) {
      setErro('Selecione a fábrica antes de escolher o arquivo.');
      somErro();
      return;
    }

    try {
      const { texto: conteudo, codificacao } = await lerTextoDoArquivo(arquivo);
      const resultado = analisarArquivo(conteudo, {
        idlayout: fabricaId,
        nomeArquivo: arquivo.name,
        fabrica: fabrica?.nome ?? '',
        layout: comoLayoutFabrica(layout),
      });

      if (resultado.linhas.length === 0) {
        setErro('Nenhuma linha válida encontrada no arquivo.');
        somErro();
        return;
      }

      setLinhas(resultado.linhas);
      setNomeArquivo(arquivo.name);
      setArquivo(arquivo);
      setDescartadas(resultado.descartadas);
      setGruposMarcados(new Set(resultado.linhas.map((l) => String(l.ordcompra ?? ''))));
      /* arquivo novo, filtro velho: limpa para não esconder pedido sem querer */
      setLojasFiltradas([]);
      setFiltroPedido('');
      setLayoutEmUso({
        origem: resultado.origem,
        separador: resultado.separador,
        tipo: resultado.tipo,
        codificacao,
      });

      if (resultado.origem === 'generico' && !PARSERS[fabrica?.nome ?? '']) {
        setAviso(
          `Sem layout configurado para "${fabrica?.nome}" — o arquivo foi lido no modo genérico ` +
            `(separador "${rotuloSeparador(resultado.separador)}", ` +
            `${resultado.cabecalhoDetectado ? 'colunas pelo cabeçalho' : 'colunas por posição'}). ` +
            'Confira a prévia antes de importar. O administrador pode definir o layout em Fábricas.',
        );
      }
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao ler o arquivo.');
      somErro();
    }
  }

  async function importar() {
    if (fabricaId === null || linhas.length === 0) return;

    const paraImportar = linhas.filter((l) => gruposMarcados.has(String(l.ordcompra ?? '')));
    if (paraImportar.length === 0) {
      setErro('Marque pelo menos um pedido (ORD.COMPRA) para importar.');
      somErro();
      return;
    }

    setErro('');
    setEtapa('Importando dados...');

    try {
      const total = paraImportar.length;
      let enviados = 0;

      /* Registra a importação ANTES de gravar os pedidos: o id volta e cada
         bloco de pedidos nasce vinculado a ele (é o que permite excluir a
         importação depois, apagando os pedidos dela). Se a migração do banco
         ainda não foi aplicada, importa do jeito antigo, sem o vínculo. */
      let importacaoId: number | null = null;
      try {
        const original = arquivo ? await arquivoParaBase64(arquivo) : null;
        importacaoId = await registrarImportacao({
          controle: fabricaId,
          nomeArquivo: nomeArquivo || 'arquivo',
          tamanho: arquivo?.size ?? 0,
          codificacao: layoutEmUso?.codificacao ?? 'UTF-8',
          linhasLidas: linhas.length,
          linhasImportadas: total,
          linhasDescartadas: descartadas,
          conteudoBase64: original,
        });
      } catch (falha) {
        importacaoId = null;
        setAviso(
          migracaoPendente(falha)
            ? AVISO_IMPORTACOES
            : 'Não foi possível registrar a importação — os pedidos serão gravados sem o vínculo ' +
              'com o arquivo: ' +
              (falha instanceof Error ? falha.message : String(falha)),
        );
      }

      // envia em blocos para a barra de progresso andar de verdade
      for (let i = 0; i < total; i += 500) {
        const bloco = paraImportar.slice(i, i + 500);
        await inserirPedidos(fabricaId, bloco, importacaoId);
        enviados += bloco.length;
        setProgresso(Math.round((enviados / total) * 100));
      }

      somOk();
      setEtapa(`${enviados} linha(s) importada(s) com sucesso.`);
      setLinhas([]);
      setNomeArquivo('');
      setArquivo(null);
      setDescartadas(0);
      setGruposMarcados(new Set());
      if (arquivoRef.current) arquivoRef.current.value = '';
      onConcluir();
    } catch (falha) {
      somErro();
      setEtapa('');
      setErro(mensagemDeImportacao(falha));
    }
  }

  return (
    <div className="flex min-h-full items-start justify-center bg-slate-200 p-6">
      <div className="w-full max-w-[560px] rounded-lg border border-slate-300 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
          <h2 className="text-sm font-semibold">
            Importação de Arquivos
            <span className="ml-2 rounded bg-emerald-700 px-2 py-0.5 text-[11px] font-semibold text-white">
              {empresa.nome}
            </span>
          </h2>
          <button onClick={onVoltar} className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100">
            Voltar
          </button>
        </div>

        <div className="space-y-4 p-4 text-xs">
          <div>
            <label className="mb-1 block text-slate-700" htmlFor="fabrica">
              Fábrica
            </label>
            <div className="flex gap-2">
              <select
                id="fabrica"
                value={fabricaId ?? ''}
                onChange={(e) => onTrocarFabrica(Number(e.target.value))}
                className="w-full rounded border border-slate-300 px-2 py-1.5"
              >
                {fabricasIntegradas.length > 0 && (
                  <optgroup label="★ Com integração instalada">
                    {fabricasIntegradas.map((f) => (
                      <option key={f.controle} value={f.controle}>
                        ★ {f.nome}
                      </option>
                    ))}
                  </optgroup>
                )}
                {fabricasSemIntegracao.length > 0 && (
                  <optgroup label="Demais fábricas (sem integração)">
                    {fabricasSemIntegracao.map((f) => (
                      <option key={f.controle} value={f.controle}>
                        {f.nome} (controle {f.controle})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <button
                onClick={() => arquivoRef.current?.click()}
                className="shrink-0 rounded border border-slate-400 bg-slate-100 px-3 py-1.5 font-semibold hover:bg-slate-200"
              >
                Arquivo...
              </button>
              <input
                ref={arquivoRef}
                type="file"
                accept=".txt,.csv,.dat,text/plain"
                className="hidden"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];
                  if (arquivo) void lerArquivo(arquivo);
                }}
              />
            </div>
            {fabrica && !fabrica.integrada && !layout && (
              <p className="mt-1 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
                “{fabrica.nome}” não tem integração instalada — o arquivo será lido no modo genérico
                (detecção de separador e colunas).
              </p>
            )}
            {fabrica && layout && (
              <p className="mt-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-800">
                Layout configurado desta fábrica:{' '}
                {layout.tipo === 'posicional'
                  ? `largura fixa (${Object.keys(layout.campos ?? {}).length} campo(s)` +
                    `${(layout.derivados && Object.keys(layout.derivados).length > 0) ? ` + ${Object.keys(layout.derivados).length} por regra` : ''})`
                  : `${Object.keys(layout.campos ?? {}).length} coluna(s) mapeada(s), separador “${rotuloSeparador(layout.delimitador)}”`}
                , começando na linha {layout.linha_inicial}
                {layout.tem_cabecalho ? ' (com cabeçalho)' : ''}.
              </p>
            )}
            {layoutEmUso && (
              <p className="mt-1 text-[11px] text-slate-500">
                Arquivo lido com{' '}
                {layoutEmUso.origem === 'layout'
                  ? 'o layout configurado da fábrica'
                  : layoutEmUso.origem === 'cabecalho'
                    ? 'as colunas identificadas pelo cabeçalho'
                    : 'o modo genérico'}{' '}
                {layoutEmUso.tipo === 'posicional'
                  ? '(largura fixa)'
                  : `(separador “${rotuloSeparador(layoutEmUso.separador)}”)`}
                {layoutEmUso.codificacao && layoutEmUso.codificacao !== 'UTF-8'
                  ? `, arquivo em ${layoutEmUso.codificacao}`
                  : ''}
                .
              </p>
            )}
            {nomeArquivo && <p className="mt-1 text-slate-500">Arquivo: {nomeArquivo}</p>}
          </div>

          <div>
            <div className="mb-1 flex justify-between text-slate-600">
              <span>{etapa || 'Nenhuma importação em andamento'}</span>
              <span>{progresso}%</span>
            </div>
            <div className="h-5 w-full overflow-hidden rounded border border-slate-300 bg-slate-100">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>

          <div>
            <p className="mb-1 text-slate-700">
              Selecionar os pedidos (ORD.COMPRA) que devem entrar:
            </p>

            {/* Filtro de lojas: o arquivo da fábrica pode trazer centenas de
                pedidos e a equipe costuma importar uma loja por vez. */}
            {grupos.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-2 rounded border border-slate-300 bg-slate-50 px-2 py-1.5">
                <ComboboxMultiplo
                  rotulo="Lojas"
                  titulo="Mostrar só os pedidos destas lojas"
                  placeholder="todas"
                  largura="w-64"
                  selecionados={lojasFiltradas}
                  aoMudar={setLojasFiltradas}
                  opcoes={lojasDoArquivo}
                />

                <input
                  value={filtroPedido}
                  onChange={(e) => setFiltroPedido(e.target.value)}
                  placeholder="Filtrar por ORD.COMPRA, peça ou produto..."
                  className="min-w-[190px] flex-1 rounded border border-slate-300 px-2 py-1 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                />

                <button
                  onClick={() => marcarExibidos(true)}
                  disabled={gruposExibidos.length === 0}
                  title="Marcar todos os pedidos que estão na lista agora"
                  className="rounded border border-slate-400 bg-white px-2 py-1 hover:bg-slate-100 disabled:opacity-50"
                >
                  Marcar exibidos
                </button>
                <button
                  onClick={() => marcarExibidos(false)}
                  disabled={gruposExibidos.length === 0}
                  title="Desmarcar todos os pedidos que estão na lista agora"
                  className="rounded border border-slate-400 bg-white px-2 py-1 hover:bg-slate-100 disabled:opacity-50"
                >
                  Desmarcar exibidos
                </button>

                {(lojasFiltradas.length > 0 || filtroPedido.trim() !== '') && (
                  <button
                    onClick={() => {
                      setLojasFiltradas([]);
                      setFiltroPedido('');
                    }}
                    className="rounded border border-blue-500 bg-blue-50 px-2 py-1 font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    Limpar filtro
                  </button>
                )}
              </div>
            )}

            {grupos.length > 0 && (
              <p className="mb-1 text-[11px] text-slate-500">
                Mostrando {gruposExibidos.length} de {grupos.length} pedido(s) · {marcadosNaLista}{' '}
                marcado(s) na lista
              </p>
            )}

            <div className="max-h-72 overflow-auto rounded border border-slate-300 p-2">
              {grupos.length === 0 && (
                <p className="text-slate-500">Escolha um arquivo para listar os pedidos encontrados.</p>
              )}
              {grupos.length > 0 && gruposExibidos.length === 0 && (
                <p className="text-slate-500">
                  Nenhum pedido com esse filtro — ajuste as lojas ou a busca.
                </p>
              )}
              {gruposExibidos.map((grupo) => (
                <div
                  key={grupo.ordcompra}
                  className="flex flex-wrap items-center gap-2 border-b border-slate-100 py-1 last:border-b-0"
                >
                  <label className="flex min-w-[190px] flex-1 items-center gap-2">
                    <input
                      type="checkbox"
                      checked={gruposMarcados.has(grupo.ordcompra)}
                      onChange={(e) => {
                        setGruposMarcados((atual) => {
                          const novo = new Set(atual);
                          if (e.target.checked) novo.add(grupo.ordcompra);
                          else novo.delete(grupo.ordcompra);
                          return novo;
                        });
                      }}
                    />
                    <span className="font-medium">{grupo.ordcompra || '(sem ORD.COMPRA)'}</span>
                    <span className="text-slate-500">
                      {grupo.quantidade} item(ns)
                      {grupo.loja !== '(sem loja)' ? ` · ${grupo.loja}` : ''}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* O local das peças NÃO é definido na importação: a importação só
              coloca os pedidos na base. O local é definido depois, peça a peça
              ou em massa, na tela "Locais das peças". */}
          {grupos.length > 0 && (
            <div className="rounded border border-sky-200 bg-sky-50 px-3 py-2 text-[11px] text-sky-900">
              O local das peças (box, prateleira, piso) é definido depois da importação, em
              “Locais das peças” — inclusive em massa, por ORD.COMPRA.
            </div>
          )}

          {aviso && (
            <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800">{aviso}</div>
          )}
          {erro && <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">{erro}</div>}

          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-slate-500">
              {linhas.length} linha(s) lida(s) · {selecionadas} selecionada(s)
            </span>
            <button
              onClick={() => void importar()}              disabled={linhas.length === 0}
              className="rounded bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Incluir lojas selecionadas.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
