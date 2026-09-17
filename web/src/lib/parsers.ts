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
  /** `delimitado` (CSV/TXT separado) ou `posicional` (largura fixa). */
  tipo: TipoLayout;
  delimitador: string;
  linhaInicial: number;
  temCabecalho: boolean;
  /** Posicional: ignora linhas menores que isto (ex.: Transpaese exige 70). */
  linhaMinima?: number;
  campos: Partial<Record<Campo, number | CampoPosicional>>;
  /** Valor usado quando o campo vier vazio (ex.: qtde 1, ordcompra "--"). */
  fixos?: Partial<Record<Campo, string | number>>;
  /** Campos montados a partir de outro (ex.: produto saído da etiqueta). */
  derivados?: Partial<Record<Campo, RegraDerivada>>;
};

export type TipoLayout = 'delimitado' | 'posicional';

/** Onde o campo começa e quantos caracteres ocupa no arquivo posicional. */
export type CampoPosicional = {
  pos: number;
  /** 0 = até o fim da linha. */
  len: number;
  /** Remove os zeros à esquerda (ex.: carga "0000001057455" -> "1057455"). */
  zeros?: boolean;
};

/**
 * Regra de campo derivado. Ex.: na Transpaese o produto não tem coluna própria,
 * ele sai de dentro da etiqueta (posições 5..13 quando ela começa com "00000",
 * senão os 14 primeiros dígitos sem os zeros à esquerda).
 */
