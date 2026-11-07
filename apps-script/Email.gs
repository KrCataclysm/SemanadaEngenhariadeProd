/** E-mails (fila de envio, reenvio automático, modelo visual) e resumo de alertas ao organizador. */

var COR = { azul: '#0F1B2D', laranja: '#D65B1F', bege: '#D9D1C8', cinza: '#8C8C8C', grafite: '#222222' };

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function qrBlob_(texto) {
  var qr = qrcode(0, 'M');
  qr.addData(texto);
  qr.make();
  var b64 = qr.createDataURL(8, 4).split(',')[1];
  return Utilities.newBlob(Utilities.base64Decode(b64), 'image/gif', 'qr.gif');
}

function fmtDia_(iso) {
  var p = dia_(iso).split('-');
  return p[2] + '/' + p[1];
}

function minhasAtividadesTexto_(inscritoId) {
  var itens = [];
  readAll_(SHEETS.IA).forEach(function (r) {
    if (String(r.inscrito_id) !== String(inscritoId)) return;
    if (r.status !== 'CONFIRMADA' && r.status !== 'FILA') return;
    var a = getAtividade_(r.atividade_id);
    if (!a) return;
    var base = fmtDia_(a.dia) + ', das ' + hm_(a.inicio) + ' às ' + hm_(a.fim) + ' — ' + a.titulo;
    itens.push(r.status === 'FILA' ? base + ' (fila de espera, posição ' + r.posicao + ')' : base + ' (inscrição confirmada)');
  });
  return itens;
}

