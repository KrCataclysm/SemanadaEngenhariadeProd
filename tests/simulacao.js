// Simulação de um evento completo no código real do sistema (modelo de planilha em memória): 200 inscritos, atividades com vagas,
// fila de espera, cancelamentos, três dias de portaria com dois aparelhos (um offline, enviando fora de ordem e repetindo envios),
// QR substituído, inscrição cancelada, cálculo de horas. Verifica as regras (invariantes) depois de cada fase.
const assert = require('assert');
const { makeEnv } = require('./mocks');
let sem = 12345; const rnd = () => (sem = (sem * 1664525 + 1013904223) % 4294967296) / 4294967296;   // sorteio repetível
const ri = (a, b) => a + Math.floor(rnd() * (b - a + 1)); const embaralha = l => { for (let i = l.length - 1; i > 0; i--) { const j = ri(0, i); [l[i], l[j]] = [l[j], l[i]]; } return l; };
const e = makeEnv({ quota: 1e6 }); e.ctx.setup_();
const cfg = (k, v) => { const r = e.ctx.readAll_('Config').find(x => x.chave === k); e.ctx.updateRow_('Config', r._row, { valor: v }); e.ctx.resetConfigCache_(); };
cfg('INSCRICOES', 'ABERTAS'); cfg('PIN', '4321'); cfg('PIN_ADMIN', 'senhaForte123');
const adm = (acao, c) => e.ctx.handleSeguro_(Object.assign({ action: acao, pin: 'senhaForte123', operador: 'Sim' }, c));
const tab = n => e.ctx.readAll_(n); const cronometro = {}; const cron = (n, f) => { const t = process.hrtime.bigint(); const r = f(); (cronometro[n] = cronometro[n] || []).push(Number(process.hrtime.bigint() - t) / 1e6); return r; };
let fases = 0; const fase = (n, f) => { f(); fases++; console.log('  ok  ' + n); };
const N = 200; const ins0 = () => e.ctx.readAll_('Inscritos')[0];

fase('inscrição de 200 pessoas, com tentativas repetidas, inválidas, de robô e com fórmulas maliciosas', () => {
  const sobre = ['Silva', 'Souza', 'Lima', 'Costa', 'Santos', 'Oliveira', 'Pereira', 'Alves'];
  for (let n = 1; n <= N; n++) {
    const nome = (n % 40 === 0 ? ['=HYPERLINK("http://x","a")', '+cmd|calc', '@SUM(A1)', '-2+3'][n / 40 % 4] + ' Teste ' : 'Pessoa ') + 'Numero' + n + ' ' + sobre[n % 8];
    const r = cron('register', () => e.ctx.register_({ nome, curso: 'Engenharia de Produção', periodo: String(ri(1, 10)) + 'º', matricula: '2024' + String(n).padStart(5, '0'), email: 'p' + n + '@exemplo.com' }));
    assert(r.ok && r.status === 'CRIADA', 'inscrição ' + n + ' ' + JSON.stringify(r).slice(0, 120));
  }
  for (let n = 1; n <= 10; n++) { const r = e.ctx.register_({ nome: 'Duplicada Pessoa ' + n, curso: 'EP', periodo: '3º', matricula: '2024' + String(n).padStart(5, '0'), email: 'd' + n + '@exemplo.com' }); assert.strictEqual(r.status, 'JA_INSCRITO'); }
  for (const x of [{ nome: 'x', matricula: '1', email: 'ruim' }, { nome: 'Fulano Silva', curso: 'EP', periodo: '1º', matricula: '99999', email: 'semarroba' }]) assert.strictEqual(e.ctx.register_(Object.assign({ curso: 'EP', periodo: '1º' }, x)).code, 'INVALIDO');
  assert.strictEqual(e.ctx.register_({ nome: 'Robo Silva Souza', curso: 'EP', periodo: '1º', matricula: '88888', email: 'r@e.com', campo_extra: 'spam' }).code, 'RAPIDO');
  const ins = tab('Inscritos'); assert.strictEqual(ins.length, N, 'só as 200 válidas'); assert.strictEqual(new Set(ins.map(i => i.matricula)).size, N); assert.strictEqual(new Set(ins.map(i => i.token)).size, N); assert.strictEqual(new Set(ins.map(i => i.id)).size, N);
  assert(ins.every(i => !/^[=+\-@]/.test(i.nome)), 'nenhum nome começa com caractere de fórmula'); assert(ins.every(i => /^[a-f0-9]{32}$/.test(i.token)));
  for (let i = 0; i < 12; i++) e.ctx.register_({ nome: 'Atacante Qualquer Silva', curso: 'EP', periodo: '3º', matricula: '202400001', email: 'atacante@exemplo.com' });   // alguém digita a matrícula de outra pessoa várias vezes
  const env1 = tab('Fila_Email').filter(o => o.tipo === 'CONFIRMACAO' && o.inscrito_id === ins0().id);
  assert.strictEqual(env1.length, 3, 'reenvio da confirmação limitado a 3 por pessoa: ' + env1.length);
  assert(tab('Fila_Email').filter(o => o.tipo === 'CONFIRMACAO').length <= N + 2 * 10, 'sem enxurrada de e-mails');
  assert(!tab('Fila_Email').some(o => o.inscrito_id && /atacante/.test(String(o.erro))));
});

