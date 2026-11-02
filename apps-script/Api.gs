/** Web App (API JSON). O front-end envia POST com Content-Type text/plain (evita preflight de CORS). */

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function handle_(p) {
  resetConfigCache_();
  switch (p.action) {
    case 'config': return getPublicConfig_();
    case 'register': return register_(p);
    case 'me': return getMe_(p);
    case 'enroll': return enroll_(p);
    case 'scan_lista': return scanLista_(p);
    case 'scan_lote': return scanLote_(p);
    default: return { ok: false, mensagem: 'Ação desconhecida.' };
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (!p.action) p.action = 'config';
  try { return json_(handle_(p)); }
  catch (err) { log_('erro_api', 0, String(err)); return json_({ ok: false, mensagem: MSG.erroInterno }); }
}

function doPost(e) {
  try {
    var p = JSON.parse(e.postData.contents);
    return json_(handle_(p));
  } catch (err) {
    log_('erro_api', 0, String(err));
    return json_({ ok: false, mensagem: MSG.erroInterno });
  }
}