function buildEmail_(insc, tipo, atividade) {
  var cfg = getConfig_();
  var evento = cfg.NOME_EVENTO || 'Semana de Engenharia de Produção';
  var site = String(cfg.SITE_URL || SITE_URL_PADRAO).replace(/\/$/, '');
  var link = site ? site + '/inscricao/atividades.html?t=' + insc.token : '';
  var linkQr = site ? site + '/inscricao/qr.html?t=' + insc.token : '';
  var assunto, titulo, intro;
  var ia = null;
  if (atividade) {
    ia = readAll_(SHEETS.IA).filter(function (r) {
      return String(r.inscrito_id) === String(insc.id) && String(r.atividade_id) === String(atividade.id) &&
        (r.status === 'CONFIRMADA' || r.status === 'FILA');
    })[0];
  }
  var nomeAt = atividade ? atividade.titulo + ' (' + fmtDia_(atividade.dia) + ', das ' + hm_(atividade.inicio) + ' às ' + hm_(atividade.fim) + ')' : '';
  if (tipo === 'CONFIRMACAO') {
    assunto = evento + ' — Sua inscrição está confirmada';
    titulo = 'Inscrição confirmada';
    intro = 'Sua inscrição na ' + evento + ' foi confirmada. O evento acontecerá nos dias 11, 12 e 13 de novembro de 2026.';
  } else if (tipo === 'ATIVIDADE') {
    assunto = evento + ' — Inscrição em atividade confirmada';
    titulo = 'Inscrição em atividade confirmada';
    intro = 'Sua vaga na atividade "' + nomeAt + '" foi confirmada.';
  } else if (tipo === 'FILA') {
    assunto = evento + ' — Você está na fila de espera';
    titulo = 'Fila de espera';
    intro = 'Todas as vagas da atividade "' + nomeAt + '" estão ocupadas. Você está na posição ' + (ia ? ia.posicao : '') +
      ' da fila de espera. Caso uma vaga seja liberada, você será inscrito automaticamente e receberá um novo e-mail. Não é necessário realizar nenhuma ação.';
  } else {
    assunto = evento + ' — Você saiu da fila de espera e entrou na atividade';
    titulo = 'Você entrou na atividade';
    intro = 'Uma vaga foi liberada: você saiu da fila de espera e agora está inscrito na atividade "' + nomeAt + '".';
  }

  var lista = minhasAtividadesTexto_(insc.id);
  var listaHtml = lista.length
    ? '<p style="margin:20px 0 6px;font-weight:700;color:' + COR.azul + '">Suas atividades</p><ul style="margin:0;padding-left:20px">' +
      lista.map(function (x) { return '<li style="margin-bottom:6px">' + esc_(x) + '</li>'; }).join('') + '</ul>'
    : '';
  // O botão "Escolher atividades" só aparece quando há atividade com inscrição aberta (ou a pessoa já tem atividades). Senão, orienta a acompanhar o Instagram.
  var temAbertas = readAll_(SHEETS.ATIV).some(function (a) {
    return String(a.exige_inscricao).toUpperCase() === 'SIM' && String(a.inscricoes_abertas).toUpperCase() === 'SIM';
  });
  var mostrarAtiv = !!link && (temAbertas || lista.length > 0);
  var instagram = cfg.INSTAGRAM_CAEPRO || 'https://www.instagram.com/caeproufpi';
  var novidadesHtml = !mostrarAtiv
    ? '<p style="margin:22px 0 0;font-size:19px;line-height:1.4;font-weight:700">Novidades em breve: acompanhe o Instagram da CAEPRO para mais informações: <a href="' + esc_(instagram) + '" style="color:' + COR.laranja + ';font-weight:700">@caeproufpi</a>.</p>'
    : '';
  var botaoQr = linkQr
    ? '<p style="margin:14px 0 0;font-size:13px;color:' + COR.grafite + '">Se a imagem do QR Code não aparecer, abra-o pelo botão abaixo:</p>' +
      '<p style="margin:10px 0 0"><a href="' + esc_(linkQr) + '" style="background:' + COR.azul + ';color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:6px;display:inline-block">Abrir meu QR Code</a></p>'
    : '';
  var botao = (mostrarAtiv
    ? '<p style="margin:24px 0"><a href="' + esc_(link) + '" style="background:#C2501A;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:6px;display:inline-block">Escolher atividades e consultar fila</a></p>'
    : novidadesHtml) +
    ((mostrarAtiv || linkQr) ? '<p style="font-size:12px;color:#555555;margin:8px 0 8px">Os links deste e-mail são pessoais: não os compartilhe.</p>' : '');
  var logo = '<img src="cid:logo" alt="" width="56" height="56" style="border-radius:50%;background:#fff;display:block">';

  var html =
    '<div style="background:' + COR.bege + ';padding:16px 8px;font-family:Inter,Arial,sans-serif;color:' + COR.grafite + '">' +
    '<table role="presentation" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:10px;overflow:hidden" cellspacing="0" cellpadding="0">' +
    '<tr><td style="background:' + COR.azul + ';padding:22px 28px;border-bottom:4px solid ' + COR.laranja + '"><table role="presentation" width="100%"><tr>' +
    '<td><div style="font-family:Sora,Arial,sans-serif;font-size:13px;letter-spacing:2px;color:' + COR.bege + '">11, 12 E 13 DE NOVEMBRO DE 2026</div>' +
    '<div style="font-family:Sora,Arial,sans-serif;font-size:22px;font-weight:700;color:#ffffff;margin-top:6px">' + esc_(evento) + '</div></td>' +
    '<td width="64" align="right">' + logo + '</td></tr></table></td></tr>' +
    '<tr><td style="padding:24px 20px">' +
    '<h1 style="font-family:Sora,Arial,sans-serif;font-size:20px;color:' + COR.azul + ';margin:0 0 14px">' + esc_(titulo) + '</h1>' +
    '<p style="margin:0 0 10px">Prezado(a) ' + esc_(insc.nome) + ',</p>' +
    '<p style="margin:0 0 18px;line-height:1.5">' + esc_(intro) + '</p>' +
    '<div style="text-align:center;background:' + COR.bege + ';border-radius:8px;padding:16px 12px">' +
    '<div style="font-family:Sora,Arial,sans-serif;font-weight:700;color:' + COR.azul + ';margin-bottom:10px">SEU QR CODE DE ACESSO</div>' +
    '<img src="cid:qr" alt="QR Code de acesso" width="240" height="240" style="display:block;margin:0 auto;width:100%;max-width:240px;height:auto;box-sizing:border-box;background:#ffffff;padding:8px;border-radius:6px">' + botaoQr + '</div>' +
    listaHtml + botao +
    '<p style="margin:22px 0 6px;font-weight:700;color:' + COR.azul + '">Instruções</p>' +
    '<ul style="margin:0;padding-left:20px;line-height:1.5">' +
    '<li>Apresente este QR Code na entrada e na saída em cada dia do evento.</li>' +
    '<li>Se a imagem do QR Code não aparecer, toque em \u201cAbrir meu QR Code\u201d ou abra o arquivo anexo (QRCode-Semana-Engenharia-Producao.gif); ele também pode ser salvo na galeria.</li>' +
    '<li>Mantenha o brilho do celular no máximo ou leve o QR Code impresso.</li>' +
    '<li>O QR Code é pessoal e intransferível.</li></ul>' +
    '<p style="margin:24px 0 0;font-size:13px;color:' + COR.cinza + ';line-height:1.5">' + esc_(CONTATO_TXT) + '</p>' +
    '</td></tr></table></div>';

  var texto = 'Prezado(a) ' + insc.nome + ',\n\n' + intro + '\n\n' + (lista.length ? 'Suas atividades:\n- ' + lista.join('\n- ') + '\n\n' : '') +
    (linkQr ? 'Abrir meu QR Code: ' + linkQr + '\n' : '') + (mostrarAtiv ? 'Escolher atividades: ' + link + '\n\n' : 'Novidades em breve: acompanhe o Instagram da CAEPRO para mais informações: ' + instagram + '\n\n') +
    'Apresente o QR Code (anexo ao e-mail) na entrada e na saída em cada dia do evento. Ele é pessoal e intransferível.\n\n' + CONTATO_TXT;
  return { assunto: assunto, html: html, texto: texto };
}

