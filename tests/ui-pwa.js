// Instalabilidade (PWA) do painel /admin/ e do scanner: manifesto, ícones, service worker, modo sem internet.
const assert = require('assert'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const S = require('./_servidor-admin')(8772);
let ok = 0; const t = async (n, fn) => { try { await fn(); ok++; console.log('  ok  ' + n); } catch (e) { console.log('FALHOU ' + n + '\n      ' + String(e.stack || e.message).split('\n').slice(0, 3).join('\n      ')); process.exitCode = 1; } };
(async () => {
  await S.listen();
  const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 420, height: 800 } }); const pg = await ctx.newPage(); pg.setDefaultTimeout(8000); const pgPrincipal = pg;
  const erros = []; pg.on('pageerror', e => erros.push(String(e))); pg.on('console', m => m.type() === 'error' && erros.push(m.text()));
  const prontoAdmin = async (pg = pgPrincipal) => { await pg.waitForFunction(() => !!navigator.serviceWorker.controller); await pg.waitForFunction(async () => { const k = await caches.keys(); return k.includes('admin-v1') && !!(await (await caches.open('admin-v1')).match('/assets/icons/admin-192.png')); }); };
  const man = JSON.parse(fs.readFileSync(path.join(S.root, 'admin/manifest.webmanifest'), 'utf8'));
  await t('manifesto do painel completo (standalone, escopo, ícones existentes e maskable)', async () => {
    assert.strictEqual(man.display, 'standalone'); assert(man.name && man.short_name.length <= 12); assert.strictEqual(man.scope, './'); assert(man.start_url && man.theme_color && man.background_color);
    for (const i of man.icons) { const f = path.join(S.root, 'admin', i.src); assert(fs.existsSync(f), 'ícone ausente ' + i.src); assert(fs.statSync(f).size > 500); }
    assert(man.icons.some(i => i.sizes === '192x192') && man.icons.some(i => i.sizes === '512x512' && i.purpose === 'any') && man.icons.some(i => i.purpose === 'maskable'));
    for (const s of man.shortcuts) assert(/^\.\/\?aba=(inscritos|atividades|alertas)$/.test(s.url));
  });
  for (const [nome, url] of [['painel', '/admin/'], ['scanner', '/scanner/']]) {
    await t('instalável pelo Chrome sem pendências: ' + nome, async () => {
      await pg.goto(S.B + url); await pg.evaluate(() => navigator.serviceWorker.ready);
      await pg.reload(); await pg.waitForFunction(() => !!navigator.serviceWorker.controller);
      const cdp = await ctx.newCDPSession(pg); await cdp.send('Page.enable');
      const r = await cdp.send('Page.getInstallabilityErrors'); assert.deepStrictEqual(r.installabilityErrors, [], JSON.stringify(r.installabilityErrors));
    });
  }
  await t('painel: serviço ativo, só arquivos estáticos em cache, nada de dados pessoais', async () => {
    await pg.goto(S.B + '/admin/'); await prontoAdmin();
    const urls = await pg.evaluate(async () => { const out = []; for (const k of (await caches.keys()).filter(k => k.startsWith('admin-'))) { const c = await caches.open(k); for (const r of await c.keys()) out.push(r.url); } return out; });
    assert(urls.length >= 10); assert(urls.every(u => u.startsWith(S.B) && !/\/api/.test(u)), urls.join('\n'));
    assert(urls.some(u => /admin\.js$/.test(u)) && urls.some(u => /admin-192\.png$/.test(u)), urls.join(' '));
  });
  await t('painel: abre sem internet (login aparece) e avisa ao tentar entrar', async () => {
    const c3 = await br.newContext({ viewport: { width: 420, height: 800 } }); const p3 = await c3.newPage(); p3.setDefaultTimeout(8000);
    await p3.goto(S.B + '/admin/'); await prontoAdmin(p3); await c3.setOffline(true); await p3.goto(S.B + '/admin/'); await p3.waitForSelector('#login:not(.oculto)');
    await p3.waitForSelector('#chRede:not(.oculto)'); assert(/Sem conexão/.test(await p3.textContent('#chRede')));
    await p3.fill('#operador', 'Lilian'); await p3.fill('#senha', 'senhaForte123'); await p3.click('#btnLogin');
    await p3.waitForFunction(() => /sem conexão/i.test(document.getElementById('toast').textContent)); await c3.setOffline(false);
    await p3.reload(); await p3.waitForSelector('#chRede.oculto', { state: 'attached' }); await c3.close();
  });
  await t('painel: atalho ?aba= abre a aba certa após o login', async () => {
    await pg.goto(S.B + '/admin/?aba=atividades'); await pg.fill('#operador', 'Lilian'); await pg.fill('#senha', 'senhaForte123'); await pg.click('#btnLogin');
    await pg.waitForSelector('#p-atividades:not(.oculto)'); assert.strictEqual(await pg.getAttribute('#t-atividades', 'aria-selected'), 'true');
  });
  await t('painel: botão "Instalar" aparece com o evento do navegador e some após instalar', async () => {
    await pg.goto(S.B + '/admin/'); await pg.evaluate(() => { const e = new Event('beforeinstallprompt'); e.prompt = () => { window.__p = 1; }; e.userChoice = Promise.resolve({ outcome: 'accepted' }); window.dispatchEvent(e); });
    await pg.waitForSelector('#btnInstalar:not(.oculto)'); await pg.click('#btnInstalar'); await pg.waitForSelector('#btnInstalar.oculto', { state: 'attached' }); assert.strictEqual(await pg.evaluate(() => window.__p), 1);
  });
  await t('painel: no iPhone mostra a dica "Adicionar à Tela de Início"', async () => {
    const c2 = await br.newContext({ viewport: { width: 390, height: 800 }, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1' }); const p2 = await c2.newPage();
    await p2.goto(S.B + '/admin/'); await p2.waitForSelector('#dicaInstalar:not(.oculto)'); assert(/Adicionar à Tela de Início/.test(await p2.textContent('#dicaInstalar'))); await c2.close();
  });
  await t('painel: metadados de iOS/Android no HTML', async () => {
    const h = fs.readFileSync(path.join(S.root, 'admin/index.html'), 'utf8');
    for (const x of ['rel="manifest"', 'apple-touch-icon', 'apple-mobile-web-app-capable', 'theme-color', 'viewport-fit=cover']) assert(h.includes(x), 'falta ' + x);
  });
  await t('sem erros de script/CSP', async () => { assert.deepStrictEqual(erros.filter(e => !/net::ERR_INTERNET_DISCONNECTED|Failed to load resource/.test(e)), [], erros.join(' | ')); });
  await br.close(); S.srv.close(); console.log(`\n${ok} verificação(ões) PWA ok`);
})();
