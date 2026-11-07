// Uso só com teclado (sem mouse): ordem de foco, foco sempre visível, Enter envia, caixas de confirmação prendem o foco e fecham com Esc.
const assert = require('assert');
const { chromium } = require('playwright');
const S = require('./_servidor-admin')(8777);
let ok = 0; const t = async (n, f) => { try { await f(); ok++; console.log('  ok  ' + n); } catch (e) { console.log('FALHOU ' + n + '\n      ' + String(e.stack || e.message).split('\n').slice(0, 3).join('\n      ')); process.exitCode = 1; } };
(async () => {
  await S.listen(); const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 1100, height: 900 } }); const pg = await ctx.newPage(); pg.setDefaultTimeout(8000);
  const focoVisivel = async () => pg.evaluate(() => { const a = document.activeElement; if (!a || a === document.body) return 'nenhum'; const s = getComputedStyle(a); const comOutline = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0; const comSombra = s.boxShadow && s.boxShadow !== 'none'; return comOutline || comSombra ? 'ok' : 'SEM FOCO VISÍVEL em ' + a.tagName + '#' + a.id + '.' + a.className; });
  const percorrer = async (max, seletorFim) => { const vistos = []; for (let i = 0; i < max; i++) { await pg.keyboard.press('Tab'); const info = await pg.evaluate(() => { const a = document.activeElement; return a ? (a.id || a.tagName + ':' + (a.textContent || '').trim().slice(0, 20)) : ''; }); vistos.push(info); const f = await focoVisivel(); if (f === 'nenhum') break; /* o foco saiu da página (barra do navegador): fim do ciclo */ assert.strictEqual(f, 'ok', f + ' (Tab ' + (i + 1) + ')'); if (seletorFim && await pg.evaluate(s => document.activeElement && document.activeElement.matches(s), seletorFim)) break; } return vistos; };
  await t('inscrição: dá para chegar a todos os campos só com Tab, com foco sempre visível', async () => {
    await pg.goto(S.B + '/inscricao/'); await pg.waitForSelector('#formCard:not(.oculto)'); const v = await percorrer(25, '#enviar');
    for (const id of ['nome', 'periodo', 'matricula', 'email', 'email2', 'enviar']) assert(v.includes(id), 'campo ' + id + ' inalcançável por teclado: ' + v.join(','));
    assert(v.indexOf('nome') < v.indexOf('matricula') && v.indexOf('matricula') < v.indexOf('email') && v.indexOf('email') < v.indexOf('enviar'), 'ordem de foco lógica');
    assert(!v.includes('campo_extra'), 'campo-isca não recebe foco do teclado');
  });
  await t('painel: login com Enter, abas por teclado, confirmação prende o foco e Esc fecha devolvendo o foco', async () => {
    await pg.goto(S.B + '/admin/'); await pg.focus('#operador'); await pg.keyboard.type('Lilian'); await pg.keyboard.press('Tab'); await pg.keyboard.type('senhaForte123'); await pg.keyboard.press('Enter');
    await pg.waitForSelector('#app:not(.oculto)'); await pg.waitForSelector('.kpi');
    await pg.focus('#t-inscritos'); await pg.keyboard.press('Enter'); await pg.waitForSelector('#p-inscritos:not(.oculto)'); await pg.waitForSelector('#resBusca .item');
    await pg.focus('#t-inicio'); await pg.keyboard.press('Enter'); await pg.waitForSelector('text=Fechar inscrições');
    await pg.focus('text=Fechar inscrições'); await pg.keyboard.press('Enter'); await pg.waitForSelector('#dlg[open]');
    const dentro = await pg.evaluate(() => document.getElementById('dlg').contains(document.activeElement)); assert(dentro, 'foco foi para dentro da caixa de confirmação');
    for (let i = 0; i < 6; i++) { await pg.keyboard.press('Tab'); assert(await pg.evaluate(() => { const a = document.activeElement, d = document.getElementById('dlg'); return a === document.body || d.contains(a); }), 'foco escapou da caixa para a página (Tab ' + (i + 1) + ')') /* body = foco na barra do navegador, não na página */; }
    await pg.keyboard.press('Escape'); await pg.waitForSelector('#dlg:not([open])', { state: 'attached' });
    assert.strictEqual(S.env.ctx.getPublicConfig_().inscricoesAbertas, true, 'Esc cancela sem fechar as inscrições');
  });
  await t('painel: todas as abas e botões principais têm foco visível', async () => {
    for (const aba of ['atividades', 'registro', 'dados']) { await pg.focus('#t-' + aba); await pg.keyboard.press('Enter'); await pg.waitForSelector('#p-' + aba + ':not(.oculto)'); const f = await focoVisivel(); assert.strictEqual(f, 'ok', f); }
    await pg.focus('#t-dados'); await pg.keyboard.press('Enter'); await pg.waitForSelector('#btnTrocarPin'); await pg.focus('#btnTrocarPin'); assert.strictEqual(await focoVisivel(), 'ok');
  });
  await t('tela do QR: ampliar e fechar por teclado (Esc) e botões alcançáveis', async () => {
    const tk = S.env.ctx.readAll_('Inscritos')[0].token; await pg.goto(S.B + '/inscricao/qr.html?t=' + tk); await pg.waitForSelector('#ok:not(.oculto)');
    await pg.focus('#btnAmpliar'); await pg.keyboard.press('Enter'); await pg.waitForSelector('#dlgQr[open]'); assert(await pg.evaluate(() => document.getElementById('dlgQr').contains(document.activeElement)), 'foco dentro do QR ampliado');
    await pg.keyboard.press('Escape'); await pg.waitForSelector('#dlgQr:not([open])', { state: 'attached' });
    await pg.goto(S.B + '/inscricao/qr.html?t=' + tk); await pg.waitForSelector('#ok:not(.oculto)');
    const v = await percorrer(12, null); assert(v.includes('btnAmpliar') && v.some(x => /Baixar/.test(x)), 'botões alcançáveis: ' + v.join(','));
  });
  await br.close(); S.srv.close(); console.log(`\n${ok} verificação(ões) de teclado ok`);
})();