function enviarEmail_(insc, tipo, atividade) {
  var e = buildEmail_(insc, tipo, atividade);
  var qr = qrBlob_(String(insc.token));
  MailApp.sendEmail({
    to: insc.email, subject: e.assunto, body: e.texto, htmlBody: e.html,
    name: getConfig_().NOME_EVENTO || 'Semana de Engenharia de Produção',
    replyTo: getConfig_().EMAIL_CAEPRO || '',
    inlineImages: { qr: qr, logo: logoBlob_() },
    // O QR também segue como arquivo anexo: aparece mesmo quando o aplicativo de e-mail bloqueia imagens do corpo da mensagem.
    attachments: [qr.copyBlob().setName('QRCode-Semana-Engenharia-Producao.gif')]
  });
}

function ehErroDeCota_(msg) {
  return /too many times|quota|limit exceeded|service invoked|limite/i.test(String(msg));
}

/** Envia e-mails pendentes (confirmação > promoção > fila > atividade). */
function processOutbox_(max, soInscrito) {
  var pend = readAll_(SHEETS.OUTBOX).filter(function (o) {
    return o.status === 'PENDENTE' && (!soInscrito || String(o.inscrito_id) === String(soInscrito));
  });
  pend.sort(function (a, b) {
    var d = (PRIORIDADE_EMAIL[a.tipo] || 9) - (PRIORIDADE_EMAIL[b.tipo] || 9);
    return d !== 0 ? d : a._row - b._row;
  });
  var enviados = 0;
  for (var i = 0; i < pend.length && enviados < max; i++) {
    var o = pend[i];
    if (MailApp.getRemainingDailyQuota() <= 0) {
      alert_('COTA_EMAIL', hoje_(), 'A cota diária de envio de e-mails foi atingida. Há ' + pend.length +
        ' e-mail(s) pendente(s); o reenvio será feito automaticamente quando a cota renovar.');
      break;
    }
    var insc = readAll_(SHEETS.INSC).filter(function (x) { return String(x.id) === String(o.inscrito_id); })[0];
    var atv = o.atividade_id ? getAtividade_(o.atividade_id) : null;
    var t0 = Date.now();
    try {
      if (!insc) throw new Error('Inscrito não encontrado');
      enviarEmail_(insc, o.tipo, atv);
      var ms = Date.now() - t0;
      updateRow_(SHEETS.OUTBOX, o._row, { status: 'ENVIADO', enviado_em: now_(), tempo_ms: ms, tentativas: Number(o.tentativas || 0) + 1, erro: '' });
      if (o.tipo === 'CONFIRMACAO') updateRow_(SHEETS.INSC, insc._row, { status_email: 'ENVIADO', tempo_envio_ms: ms });
      log_('email_enviado', ms, o.tipo + ' ' + o.inscrito_id);
      enviados++;
    } catch (err) {
      var msg = String(err && err.message ? err.message : err);
      if (ehErroDeCota_(msg)) {
        alert_('COTA_EMAIL', hoje_(), 'Limite de envio de e-mails atingido (' + msg + '). Os pendentes serão reenviados automaticamente quando a cota renovar.');
        break;
      }
      var tent = Number(o.tentativas || 0) + 1;
      if (tent >= MAX_TENTATIVAS_EMAIL) {
        updateRow_(SHEETS.OUTBOX, o._row, { status: 'ERRO', tentativas: tent, erro: msg });
        if (insc && o.tipo === 'CONFIRMACAO') updateRow_(SHEETS.INSC, insc._row, { status_email: 'ERRO' });
        alert_('FALHA_EMAIL', o.id, 'Falha definitiva ao enviar e-mail ' + o.tipo + ' para o inscrito ' + o.inscrito_id +
          (insc ? ' (' + insc.nome + ', ' + insc.email + ')' : '') + ': ' + msg + '. Corrija o e-mail na aba Inscritos e use "Reenviar QR".');
      } else {
        updateRow_(SHEETS.OUTBOX, o._row, { tentativas: tent, erro: msg });
      }
      log_('email_falha', Date.now() - t0, o.tipo + ' ' + o.inscrito_id + ': ' + msg);
    }
  }
  return enviados;
}

