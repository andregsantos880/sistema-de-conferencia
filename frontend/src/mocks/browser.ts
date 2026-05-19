import { setupWorker } from 'msw/browser';

// MSW desabilitado no SisConf (VITE_USE_MSW=false). Mantido apenas para que
// main.tsx continue importável; nenhum handler é registrado.
export const worker = setupWorker();
