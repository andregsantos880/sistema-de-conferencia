/**
 * Roteamento por URL — a empresa é identificada pelo caminho:
 *   /sysconf/<empresa>/login
 *   /sysconf/<empresa>/conferencia
 *   /sysconf/<empresa>/importacao
 *   /sysconf/<empresa>/usuarios
 *
 * Não há router de terceiros: são poucas telas e o estado é simples.
 */

export type Tela = 'login' | 'conferencia' | 'importacao' | 'usuarios';

export type Rota = { empresa: string | null; tela: Tela };

const TELAS: Tela[] = ['login', 'conferencia', 'importacao', 'usuarios'];

/** Lê a rota do caminho atual (ou de um caminho informado, útil em testes). */
export function lerRota(caminho: string = window.location.pathname): Rota {
  const partes = caminho.split('/').filter(Boolean);
  const indice = partes.indexOf('sysconf');

  if (indice < 0 || partes.length < indice + 2) {
    return { empresa: null, tela: 'login' };
  }

  const empresa = decodeURIComponent(partes[indice + 1] ?? '') || null;
  const tela = (partes[indice + 2] as Tela) ?? 'login';

  return { empresa, tela: TELAS.includes(tela) ? tela : 'login' };
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
