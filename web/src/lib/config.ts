/**
 * Configuração do app web do SysConf.
 *
 * A URL e a chave vêm de variáveis de ambiente do Vite (.env):
 *   VITE_SUPABASE_URL=https://<projeto>.supabase.co/rest/v1/
 *   VITE_SUPABASE_KEY=<chave publishable/anon>
 *
 * ATENÇÃO: a chave publishable fica visível para quem abrir o app no navegador.
 * Neste banco o RLS está desabilitado e `usuario.senha` é texto plano (exigência
 * do login legado), então trate a chave como segredo e não publique o site.
 */

export const SUPABASE_URL: string =
  import.meta.env.VITE_SUPABASE_URL ?? 'https://niapcemrcfmvsikvhlfd.supabase.co/rest/v1/';

export const SUPABASE_KEY: string = import.meta.env.VITE_SUPABASE_KEY ?? '';

/** Rótulos/cores dos status legados (PEDIDO.STATUS). */
export const STATUS: Record<number, { rotulo: string; classe: string; contador: string }> = {
  0: { rotulo: 'Normal', classe: 'linha-0', contador: 'contador-normal' },
  1: { rotulo: 'Conferido', classe: 'linha-1', contador: 'contador-conferido' },
  2: { rotulo: 'Saída', classe: 'linha-2', contador: 'contador-saida' },
  3: { rotulo: 'Entrega', classe: 'linha-3', contador: 'contador-entrega' },
};

/** Chave usada no localStorage para memorizar o login (equivalente ao chkMemorizarSenha). */
export const CHAVE_SESSAO = 'sysconf.sessao';

/** Colunas do grid, na mesma ordem do DataGridView do Form1. */
export const COLUNAS_GRID = [
  { campo: 'id', titulo: 'ID', largura: 70 },
  { campo: 'arquivo', titulo: 'ARQUIVO', largura: 130 },
  { campo: 'nmlayout', titulo: 'FÁBRICA', largura: 110 },
  { campo: 'idlayout', titulo: 'ID LAYOUT', largura: 80 },
  { campo: 'ordcompra', titulo: 'ORD.COMPRA', largura: 110 },
  { campo: 'cliente', titulo: 'CLIENTE', largura: 170 },
  { campo: 'pecliente', titulo: 'PE CLIENTE', largura: 100 },
  { campo: 'produto', titulo: 'PRODUTO', largura: 110 },
  { campo: 'descricao1', titulo: 'DESCRIÇÃO', largura: 190 },
  { campo: 'qtde', titulo: 'QTDE', largura: 70 },
  { campo: 'etiqueta', titulo: 'ETIQUETA', largura: 130 },
  { campo: 'sequencia', titulo: 'SEQUÊNCIA', largura: 90 },
  { campo: 'volume', titulo: 'VOLUME', largura: 70 },
  { campo: 'status', titulo: 'STATUS', largura: 70 },
  { campo: 'idbox', titulo: 'ID BOX', largura: 70 },
  { campo: 'flbloqueio', titulo: 'BLOQUEIO', largura: 80 },
  { campo: 'pecomputador', titulo: 'PC', largura: 100 },
] as const;

/** Opções do combo "buscar em" (espelha o cboBuscaLista do Form1 e seus textos). */
export const OPCOES_BUSCA = [
  { valor: 'ORDCOMPRA', titulo: 'ORD.COMPRA' },
  { valor: 'PECLIENTE', titulo: 'PEDIDO' },
  { valor: 'ARQUIVO', titulo: 'CARGA' },
] as const;

/** Título do painel de conferência por alvo (o combo do legado: "", CONFERENCIA, SAIDA, ENTREGA). */
export const TITULO_BOX: Record<number, string> = {
  1: 'CONFERÊNCIA',
  2: 'SAÍDA',
  3: 'ENTREGA',
};

/** Rótulos do menu de contexto do grid — textos exatos do legado (Form1.Designer). */
export const ROTULO_MENU: Record<number, string> = {
  0: 'Normal',
  1: 'Conferência',
  2: 'Saída',
};

/* -------------------------------------------------------------------------- */
/* Perfis e visibilidade de colunas                                           */
/* -------------------------------------------------------------------------- */

export const PERFIL = { ADMIN: 'ADMIN', OPERADOR: 'OPERADOR' } as const;
export type Perfil = (typeof PERFIL)[keyof typeof PERFIL];

/**
 * Colunas que NÃO aparecem para nenhum usuário (regra definida pelo cliente):
 * ID, FÁBRICA, ID LAYOUT, ID BOX, BLOQUEIO e PC.
 */
export const COLUNAS_OCULTAS: readonly string[] = [
  'id',
  'nmlayout',
  'idlayout',
  'idbox',
  'flbloqueio',
  'pecomputador',
];

/**
 * Colunas visíveis apenas para determinado perfil.
 * A ETIQUETA é o código de barras: o administrador vê, o operador não.
 */
export const COLUNAS_POR_PERFIL: Record<string, Perfil> = {
  etiqueta: PERFIL.ADMIN,
};

/** Colunas do grid já filtradas pelo perfil do usuário logado. */
export function colunasVisiveis(perfil: string): Array<(typeof COLUNAS_GRID)[number]> {
  return COLUNAS_GRID.filter((coluna) => !COLUNAS_OCULTAS.includes(coluna.campo)).filter(
    (coluna) => !COLUNAS_POR_PERFIL[coluna.campo] || COLUNAS_POR_PERFIL[coluna.campo] === perfil,
  );
}
