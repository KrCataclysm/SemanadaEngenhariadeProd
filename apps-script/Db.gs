/** Acesso à planilha como "tabelas" de objetos. */

function ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function sheet_(name) {
  var s = ss_().getSheetByName(name);
  if (!s) throw new Error('Aba não encontrada: ' + name + '. Execute o menu Semana > Configurar planilha.');
  return s;
}

function now_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function hoje_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

/** Lê todas as linhas da aba como objetos (com _row = número da linha na planilha). */
function readAll_(name) {
  var values = sheet_(name).getDataRange().getValues();
  var headers = values[0] || HEADERS[name];
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var o = { _row: i + 1 };
    var vazio = true;
    for (var j = 0; j < headers.length; j++) {
      var v = values[i][j];
      if (v !== '' && v !== null && v !== undefined) vazio = false;
      o[headers[j]] = (v === undefined || v === null) ? '' : v;
    }
    if (!vazio) rows.push(o);
  }
  return rows;
}

function appendObj_(name, obj) {
  var headers = HEADERS[name];
  var row = headers.map(function (h) {
    return obj[h] === undefined || obj[h] === null ? '' : obj[h];
  });
  sheet_(name).appendRow(row);
}

/** Atualiza colunas de uma linha. */
function updateRow_(name, rowNumber, changes) {
  var headers = HEADERS[name];
  var sh = sheet_(name);
  Object.keys(changes).forEach(function (k) {
    var col = headers.indexOf(k) + 1;
    if (col < 1) throw new Error('Coluna inexistente: ' + k);
    sh.getRange(rowNumber, col).setValue(changes[k]);
  });
}

function nextId_(prefix, name) {
  var n = sheet_(name).getLastRow(); // cabeçalho conta 1 => próximo = n
  return prefix + ('0000' + n).slice(-4);
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

var CFG_CACHE_ = null;
function getConfig_() {
  if (CFG_CACHE_) return CFG_CACHE_;
  var cfg = {};
  readAll_(SHEETS.CONFIG).forEach(function (r) { cfg[String(r.chave).trim()] = String(r.valor).trim(); });
  CFG_CACHE_ = cfg;
  return cfg;
}
function resetConfigCache_() { CFG_CACHE_ = null; }

function log_(evento, duracaoMs, detalhe) {
  try {
    appendObj_(SHEETS.LOG, { data_hora: now_(), evento: evento, duracao_ms: duracaoMs, detalhe: detalhe || '' });
  } catch (e) { /* o log nunca pode derrubar o fluxo */ }
}

/**
 * Registra alerta para o organizador. Evita duplicar alertas iguais ainda não notificados.
 */
function alert_(tipo, chave, mensagem) {
  var existe = readAll_(SHEETS.ALERTAS).some(function (a) {
    return a.tipo === tipo && String(a.chave) === String(chave) && a.notificado !== 'SIM';
  });
  if (existe) return;
  appendObj_(SHEETS.ALERTAS, { data_hora: now_(), tipo: tipo, chave: chave, mensagem: mensagem, notificado: 'NAO' });
}
