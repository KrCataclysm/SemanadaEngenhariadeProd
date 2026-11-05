(function () {
  App.registrarSw();   // páginas do participante: abrem sem internet e se atualizam sozinhas
  var $ = function (id) { return document.getElementById(id); };
  var t = App.Meu.token(), salvo = App.Meu.ler();
  function mostrar(id) { ['ok', 'invalido', 'revogado'].forEach(function (x) { $(x).classList.toggle('oculto', x !== id); }); }
  if (!t) { mostrar('invalido'); return; }
  mostrar('ok');
  var png = App.qrDataUrl(t);
  $('qrImg').src = png; $('qrBaixar').href = png; $('qrGrande').src = png;
  $('btnAtividades').href = 'atividades.html';
  $('contato').textContent = App.CONTATO;
  function nome(n) { if (n) { $('quem').textContent = n; $('quem').classList.remove('oculto'); } }
  nome(salvo && salvo.t === t ? salvo.nome : '');

  // Confirma com o sistema (nome e validade). Sem internet, segue exibindo o QR guardado.
  function rede() { $('chRede').classList.toggle('oculto', navigator.onLine !== false); }
  window.addEventListener('online', function () { rede(); confirmar(); }); window.addEventListener('offline', rede); rede();
  function confirmar() {
    if (navigator.onLine === false) return;
    App.api({ action: 'me', token: t }).then(function (r) {
      if (r && r.ok) { App.Meu.salvar(t, r.nome); nome(r.nome); return; }
      if (r && r.code === 'TOKEN') { App.Meu.limpar(); mostrar('revogado'); }   // QR substituído ou inscrição cancelada
    });
  }
  confirmar();

  // Modo ampliado: QR grande sobre fundo branco e tela mantida acesa.
  var dlg = $('dlgQr'), trava = null;
  function liberar() { try { if (trava) trava.release(); } catch (e) { /* ignora */ } trava = null; }
  $('btnAmpliar').addEventListener('click', function () {
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    try { if (navigator.wakeLock) navigator.wakeLock.request('screen').then(function (w) { trava = w; }).catch(function () { /* ignora */ }); } catch (e) { /* ignora */ }
  });
  $('btnFecharQr').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('close', liberar);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && dlg.open && navigator.wakeLock) navigator.wakeLock.request('screen').then(function (w) { trava = w; }).catch(function () { /* ignora */ });
  });

  // Instalar como aplicativo ("Meu QR").
  var ev = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); ev = e; $('btnInstalar').classList.remove('oculto'); });
  window.addEventListener('appinstalled', function () { $('btnInstalar').classList.add('oculto'); $('dicaInstalar').classList.add('oculto'); });
  $('btnInstalar').addEventListener('click', function () { if (ev) { ev.prompt(); ev.userChoice.then(function () { ev = null; $('btnInstalar').classList.add('oculto'); }); } });
  var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var instalado = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
  if (ios && !instalado) $('dicaInstalar').classList.remove('oculto');
})();
