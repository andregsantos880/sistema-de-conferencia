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
import type { PedidoNovo } from './api';

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
};

/**
 * Lê o conteúdo do arquivo e devolve as linhas prontas para INSERT em PEDIDO,
 * aplicando as regras do legado: STATUS=0, IDBOX=1, DATAINC=agora e
 * CLIENTE vazio -> "NÃO INFORMADO".
 */
export function analisarArquivo(
  conteudo: string,
  opcoes: { idlayout: number; nomeArquivo: string; fabrica: string },
): ResultadoAnalise {
  const linhasBrutas = conteudo
    .split(/\r?\n/)
    .map((linha) => linha.trimEnd())
    .filter((linha) => linha.trim().length > 0);

  if (linhasBrutas.length === 0) {
    return { linhas: [], descartadas: 0, separador: ';', mapa: {}, cabecalhoDetectado: false };
  }

  const separador = PARSERS[opcoes.fabrica]?.separador ?? detectarSeparador(linhasBrutas[0]);
  const mapaCabecalho = mapearPorCabecalho(linhasBrutas[0], separador);
  const cabecalhoDetectado = Object.keys(mapaCabecalho).length >= 3;

  const mapa = cabecalhoDetectado
    ? mapaCabecalho
    : (PARSERS[opcoes.fabrica]?.campos ?? PARSERS['CSV Padrão'].campos ?? {});

  const dados = cabecalhoDetectado ? linhasBrutas.slice(1) : linhasBrutas;
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

  return { linhas, descartadas, separador, mapa, cabecalhoDetectado };
}
