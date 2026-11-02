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

function handleSeguro_(p) {
  try {
    var migrou = garantirMigracao_();
    if (p.action === 'versao') return { ok: true, versao: CODIGO_VERSAO, migrou: migrou };
    return handle_(p);
  }
  catch (err) {
    if (err && err.code === 'OCUPADO') return { ok: false, code: 'OCUPADO', mensagem: MSG.ocupado };
    log_('erro_api', 0, String(err && err.stack ? err.stack : err));
    return { ok: false, code: 'ERRO', mensagem: MSG.erroInterno };
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (!p.action) p.action = 'config';
  return json_(handleSeguro_(p));
}

function doPost(e) {
  var p;
  try { p = JSON.parse(e.postData.contents); }
  catch (err) { return json_({ ok: false, code: 'ERRO', mensagem: MSG.erroInterno }); }
  return json_(handleSeguro_(p));
}
