(function () {
  var t = (new URLSearchParams(location.search).get('t') || '').trim();
  var ok = /^[a-f0-9]{32}$/.test(t);
  document.getElementById(ok ? 'ok' : 'invalido').classList.remove('oculto');
  if (!ok) return;
  var qr = qrcode(0, 'M'); qr.addData(t); qr.make();
  var png = qr.createDataURL(8, 4);
  document.getElementById('qrImg').src = png; document.getElementById('qrBaixar').href = png;
  document.getElementById('btnAtividades').href = 'atividades.html?t=' + t;
  document.getElementById('contato').textContent = 'Em caso de dúvidas, entre em contato com a CAEPRO pelo Instagram (@caeproufpi) ou pelo e-mail caepro.ufpi1@gmail.com.';
})();
