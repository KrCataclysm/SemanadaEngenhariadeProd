/** Scanner: PIN, lista local, registro em lote (portaria e atividade), desfazer e permanência. */

var MSG_PIN_ADMIN = {
  BLOQUEADO: 'Acesso bloqueado temporariamente por excesso de tentativas. Aguarde 5 minutos e tente novamente.',
  SEM_PIN: 'A senha de administrador (PIN_ADMIN) ainda não foi definida na aba Config da planilha.',
  FRACO: 'A senha de administrador (PIN_ADMIN) deve ter pelo menos 8 caracteres e ser diferente do PIN do scanner. Ajuste na aba Config da planilha.',
  INVALIDO: 'Senha incorreta. Verifique a senha de administrador e tente novamente.'
};

var MSG_PIN = {
  BLOQUEADO: 'Acesso bloqueado temporariamente por excesso de tentativas. Aguarde 5 minutos e tente novamente.',
  SEM_PIN: 'O PIN do scanner ainda não foi definido na aba Config. Defina o PIN e tente novamente.',
  INVALIDO: 'PIN incorreto. Verifique o PIN informado pela organização e tente novamente.'
};

function checkPin_(pin, chave, prefixo) {
  chave = chave || 'PIN'; prefixo = prefixo || 'PIN';
  var props = PropertiesService.getScriptProperties();
  var kBloq = prefixo + '_BLOQ_ATE', kFalhas = prefixo + '_FALHAS', kDesde = prefixo + '_FALHAS_DESDE';
  if (Date.now() < Number(props.getProperty(kBloq) || 0)) return 'BLOQUEADO';
  var cfg = getConfig_(), real = String(cfg[chave] || '');
  if (!real) return 'SEM_PIN';
  if (chave === 'PIN_ADMIN' && (real.length < 8 || real === String(cfg.PIN || ''))) return 'FRACO';
  // As tentativas erradas valem só dentro de uma janela de 10 minutos: erros isolados, em horas diferentes, não somam.
  var desde = Number(props.getProperty(kDesde) || 0);
  if (desde && Date.now() - desde > 10 * 60000) { props.setProperty(kFalhas, '0'); props.setProperty(kDesde, '0'); }
  // Só texto vale como PIN (listas, objetos e números são recusados).
  if (typeof pin === 'string' && pin.trim() === real) { props.setProperty(kFalhas, '0'); props.setProperty(kDesde, '0'); return 'OK'; }
  var f = Number(props.getProperty(kFalhas) || 0) + 1;
  props.setProperty(kFalhas, String(f));
  if (f === 1) props.setProperty(kDesde, String(Date.now()));
  if (f >= 8) {
    props.setProperty(kBloq, String(Date.now() + 5 * 60000));
    props.setProperty(kFalhas, '0');
    alert_(prefixo + '_TENTATIVAS', hoje_(), 'Várias tentativas de ' + (chave === 'PIN_ADMIN' ? 'senha de administrador' : 'PIN') + ' incorretas. O acesso foi bloqueado por 5 minutos.');
  }
  return 'INVALIDO';
}

/** SHA-256 (hex) do token. O scanner guarda só este código: com ele não é possível fabricar um QR Code válido. */
function hashToken_(t) {
  var d = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(t), Utilities.Charset.UTF_8);
  return d.map(function (b) { return ('0' + (b < 0 ? b + 256 : b).toString(16)).slice(-2); }).join('');
}

function pinFalha_(chk) { return { ok: false, code: chk, mensagem: MSG_PIN[chk] }; }

/** Fotografia para o scanner trabalhar localmente (resposta instantânea). */
function scanLista_(p) {
  var chk = checkPin_(p.pin);
  if (chk !== 'OK') return pinFalha_(chk);
  var ativ = readAll_(SHEETS.ATIV);
  var out = { ok: true, v: 2, gerado: Date.now(), i: [], a: [], ia: {}, p: {}, pr: [] };
  readAll_(SHEETS.INSC).forEach(function (r) {
    out.i.push([r.id, hashToken_(r.token), r.nome, r.matricula, r.curso, r.status]);
  });
  ativ.forEach(function (a) {
    out.a.push([a.id, dia_(a.dia), hm_(a.inicio), hm_(a.fim), a.titulo, a.tipo, String(a.exige_inscricao).toUpperCase() === 'SIM' ? 1 : 0]);
  });
  readAll_(SHEETS.IA).forEach(function (r) {
    if (r.status !== 'CONFIRMADA' && r.status !== 'FILA') return;
    (out.ia[r.atividade_id] = out.ia[r.atividade_id] || {})[r.inscrito_id] = r.status === 'CONFIRMADA' ? 'C' : 'F';
  });
  readAll_(SHEETS.PORTARIA).forEach(function (r) {
    if (r.status === 'ANULADO') return;
    out.p[r.inscrito_id + '|' + dia_(r.dia)] = r.tipo;
  });
  readAll_(SHEETS.PRES).forEach(function (r) {
    if (r.status === 'ANULADO') return;
    out.pr.push(r.inscrito_id + '|' + r.atividade_id);
  });
  return out;
}

