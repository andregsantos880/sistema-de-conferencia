/*
 * SysConf desktop — encapsula o SPA publicado no Firebase.
 *
 * Por padrão abre direto a tela de login.
 * Para apontar para homologação/local, defina SYSCONF_URL antes de iniciar:
 *   set SYSCONF_URL=http://localhost:5173 && npm start
 *
 * A página continua sendo o mesmo app web: nada precisa mudar no front-end.
 */
const { app, BrowserWindow, session, shell, dialog } = require('electron');
const path = require('path');

const APP_URL = process.env.SYSCONF_URL || 'https://sysconf-web.web.app/entrar';
const APP_ORIGIN = new URL(APP_URL).origin;

// Mantém o áudio (bipe e voz da conferência) funcionando sem clique prévio.
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');

let janela = null;

function criarJanela() {
  janela = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    title: 'SysConf',
    autoHideMenuBar: true,
    backgroundColor: '#e2e8f0',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false
    }
  });

  // Remove o token "Electron/..." do UA para evitar bloqueios indevidos.
  janela.webContents.setUserAgent(
    janela.webContents.getUserAgent().replace(/\sElectron\/[\d.]+/i, '')
  );

  janela.once('ready-to-show', () => janela.show());
  janela.loadURL(APP_URL);

  // Links externos abrem no navegador do sistema.
  janela.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith(APP_ORIGIN)) return { action: 'allow' };
    void shell.openExternal(url);
    return { action: 'deny' };
  });

  // Impede navegar para fora do app dentro da janela.
  janela.webContents.on('will-navigate', (evento, url) => {
    if (!url.startsWith(APP_ORIGIN)) {
      evento.preventDefault();
      void shell.openExternal(url);
    }
  });

  janela.on('closed', () => {
    janela = null;
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId('com.softwerd.sysconf');

  // Permissões: libera apenas clipboard (usado pelo app) e notificações.
  session.defaultSession.setPermissionRequestHandler((_wc, permissao, responder) => {
    responder(['clipboard-read', 'clipboard-sanitized-write', 'notifications'].includes(permissao));
  });

  // "Exportar CSV" gera um download: salva direto em Downloads com o nome sugerido.
  session.defaultSession.on('will-download', (_evento, item) => {
    const destino = path.join(app.getPath('downloads'), item.getFilename());
    item.setSavePath(destino);
    item.once('done', (_e, estado) => {
      if (estado === 'completed') return;
      void dialog.showMessageBox({
        type: 'warning',
        title: 'SysConf',
        message: `Não foi possível salvar "${item.getFilename()}".`,
        detail: estado
      });
    });
  });

  criarJanela();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) criarJanela();
  });
});

// Instância única: uma segunda execução foca a janela existente.
const travouInstancia = app.requestSingleInstanceLock();
if (!travouInstancia) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (!janela) return;
    if (janela.isMinimized()) janela.restore();
    janela.focus();
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