const ACT = { A10: 12, A12: 12, A13: '', A15: 30, A16: 30 };
Object.keys(ACT).forEach(id => { const a = e.ctx.getAtividade_(id); e.ctx.updateRow_('Atividades', a._row, { vagas_max: ACT[id], inscricoes_abertas: 'SIM' }); });
const ins = () => tab('Inscritos'); const ativas = () => tab('Inscricoes_Atividades').filter(r => r.status === 'CONFIRMADA' || r.status === 'FILA');
function invariantes(rotulo) {
  const ia = ativas(), aids = Object.keys(ACT);
  aids.forEach(id => {
    const conf = ia.filter(r => r.atividade_id === id && r.status === 'CONFIRMADA'), fila = ia.filter(r => r.atividade_id === id && r.status === 'FILA');
    if (ACT[id] !== '') assert(conf.length <= ACT[id], `${rotulo}: ${id} com ${conf.length}/${ACT[id]} (lotação excedida)`);
    assert.deepStrictEqual(fila.map(r => Number(r.posicao)), fila.map((_, i) => i + 1), `${rotulo}: posições da fila de ${id} fora de sequência`);
    const ordem = fila.map(r => r.data_hora); assert.deepStrictEqual(ordem, ordem.slice().sort(), `${rotulo}: fila de ${id} fora da ordem de chegada`);
  });
  const porPessoa = {}; ia.forEach(r => { (porPessoa[r.inscrito_id] = porPessoa[r.inscrito_id] || []).push(r); });
  Object.keys(porPessoa).forEach(p => {
    const l = porPessoa[p]; assert.strictEqual(new Set(l.map(r => r.atividade_id)).size, l.length, `${rotulo}: ${p} repetido na mesma atividade`);
    for (let i = 0; i < l.length; i++) for (let j = i + 1; j < l.length; j++) assert(!e.ctx.sobrepoe_(e.ctx.getAtividade_(l[i].atividade_id), e.ctx.getAtividade_(l[j].atividade_id)), `${rotulo}: ${p} em atividades com horário conflitante`);
  });
  const ativosId = new Set(ins().filter(i => i.status === 'ATIVA').map(i => i.id)); assert(ia.every(r => ativosId.has(r.inscrito_id)), `${rotulo}: inscrição em atividade de pessoa cancelada`);
  const contagem = tab('Atividades'); aids.forEach(id => { const a = contagem.find(x => x.id === id); assert.strictEqual(Number(a.ocupadas), ia.filter(r => r.atividade_id === id && r.status === 'CONFIRMADA').length, `${rotulo}: contagem "ocupadas" de ${id}`); });
}

