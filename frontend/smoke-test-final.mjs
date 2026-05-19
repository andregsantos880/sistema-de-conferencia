import { chromium } from 'playwright';

const log = (...a) => console.log('[smoke]', ...a);
const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ locale: 'pt-BR' });
const page = await ctx.newPage();

const erros = [];
page.on('pageerror', (e) => erros.push('pageerror: ' + e.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    const txt = msg.text();
    if (!txt.includes('stopped during negotiation') && !txt.includes('AbortError')) {
      erros.push('console.error: ' + txt);
    }
  }
});

log('Login Echo (criado na F6 validação)');
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'ana@echo.com');
await page.fill('input[type="password"]', 'senha12345');
await Promise.all([page.waitForURL('**/app/**', { timeout: 8000 }), page.click('button[type="submit"]')]);

const rotas = [
  ['/app/conferencia', 'Conferência'],
  ['/app/pedidos', 'Pedidos'],
  ['/app/importacoes', 'Importações'],
  ['/app/historico', 'Histórico'],
  ['/app/relatorios', 'Relatórios'],
  ['/app/status', 'Status'],
  ['/app/boxes', 'Boxes'],
  ['/app/layouts', 'Layouts'],
  ['/app/usuarios', 'Usuários'],
  ['/app/roles', 'Roles'],
  ['/app/grupos', 'Grupos'],
  ['/app/assinatura', 'Assinatura'],
  ['/app/faturas', 'Faturas'],
];

for (const [path, label] of rotas) {
  await page.goto(`http://localhost:5173${path}`, { waitUntil: 'networkidle', timeout: 10000 });
  const ok = await page.locator(`h1:has-text("${label}")`).count();
  log(`${path} → header "${label}": ${ok > 0 ? '✓' : '✗'}`);
}

console.log('\n=== RESULTADO ===');
if (erros.length === 0) console.log('✓ Nenhum erro de JS');
else { console.log('✗ Erros:'); erros.slice(0, 10).forEach((e) => console.log('  ' + e)); }
await browser.close();
process.exit(erros.length === 0 ? 0 : 1);