function tsValido_(ts) {
  ts = Number(ts);
  if (!ts || Math.abs(Date.now() - ts) > 36 * 3600 * 1000) return Date.now();
  return ts;
}
function fmtTs_(ts) { return Utilities.formatDate(new Date(ts), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'); }
function horaTs_(ts) { return Utilities.formatDate(new Date(ts), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss').slice(11); }

function scanLote_(p) {
  var chk = checkPin_(p.pin);
  if (chk !== 'OK') return pinFalha_(chk);
  var itens = (p.itens || []).slice(0, 50);
  return withLock_(function () {
    var porToken = {}, porHash = {};
    readAll_(SHEETS.INSC).forEach(function (r) { porToken[String(r.token)] = r; porHash[hashToken_(r.token)] = r; });
    var ativ = {};
    readAll_(SHEETS.ATIV).forEach(function (a) { ativ[String(a.id)] = a; });
    var port = readAll_(SHEETS.PORTARIA), pres = readAll_(SHEETS.PRES);
    var clientes = {};
    port.forEach(function (r) { if (r.client_id) clientes[r.client_id] = { aba: SHEETS.PORTARIA, r: r }; });
    pres.forEach(function (r) { if (r.client_id) clientes[r.client_id] = { aba: SHEETS.PRES, r: r }; });
    var conf = {};
    readAll_(SHEETS.IA).forEach(function (r) { if (r.status === 'CONFIRMADA' || r.status === 'FILA') conf[r.inscrito_id + '|' + r.atividade_id] = r.status; });
    var estado = {};
    /** ENTRADA/SAÍDA seguem a ordem do HORÁRIO da leitura (não a de chegada ao servidor): dois aparelhos, um deles offline, enviam fora de ordem. */
    function reordenar(inscId, dia) {
      var grupo = port.filter(function (r) { return String(r.inscrito_id) === String(inscId) && dia_(r.dia) === dia && r.status !== 'ANULADO'; })
        .sort(function (a, b) { return Number(a.ts) - Number(b.ts) || a._row - b._row; });
      grupo.forEach(function (r, i) {
        var t = i % 2 === 0 ? 'ENTRADA' : 'SAIDA';
        if (r.tipo !== t) { updateRow_(SHEETS.PORTARIA, r._row, { tipo: t }); r.tipo = t; }
      });
      var chave = inscId + '|' + dia;
      if (grupo.length) estado[chave] = grupo[grupo.length - 1].tipo; else delete estado[chave];
    }
    port.forEach(function (r) { if (r.status !== 'ANULADO') estado[r.inscrito_id + '|' + dia_(r.dia)] = r.tipo; });
    var presentes = {};
    pres.forEach(function (r) { if (r.status !== 'ANULADO') presentes[r.inscrito_id + '|' + r.atividade_id] = r; });

    var resultados = itens.map(function (it) {
      var t0 = Date.now();
      var cid = String(it.clientId || '');
      try {
        if (it.kind === 'undo') {
          var alvo = clientes[cid];
          if (!alvo) return { clientId: cid, resultado: 'NAO_ENCONTRADO' };
          if (alvo.r.status !== 'ANULADO') {
            updateRow_(alvo.aba, alvo.r._row, { status: 'ANULADO' });
            alvo.r.status = 'ANULADO';
            if (alvo.aba === SHEETS.PORTARIA) reordenar(alvo.r.inscrito_id, dia_(alvo.r.dia));
            else delete presentes[alvo.r.inscrito_id + '|' + alvo.r.atividade_id];
          }
          return { clientId: cid, resultado: 'ANULADO' };
        }
        if (cid && clientes[cid]) return { clientId: cid, resultado: 'REGISTRADO', repetido: true };
        var insc = it.h ? (typeof it.h === 'string' && /^[a-f0-9]{64}$/.test(it.h) ? porHash[it.h] : null) : (typeof it.token === 'string' ? porToken[it.token] : null);   // `token` só para versões antigas do scanner
        if (!insc) return { clientId: cid, resultado: 'TOKEN_INVALIDO' };
        if (insc.status !== 'ATIVA') return { clientId: cid, resultado: 'CANCELADA', nome: insc.nome };
        var ts = tsValido_(it.ts);
        var operador = semFormula_(String(it.operador || '').slice(0, 40));
        if (it.modo === 'PORTARIA') {
          var dia = String(it.dia || '');
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return { clientId: cid, resultado: 'DADOS_INVALIDOS' };
          var chave = insc.id + '|' + dia;
          var tipo = estado[chave] === 'ENTRADA' ? 'SAIDA' : 'ENTRADA';   // provisório: reordenar() ajusta pela ordem dos horários
          var linha = { inscrito_id: insc.id, dia: dia, tipo: tipo, data_hora: fmtTs_(ts), operador: operador, status: 'VALIDO',
            client_id: cid, ts: ts, local_ms: Number(it.localMs) || '', server_ms: Date.now() - t0 };
          appendObj_(SHEETS.PORTARIA, linha);
          linha._row = sheet_(SHEETS.PORTARIA).getLastRow();
          port.push(linha); if (cid) clientes[cid] = { aba: SHEETS.PORTARIA, r: linha };
          reordenar(insc.id, dia); tipo = linha.tipo;
          return { clientId: cid, resultado: 'REGISTRADO', tipo: tipo, nome: insc.nome, horario: horaTs_(ts) };
        }
        if (it.modo === 'ATIVIDADE') {
          var at = ativ[String(it.atividadeId)];
          if (!at) return { clientId: cid, resultado: 'DADOS_INVALIDOS' };
          var ck = insc.id + '|' + at.id;
          if (presentes[ck]) return { clientId: cid, resultado: 'JA_REGISTRADO', nome: insc.nome, horario: String(presentes[ck].data_hora).slice(11) };
          var sit = conf[ck] || null;
          if (String(at.exige_inscricao).toUpperCase() === 'SIM' && sit !== 'CONFIRMADA' && !it.forcar) {
            return { clientId: cid, resultado: 'NAO_INSCRITO', nome: insc.nome, situacao: sit };
          }
          var l2 = { inscrito_id: insc.id, atividade_id: at.id, data_hora: fmtTs_(ts), operador: operador, status: 'VALIDO',
            client_id: cid, ts: ts, local_ms: Number(it.localMs) || '', server_ms: Date.now() - t0 };
          appendObj_(SHEETS.PRES, l2);
          l2._row = sheet_(SHEETS.PRES).getLastRow();
          pres.push(l2); if (cid) clientes[cid] = { aba: SHEETS.PRES, r: l2 };
          presentes[ck] = l2;
          return { clientId: cid, resultado: 'REGISTRADO', nome: insc.nome, horario: horaTs_(ts), forcado: !!it.forcar };
        }
        return { clientId: cid, resultado: 'DADOS_INVALIDOS' };
      } catch (e) {
        log_('erro_scan', Date.now() - t0, String(e));
        return { clientId: cid, resultado: 'ERRO' };
      }
    });
    log_('scan_lote', 0, itens.length + ' item(ns)');
    return { ok: true, resultados: resultados };
  });
}

/** Soma pares ENTRADA→SAÍDA por pessoa/dia e gera Certificados. */
function recalcularPermanencia_() {
  var grupos = calcularPermanencia_();
  var perm = [], total = {}, pendPessoa = {}, pendentes = 0;
  Object.keys(grupos).sort().forEach(function (k) {
    var g = grupos[k];
    var m = Math.round(g.min * 10) / 10;
    perm.push([g.insc, g.dia, m, g.pend ? 'SIM' : 'NAO']);
    total[g.insc] = (total[g.insc] || 0) + g.min;
    if (g.pend) { pendPessoa[g.insc] = (pendPessoa[g.insc] || 0) + 1; pendentes++; }
  });
  var cert = Object.keys(total).sort().map(function (id) {
    return [id, Math.round(total[id] / 60 * 100) / 100,
      pendPessoa[id] ? 'Saída não registrada em ' + pendPessoa[id] + ' dia(s): conferir antes de emitir o certificado.' : ''];
  });
  substituirLinhas_(SHEETS.PERM, perm);
  substituirLinhas_(SHEETS.CERT, cert);
  return { pessoas: cert.length, pendentes: pendentes };
}

function substituirLinhas_(nome, matriz) {
  var sh = sheet_(nome), cols = HEADERS[nome].length;
  var ultima = sh.getLastRow();
  if (ultima > 1) sh.getRange(2, 1, ultima - 1, cols).clearContent();
  if (matriz.length) sh.getRange(2, 1, matriz.length, cols).setValues(matriz);
  invalidar_(nome);
}
