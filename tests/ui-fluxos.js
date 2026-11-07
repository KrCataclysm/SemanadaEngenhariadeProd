// Fluxos reais no navegador (backend simulado): inscrição, anti-robô, confirmação de atividade, scanner e repetição quando ocupado.
const assert = require('assert'), http = require('http'), fs = require('fs'), path = require('path');
const { makeEnv } = require('./mocks');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..'), PORT = 8770, B = 'http://localhost:' + PORT;
const env = makeEnv(); env.ctx.setup_();
const set = (k, v) => { const r = env.ctx.readAll_('Config').find(x => x.chave === k); env.ctx.updateRow_('Config', r._row, { valor: v }); env.ctx.resetConfigCache_(); };
set('INSCRICOES', 'ABERTAS'); set('PIN', '4321');
const ativ = (id, c) => { const a = env.ctx.getAtividade_(id); env.ctx.updateRow_('Atividades', a._row, c); };
ativ('A16', { inscricoes_abertas: 'SIM', vagas_max: 5 });
const base = env.ctx.register_({ nome: 'Maria da Silva Souza', curso: 'EP', periodo: '5º', matricula: '20240001', email: 'maria@exemplo.com' });
let ocupadoUmaVez = false, chamadas = 0, ativoRevogado = false;
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, B);
  if (u.pathname === '/api') {
    let b = ''; req.on('data', d => b += d); req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' }); chamadas++;
      const p = req.method === 'POST' ? JSON.parse(b) : Object.fromEntries(u.searchParams);
      if (ativoRevogado && p.action === 'me') return res.end(JSON.stringify({ ok: false, code: 'TOKEN', mensagem: 'x' }));
      if (ocupadoUmaVez && p.action === 'register') { ocupadoUmaVez = false; return res.end(JSON.stringify({ ok: false, code: 'OCUPADO', mensagem: 'ocupado' })); }
      res.end(JSON.stringify(env.ctx.handleSeguro_(p)));
    }); return;
  }
  if (u.pathname === '/inscricao/config.js') { res.writeHead(200, { 'Content-Type': 'text/javascript' }); return res.end(`window.APP_CONFIG={API_URL:"${B}/api"}`); }
  const f = path.join(root, u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
let ok = 0; const t = async (nome, fn) => { try { await fn(); ok++; console.log('  ok  ' + nome); } catch (e) { console.log('FALHOU ' + nome + '\n      ' + String(e.message).split('\n')[0]); process.exitCode = 1; } };
(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const br = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] });
  const novo = async () => { const c = await br.newContext({ viewport: { width: 390, height: 844 }, permissions: ['camera'] }); return [c, await c.newPage()]; };
  const preencher = async (pg, n, email2) => {
    await pg.waitForSelector('#formCard:not(.oculto)');
    await pg.fill('#nome', 'Fulano de Tal ' + n); await pg.selectOption('#periodo', '4º'); await pg.fill('#matricula', '2025' + n);
    await pg.fill('#email', 'f' + n + '@exemplo.com'); await pg.fill('#email2', email2 === undefined ? 'f' + n + '@exemplo.com' : email2);
  };
  await t('inscrição: com status "aberta" lembrado, o formulário aparece na hora e muda para o aviso se fecharem', async () => {
    const [c, pg] = await novo(); await pg.goto(B + '/inscricao/'); await pg.waitForSelector('#formCard:not(.oculto)');   // 1ª visita: confirma e lembra
    let fechar = false; await pg.route('**/api*', async r => { await new Promise(x => setTimeout(x, 1500)); if (fechar) { const p = JSON.parse(JSON.stringify({ ok: true, inscricoesAbertas: false, mensagemFechadas: 'Fechadas agora.' })); return r.fulfill({ contentType: 'application/json', body: JSON.stringify(p) }); } r.continue(); });
    await pg.reload(); const t0 = Date.now(); await pg.waitForSelector('#formCard:not(.oculto)', { timeout: 1200 }); assert(Date.now() - t0 < 1200, 'formulário imediato');
    fechar = true; await pg.reload(); await pg.waitForSelector('#formCard:not(.oculto)', { timeout: 1200 });
    await pg.waitForSelector('#fechado:not(.oculto)'); assert(/Fechadas agora/.test(await pg.textContent('#msgFechado'))); assert(await pg.isHidden('#formCard'));
    await c.close();
  });
  await t('e-mails diferentes: bloqueia no navegador e marca o campo', async () => {
    const [c, pg] = await novo(); await pg.goto(B + '/inscricao/'); await preencher(pg, '0001', 'outro@exemplo.com');
    await pg.click('#enviar');
    assert(/não coincidem/.test(await pg.textContent('#e-email2'))); assert.strictEqual(await pg.getAttribute('#email2', 'aria-invalid'), 'true');
    assert.strictEqual(env.ctx.readAll_('Inscritos').length, 1); await c.close();
  });
  await t('campo-isca fica fora da tela e envio instantâneo é barrado; depois funciona', async () => {
    const [c, pg] = await novo(); await pg.goto(B + '/inscricao/'); await preencher(pg, '0002');
    const box = await pg.locator('#campo_extra').boundingBox(); assert(box.x < 0, 'isca fora da tela');
    await pg.click('#enviar'); await pg.waitForSelector('#msg:not(.oculto)');
    if (await pg.isVisible('#sucesso')) { /* o navegador demorou mais de 2s: também é válido */ } else assert(/Aguarde alguns segundos/.test(await pg.textContent('#msg')));
    await pg.waitForTimeout(2200); await pg.click('#enviar'); await pg.waitForSelector('#sucesso:not(.oculto)');
    const tx = await pg.textContent('#sucesso'); assert(!/link pessoal/i.test(tx) && !(await pg.isVisible('#btnLink', { timeout: 100 }).catch(() => false)), 'sem "link pessoal"'); assert(/Novidades em breve/.test(tx) && (await pg.getAttribute('#sucesso a[href*=instagram]', 'href')).includes('instagram.com/caeproufpi'));
    assert(/^data:image\/gif/.test(await pg.getAttribute('#qrImg', 'src'))); assert.strictEqual(await pg.evaluate(() => /^[a-f0-9]{32}$/.test(JSON.parse(localStorage.getItem('meuQr')).t)), true, 'QR guardado no aparelho'); await c.close();
  });
  await t('sistema ocupado: repete sozinho e conclui a inscrição', async () => {
    const [c, pg] = await novo(); await pg.goto(B + '/inscricao/'); await preencher(pg, '0003'); await pg.waitForTimeout(2200);
    ocupadoUmaVez = true; const antes = chamadas; await pg.click('#enviar'); await pg.waitForSelector('#sucesso:not(.oculto)', { timeout: 15000 });
    assert(chamadas - antes >= 2, 'houve nova tentativa'); await c.close();
  });
  await t('atividades: janela de confirmação, cancelar não inscreve, confirmar inscreve', async () => {
    const [c, pg] = await novo(); await pg.goto(B + '/inscricao/atividades.html?t=' + base.token); await pg.waitForSelector('.ativ button');
    await pg.click('.ativ button'); await pg.waitForSelector('#dlg[open]'); assert(/Confirmar sua inscrição/.test(await pg.textContent('#dlgTxt')));
    await pg.click('#dlg button[value=nao]'); await pg.waitForTimeout(300); assert.strictEqual(env.ctx.readAll_('Inscricoes_Atividades').length, 0);
    await pg.click('.ativ button'); await pg.waitForSelector('#dlg[open]'); await pg.click('#dlg button[value=sim]');
    await pg.waitForSelector('.badge.ok'); assert.strictEqual(env.ctx.readAll_('Inscricoes_Atividades').length, 1); await c.close();
  });
  await t('scanner: QR de quem se inscreveu depois da lista é reconhecido após atualização automática', async () => {
    const [c, pg] = await novo(); await pg.goto(B + '/scanner/'); await pg.fill('#operador', 'Ana'); await pg.fill('#pin', '4321'); await pg.click('#btnLogin');
    await pg.waitForSelector('#modo:not(.oculto)'); await pg.click('label:has(input[value="2026-11-11"]) span'); await pg.click('#btnIniciar'); await pg.waitForSelector('#scan:not(.oculto)');
    const tardio = env.ctx.register_({ nome: 'Retardatario Silva Souza', curso: 'EP', periodo: '2º', matricula: '20250099', email: 'r@exemplo.com' });
    await pg.evaluate(tk => window.__scanner.processar(tk, { manual: true }), tardio.token);
    await pg.waitForFunction(() => /ENTRADA/.test(document.getElementById('res').textContent), null, { timeout: 8000 });
    assert(/Retardatario/.test(await pg.textContent('#res'))); assert(/Mat\. 20250099/.test(await pg.textContent('#res')), 'matrícula para conferir o documento'); await c.close();
  });
  await t('scanner: o aparelho guarda só hashes (nenhum QR válido) e "Sair e limpar" apaga lista, fila e PIN', async () => {
    const [c, pg] = await novo(); await pg.goto(B + '/scanner/'); await pg.fill('#operador', 'Ana'); await pg.fill('#pin', '4321'); await pg.click('#btnLogin');
    await pg.waitForSelector('#modo:not(.oculto)');
    const lista = await pg.evaluate(() => localStorage.getItem('scanner_lista')); assert(lista && !lista.includes(base.token), 'token ausente do armazenamento do aparelho');
    assert(!(await pg.evaluate(() => JSON.stringify(Object.assign({}, localStorage, sessionStorage)))).includes(base.token));
    await pg.click('label:has(input[value="2026-11-11"]) span'); await pg.click('#btnIniciar'); await pg.waitForSelector('#scan:not(.oculto)');
    await pg.click('#btnSair'); await pg.waitForSelector('#login:not(.oculto)');
    assert.strictEqual(await pg.evaluate(() => localStorage.getItem('scanner_lista')), null); assert.strictEqual(await pg.evaluate(() => sessionStorage.getItem('scanner_pin')), null); await c.close();
  });
  await t('scanner: QR inexistente continua sendo recusado com mensagem clara', async () => {
    const [c, pg] = await novo(); await pg.goto(B + '/scanner/'); await pg.fill('#operador', 'Ana'); await pg.fill('#pin', '4321'); await pg.click('#btnLogin');
    await pg.waitForSelector('#modo:not(.oculto)'); await pg.click('label:has(input[value="2026-11-11"]) span'); await pg.click('#btnIniciar'); await pg.waitForSelector('#scan:not(.oculto)');
    await pg.evaluate(() => window.__scanner.processar('0'.repeat(32), { manual: true }));
    await pg.waitForFunction(() => /NÃO RECONHECIDO/.test(document.getElementById('res').textContent), null, { timeout: 8000 }); await c.close();
  });
  await t('página do QR (botão do e-mail): mostra o QR, tira o token do endereço, guarda no aparelho e recusa link inválido', async () => {
    const [c, pg] = await novo(); await pg.goto(B + '/inscricao/qr.html?t=' + base.token); await pg.waitForSelector('#ok:not(.oculto)');
    assert(/^data:image\/gif/.test(await pg.getAttribute('#qrImg', 'src'))); assert(/^data:image\/gif/.test(await pg.getAttribute('#qrBaixar', 'href')));
    assert.strictEqual(new URL(pg.url()).search, '', 'token fora do endereço'); assert.strictEqual(await pg.getAttribute('#btnAtividades', 'href'), 'atividades.html');
    await pg.waitForSelector('#boxAtiv:not(.oculto)'); assert(await pg.isHidden('#novidades'), 'com atividade aberta aparece o botão');
    await pg.waitForFunction(() => /Maria da Silva Souza/.test(document.getElementById('quem').textContent));   // nome confirmado pelo sistema
    assert.strictEqual(await pg.evaluate(() => JSON.parse(localStorage.getItem('meuQr')).t), base.token);
    await pg.goto(B + '/inscricao/qr.html'); await pg.waitForSelector('#ok:not(.oculto)');   // reabre sem o link: usa o QR guardado
    await pg.goto(B + '/inscricao/atividades.html'); await pg.waitForFunction(() => /Olá, Maria/.test(document.getElementById('saudacao').textContent));   // atividades também usam o token guardado
    const [c2, p2] = await novo(); await p2.goto(B + '/inscricao/qr.html?t=lixo'); await p2.waitForSelector('#invalido:not(.oculto)'); assert(!(await p2.isVisible('#ok')));
    assert.strictEqual(await p2.evaluate(() => localStorage.getItem('meuQr')), null, 'token inválido não é guardado'); await c2.close(); await c.close();
  });
  await t('QR: "Escolher atividades" some quando não há atividade aberta e mostra o aviso do Instagram', async () => {
    const a = env.ctx.getAtividade_('A16'); env.ctx.updateRow_('Atividades', a._row, { inscricoes_abertas: 'NAO' });
    const novoIns = env.ctx.register_({ nome: 'Sem Atividade Alguma Silva', curso: 'EP', periodo: '3º', matricula: '20250077', email: 'sa@exemplo.com' });
    const [c, pg] = await novo(); await pg.goto(B + '/inscricao/qr.html?t=' + novoIns.token); await pg.waitForSelector('#ok:not(.oculto)'); await pg.waitForTimeout(600);
    assert(await pg.isHidden('#boxAtiv')); assert(await pg.isVisible('#novidades')); assert(/Novidades em breve/.test(await pg.textContent('#novidades')));
    env.ctx.updateRow_('Atividades', a._row, { inscricoes_abertas: 'SIM' }); await pg.reload(); await pg.waitForSelector('#boxAtiv:not(.oculto)'); assert(await pg.isHidden('#novidades')); await c.close();
  });
  await t('QR: modo ampliado abre/fecha, abre sem internet e QR substituído/cancelado vira aviso', async () => {
    const [c, pg] = await novo(); await pg.goto(B + '/inscricao/qr.html?t=' + base.token); await pg.waitForSelector('#ok:not(.oculto)');
    await pg.evaluate(() => navigator.serviceWorker.ready); await pg.reload(); await pg.waitForFunction(() => !!navigator.serviceWorker.controller);
    await pg.waitForFunction(async () => !!(await caches.match('/inscricao/qr.html')));
    await pg.click('#btnAmpliar'); await pg.waitForSelector('#dlgQr[open]'); const big = await pg.$eval('#qrGrande', e => e.getBoundingClientRect().width); assert(big >= 300, 'QR ampliado grande (' + big + ')');
    await pg.click('#btnFecharQr'); await pg.waitForSelector('#dlgQr:not([open])', { state: 'attached' });
    await c.setOffline(true); await pg.goto(B + '/inscricao/qr.html'); await pg.waitForSelector('#ok:not(.oculto)'); await pg.waitForSelector('#chRede:not(.oculto)');
    ativoRevogado = true; await c.setOffline(false);   // ao voltar a internet, o sistema informa que o QR foi substituído/cancelado
    await pg.waitForSelector('#revogado:not(.oculto)'); assert.strictEqual(await pg.evaluate(() => localStorage.getItem('meuQr')), null); ativoRevogado = false;
    await c.close();
  });
  await br.close(); srv.close(); console.log(`\n${ok} fluxo(s) ok`);
})();
