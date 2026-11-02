/** Criação da estrutura da planilha, menu e gatilhos. */

var PROGRAMACAO = [
  // id, dia, inicio, fim, titulo, tipo, exige_inscricao
  ['A01', '2026-11-11', '09:00', '10:00', 'Credenciamento', 'CREDENCIAMENTO', 'NAO'],
  ['A02', '2026-11-11', '10:00', '10:30', 'Abertura institucional', 'CERIMONIA', 'NAO'],
  ['A03', '2026-11-11', '10:30', '11:30', 'Palestra magna: Da Indústria 4.0 à Indústria 5.0: qual será o papel do engenheiro de produção?', 'PALESTRA', 'NAO'],
  ['A04', '2026-11-11', '14:00', '15:30', 'Palestra: Produção inteligente na prática: tecnologias que já estão transformando as empresas', 'PALESTRA', 'NAO'],
  ['A05', '2026-11-11', '15:30', '16:30', 'Palestra: Além da produtividade: o fator humano na Indústria 5.0', 'PALESTRA', 'NAO'],
  ['A06', '2026-11-11', '16:30', '17:50', 'Mesa-redonda: O engenheiro de produção que o mercado procura', 'MESA', 'NAO'],
  ['A07', '2026-11-11', '17:50', '18:30', 'Coffee break', 'COFFEE', 'NAO'],
  ['A08', '2026-11-12', '08:00', '08:30', 'Recepção e apresentação do Projeto de Extensão', 'CERIMONIA', 'NAO'],
  ['A09', '2026-11-12', '08:30', '09:30', 'Palestra: Currículo Profissional e LinkedIn', 'PALESTRA', 'NAO'],
  ['A10', '2026-11-12', '09:30', '12:00', 'Oficina: Construção do Currículo Profissional + LinkedIn (1º turno)', 'OFICINA', 'SIM'],
  ['A11', '2026-11-12', '14:00', '15:00', 'Palestra: Currículo e LinkedIn como vitrine profissional', 'PALESTRA', 'NAO'],
  ['A12', '2026-11-12', '15:00', '16:30', 'Oficina: Construção do Currículo Profissional + LinkedIn (2º turno)', 'OFICINA', 'SIM'],
  ['A13', '2026-11-12', '16:30', '17:30', 'Criação dos Pitches de um minuto', 'OFICINA', 'SIM'],
  ['A14', '2026-11-12', '17:30', '18:00', 'Desafio final: Meu Perfil Profissional em 60 segundos', 'DESAFIO', 'NAO'],
  ['A15', '2026-11-13', '08:00', '12:00', 'Minicurso: IA para análise de dados (Alexandre Barros dos Santos)', 'MINICURSO', 'SIM'],
  ['A16', '2026-11-13', '08:00', '12:00', 'Visita técnica: Só Aço', 'VISITA', 'SIM'],
  ['A17', '2026-11-13', '14:00', '15:00', 'Palestra: IA como assistente de trabalho (Lucas Costa)', 'PALESTRA', 'NAO'],
  ['A18', '2026-11-13', '15:00', '16:00', 'Palestra: IA e Decisões Orientadas por Dados (Prof. Vinicius Piau)', 'PALESTRA', 'NAO'],
  ['A19', '2026-11-13', '16:00', '17:30', 'Mesa-redonda: Desafios e oportunidades para a transformação digital das empresas piauienses', 'MESA', 'NAO'],
  ['A20', '2026-11-13', '17:50', '18:00', 'Coffee break e encerramento', 'COFFEE', 'NAO']
];

function onOpen() {
  SpreadsheetApp.getUi().createMenu('Semana de Eng. Produção')
    .addItem('Configurar planilha (primeira vez)', 'menuSetup')
    .addItem('Ativar envio automático (gatilho)', 'menuInstalarGatilhos')
    .addSeparator()
    .addItem('Reenviar e-mails pendentes agora', 'menuReprocessar')
    .addItem('Recalcular vagas e fila de espera', 'menuRecalcular')
    .addItem('Atualizar painel e base de análise', 'menuPainel')
    .addItem('Recalcular permanência e certificados', 'menuPermanencia')
    .addItem('Criar cópia de segurança agora', 'menuBackup')
    .addSeparator()
    .addItem('Editar inscrito (linha selecionada em Inscritos)', 'menuInfoEditar')
    .addItem('Cancelar inscrição no evento (linha selecionada)', 'menuCancelarInscrito')
    .addItem('Reativar inscrição no evento (linha selecionada)', 'menuReativarInscrito')
    .addItem('Cancelar vaga em atividade (linha selecionada em Inscricoes_Atividades)', 'menuCancelarVaga')
    .addItem('Inscrever alguém em atividade…', 'menuInscreverManual')
    .addItem('Reenviar QR do inscrito (linha selecionada)', 'menuReenviarQr')
    .addToUi();
}

