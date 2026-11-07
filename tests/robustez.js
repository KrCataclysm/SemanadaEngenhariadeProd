// Robustez e segurança da API: entradas malformadas, hostis ou gigantes não podem derrubar o sistema, vazar detalhes internos,
// poluir objetos nem corromper dados; textos com HTML/scripts ficam inofensivos no e-mail; ações de administrador exigem a senha.
const assert = require('assert');
const { makeEnv } = require('./mocks');
const e = makeEnv({ quota: 1e6 }); e.ctx.setup_();
const cfg = (k, v) => { const r = e.ctx.readAll_('Config').find(x => x.chave === k); e.ctx.updateRow_('Config', r._row, { valor: v }); e.ctx.resetConfigCache_(); };
cfg('INSCRICOES', 'ABERTAS'); cfg('PIN', '4321'); cfg('PIN_ADMIN', 'senhaForte123');
const base = e.ctx.register_({ nome: 'Pessoa Base Silva', curso: 'EP', periodo: '1º', matricula: '20240001', email: 'base@exemplo.com' });
const linhas = () => ['Inscritos', 'Inscricoes_Atividades', 'Portaria', 'Presenca_Atividades', 'Config', 'Atividades'].map(n => e.ctx.readAll_(n).length).join(',');
const post = corpo => { const out = e.ctx.doPost({ postData: { contents: corpo } }); return JSON.parse(out.s); };
const get = q => JSON.parse(e.ctx.doGet({ parameter: q }).s);
let n = 0, ok = 0; const t = (nome, f) => { try { f(); ok++; } catch (x) { console.log('FALHOU ' + nome + '\n      ' + String(x.message).split('\n').slice(0, 3).join('\n      ')); process.exitCode = 1; } n++; };
const semVazar = r => { const s = JSON.stringify(r); assert(!/\bat \S+ \(|Error:|TypeError|ReferenceError|stack|appscript\.js|node_modules/.test(s), 'vazou detalhe interno: ' + s.slice(0, 200)); };
const antes = linhas();

t('corpos inválidos: JSON quebrado, vazio, null, número, texto, lista', () => {
  for (const c of ['{ruim', '', 'null', '123', '"texto"', '[]', '[1,2]', 'true', '{"action":null}', '{"action":123}', '{"action":{"a":1}}', '{"action":["register"]}', '{"action":"nao_existe"}']) { const r = post(c); assert.strictEqual(r.ok, false, c); semVazar(r); assert(r.mensagem, 'sem mensagem para: ' + c); }
});
t('poluição de protótipo e chaves perigosas não afetam o sistema', () => {
  post('{"__proto__":{"polluido":true},"action":"register","nome":"A B"}'); post('{"constructor":{"prototype":{"polluido":true}},"action":"enroll"}'); post('{"action":"register","__proto__":{"admin":true}}');
  assert.strictEqual(({}).polluido, undefined); assert.strictEqual(Object.prototype.polluido, undefined);
});
t('inscrição com tipos errados, textos gigantes e caracteres estranhos é recusada sem erro interno', () => {
  const lixos = [{ nome: { a: 1 } }, { nome: ['A', 'B'] }, { nome: 'A'.repeat(1e6) + ' B' }, { email: 'a@b.c'.repeat(5000) }, { matricula: '1'.repeat(5000) }, { nome: 'Fulano\u0000 Silva‮', curso: '\u0000' }, { nome: 123456, matricula: 99999999, email: 5 },
    { nome: 'João Silva', curso: null, periodo: undefined }, { nome: true, curso: false }, { campo_extra: 'x' }, { tempoMs: 'abc' }, { tempoMs: -5 }];
  lixos.forEach(l => { const r = post(JSON.stringify(Object.assign({ action: 'register', nome: 'Pessoa Teste Silva', curso: 'EP', periodo: '1º', matricula: '20249999', email: 'ok@exemplo.com' }, l))); semVazar(r); assert(typeof r.ok === 'boolean'); });
});
t('token e ids com tipos errados: me / enroll / scan não quebram e não revelam nada', () => {
  for (const tk of [null, undefined, 0, [], {}, '', 'x', 'g'.repeat(32), 'A'.repeat(32), '0'.repeat(100000), base.token.toUpperCase(), ' ' + base.token + ' x', [base.token], { toString: 1 }]) {
    const a = post(JSON.stringify({ action: 'me', token: tk })), b = post(JSON.stringify({ action: 'enroll', token: tk, atividadeId: 'A16' })); semVazar(a); semVazar(b);
    if (tk !== base.token) assert.strictEqual(a.ok, false, 'me aceitou token ' + String(JSON.stringify(tk)).slice(0, 40));
  }
  for (const id of [null, [], {}, 'A16; DROP', '../../etc', 'A16'.repeat(10000), 16]) semVazar(post(JSON.stringify({ action: 'enroll', token: base.token, atividadeId: id })));
});
t('scanner: PIN errado/tipos errados, lote gigante ou malformado', () => {
  for (const pin of [null, 0, [], {}, '', '4321 ', ['4321'], { toString: 1 }]) { const r = post(JSON.stringify({ action: 'scan_lista', pin })); semVazar(r); }
  const lote = itens => post(JSON.stringify({ action: 'scan_lote', pin: '4321', itens }));
  for (const itens of [null, 5, 'x', {}, [null], [1, 'a', []], [{}], [{ kind: 'scan' }], [{ kind: 'scan', modo: 'PORTARIA', h: 5 }], [{ kind: 'scan', modo: 'PORTARIA', dia: '2026-11-11', h: 'a'.repeat(64), ts: 'amanhã', clientId: { a: 1 } }], [{ kind: 'undo' }], [{ kind: 'undo', clientId: ['x'] }]]) { const r = lote(itens); semVazar(r); }
  const gigante = Array.from({ length: 5000 }, (_, i) => ({ kind: 'scan', modo: 'PORTARIA', dia: '2026-11-11', h: 'b'.repeat(64), clientId: 'g' + i })); const r = lote(gigante); assert.strictEqual(r.ok, true); assert(r.resultados.length <= 50, 'lote limitado a 50 por chamada');
  const ts = [Date.now() + 1e12, -1e12, NaN, Infinity, '1e999', 0].map((x, i) => ({ kind: 'scan', modo: 'PORTARIA', dia: '2026-11-11', token: base.token, ts: x, clientId: 'ts' + i, operador: '=cmd|calc' + 'x'.repeat(500) }));
  const r2 = lote(ts); semVazar(r2); const lin = e.ctx.readAll_('Portaria').filter(x => /^ts\d$/.test(x.client_id)); lin.forEach(x => { assert(Math.abs(Number(x.ts) - Date.now()) < 37 * 3600e3, 'ts absurdo aceito: ' + x.ts); assert(!/^[=+\-@]/.test(String(x.operador)), 'operador com fórmula'); assert(String(x.operador).length <= 40); });
});
t('administrador: sem senha, com senha errada, PIN do scanner e tipos errados — nenhuma ação passa', () => {
  const acoes = ['admin_login', 'admin_resumo', 'admin_buscar', 'admin_lista', 'admin_ficha', 'admin_editar', 'admin_cancelar_inscrito', 'admin_reativar_inscrito', 'admin_reenviar_qr', 'admin_novo_qr', 'admin_inscrever', 'admin_atividade_set', 'admin_set_inscricoes', 'admin_set_pin', 'admin_backup', 'admin_tabela', 'admin_log', 'admin_duplicados', 'admin_alertas', 'admin_reprocessar'];
  const id = e.ctx.readAll_('Inscritos')[0].id; const estado = linhas();
  for (const pin of [undefined, null, '', '4321', 'errada', ['senhaForte123'], { a: 1 }, 123, true]) { e.props.PIN_BLOQ_ATE = '0'; e.props.ADMIN_BLOQ_ATE = '0'; e.props.PIN_FALHAS = '0'; e.props.ADMIN_FALHAS = '0'; acoes.forEach(a => { const r = post(JSON.stringify({ action: a, pin, operador: 'X', id, novoPin: '9999', valor: 'FECHADAS', campos: { nome: 'Hack' } })); assert.strictEqual(r.ok, false, `${a} aceitou pin ${JSON.stringify(pin)}`); semVazar(r); }); }
  assert.strictEqual(linhas(), estado, 'nada mudou'); assert.strictEqual(e.ctx.getConfig_().INSCRICOES, 'ABERTAS'); assert.strictEqual(e.ctx.getConfig_().PIN, '4321');
});
t('administrador com a senha certa e entradas hostis: recusa com mensagem, sem erro interno', () => {
  const adm = c => post(JSON.stringify(Object.assign({ pin: 'senhaForte123', operador: 'Lilian' }, c))); const id = e.ctx.readAll_('Inscritos')[0].id;
  const hostis = [{ action: 'admin_editar', id, campos: null }, { action: 'admin_editar', id, campos: 'x' }, { action: 'admin_editar', id, campos: { nome: { a: 1 }, email: ['x'], matricula: 5 } }, { action: 'admin_editar', id: ['x'], campos: {} }, { action: 'admin_atividade_set', id: 'A16', campos: { vagas_max: '-5', vagas_min: 'NaN', aberta: 'talvez' } },
    { action: 'admin_atividade_set', id: { a: 1 }, campos: {} }, { action: 'admin_buscar', q: { a: 1 } }, { action: 'admin_buscar', q: 'a'.repeat(1e6) }, { action: 'admin_ficha', id: null }, { action: 'admin_tabela', nome: '__proto__' }, { action: 'admin_tabela', nome: 'Config' }, { action: 'admin_tabela', nome: ['inscritos'] },
    { action: 'admin_set_inscricoes', valor: { a: 1 } }, { action: 'admin_set_pin', novoPin: { a: 1 } }, { action: 'admin_inscrever', id, atividadeId: ['A16'] }, { action: 'admin_login', operador: 'x'.repeat(1e5) }];
  hostis.forEach(h => { const r = adm(h); assert(typeof r.ok === 'boolean', JSON.stringify(h).slice(0, 80)); semVazar(r); });
  const tabs = ['Config'].map(nm => adm({ action: 'admin_tabela', nome: nm })); tabs.forEach(r => assert(!/senhaForte123|4321/.test(JSON.stringify(r)), 'exportação nunca inclui PINs'));
  for (const nm of ['inscritos', 'base', 'portaria']) { const r = adm({ action: 'admin_tabela', nome: nm }); if (r.ok) assert(!JSON.stringify(r).includes('token') || !r.headers.includes('token'), 'sem coluna de token em ' + nm); }
});
t('HTML/scripts em nome e curso ficam inofensivos no e-mail (escapados) e no painel (texto)', () => {
  const r = e.ctx.register_({ nome: '<img src=x onerror=alert(1)> Silva', curso: '"><script>alert(2)</script>', periodo: '1º', matricula: '20248888', email: 'xss@exemplo.com' }); assert.strictEqual(r.ok, true);
  const m = e.sent[e.sent.length - 1]; assert(!/<script|<img src=x/i.test(m.htmlBody.replace(/<img src="cid:[^>]*>/g, '')), 'HTML não escapado no e-mail'); assert(!/<[^>]*\sonerror\s*=/i.test(m.htmlBody), 'atributo de evento ativo no e-mail'); assert(m.htmlBody.includes('&lt;img'));
});
t('depois de tudo isso o sistema continua funcionando e os dados não foram corrompidos', () => {
  const r = e.ctx.register_({ nome: 'Pessoa Final Silva', curso: 'EP', periodo: '2º', matricula: '20240002', email: 'final@exemplo.com' }); assert.strictEqual(r.ok, true);
  assert.strictEqual(get({ action: 'config' }).inscricoesAbertas, true); assert.strictEqual(get({ action: 'versao' }).ok, true); assert.strictEqual(get({ action: 'scan_lista', pin: 'x' }).code, 'INVALIDO');
  const ins = e.ctx.readAll_('Inscritos'); assert.strictEqual(new Set(ins.map(i => i.matricula)).size, ins.length); assert(ins.every(i => /^[a-f0-9]{32}$/.test(i.token)));
  assert(antes.split(',')[4] === linhas().split(',')[4], 'aba Config intacta');
});
console.log(`${ok}/${n} verificações de robustez ok`);
