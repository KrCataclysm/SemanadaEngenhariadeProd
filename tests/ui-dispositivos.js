// Responsividade do painel /admin/ em dispositivos reais (descritores do Playwright) e tamanhos extremos.
const fs = require('fs'), path = require('path');
const { chromium, devices } = require('playwright');
const S = require('./_servidor-admin')(8776);
const axeSrc = require('axe-core').source;
const lista = [
  ['iPhone SE', devices['iPhone SE']], ['iPhone 13', devices['iPhone 13']], ['iPhone 14 Pro Max', devices['iPhone 14 Pro Max']],
  ['Pixel 7', devices['Pixel 7']], ['Galaxy S9+', devices['Galaxy S9+']], ['Galaxy Fold (280px)', { viewport: { width: 280, height: 653 }, hasTouch: true, isMobile: true, deviceScaleFactor: 3 }],
  ['iPad Mini', devices['iPad Mini']], ['iPad Mini horizontal', devices['iPad Mini landscape']], ['iPad Pro 11', devices['iPad Pro 11']], ['iPad Pro 11 horizontal', devices['iPad Pro 11 landscape']],
  ['Celular horizontal', devices['Pixel 7 landscape']], ['Notebook 1366', { viewport: { width: 1366, height: 768 } }], ['Desktop 1920', { viewport: { width: 1920, height: 1080 } }], ['Ultrawide 3440', { viewport: { width: 3440, height: 1440 } }]
];
const telas = ['inicio', 'inscritos', 'atividades', 'alertas', 'dados'];
(async () => {
  await S.listen(); const br = await chromium.launch(); const problemas = []; const add = (t, m) => problemas.push(`${t}: ${m}`);
  for (const [nome, cfg] of lista) {
    const ctx = await br.newContext(cfg); const pg = await ctx.newPage(); pg.setDefaultTimeout(8000); const falhas = [];
    pg.on('pageerror', e => falhas.push('erro de script: ' + e)); pg.on('console', m => m.type() === 'error' && falhas.push('console: ' + m.text()));
    const medir = async (tela, comAxe) => {
      await pg.waitForTimeout(200); const t = `${nome} / ${tela}`;
      const r = await pg.evaluate(() => {
        const W = innerWidth, o = { sw: document.documentElement.scrollWidth, W, estouro: [], pequenos: [], fonte: [], corte: [] };
        document.querySelectorAll('body *').forEach(e => {
          const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || e.closest('.sr-only') || e.closest('.skip') || e.closest('.tabela-simples') || e.closest('.oculto')) return;
          const b = e.getBoundingClientRect(); if (b.width === 0) return;
          if (b.right > W + 1 || b.left < -1) o.estouro.push(e.tagName + '.' + e.className + ' ' + Math.round(b.left) + '..' + Math.round(b.right));
          if (e.scrollWidth > e.clientWidth + 1 && ['hidden', 'clip'].includes(s.overflowX) && e.clientWidth > 0) o.corte.push(e.tagName + '.' + e.className);
        });
        document.querySelectorAll('button,a.btn,input:not([type=radio]),select').forEach(e => {
          const alvo = e.type === 'checkbox' && e.closest('label') ? e.closest('label') : e, b = alvo.getBoundingClientRect(), s = getComputedStyle(e);
          if (s.display === 'none' || b.width === 0 || e.closest('.oculto')) return;
          if (b.height < 44) o.pequenos.push((e.id || e.className || e.tagName) + ' h=' + Math.round(b.height));
          if (['INPUT', 'SELECT'].includes(e.tagName) && parseFloat(s.fontSize) < 16) o.fonte.push(e.id + ' ' + s.fontSize);
        });
        return o;
      });
      if (r.sw > r.W) add(t, `rolagem horizontal (${r.sw} > ${r.W})`);
      [...new Set(r.estouro)].slice(0, 3).forEach(x => add(t, 'fora da tela: ' + x)); [...new Set(r.corte)].slice(0, 3).forEach(x => add(t, 'texto cortado: ' + x));
      [...new Set(r.pequenos)].forEach(x => add(t, 'alvo de toque < 44px: ' + x)); r.fonte.forEach(x => add(t, 'fonte < 16px: ' + x));
      if (comAxe) { await pg.evaluate(axeSrc); const ax = await pg.evaluate(async () => (await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] })).violations.map(v => v.id + ' [' + v.impact + '] ' + v.nodes.slice(0, 3).map(n => n.target[0]).join(', '))); ax.forEach(a => add(t, 'acessibilidade: ' + a)); }
      if (process.env.CAPTURAS) await pg.screenshot({ path: path.join(process.env.CAPTURAS, `${nome.replace(/\W+/g, '-')}-${tela}.png`), fullPage: true });
    };
    await pg.goto(S.B + '/admin/'); await medir('login', true);
    await pg.fill('#operador', 'Lilian'); await pg.fill('#senha', 'senhaForte123'); await pg.click('#btnLogin'); await pg.waitForSelector('#app:not(.oculto)'); await pg.waitForSelector('.kpi');
    for (const tela of telas) {
      await pg.click('#t-' + tela);
      if (tela === 'inscritos') { await pg.fill('#q', 'pessoa teste'); await pg.waitForSelector('#resBusca .item'); await medir('inscritos (busca)', false); await pg.click('#resBusca .item button'); await pg.waitForSelector('#formFicha'); await medir('inscritos (ficha)', true); continue; }
      if (tela === 'atividades') await pg.waitForSelector('#max-A16');
      if (tela === 'alertas') await pg.waitForSelector('text=Reenviar pendentes agora');
      await medir(tela, true);
    }
    // texto 200%: o rem muda e o layout precisa se reorganizar sem estourar
    await pg.evaluate(() => { document.documentElement.style.fontSize = '200%'; }); await pg.click('#t-inicio'); await medir('texto a 200%', false);
    falhas.forEach(x => add(nome, x)); await ctx.close();
  }
  await br.close(); S.srv.close();
  const u = [...new Set(problemas)];
  if (u.length) { console.log(u.length + ' problema(s):\n' + u.slice(0, 80).map(x => ' - ' + x).join('\n')); process.exit(1); }
  console.log(`ok: painel em ${lista.length} dispositivos x ${telas.length + 3} telas, sem estouro, alvos >= 44px, WCAG AA sem violações, texto a 200% sem quebra`);
})();
