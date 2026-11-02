/** Scanner: PIN, lista local, registro em lote (portaria e atividade), desfazer e permanência. */

var MSG_PIN = {
  BLOQUEADO: 'Acesso bloqueado temporariamente por excesso de tentativas. Aguarde 5 minutos e tente novamente.',
  SEM_PIN: 'O PIN do scanner ainda não foi definido na aba Config. Defina o PIN e tente novamente.',
  INVALIDO: 'PIN incorreto. Verifique o PIN informado pela organização e tente novamente.'
};

function checkPin_(pin) {
  var props = PropertiesService.getScriptProperties();
  if (Date.now() < Number(props.getProperty('PIN_BLOQ_ATE') || 0)) return 'BLOQUEADO';
  var real = String(getConfig_().PIN || '');
  if (!real) return 'SEM_PIN';
  if (String(pin === undefined || pin === null ? '' : pin).trim() === real) { props.setProperty('PIN_FALHAS', '0'); return 'OK'; }
  var f = Number(props.getProperty('PIN_FALHAS') || 0) + 1;
  props.setProperty('PIN_FALHAS', String(f));
  if (f >= 8) {
    props.setProperty('PIN_BLOQ_ATE', String(Date.now() + 5 * 60000));
    props.setProperty('PIN_FALHAS', '0');
    alert_('PIN_TENTATIVAS', hoje_(), 'Várias tentativas de PIN incorreto no scanner. O acesso foi bloqueado por 5 minutos.');
  }
  return 'INVALIDO';
}

function pinFalha_(chk) { return { ok: false, code: chk, mensagem: MSG_PIN[chk] }; }

/** Fotografia para o scanner trabalhar localmente (resposta instantânea). */
function scanLista_(p) {
  var chk = checkPin_(p.pin);
  if (chk !== 'OK') return pinFalha_(chk);
  var ativ = readAll_(SHEETS.ATIV);
  var out = { ok: true, gerado: Date.now(), i: [], a: [], ia: {}, p: {}, pr: [] };
  readAll_(SHEETS.INSC).forEach(function (r) {
    out.i.push([r.id, r.token, r.nome, r.matricula, r.curso, r.status]);
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
    var porToken = {}, porId = {};
    readAll_(SHEETS.INSC).forEach(function (r) { porToken[String(r.token)] = r; porId[r.id] = r; });
    var ativ = {};
    readAll_(SHEETS.ATIV).forEach(function (a) { ativ[String(a.id)] = a; });
    var port = readAll_(SHEETS.PORTARIA), pres = readAll_(SHEETS.PRES);
    var clientes = {};
    port.forEach(function (r) { if (r.client_id) clientes[r.client_id] = { aba: SHEETS.PORTARIA, r: r }; });
    pres.forEach(function (r) { if (r.client_id) clientes[r.client_id] = { aba: SHEETS.PRES, r: r }; });
    var conf = {};
    readAll_(SHEETS.IA).forEach(function (r) { if (r.status === 'CONFIRMADA' || r.status === 'FILA') conf[r.inscrito_id + '|' + r.atividade_id] = r.status; });
    var estado = {};
    function refazEstado() {
      estado = {};
      port.forEach(function (r) { if (r.status !== 'ANULADO') estado[r.inscrito_id + '|' + dia_(r.dia)] = r.tipo; });
    }
    refazEstado();
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
            if (alvo.aba === SHEETS.PORTARIA) refazEstado();
            else delete presentes[alvo.r.inscrito_id + '|' + alvo.r.atividade_id];
          }
          return { clientId: cid, resultado: 'ANULADO' };
        }
        if (cid && clientes[cid]) return { clientId: cid, resultado: 'REGISTRADO', repetido: true };
        var insc = porToken[String(it.token || '')];
        if (!insc) return { clientId: cid, resultado: 'TOKEN_INVALIDO' };
        if (insc.status !== 'ATIVA') return { clientId: cid, resultado: 'CANCELADA', nome: insc.nome };
        var ts = tsValido_(it.ts);
        var operador = String(it.operador || '').slice(0, 40);
        if (it.modo === 'PORTARIA') {
          var dia = String(it.dia || '');
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return { clientId: cid, resultado: 'DADOS_INVALIDOS' };
          var chave = insc.id + '|' + dia;
          var tipo = it.tipo === 'ENTRADA' || it.tipo === 'SAIDA' ? it.tipo : (estado[chave] === 'ENTRADA' ? 'SAIDA' : 'ENTRADA');
          var linha = { inscrito_id: insc.id, dia: dia, tipo: tipo, data_hora: fmtTs_(ts), operador: operador, status: 'VALIDO',
            client_id: cid, ts: ts, local_ms: Number(it.localMs) || '', server_ms: Date.now() - t0 };
          appendObj_(SHEETS.PORTARIA, linha);
          linha._row = sheet_(SHEETS.PORTARIA).getLastRow();
          port.push(linha); if (cid) clientes[cid] = { aba: SHEETS.PORTARIA, r: linha };
          estado[chave] = tipo;
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
