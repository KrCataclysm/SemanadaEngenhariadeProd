(function () {
  var CONTATO = 'Em caso de dúvidas, entre em contato com a CAEPRO pelo Instagram (@caeproufpi) ou pelo e-mail caepro.ufpi1@gmail.com.';
  var MSG_REDE = 'Não foi possível conectar ao sistema de inscrição. Verifique sua conexão com a internet e tente novamente em alguns instantes. ' + CONTATO;
  var MSG_NAO_CONFIG = 'O sistema de inscrição ainda não foi configurado. ' + CONTATO;

  function api(payload) {
    var url = (window.APP_CONFIG || {}).API_URL;
    if (!url) return Promise.resolve({ ok: false, mensagem: MSG_NAO_CONFIG });
    var req = payload
      ? fetch(url, { method: 'POST', body: JSON.stringify(payload) })
      : fetch(url + '?action=config');
    return req.then(function (r) { return r.json(); }).catch(function () { return { ok: false, mensagem: MSG_REDE }; });
  }

  function aviso(el, tipo, texto) {
    el.className = 'aviso ' + (tipo || '');
    el.textContent = texto;
    el.classList.remove('oculto');
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    if (tipo === 'erro' && el.getAttribute('tabindex') === '-1') el.focus({ preventScroll: true });
  }

  function qrDataUrl(texto) {
    var qr = qrcode(0, 'M');
    qr.addData(texto);
    qr.make();
    return qr.createDataURL(8, 4);
  }

  window.App = { api: api, aviso: aviso, qrDataUrl: qrDataUrl, CONTATO: CONTATO };
})();
