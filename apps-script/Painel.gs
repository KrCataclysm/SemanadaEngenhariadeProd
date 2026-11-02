/** Painel do organizador e base plana para análise de dados (tabela dinâmica, Looker Studio, BigQuery, Excel). */

function mediaNum_(lista) {
  var v = lista.map(Number).filter(function (n) { return !isNaN(n) && n !== 0; });
  if (!v.length) return '';
  return Math.round(v.reduce(function (a, b) { return a + b; }, 0) / v.length);
}

/** Permanência por pessoa/dia a partir da Portaria (pares ENTRADA→SAÍDA). */
function calcularPermanencia_() {
  var linhas = readAll_(SHEETS.PORTARIA).filter(function (r) { return r.status !== 'ANULADO'; });
  linhas.sort(function (a, b) { return Number(a.ts) - Number(b.ts); });
  var grupos = {};
  linhas.forEach(function (r) {
    var k = r.inscrito_id + '|' + dia_(r.dia);
    var g = grupos[k] = grupos[k] || { insc: r.inscrito_id, dia: dia_(r.dia), aberto: null, min: 0, pend: false };
    if (r.tipo === 'ENTRADA') {
      if (g.aberto !== null) g.pend = true;
      g.aberto = Number(r.ts);
    } else if (g.aberto !== null) {
      g.min += (Number(r.ts) - g.aberto) / 60000;
      g.aberto = null;
    }
  });
  Object.keys(grupos).forEach(function (k) { if (grupos[k].aberto !== null) grupos[k].pend = true; });
  return grupos;
}

function contar_(lista, chave) {
  var m = {};
  lista.forEach(function (x) { var k = chave(x) || '(não informado)'; m[k] = (m[k] || 0) + 1; });
  return Object.keys(m).sort(function (a, b) { return m[b] - m[a] || (a < b ? -1 : 1); }).map(function (k) { return [k, m[k]]; });
}

function atualizarBase_() {
  var insc = readAll_(SHEETS.INSC), ia = readAll_(SHEETS.IA), pres = readAll_(SHEETS.PRES).filter(function (r) { return r.status !== 'ANULADO'; });
  var grupos = calcularPermanencia_();
  var linhas = insc.map(function (i) {
    var conf = 0, fila = 0, presencas = 0, dias = 0, min = 0, pend = false;
    ia.forEach(function (r) { if (String(r.inscrito_id) === String(i.id)) { if (r.status === 'CONFIRMADA') conf++; else if (r.status === 'FILA') fila++; } });
    pres.forEach(function (r) { if (String(r.inscrito_id) === String(i.id)) presencas++; });
    Object.keys(grupos).forEach(function (k) {
      var g = grupos[k]; if (String(g.insc) !== String(i.id)) return;
      dias++; min += g.min; if (g.pend) pend = true;
    });
    min = Math.round(min * 10) / 10;
    return [i.id, i.nome, i.curso, i.periodo, i.matricula, i.email, i.data_hora, i.status, i.status_email,
      conf, fila, presencas, dias, min, Math.round(min / 60 * 100) / 100, pend ? 'SIM' : 'NAO'];
  });
  substituirLinhas_(SHEETS.BASE, linhas);
}

