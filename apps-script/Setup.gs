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
    .addItem('Recalcular permanência e certificados', 'menuPermanencia')
    .addSeparator()
    .addItem('Editar inscrito (linha selecionada em Inscritos)', 'menuInfoEditar')
    .addItem('Cancelar inscrição no evento (linha selecionada)', 'menuCancelarInscrito')
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
  ScriptApp.newTrigger('tick').timeBased().everyMinutes(10).create();
}

/** Executado pelo gatilho a cada 10 minutos. */
function tick() {
  resetConfigCache_();
  try { promoteAll_(); } catch (e) { log_('erro_tick_promote', 0, String(e)); }
  try { checkMinimos_(); } catch (e) { log_('erro_tick_minimos', 0, String(e)); }
  try { processOutbox_(40); } catch (e) { log_('erro_tick_outbox', 0, String(e)); }
  try { sendAlertDigest_(); } catch (e) { log_('erro_tick_digest', 0, String(e)); }
}

/** Edição direta na aba Atividades (vagas, abertura): atualiza contagens e promove a fila na hora. */
function onEdit(e) {
  try {
    var sh = e.range.getSheet();
    if (sh.getName() !== SHEETS.ATIV) return;
    var col = e.range.getColumn();
    if (col < 7 || col > 10) return;
    resetConfigCache_();
    promoteAll_();
  } catch (err) { /* a edição nunca deve falhar por causa disto */ }
}
