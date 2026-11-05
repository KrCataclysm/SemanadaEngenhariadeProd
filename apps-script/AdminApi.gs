/**
 * API do painel de administração (/admin/). Todas as ações exigem a senha PIN_ADMIN (validada aqui, a cada chamada),
 * com bloqueio por tentativas. O token (credencial do QR) nunca é devolvido. Ações que alteram dados vão para o Log.
 */

function semAcento_(s) { return String(s === undefined || s === null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

function adminLog_(p, evento, detalhe) {
  log_('admin_' + evento, 0, (semFormula_(String(p.operador || 'sem nome').slice(0, 40)) || 'sem nome') + ': ' + detalhe);
}

function pubInsc_(i) {
  return { id: i.id, nome: i.nome, curso: i.curso, periodo: i.periodo, matricula: i.matricula, email: i.email,
    data_hora: i.data_hora, status: i.status, status_email: i.status_email };
}

function inscPorId_(id) {
  var l = readAll_(SHEETS.INSC);
  for (var i = 0; i < l.length; i++) if (String(l[i].id) === String(id)) return l[i];
  return null;
}

function adminHandle_(p) {
  var chk = checkPin_(p.pin, 'PIN_ADMIN', 'ADMIN');
  if (chk !== 'OK') return { ok: false, auth: true, code: chk, mensagem: MSG_PIN_ADMIN[chk] };
  var escrita = /^admin_(editar|cancelar|reativar|reenviar|inscrever|vaga|atividade_set|set_inscricoes|reprocessar)/.test(p.action);
  if (escrita && !String(p.operador || '').trim()) return { ok: false, code: 'OPERADOR', mensagem: 'Informe o seu nome no login para registrar as alterações.' };
  switch (p.action) {
    case 'admin_login':
    case 'admin_resumo': return adminResumo_();
    case 'admin_buscar': return adminBuscar_(p);
    case 'admin_lista': return adminLista_(p);
    case 'admin_ficha': return adminFicha_(p);
    case 'admin_editar': return adminEditar_(p);
    case 'admin_cancelar_inscrito': return adminCancelarInscrito_(p);
    case 'admin_reativar_inscrito': return adminReativar_(p);
    case 'admin_reenviar_qr': return adminReenviarQr_(p);
    case 'admin_inscrever': return adminInscrever_(p);
    case 'admin_vaga_cancelar': return adminCancelarVaga_(p);
    case 'admin_atividades': return adminAtividades_();
    case 'admin_atividade_lista': return adminAtividadeLista_(p);
    case 'admin_atividade_set': return adminAtividadeSet_(p);
    case 'admin_set_inscricoes': return adminSetInscricoes_(p);
    case 'admin_alertas': return adminAlertas_();
    case 'admin_reprocessar': return adminReprocessar_(p);
    case 'admin_tabela': return adminTabela_(p);
    default: return { ok: false, mensagem: 'Ação desconhecida.' };
  }
}

function adminResumo_() {
  var insc = readAll_(SHEETS.INSC), outbox = readAll_(SHEETS.OUTBOX), cfg = getConfig_();
  var ativas = insc.filter(function (i) { return i.status === 'ATIVA'; });
  return {
    ok: true, versao: CODIGO_VERSAO,
    inscricoesAbertas: String(cfg.INSCRICOES).toUpperCase() === 'ABERTAS',
    inscritosAtivos: ativas.length, inscritosCancelados: insc.length - ativas.length,
    emailsPendentes: outbox.filter(function (o) { return o.status === 'PENDENTE'; }).length,
    emailsComErro: outbox.filter(function (o) { return o.status === 'ERRO'; }).length,
    alertasNovos: readAll_(SHEETS.ALERTAS).filter(function (a) { return a.notificado !== 'SIM'; }).length,
    cotaEmailRestante: (function () { try { return MailApp.getRemainingDailyQuota(); } catch (e) { return null; } })(),
    porCurso: contar_(ativas, function (i) { return i.curso; }),
    porPeriodo: contar_(ativas, function (i) { return i.periodo; })
  };
}

function adminBuscar_(p) {
  var q = semAcento_(p.q).trim();
  if (q.length < 2) return { ok: true, resultados: [], mensagem: 'Digite ao menos 2 caracteres.' };
  var achados = readAll_(SHEETS.INSC).filter(function (i) {
    return semAcento_(i.nome).indexOf(q) >= 0 || semAcento_(i.matricula).indexOf(q) >= 0 || semAcento_(i.email).indexOf(q) >= 0;
  });
  return { ok: true, total: achados.length, resultados: achados.slice(0, 30).map(pubInsc_) };
}

/** Lista completa de inscritos (campos públicos do painel, sem token) para a aba Inscritos. */
function adminLista_(p) {
  var todos = readAll_(SHEETS.INSC).map(pubInsc_);
  return { ok: true, total: todos.length, inscritos: todos };
}

function adminFicha_(p) {
  var i = inscPorId_(p.id);
  if (!i) return { ok: false, mensagem: 'Inscrito não encontrado.' };
  var ativs = {}; readAll_(SHEETS.ATIV).forEach(function (a) { ativs[String(a.id)] = a; });
  var minhas = readAll_(SHEETS.IA).filter(function (r) { return String(r.inscrito_id) === String(i.id); }).map(function (r) {
    var a = ativs[String(r.atividade_id)] || {};
    return { iaId: r.id, atividadeId: r.atividade_id, titulo: a.titulo || '', dia: a.dia ? dia_(a.dia) : '', inicio: a.inicio ? hm_(a.inicio) : '', fim: a.fim ? hm_(a.fim) : '',
      status: r.status, posicao: r.posicao === '' ? null : Number(r.posicao), data_hora: r.data_hora };
  });
  var presencas = readAll_(SHEETS.PRES).filter(function (r) { return String(r.inscrito_id) === String(i.id); }).map(function (r) {
    return { atividadeId: r.atividade_id, titulo: (ativs[String(r.atividade_id)] || {}).titulo || '', data_hora: r.data_hora, operador: r.operador, status: r.status };
  });
  var portaria = readAll_(SHEETS.PORTARIA).filter(function (r) { return String(r.inscrito_id) === String(i.id); }).map(function (r) {
    return { dia: dia_(r.dia), tipo: r.tipo, data_hora: r.data_hora, operador: r.operador, status: r.status };
  });
  var emails = readAll_(SHEETS.OUTBOX).filter(function (o) { return String(o.inscrito_id) === String(i.id); }).map(function (o) {
    return { tipo: o.tipo, status: o.status, criado_em: o.criado_em, enviado_em: o.enviado_em, tentativas: o.tentativas, erro: o.erro };
  });
  return { ok: true, inscrito: pubInsc_(i), atividades: minhas, presencas: presencas, portaria: portaria, emails: emails };
}

function adminEditar_(p) {
  var res = withLock_(function () {
    var i = inscPorId_(p.id);
    if (!i) return { ok: false, mensagem: 'Inscrito não encontrado.' };
    var c = p.campos || {};
    var d = {
      nome: normNome_(c.nome !== undefined ? c.nome : i.nome), curso: normNome_(c.curso !== undefined ? c.curso : i.curso),
      periodo: normNome_(c.periodo !== undefined ? c.periodo : i.periodo),
      matricula: normMatricula_(c.matricula !== undefined ? c.matricula : i.matricula), email: normEmail_(c.email !== undefined ? c.email : i.email)
    };
    var erros = validarInscricao_(d);
    if (Object.keys(erros).length) return { ok: false, code: 'INVALIDO', mensagem: MSG.invalido, erros: erros };
    var outro = readAll_(SHEETS.INSC).some(function (x) { return x._row !== i._row && normMatricula_(x.matricula) === d.matricula; });
    if (outro) return { ok: false, code: 'INVALIDO', mensagem: 'Já existe outro inscrito com esta matrícula.', erros: { matricula: 'Matrícula já cadastrada para outra pessoa.' } };
    var mudancas = {}, antes = [];
    ['nome', 'curso', 'periodo', 'matricula', 'email'].forEach(function (k) {
      if (String(i[k]) !== String(d[k])) { mudancas[k] = d[k]; antes.push(k + ': "' + i[k] + '" → "' + d[k] + '"'); }
    });
    if (!Object.keys(mudancas).length) return { ok: true, semMudancas: true };
    var emailMudou = mudancas.email !== undefined;
    if (emailMudou) mudancas.status_email = 'PENDENTE';
    updateRow_(SHEETS.INSC, i._row, mudancas);
    if (emailMudou && i.status === 'ATIVA') enqueueEmail_(i.id, 'CONFIRMACAO');
    adminLog_(p, 'editar', i.id + ' — ' + antes.join('; '));
    return { ok: true, emailReenviado: emailMudou && i.status === 'ATIVA' };
  });
  if (res.ok && res.emailReenviado) { try { processOutbox_(2, p.id); } catch (e) { /* o gatilho reenvia */ } }
  return res;
}

function adminCancelarInscrito_(p) {
  var r = cancelarInscrito_(p.id);
  if (r.ok) { adminLog_(p, 'cancelar_inscrito', p.id + ' (promovidos da fila: ' + r.promovidos + ')'); try { processOutbox_(10); } catch (e) { /* gatilho */ } }
  return r;
}

function adminReativar_(p) {
  return withLock_(function () {
    var i = inscPorId_(p.id);
    if (!i) return { ok: false, mensagem: 'Inscrito não encontrado.' };
    if (i.status === 'ATIVA') return { ok: true, jaAtiva: true };
    updateRow_(SHEETS.INSC, i._row, { status: 'ATIVA' });
    adminLog_(p, 'reativar_inscrito', i.id);
    return { ok: true };
  });
}

function adminReenviarQr_(p) {
  var ok = withLock_(function () {
    var i = inscPorId_(p.id);
    if (!i || i.status !== 'ATIVA') return false;
    updateRow_(SHEETS.INSC, i._row, { status_email: 'PENDENTE' });
    enqueueEmail_(i.id, 'CONFIRMACAO');
    adminLog_(p, 'reenviar_qr', i.id + ' → ' + i.email);
    return true;
  });
  if (!ok) return { ok: false, mensagem: 'Inscrito não encontrado ou cancelado.' };
  try { processOutbox_(2, p.id); } catch (e) { /* gatilho */ }
  return { ok: true };
}

function adminInscrever_(p) {
  var r = inscreverManual_(p.id, p.atividadeId);
  if (r.ok) adminLog_(p, 'inscrever', p.id + ' em ' + p.atividadeId + ' → ' + r.status);
  return r;
}

function adminCancelarVaga_(p) {
  var r = cancelarVaga_(p.iaId);
  if (r.ok) { adminLog_(p, 'vaga_cancelar', p.iaId + ' (promovidos: ' + (r.promovidos || 0) + ')'); try { processOutbox_(10); } catch (e) { /* gatilho */ } }
  return r;
}

function adminAtividades_() {
  atualizarContagensSeguro_();
  return { ok: true, atividades: readAll_(SHEETS.ATIV).map(function (a) {
    return { id: a.id, dia: dia_(a.dia), inicio: hm_(a.inicio), fim: hm_(a.fim), titulo: a.titulo, tipo: a.tipo,
      vagas_max: a.vagas_max === '' ? '' : Number(a.vagas_max), vagas_min: a.vagas_min === '' ? '' : Number(a.vagas_min),
      aberta: String(a.inscricoes_abertas).toUpperCase() === 'SIM', exige: String(a.exige_inscricao).toUpperCase() === 'SIM',
      ocupadas: a.ocupadas, restantes: a.restantes, na_fila: a.na_fila };
  }) };
}

function adminAtividadeLista_(p) {
  var a = getAtividade_(p.id);
  if (!a) return { ok: false, mensagem: 'Atividade não encontrada.' };
  var porId = {}; readAll_(SHEETS.INSC).forEach(function (i) { porId[String(i.id)] = i; });
  var pres = {}; readAll_(SHEETS.PRES).forEach(function (r) { if (String(r.atividade_id) === String(a.id) && r.status !== 'ANULADO') pres[String(r.inscrito_id)] = r.data_hora; });
  var linhas = readAll_(SHEETS.IA).filter(function (r) { return String(r.atividade_id) === String(a.id) && r.status !== 'CANCELADA'; }).map(function (r) {
    var i = porId[String(r.inscrito_id)] || {};
    return { inscritoId: r.inscrito_id, nome: i.nome, matricula: i.matricula, email: i.email, status: r.status,
      posicao: r.posicao === '' ? null : Number(r.posicao), presenca: pres[String(r.inscrito_id)] || '' };
  });
  return { ok: true, atividade: { id: a.id, titulo: a.titulo }, inscritos: linhas };
}

function adminAtividadeSet_(p) {
  var a = getAtividade_(p.id);
  if (!a) return { ok: false, mensagem: 'Atividade não encontrada.' };
  var c = p.campos || {}, mud = {}, desc = [];
  function inteiro(v) { return v === '' || v === null ? '' : (/^\d{1,4}$/.test(String(v).trim()) ? parseInt(v, 10) : NaN); }
  if (c.vagas_max !== undefined) { var m = inteiro(c.vagas_max); if (isNaN(m)) return { ok: false, mensagem: 'Vagas máximas deve ser um número inteiro (ou vazio para sem limite).' }; mud.vagas_max = m; }
  if (c.vagas_min !== undefined) { var n = inteiro(c.vagas_min); if (isNaN(n)) return { ok: false, mensagem: 'Vagas mínimas deve ser um número inteiro (ou vazio).' }; mud.vagas_min = n; }
  if (c.aberta !== undefined) mud.inscricoes_abertas = c.aberta ? 'SIM' : 'NAO';
  Object.keys(mud).forEach(function (k) { if (String(a[k]) !== String(mud[k])) desc.push(k + ': "' + a[k] + '" → "' + mud[k] + '"'); });
  if (!desc.length) return { ok: true, semMudancas: true };
  updateRow_(SHEETS.ATIV, a._row, mud);
  promoteAll_();
  adminLog_(p, 'atividade_set', a.id + ' — ' + desc.join('; '));
  try { processOutbox_(10); } catch (e) { /* gatilho */ }
  return { ok: true };
}

function adminSetInscricoes_(p) {
  var v = String(p.valor || '').toUpperCase();
  if (v !== 'ABERTAS' && v !== 'FECHADAS') return { ok: false, mensagem: 'Valor inválido.' };
  var linha = readAll_(SHEETS.CONFIG).filter(function (r) { return String(r.chave).trim() === 'INSCRICOES'; })[0];
  if (!linha) return { ok: false, mensagem: 'Chave INSCRICOES não encontrada na aba Config.' };
  updateRow_(SHEETS.CONFIG, linha._row, { valor: v });
  resetConfigCache_();
  adminLog_(p, 'set_inscricoes', v);
  return { ok: true, inscricoesAbertas: v === 'ABERTAS' };
}

function adminAlertas_() {
  var porId = {}; readAll_(SHEETS.INSC).forEach(function (i) { porId[String(i.id)] = i; });
  var alertas = readAll_(SHEETS.ALERTAS).slice(-60).reverse().map(function (a) {
    return { data_hora: a.data_hora, tipo: a.tipo, mensagem: a.mensagem, notificado: a.notificado === 'SIM' };
  });
  var fila = readAll_(SHEETS.OUTBOX).filter(function (o) { return o.status === 'PENDENTE' || o.status === 'ERRO'; }).slice(-60).map(function (o) {
    var i = porId[String(o.inscrito_id)] || {};
    return { id: o.id, tipo: o.tipo, status: o.status, nome: i.nome, email: i.email, tentativas: o.tentativas, erro: o.erro, criado_em: o.criado_em };
  });
  return { ok: true, alertas: alertas, emailsPendentes: fila };
}

function adminReprocessar_(p) {
  var n = processOutbox_(30);
  adminLog_(p, 'reprocessar', n + ' e-mail(s) enviado(s)');
  return { ok: true, enviados: n };
}

/** Tabelas para exportação (CSV no navegador). Nunca inclui a coluna token. */
function adminTabela_(p) {
  var nome = String(p.nome || '');
  var permitidas = { base: SHEETS.BASE, inscritos: SHEETS.INSC, atividades_inscricoes: SHEETS.IA, portaria: SHEETS.PORTARIA,
    presenca: SHEETS.PRES, permanencia: SHEETS.PERM, certificados: SHEETS.CERT };
  var aba = permitidas[nome];
  if (!aba) return { ok: false, mensagem: 'Tabela inválida.' };
  if (nome === 'base') atualizarBase_();
  if (nome === 'permanencia' || nome === 'certificados') recalcularPermanencia_();
  var headers = HEADERS[aba].filter(function (h) { return h !== 'token'; });
  var rows = readAll_(aba).map(function (r) { return headers.map(function (h) { return r[h] === undefined ? '' : r[h]; }); });
  return { ok: true, nome: nome, headers: headers, rows: rows.slice(0, 20000) };
}
