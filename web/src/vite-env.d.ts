/// <reference types="vite/client" />

/** Bridge exposta pelo wrapper Electron (desktop/preload.js). */
interface Window {
  sysconfDesktop?: {
    plataforma: string;
    versaoElectron: string;
    versaoChrome: string;
  };
}
