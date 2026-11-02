(function () {
  var $ = function (id) { return document.getElementById(id); };
  var form = $('form'), msg = $('msg'), btn = $('enviar');

  function limparErros() {
    document.querySelectorAll('.erro-campo').forEach(function (e) { e.textContent = ''; });
    msg.classList.add('oculto');
  }

  App.api(null).then(function (c) {
    if (c && c.ok && !c.inscricoesAbertas) {
      App.aviso($('fechado'), 'erro', c.mensagemFechadas);
      btn.disabled = true;
    } else if (c && !c.ok) {
      App.aviso($('fechado'), 'erro', c.mensagem);
    }
  });

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
      $('linkPessoal').textContent = base + 'atividades.html?t=' + r.token;
      $('contatoSucesso').textContent = App.CONTATO;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
})();