fase('pico de escolha de atividades: lotação, fila na ordem de chegada, sem conflito de horário', () => {
  const pessoas = embaralha(ins().slice());
  pessoas.forEach(p => embaralha(Object.keys(ACT)).slice(0, ri(1, 3)).forEach(a => cron('enroll', () => e.ctx.enroll_({ token: p.token, atividadeId: a }))));
  invariantes('após o pico'); const ia = ativas();
  ['A10', 'A12'].forEach(id => assert.strictEqual(ia.filter(r => r.atividade_id === id && r.status === 'CONFIRMADA').length, 12, id + ' lotou'));
  assert(ia.some(r => r.status === 'FILA'), 'houve fila');
});

fase('cancelamentos (vaga e inscrição) promovem a fila em ordem; aumentar vagas promove; reativar volta sem furar a fila', () => {
  const conf = ativas().filter(r => r.status === 'CONFIRMADA' && (r.atividade_id === 'A10' || r.atividade_id === 'A12'));
  const antesFila = tab('Inscricoes_Atividades').filter(r => r.atividade_id === 'A10' && r.status === 'FILA').map(r => r.inscrito_id);
  const alvo = conf.find(r => r.atividade_id === 'A10'); e.ctx.cancelarVaga_(alvo.id);
  if (antesFila.length) { const primeiro = tab('Inscricoes_Atividades').find(r => r.inscrito_id === antesFila[0] && r.atividade_id === 'A10'); assert.strictEqual(primeiro.status, 'CONFIRMADA', 'o 1º da fila foi promovido'); }
  invariantes('após cancelar vaga');
  ins().slice(0, 8).forEach(p => e.ctx.cancelarInscrito_(p.id)); invariantes('após cancelar inscritos');
  assert.strictEqual(adm('admin_atividade_set', { id: 'A10', campos: { vagas_max: 15 } }).ok, true); ACT.A10 = 15; invariantes('após aumentar vagas');
  const reat = ins().find(i => i.status === 'CANCELADA'); assert.strictEqual(adm('admin_reativar_inscrito', { id: reat.id }).ok, true); invariantes('após reativar');
  assert(!ativas().some(r => r.inscrito_id === reat.id), 'reativado volta sem inscrições em atividades (não fura a fila)');
});

// ----- portaria: 3 dias, 2 aparelhos, um offline que envia depois e repete envios -----
const presentes = {}; const esperado = {}; let relogio = Date.now() - 20 * 3600 * 1000;
const itens = []; const dias = ['2026-11-11', '2026-11-12', '2026-11-13'];
fase('portaria: dois aparelhos (um offline, fora de ordem, com envios repetidos): nenhuma leitura duplicada nem perdida', () => {
  const ativos = ins().filter(i => i.status === 'ATIVA'); let cid = 0;
  dias.forEach((dia, d) => ativos.forEach(p => {
    if (rnd() < 0.2) return; const t0 = relogio + d * 3600e3 + ri(0, 90) * 60000, dur = ri(60, 360); const sai = rnd() < 0.9;
    esperado[p.id] = (esperado[p.id] || 0) + (sai ? dur : 0);
    const aparelhoA = rnd() < 0.5, aparelhoB = rnd() < 0.5;   // entrada e saída podem ser em portas/aparelhos diferentes
    itens.push({ ap: aparelhoA ? 'A' : 'B', it: { kind: 'scan', modo: 'PORTARIA', dia, token: p.token, operador: aparelhoA ? 'Ana' : 'Bia', clientId: 'c' + (++cid), ts: t0 } });
    if (sai) itens.push({ ap: aparelhoB ? 'A' : 'B', it: { kind: 'scan', modo: 'PORTARIA', dia, token: p.token, operador: aparelhoB ? 'Ana' : 'Bia', clientId: 'c' + (++cid), ts: t0 + dur * 60000 } });
  }));
  const online = itens.filter(x => x.ap === 'A').sort((a, b) => a.it.ts - b.it.ts).map(x => x.it);          // aparelho A: sempre online, em ordem
  const offline = embaralha(itens.filter(x => x.ap === 'B').map(x => x.it));                                  // aparelho B: offline, envia fora de ordem
  const enviar = lista => { for (let i = 0; i < lista.length; i += 50) { const lote = lista.slice(i, i + 50); const r = cron('scan_lote(50)', () => e.ctx.scanLote_({ pin: '4321', itens: lote })); assert(r.ok); r.resultados.forEach(x => assert(['REGISTRADO'].includes(x.resultado), 'resultado ' + x.resultado)); } };
  enviar(online); enviar(offline); enviar(offline.slice(0, 120)); enviar(online.slice(0, 120));           // reenvios (tempo esgotado, nova tentativa)
  assert.strictEqual(tab('Portaria').filter(r => r.status === 'VALIDO').length, itens.length, 'uma linha por leitura, sem duplicar os reenvios');
});

