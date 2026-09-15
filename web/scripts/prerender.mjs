/**
 * Gera o HTML estático das páginas públicas (build SSR em .seo/entradaSeo.js) e
 * grava cada uma com título, descrição e canonical próprios.
 *
 * Rodado por `npm run seo`, depois de `npm run build` e antes do deploy.
 *
 * Por que existe: o site é uma SPA e o HTML publicado tinha ~1 KB — para um robô
 * de busca que não executa JavaScript, a página era invisível. Agora cada página
 * pública tem HTML completo já na primeira resposta do servidor.
 *
 * Se algo esperado não for encontrado no HTML base, o script falha e o deploy
 * não acontece: melhor quebrar o build do que publicar página invisível.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const origem = resolve(raiz, '.seo/entradaSeo.js');
const { htmlLanding, htmlRegistrar, htmlTermos, htmlPrivacidade } = await import(pathToFileURL(origem).href);

const SITE = 'https://sysconf-web.web.app';

/** arquivo gerado em dist -> como renderizar e quais meta tags usar */
const PAGINAS = [
  {
    arquivo: 'index.html',
    render: htmlLanding,
    titulo: 'SysConf — Conferência de pedidos e cargas | 30 dias grátis',
    descricao:
      'Importe o arquivo da fábrica, bipe as etiquetas e libere a carga: conferência de entrada e saída no navegador, com controle por box. 30 dias grátis, sem cartão.',
    caminho: '/',
  },
  {
    arquivo: 'registrar.html',
    render: htmlRegistrar,
    titulo: 'Criar conta grátis — SysConf | 30 dias sem cartão',
    descricao:
      'Crie a conta da sua empresa e comece a conferir cargas hoje: 30 dias grátis, sem cartão de crédito, com as fábricas já cadastradas.',
    caminho: '/registrar',
  },
  {
    arquivo: 'termos.html',
    render: htmlTermos,
    titulo: 'Termos de Uso — SysConf',
    descricao:
      'Regras de uso do SysConf: cadastro, teste gratuito, dados da operação, disponibilidade, preço, encerramento e responsabilidades.',
    caminho: '/termos',
  },
  {
    arquivo: 'privacidade.html',
    render: htmlPrivacidade,
    titulo: 'Política de Privacidade — SysConf',
    descricao:
      'Quais dados o SysConf trata, com quem compartilha, por quanto tempo e como exercer seus direitos (LGPD).',
    caminho: '/privacidade',
  },
];

const base = await readFile(resolve(raiz, 'dist/index.html'), 'utf8');

const MARCADOR = '<div id="root"></div>';
if (!base.includes(MARCADOR)) {
  console.error('[prerender] marcador <div id="root"></div> nao encontrado em dist/index.html');
  process.exit(1);
}

/** Troca o valor de uma meta/tag no HTML base; falha se o padrão não existir. */
function trocar(html, padrao, valor, descricao) {
  if (!padrao.test(html)) {
    console.error(`[prerender] nao encontrei no HTML base: ${descricao}`);
    process.exit(1);
  }
  return html.replace(padrao, valor);
}

for (const pagina of PAGINAS) {
  const conteudo = pagina.render();

  let html = base.replace(MARCADOR, `<div id="root">${conteudo}</div>`);
  html = trocar(html, /<title>[\s\S]*?<\/title>/, `<title>${pagina.titulo}</title>`, 'title');
  html = trocar(
    html,
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${pagina.descricao}" />`,
    'meta description',
  );
  html = trocar(
    html,
    /<link rel="canonical" href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${SITE}${pagina.caminho}" />`,
    'canonical',
  );
  html = trocar(
    html,
    /<meta property="og:url" content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${SITE}${pagina.caminho}" />`,
    'og:url',
  );
  html = trocar(
    html,
    /<meta property="og:title" content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${pagina.titulo}" />`,
    'og:title',
  );

  await writeFile(resolve(raiz, 'dist', pagina.arquivo), html, 'utf8');
  console.log(`[prerender] ${pagina.arquivo}: ${conteudo.length} bytes de conteudo`);
}
