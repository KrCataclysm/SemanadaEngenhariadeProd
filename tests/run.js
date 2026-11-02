const assert = require('assert');
const { makeEnv } = require('./mocks');
let passed = 0, failed = 0;
function test(nome, fn) {
  try { fn(); passed++; console.log('  ok  ' + nome); }
  catch (e) { failed++; console.log('FALHOU ' + nome + '\n      ' + (e.stack || e).split('\n').slice(0, 4).join('\n      ')); }
}
function novo(opts) {
  const env = makeEnv(opts);
  env.ctx.setup_();
  env.setCfg = (k, v) => { const rows = env.ctx.readAll_('Config'); const r = rows.find(x => x.chave === k); env.ctx.updateRow_('Config', r._row, { valor: v }); env.ctx.resetConfigCache_(); };
  env.setCfg('SITE_URL', 'https://exemplo.github.io/semana');
  env.abrir = () => env.setCfg('INSCRICOES', 'ABERTAS');
  env.reg = (n, extra) => env.ctx.register_(Object.assign({ nome: 'Pessoa Teste ' + n, curso: 'Engenharia de Produção', periodo: '5º', matricula: '2024' + String(n).padStart(4, '0'), email: 'p' + n + '@exemplo.com' }, extra));
  env.ativ = (id, campos) => { const a = env.ctx.getAtividade_(id); env.ctx.updateRow_('Atividades', a._row, campos); };
  env.tabela = n => env.ctx.readAll_(n);
  env.insc = n => env.tabela('Inscritos').find(x => x.matricula === '2024' + String(n).padStart(4, '0'));
  env.token = n => env.insc(n).token;
  env.enroll = (n, at) => env.ctx.enroll_({ token: env.token(n), atividadeId: at });
  env.status = (n, at) => { const i = env.insc(n); const r = env.tabela('Inscricoes_Atividades').find(x => x.inscrito_id === i.id && x.atividade_id === at && x.status !== 'CANCELADA'); return r ? r.status + (r.posicao ? ':' + r.posicao : '') : null; };
  env.emailsDe = n => env.sent.filter(m => m.to === 'p' + n + '@exemplo.com');
  return env;
}

console.log('Setup');
test('cria todas as abas, configuração e 20 atividades', () => {
  const e = novo();
  ['Config', 'Atividades', 'Inscritos', 'Inscricoes_Atividades', 'Fila_Email', 'Alertas', 'Log'].forEach(n => assert(e.sheets[n], n));
  assert.strictEqual(e.tabela('Atividades').length, 20);
  assert.strictEqual(e.tabela('Config').find(x => x.chave === 'INSCRICOES').valor, 'FECHADAS');
});

console.log('Inscrição no evento');
test('inscrições fechadas são recusadas com texto formal', () => {
  const e = novo(); const r = e.reg(1);
  assert.strictEqual(r.ok, false); assert.strictEqual(r.code, 'FECHADAS'); assert(/CAEPRO/.test(r.mensagem));
  assert.strictEqual(e.tabela('Inscritos').length, 0);
});
test('validação de dados', () => {
  const e = novo(); e.abrir();
  const r = e.reg(1, { nome: 'Fulano', email: 'ruim', matricula: '1' });
  assert.strictEqual(r.code, 'INVALIDO'); assert(r.erros.nome && r.erros.email && r.erros.matricula);
});
test('inscrição válida cria registro, envia e-mail com QR inline e mede o tempo', () => {
  const e = novo(); e.abrir(); const r = e.reg(1);
  assert.strictEqual(r.ok, true); assert.strictEqual(r.status, 'CRIADA'); assert(/^[a-f0-9]{32}$/.test(r.token));
  const i = e.insc(1); assert.strictEqual(i.status, 'ATIVA'); assert.strictEqual(i.status_email, 'ENVIADO');
  assert.strictEqual(e.sent.length, 1);
  const m = e.sent[0];
  assert.strictEqual(m.subject, 'Semana de Engenharia de Produção — Sua inscrição está confirmada');
  assert(m.htmlBody.includes('cid:qr') && m.inlineImages.qr.bytes.length > 100);
  assert(m.htmlBody.includes('Semana de Engenharia de Produção') && m.htmlBody.includes('caeproufpi'));
  assert(m.htmlBody.includes('atividades.html?t=' + r.token));
  assert(e.tabela('Log').some(l => l.evento === 'email_enviado'));
  assert(r.mensagem.includes('pode demorar'));
});
test('duplicidade por matrícula: não revela token, reenvia ao e-mail cadastrado e alerta o organizador', () => {
  const e = novo(); e.abrir(); e.reg(1);
  const r = e.reg(1, { email: 'outro@exemplo.com' });
  assert.strictEqual(r.status, 'JA_INSCRITO'); assert.strictEqual(r.token, undefined);
  assert(r.mensagem.includes('p***@exemplo.com'));
  assert.strictEqual(e.tabela('Inscritos').length, 1);
  assert.strictEqual(e.emailsDe(1).length, 2); assert.strictEqual(e.sent.filter(m => m.to === 'outro@exemplo.com').length, 0);
  assert(e.tabela('Alertas').some(a => a.tipo === 'DUPLICIDADE'));
});
test('sem cota: inscrição fica PENDENTE só para o organizador; reenvio automático depois', () => {
  const e = novo({ quota: 0 }); e.abrir(); const r = e.reg(1);
  assert.strictEqual(r.ok, true); assert(!/pendente/i.test(r.mensagem));
  assert.strictEqual(e.insc(1).status_email, 'PENDENTE');
  assert(e.tabela('Alertas').some(a => a.tipo === 'COTA_EMAIL'));
  e.state.quota = 100; e.ctx.tick();
  assert.strictEqual(e.insc(1).status_email, 'ENVIADO');
  assert(e.sent.some(m => m.to === 'organizador@exemplo.com' && /alerta/.test(m.subject)), 'resumo ao organizador');
});
test('falha repetida vira ERRO e alerta o organizador', () => {
  const e = novo(); e.abrir(); e.state.failSend = true; e.reg(1);
  for (let i = 0; i < 6; i++) e.ctx.processOutbox_(10);
  assert.strictEqual(e.insc(1).status_email, 'ERRO');
  assert(e.tabela('Alertas').some(a => a.tipo === 'FALHA_EMAIL'));
});
test('resumo de alertas respeita intervalo de 30 min', () => {
  const e = novo(); e.abrir(); e.reg(1); e.reg(1);
  assert.strictEqual(e.ctx.sendAlertDigest_(), true);
  e.reg(1); assert.strictEqual(e.ctx.sendAlertDigest_(), false);
});

