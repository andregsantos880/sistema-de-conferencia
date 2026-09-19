/**
 * Roteamento por URL.
 *
 * Publico (sem empresa):
 *   /            -> landing page (site de vendas)
 *   /entrar      -> login de quem ja usa
 *   /registrar   -> autocadastro (30 dias de teste)
 *
 * App (a empresa e identificada pelo caminho — sao os links ja enviados aos
 * clientes, por isso continuam valendo):
 *   /sysconf/<empresa>/login
 *   /sysconf/<empresa>/conferencia
 *   /sysconf/<empresa>/importacao
 *   /sysconf/<empresa>/usuarios
 *   /sysconf/<empresa>/fabricas
 *   /sysconf/<empresa>/importacoes
 *   /sysconf/<empresa>/logs
 *   /sysconf/<empresa>/locais
 *   /sysconf/<empresa>/locais-pecas
 *   /sysconf/<empresa>/ajuda
 *
 * Nao ha router de terceiros: sao poucas telas e o estado e simples.
 */

export type Tela =
  | 'login'
  | 'conferencia'
  | 'importacao'
  | 'usuarios'
  | 'fabricas'
  | 'importacoes'
  | 'logs'
  | 'locais'
  | 'locais-pecas'
  | 'ajuda';

/** Paginas publicas do site (fora do escopo de empresa). */
export type Pagina = 'landing' | 'entrar' | 'registrar' | 'termos' | 'privacidade';

export type Rota = { empresa: string | null; tela: Tela; pagina: Pagina | null };

const TELAS: Tela[] = [
  'login',
  'conferencia',
  'importacao',
  'usuarios',
  'fabricas',
  'importacoes',
  'logs',
  'locais',
  'locais-pecas',
  'ajuda',
];

const PAGINAS: Record<string, Pagina> = {
  '': 'landing',
  entrar: 'entrar',
  registrar: 'registrar',
  termos: 'termos',
  privacidade: 'privacidade',
};

/** Le a rota do caminho atual (ou de um caminho informado, util em testes). */
export function lerRota(caminho: string = window.location.pathname): Rota {
  const partes = caminho.split('/').filter(Boolean);
  const indice = partes.indexOf('sysconf');

  /* /sysconf/<empresa>[/<tela>] */
  const empresa =
    indice >= 0 ? decodeURIComponent(partes[indice + 1] ?? '').trim() : '';

  if (empresa) {
    const tela = (partes[indice + 2] as Tela) ?? 'login';
    return { empresa, tela: TELAS.includes(tela) ? tela : 'login', pagina: null };
  }

  /* qualquer outro caminho e uma pagina publica (desconhecido -> landing) */
  const primeira = (partes[indice >= 0 ? indice : 0] ?? '').toLowerCase();
  return { empresa: null, tela: 'login', pagina: PAGINAS[primeira] ?? 'landing' };
}

export function urlDaTela(empresa: string, tela: Tela): string {
  return `/sysconf/${encodeURIComponent(empresa)}/${tela}`;
}

/** Troca a URL sem recarregar (o Sysconf observa o popstate). */
export function irPara(empresa: string, tela: Tela): void {
  const url = urlDaTela(empresa, tela);
  if (window.location.pathname !== url) {
    window.history.pushState({}, '', url);
  }
}

/** Link completo para enviar ao cliente da empresa. */
export function linkDaEmpresa(empresa: string): string {
  return `${window.location.origin}${urlDaTela(empresa, 'login')}`;
}

/* ------------------------------------------------------ paginas publicas --- */

/** URL de uma pagina do site (a raiz e a landing). */
export function urlDaPagina(pagina: Pagina): string {
  return pagina === 'landing' ? '/' : `/${pagina}`;
}

/** Troca a URL sem recarregar (o Sysconf observa o popstate). */
export function irParaPagina(pagina: Pagina): void {
  const url = urlDaPagina(pagina);
  if (window.location.pathname !== url) {
    window.history.pushState({}, '', url);
  }
}
