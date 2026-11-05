(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sem armazenamento */ } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* sem armazenamento */ } }
  };
  var API = (window.APP_CONFIG || {}).API_URL;

  var S = {
    pin: '', operador: '', modo: 'PORTARIA', dia: '', atividadeId: '',
    lista: null, porToken: {}, porId: {}, atv: {}, estado: {}, pres: {}, ia: {},
    fila: [], enviando: false, backoff: 0, ultimo: null, recente: {}, leituras: 0, online: true, problemas: []
  };

  // ---------- utilitários ----------
  function api(payload) {
    if (!API) return Promise.resolve({ ok: false, code: 'CONFIG', mensagem: 'O sistema ainda não foi configurado. Procure a coordenação do credenciamento.' });
    return fetch(API, { method: 'POST', body: JSON.stringify(payload) }).then(function (r) { return r.json(); });
  }
  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  function hora(d) { return (d || new Date()).toLocaleTimeString('pt-BR', { hour12: false }); }
  function semAcento(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }
  function mostrar(id, sim) { $(id).classList.toggle('oculto', !sim); }
  function ddmm(iso) { return iso.slice(8, 10) + '/' + iso.slice(5, 7); }

  var audioCtx = null;
  function bip(freq, ms) {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      var o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = freq; g.gain.value = 0.15; o.connect(g); g.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + ms / 1000);
    } catch (e) { /* som indisponível */ }
  }
  function feedback(tipo) {
    if (tipo === 'entrada') { bip(880, 120); if (navigator.vibrate) navigator.vibrate(60); }
    else if (tipo === 'saida') { bip(660, 120); if (navigator.vibrate) navigator.vibrate(60); }
    else if (tipo === 'warn') { bip(440, 250); if (navigator.vibrate) navigator.vibrate([80, 60, 80]); }
    else { bip(220, 400); if (navigator.vibrate) navigator.vibrate([200, 100, 200]); }
  }

  // ---------- persistência ----------
  function salvarFila() { LS.set('scanner_fila', JSON.stringify(S.fila)); atualizarChips(); }
  function carregarLista(l) {
    S.lista = l; S.porToken = {}; S.porId = {}; S.atv = {}; S.ia = l.ia || {};
    l.i.forEach(function (r) {
      var o = { id: r[0], h: r[1], nome: r[2], matricula: r[3], curso: r[4], status: r[5] };   // r[1] é o SHA-256 do token: este aparelho nunca guarda QR Codes válidos
      S.porToken[o.h] = o; S.porId[o.id] = o;
    });
    l.a.forEach(function (a) { S.atv[a[0]] = { id: a[0], dia: a[1], ini: a[2], fim: a[3], titulo: a[4], tipo: a[5], exige: !!a[6] }; });
    S.estado = Object.assign({}, l.p);
    S.pres = {}; (l.pr || []).forEach(function (k) { S.pres[k] = true; });
    S.fila.forEach(reaplicar);
  }
  function reaplicar(it) {
    if (!it.efeito) return;
    var e = it.efeito;
    if (it.kind === 'undo') {
      if (e.t === 'estado') { if (e.prev) S.estado[e.key] = e.prev; else delete S.estado[e.key]; } else delete S.pres[e.key];
    } else {
      if (e.t === 'estado') S.estado[e.key] = e.val; else S.pres[e.key] = true;
    }
  }

  // ---------- envio em segundo plano (fila local com retentativa) ----------
  function atualizarChips() {
    var r = $('chRede');
    r.textContent = S.online ? 'Conectado' : 'Sem conexão — registrando no aparelho';
    r.className = 'chip ' + (S.online ? 'on' : 'off');
    $('chFila').textContent = 'Pendentes de envio: ' + S.fila.length;
    $('chQtd').textContent = S.leituras + ' leitura(s)';
  }
  function flush() {
    if (S.enviando || !S.fila.length) return;
    S.enviando = true;
    var lote = S.fila.slice(0, 20);
    var t0 = Date.now();
    api({ action: 'scan_lote', pin: S.pin, itens: lote }).then(function (r) {
      S.enviando = false;
      if (!r.ok) {
        if (r.code === 'INVALIDO' || r.code === 'BLOQUEADO' || r.code === 'SEM_PIN') { S.online = true; atualizarChips(); avisoPin(r.mensagem); return; }
        throw new Error(r.mensagem || 'erro');
      }
      S.online = true; S.backoff = 0;
      var feitos = {};
      (r.resultados || []).forEach(function (x) {
        feitos[x.clientId] = true;
        var it = lote.filter(function (l) { return l.clientId === x.clientId; })[0];
        if (['TOKEN_INVALIDO', 'CANCELADA', 'NAO_INSCRITO', 'ERRO', 'DADOS_INVALIDOS'].indexOf(x.resultado) >= 0 && it && it.kind !== 'undo') {
          S.problemas.push({ nome: x.nome || (S.porToken[it.h || it.token] || {}).nome || 'QR desconhecido', motivo: x.resultado, quando: hora() });
          renderProblemas();
        }
      });
      S.fila = S.fila.filter(function (it) { return !feitos[it.clientId]; });
      salvarFila();
      LS.set('scanner_ultimo_envio_ms', String(Date.now() - t0));
      if (S.fila.length) setTimeout(flush, 100);
    }).catch(function () {
      S.enviando = false; S.online = false; atualizarChips();
      S.backoff = Math.min(30000, (S.backoff || 2000) * 1.7);
      setTimeout(flush, S.backoff);
    });
  }
  function avisoPin(msg) {
    mostrar('scan', false); mostrar('modo', false); mostrar('login', true);
    var m = $('msgLogin'); m.className = 'aviso erro'; m.textContent = msg + ' Seus registros pendentes continuam guardados neste aparelho.';
    pararCamera();
  }
  function renderProblemas() {
    mostrar('problemas', S.problemas.length > 0);
    var box = $('listaProb'); box.textContent = '';
    var txt = { TOKEN_INVALIDO: 'QR não reconhecido', CANCELADA: 'Inscrição cancelada', NAO_INSCRITO: 'Sem inscrição na atividade', ERRO: 'Erro ao gravar', DADOS_INVALIDOS: 'Dados inválidos' };
    S.problemas.slice(-8).forEach(function (p) {
      var d = document.createElement('div'); d.className = 'busca-item';
      d.textContent = p.quando + ' — ' + p.nome + ': ' + (txt[p.motivo] || p.motivo); box.appendChild(d);
    });
  }

  // ---------- resultado na tela ----------
  var timerRes = null;
  function resultado(cls, titulo, nome, sub, extra) {
    var r = $('res'); r.className = 'res ' + cls; r.textContent = '';
    var t = document.createElement('div'); t.className = 't'; t.textContent = titulo; r.appendChild(t);
    if (nome) { var n = document.createElement('div'); n.className = 'n'; n.textContent = nome; r.appendChild(n); }
    if (sub) { var s = document.createElement('div'); s.className = 's'; s.textContent = sub; r.appendChild(s); }
    var ex = $('acaoExtra'); ex.textContent = ''; mostrar('acaoExtra', !!extra);
    if (extra) ex.appendChild(extra);
    clearTimeout(timerRes);
  }

  // ---------- leitura de um token ----------
  /** SHA-256 (hex) do texto lido no QR Code. */
  function sha256(texto) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }
  function processar(token, opcoes) {
    if (!window.crypto || !crypto.subtle) { resultado('err', 'NAVEGADOR SEM SUPORTE', '', 'Abra o scanner em um navegador atualizado (Chrome ou Safari) com endereço seguro (https).'); feedback('err'); return Promise.resolve(); }
    return sha256(String(token)).then(function (h) { processarH(h, opcoes); });
  }
  function processarH(token, opcoes) {   // `token` aqui é o hash do QR
    opcoes = opcoes || {};
    var t0 = performance.now();
    var agora = Date.now();
    if (!opcoes.manual && S.recente[token] && agora - S.recente[token] < 3500) return;
    S.recente[token] = agora;
    var insc = S.porToken[token];
    if (!insc && !opcoes.retry && navigator.onLine !== false) {
      // Pode ser alguém que se inscreveu depois de a lista ser carregada: atualiza e tenta de novo.
      resultado('warn', 'ATUALIZANDO A LISTA…', '', 'QR Code não encontrado na lista deste aparelho. Verificando no sistema.');
      api({ action: 'scan_lista', pin: S.pin }).then(function (l) {
        if (l.ok) { carregarLista(l); LS.set('scanner_lista', JSON.stringify(l)); }
      }).catch(function () { /* segue com a lista atual */ }).then(function () { processarH(token, { manual: true, retry: true, forcar: opcoes.forcar }); });
      return;
    }
    if (!insc) {
      resultado('err', 'QR NÃO RECONHECIDO', '', 'Este QR Code não pertence a uma inscrição. Se o participante se inscreveu agora há pouco, toque em "Trocar modo" e depois em "Iniciar leitura" para atualizar a lista.');
      feedback('err'); return;
    }
    if (insc.status !== 'ATIVA') {
      resultado('err', 'INSCRIÇÃO CANCELADA', insc.nome, 'Não libere a entrada. Encaminhe a pessoa à coordenação da CAEPRO.');
      feedback('err'); return;
    }
    var item = { kind: 'scan', modo: S.modo, h: token, operador: S.operador, clientId: uuid(), ts: Date.now() };
    if (S.modo === 'PORTARIA') {
      var key = insc.id + '|' + S.dia, prev = S.estado[key] || null;
      var tipo = prev === 'ENTRADA' ? 'SAIDA' : 'ENTRADA';
      item.dia = S.dia; item.efeito = { t: 'estado', key: key, val: tipo, prev: prev };
      S.estado[key] = tipo;
      S.ultimo = item;
      resultado(tipo === 'ENTRADA' ? 'entrada' : 'saida', tipo === 'ENTRADA' ? 'ENTRADA' : 'SAÍDA', insc.nome, hora() + ' — ' + ddmm(S.dia));
      feedback(tipo === 'ENTRADA' ? 'entrada' : 'saida');
    } else {
      var k2 = insc.id + '|' + S.atividadeId;
      if (S.pres[k2]) {
        resultado('warn', 'JÁ REGISTRADO', insc.nome, 'A presença desta pessoa já foi registrada nesta atividade.'); feedback('warn'); return;
      }
      var at = S.atv[S.atividadeId];
      var sit = (S.ia[S.atividadeId] || {})[insc.id];
      if (at && at.exige && sit !== 'C' && !opcoes.forcar) {
        var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Registrar mesmo assim';
        b.addEventListener('click', function () { processarH(token, { manual: true, forcar: true }); });
        resultado('warn', 'SEM INSCRIÇÃO NESTA ATIVIDADE', insc.nome,
          sit === 'F' ? 'A pessoa está na fila de espera desta atividade, sem vaga confirmada.' : 'A pessoa não está inscrita nesta atividade, que exige inscrição prévia.', b);
        feedback('warn'); return;
      }
      item.atividadeId = S.atividadeId; item.forcar = !!opcoes.forcar; item.efeito = { t: 'pres', key: k2 };
      S.pres[k2] = true; S.ultimo = item;
      resultado('entrada', 'PRESENÇA REGISTRADA', insc.nome, hora() + (opcoes.forcar ? ' — registrada sem inscrição' : ''));
      feedback('entrada');
    }
    item.localMs = Math.round(performance.now() - t0);
    S.leituras++;
    S.fila.push(item); salvarFila(); flush();
  }

  function desfazer() {
    var u = S.ultimo;
    if (!u) { resultado('warn', 'NADA A DESFAZER', '', 'Não há leitura recente deste aparelho para desfazer.'); return; }
    var undo = { kind: 'undo', clientId: u.clientId, efeito: u.efeito };
    reaplicar(undo);
    S.leituras = Math.max(0, S.leituras - 1);
    S.fila.push(undo); S.ultimo = null; salvarFila();
    resultado('warn', 'LEITURA DESFEITA', (S.porToken[u.h] || {}).nome || '', 'O registro foi anulado.');
    flush();
  }

  // ---------- câmera e decodificação ----------
  var stream = null, rodando = false, detector = null, canvas = document.createElement('canvas'), ctx2 = canvas.getContext('2d', { willReadFrequently: true });
  var TOKEN_RE = /^[a-f0-9]{32}$/;
  function aoLer(texto) {
    texto = String(texto || '').trim();
    if (!TOKEN_RE.test(texto)) {
      if (S.recente['_invalido'] && Date.now() - S.recente['_invalido'] < 2500) return;
      S.recente['_invalido'] = Date.now();
      resultado('err', 'QR NÃO RECONHECIDO', '', 'O código lido não é um QR Code de inscrição deste evento.'); feedback('err'); return;
    }
    processar(texto);
  }
  function iniciarCamera() {
    mostrar('avisoCam', false);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      semCamera('Este navegador não permite o uso da câmera. Abra o endereço em um navegador atualizado (Chrome ou Safari) e utilize a busca por nome enquanto isso.'); return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } }, audio: false }).then(function (s) {
      stream = s; var v = $('video'); v.srcObject = s; v.play();
      if ('BarcodeDetector' in window) { try { detector = new BarcodeDetector({ formats: ['qr_code'] }); } catch (e) { detector = null; } }
      rodando = true; requestAnimationFrame(ciclo);
      if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(function () { });
    }).catch(function () {
      semCamera('Não foi possível acessar a câmera. Permita o acesso à câmera nas configurações do navegador e recarregue a página. Enquanto isso, utilize a busca por nome.');
    });
  }
  function semCamera(msg) { var a = $('avisoCam'); a.textContent = msg; mostrar('avisoCam', true); }
  function pararCamera() {
    rodando = false;
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
  }
  var ultimoQuadro = 0, ocupado = false;
  function ciclo(ts) {
    if (!rodando) return;
    requestAnimationFrame(ciclo);
    if (ocupado || ts - ultimoQuadro < 70) return;
    var v = $('video');
    if (v.readyState < 2 || !v.videoWidth) return;
    ultimoQuadro = ts;
    if (detector) {
      ocupado = true;
      detector.detect(v).then(function (c) { if (c && c.length) aoLer(c[0].rawValue); }).catch(function () { detector = null; }).then(function () { ocupado = false; });
      return;
    }
    var w = Math.min(640, v.videoWidth), h = Math.round(v.videoHeight * w / v.videoWidth);
    canvas.width = w; canvas.height = h; ctx2.drawImage(v, 0, 0, w, h);
    var img = ctx2.getImageData(0, 0, w, h);
    var code = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
    if (code && code.data) aoLer(code.data);
  }

  // ---------- telas ----------
  function irModo() {
    pararCamera();
    mostrar('login', false); mostrar('scan', false); mostrar('modo', true);
    var sel = $('atv'); sel.textContent = '';
    if (S.lista) {
      S.lista.a.forEach(function (a) {
        var o = document.createElement('option'); o.value = a[0]; o.textContent = ddmm(a[1]) + ' ' + a[2] + ' — ' + a[4]; sel.appendChild(o);
      });
      $('infoLista').textContent = 'Lista carregada: ' + S.lista.i.length + ' inscrito(s). Atualizada às ' + hora(new Date(S.lista.gerado)) + '.';
    }
    var hoje = new Date().toISOString().slice(0, 10);
    var radios = document.querySelectorAll('input[name=dia]'), marcado = false;
    radios.forEach(function (r) { if (r.value === hoje) { r.checked = true; marcado = true; } });
    if (!marcado && !document.querySelector('input[name=dia]:checked')) radios[0].checked = true;
  }
  function atualizarModoUI() {
    var m = document.querySelector('input[name=modo]:checked').value;
    mostrar('boxDia', m === 'PORTARIA'); mostrar('boxAtv', m === 'ATIVIDADE');
  }
  function iniciarLeitura() {
    S.modo = document.querySelector('input[name=modo]:checked').value;
    S.dia = (document.querySelector('input[name=dia]:checked') || {}).value || '';
    S.atividadeId = $('atv').value;
    $('btnIniciar').disabled = true; $('btnIniciar').textContent = 'Atualizando lista…';
    var recusado = false;
    api({ action: 'scan_lista', pin: S.pin }).then(function (l) {
      if (l.ok) { carregarLista(l); LS.set('scanner_lista', JSON.stringify(l)); }
      else if (l.code === 'INVALIDO' || l.code === 'BLOQUEADO' || l.code === 'SEM_PIN') { recusado = true; avisoPin(l.mensagem); }
    }).catch(function () { /* usa a lista guardada no aparelho */ }).then(function () {
      $('btnIniciar').disabled = false; $('btnIniciar').textContent = 'Iniciar leitura';
      if (recusado) return;
      if (!S.lista) { var m = $('infoLista'); m.textContent = 'Não foi possível carregar a lista de inscritos. Verifique a conexão com a internet e tente novamente.'; return; }
      mostrar('modo', false); mostrar('scan', true);
      var at = S.atv[S.atividadeId];
      $('titModo').textContent = S.modo === 'PORTARIA' ? 'Portaria — dia ' + ddmm(S.dia) : 'Atividade — ' + (at ? at.titulo : '');
      resultado('idle', 'Aguardando leitura', '', 'Aponte a câmera para o QR Code do participante.');
      atualizarChips(); iniciarCamera(); flush();
    });
  }

  function login(ev) {
    ev.preventDefault();
    S.operador = $('operador').value.trim(); S.pin = $('pin').value.trim();
    var b = $('btnLogin'), m = $('msgLogin'); b.disabled = true; b.textContent = 'Verificando…';
    api({ action: 'scan_lista', pin: S.pin }).then(function (l) {
      b.disabled = false; b.textContent = 'Entrar';
      if (!l.ok) { m.className = 'aviso erro'; m.textContent = l.mensagem; return; }
      LS.set('scanner_operador', S.operador);
      try { sessionStorage.setItem('scanner_pin', S.pin); } catch (e) { /* ignora */ }
      carregarLista(l); LS.set('scanner_lista', JSON.stringify(l)); irModo();
    }).catch(function () {
      b.disabled = false; b.textContent = 'Entrar';
      m.className = 'aviso erro'; m.textContent = 'Não foi possível conectar ao sistema. Verifique a conexão com a internet e tente novamente.';
    });
  }

  function buscar() {
    var q = semAcento($('q').value.trim()), box = $('resBusca'); box.textContent = '';
    if (q.length < 3 || !S.lista) return;
    var achados = S.lista.i.filter(function (r) { return semAcento(r[2]).indexOf(q) >= 0 || String(r[3]).toLowerCase().indexOf(q) >= 0; }).slice(0, 8);
    achados.forEach(function (r) {
      var d = document.createElement('div'); d.className = 'busca-item';
      var info = document.createElement('div'); info.className = 'info'; info.textContent = r[2] + ' — mat. ' + r[3];
      var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Registrar';
      b.addEventListener('click', function () { processarH(r[1], { manual: true }); mostrar('busca', false); $('q').value = ''; box.textContent = ''; });
      d.appendChild(info); d.appendChild(b); box.appendChild(d);
    });
    if (!achados.length) box.textContent = 'Nenhum inscrito encontrado com esse nome ou matrícula.';
  }

  // ---------- inicialização ----------
  $('formLogin').addEventListener('submit', login);
  document.querySelectorAll('input[name=modo]').forEach(function (r) { r.addEventListener('change', atualizarModoUI); });
  $('btnIniciar').addEventListener('click', iniciarLeitura);
  $('btnDesfazer').addEventListener('click', desfazer);
  $('btnBuscar').addEventListener('click', function () { mostrar('busca', $('busca').classList.contains('oculto')); $('q').focus(); });
  $('btnTrocar').addEventListener('click', irModo);
  // Encerra o uso: apaga a lista de inscritos, a fila e o PIN deste aparelho (dados pessoais não devem ficar em aparelho emprestado).
  $('btnSair').addEventListener('click', function () {
    var pend = S.fila.length;
    if (pend && !window.confirm(pend + ' registro(s) ainda não foram enviados ao sistema e serão perdidos se você sair agora. Conecte-se à internet e aguarde o envio, ou toque em OK para sair mesmo assim.')) return;
    pararCamera(); ['scanner_lista', 'scanner_fila', 'scanner_operador', 'scanner_ultimo_envio_ms'].forEach(LS.del);
    try { sessionStorage.removeItem('scanner_pin'); } catch (e) { /* ignora */ }
    location.reload();
  });
  $('q').addEventListener('input', buscar);
  window.addEventListener('online', function () { S.online = true; atualizarChips(); flush(); });
  window.addEventListener('offline', function () { S.online = false; atualizarChips(); });
  setInterval(function () {
    if (!rodando || S.fila.length || S.enviando) return;
    api({ action: 'scan_lista', pin: S.pin }).then(function (l) { if (l.ok && !S.fila.length) { carregarLista(l); LS.set('scanner_lista', JSON.stringify(l)); } }).catch(function () { });
  }, 90000);
  window.addEventListener('beforeunload', pararCamera);

  try { S.fila = JSON.parse(LS.get('scanner_fila') || '[]'); } catch (e) { S.fila = []; }
  $('operador').value = LS.get('scanner_operador') || '';
  try { var l0 = JSON.parse(LS.get('scanner_lista') || 'null'); if (l0 && l0.v === 2) carregarLista(l0); else if (l0) LS.del('scanner_lista'); } catch (e) { /* ignora */ }   // lista de versão antiga (com tokens) é descartada
  atualizarModoUI(); atualizarChips();
  var pinSalvo = ''; try { pinSalvo = sessionStorage.getItem('scanner_pin') || ''; } catch (e) { /* ignora */ }
  if (pinSalvo && S.lista && $('operador').value) { S.pin = pinSalvo; S.operador = $('operador').value; irModo(); }
  if (S.fila.length && pinSalvo) { S.pin = pinSalvo; flush(); }

  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    var tinhaControle = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      var checar = function () { try { reg.update(); } catch (e) { /* ignora */ } };
      setInterval(checar, 5 * 60 * 1000);
      document.addEventListener('visibilitychange', function () { if (!document.hidden) checar(); });
    }).catch(function () { /* funciona sem o modo offline */ });
    // Nova versão: no login recarrega sozinho; durante o uso nunca interrompe a leitura, só avisa (a fila de registros fica salva no aparelho).
    navigator.serviceWorker.addEventListener('controllerchange', function () {
      if (!tinhaControle) { tinhaControle = true; return; }
      if (!S.pin) { location.reload(); return; }
      $('avisoAtualiza').classList.remove('oculto'); $('btnAtualiza').onclick = function () { location.reload(); };
    });
  }
  window.__scanner = { processar: processar, estado: S }; // usado nos testes automatizados
})();