export type RegraDerivada = {
  de: Campo;
  pos?: number;
  len?: number;
  /** Remove os zeros à esquerda do pedaço (ex.: código do produto na etiqueta). */
  zeros?: boolean;
  /** Se o campo de origem começar com isto, usa `pos`/`len`. */
  se_prefixo?: string;
  senao_pos?: number;
  senao_len?: number;
  senao_zeros?: boolean;
  /** Últimos N caracteres do campo de origem. */
  ultimos?: number;
  /** Se o resultado ficar vazio. */
  padrao?: string;
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
    tipo: salvo.tipo === 'posicional' ? 'posicional' : 'delimitado',
    delimitador: salvo.delimitador,
    linhaInicial: Number(salvo.linha_inicial) || 1,
    temCabecalho: !!salvo.tem_cabecalho,
    linhaMinima: Number(salvo.linha_minima) || 0,
    campos: (salvo.campos ?? {}) as Partial<Record<Campo, number | CampoPosicional>>,
    fixos: (salvo.fixos ?? {}) as Partial<Record<Campo, string | number>>,
    derivados: (salvo.derivados ?? {}) as Partial<Record<Campo, RegraDerivada>>,
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
 * detectado — separador, a linha onde os dados começam (arquivo de ERP costuma
 * ter título/emitente antes do cabeçalho) e se o texto aparenta NÃO estar em
 * UTF-8 (acento corrompido).
 */
export function preverColunas(
  conteudo: string,
  config: { delimitador?: string; linhaInicial?: number; temCabecalho?: boolean } = {},
  maxLinhas = 8,
): {
  linhas: string[][];
  totalLinhas: number;
  separador: string;
  /** Linha onde os dados começam, segundo o próprio arquivo (1 = primeira). */
  linhaSugerida: number;
  cabecalhoSugerido: boolean;
  camposSugeridos: Partial<Record<Campo, number>>;
  /**
   * Texto sem separador nenhum e com linhas longas: quase certamente largura
   * fixa (ex.: Transpaese). A tela já abre no modo posicional nesse caso.
   */
  posicionalSugerido: boolean;
  suspeitaCodificacao: boolean;
} {
  const todas = linhasUteis(conteudo);
  const separador = config.delimitador ?? detectarSeparador(todas);

  /* sem linha escolhida pelo usuário, procura o cabeçalho nas primeiras linhas */
  const cabecalhoAchado =
    config.linhaInicial === undefined ? acharLinhaCabecalho(todas, separador) : null;
  const linhaSugerida =
    config.linhaInicial ?? cabecalhoAchado?.linha ?? acharInicioDados(todas, separador);
  const uteis = todas.slice(Math.max(0, linhaSugerida - 1));

  const mapaCabecalho = cabecalhoAchado
    ? cabecalhoAchado.campos
    : mapearPorCabecalho(uteis[0] ?? '', separador);
  const cabecalhoSugerido =
    config.temCabecalho ?? (cabecalhoAchado !== null || Object.keys(mapaCabecalho).length >= 3);

  return {
    linhas: uteis.slice(0, maxLinhas).map((linha) => linha.split(separador)),
    totalLinhas: uteis.length,
    separador,
    linhaSugerida,
    cabecalhoSugerido,
    camposSugeridos: mapaCabecalho,
    posicionalSugerido: semSeparador(uteis, separador),
    /* U+FFFD aparece quando o arquivo não é UTF-8 (ex.: ANSI de ERP antigo) */
    suspeitaCodificacao: conteudo.includes('\uFFFD'),
  };
}

/** Nenhuma linha se dividiu em colunas e as linhas são longas: largura fixa. */
function semSeparador(linhas: string[], separador: string): boolean {
  if (linhas.length === 0) return false;
  const amostra = linhas.slice(0, 10);
  const todasUmaColuna = amostra.every((l) => l.split(separador).length === 1);
  const comprimentoMedio =
    amostra.reduce((soma, l) => soma + l.trim().length, 0) / amostra.length;
  return todasUmaColuna && comprimentoMedio >= 40;
}

/**
 * Procura, nas primeiras linhas, a que mais se parece com um cabeçalho (nomes
 * de coluna conhecidos). É o que permite ler arquivo que vem com título e data
 * de emissão antes da tabela.
 */
function acharLinhaCabecalho(
  linhas: string[],
  separador: string,
  maxLinhas = 20,
): { linha: number; campos: Partial<Record<Campo, number>> } | null {
  const limite = Math.min(maxLinhas, linhas.length);
  let melhor: { linha: number; campos: Partial<Record<Campo, number>> } | null = null;

  for (let i = 0; i < limite; i++) {
    const campos = mapearPorCabecalho(linhas[i], separador);
    const achados = Object.keys(campos).length;
    if (achados < 3) continue;
    if (!melhor || achados > Object.keys(melhor.campos).length) {
      melhor = { linha: i + 1, campos };
    }
  }
  return melhor;
}

/**
 * Primeira linha que tem a quantidade de colunas predominante no arquivo. Sem
 * cabeçalho para reconhecer, é isso que denuncia a linha de título: ela tem
 * menos colunas que o resto do arquivo.
 */
function acharInicioDados(linhas: string[], separador: string, maxLinhas = 20): number {
  const contagens = linhas
    .slice(0, Math.min(maxLinhas, linhas.length))
    .map((linha) => linha.split(separador).length);
  if (contagens.length === 0) return 1;

  const frequencia = new Map<number, number>();
  for (const n of contagens) frequencia.set(n, (frequencia.get(n) ?? 0) + 1);

  let tipica = contagens[0];
  let vezesTipica = 0;
  frequencia.forEach((vezes, colunas) => {
    if (vezes > vezesTipica || (vezes === vezesTipica && colunas > tipica)) {
      vezesTipica = vezes;
      tipica = colunas;
    }
  });

  if (tipica < 2) return 1;
  const indice = contagens.indexOf(tipica);
  return indice >= 0 ? indice + 1 : 1;
}

/** Rótulo curto do separador, para mostrar na tela. */
export function rotuloSeparador(separador: string): string {
  if (separador === '\t') return 'TAB';
  if (separador === ';') return 'ponto e vírgula (;)';
  if (separador === ',') return 'vírgula (,)';
  if (separador === '|') return 'barra vertical (|)';
  return separador;
}

/**
 * Detecta o separador predominante. Aceita uma linha ou várias: o arquivo de
 * ERP pode ter título antes dos dados, e aí a 1ª linha não tem separador
 * nenhum. A escolha prioriza o candidato que separa mais linhas de forma
 * CONSISTENTE (mesma quantidade de colunas), para não cair em vírgula de
 * decimal ("12,50") nem em TAB isolado.
 */
export function detectarSeparador(linha: string | string[]): string {
  const candidatos = [';', '|', '\t', ','];
  const linhas = (Array.isArray(linha) ? linha : [linha])
    .map((l) => l.trimEnd())
    .filter((l) => l.trim().length > 0)
    .slice(0, 20);

  let melhor = ';';
  let melhorPontos = -1;

  for (const c of candidatos) {
    const contagens = linhas
      .map((l) => l.split(c).length)
      .filter((n) => n >= 2)
      .sort((a, b) => a - b);
    if (contagens.length === 0) continue;

    const tipica = contagens[Math.floor(contagens.length / 2)] ?? 2;
    const consistentes = contagens.filter((n) => n === tipica).length;
    /* consistência vale mais que quantidade de colunas */
    const pontos = consistentes * 100 + tipica;
    if (pontos > melhorPontos) {
      melhorPontos = pontos;
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
  /** Como o layout foi tratado — a tela de importação mostra isso ao usuário. */
  tipo: TipoLayout;
  mapa: Partial<Record<Campo, number | CampoPosicional>>;
  cabecalhoDetectado: boolean;
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
  /*
   * No modo posicional os espaços à direita fazem parte do registro: o legado lê
   * com ReadLine() (sem trim) e decide por `linha.Length < N`. Por isso lá não
   * cortamos o fim da linha.
   */
  const posicional = opcoes.layout?.tipo === 'posicional';
  const linhasBrutas = conteudo
    .split(/\r?\n/)
    .map((linha) => (posicional ? linha.replace(/\r$/, '') : linha.trimEnd()))
    .filter((linha) => linha.trim().length > 0);

  if (linhasBrutas.length === 0) {
    return {
      linhas: [],
      descartadas: 0,
      separador: ';',
      tipo: 'delimitado',
      mapa: {},
      cabecalhoDetectado: false,
      origem: 'generico',
    };
  }

  const layout = opcoes.layout ?? null;
  const inicio = Math.max(0, (layout?.linhaInicial ?? 1) - 1);
  const uteis = inicio > 0 ? linhasBrutas.slice(inicio) : linhasBrutas;

  const tipo: TipoLayout = layout?.tipo ?? 'delimitado';
  let separador: string;
  let mapa: Partial<Record<Campo, number | CampoPosicional>>;
  let cabecalhoDetectado: boolean;
  let origem: ResultadoAnalise['origem'];
  let base = uteis;

  if (layout && Object.keys(layout.campos ?? {}).length > 0) {
    /* layout configurado na tela Fábricas manda em tudo */
    separador = layout.delimitador;
    mapa = layout.campos;
    cabecalhoDetectado = layout.temCabecalho;
    origem = 'layout';
  } else {
    /* sem layout salvo: procura o cabeçalho no arquivo e, na falta dele, usa o mapa fixo */
    separador = layout?.delimitador ?? PARSERS[opcoes.fabrica]?.separador ?? detectarSeparador(uteis);
    let mapaCabecalho = mapearPorCabecalho(uteis[0] ?? '', separador);
    let achouCabecalho = Object.keys(mapaCabecalho).length >= 3;

    /* arquivo de ERP com título/emitente antes do cabeçalho */
    if (!layout && !achouCabecalho) {
      const achado = acharLinhaCabecalho(uteis, separador);
      if (achado) {
        base = uteis.slice(achado.linha - 1);
        mapaCabecalho = achado.campos;
        achouCabecalho = true;
      } else {
        /* sem cabeçalho reconhecível: ao menos pula as linhas de título */
        const inicioDados = acharInicioDados(uteis, separador);
        if (inicioDados > 1) base = uteis.slice(inicioDados - 1);
      }
    }

    cabecalhoDetectado = layout?.temCabecalho ?? achouCabecalho;
    mapa = cabecalhoDetectado && achouCabecalho
      ? mapaCabecalho
      : (PARSERS[opcoes.fabrica]?.campos ?? PARSERS['CSV Padrão'].campos ?? {});
    origem = cabecalhoDetectado && achouCabecalho ? 'cabecalho' : 'generico';
  }

  const dados = cabecalhoDetectado ? base.slice(1) : base;
  const derivados = layout?.derivados ?? {};
  const fixos = layout?.fixos ?? {};
  const linhaMinima = layout?.linhaMinima ?? 0;
  const agora = new Date().toISOString();
  const linhas: PedidoNovo[] = [];
  let descartadas = 0;

  for (const bruta of dados) {
    /* posicional: linha curta demais é lixo (cabeçalho de página, rodapé).
       Mede a linha CRUA, como o legado faz. */
    if (linhaMinima > 0 && bruta.length < linhaMinima) {
      descartadas++;
      continue;
    }

    const colunas = posicional ? [] : bruta.split(separador);

    /** Valor cru do campo, como está no arquivo. */
    const bruto = (campo: Campo): string => {
      const geometria = mapa[campo];
      if (geometria === undefined) return '';

      if (typeof geometria === 'number') return (colunas[geometria] ?? '').trim();

      const fim = geometria.len > 0 ? geometria.pos + geometria.len : undefined;
      let texto = (fim === undefined ? bruta.substring(geometria.pos) : bruta.substr(geometria.pos, geometria.len)).trim();
      if (geometria.zeros) texto = texto.replace(/^0+/, '');
      return texto;
    };

    /** Aplica a regra de campo derivado (ex.: produto dentro da etiqueta). */
    const aplicarDerivado = (regra: RegraDerivada, campo: Campo): string => {
      const origem = bruto(campo);
      const pedaco = (pos: number, len: number, zeros?: boolean): string => {
        const texto = (len > 0 ? origem.substr(pos, len) : origem.substring(pos)).trim();
        return zeros ? texto.replace(/^0+/, '') : texto;
      };

      if (regra.ultimos !== undefined) {
        return origem.length >= regra.ultimos
          ? origem.substring(origem.length - regra.ultimos)
          : '';
      }
      if (regra.se_prefixo !== undefined) {
        if (origem.startsWith(regra.se_prefixo)) {
          return pedaco(regra.pos ?? 0, regra.len ?? 0, regra.zeros);
        }
        return pedaco(regra.senao_pos ?? 0, regra.senao_len ?? 0, regra.senao_zeros);
      }
      return pedaco(regra.pos ?? 0, regra.len ?? 0, regra.zeros);
    };

    /** Valor final do campo: derivado > posição > valor fixo quando vazio. */
    const valor = (campo: Campo): string => {
      const regra = derivados[campo];
      let texto = regra ? aplicarDerivado(regra, regra.de) : bruto(campo);
      if (!texto) texto = String(fixos[campo] ?? '').trim();
      if (!texto && regra?.padrao) texto = regra.padrao;
      return texto;
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

  return { linhas, descartadas, separador, tipo, mapa, cabecalhoDetectado, origem };
}
