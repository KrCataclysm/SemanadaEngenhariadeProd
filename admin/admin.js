(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var S = { pin: '', operador: '', logado: false, ativs: [], aba: 'inicio' };
  var ABAS = ['inicio', 'inscritos', 'atividades', 'alertas', 'dados'];

  // ---------- utilitários de interface (sempre textContent: nada de HTML vindo do servidor) ----------
  function plana(l) { return l.reduce(function (acc, x) { return acc.concat(Array.isArray(x) ? plana(x) : [x]); }, []); }
  function h(tag, attrs, filhos) {
    var e = document.createElement(tag);
    if (tag === 'table') e.setAttribute('tabindex', '0');   // tabela com rolagem precisa ser alcançável pelo teclado
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') e.className = attrs[k]; else if (k === 'text') e.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]); else if (attrs[k] !== false && attrs[k] !== null && attrs[k] !== undefined) e.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    });
    plana([filhos || []]).forEach(function (f) { if (f !== null && f !== undefined && f !== false) e.appendChild(typeof f === 'string' ? document.createTextNode(f) : f); });
    return e;
  }
  function limpar(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
  function avisar(tipo, msg) {
    var t = $('toast'); t.className = 'toast aviso ' + (tipo || ''); t.textContent = msg; t.classList.remove('oculto'); t.focus({ preventScroll: true });
  }
  function confirmar(texto) {
    var d = $('dlg'); $('dlgTxt').textContent = texto;
    if (!d.showModal) return Promise.resolve(window.confirm(texto));
    return new Promise(function (ok) {
      d.addEventListener('close', function f() { d.removeEventListener('close', f); ok(d.returnValue === 'sim'); });
      d.returnValue = 'nao'; d.showModal(); $('dlgSim').focus();
    });
  }
  function badge(txt, cls) { return h('span', { class: 'badge ' + (cls || ''), text: txt }); }
  var TIPO_EMAIL = { CONFIRMACAO: 'Confirmação da inscrição', ATIVIDADE: 'Inscrição em atividade', FILA: 'Entrada na fila', PROMOCAO: 'Saída da fila' };
  function tipoEmail(t) { return TIPO_EMAIL[t] || t; }
  function statusBadge(s) { return badge(s, s === 'ATIVA' || s === 'CONFIRMADA' || s === 'ENVIADO' ? 'ok' : (s === 'FILA' || s === 'PENDENTE' ? 'fila' : 'erro')); }

  function chamar(acao, extra) {
    if (navigator.onLine === false) return Promise.resolve({ ok: false, code: 'REDE', mensagem: 'Você está sem conexão com a internet. As operações do painel só funcionam online; tente novamente quando a conexão voltar.' });
    return App.api(Object.assign({ action: acao, pin: S.pin, operador: S.operador }, extra || {})).then(function (r) {
      if (!r.ok && r.auth && S.logado) sair(r.mensagem);   // só falhas de autenticação encerram a sessão (erros de validação não)
      return r;
    });
  }
  function ok(r, msgOk) { if (!r.ok) { avisar('erro', r.mensagem || 'Não foi possível concluir a operação.'); return false; } if (msgOk) avisar('ok', msgOk); return true; }

  // ---------- CSV (com proteção contra injeção de fórmula ao abrir no Excel) ----------
  function csv(headers, rows) {
    var esc = function (v) {
      v = String(v === null || v === undefined ? '' : v);
      if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
      return /[";\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
    };
    return '﻿' + [headers].concat(rows).map(function (r) { return r.map(esc).join(';'); }).join('\r\n');
  }
  function baixar(nome, texto) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([texto], { type: 'text/csv;charset=utf-8' })); a.download = nome;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  function hojeStr() { return new Date().toISOString().slice(0, 10); }

  // ---------- login / sessão ----------
  function entrar(ev) {
    ev.preventDefault();
    S.operador = $('operador').value.trim(); S.pin = $('senha').value;
    var b = $('btnLogin'); b.disabled = true; b.textContent = 'Verificando…';
    chamar('admin_login').then(function (r) {
      b.disabled = false; b.textContent = 'Entrar';
      if (!r.ok) { avisar('erro', r.mensagem); return; }
      try { sessionStorage.setItem('adm', JSON.stringify({ p: S.pin, o: S.operador })); } catch (e) { /* sem armazenamento */ }
      S.logado = true; $('senha').value = ''; mostrarApp(r);
    });
  }
  function sair(msg) {
    S.logado = false; S.pin = '';
    try { sessionStorage.removeItem('adm'); } catch (e) { /* ignora */ }
    $('app').classList.add('oculto'); $('login').classList.remove('oculto');
    if (msg) avisar('erro', msg);
  }
  function mostrarApp(resumo) {
    $('login').classList.add('oculto'); $('app').classList.remove('oculto'); $('toast').classList.add('oculto');
    $('quem').textContent = 'Administrador: ' + S.operador;
    var aba = new URLSearchParams(location.search).get('aba');
    if (aba && aba !== 'inicio' && ABAS.indexOf(aba) >= 0) irPara(aba); else irPara('inicio', resumo);
  }

  // ---------- abas ----------
  function irPara(aba, dadosIniciais) {
    S.aba = aba;
    ABAS.forEach(function (a) {
      $('t-' + a).setAttribute('aria-selected', a === aba ? 'true' : 'false');
      $('p-' + a).classList.toggle('oculto', a !== aba);
    });
    if (aba === 'inicio') carregarInicio(dadosIniciais); else if (aba === 'atividades') carregarAtividades();
    else if (aba === 'alertas') carregarAlertas(); else if (aba === 'dados') montarDados();
    else $('q').focus();
  }

  // ---------- Início ----------
  function kpi(n, rotulo, alerta) { return h('div', { class: 'kpi' + (alerta ? ' alerta' : '') }, [h('div', { class: 'n', text: String(n) }), h('div', { class: 'r', text: rotulo })]); }
  function tabelaContagem(titulo, linhas) {
    return h('div', { class: 'card' }, [h('h2', { text: titulo }), linhas.length
      ? h('table', { class: 'tabela-simples' }, h('tbody', {}, linhas.map(function (l) { return h('tr', {}, [h('td', { text: l[0] }), h('td', { text: String(l[1]) })]); })))
      : h('p', { class: 'contato', text: 'Ainda não há inscritos.' })]);
  }
  function carregarInicio(r0) {
    var raiz = limpar($('p-inicio'));
    (r0 ? Promise.resolve(r0) : chamar('admin_resumo')).then(function (r) {
      if (!ok(r)) return;
      var aberta = r.inscricoesAbertas;
      raiz.appendChild(h('div', { class: 'card' }, [
        h('h2', { text: 'Inscrições no evento' }),
        h('p', {}, ['Situação atual: ', badge(aberta ? 'ABERTAS' : 'FECHADAS', aberta ? 'ok' : 'erro')]),
        h('button', { type: 'button', class: aberta ? 'perigo' : '', text: aberta ? 'Fechar inscrições' : 'Abrir inscrições', onclick: function () {
          confirmar(aberta ? 'Fechar as inscrições no evento? Ninguém conseguirá se inscrever até você reabrir.' : 'Abrir as inscrições no evento ao público?').then(function (s) {
            if (!s) return;
            chamar('admin_set_inscricoes', { valor: aberta ? 'FECHADAS' : 'ABERTAS' }).then(function (x) { if (ok(x, 'Inscrições ' + (x.inscricoesAbertas ? 'abertas' : 'fechadas') + '.')) carregarInicio(); });
          });
        } })]));
      raiz.appendChild(h('div', { class: 'kpis' }, [
        kpi(r.inscritosAtivos, 'inscritos ativos'), kpi(r.inscritosCancelados, 'inscrições canceladas'),
        kpi(r.emailsPendentes, 'e-mails pendentes', r.emailsPendentes > 0), kpi(r.emailsComErro, 'e-mails com erro', r.emailsComErro > 0),
        kpi(r.alertasNovos, 'alertas não lidos', r.alertasNovos > 0), kpi(r.cotaEmailRestante === null ? '—' : r.cotaEmailRestante, 'e-mails restantes hoje')]));
      raiz.appendChild(h('div', { class: 'form-grid' }, [tabelaContagem('Por curso', r.porCurso), tabelaContagem('Por período', r.porPeriodo)]));
      raiz.appendChild(h('p', { class: 'contato', text: 'Versão do sistema: ' + r.versao }));
    });
  }

  // ---------- Inscritos ----------
  var tBusca = null;
  function buscar() {
    var q = $('q').value.trim(), box = limpar($('resBusca'));
    if (q.length < 2) { return; }
    chamar('admin_buscar', { q: q }).then(function (r) {
      if (!ok(r)) return;
      limpar(box);
      if (!r.resultados.length) { box.appendChild(h('p', { text: 'Nenhum inscrito encontrado.' })); return; }
      if (r.total > r.resultados.length) box.appendChild(h('p', { class: 'contato', text: 'Mostrando ' + r.resultados.length + ' de ' + r.total + ' resultados. Refine a busca.' }));
      r.resultados.forEach(function (i) {
        box.appendChild(h('div', { class: 'item linha' }, [
          h('div', { class: 'grow' }, [h('strong', { text: i.nome }), h('div', { class: 'sub', text: 'Matrícula ' + i.matricula + ' · ' + i.curso + ' · ' + i.periodo + ' · ' + i.email })]),
          statusBadge(i.status), h('button', { type: 'button', class: 'sec peq', text: 'Abrir ficha', onclick: function () { abrirFicha(i.id); } })]));
      });
    });
  }
  function campo(id, rotulo, valor, tipo) {
    return h('div', {}, [h('label', { for: id, text: rotulo }), h('input', { id: id, value: valor, type: tipo || 'text', maxlength: 120, autocomplete: 'off' }), h('div', { class: 'erro-campo', id: 'e-' + id })]);
  }
  function abrirFicha(id) {
    var raiz = limpar($('ficha'));
    Promise.all([chamar('admin_ficha', { id: id }), S.ativs.length ? Promise.resolve({ ok: true, atividades: S.ativs }) : chamar('admin_atividades')]).then(function (rs) {
      var r = rs[0]; if (!ok(r)) return; if (rs[1].ok) S.ativs = rs[1].atividades;
      var i = r.inscrito, ativa = i.status === 'ATIVA';
      raiz.appendChild(h('div', { class: 'card', id: 'cardFicha' }, [
        h('div', { class: 'linha' }, [h('h2', { class: 'grow', text: i.nome }), statusBadge(i.status), badge('QR por e-mail: ' + (i.status_email || '—'), i.status_email === 'ENVIADO' ? 'ok' : 'fila')]),
        h('p', { class: 'sub', text: 'ID ' + i.id + ' · inscrito em ' + i.data_hora }),
        h('form', { id: 'formFicha', novalidate: true, onsubmit: function (ev) { ev.preventDefault(); salvarFicha(i.id); } }, [
          h('div', { class: 'form-grid' }, [campo('f-nome', 'Nome completo', i.nome), campo('f-curso', 'Curso', i.curso), campo('f-periodo', 'Período', i.periodo), campo('f-matricula', 'Matrícula', i.matricula), campo('f-email', 'E-mail', i.email, 'email')]),
          h('div', { class: 'linha topo-1' }, [
            h('button', { type: 'submit', text: 'Salvar alterações' }),
            ativa ? h('button', { type: 'button', class: 'sec', text: 'Reenviar QR por e-mail', onclick: function () { chamar('admin_reenviar_qr', { id: i.id }).then(function (x) { if (ok(x, 'QR reenviado para ' + $('f-email').value + '.')) abrirFicha(i.id); }); } }) : null,
            ativa ? h('button', { type: 'button', class: 'perigo', text: 'Cancelar inscrição no evento', onclick: function () {
              confirmar('Cancelar a inscrição de ' + i.nome + ' no evento e em todas as atividades? As vagas serão liberadas e a fila de espera avançará.').then(function (s) {
                if (s) chamar('admin_cancelar_inscrito', { id: i.id }).then(function (x) { if (ok(x, 'Inscrição cancelada. Pessoas promovidas da fila: ' + x.promovidos + '.')) abrirFicha(i.id); });
              }); } })
              : h('button', { type: 'button', text: 'Reativar inscrição', onclick: function () { chamar('admin_reativar_inscrito', { id: i.id }).then(function (x) { if (ok(x, 'Inscrição reativada. As vagas em atividades não são restauradas.')) abrirFicha(i.id); }); } })])])]));
      // atividades da pessoa
      var cardA = h('div', { class: 'card' }, [h('h2', { text: 'Atividades' })]);
      if (!r.atividades.length) cardA.appendChild(h('p', { class: 'contato', text: 'Nenhuma inscrição em atividades.' }));
      r.atividades.forEach(function (a) {
        cardA.appendChild(h('div', { class: 'item linha' }, [
          h('div', { class: 'grow' }, [h('strong', { text: a.titulo }), h('div', { class: 'sub', text: a.dia + ' · ' + a.inicio + ' às ' + a.fim })]),
          statusBadge(a.status + (a.status === 'FILA' && a.posicao ? ' ' + a.posicao + 'º' : '')),
          a.status !== 'CANCELADA' ? h('button', { type: 'button', class: 'perigo peq', text: 'Cancelar vaga', onclick: function () {
            confirmar('Cancelar a vaga de ' + i.nome + ' em "' + a.titulo + '"? O primeiro da fila será promovido.').then(function (s) {
              if (s) chamar('admin_vaga_cancelar', { iaId: a.iaId }).then(function (x) { if (ok(x, 'Vaga cancelada.')) abrirFicha(i.id); });
            }); } }) : null]));
      });
      if (ativa) {
        var sel = h('select', { id: 'selAtv', 'aria-label': 'Atividade' }, S.ativs.filter(function (a) { return a.exige; }).map(function (a) { return h('option', { value: a.id, text: a.dia.slice(8) + '/' + a.dia.slice(5, 7) + ' ' + a.inicio + ' — ' + a.titulo }); }));
        cardA.appendChild(h('div', { class: 'linha topo-1' }, [h('div', { class: 'grow' }, sel), h('button', { type: 'button', text: 'Inscrever nesta atividade', onclick: function () {
          chamar('admin_inscrever', { id: i.id, atividadeId: sel.value }).then(function (x) {
            if (ok(x)) { avisar('ok', x.status === 'FILA' ? 'Atividade lotada: a pessoa entrou na fila de espera (posição ' + x.posicao + ').' : 'Inscrição na atividade confirmada.'); abrirFicha(i.id); }
          }); } })]));
      }
      raiz.appendChild(cardA);
      // presença, portaria e e-mails
      raiz.appendChild(h('div', { class: 'card' }, [h('h2', { text: 'Presença e portaria' }),
        r.portaria.length ? h('table', { class: 'tabela-simples' }, [h('thead', {}, h('tr', {}, ['Dia', 'Tipo', 'Horário', 'Operador', 'Situação'].map(function (t) { return h('th', { text: t }); }))),
          h('tbody', {}, r.portaria.map(function (p) { return h('tr', {}, [p.dia, p.tipo === 'SAIDA' ? 'Saída' : 'Entrada', p.data_hora, p.operador, p.status === 'ANULADO' ? 'anulada' : 'válida'].map(function (t) { return h('td', { text: t }); })); }))]) : h('p', { class: 'contato', text: 'Sem registros na portaria.' }),
        r.presencas.length ? h('table', { class: 'tabela-simples topo-1' }, [h('thead', {}, h('tr', {}, ['Atividade', 'Horário', 'Operador', 'Situação'].map(function (t) { return h('th', { text: t }); }))),
          h('tbody', {}, r.presencas.map(function (p) { return h('tr', {}, [p.titulo, p.data_hora, p.operador, p.status === 'ANULADO' ? 'anulada' : 'válida'].map(function (t) { return h('td', { text: t }); })); }))]) : h('p', { class: 'contato', text: 'Sem presenças em atividades.' })]));
      raiz.appendChild(h('div', { class: 'card' }, [h('h2', { text: 'E-mails enviados ao inscrito' }),
        r.emails.length ? h('table', { class: 'tabela-simples' }, [h('thead', {}, h('tr', {}, ['Tipo', 'Situação', 'Criado', 'Enviado', 'Tentativas'].map(function (t) { return h('th', { text: t }); }))),
          h('tbody', {}, r.emails.map(function (m) { return h('tr', {}, [tipoEmail(m.tipo), m.status, m.criado_em, m.enviado_em, String(m.tentativas)].map(function (t) { return h('td', { text: t }); })); }))]) : h('p', { class: 'contato', text: 'Nenhum e-mail registrado.' })]));
      raiz.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  function salvarFicha(id) {
    document.querySelectorAll('#formFicha .erro-campo').forEach(function (e) { e.textContent = ''; });
    document.querySelectorAll('#formFicha [aria-invalid]').forEach(function (e) { e.removeAttribute('aria-invalid'); });
    chamar('admin_editar', { id: id, campos: { nome: $('f-nome').value, curso: $('f-curso').value, periodo: $('f-periodo').value, matricula: $('f-matricula').value, email: $('f-email').value } }).then(function (r) {
      if (r.ok) { avisar('ok', r.semMudancas ? 'Nenhuma alteração a salvar.' : 'Dados salvos.' + (r.emailReenviado ? ' O QR foi reenviado ao novo e-mail.' : '')); if (!r.semMudancas) { abrirFicha(id); buscar(); } return; }
      if (r.erros) Object.keys(r.erros).forEach(function (k) { var e = $('e-f-' + k); if (e) e.textContent = r.erros[k]; var inp = $('f-' + k); if (inp) inp.setAttribute('aria-invalid', 'true'); });
      avisar('erro', r.mensagem);
    });
  }

  // ---------- Atividades ----------
  function carregarAtividades() {
    var raiz = limpar($('p-atividades'));
    chamar('admin_atividades').then(function (r) {
      if (!ok(r)) return; S.ativs = r.atividades;
      raiz.appendChild(h('p', { class: 'contato', text: 'Altere vagas e abertura e clique em Salvar. Aumentar as vagas promove a fila de espera automaticamente. Vagas máximas vazias significam sem limite.' }));
      r.atividades.filter(function (a) { return a.exige; }).forEach(function (a) {
        var max = h('input', { id: 'max-' + a.id, class: 'num', type: 'number', min: '0', max: '9999', value: a.vagas_max === '' ? '' : String(a.vagas_max), inputmode: 'numeric' });
        var min = h('input', { id: 'min-' + a.id, class: 'num', type: 'number', min: '0', max: '9999', value: a.vagas_min === '' ? '' : String(a.vagas_min), inputmode: 'numeric' });
        var aberta = h('input', { id: 'ab-' + a.id, type: 'checkbox' }); aberta.checked = a.aberta;
        var lista = h('div', { class: 'topo-1', 'aria-live': 'polite' });
        raiz.appendChild(h('div', { class: 'card' }, [
          h('div', { class: 'linha' }, [h('h2', { class: 'grow', text: a.titulo }), badge(a.aberta ? 'Inscrições abertas' : 'Inscrições fechadas', a.aberta ? 'ok' : 'lot')]),
          h('p', { class: 'sub', text: a.id + ' · ' + a.dia + ' · ' + a.inicio + ' às ' + a.fim }),
          h('p', {}, ['Confirmados: ', h('strong', { text: String(a.ocupadas) }), ' · Vagas restantes: ', h('strong', { text: String(a.restantes) }), ' · Na fila: ', h('strong', { text: String(a.na_fila) })]),
          h('div', { class: 'linha' }, [
            h('div', {}, [h('label', { for: max.id, text: 'Vagas máximas' }), max]), h('div', {}, [h('label', { for: min.id, text: 'Vagas mínimas' }), min]),
            h('label', { class: 'chk', for: aberta.id }, [aberta, 'Inscrições abertas'])]),
          h('div', { class: 'linha topo-1' }, [
            h('button', { type: 'button', text: 'Salvar', onclick: function () {
              chamar('admin_atividade_set', { id: a.id, campos: { vagas_max: max.value.trim(), vagas_min: min.value.trim(), aberta: aberta.checked } }).then(function (x) {
                if (ok(x, x && x.semMudancas ? 'Nenhuma alteração a salvar.' : 'Atividade atualizada.')) carregarAtividades(); }); } }),
            h('button', { type: 'button', class: 'sec', text: 'Ver inscritos', onclick: function () { verInscritos(a, lista); } })]),
          lista]));
      });
    });
  }
  function verInscritos(a, box) {
    chamar('admin_atividade_lista', { id: a.id }).then(function (r) {
      if (!ok(r)) return; limpar(box);
      if (!r.inscritos.length) { box.appendChild(h('p', { class: 'contato', text: 'Ninguém inscrito ainda.' })); return; }
      var linhas = r.inscritos.map(function (i) { return [i.nome, i.matricula, i.email, i.status, i.posicao === null ? '' : i.posicao, i.presenca]; });
      box.appendChild(h('div', { class: 'linha' }, [h('strong', { class: 'grow', text: r.inscritos.length + ' pessoa(s)' }),
        h('button', { type: 'button', class: 'sec peq', text: 'Baixar CSV', onclick: function () { baixar('inscritos-' + a.id + '-' + hojeStr() + '.csv', csv(['nome', 'matricula', 'email', 'situacao', 'posicao_fila', 'presenca'], linhas)); } })]));
      box.appendChild(h('table', { class: 'tabela-simples' }, [h('thead', {}, h('tr', {}, ['Nome', 'Matrícula', 'Situação', 'Fila', 'Presença'].map(function (t) { return h('th', { text: t }); }))),
        h('tbody', {}, r.inscritos.map(function (i) { return h('tr', {}, [i.nome, i.matricula, i.status, i.posicao === null ? '' : i.posicao + 'º', i.presenca ? 'sim' : ''].map(function (t) { return h('td', { text: String(t) }); })); }))]));
    });
  }

  // ---------- Alertas e e-mails ----------
  function carregarAlertas() {
    var raiz = limpar($('p-alertas'));
    chamar('admin_alertas').then(function (r) {
      if (!ok(r)) return;
      raiz.appendChild(h('div', { class: 'card' }, [h('div', { class: 'linha' }, [h('h2', { class: 'grow', text: 'E-mails pendentes ou com erro (' + r.emailsPendentes.length + ')' }),
        h('button', { type: 'button', text: 'Reenviar pendentes agora', onclick: function () { chamar('admin_reprocessar').then(function (x) { if (ok(x, x.enviados + ' e-mail(s) enviado(s).')) carregarAlertas(); }); } })]),
        r.emailsPendentes.length ? h('table', { class: 'tabela-simples' }, [h('thead', {}, h('tr', {}, ['Tipo', 'Situação', 'Inscrito', 'Tentativas', 'Erro'].map(function (t) { return h('th', { text: t }); }))),
          h('tbody', {}, r.emailsPendentes.map(function (m) { return h('tr', {}, [tipoEmail(m.tipo), m.status, (m.nome || '') + ' ' + (m.email || ''), String(m.tentativas), m.erro || ''].map(function (t) { return h('td', { text: t }); })); }))]) : h('p', { class: 'contato', text: 'Nenhum e-mail pendente.' })]));
      raiz.appendChild(h('div', { class: 'card' }, [h('h2', { text: 'Alertas recentes' }),
        r.alertas.length ? r.alertas.map(function (a) { return h('div', { class: 'item' }, [h('div', { class: 'linha' }, [badge(a.tipo, a.notificado ? 'lot' : 'fila'), h('span', { class: 'sub', text: a.data_hora })]), h('div', { text: a.mensagem })]); }) : h('p', { class: 'contato', text: 'Nenhum alerta.' })]));
    });
  }

  // ---------- Dados (exportação) ----------
  var TABELAS = [['base', 'Base de análise (uma linha por inscrito)'], ['inscritos', 'Inscritos'], ['atividades_inscricoes', 'Inscrições em atividades (com fila)'],
    ['portaria', 'Portaria (entradas e saídas)'], ['presenca', 'Presença em atividades'], ['permanencia', 'Permanência por dia'], ['certificados', 'Horas para certificados']];
  function montarDados() {
    var raiz = limpar($('p-dados'));
    raiz.appendChild(h('div', { class: 'card' }, [h('h2', { text: 'Exportar dados' }),
      h('p', { class: 'contato', text: 'Os arquivos CSV abrem no Excel e no Google Planilhas. Eles contêm dados pessoais: guarde com cuidado e apague quando não precisar mais.' })]
      .concat(TABELAS.map(function (t) {
        return h('div', { class: 'item linha' }, [h('span', { class: 'grow', text: t[1] }), h('button', { type: 'button', class: 'sec peq', text: 'Baixar CSV', onclick: function () {
          chamar('admin_tabela', { nome: t[0] }).then(function (r) { if (ok(r)) { baixar(t[0] + '-' + hojeStr() + '.csv', csv(r.headers, r.rows)); avisar('ok', r.rows.length + ' linha(s) exportada(s).'); } }); } })]);
      }))));
  }

  // ---------- aplicativo instalável (PWA) ----------
  var evInstalar = null;
  function emApp() { return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true; }
  function atualizarRede() { $('chRede').classList.toggle('oculto', navigator.onLine !== false); }
  window.addEventListener('online', atualizarRede); window.addEventListener('offline', atualizarRede); atualizarRede();
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); evInstalar = e; if (!emApp()) $('btnInstalar').classList.remove('oculto'); });
  window.addEventListener('appinstalled', function () { evInstalar = null; $('btnInstalar').classList.add('oculto'); $('dicaInstalar').classList.add('oculto'); });
  $('btnInstalar').addEventListener('click', function () {
    if (!evInstalar) return;
    evInstalar.prompt(); evInstalar.userChoice.then(function () { evInstalar = null; $('btnInstalar').classList.add('oculto'); });
  });
  var ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (ios && !emApp()) $('dicaInstalar').classList.remove('oculto');
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    var recarregar = false;
    navigator.serviceWorker.register('sw.js').then(function (reg) {
      function oferecer(w) { $('avisoAtualiza').classList.remove('oculto'); $('btnAtualiza').onclick = function () { recarregar = true; w.postMessage('ATUALIZAR'); }; }
      if (reg.waiting && navigator.serviceWorker.controller) oferecer(reg.waiting);
      reg.addEventListener('updatefound', function () {
        var w = reg.installing; if (!w) return;
        w.addEventListener('statechange', function () { if (w.state === 'installed' && navigator.serviceWorker.controller) oferecer(w); });
      });
    }).catch(function () { /* funciona sem o modo instalável */ });
    navigator.serviceWorker.addEventListener('controllerchange', function () { if (recarregar) location.reload(); });
  }

  // ---------- inicialização ----------
  $('formLogin').addEventListener('submit', entrar);
  $('btnSair').addEventListener('click', function () { sair(); });
  ABAS.forEach(function (a) { $('t-' + a).addEventListener('click', function () { irPara(a); }); });
  $('q').addEventListener('input', function () { clearTimeout(tBusca); tBusca = setTimeout(buscar, 350); });
  try {
    var salvo = JSON.parse(sessionStorage.getItem('adm') || 'null');
    if (salvo && salvo.p && salvo.o) { S.pin = salvo.p; S.operador = salvo.o; S.logado = true; chamar('admin_resumo').then(function (r) { if (r.ok) mostrarApp(r); else sair(); }); }
  } catch (e) { /* ignora */ }
})();
