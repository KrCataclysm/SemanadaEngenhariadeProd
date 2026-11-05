// Fluxos reais do painel /admin/ no navegador (backend simulado).
const assert = require('assert'), http = require('http'), fs = require('fs'), path = require('path');
const { makeEnv } = require('./mocks');
const { chromium } = require('playwright');
const root = path.join(__dirname, '..'), PORT = 8771, B = 'http://localhost:' + PORT;
const env = makeEnv(); env.ctx.setup_();
const set = (k, v) => { const r = env.ctx.readAll_('Config').find(x => x.chave === k); env.ctx.updateRow_('Config', r._row, { valor: v }); env.ctx.resetConfigCache_(); };
set('INSCRICOES', 'ABERTAS'); set('PIN', '4321'); set('PIN_ADMIN', 'senhaForte123');
const reg = n => env.ctx.register_({ nome: 'Pessoa Teste ' + n, curso: 'Engenharia de Produção', periodo: '5º', matricula: '2024000' + n, email: 'p' + n + '@exemplo.com' });
const pessoas = [1, 2, 3, 4].map(reg);
const a16 = env.ctx.getAtividade_('A16'); env.ctx.updateRow_('Atividades', a16._row, { vagas_max: 2, inscricoes_abertas: 'SIM' });
pessoas.forEach(p => env.ctx.enroll_({ token: p.token, atividadeId: 'A16' }));       // 2 confirmados, 2 na fila
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const srv = http.createServer((req, res) => {
  const u = new URL(req.url, B);
  if (u.pathname === '/api') { let b = ''; req.on('data', d => b += d); req.on('end', () => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(env.ctx.handleSeguro_(req.method === 'POST' ? JSON.parse(b) : Object.fromEntries(u.searchParams)))); }); return; }
  if (u.pathname === '/inscricao/config.js') { res.writeHead(200, { 'Content-Type': 'text/javascript' }); return res.end(`window.APP_CONFIG={API_URL:"${B}/api"}`); }
  const f = path.join(root, u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname);
  if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
});
let ok = 0; const t = async (nome, fn) => { try { await fn(); ok++; console.log('  ok  ' + nome); } catch (e) { console.log('FALHOU ' + nome + '\n      ' + String(e.stack || e.message).split('\n').slice(0, 3).join('\n      ')); process.exitCode = 1; } };
(async () => {
  await new Promise(r => srv.listen(PORT, r));
  const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 1100, height: 900 }, acceptDownloads: true }); const pg = await ctx.newPage();
  pg.setDefaultTimeout(8000); const erros = []; pg.on('pageerror', e => erros.push(String(e))); pg.on('console', m => m.type() === 'error' && erros.push(m.text()));
  const entrar = async (senha) => { await pg.fill('#operador', 'Rayan'); await pg.fill('#senha', senha); await pg.click('#btnLogin'); };
  const aba = async n => { await pg.click('#t-' + n); await pg.waitForTimeout(250); };
  await pg.goto(B + '/admin/');
  await t('senha errada e PIN do scanner são recusados; senha certa entra', async () => {
    await entrar('4321'); await pg.waitForSelector('#toast:not(.oculto)'); assert(/Senha incorreta/.test(await pg.textContent('#toast')));
    await entrar('senhaForte123'); await pg.waitForSelector('#app:not(.oculto)'); assert(/Rayan/.test(await pg.textContent('#quem')));
  });
  await t('início: indicadores e situação das inscrições', async () => {
    await pg.waitForSelector('.kpi'); const txt = await pg.textContent('#p-inicio');
    assert(/4\s*inscritos ativos/.test(txt)); assert(/ABERTAS/.test(txt));
  });
  await t('fechar e reabrir inscrições pelo painel (com confirmação)', async () => {
    await pg.click('text=Fechar inscrições'); await pg.waitForSelector('#dlg[open]'); await pg.click('#dlg button[value=sim]');
    await pg.waitForSelector('text=Abrir inscrições'); assert.strictEqual(env.ctx.handleSeguro_({ action: 'config' }).inscricoesAbertas, false);
    await pg.click('text=Abrir inscrições'); await pg.waitForSelector('#dlg[open]'); await pg.click('#dlg button[value=sim]');
    await pg.waitForSelector('text=Fechar inscrições'); assert.strictEqual(env.ctx.handleSeguro_({ action: 'config' }).inscricoesAbertas, true);
  });
  await t('inscritos: busca, ficha, edição validada e salvamento', async () => {
    await aba('inscritos'); await pg.fill('#q', 'pessoa teste 1'); await pg.waitForSelector('#resBusca .item');
    await pg.click('#resBusca .item button'); await pg.waitForSelector('#formFicha');
    await pg.fill('#f-matricula', '20240002'); await pg.click('#formFicha button[type=submit]');
    await pg.waitForFunction(() => /já cadastrada/.test(document.getElementById('e-f-matricula').textContent)); assert.strictEqual(await pg.getAttribute('#f-matricula', 'aria-invalid'), 'true');
    await pg.fill('#f-matricula', '20240001'); await pg.fill('#f-nome', 'Pessoa Renomeada Silva'); await pg.click('#formFicha button[type=submit]');
    await pg.waitForFunction(() => /Dados salvos/.test(document.getElementById('toast').textContent));
    assert.strictEqual(env.ctx.readAll_('Inscritos').find(x => x.matricula === '20240001').nome, 'Pessoa Renomeada Silva');
    assert(env.ctx.readAll_('Log').some(l => l.evento === 'admin_editar' && /Rayan/.test(l.detalhe)));
  });
  await t('ficha: cancelar inscrição libera a vaga e promove a fila; reativar', async () => {
    await pg.click('text=Cancelar inscrição no evento'); await pg.waitForSelector('#dlg[open]'); await pg.click('#dlg button[value=sim]');
    await pg.waitForFunction(() => /promovidas da fila: 1/.test(document.getElementById('toast').textContent));
    assert.strictEqual(env.ctx.readAll_('Inscritos').find(x => x.matricula === '20240001').status, 'CANCELADA');
    await pg.click('text=Reativar inscrição'); await pg.waitForFunction(() => /reativada/.test(document.getElementById('toast').textContent));
    assert.strictEqual(env.ctx.readAll_('Inscritos').find(x => x.matricula === '20240001').status, 'ATIVA');
  });
  await t('atividades: aumentar vagas promove a fila; ver inscritos; baixar CSV', async () => {
    await aba('atividades'); await pg.waitForSelector('#max-A16');
    await pg.fill('#max-A16', '4'); await pg.click('.card:has(#max-A16) button:has-text("Salvar")');
    await pg.waitForFunction(() => /Atividade atualizada/.test(document.getElementById('toast').textContent));
    assert.strictEqual(env.ctx.readAll_('Inscricoes_Atividades').filter(r => r.atividade_id === 'A16' && r.status === 'CONFIRMADA').length, 3);   // 1 cancelado e reativado não volta
    await pg.click('.card:has(#max-A16) button:has-text("Ver inscritos")'); await pg.waitForSelector('.card:has(#max-A16) table');
    const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('.card:has(#max-A16) button:has-text("Baixar CSV")')]);
    const txt = fs.readFileSync(await dl.path(), 'utf8'); assert(txt.startsWith('﻿nome;matricula;email;situacao;posicao_fila;presenca')); assert(/CONFIRMADA/.test(txt));
  });
  await t('atividades: valor inválido de vagas é recusado com mensagem', async () => {
    await pg.fill('#min-A16', '9999'); await pg.evaluate(() => { document.getElementById('max-A16').type = 'text'; }); await pg.fill('#max-A16', 'abc');
    await pg.click('.card:has(#max-A16) button:has-text("Salvar")'); await pg.waitForFunction(() => /número inteiro/.test(document.getElementById('toast').textContent));
  });
  await t('alertas e e-mails: lista e reenvio de pendentes', async () => {
    env.state.quota = 0; reg(9); env.state.quota = 100; await aba('alertas');
    await pg.waitForSelector('text=Reenviar pendentes agora'); assert(/COTA_EMAIL/.test(await pg.textContent('#p-alertas')), 'alertas na tela: ' + (await pg.textContent('#p-alertas')).slice(0, 300) + ' | alertas na planilha: ' + JSON.stringify(env.ctx.readAll_('Alertas').map(a => a.tipo)));
    await pg.click('text=Reenviar pendentes agora'); await pg.waitForFunction(() => /e-mail\(s\) enviado/.test(document.getElementById('toast').textContent));
  });
  await t('dados: CSV sem token e com proteção contra fórmula', async () => {
    const r = env.ctx.readAll_('Inscritos')[1]; env.ctx.updateRow_('Inscritos', r._row, { nome: '=HYPERLINK("http://x","clique")' });   // simula edição direta na planilha
    await aba('dados'); const [dl] = await Promise.all([pg.waitForEvent('download'), pg.click('.item:has-text("Inscritos"):not(:has-text("atividades")) button')]);
    const txt = fs.readFileSync(await dl.path(), 'utf8');
    assert(!/token/.test(txt.split('\r\n')[0])); assert(!txt.includes(pessoas[0].token)); assert(txt.includes("\"'=HYPERLINK") || txt.includes("'=HYPERLINK"));
  });
  await t('inscritos: lista direta ordenada por período (agrupada) e filtro instantâneo', async () => {
    env.ctx.register_({ nome: 'Zeca Formado Silva', curso: 'Engenharia de Produção', periodo: 'Formado', matricula: '20249991', email: 'z@exemplo.com' });
    env.ctx.register_({ nome: 'Ana Segundo Lima', curso: 'Engenharia de Produção', periodo: '2º', matricula: '20249992', email: 'a@exemplo.com' });
    env.ctx.register_({ nome: 'Bia Décimo Souza', curso: 'Engenharia de Produção', periodo: '10º', matricula: '20249993', email: 'b@exemplo.com' });
    await aba('inicio'); await aba('inscritos'); await pg.fill('#q', ''); await pg.waitForSelector('#resBusca .item');
    const grupos = await pg.$$eval('#resBusca h2.grupo', e => e.map(x => x.textContent.split(' — ')[0]));
    assert.deepStrictEqual(grupos, ['2º', '5º', '10º', 'Formado'], grupos.join(','));
    assert(/ordenados por período/.test(await pg.textContent('#contaLista')));
    await pg.fill('#q', 'decimo'); await pg.waitForFunction(() => document.querySelectorAll('#resBusca .item').length === 1);
    assert(/Bia Décimo/.test(await pg.textContent('#resBusca .item'))); await pg.fill('#q', '');
    await pg.waitForFunction(() => document.querySelectorAll('#resBusca .item').length > 3);
  });
  await t('ficha: gerar novo QR Code (com confirmação) invalida o anterior', async () => {
    await pg.fill('#q', 'ana segundo'); await pg.waitForFunction(() => document.querySelectorAll('#resBusca .item').length === 1);
    const antes = env.ctx.readAll_('Inscritos').find(x => x.matricula === '20249992').token;
    await pg.click('#resBusca .item button'); await pg.waitForSelector('#formFicha');
    await pg.click('text=Gerar novo QR Code'); await pg.waitForSelector('#dlg[open]'); assert(/deixará de valer/.test(await pg.textContent('#dlgTxt')));
    await pg.click('#dlg button[value=nao]'); assert.strictEqual(env.ctx.readAll_('Inscritos').find(x => x.matricula === '20249992').token, antes, 'cancelar não muda');
    await pg.click('text=Gerar novo QR Code'); await pg.waitForSelector('#dlg[open]'); await pg.click('#dlg button[value=sim]');
    await pg.waitForFunction(() => /Novo QR Code gerado/.test(document.getElementById('toast').textContent));
    const depois = env.ctx.readAll_('Inscritos').find(x => x.matricula === '20249992').token; assert(depois !== antes);
    assert.strictEqual(env.ctx.getMe_({ token: antes }).code, 'TOKEN');
  });
  await t('sair encerra a sessão e volta ao login', async () => {
    await pg.click('#btnSair'); await pg.waitForSelector('#login:not(.oculto)'); assert.strictEqual(await pg.evaluate(() => sessionStorage.getItem('adm')), null);
  });
  await t('sem erros de script/CSP durante todo o uso', async () => { assert.deepStrictEqual(erros, [], erros.join(' | ')); });
  await br.close(); srv.close(); console.log(`\n${ok} fluxo(s) do painel ok`);
})();