function atualizarPainel_() {
  var ss = ss_();
  var sh = ss.getSheetByName(SHEETS.PAINEL) || ss.insertSheet(SHEETS.PAINEL);
  var insc = readAll_(SHEETS.INSC), ativas = insc.filter(function (i) { return i.status === 'ATIVA'; });
  var ia = readAll_(SHEETS.IA), pres = readAll_(SHEETS.PRES).filter(function (r) { return r.status !== 'ANULADO'; });
  var port = readAll_(SHEETS.PORTARIA).filter(function (r) { return r.status !== 'ANULADO'; });
  var outbox = readAll_(SHEETS.OUTBOX), grupos = calcularPermanencia_();
  var blocos = [];
  blocos.push(['RESUMO', [
    ['Atualizado em', now_()],
    ['Inscritos ativos', ativas.length], ['Inscrições canceladas', insc.length - ativas.length],
    ['E-mails de confirmação enviados', ativas.filter(function (i) { return i.status_email === 'ENVIADO'; }).length],
    ['E-mails pendentes (todos os tipos)', outbox.filter(function (o) { return o.status === 'PENDENTE'; }).length],
    ['E-mails com erro definitivo', outbox.filter(function (o) { return o.status === 'ERRO'; }).length],
    ['Tempo médio de envio do e-mail (ms)', mediaNum_(insc.map(function (i) { return i.tempo_envio_ms; }))],
    ['Tempo médio de leitura no scanner, no aparelho (ms)', mediaNum_(port.concat(pres).map(function (r) { return r.local_ms; }))],
    ['Tempo médio de gravação no servidor (ms)', mediaNum_(port.concat(pres).map(function (r) { return r.server_ms; }))],
    ['Leituras na portaria', port.length], ['Presenças em atividades', pres.length]
  ]]);
  blocos.push(['INSCRITOS POR CURSO', contar_(ativas, function (i) { return i.curso; })]);
  blocos.push(['INSCRITOS POR PERÍODO', contar_(ativas, function (i) { return i.periodo; })]);
  var porDia = {};
  Object.keys(grupos).forEach(function (k) { var g = grupos[k]; (porDia[g.dia] = porDia[g.dia] || []).push(g); });
  blocos.push(['PRESENÇA NA PORTARIA POR DIA (pessoas, permanência média em min, saídas pendentes)', Object.keys(porDia).sort().map(function (d) {
    var l = porDia[d];
    return [d, l.length, Math.round(l.reduce(function (a, g) { return a + g.min; }, 0) / l.length), l.filter(function (g) { return g.pend; }).length];
  })]);
  var ativ = readAll_(SHEETS.ATIV).filter(function (a) { return String(a.exige_inscricao).toUpperCase() === 'SIM'; });
  blocos.push(['ATIVIDADES COM INSCRIÇÃO (vagas, confirmados, fila, presentes, comparecimento)', ativ.map(function (a) {
    var conf = ia.filter(function (r) { return String(r.atividade_id) === String(a.id) && r.status === 'CONFIRMADA'; }).length;
    var fila = ia.filter(function (r) { return String(r.atividade_id) === String(a.id) && r.status === 'FILA'; }).length;
    var pr = pres.filter(function (r) { return String(r.atividade_id) === String(a.id); }).length;
    return [a.id + ' — ' + a.titulo, a.vagas_max === '' ? 'sem limite' : a.vagas_max, conf, fila, pr, conf ? Math.round(pr / conf * 100) + '%' : ''];
  })]);

  sh.clear();
  var linha = 1;
  blocos.forEach(function (b) {
    sh.getRange(linha, 1).setValue(b[0]).setFontWeight('bold').setBackground('#0F1B2D').setFontColor('#FFFFFF');
    linha++;
    if (b[1].length) {
      var larg = Math.max.apply(null, b[1].map(function (r) { return r.length; }));
      var m = b[1].map(function (r) { var c = r.slice(); while (c.length < larg) c.push(''); return c; });
      sh.getRange(linha, 1, m.length, larg).setValues(m);
      linha += m.length;
    }
    linha++;
  });
  invalidar_(SHEETS.PAINEL);
  atualizarBase_();
  return { inscritos: ativas.length };
}

/** Cópia de segurança da planilha inteira no Drive do organizador. */
function criarBackup_() {
  var nome = 'Backup Semana Eng. Produção ' + now_();
  var copia = ss_().copy(nome);
  log_('backup', 0, copia.getUrl());
  return copia.getUrl();
}

function backupDiario() {
  try { criarBackup_(); } catch (e) { alert_('BACKUP_FALHOU', hoje_(), 'A cópia de segurança automática falhou: ' + e + '. Use o menu "Criar cópia de segurança agora".'); }
}
