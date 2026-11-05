(function () {
  var CONTATO = 'Em caso de dúvidas, entre em contato com a CAEPRO pelo Instagram (@caeproufpi) ou pelo e-mail caepro.ufpi1@gmail.com.';
  var MSG_REDE = 'Não foi possível conectar ao sistema de inscrição. Verifique sua conexão com a internet e tente novamente em alguns instantes. ' + CONTATO;
  var MSG_NAO_CONFIG = 'O sistema de inscrição ainda não foi configurado. ' + CONTATO;

  function api(payload) {
    var url = (window.APP_CONFIG || {}).API_URL;
    if (!url) return Promise.resolve({ ok: false, mensagem: MSG_NAO_CONFIG });
    function uma() {
      var req = payload
        ? fetch(url, { method: 'POST', body: JSON.stringify(payload) })
        : fetch(url + '?action=config');
      return req.then(function (r) { return r.json(); }).catch(function () { return { ok: false, code: 'REDE', mensagem: MSG_REDE }; });
    }
    // Quando muita gente usa ao mesmo tempo, o sistema responde "ocupado": tentamos de novo sozinhos (as operações são idempotentes).
    function tentar(n) {
      return uma().then(function (r) {
        if ((r.code === 'OCUPADO' || r.code === 'REDE') && n < 3) {
          return new Promise(function (ok) { setTimeout(ok, 1500 * (n + 1) + Math.random() * 1000); }).then(function () { return tentar(n + 1); });
        }
        return r;
      });
    }
    return tentar(0);
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


  // O QR e o link pessoal ficam guardados neste aparelho, para abrir o QR a qualquer momento (inclusive sem internet).
  var CHAVE_QR = 'meuQr';
  var Meu = {
    tokenValido: function (t) { return /^[a-f0-9]{32}$/.test(String(t || '')); },
    ler: function () { try { var o = JSON.parse(localStorage.getItem(CHAVE_QR) || 'null'); return o && Meu.tokenValido(o.t) ? o : null; } catch (e) { return null; } },
    salvar: function (t, nome) { if (!Meu.tokenValido(t)) return; try { var a = Meu.ler() || {}; localStorage.setItem(CHAVE_QR, JSON.stringify({ t: t, nome: nome || (a.t === t ? a.nome : '') || '' })); } catch (e) { /* sem armazenamento */ } },
    limpar: function () { try { localStorage.removeItem(CHAVE_QR); } catch (e) { /* ignora */ } },
    /** Token do link (?t=) ou, na falta dele, o guardado neste aparelho. O token sai do endereço para não ficar no histórico nem ser compartilhado sem querer. */
    token: function () {
      var t = (new URLSearchParams(location.search).get('t') || '').trim();
      if (Meu.tokenValido(t)) { Meu.salvar(t); try { history.replaceState(null, '', location.pathname); } catch (e) { /* ignora */ } return t; }
      var g = Meu.ler(); return g ? g.t : '';
    }
  };

  // Service worker das páginas do participante: sempre busca a versão mais nova; sem internet, abre a última guardada.
  function registrarSw() {
    if (!('serviceWorker' in navigator) || !(location.protocol === 'https:' || location.hostname === 'localhost')) return;
    var tinha = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      setInterval(function () { try { reg.update(); } catch (e) { /* ignora */ } }, 5 * 60 * 1000);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) { try { reg.update(); } catch (e) { /* ignora */ } } });
    }).catch(function () { /* funciona sem o modo offline */ });
    navigator.serviceWorker.addEventListener('controllerchange', function () { if (!tinha) { tinha = true; return; } location.reload(); });
  }

  window.App = { Meu: Meu, registrarSw: registrarSw, api: api, aviso: aviso, qrDataUrl: qrDataUrl, CONTATO: CONTATO };
})();