console.log('Atividades, vagas, conflito e fila');
function cenario() {
  const e = novo(); e.abrir(); for (let n = 1; n <= 5; n++) e.reg(n);
  e.ativ('A16', { vagas_max: 2, inscricoes_abertas: 'SIM' });
  e.ativ('A15', { vagas_max: 3, inscricoes_abertas: 'SIM' });
  return e;
}
test('atividade fechada e token inválido são recusados', () => {
  const e = novo(); e.abrir(); e.reg(1);
  assert.strictEqual(e.enroll(1, 'A16').code, 'FECHADA');
  assert.strictEqual(e.ctx.enroll_({ token: 'x', atividadeId: 'A16' }).code, 'TOKEN');
});
test('não permite duas atividades no mesmo dia e horário (minicurso × visita)', () => {
  const e = cenario();
  assert.strictEqual(e.enroll(1, 'A16').status, 'CONFIRMADA');
  const r = e.enroll(1, 'A15'); assert.strictEqual(r.code, 'CONFLITO'); assert(r.mensagem.includes('Visita técnica'));
});
test('conflito também vale para sobreposição parcial; horários que apenas se tocam não conflitam', () => {
  const e = cenario();
  e.ativ('A12', { inscricoes_abertas: 'SIM' }); e.ativ('A13', { inscricoes_abertas: 'SIM' }); // 15:00-16:30 e 16:30-17:30
  assert.strictEqual(e.enroll(1, 'A12').status, 'CONFIRMADA');
  assert.strictEqual(e.enroll(1, 'A13').status, 'CONFIRMADA');
  e.ativ('A13', { inicio: '16:00' }); e.ativ('A10', { inscricoes_abertas: 'SIM' });
  assert.strictEqual(e.enroll(2, 'A12').status, 'CONFIRMADA');
  assert.strictEqual(e.enroll(2, 'A13').code, 'CONFLITO');
});
test('vagas lotadas: fila com posição, e-mails de fila e alerta de vagas esgotadas', () => {
  const e = cenario();
  assert.strictEqual(e.enroll(1, 'A16').status, 'CONFIRMADA'); assert.strictEqual(e.enroll(2, 'A16').status, 'CONFIRMADA');
  const r3 = e.enroll(3, 'A16'), r4 = e.enroll(4, 'A16');
  assert.strictEqual(r3.status, 'FILA'); assert.strictEqual(r3.posicao, 1); assert.strictEqual(r4.posicao, 2);
  assert(e.tabela('Alertas').some(a => a.tipo === 'VAGAS_ESGOTADAS'));
  const m = e.emailsDe(4).pop(); assert(/fila de espera/.test(m.subject)); assert(m.htmlBody.includes('posição 2'));
  assert.strictEqual(e.enroll(3, 'A16').code, 'JA_INSCRITO');
});
test('cancelar vaga promove o primeiro da fila e avisa por e-mail', () => {
  const e = cenario();
  [1, 2, 3, 4].forEach(n => e.enroll(n, 'A16'));
  const ia = e.tabela('Inscricoes_Atividades').find(x => x.inscrito_id === e.insc(1).id && x.atividade_id === 'A16');
  const r = e.ctx.cancelarVaga_(ia.id); e.ctx.processOutbox_(20);
  assert.strictEqual(r.promovidos, 1);
  assert.strictEqual(e.status(3, 'A16'), 'CONFIRMADA'); assert.strictEqual(e.status(4, 'A16'), 'FILA:1'); assert.strictEqual(e.status(1, 'A16'), null);
  assert(/saiu da fila de espera e entrou/i.test(e.emailsDe(3).pop().subject));
});
test('cancelar inscrição no evento cancela atividades, libera vagas e promove a fila', () => {
  const e = cenario();
  [1, 2, 3].forEach(n => e.enroll(n, 'A16'));
  const r = e.ctx.cancelarInscrito_(e.insc(2).id);
  assert.strictEqual(e.insc(2).status, 'CANCELADA'); assert.strictEqual(r.promovidos, 1); assert.strictEqual(e.status(3, 'A16'), 'CONFIRMADA');
  assert.strictEqual(e.ctx.enroll_({ token: e.token(2), atividadeId: 'A15' }).code, 'TOKEN');
});
test('aumentar o máximo de vagas promove a fila no próximo ciclo', () => {
  const e = cenario();
  [1, 2, 3, 4].forEach(n => e.enroll(n, 'A16'));
  e.ativ('A16', { vagas_max: 3 }); e.ctx.tick();
  assert.strictEqual(e.status(3, 'A16'), 'CONFIRMADA'); assert.strictEqual(e.status(4, 'A16'), 'FILA:1');
});
test('sem limite de vagas (campo vazio) nunca gera fila', () => {
  const e = cenario(); e.ativ('A16', { vagas_max: '' });
  [1, 2, 3, 4, 5].forEach(n => assert.strictEqual(e.enroll(n, 'A16').status, 'CONFIRMADA'));
});
test('promoção pula quem passou a ter conflito (edição manual na planilha) e mantém na fila', () => {
  const e = cenario();
  [1, 2, 3, 4].forEach(n => e.enroll(n, 'A16'));          // 3 e 4 na fila
  e.ctx.appendObj_('Inscricoes_Atividades', { id: 'X9999', inscrito_id: e.insc(3).id, atividade_id: 'A15', data_hora: 'x', status: 'CONFIRMADA' });
  const ia = e.tabela('Inscricoes_Atividades').find(x => x.inscrito_id === e.insc(1).id && x.atividade_id === 'A16');
  e.ctx.cancelarVaga_(ia.id);
  assert.strictEqual(e.status(3, 'A16'), 'FILA:1'); assert.strictEqual(e.status(4, 'A16'), 'CONFIRMADA');
});
test('inscrição manual pelo organizador funciona com atividade fechada', () => {
  const e = cenario(); e.ativ('A15', { inscricoes_abertas: 'NAO' });
  const r = e.ctx.inscreverManual_(e.insc(1).id, 'A15'); assert.strictEqual(r.status, 'CONFIRMADA');
});
test('abaixo do mínimo gera alerta ao fechar a atividade', () => {
  const e = cenario(); e.ativ('A15', { vagas_min: 5 }); e.enroll(1, 'A15'); e.ativ('A15', { inscricoes_abertas: 'NAO' });
  e.ctx.checkMinimos_(); assert(e.tabela('Alertas').some(a => a.tipo === 'ABAIXO_DO_MINIMO'));
});
test('me: lista atividades abertas, minha situação e posição na fila', () => {
  const e = cenario(); [1, 2, 3].forEach(n => e.enroll(n, 'A16'));
  const r = e.ctx.getMe_({ token: e.token(3) });
  const a = r.atividades.find(x => x.id === 'A16');
  assert.strictEqual(a.minha.status, 'FILA'); assert.strictEqual(a.minha.posicao, 1); assert.strictEqual(a.lotada, true); assert.strictEqual(a.restantes, 0);
  assert.strictEqual(r.atividades.find(x => x.id === 'A15').restantes, 3);
  assert(!r.atividades.some(x => x.id === 'A10'), 'fechadas não aparecem');
});
test('API: ação desconhecida e JSON inválido não quebram', () => {
  const e = novo(); assert.strictEqual(e.ctx.handle_({ action: 'x' }).ok, false);
  const out = e.ctx.doPost({ postData: { contents: '{ruim' } }); assert(/erro inesperado/.test(JSON.parse(out.s).mensagem));
});

console.log(`\n${passed} ok, ${failed} falharam`);
process.exit(failed ? 1 : 0);
