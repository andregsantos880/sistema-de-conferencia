/*
 * Bridge mínima do desktop. O app web continua usando apenas HTTP/APIs do
 * navegador; nada de acesso ao Node é exposto ao conteúdo carregado.
 */
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('sysconfDesktop', {
  plataforma: process.platform,
  versaoElectron: process.versions.electron,
  versaoChrome: process.versions.chrome
});