fase('portaria: ENTRADA/SAÍDA seguem a ordem do horário da leitura (não a de chegada) e as horas por pessoa batem', () => {
  const grupos = {}; tab('Portaria').filter(r => r.status === 'VALIDO').forEach(r => { (grupos[r.inscrito_id + '|' + r.dia] = grupos[r.inscrito_id + '|' + r.dia] || []).push(r); });
  Object.keys(grupos).forEach(k => { const l = grupos[k].sort((a, b) => Number(a.ts) - Number(b.ts)); l.forEach((r, i) => assert.strictEqual(r.tipo, i % 2 === 0 ? 'ENTRADA' : 'SAIDA', `tipo errado em ${k} (leitura ${i + 1})`)); });
  const r = cron('recalcularPermanencia', () => e.ctx.recalcularPermanencia_()); const cert = tab('Certificados'); const porId = {}; cert.forEach(c => porId[c.inscrito_id] = Number(c.horas));
  Object.keys(esperado).forEach(id => assert(Math.abs((porId[id] || 0) - esperado[id] / 60) < 0.02, `horas de ${id}: esperado ${(esperado[id] / 60).toFixed(2)}, obtido ${porId[id]}`));
});

fase('segurança no evento: QR substituído, inscrição cancelada, PIN errado e leitura de QR inventado', () => {
  const [a, b, c] = ins().filter(i => i.status === 'ATIVA').slice(0, 3); const velho = a.token;
  assert.strictEqual(adm('admin_novo_qr', { id: a.id }).ok, true);
  const lote = itens => e.ctx.scanLote_({ pin: '4321', itens: itens.map((t, i) => ({ kind: 'scan', modo: 'PORTARIA', dia: '2026-11-13', token: t, operador: 'Ana', clientId: 'z' + Date.now() + i })) }).resultados.map(x => x.resultado);
  e.ctx.cancelarInscrito_(b.id);
  assert.deepStrictEqual(lote([velho, b.token, 'f'.repeat(32), c.token]), ['TOKEN_INVALIDO', 'CANCELADA', 'TOKEN_INVALIDO', 'REGISTRADO']);
  assert.strictEqual(e.ctx.scanLista_({ pin: 'errado' }).code, 'INVALIDO'); invariantes('após eventos de segurança');
});

fase('painel e planilha de análise consistentes com 200 pessoas', () => {
  cron('atualizarBase', () => e.ctx.atualizarBase_()); const base = tab('Base_Analise'); assert.strictEqual(base.length, ins().length);
  e.ctx.atualizarPainel_(); const res = adm('admin_resumo'); assert.strictEqual(res.inscritosAtivos + res.inscritosCancelados, ins().length);
  const dup = adm('admin_duplicados'); assert(dup.ok); assert(!JSON.stringify(adm('admin_ficha', { id: ins()[20].id })).includes(ins()[20].token));
  assert(!JSON.stringify(e.ctx.scanLista_({ pin: '4321' })).includes(ins()[30].token), 'scanner nunca recebe tokens');
});

const med = a => a.reduce((x, y) => x + y, 0) / a.length, mx = a => Math.max(...a);
console.log(`\n${fases} fases ok. Custo de CPU no modelo (ms): ` + Object.keys(cronometro).map(k => `${k} média ${med(cronometro[k]).toFixed(1)} / máx ${mx(cronometro[k]).toFixed(1)}`).join(' · '));
