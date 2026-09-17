/**
 * Leitura dos arquivos de layout no navegador.
 *
 * O legado tem 30 parsers fixos em Negocio/boPedido.cs (um por fornecedor, com
 * layouts delimitados e posicionais). Aqui a leitura é orientada a configuração:
 *   - o separador é detectado (`;`, `|`, tab, `,`);
 *   - se o arquivo tiver cabeçalho com nomes conhecidos, o mapeamento é feito
 *     por NOME de coluna;
 *   - caso contrário usa-se o mapa de índices da fábrica (PARSERS).
 *
 * TODO (pendente): portar os 30 parsers do legado para PARSERS.
 */
import type { LayoutSalvo, PedidoNovo } from './api';

export type Campo =
  | 'ordcompra'
  | 'cliente'
  | 'pecliente'
  | 'produto'
  | 'descricao1'
  | 'qtde'
  | 'etiqueta'
  | 'volume'
  | 'sequencia';

export type MapaLayout = {
  separador?: string;
  campos?: Partial<Record<Campo, number>>;
};

/**
 * Layout salvo no banco para uma fábrica (tela Fábricas), como o usuário
 * configurou importando um arquivo de exemplo. Quando existe, ele manda na
 * leitura — a deteção automática e o PARSERS passam a ser só reserva.
 */
export type LayoutFabrica = {
  delimitador: string;
  linhaInicial: number;
  temCabecalho: boolean;
  campos: Partial<Record<Campo, number>>;
};

/** Campos que podem ser ligados a uma coluna do arquivo, na ordem da tela. */
export const CAMPOS_MAPEAIVEIS: ReadonlyArray<{ campo: Campo; titulo: string; obrigatorio: boolean }> = [
  { campo: 'etiqueta', titulo: 'Etiqueta (código de barras)', obrigatorio: true },
  { campo: 'produto', titulo: 'Produto (código)', obrigatorio: false },
  { campo: 'descricao1', titulo: 'Descrição do produto', obrigatorio: false },
  { campo: 'qtde', titulo: 'Quantidade', obrigatorio: false },
  { campo: 'ordcompra', titulo: 'Ordem de compra', obrigatorio: false },
  { campo: 'pecliente', titulo: 'Pedido do cliente', obrigatorio: false },
  { campo: 'cliente', titulo: 'Cliente / loja', obrigatorio: false },
  { campo: 'volume', titulo: 'Volume', obrigatorio: false },
  { campo: 'sequencia', titulo: 'Sequência', obrigatorio: false },
];

/** Converte o layout gravado no banco (snake_case) para o formato da leitura. */
export function comoLayoutFabrica(salvo: LayoutSalvo | null): LayoutFabrica | null {
  if (!salvo) return null;
  return {
    delimitador: salvo.delimitador,
    linhaInicial: Number(salvo.linha_inicial) || 1,
    temCabecalho: !!salvo.tem_cabecalho,
    campos: (salvo.campos ?? {}) as Partial<Record<Campo, number>>,
  };
}

/** Mapeamentos já configurados (chave = nome da fábrica como veio do LAYOUT). */
export const PARSERS: Record<string, MapaLayout> = {
  'CSV Padrão': {
    campos: {
      ordcompra: 0,
      cliente: 1,
      pecliente: 2,
      produto: 3,
      descricao1: 4,
      qtde: 5,
      etiqueta: 6,
      volume: 7,
    },
  },
};

/** Sinônimos aceitos no cabeçalho do arquivo. */
const CABECALHOS: Record<Campo, string[]> = {
  ordcompra: ['ORDCOMPRA', 'ORD.COMPRA', 'ORDEM', 'OC', 'PEDIDO_COMPRA'],
  cliente: ['CLIENTE', 'NOME_CLIENTE', 'DESTINATARIO'],
  pecliente: ['PECLIENTE', 'PE_CLIENTE', 'PEDIDO', 'PEDIDOCLIENTE'],
  produto: ['PRODUTO', 'CODIGO', 'COD', 'SKU'],
  descricao1: ['DESCRICAO', 'DESCRICAO1', 'DESCRIÇÃO', 'PRODUTO_DESCRICAO'],
  qtde: ['QTDE', 'QUANTIDADE', 'QTD'],
  etiqueta: ['ETIQUETA', 'BARCODE', 'CODIGO_BARRAS', 'SEQ_ETIQUETA'],
  volume: ['VOLUME', 'VOL', 'CAIXA'],
  sequencia: ['SEQUENCIA', 'SEQ', 'ORDEM'],
};