/** Envia ao organizador um resumo dos alertas novos (no máximo 1 e-mail a cada 30 min). */
function sendAlertDigest_() {
  var pend = readAll_(SHEETS.ALERTAS).filter(function (a) { return a.notificado !== 'SIM'; });
  if (!pend.length) return false;
  var props = PropertiesService.getScriptProperties();
  var ultimo = Number(props.getProperty('ULTIMO_DIGEST') || 0);
  if (Date.now() - ultimo < 30 * 60000) return false;
  if (MailApp.getRemainingDailyQuota() <= 0) return false;
  var cfg = getConfig_();
  var para = cfg.EMAIL_ALERTAS || Session.getEffectiveUser().getEmail();
  var emailsPend = readAll_(SHEETS.OUTBOX).filter(function (o) { return o.status === 'PENDENTE'; }).length;
  var corpo = 'Alertas do sistema de credenciamento:\n\n' +
    pend.map(function (a) { return '• [' + a.tipo + '] ' + a.mensagem; }).join('\n') +
    '\n\nE-mails pendentes de envio: ' + emailsPend + '.\nDetalhes na aba Alertas da planilha.';
  MailApp.sendEmail(para, '[Credenciamento] ' + pend.length + ' alerta(s)', corpo);
  pend.forEach(function (a) { updateRow_(SHEETS.ALERTAS, a._row, { notificado: 'SIM' }); });
  props.setProperty('ULTIMO_DIGEST', String(Date.now()));
  return true;
}
