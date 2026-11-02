// Auditoria automática de interface: responsividade (320 a 1440 px, retrato e paisagem), alvos de toque,
// tamanho de fonte dos campos e acessibilidade WCAG 2.1 AA (axe-core), com o backend simulado.
const http = require('http'), fs = require('fs'), path = require('path');
const { makeEnv } = require('./mocks');
const { chromium } = require('playwright');
const axeSrc = require('axe-core').source;
const root = path.join(__dirname, '..');
const env = makeEnv(); env.ctx.setup_();
const set = (k, v) => { const r = env.ctx.readAll_('Config').find(x => x.chave === k); env.ctx.updateRow_('Config', r._row, { valor: v }); env.ctx.resetConfigCache_(); };
set('INSCRICOES', 'ABERTAS'); set('PIN', '4321');
const R = env.ctx.register_({ nome: 'Maria Aparecida da Conceição Albuquerque Siqueira', curso: 'Engenharia de Produção', periodo: '5º', matricula: '20240001', email: 'maria@exemplo.com' });
['A10', 'A12', 'A15', 'A16'].forEach(id => { const a = env.ctx.getAtividade_(id); env.ctx.updateRow_('Atividades', a._row, { inscricoes_abertas: 'SIM', vagas_max: id === 'A16' ? 1 : 30 }); });
env.ctx.enroll_({ token: R.token, atividadeId: 'A16' });
let aberto = true, seq = 0;
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const PORT = 8768, B = 'http://localhost:' + PORT;
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, B);
  if (u.pathname.startsWith('/SemanadaEngenhariadeProd/')) u.pathname = u.pathname.slice('/SemanadaEngenhariadeProd'.length); // simula o GitHub Pages do projeto
  if (u.pathname === '/api') {
    let b = ''; req.on('data', d => b += d); req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      const p = req.method === 'POST' ? JSON.parse(b) : Object.fromEntries(u.searchParams);
      const r = env.ctx.handle_(p); if (p.action === 'config') r.inscricoesAbertas = aberto; res.end(JSON.stringify(r));
    }); return;
  }
  if (u.pathname === '/inscricao/config.js') { res.writeHead(200, { 'Content-Type': 'text/javascript' }); return res.end(`window.APP_CONFIG={API_URL:"${B}/api"}`); }
  const f = path.join(root, u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
const loginScanner = async pg => { await pg.fill('#operador', 'Ana'); await pg.fill('#pin', '4321'); await pg.click('#btnLogin'); await pg.waitForSelector('#modo:not(.oculto)'); };
const telas = [
  ['landing', B + '/index.html', null],
  ['privacidade', B + '/inscricao/privacidade.html', null],
  ['404', B + '/404.html', null],
  ['inscricao', B + '/inscricao/index.html', '#formCard:not(.oculto)'],
  ['inscricao-fechada', B + '/inscricao/index.html', async pg => { aberto = false; await pg.reload(); await pg.waitForSelector('#fechado:not(.oculto)'); aberto = true; }],
  ['inscricao-sucesso', B + '/inscricao/index.html', async pg => { await pg.waitForSelector('#formCard:not(.oculto)'); await pg.fill('#nome', 'Joao da Silva Souza'); await pg.selectOption('#periodo', '3º'); await pg.fill('#matricula', '2025' + String(++seq).padStart(4, '0')); await pg.fill('#email', 'j' + seq + '@exemplo.com'); await pg.fill('#email2', 'j' + seq + '@exemplo.com'); await pg.waitForTimeout(2100); await pg.click('#enviar'); await pg.waitForSelector('#sucesso:not(.oculto)'); }],
  ['atividades', B + '/inscricao/atividades.html?t=' + R.token, '.ativ'],
  ['scanner-login', B + '/scanner/index.html', '#login'],
  ['scanner-modo', B + '/scanner/index.html', loginScanner],
  ['scanner-leitura', B + '/scanner/index.html', async pg => { await loginScanner(pg); await pg.click('label:has(input[value="2026-11-11"]) span'); await pg.click('#btnIniciar'); await pg.waitForSelector('#scan:not(.oculto)'); await pg.evaluate(t => window.__scanner.processar(t, { manual: true }), R.token); }]
];
const viewports = [[320, 568], [360, 740], [390, 844], [430, 932], [768, 1024], [1024, 768], [1440, 900], [844, 390], [667, 375]];
(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const br = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const problemas = []; const add = (t, m) => problemas.push(`${t}: ${m}`);
  for (const [nome, url, esp] of telas) for (const [w, h] of viewports) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, permissions: ['camera'], hasTouch: w < 800 });
    const pg = await ctx.newPage(); const falhas = [];
    pg.on('pageerror', e => falhas.push('erro de script: ' + e)); pg.on('console', m => { if (m.type() === 'error') falhas.push('console: ' + m.text()); });
    await pg.goto(url, { waitUntil: 'load' });
    if (typeof esp === 'string') await pg.waitForSelector(esp); else if (esp) await esp(pg);
    await pg.waitForTimeout(150);
    const r = await pg.evaluate(() => {
      const W = innerWidth, o = { sw: document.documentElement.scrollWidth, W, estouro: [], pequenos: [], fonte: [] };
      document.querySelectorAll('body *').forEach(e => {
        const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || e.closest('.sr-only')) return;
        const b = e.getBoundingClientRect(); if (b.width === 0 || e.closest('.skip')) return;
        if (b.right > W + 1 && !e.closest('.video')) o.estouro.push(e.tagName + '.' + e.className + ' ' + Math.round(b.right));
      });
      document.querySelectorAll('button,a.btn,input:not([type=radio]),select,.dias span').forEach(e => {
        const b = e.getBoundingClientRect(), s = getComputedStyle(e);
        if (s.display === 'none' || b.width === 0 || e.closest('.oculto')) return;
        if (b.height < 44) o.pequenos.push((e.id || e.className || e.tagName) + ' h=' + Math.round(b.height));
        if (['INPUT', 'SELECT'].includes(e.tagName) && parseFloat(s.fontSize) < 16) o.fonte.push(e.id + ' ' + s.fontSize);
      });
      return o;
    });
    const t = `${nome} @${w}x${h}`;
    if (r.sw > r.W) add(t, `rolagem horizontal (scrollWidth ${r.sw})`);
    r.estouro.slice(0, 3).forEach(x => add(t, 'conteúdo fora da tela: ' + x));
    r.pequenos.forEach(x => add(t, 'alvo de toque menor que 44px: ' + x)); r.fonte.forEach(x => add(t, 'fonte menor que 16px (zoom no iOS): ' + x));
    falhas.forEach(x => add(t, x));
    if (w === 390 || (w === 844 && nome.startsWith('scanner'))) {
      await pg.evaluate(axeSrc);
      const ax = await pg.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] })).violations
        .map(v => v.id + ' [' + v.impact + '] ' + v.nodes.slice(0, 3).map(n => n.target[0]).join(', ')));
      ax.forEach(a => add(t, 'acessibilidade: ' + a));
    }
    if (process.env.CAPTURAS && (w === 390 || w === 1440 || w === 844)) await pg.screenshot({ path: path.join(process.env.CAPTURAS, `${nome}-${w}.png`), fullPage: true });
    await ctx.close();
  }
  await br.close(); srv.close();
  const unicos = [...new Set(problemas)];
  if (unicos.length) { console.log(unicos.length + ' problema(s):\n' + unicos.slice(0, 60).map(x => ' - ' + x).join('\n')); process.exit(1); }
  console.log(`ok: ${telas.length} telas x ${viewports.length} tamanhos, sem estouro, alvos de toque >= 44px, WCAG AA sem violações`);
})();