function setup_() {
  var ss = ss_();
  Object.keys(HEADERS).forEach(function (name) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name);
    var headers = HEADERS[name];
    var r = sh.getRange(1, 1, 1, headers.length);
    r.setValues([headers]);
    r.setBackground('#0F1B2D').setFontColor('#FFFFFF').setFontWeight('bold');
    sh.setFrozenRows(1);
    (TEXT_COLUMNS[name] || []).forEach(function (h) {
      sh.getRange(1, headers.indexOf(h) + 1, 1000, 1).setNumberFormat('@');
    });
  });

  var cfg = sheet_(SHEETS.CONFIG);
  if (cfg.getLastRow() < 2) {
    cfg.getRange(2, 1, DEFAULT_CONFIG.length, 3).setValues(DEFAULT_CONFIG);
  }

  var at = sheet_(SHEETS.ATIV);
  if (at.getLastRow() < 2) {
    var linhas = PROGRAMACAO.map(function (p) {
      return [p[0], p[1], p[2], p[3], p[4], p[5], '', '', 'NAO', p[6], '', '', ''];
    });
    at.getRange(2, 1, linhas.length, 13).setValues(linhas);
  }
  try {
    var simNao = SpreadsheetApp.newDataValidation().requireValueInList(['SIM', 'NAO'], true).build();
    at.getRange(2, 9, 200, 2).setDataValidation(simNao);
    var abFe = SpreadsheetApp.newDataValidation().requireValueInList(['ABERTAS', 'FECHADAS'], true).build();
    cfg.getRange(2, 2).setDataValidation(abFe);
  } catch (e) { /* validação é opcional */ }
  resetConfigCache_();
  atualizarContagens_(); // substitui qualquer fórmula antiga nas colunas ocupadas/restantes/na_fila
}

function installTriggers_() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'tick') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === 'backupDiario') ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('tick').timeBased().everyMinutes(10).create();
  ScriptApp.newTrigger('backupDiario').timeBased().everyDays(1).atHour(23).create();
}

/** Executado pelo gatilho a cada 10 minutos. */
function tick() {
  resetConfigCache_();
  try { garantirMigracao_(); ensureTriggers_(); } catch (e) { log_('erro_tick_migracao', 0, String(e)); }
  try { promoteAll_(); } catch (e) { log_('erro_tick_promote', 0, String(e)); }
  try { checkMinimos_(); } catch (e) { log_('erro_tick_minimos', 0, String(e)); }
  try { processOutbox_(40); } catch (e) { log_('erro_tick_outbox', 0, String(e)); }
  try { sendAlertDigest_(); } catch (e) { log_('erro_tick_digest', 0, String(e)); }
  try {
    var props = PropertiesService.getScriptProperties();
    if (Date.now() - Number(props.getProperty('ULTIMO_PAINEL') || 0) > 30 * 60000) { atualizarPainel_(); props.setProperty('ULTIMO_PAINEL', String(Date.now())); }
  } catch (e) { log_('erro_tick_painel', 0, String(e)); }
}

function toast_(msg) { try { ss_().toast(msg, 'Semana de Eng. Produção', 8); } catch (e) { /* sem interface */ } }
var EMAIL_RE_ = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Edição direta na planilha.
 * - Atividades: vagas/abertura atualizam contagens e promovem a fila na hora.
 * - Inscritos: valida matrícula única, e-mail e status; e-mail corrigido reenvia o QR.
 */
function onEdit(e) {
  try {
    var sh = e.range.getSheet(), nome = sh.getName(), col = e.range.getColumn();
    if (nome === SHEETS.ATIV) {
      if (col < 7 || col > 10) return;
      resetConfigCache_();
      promoteAll_();
    } else if (nome === SHEETS.INSC) {
      validarEdicaoInscrito_(e);
    }
  } catch (err) { /* a edição nunca deve falhar por causa disto */ }
}

function validarEdicaoInscrito_(e) {
  var r = e.range, row = r.getRow(), col = r.getColumn();
  if (row < 2 || r.getNumRows() !== 1 || r.getNumColumns() !== 1) return;
  var campo = HEADERS[SHEETS.INSC][col - 1];
  var antigo = e.oldValue === undefined ? '' : e.oldValue;
  var novo = String(e.value === undefined ? r.getValue() : e.value).trim();
  var id = sheet_(SHEETS.INSC).getRange(row, 1).getValue();
  function reverter(msg) { r.setValue(antigo); toast_(msg); }
  limparCache_();
  if (campo === 'id' || campo === 'token') { reverter('Esta coluna não pode ser alterada: ela identifica a inscrição e o QR Code.'); return; }
  if (campo === 'email') {
    var em = normEmail_(novo);
    if (!EMAIL_RE_.test(em)) { reverter('E-mail inválido. O valor anterior foi restaurado.'); return; }
    r.setValue(em);
    if (em !== normEmail_(antigo)) {
      updateRow_(SHEETS.INSC, row, { status_email: 'PENDENTE' });
      var ativo = readAll_(SHEETS.INSC).filter(function (x) { return x._row === row && x.status === 'ATIVA'; }).length;
      if (ativo) enqueueEmail_(id, 'CONFIRMACAO');
      toast_('E-mail atualizado. O QR Code será reenviado ao novo endereço em até 10 minutos.');
    }
  } else if (campo === 'matricula') {
    var m = normMatricula_(novo);
    if (!/^[A-Z0-9.\-]{4,20}$/.test(m)) { reverter('Matrícula inválida. O valor anterior foi restaurado.'); return; }
    var dup = readAll_(SHEETS.INSC).some(function (x) { return x._row !== row && normMatricula_(x.matricula) === m; });
    if (dup) { reverter('Já existe outro inscrito com esta matrícula. O valor anterior foi restaurado.'); return; }
    r.setValue(m);
  } else if (campo === 'status') {
    var st = novo.toUpperCase();
    if (st !== 'ATIVA' && st !== 'CANCELADA') { reverter('Status inválido. Use ATIVA ou CANCELADA.'); return; }
    r.setValue(st);
    if (st === 'CANCELADA' && String(antigo).toUpperCase() === 'ATIVA') {
      cancelarInscrito_(id);
      toast_('Inscrição cancelada: vagas liberadas e fila de espera atualizada.');
    }
  } else if (campo === 'nome' || campo === 'curso' || campo === 'periodo') {
    r.setValue(normNome_(novo));
  }
}
