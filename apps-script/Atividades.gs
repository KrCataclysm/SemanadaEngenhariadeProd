/** Atividades: vagas, conflito de horário, fila de espera e promoção automática. */

function hm_(s) {
  // aceita "09:30" (texto) ou Date vinda da planilha
  if (Object.prototype.toString.call(s) === '[object Date]') {
    return Utilities.formatDate(s, Session.getScriptTimeZone(), 'HH:mm');
  }
  return String(s).trim();
}
function dia_(s) {
  if (Object.prototype.toString.call(s) === '[object Date]') {
    return Utilities.formatDate(s, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(s).trim();
}
function min_(hhmm) {
  var p = hm_(hhmm).split(':');
  return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
}

function getAtividade_(id) {
  var l = readAll_(SHEETS.ATIV);
  for (var i = 0; i < l.length; i++) if (String(l[i].id) === String(id)) return l[i];
  return null;
}

function sobrepoe_(a, b) {
  return dia_(a.dia) === dia_(b.dia) && min_(a.inicio) < min_(b.fim) && min_(b.inicio) < min_(a.fim);
}

function vagasMax_(a) {
  var v = a.vagas_max;
  if (v === '' || v === null || v === undefined) return null; // sem limite
  var n = parseInt(v, 10);
  return isNaN(n) ? null : Math.max(0, n);
}

function inscricoesDaAtividade_(atividadeId, status) {
  return readAll_(SHEETS.IA).filter(function (r) {
    return String(r.atividade_id) === String(atividadeId) && r.status === status;
  });
}

function inscricoesDoInscrito_(inscritoId) {
  return readAll_(SHEETS.IA).filter(function (r) {
    return String(r.inscrito_id) === String(inscritoId) && (r.status === 'CONFIRMADA' || r.status === 'FILA');
  });
}

/** Procura conflito de horário com atividades já ocupadas pela pessoa. */
function acharConflito_(inscritoId, atividade) {
  var minhas = inscricoesDoInscrito_(inscritoId);
  for (var i = 0; i < minhas.length; i++) {
    var outra = getAtividade_(minhas[i].atividade_id);
    if (outra && String(outra.id) !== String(atividade.id) && sobrepoe_(atividade, outra)) return outra;
  }
  return null;
}

function renumerarFila_(atividadeId) {
  var fila = inscricoesDaAtividade_(atividadeId, 'FILA');
  fila.forEach(function (r, i) {
    if (Number(r.posicao) !== i + 1) updateRow_(SHEETS.IA, r._row, { posicao: i + 1 });
  });
}

/** Inscreve (ou coloca na fila). Deve ser chamado dentro de lock. */
function enrollCore_(inscrito, atividade) {
  if (String(atividade.exige_inscricao).toUpperCase() !== 'SIM') return { ok: false, mensagem: MSG.atividadeInexistente };
  if (String(atividade.inscricoes_abertas).toUpperCase() !== 'SIM') return { ok: false, code: 'FECHADA', mensagem: MSG.atividadeFechada };
  var ja = inscricoesDoInscrito_(inscrito.id).some(function (r) { return String(r.atividade_id) === String(atividade.id); });
  if (ja) return { ok: false, code: 'JA_INSCRITO', mensagem: MSG.jaNaAtividade };
  var conflito = acharConflito_(inscrito.id, atividade);
  if (conflito) {
    return {
      ok: false, code: 'CONFLITO',
      mensagem: MSG.conflito.replace('%TITULO%', conflito.titulo)
        .replace('%HORARIO%', hm_(conflito.inicio) + ' às ' + hm_(conflito.fim))
    };
  }
  var max = vagasMax_(atividade);
  var ocupadas = inscricoesDaAtividade_(atividade.id, 'CONFIRMADA').length;
  var id = nextId_('X', SHEETS.IA);
  if (max === null || ocupadas < max) {
    appendObj_(SHEETS.IA, { id: id, inscrito_id: inscrito.id, atividade_id: atividade.id, data_hora: now_(), status: 'CONFIRMADA', posicao: '' });
    enqueueEmail_(inscrito.id, 'ATIVIDADE', atividade.id);
    if (max !== null && ocupadas + 1 >= max) {
      alert_('VAGAS_ESGOTADAS', atividade.id, 'Vagas esgotadas em: ' + atividade.titulo + ' (' + max + ' vagas).');
    }
    return { ok: true, status: 'CONFIRMADA', atividadeId: atividade.id };
  }
  var posicao = inscricoesDaAtividade_(atividade.id, 'FILA').length + 1;
  appendObj_(SHEETS.IA, { id: id, inscrito_id: inscrito.id, atividade_id: atividade.id, data_hora: now_(), status: 'FILA', posicao: posicao });
  enqueueEmail_(inscrito.id, 'FILA', atividade.id);
  return { ok: true, status: 'FILA', posicao: posicao, atividadeId: atividade.id };
}

/** Promove a fila enquanto houver vagas. Dentro de lock. Retorna quantidade de promoções. */
function promoteAtividade_(atividade) {
  var max = vagasMax_(atividade);
  var promovidos = 0;
  var fila = inscricoesDaAtividade_(atividade.id, 'FILA');
  for (var i = 0; i < fila.length; i++) {
    var ocupadas = inscricoesDaAtividade_(atividade.id, 'CONFIRMADA').length;
    if (max !== null && ocupadas >= max) break;
    var r = fila[i];
    var insc = readAll_(SHEETS.INSC).filter(function (x) { return String(x.id) === String(r.inscrito_id); })[0];
    if (!insc || insc.status !== 'ATIVA') {
      updateRow_(SHEETS.IA, r._row, { status: 'CANCELADA', posicao: '' });
      continue;
    }
    var confirmadasDele = readAll_(SHEETS.IA).filter(function (x) {
      return String(x.inscrito_id) === String(insc.id) && x.status === 'CONFIRMADA';
    });
    var conflita = confirmadasDele.some(function (x) {
      var o = getAtividade_(x.atividade_id);
      return o && sobrepoe_(atividade, o);
    });
    if (conflita) continue; // permanece na fila; será reavaliado
    updateRow_(SHEETS.IA, r._row, { status: 'CONFIRMADA', posicao: '' });
    enqueueEmail_(insc.id, 'PROMOCAO', atividade.id);
    promovidos++;
  }
  renumerarFila_(atividade.id);
  return promovidos;
}

function promoteAll_() {
  withLock_(function () {
    readAll_(SHEETS.ATIV).forEach(function (a) { promoteAtividade_(a); });
    atualizarContagensSeguro_();
  });
}

/** Alerta quando uma atividade fechada ficou abaixo do mínimo. */
function checkMinimos_() {
  readAll_(SHEETS.ATIV).forEach(function (a) {
    var min = parseInt(a.vagas_min, 10);
    if (!min || String(a.inscricoes_abertas).toUpperCase() === 'SIM') return;
    var todas = readAll_(SHEETS.IA).filter(function (r) { return String(r.atividade_id) === String(a.id); });
    if (!todas.length) return;
    var conf = inscricoesDaAtividade_(a.id, 'CONFIRMADA').length;
    if (conf < min) {
      alert_('ABAIXO_DO_MINIMO', a.id, 'A atividade "' + a.titulo + '" tem ' + conf + ' inscrito(s) confirmado(s), abaixo do mínimo de ' + min + '.');
    }
  });
}

/** Cancela a inscrição de uma pessoa em uma atividade e promove a fila. */
function cancelarVaga_(iaId) {
  return withLock_(function () {
    var ia = readAll_(SHEETS.IA).filter(function (r) { return String(r.id) === String(iaId); })[0];
    if (!ia) return { ok: false, mensagem: 'Inscrição em atividade não encontrada.' };
    if (ia.status === 'CANCELADA') return { ok: true, jaCancelada: true };
    updateRow_(SHEETS.IA, ia._row, { status: 'CANCELADA', posicao: '' });
    var at = getAtividade_(ia.atividade_id);
    var promovidos = at ? promoteAtividade_(at) : 0;
    atualizarContagensSeguro_();
    return { ok: true, promovidos: promovidos };
  });
}

/** Cancela a inscrição no evento e em todas as atividades; libera vagas e promove filas. */
function cancelarInscrito_(inscritoId) {
  return withLock_(function () {
    var insc = readAll_(SHEETS.INSC).filter(function (r) { return String(r.id) === String(inscritoId); })[0];
    if (!insc) return { ok: false, mensagem: 'Inscrito não encontrado.' };
    updateRow_(SHEETS.INSC, insc._row, { status: 'CANCELADA' });
    var afetadas = {};
    readAll_(SHEETS.IA).forEach(function (r) {
      if (String(r.inscrito_id) === String(inscritoId) && (r.status === 'CONFIRMADA' || r.status === 'FILA')) {
        updateRow_(SHEETS.IA, r._row, { status: 'CANCELADA', posicao: '' });
        afetadas[r.atividade_id] = true;
      }
    });
    var promovidos = 0;
    Object.keys(afetadas).forEach(function (aid) {
      var at = getAtividade_(aid);
      if (at) promovidos += promoteAtividade_(at);
    });
    atualizarContagensSeguro_();
    return { ok: true, promovidos: promovidos };
  });
}

function enroll_(p) {
  var insc = findInscritoByToken_(p.token);
  if (!insc || insc.status !== 'ATIVA') return { ok: false, code: 'TOKEN', mensagem: MSG.tokenInvalido };
  var res = withLock_(function () {
    var at = getAtividade_(p.atividadeId);
    if (!at) return { ok: false, mensagem: MSG.atividadeInexistente };
    var r = enrollCore_(insc, at);
    if (r.ok) atualizarContagensSeguro_();
    return r;
  });
  if (res.ok) {
    try { processOutbox_(2, insc.id); } catch (e) { log_('erro_envio_imediato', 0, String(e)); }
  }
  return res;
}

/** Inscrição manual feita pelo organizador (ignora "inscrições abertas", respeita vagas e conflitos). */
function inscreverManual_(inscritoId, atividadeId) {
  var res = withLock_(function () {
    var insc = readAll_(SHEETS.INSC).filter(function (r) { return String(r.id) === String(inscritoId); })[0];
    var at = getAtividade_(atividadeId);
    if (!insc || insc.status !== 'ATIVA') return { ok: false, mensagem: 'Inscrito não encontrado ou cancelado.' };
    if (!at) return { ok: false, mensagem: MSG.atividadeInexistente };
    var copia = {};
    Object.keys(at).forEach(function (k) { copia[k] = at[k]; });
    copia.inscricoes_abertas = 'SIM';
    var r = enrollCore_(insc, copia);
    if (r.ok) atualizarContagensSeguro_();
    return r;
  });
  if (res.ok) { try { processOutbox_(3); } catch (e) { /* tick reenvia */ } }
  return res;
}

function atividadePublica_(a, minha) {
  var max = vagasMax_(a);
  var ocup = inscricoesDaAtividade_(a.id, 'CONFIRMADA').length;
  var fila = inscricoesDaAtividade_(a.id, 'FILA').length;
  return {
    id: a.id, dia: dia_(a.dia), inicio: hm_(a.inicio), fim: hm_(a.fim), titulo: a.titulo, tipo: a.tipo,
    restantes: max === null ? null : Math.max(0, max - ocup),
    lotada: max !== null && ocup >= max,
    naFila: fila,
    minha: minha ? { status: minha.status, posicao: minha.posicao === '' ? null : Number(minha.posicao) } : null
  };
}

function getMe_(p) {
  var insc = findInscritoByToken_(p.token);
  if (!insc || insc.status !== 'ATIVA') return { ok: false, code: 'TOKEN', mensagem: MSG.tokenInvalido };
  var minhas = inscricoesDoInscrito_(insc.id);
  var porAtividade = {};
  minhas.forEach(function (m) { porAtividade[m.atividade_id] = m; });
  var lista = readAll_(SHEETS.ATIV).filter(function (a) {
    var exige = String(a.exige_inscricao).toUpperCase() === 'SIM';
    var aberta = String(a.inscricoes_abertas).toUpperCase() === 'SIM';
    return exige && (aberta || porAtividade[a.id]);
  }).map(function (a) {
    var pub = atividadePublica_(a, porAtividade[a.id]);
    pub.aberta = String(a.inscricoes_abertas).toUpperCase() === 'SIM';
    return pub;
  });
  return { ok: true, nome: insc.nome, atividades: lista };
}

function getPublicConfig_() {
  var cfg = getConfig_();
  return {
    ok: true,
    inscricoesAbertas: String(cfg.INSCRICOES).toUpperCase() === 'ABERTAS',
    nomeEvento: cfg.NOME_EVENTO || 'Semana de Engenharia de Produção',
    mensagemFechadas: MSG.fechadas
  };
}

/** Grava ocupadas, restantes e na_fila na aba Atividades (valores, sem fórmulas: independe do idioma da planilha). */
function atualizarContagens_() {
  var ativ = readAll_(SHEETS.ATIV);
  if (!ativ.length) return;
  var conf = {}, fila = {};
  readAll_(SHEETS.IA).forEach(function (r) {
    if (r.status === 'CONFIRMADA') conf[r.atividade_id] = (conf[r.atividade_id] || 0) + 1;
    else if (r.status === 'FILA') fila[r.atividade_id] = (fila[r.atividade_id] || 0) + 1;
  });
  var sh = sheet_(SHEETS.ATIV);
  ativ.forEach(function (a) {
    var max = vagasMax_(a), oc = conf[a.id] || 0;
    sh.getRange(a._row, 11, 1, 3).setValues([[oc, max === null ? 'sem limite' : Math.max(0, max - oc), fila[a.id] || 0]]);
  });
  invalidar_(SHEETS.ATIV);
}
function atualizarContagensSeguro_() { try { atualizarContagens_(); } catch (e) { log_('erro_contagens', 0, String(e)); } }
