// O e-mail de confirmação não pode estourar a largura em telas estreitas (280 a 1000 px) e o QR precisa continuar visível.
const assert = require('assert');
const { makeEnv } = require('./mocks'); const { chromium } = require('playwright');
const env = makeEnv(); env.ctx.setup_();
const c = env.ctx.readAll_('Config').find(x => x.chave === 'INSCRICOES'); env.ctx.updateRow_('Config', c._row, { valor: 'ABERTAS' }); env.ctx.resetConfigCache_();
env.ctx.register_({ nome: 'Maria Aparecida de Albuquerque Nascimento Souza', curso: 'Engenharia de Produção', periodo: '5º', matricula: '20240001', email: 'maria.aparecida.albuquerque@exemplo.com' });
const insc = env.ctx.readAll_('Inscritos')[0];
const b64 = b => Buffer.from(b.bytes).toString('base64');
const html = env.ctx.buildEmail_(insc, 'CONFIRMACAO').html.replace('cid:qr', 'data:image/gif;base64,' + b64(env.ctx.qrBlob_(insc.token))).replace('cid:logo', 'data:image/png;base64,' + b64(env.ctx.logoBlob_()));
(async () => {
  const br = await chromium.launch(); const falhas = [];
  for (const w of [280, 320, 360, 390, 430, 600, 1000]) {
    const pg = await (await br.newContext({ viewport: { width: w, height: 800 } })).newPage();
    await pg.setContent('<meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0">' + html);
    const o = await pg.evaluate(() => { const W = innerWidth, q = document.querySelector('img[alt^="QR"]').getBoundingClientRect(); const bad = []; document.querySelectorAll('body *').forEach(x => { if (x.getBoundingClientRect().right > W + 1) bad.push(x.tagName); }); return { sw: document.documentElement.scrollWidth, W, bad, qr: Math.round(q.width) }; });
    if (o.sw > o.W || o.bad.length) falhas.push(`${w}px: estouro (${o.sw}) ${o.bad.slice(0, 3)}`);
    if (o.qr < 150) falhas.push(`${w}px: QR pequeno demais (${o.qr}px)`);
  }
  await br.close(); assert.deepStrictEqual(falhas, [], falhas.join(' | ')); console.log('ok: e-mail sem estouro de 280 a 1000 px, QR >= 150px');
})();
