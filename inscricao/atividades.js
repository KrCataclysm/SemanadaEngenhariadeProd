(function () {
  App.registrarSw();   // páginas do participante: abrem sem internet e se atualizam sozinhas
  var $ = function (id) { return document.getElementById(id); };
  var token = App.Meu.token();
  var DIAS = { '2026-11-11': 'Quarta-feira, 11 de novembro', '2026-11-12': 'Quinta-feira, 12 de novembro', '2026-11-13': 'Sexta-feira, 13 de novembro' };
  $('contato').textContent = App.CONTATO;

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; }

  function render(r) {
    var lista = $('lista'); lista.textContent = '';
    $('saudacao').textContent = 'Olá, ' + r.nome + '. Escolha abaixo as atividades abertas para inscrição.';
    if (!r.atividades.length) {
      lista.appendChild(el('div', 'aviso', 'No momento, não há atividades com inscrições abertas. Quando houver, você será informado pela CAEPRO e poderá voltar a esta página usando o mesmo link.'));
      return;
    }
    var porDia = {};
    r.atividades.forEach(function (a) { (porDia[a.dia] = porDia[a.dia] || []).push(a); });
    Object.keys(porDia).sort().forEach(function (dia) {
      lista.appendChild(el('h2', 'dia', (DIAS[dia] || dia).toUpperCase()));
      porDia[dia].forEach(function (a) {
        var card = el('div', 'card ativ');
        card.appendChild(el('div', 'hora', 'Das ' + a.inicio + ' às ' + a.fim));
        card.appendChild(el('h3', '', a.titulo));
        if (a.minha && a.minha.status === 'CONFIRMADA') {
          card.appendChild(el('span', 'badge ok', 'Inscrição confirmada'));
        } else if (a.minha && a.minha.status === 'FILA') {
          card.appendChild(el('span', 'badge fila', 'Na fila de espera — posição ' + a.minha.posicao));
        } else if (!a.aberta) {
          card.appendChild(el('span', 'badge lot', 'Inscrições encerradas'));
        } else {
          var vagas = a.restantes === null ? 'Vagas sem limite' : (a.lotada ? 'Vagas esgotadas (pessoas na fila: ' + a.naFila + ')' : 'Vagas restantes: ' + a.restantes);
          card.appendChild(el('div', '', vagas));
          var b = el('button', '', a.lotada ? 'Entrar na fila de espera' : 'Inscrever-me');
          b.type = 'button';
          b.addEventListener('click', function () { inscrever(a, b); });
          card.appendChild(b);
        }
        lista.appendChild(card);
      });
    });
  }

  function carregar() {
    return App.api({ action: 'me', token: token }).then(function (r) {
      if (!r.ok) { $('saudacao').textContent = ''; App.aviso($('msg'), 'erro', r.mensagem); $('regras').classList.add('oculto'); return; }
      render(r);
    });
  }

  function inscrever(a, b) {
    var txt = a.lotada
      ? 'Todas as vagas estão ocupadas. Deseja entrar na fila de espera de "' + a.titulo + '"?'
      : 'Confirmar sua inscrição em "' + a.titulo + '"?';
    confirmar(txt).then(function (sim) {
      if (!sim) return;
      b.disabled = true;
      return App.api({ action: 'enroll', token: token, atividadeId: a.id }).then(function (r) {
      if (!r.ok) { App.aviso($('msg'), 'erro', r.mensagem); b.disabled = false; return; }
      var m = r.status === 'FILA'
        ? 'Todas as vagas estavam ocupadas, e você entrou na fila de espera, na posição ' + r.posicao + '. Se uma vaga for liberada, você será inscrito automaticamente e receberá um e-mail.'
        : 'Inscrição confirmada. Enviaremos um e-mail de confirmação, que pode demorar alguns minutos para chegar.';
      App.aviso($('msg'), 'ok', m);
      carregar();
      });
    });
  }

  function confirmar(texto) {
    var d = $('dlg'); $('dlgTxt').textContent = texto;
    if (!d.showModal) return Promise.resolve(window.confirm(texto));   // navegadores muito antigos
    return new Promise(function (ok) {
      d.addEventListener('close', function f() { d.removeEventListener('close', f); ok(d.returnValue === 'sim'); });
      d.returnValue = 'nao'; d.showModal(); $('dlgSim').focus();
    });
  }

  if (!token) { $('saudacao').textContent = ''; App.aviso($('msg'), 'erro', 'Link inválido. Utilize o link pessoal enviado no e-mail de confirmação da inscrição. ' + App.CONTATO); $('regras').classList.add('oculto'); }
  else carregar();
})();