function normalizar(valor: string): string {
  return valor
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9_]/g, '');
}

/** Separa o conteúdo em linhas úteis (ignora linhas em branco). */
function linhasUteis(conteudo: string): string[] {
  return conteudo
    .split(/\r?\n/)
    .map((linha) => linha.trimEnd())
    .filter((linha) => linha.trim().length > 0);
}

/**
 * Prévia para a tela de configuração (mesma ideia do "Importar dados TXT" do
 * Excel): devolve as primeiras linhas já separadas em colunas, além do que foi
 * detectado — separador, se a primeira linha parece cabeçalho e se o texto
 * aparenta NÃO estar em UTF-8 (acento corrompido).
 */
export function preverColunas(
  conteudo: string,
  config: { delimitador?: string; linhaInicial?: number; temCabecalho?: boolean } = {},
  maxLinhas = 8,
): {
  linhas: string[][];
  totalLinhas: number;
  separador: string;
  cabecalhoSugerido: boolean;
  camposSugeridos: Partial<Record<Campo, number>>;
  suspeitaCodificacao: boolean;
} {
  const todas = linhasUteis(conteudo);
  const inicio = Math.max(0, (config.linhaInicial ?? 1) - 1);
  const uteis = todas.slice(inicio);
  /* o separador sai da primeira linha DEPOIS do deslocamento: arquivos de ERP
     costumam ter linha(s) de titulo antes dos dados. */
  const separador = config.delimitador ?? detectarSeparador(uteis[0] ?? '');

  const mapaCabecalho = mapearPorCabecalho(uteis[0] ?? '', separador);
  const cabecalhoSugerido =
    config.temCabecalho ?? Object.keys(mapaCabecalho).length >= 3;

  return {
    linhas: uteis.slice(0, maxLinhas).map((linha) => linha.split(separador)),
    totalLinhas: uteis.length,
    separador,
    cabecalhoSugerido,
    camposSugeridos: mapaCabecalho,
    /* U+FFFD aparece quando o arquivo não é UTF-8 (ex.: ANSI de ERP antigo) */
    suspeitaCodificacao: conteudo.includes('\uFFFD'),
  };
}

/** Rótulo curto do separador, para mostrar na tela. */
export function rotuloSeparador(separador: string): string {
  if (separador === '\t') return 'TAB';
  if (separador === ';') return 'ponto e vírgula (;)';
  if (separador === ',') return 'vírgula (,)';
  if (separador === '|') return 'barra vertical (|)';
  return separador;
}

/** Detecta o separador predominante na primeira linha. */
export function detectarSeparador(linha: string): string {
  const candidatos = [';', '|', '\t', ','];
  let melhor = ';';
  let maior = 0;

  for (const c of candidatos) {
    const total = linha.split(c).length - 1;
    if (total > maior) {
      maior = total;
      melhor = c;
    }
  }
  return melhor;
}

/** Converte números em pt-BR ("1.234,56") ou en-US ("1234.56"). */
export function paraNumero(valor: string | undefined): number {
  if (!valor) return 0;
  const texto = valor.trim().replace(/\s/g, '');
  if (!texto) return 0;

  const temVirgula = texto.includes(',');
  const temPonto = texto.includes('.');
  let limpo = texto;

  if (temVirgula && temPonto) {
    // assume pt-BR: ponto é separador de milhar, vírgula é decimal
    limpo = texto.replace(/\./g, '').replace(',', '.');
  } else if (temVirgula) {
    limpo = texto.replace(',', '.');
  }

  const numero = Number(limpo);
  return Number.isFinite(numero) ? numero : 0;
}

function mapearPorCabecalho(linhaCabecalho: string, separador: string): Partial<Record<Campo, number>> {
  const mapa: Partial<Record<Campo, number>> = {};
  const colunas: string[] = linhaCabecalho.split(separador).map(normalizar);

  (Object.keys(CABECALHOS) as Campo[]).forEach((campo) => {
    const indice = colunas.findIndex((coluna) => CABECALHOS[campo].some((sinonimo) => normalizar(sinonimo) === coluna));
    if (indice >= 0) mapa[campo] = indice;
  });

  return mapa;
}

