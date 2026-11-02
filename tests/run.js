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

console.log(`\n${passed} ok, ${failed} falharam`);
process.exit(failed ? 1 : 0);
