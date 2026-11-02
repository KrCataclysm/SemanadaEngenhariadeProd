/** Ações do menu da planilha. */

function ui_() { return SpreadsheetApp.getUi(); }
function alerta_(t, m) { ui_().alert(t, m, ui_().ButtonSet.OK); }

function linhaSelecionada_(nomeAba) {
  var sh = ss_().getActiveSheet();
  if (sh.getName() !== nomeAba) { alerta_('Seleção', 'Selecione uma linha na aba ' + nomeAba + '.'); return null; }
  var r = sh.getActiveRange().getRow();
  if (r < 2) { alerta_('Seleção', 'Selecione uma linha de dados (não o cabeçalho).'); return null; }
  return r;
}

function inscritoDaLinha_(row) {
  var id = sheet_(SHEETS.INSC).getRange(row, 1).getValue();
  return readAll_(SHEETS.INSC).filter(function (x) { return String(x.id) === String(id); })[0];
}

function menuSetup() {
  setup_();
  alerta_('Planilha configurada', 'Abas criadas. Preencha SITE_URL, PIN e EMAIL_ALERTAS na aba Config e depois use "Ativar envio automático".');
}

function menuInstalarGatilhos() {
  installTriggers_();
  alerta_('Envio automático ativado', 'A cada 10 minutos o sistema reenvia e-mails pendentes, promove a fila de espera e resume alertas.');
}

function menuReprocessar() {
  resetConfigCache_();
  var n = processOutbox_(60);
  sendAlertDigest_();
  alerta_('Reprocessamento', n + ' e-mail(s) enviado(s).');
}

function menuRecalcular() {
  promoteAll_();
  alerta_('Recalculado', 'Vagas e fila de espera atualizadas.');
}

function menuInfoEditar() {
  alerta_('Editar inscrito', 'Edite diretamente as células da aba Inscritos (nome, curso, período, e-mail). ' +
    'Ao corrigir o e-mail, use "Reenviar QR do inscrito". A matrícula deve continuar única.');
}

function menuReenviarQr() {
  var row = linhaSelecionada_(SHEETS.INSC); if (!row) return;
  var insc = inscritoDaLinha_(row);
  if (!insc || insc.status !== 'ATIVA') { alerta_('Reenviar QR', 'Inscrito não encontrado ou cancelado.'); return; }
  withLock_(function () { enqueueEmail_(insc.id, 'CONFIRMACAO'); });
  updateRow_(SHEETS.INSC, insc._row, { status_email: 'PENDENTE' });
  processOutbox_(3);
  alerta_('Reenviar QR', 'Reenvio solicitado para ' + insc.email + '.');
}

function menuCancelarInscrito() {
  var row = linhaSelecionada_(SHEETS.INSC); if (!row) return;
  var insc = inscritoDaLinha_(row); if (!insc) return;
  var r = ui_().alert('Cancelar inscrição', 'Cancelar a inscrição de ' + insc.nome + ' no evento e em todas as atividades? As vagas serão liberadas.', ui_().ButtonSet.YES_NO);
  if (r !== ui_().Button.YES) return;
  var res = cancelarInscrito_(insc.id);
  try { processOutbox_(10); } catch (e) { /* tick reenvia */ }
  alerta_('Cancelamento', res.ok ? 'Inscrição cancelada. Pessoas promovidas da fila: ' + res.promovidos + '.' : res.mensagem);
}

function menuCancelarVaga() {
  var row = linhaSelecionada_(SHEETS.IA); if (!row) return;
  var iaId = sheet_(SHEETS.IA).getRange(row, 1).getValue();
  var r = ui_().alert('Cancelar vaga', 'Cancelar esta inscrição em atividade? A vaga será liberada para a fila de espera.', ui_().ButtonSet.YES_NO);
  if (r !== ui_().Button.YES) return;
  var res = cancelarVaga_(iaId);
  try { processOutbox_(10); } catch (e) { /* tick reenvia */ }
  alerta_('Cancelamento', res.ok ? 'Vaga cancelada. Pessoas promovidas da fila: ' + (res.promovidos || 0) + '.' : res.mensagem);
}

function menuInscreverManual() {
  var row = linhaSelecionada_(SHEETS.INSC); if (!row) return;
  var insc = inscritoDaLinha_(row); if (!insc) return;
  var resp = ui_().prompt('Inscrever ' + insc.nome, 'Informe o ID da atividade (coluna id da aba Atividades, ex.: A15):', ui_().ButtonSet.OK_CANCEL);
  if (resp.getSelectedButton() !== ui_().Button.OK) return;
  var res = inscreverManual_(insc.id, resp.getResponseText().trim());
  alerta_('Inscrição em atividade', res.ok ? 'Resultado: ' + res.status + (res.posicao ? ' (posição ' + res.posicao + ')' : '') : res.mensagem);
}

function menuPermanencia() {
  var r = recalcularPermanencia_();
  alerta_('Permanência', 'Calculado para ' + r.pessoas + ' pessoa(s). Veja as abas Permanencia e Certificados. Saídas pendentes: ' + r.pendentes + '.');
}