export type ResultadoAnalise = {
  linhas: PedidoNovo[];
  descartadas: number;
  separador: string;
  mapa: Partial<Record<Campo, number>>;
  cabecalhoDetectado: boolean;
  /** De onde veio o mapeamento — a tela de importação mostra isso ao usuário. */
  origem: 'layout' | 'cabecalho' | 'generico';
};

/**
 * Lê o conteúdo do arquivo e devolve as linhas prontas para INSERT em PEDIDO,
 * aplicando as regras do legado: STATUS=0, IDBOX=1, DATAINC=agora e
 * CLIENTE vazio -> "NÃO INFORMADO".
 */
export function analisarArquivo(
  conteudo: string,
  opcoes: { idlayout: number; nomeArquivo: string; fabrica: string; layout?: LayoutFabrica | null },
): ResultadoAnalise {
  const linhasBrutas = conteudo
    .split(/\r?\n/)
    .map((linha) => linha.trimEnd())
    .filter((linha) => linha.trim().length > 0);

  if (linhasBrutas.length === 0) {
    return {
      linhas: [],
      descartadas: 0,
      separador: ';',
      mapa: {},
      cabecalhoDetectado: false,
      origem: 'generico',
    };
  }

  const layout = opcoes.layout ?? null;
  const inicio = Math.max(0, (layout?.linhaInicial ?? 1) - 1);
  const uteis = inicio > 0 ? linhasBrutas.slice(inicio) : linhasBrutas;

  let separador: string;
  let mapa: Partial<Record<Campo, number>>;
  let cabecalhoDetectado: boolean;
  let origem: ResultadoAnalise['origem'];

  if (layout && Object.keys(layout.campos ?? {}).length > 0) {
    /* layout configurado na tela Fábricas manda em tudo */
    separador = layout.delimitador;
    mapa = layout.campos;
    cabecalhoDetectado = layout.temCabecalho;
    origem = 'layout';
  } else {
    /* sem layout salvo: detecta pelo cabeçalho e, na falta dele, usa o mapa fixo */
    separador = layout?.delimitador ?? PARSERS[opcoes.fabrica]?.separador ?? detectarSeparador(uteis[0]);
    const mapaCabecalho = mapearPorCabecalho(uteis[0], separador);
    const achouCabecalho = Object.keys(mapaCabecalho).length >= 3;

    cabecalhoDetectado = layout?.temCabecalho ?? achouCabecalho;
    mapa = cabecalhoDetectado && achouCabecalho
      ? mapaCabecalho
      : (PARSERS[opcoes.fabrica]?.campos ?? PARSERS['CSV Padrão'].campos ?? {});
    origem = cabecalhoDetectado && achouCabecalho ? 'cabecalho' : 'generico';
  }

  const dados = cabecalhoDetectado ? uteis.slice(1) : uteis;
  const agora = new Date().toISOString();
  const linhas: PedidoNovo[] = [];
  let descartadas = 0;

  for (const bruta of dados) {
    const colunas = bruta.split(separador);
    const valor = (campo: Campo): string => {
      const indice = mapa[campo];
      return indice === undefined ? '' : (colunas[indice] ?? '').trim();
    };

    const etiqueta = valor('etiqueta');
    const produto = valor('produto');
    if (!etiqueta && !produto) {
      descartadas++;
      continue;
    }

    const cliente = valor('cliente') || 'NÃO INFORMADO';

    linhas.push({
      arquivo: opcoes.nomeArquivo,
      ordcompra: valor('ordcompra'),
      cliente,
      pecliente: valor('pecliente'),
      produto,
      descricao1: valor('descricao1'),
      qtde: paraNumero(valor('qtde')),
      etiqueta,
      volume: paraNumero(valor('volume')),
      sequencia: paraNumero(valor('sequencia')),
      status: 0,
      datainc: agora,
      idlayout: opcoes.idlayout,
      idbox: 1,
      flbloqueio: false,
      pecomputador: 'web',
    });
  }

  return { linhas, descartadas, separador, mapa, cabecalhoDetectado, origem };
}
