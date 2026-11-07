/** Inscrição no evento (fase 1). */

/** Remove caracteres que fariam a planilha tratar o texto como fórmula (=, +, -, @ no início): injeção de fórmula. */
function semFormula_(s) { return String(s === undefined || s === null ? '' : s).replace(/^[\s=+\-@]+/, ''); }
function normNome_(s) { return semFormula_(String(s || '').replace(/\s+/g, ' ').trim()).trim(); }
function normMatricula_(s) { return String(s || '').replace(/\s+/g, '').toUpperCase(); }
function normEmail_(s) { return String(s || '').trim().toLowerCase().replace(/^[=@]+/, ''); }

function maskEmail_(email) {
  var p = String(email).split('@');
  if (p.length !== 2) return '***';
  return p[0].charAt(0) + '***@' + p[1];
}

function validarInscricao_(d) {
  var erros = {};
  if (d.nome.split(' ').length < 2 || d.nome.length < 5 || d.nome.length > 120) erros.nome = 'Informe o nome completo.';
  if (!d.curso || d.curso.length > 80) erros.curso = 'Informe o curso.';
  if (!d.periodo || d.periodo.length > 40) erros.periodo = 'Informe o período.';
  if (!/^[A-Z0-9.\-]{4,20}$/.test(d.matricula)) erros.matricula = 'Informe a matrícula (4 a 20 caracteres, apenas letras e números).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email) || d.email.length > 120) erros.email = 'Informe um e-mail válido.';
  return erros;
}

function findInscritoByMatricula_(matricula) {
  var lista = readAll_(SHEETS.INSC);
  for (var i = 0; i < lista.length; i++) {
    if (normMatricula_(lista[i].matricula) === matricula) return lista[i];
  }
  return null;
}

function findInscritoByToken_(token) {
  if (typeof token !== 'string') return null;
  token = token.trim();
  if (!/^[a-f0-9]{32}$/.test(token)) return null;
  var lista = readAll_(SHEETS.INSC);
  for (var i = 0; i < lista.length; i++) {
    if (String(lista[i].token) === token) return lista[i];
  }
  return null;
}

function novoToken_() {
  return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '').slice(0, 32).toLowerCase();
}

/** Enfileira e-mail evitando repetição de confirmação em sequência. */
function enqueueEmail_(inscritoId, tipo, atividadeId) {
  var quem = readAll_(SHEETS.INSC).filter(function (i) { return String(i.id) === String(inscritoId); })[0];
  appendObj_(SHEETS.OUTBOX, {
    id: nextId_('E', SHEETS.OUTBOX), inscrito_id: inscritoId, nome: quem ? quem.nome : '', tipo: tipo,
    atividade_id: atividadeId || '', status: 'PENDENTE', criado_em: now_(), tentativas: 0
  });
}

function register_(p) {
  var t0 = Date.now();
  var cfg = getConfig_();
  if (String(cfg.INSCRICOES).toUpperCase() !== 'ABERTAS') {
    return { ok: false, code: 'FECHADAS', mensagem: MSG.fechadas };
  }
  // Proteção contra envio automático (robôs): campo-isca preenchido ou formulário enviado rápido demais.
  if (String(p.campo_extra || '').trim()) { log_('inscricao_bloqueada', 0, 'campo-isca'); return { ok: false, code: 'RAPIDO', mensagem: MSG.rapido }; }
  if (p.tempoMs !== undefined && Number(p.tempoMs) < 2000) { log_('inscricao_bloqueada', 0, 'rápido demais'); return { ok: false, code: 'RAPIDO', mensagem: MSG.rapido }; }
  var d = {
    nome: normNome_(p.nome), curso: normNome_(p.curso), periodo: normNome_(p.periodo),
    matricula: normMatricula_(p.matricula), email: normEmail_(p.email)
  };
  var erros = validarInscricao_(d);
  if (Object.keys(erros).length) return { ok: false, code: 'INVALIDO', mensagem: MSG.invalido, erros: erros };

  var res = withLock_(function () {
    var existente = findInscritoByMatricula_(d.matricula);
    if (existente) {
      alert_('DUPLICIDADE', d.matricula + '|' + hoje_(),
        'Tentativa de nova inscrição com matrícula já cadastrada: ' + d.matricula + ' (' + existente.nome + ').');
      if (existente.status !== 'ATIVA') return { ok: false, code: 'CANCELADA', mensagem: MSG.cancelada };
      // Reenvio da confirmação limitado (evita que alguém digite a matrícula de outra pessoa várias vezes e encha o e-mail dela / gaste a cota diária).
      var envios = readAll_(SHEETS.OUTBOX).filter(function (o) { return o.inscrito_id === existente.id && o.tipo === 'CONFIRMACAO'; });
      var pendente = envios.some(function (o) { return o.status === 'PENDENTE'; });
      var limite = envios.length >= MAX_CONFIRMACOES;
      if (!pendente && !limite) enqueueEmail_(existente.id, 'CONFIRMACAO');
      return {
        ok: true, status: 'JA_INSCRITO', inscritoId: existente.id,
        mensagem: (limite ? MSG.jaInscritoLimite : MSG.jaInscrito).replace('%EMAIL%', maskEmail_(existente.email))
      };
    }
    var id = nextId_('I', SHEETS.INSC);
    var token = novoToken_();
    appendObj_(SHEETS.INSC, {
      id: id, token: token, nome: d.nome, curso: d.curso, periodo: d.periodo, matricula: d.matricula,
      email: d.email, data_hora: now_(), status: 'ATIVA', status_email: 'PENDENTE'
    });
    enqueueEmail_(id, 'CONFIRMACAO');
    return { ok: true, status: 'CRIADA', token: token, nome: d.nome, inscritoId: id, mensagem: MSG.sucesso };
  });

  if (res.ok) {
    try { processOutbox_(2, res.inscritoId); } catch (e) { log_('erro_envio_imediato', 0, String(e)); }
    log_('inscricao_' + res.status, Date.now() - t0, '');
  }
  return res;
}
