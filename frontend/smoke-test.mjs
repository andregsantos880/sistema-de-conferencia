import { chromium } from 'playwright';

const SLOW = 50;
const log = (...a) => console.log('[smoke]', ...a);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ locale: 'pt-BR' });
const page = await ctx.newPage();

const erros = [];
page.on('pageerror', (e) => erros.push('pageerror: ' + e.message));
page.on('console', (msg) => {
  if (msg.type() === 'error') erros.push('console.error: ' + msg.text());
});

log('Abrindo landing /');
await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
const h1 = await page.locator('h1').first().textContent();
log('h1:', h1?.replace(/\s+/g, ' ').slice(0, 80));

log('Indo para /precos');
await page.click('a[href="/precos"]');
await page.waitForURL('**/precos');
await page.waitForLoadState('networkidle');
const planosTitulos = await page.locator('h3').allTextContents();
log('Planos listados:', planosTitulos.filter(t => t.length > 0));

log('Indo para /login');
await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
await page.fill('input[type="email"]', 'pedro@gamma.com');
await page.fill('input[type="password"]', 'senha12345');
log('Submetendo login');
await Promise.all([
  page.waitForURL('**/app/**', { timeout: 8000 }),
  page.click('button[type="submit"]'),
]);
log('Logado, URL:', page.url());

// Conferência (página padrão após login)
await page.waitForTimeout(SLOW);
const conferenciaHeader = await page.locator('h1:has-text("Conferência")').count();
log('Tem header Conferência:', conferenciaHeader > 0);

// Verifica se SignalR conectou (texto "Online")
await page.waitForSelector('text=Online', { timeout: 5000 }).catch(() => null);
const online = await page.locator('text=Online').count();
log('SignalR Online:', online > 0);

// Navega para pedidos
log('Navegando para Pedidos');
await page.click('a[href="/app/pedidos"]');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);
const totalPedidos = await page.locator('text=/\\d+ pedidos/').textContent().catch(() => null);
log('Linha de total:', totalPedidos);

// Navega para Importações
log('Navegando para Importações');
await page.click('a[href="/app/importacoes"]');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);
log('Importações URL:', page.url());

// Navega para Status
log('Navegando para Status');
await page.click('a[href="/app/status"]');
await page.waitForLoadState('networkidle');
await page.waitForTimeout(500);
const statuses = await page.locator('table tbody tr').count();
log('Status na tabela:', statuses);

console.log('\n=== RESULTADO ===');
if (erros.length === 0) {
  console.log('✓ Nenhum erro JS detectado');
} else {
  console.log('✗ Erros detectados:');
  erros.slice(0, 10).forEach(e => console.log('  ' + e));
}

await browser.close();
process.exit(erros.length === 0 ? 0 : 1);
