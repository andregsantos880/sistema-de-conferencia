/**
 * Identifica se a página está rodando dentro do app instalado (Electron).
 *
 * O wrapper desktop expõe `window.sysconfDesktop` pelo preload. A checagem do
 * user agent é só uma reserva para casos em que o preload ainda não carregou.
 */
export function estaNoDesktop(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.sysconfDesktop) return true;
  return /Electron/i.test(window.navigator?.userAgent ?? '');
}

/** true quando a página está aberta no navegador comum. */
export function estaNoNavegador(): boolean {
  return !estaNoDesktop();
}
