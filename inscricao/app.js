(function () {
  var $ = function (id) { return document.getElementById(id); };
  var form = $('form'), msg = $('msg'), btn = $('enviar');

  function limparErros() {
    document.querySelectorAll('.erro-campo').forEach(function (e) { e.textContent = ''; });
    msg.classList.add('oculto');
  }

  // O formulário só aparece quando o sistema confirma que as inscrições estão abertas.
  function verificar() {
    mostrar('carregando', true); mostrar('fechado', false); mostrar('formCard', false);
    App.api(null).then(function (c) {
      mostrar('carregando', false);
      if (c && c.ok && c.inscricoesAbertas) { mostrar('formCard', true); return; }
      $('msgFechado').textContent = (c && c.ok) ? c.mensagemFechadas
        : ((c && c.mensagem) || 'Não foi possível verificar o status das inscrições. Tente novamente em instantes.');
      mostrar('fechado', true);
    });
  }
  function mostrar(id, sim) { $(id).classList.toggle('oculto', !sim); }
  $('btnRecarregar').addEventListener('click', verificar);
  verificar();

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    limparErros();
    var dados = {
      action: 'register',
      nome: form.nome.value, curso: form.curso.value, periodo: form.periodo.value,
      matricula: form.matricula.value, email: form.email.value
    };
    var faltando = false;
    ['nome', 'curso', 'periodo', 'matricula', 'email'].forEach(function (k) {
      if (!String(dados[k]).trim()) {
        document.querySelector('[data-for="' + k + '"]').textContent = 'Preencha este campo.';
        faltando = true;
      }
    });
    if (faltando) { App.aviso(msg, 'erro', 'Preencha todos os campos para concluir a inscrição.'); return; }

    btn.disabled = true; btn.textContent = 'Enviando…';
    App.api(dados).then(function (r) {
      btn.disabled = false; btn.textContent = 'Concluir inscrição';
      if (!r.ok) {
        if (r.erros) Object.keys(r.erros).forEach(function (k) {
          var el = document.querySelector('[data-for="' + k + '"]'); if (el) el.textContent = r.erros[k];
        });
        App.aviso(msg, 'erro', r.mensagem); return;
      }
      if (r.status === 'JA_INSCRITO') { App.aviso(msg, 'ok', r.mensagem); return; }
      $('formCard').classList.add('oculto');
      $('sucesso').classList.remove('oculto');
      $('msgSucesso').textContent = r.mensagem;
      var png = App.qrDataUrl(r.token);
      $('qrImg').src = png; $('qrBaixar').href = png;
      var base = location.href.replace(/index\.html.*$/, '').replace(/[?#].*$/, '');
      var link = base + 'atividades.html?t=' + r.token;
      $('linkPessoal').textContent = link; $('btnLink').href = link;
      $('btnCopiar').addEventListener('click', function () {
        var ok = function () { $('copiado').classList.remove('oculto'); };
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(ok, function () { });
        else { var t = document.createElement('textarea'); t.value = link; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); ok(); } catch (e) { } document.body.removeChild(t); }
      });
      $('contatoSucesso').textContent = App.CONTATO;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();
