// Semana de Engenharia de Produção — código único (gerado por scripts/build-codigo.js a partir de apps-script/*.gs).
// Cole tudo em Código.gs no editor do Apps Script.

// ===== Versao =====
/** Versão do código em execução. Na publicação automática, o GitHub grava aqui o identificador do commit. */
var CODIGO_VERSAO = 'dev';

// ===== Logo =====
/** Logo da CAEPRO (112x112 PNG) embutida no e-mail, para aparecer mesmo quando o cliente de e-mail bloqueia imagens externas. Gerado de assets/logo-caepro.png. */
var LOGO_CAEPRO_B64 = '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';

function logoBlob_() {
  return Utilities.newBlob(Utilities.base64Decode(LOGO_CAEPRO_B64), 'image/png', 'caepro.png');
}

// ===== Migracao =====
/** Auto-ajuste após cada atualização do código: estrutura da planilha e gatilhos ficam em dia sem ação manual. */

function ensureTriggers_() {
  var existentes = {};
  ScriptApp.getProjectTriggers().forEach(function (t) { existentes[t.getHandlerFunction()] = true; });
  if (!existentes.tick) ScriptApp.newTrigger('tick').timeBased().everyMinutes(10).create();
  if (!existentes.backupDiario) ScriptApp.newTrigger('backupDiario').timeBased().everyDays(1).atHour(23).create();
}

/**
 * Executa a configuração (idempotente: não apaga dados) uma vez por versão de código.
 * Chamada no início de cada requisição e a cada ciclo do gatilho.
 */
function garantirMigracao_() {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty('VERSAO_APLICADA') === CODIGO_VERSAO) return false;
  try {
    return withLock_(function () {
      if (props.getProperty('VERSAO_APLICADA') === CODIGO_VERSAO) return false;
      setup_();
      preencherPadroes_();
      try { ensureTriggers_(); } catch (e) { log_('erro_gatilhos', 0, String(e)); }
      props.setProperty('VERSAO_APLICADA', CODIGO_VERSAO);
      log_('migracao', 0, 'versão ' + CODIGO_VERSAO);
      return true;
    });
  } catch (e) {
    if (e && e.code === 'OCUPADO') return false;   // outra execução está migrando; tenta de novo na próxima
    throw e;
  }
}

/** Completa valores essenciais que estejam vazios na aba Config (nunca sobrescreve o que já foi preenchido). */
function preencherPadroes_() {
  var linha = readAll_(SHEETS.CONFIG).filter(function (r) { return String(r.chave).trim() === 'SITE_URL'; })[0];
  if (linha && !String(linha.valor).trim()) { updateRow_(SHEETS.CONFIG, linha._row, { valor: SITE_URL_PADRAO }); resetConfigCache_(); }
}

// ===== Config =====
/**
 * Semana de Engenharia de Produção — Credenciamento (backend)
 * Constantes, textos e cabeçalhos das abas.
 */

var SHEETS = {
  CONFIG: 'Config',
  ATIV: 'Atividades',
  INSC: 'Inscritos',
  IA: 'Inscricoes_Atividades',
  OUTBOX: 'Fila_Email',
  ALERTAS: 'Alertas',
  LOG: 'Log',
  PORTARIA: 'Portaria',
  PRES: 'Presenca_Atividades',
  PERM: 'Permanencia',
  CERT: 'Certificados',
  PAINEL: 'Painel',
  BASE: 'Base_Analise'
};

var HEADERS = {};
HEADERS[SHEETS.CONFIG] = ['chave', 'valor', 'descricao'];
HEADERS[SHEETS.ATIV] = ['id', 'dia', 'inicio', 'fim', 'titulo', 'tipo', 'vagas_max', 'vagas_min',
  'inscricoes_abertas', 'exige_inscricao', 'ocupadas', 'restantes', 'na_fila'];
HEADERS[SHEETS.INSC] = ['id', 'token', 'nome', 'curso', 'periodo', 'matricula', 'email',
  'data_hora', 'status', 'status_email', 'tempo_envio_ms'];
HEADERS[SHEETS.IA] = ['id', 'inscrito_id', 'atividade_id', 'data_hora', 'status', 'posicao'];
HEADERS[SHEETS.OUTBOX] = ['id', 'inscrito_id', 'tipo', 'atividade_id', 'status', 'criado_em',
  'enviado_em', 'tempo_ms', 'tentativas', 'erro'];
HEADERS[SHEETS.ALERTAS] = ['data_hora', 'tipo', 'chave', 'mensagem', 'notificado'];
HEADERS[SHEETS.LOG] = ['data_hora', 'evento', 'duracao_ms', 'detalhe'];
HEADERS[SHEETS.PORTARIA] = ['inscrito_id', 'dia', 'tipo', 'data_hora', 'operador', 'status', 'client_id', 'ts', 'local_ms', 'server_ms'];
HEADERS[SHEETS.PRES] = ['inscrito_id', 'atividade_id', 'data_hora', 'operador', 'status', 'client_id', 'ts', 'local_ms', 'server_ms'];
HEADERS[SHEETS.PERM] = ['inscrito_id', 'dia', 'minutos', 'saida_pendente'];
HEADERS[SHEETS.CERT] = ['inscrito_id', 'horas', 'observacao'];
HEADERS[SHEETS.BASE] = ['inscrito_id', 'nome', 'curso', 'periodo', 'matricula', 'email', 'data_inscricao', 'status', 'status_email',
  'atividades_confirmadas', 'atividades_em_fila', 'presencas_em_atividades', 'dias_presentes', 'minutos_permanencia', 'horas', 'saida_pendente'];

/** Colunas que precisam ficar como texto (evita converter "0123" ou tokens em número). */
var TEXT_COLUMNS = {};
TEXT_COLUMNS[SHEETS.ATIV] = ['id', 'dia', 'inicio', 'fim'];
TEXT_COLUMNS[SHEETS.INSC] = ['id', 'token', 'nome', 'curso', 'periodo', 'matricula', 'email', 'data_hora'];
TEXT_COLUMNS[SHEETS.IA] = ['id', 'inscrito_id', 'atividade_id', 'data_hora'];
TEXT_COLUMNS[SHEETS.OUTBOX] = ['id', 'inscrito_id', 'atividade_id', 'criado_em', 'enviado_em'];
TEXT_COLUMNS[SHEETS.ALERTAS] = ['data_hora', 'chave'];
TEXT_COLUMNS[SHEETS.LOG] = ['data_hora'];
TEXT_COLUMNS[SHEETS.PORTARIA] = ['inscrito_id', 'dia', 'data_hora', 'client_id'];
TEXT_COLUMNS[SHEETS.PRES] = ['inscrito_id', 'atividade_id', 'data_hora', 'client_id'];
TEXT_COLUMNS[SHEETS.PERM] = ['inscrito_id', 'dia'];
TEXT_COLUMNS[SHEETS.CERT] = ['inscrito_id'];
TEXT_COLUMNS[SHEETS.BASE] = ['inscrito_id', 'matricula', 'data_inscricao'];

/** Endereço do site publicado (GitHub Pages). Usado quando SITE_URL está vazio na aba Config. */
var SITE_URL_PADRAO = 'https://krcataclysm.github.io/SemanadaEngenhariadeProd';

var DEFAULT_CONFIG = [
  ['INSCRICOES', 'FECHADAS', 'ABERTAS ou FECHADAS: controla a inscrição no evento.'],
  ['PIN', '', 'PIN da equipe para o scanner (defina antes do evento).'],
  ['PIN_ADMIN', '', 'Senha do painel de administração (/admin/). Mínimo 8 caracteres e diferente do PIN do scanner.'],
  ['EMAIL_ALERTAS', '', 'E-mail que recebe os alertas (vazio = e-mail da conta dona da planilha).'],
  ['NOME_EVENTO', 'Semana de Engenharia de Produção', 'Nome oficial (assunto e título dos e-mails).'],
  ['SITE_URL', SITE_URL_PADRAO, 'Endereço do GitHub Pages, sem barra no final. Usado no botão "Escolher atividades" dos e-mails.'],
  ['INSTAGRAM_CAEPRO', 'https://www.instagram.com/caeproufpi', 'Contato da CAEPRO nos textos.'],
  ['EMAIL_CAEPRO', 'caepro.ufpi1@gmail.com', 'Contato da CAEPRO nos textos.']
];

/** Textos exibidos ao público (formais e completos). */
var CONTATO_TXT = 'Em caso de dúvidas, entre em contato com a CAEPRO pelo Instagram (@caeproufpi) ou pelo e-mail caepro.ufpi1@gmail.com.';

var MSG = {
  fechadas: 'As inscrições para a Semana de Engenharia de Produção não estão abertas no momento. ' + CONTATO_TXT,
  invalido: 'Não foi possível concluir a inscrição, pois há dados ausentes ou inválidos. Revise os campos destacados e tente novamente.',
  cancelada: 'Esta matrícula possui uma inscrição cancelada. Para regularizar a situação, ' + 'entre em contato com a CAEPRO pelo Instagram (@caeproufpi) ou pelo e-mail caepro.ufpi1@gmail.com.',
  jaInscrito: 'Esta matrícula já possui inscrição na Semana de Engenharia de Produção. Reenviamos a confirmação, com o QR Code, para o e-mail cadastrado na inscrição original (%EMAIL%). O envio pode levar alguns minutos. ' + CONTATO_TXT,
  sucesso: 'Sua inscrição na Semana de Engenharia de Produção foi realizada com sucesso. Seu QR Code está exibido abaixo: salve-o ou faça uma captura de tela, pois será necessário apresentá-lo na entrada e na saída de cada dia do evento. Enviamos também um e-mail de confirmação, que pode demorar alguns minutos para chegar. Caso o e-mail não chegue, verifique a caixa de spam e confira se o endereço informado está correto. ' + CONTATO_TXT,
  tokenInvalido: 'Não foi possível identificar sua inscrição. Utilize o link pessoal enviado no e-mail de confirmação. ' + CONTATO_TXT,
  atividadeFechada: 'As inscrições nesta atividade não estão abertas no momento.',
  jaNaAtividade: 'Você já está inscrito, ou na fila de espera, desta atividade.',
  conflito: 'Não foi possível inscrever você nesta atividade, pois ela ocorre no mesmo dia e em horário que coincide com outra atividade na qual você já está inscrito: %TITULO% (%HORARIO%).',
  atividadeInexistente: 'A atividade informada não foi encontrada.',
  ocupado: 'O sistema está recebendo muitas solicitações neste momento. Aguarde alguns instantes e tente novamente. ' + CONTATO_TXT,
  rapido: 'Não foi possível concluir o envio. Aguarde alguns segundos e envie o formulário novamente.',
  erroInterno: 'Ocorreu um erro inesperado ao processar sua solicitação. Aguarde alguns instantes e tente novamente. ' + CONTATO_TXT
};

var PRIORIDADE_EMAIL = { CONFIRMACAO: 0, PROMOCAO: 1, FILA: 2, ATIVIDADE: 3 };
var MAX_TENTATIVAS_EMAIL = 6;

// ===== Db =====
/** Acesso à planilha como "tabelas" de objetos. */

function ss_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function sheet_(name) {
  var s = ss_().getSheetByName(name);
  if (!s) throw new Error('Aba não encontrada: ' + name + '. Execute o menu Semana > Configurar planilha.');
  return s;
}

function now_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss');
}

function hoje_() {
  return Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

var RA_ = {};
function invalidar_(name) { delete RA_[name]; }
function limparCache_() { RA_ = {}; CFG_CACHE_ = null; }

/**
 * Lê todas as linhas da aba como objetos (com _row = número da linha na planilha).
 * Cada aba é lida uma única vez por execução (invalidada a cada gravação) e devolvida em cópias,
 * o que reduz muito o tempo em que o lock fica preso quando muita gente usa ao mesmo tempo.
 */
function readAll_(name) {
  if (!RA_[name]) RA_[name] = lerAba_(name);
  return RA_[name].map(function (r) { return Object.assign({}, r); });
}

function lerAba_(name) {
  var values = sheet_(name).getDataRange().getValues();
  var headers = values[0] || HEADERS[name];
  var rows = [];
  for (var i = 1; i < values.length; i++) {
    var o = { _row: i + 1 };
    var vazio = true;
    for (var j = 0; j < headers.length; j++) {
      var v = values[i][j];
      if (v !== '' && v !== null && v !== undefined) vazio = false;
      o[headers[j]] = (v === undefined || v === null) ? '' : v;
    }
    if (!vazio) rows.push(o);
  }
  return rows;
}

function appendObj_(name, obj) {
  var headers = HEADERS[name];
  var row = headers.map(function (h) {
    return obj[h] === undefined || obj[h] === null ? '' : obj[h];
  });
  sheet_(name).appendRow(row);
  invalidar_(name);
}

/** Atualiza colunas de uma linha. */
function updateRow_(name, rowNumber, changes) {
  var headers = HEADERS[name];
  var sh = sheet_(name);
  Object.keys(changes).forEach(function (k) {
    var col = headers.indexOf(k) + 1;
    if (col < 1) throw new Error('Coluna inexistente: ' + k);
    sh.getRange(rowNumber, col).setValue(changes[k]);
  });
  invalidar_(name);
}

function nextId_(prefix, name) {
  var n = sheet_(name).getLastRow(); // cabeçalho conta 1 => próximo = n
  return prefix + ('0000' + n).slice(-4);
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(25000);
  } catch (e) {
    var busy = new Error('OCUPADO'); busy.code = 'OCUPADO'; throw busy;
  }
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

var CFG_CACHE_ = null;
function getConfig_() {
  if (CFG_CACHE_) return CFG_CACHE_;
  var cfg = {};
  readAll_(SHEETS.CONFIG).forEach(function (r) { cfg[String(r.chave).trim()] = String(r.valor).trim(); });
  CFG_CACHE_ = cfg;
  return cfg;
}
function resetConfigCache_() { limparCache_(); }

function log_(evento, duracaoMs, detalhe) {
  try {
    appendObj_(SHEETS.LOG, { data_hora: now_(), evento: evento, duracao_ms: duracaoMs, detalhe: detalhe || '' });
  } catch (e) { /* o log nunca pode derrubar o fluxo */ }
}

/**
 * Registra alerta para o organizador. Evita duplicar alertas iguais ainda não notificados.
 */
function alert_(tipo, chave, mensagem) {
  var existe = readAll_(SHEETS.ALERTAS).some(function (a) {
    return a.tipo === tipo && String(a.chave) === String(chave) && a.notificado !== 'SIM';
  });
  if (existe) return;
  appendObj_(SHEETS.ALERTAS, { data_hora: now_(), tipo: tipo, chave: chave, mensagem: mensagem, notificado: 'NAO' });
}

// ===== Setup =====
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
  } else {
    // Chaves novas de versões posteriores são acrescentadas sem tocar nos valores já definidos.
    var existentes = {};
    readAll_(SHEETS.CONFIG).forEach(function (r) { existentes[String(r.chave).trim()] = true; });
    DEFAULT_CONFIG.forEach(function (d) {
      if (!existentes[d[0]]) cfg.getRange(cfg.getLastRow() + 1, 1, 1, 3).setValues([d]);
    });
    invalidar_(SHEETS.CONFIG);
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

// ===== Inscricao =====
/** Inscrição no evento (fase 1). */

/** Remove caracteres que fariam a planilha tratar o texto como fórmula (=, +, -, @ no início): injeção de fórmula. */
function semFormula_(s) { return String(s === undefined || s === null ? '' : s).replace(/^[\s=+\-@]+/, ''); }
function normNome_(s) { return semFormula_(String(s || '').replace(/\s+/g, ' ').trim()).trim(); }
function normMatricula_(s) { return String(s || '').replace(/\s+/g, '').toUpperCase(); }
function normEmail_(s) { return String(s || '').trim().toLowerCase().replace(/^[=@]+/, ''); }

function maskEmail_(email) {
  var p = String(email).split('@');
  if (p.length !== 2) return '***';
  return p[0].charAt(0) + '***@' + p[1];
}

function validarInscricao_(d) {
  var erros = {};
  if (d.nome.split(' ').length < 2 || d.nome.length < 5 || d.nome.length > 120) erros.nome = 'Informe o nome completo.';
  if (!d.curso || d.curso.length > 80) erros.curso = 'Informe o curso.';
  if (!d.periodo || d.periodo.length > 40) erros.periodo = 'Informe o período.';
  if (!/^[A-Z0-9.\-]{4,20}$/.test(d.matricula)) erros.matricula = 'Informe a matrícula (4 a 20 caracteres, apenas letras e números).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email) || d.email.length > 120) erros.email = 'Informe um e-mail válido.';
  return erros;
}

function findInscritoByMatricula_(matricula) {
  var lista = readAll_(SHEETS.INSC);
  for (var i = 0; i < lista.length; i++) {
    if (normMatricula_(lista[i].matricula) === matricula) return lista[i];
  }
  return null;
}

function findInscritoByToken_(token) {
  token = String(token || '').trim();
  if (!/^[a-f0-9]{32}$/.test(token)) return null;
  var lista = readAll_(SHEETS.INSC);
  for (var i = 0; i < lista.length; i++) {
    if (String(lista[i].token) === token) return lista[i];
  }
  return null;
}

function novoToken_() {
  return (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '').slice(0, 32).toLowerCase();
}

/** Enfileira e-mail evitando repetição de confirmação em sequência. */
function enqueueEmail_(inscritoId, tipo, atividadeId) {
  appendObj_(SHEETS.OUTBOX, {
    id: nextId_('E', SHEETS.OUTBOX), inscrito_id: inscritoId, tipo: tipo,
    atividade_id: atividadeId || '', status: 'PENDENTE', criado_em: now_(), tentativas: 0
  });
}

function register_(p) {
  var t0 = Date.now();
  var cfg = getConfig_();
  if (String(cfg.INSCRICOES).toUpperCase() !== 'ABERTAS') {
    return { ok: false, code: 'FECHADAS', mensagem: MSG.fechadas };
  }
  // Proteção contra envio automático (robôs): campo-isca preenchido ou formulário enviado rápido demais.
  if (String(p.campo_extra || '').trim()) { log_('inscricao_bloqueada', 0, 'campo-isca'); return { ok: false, code: 'RAPIDO', mensagem: MSG.rapido }; }
  if (p.tempoMs !== undefined && Number(p.tempoMs) < 2000) { log_('inscricao_bloqueada', 0, 'rápido demais'); return { ok: false, code: 'RAPIDO', mensagem: MSG.rapido }; }
  var d = {
    nome: normNome_(p.nome), curso: normNome_(p.curso), periodo: normNome_(p.periodo),
    matricula: normMatricula_(p.matricula), email: normEmail_(p.email)
  };
  var erros = validarInscricao_(d);
  if (Object.keys(erros).length) return { ok: false, code: 'INVALIDO', mensagem: MSG.invalido, erros: erros };

  var res = withLock_(function () {
    var existente = findInscritoByMatricula_(d.matricula);
    if (existente) {
      alert_('DUPLICIDADE', d.matricula + '|' + hoje_(),
        'Tentativa de nova inscrição com matrícula já cadastrada: ' + d.matricula + ' (' + existente.nome + ').');
      if (existente.status !== 'ATIVA') return { ok: false, code: 'CANCELADA', mensagem: MSG.cancelada };
      var recente = readAll_(SHEETS.OUTBOX).some(function (o) {
        return o.inscrito_id === existente.id && o.tipo === 'CONFIRMACAO' && o.status === 'PENDENTE';
      });
      if (!recente) enqueueEmail_(existente.id, 'CONFIRMACAO');
      return {
        ok: true, status: 'JA_INSCRITO', inscritoId: existente.id,
        mensagem: MSG.jaInscrito.replace('%EMAIL%', maskEmail_(existente.email))
      };
    }
    var id = nextId_('I', SHEETS.INSC);
    var token = novoToken_();
    appendObj_(SHEETS.INSC, {
      id: id, token: token, nome: d.nome, curso: d.curso, periodo: d.periodo, matricula: d.matricula,
      email: d.email, data_hora: now_(), status: 'ATIVA', status_email: 'PENDENTE'
    });
    enqueueEmail_(id, 'CONFIRMACAO');
    return { ok: true, status: 'CRIADA', token: token, nome: d.nome, inscritoId: id, mensagem: MSG.sucesso };
  });

  if (res.ok) {
    try { processOutbox_(2, res.inscritoId); } catch (e) { log_('erro_envio_imediato', 0, String(e)); }
    log_('inscricao_' + res.status, Date.now() - t0, '');
  }
  return res;
}

// ===== Atividades =====
/** Atividades: vagas, conflito de horário, fila de espera e promoção automática. */

function hm_(s) {
  // aceita "09:30" (texto) ou Date vinda da planilha
  if (Object.prototype.toString.call(s) === '[object Date]') {
    return Utilities.formatDate(s, Session.getScriptTimeZone(), 'HH:mm');
  }
  return String(s).trim();
}
function dia_(s) {
  if (Object.prototype.toString.call(s) === '[object Date]') {
    return Utilities.formatDate(s, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(s).trim();
}
function min_(hhmm) {
  var p = hm_(hhmm).split(':');
  return parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
}

function getAtividade_(id) {
  var l = readAll_(SHEETS.ATIV);
  for (var i = 0; i < l.length; i++) if (String(l[i].id) === String(id)) return l[i];
  return null;
}

function sobrepoe_(a, b) {
  return dia_(a.dia) === dia_(b.dia) && min_(a.inicio) < min_(b.fim) && min_(b.inicio) < min_(a.fim);
}

function vagasMax_(a) {
  var v = a.vagas_max;
  if (v === '' || v === null || v === undefined) return null; // sem limite
  var n = parseInt(v, 10);
  return isNaN(n) ? null : Math.max(0, n);
}

function inscricoesDaAtividade_(atividadeId, status) {
  return readAll_(SHEETS.IA).filter(function (r) {
    return String(r.atividade_id) === String(atividadeId) && r.status === status;
  });
}

function inscricoesDoInscrito_(inscritoId) {
  return readAll_(SHEETS.IA).filter(function (r) {
    return String(r.inscrito_id) === String(inscritoId) && (r.status === 'CONFIRMADA' || r.status === 'FILA');
  });
}

/** Procura conflito de horário com atividades já ocupadas pela pessoa. */
function acharConflito_(inscritoId, atividade) {
  var minhas = inscricoesDoInscrito_(inscritoId);
  for (var i = 0; i < minhas.length; i++) {
    var outra = getAtividade_(minhas[i].atividade_id);
    if (outra && String(outra.id) !== String(atividade.id) && sobrepoe_(atividade, outra)) return outra;
  }
  return null;
}

function renumerarFila_(atividadeId) {
  var fila = inscricoesDaAtividade_(atividadeId, 'FILA');
  fila.forEach(function (r, i) {
    if (Number(r.posicao) !== i + 1) updateRow_(SHEETS.IA, r._row, { posicao: i + 1 });
  });
}

/** Inscreve (ou coloca na fila). Deve ser chamado dentro de lock. */
function enrollCore_(inscrito, atividade) {
  if (String(atividade.exige_inscricao).toUpperCase() !== 'SIM') return { ok: false, mensagem: MSG.atividadeInexistente };
  if (String(atividade.inscricoes_abertas).toUpperCase() !== 'SIM') return { ok: false, code: 'FECHADA', mensagem: MSG.atividadeFechada };
  var ja = inscricoesDoInscrito_(inscrito.id).some(function (r) { return String(r.atividade_id) === String(atividade.id); });
  if (ja) return { ok: false, code: 'JA_INSCRITO', mensagem: MSG.jaNaAtividade };
  var conflito = acharConflito_(inscrito.id, atividade);
  if (conflito) {
    return {
      ok: false, code: 'CONFLITO',
      mensagem: MSG.conflito.replace('%TITULO%', conflito.titulo)
        .replace('%HORARIO%', hm_(conflito.inicio) + ' às ' + hm_(conflito.fim))
    };
  }
  var max = vagasMax_(atividade);
  var ocupadas = inscricoesDaAtividade_(atividade.id, 'CONFIRMADA').length;
  var id = nextId_('X', SHEETS.IA);
  if (max === null || ocupadas < max) {
    appendObj_(SHEETS.IA, { id: id, inscrito_id: inscrito.id, atividade_id: atividade.id, data_hora: now_(), status: 'CONFIRMADA', posicao: '' });
    enqueueEmail_(inscrito.id, 'ATIVIDADE', atividade.id);
    if (max !== null && ocupadas + 1 >= max) {
      alert_('VAGAS_ESGOTADAS', atividade.id, 'Vagas esgotadas em: ' + atividade.titulo + ' (' + max + ' vagas).');
    }
    return { ok: true, status: 'CONFIRMADA', atividadeId: atividade.id };
  }
  var posicao = inscricoesDaAtividade_(atividade.id, 'FILA').length + 1;
  appendObj_(SHEETS.IA, { id: id, inscrito_id: inscrito.id, atividade_id: atividade.id, data_hora: now_(), status: 'FILA', posicao: posicao });
  enqueueEmail_(inscrito.id, 'FILA', atividade.id);
  return { ok: true, status: 'FILA', posicao: posicao, atividadeId: atividade.id };
}

/** Promove a fila enquanto houver vagas. Dentro de lock. Retorna quantidade de promoções. */
function promoteAtividade_(atividade) {
  var max = vagasMax_(atividade);
  var promovidos = 0;
  var fila = inscricoesDaAtividade_(atividade.id, 'FILA');
  for (var i = 0; i < fila.length; i++) {
    var ocupadas = inscricoesDaAtividade_(atividade.id, 'CONFIRMADA').length;
    if (max !== null && ocupadas >= max) break;
    var r = fila[i];
    var insc = readAll_(SHEETS.INSC).filter(function (x) { return String(x.id) === String(r.inscrito_id); })[0];
    if (!insc || insc.status !== 'ATIVA') {
      updateRow_(SHEETS.IA, r._row, { status: 'CANCELADA', posicao: '' });
      continue;
    }
    var confirmadasDele = readAll_(SHEETS.IA).filter(function (x) {
      return String(x.inscrito_id) === String(insc.id) && x.status === 'CONFIRMADA';
    });
    var conflita = confirmadasDele.some(function (x) {
      var o = getAtividade_(x.atividade_id);
      return o && sobrepoe_(atividade, o);
    });
    if (conflita) continue; // permanece na fila; será reavaliado
    updateRow_(SHEETS.IA, r._row, { status: 'CONFIRMADA', posicao: '' });
    enqueueEmail_(insc.id, 'PROMOCAO', atividade.id);
    promovidos++;
  }
  renumerarFila_(atividade.id);
  return promovidos;
}

function promoteAll_() {
  withLock_(function () {
    readAll_(SHEETS.ATIV).forEach(function (a) { promoteAtividade_(a); });
    atualizarContagensSeguro_();
  });
}

/** Alerta quando uma atividade fechada ficou abaixo do mínimo. */
function checkMinimos_() {
  readAll_(SHEETS.ATIV).forEach(function (a) {
    var min = parseInt(a.vagas_min, 10);
    if (!min || String(a.inscricoes_abertas).toUpperCase() === 'SIM') return;
    var todas = readAll_(SHEETS.IA).filter(function (r) { return String(r.atividade_id) === String(a.id); });
    if (!todas.length) return;
    var conf = inscricoesDaAtividade_(a.id, 'CONFIRMADA').length;
    if (conf < min) {
      alert_('ABAIXO_DO_MINIMO', a.id, 'A atividade "' + a.titulo + '" tem ' + conf + ' inscrito(s) confirmado(s), abaixo do mínimo de ' + min + '.');
    }
  });
}

/** Cancela a inscrição de uma pessoa em uma atividade e promove a fila. */
function cancelarVaga_(iaId) {
  return withLock_(function () {
    var ia = readAll_(SHEETS.IA).filter(function (r) { return String(r.id) === String(iaId); })[0];
    if (!ia) return { ok: false, mensagem: 'Inscrição em atividade não encontrada.' };
    if (ia.status === 'CANCELADA') return { ok: true, jaCancelada: true };
    updateRow_(SHEETS.IA, ia._row, { status: 'CANCELADA', posicao: '' });
    var at = getAtividade_(ia.atividade_id);
    var promovidos = at ? promoteAtividade_(at) : 0;
    atualizarContagensSeguro_();
    return { ok: true, promovidos: promovidos };
  });
}

/** Cancela a inscrição no evento e em todas as atividades; libera vagas e promove filas. */
function cancelarInscrito_(inscritoId) {
  return withLock_(function () {
    var insc = readAll_(SHEETS.INSC).filter(function (r) { return String(r.id) === String(inscritoId); })[0];
    if (!insc) return { ok: false, mensagem: 'Inscrito não encontrado.' };
    updateRow_(SHEETS.INSC, insc._row, { status: 'CANCELADA' });
    var afetadas = {};
    readAll_(SHEETS.IA).forEach(function (r) {
      if (String(r.inscrito_id) === String(inscritoId) && (r.status === 'CONFIRMADA' || r.status === 'FILA')) {
        updateRow_(SHEETS.IA, r._row, { status: 'CANCELADA', posicao: '' });
        afetadas[r.atividade_id] = true;
      }
    });
    var promovidos = 0;
    Object.keys(afetadas).forEach(function (aid) {
      var at = getAtividade_(aid);
      if (at) promovidos += promoteAtividade_(at);
    });
    atualizarContagensSeguro_();
    return { ok: true, promovidos: promovidos };
  });
}

function enroll_(p) {
  var insc = findInscritoByToken_(p.token);
  if (!insc || insc.status !== 'ATIVA') return { ok: false, code: 'TOKEN', mensagem: MSG.tokenInvalido };
  var res = withLock_(function () {
    var at = getAtividade_(p.atividadeId);
    if (!at) return { ok: false, mensagem: MSG.atividadeInexistente };
    var r = enrollCore_(insc, at);
    if (r.ok) atualizarContagensSeguro_();
    return r;
  });
  if (res.ok) {
    try { processOutbox_(2, insc.id); } catch (e) { log_('erro_envio_imediato', 0, String(e)); }
  }
  return res;
}

/** Inscrição manual feita pelo organizador (ignora "inscrições abertas", respeita vagas e conflitos). */
function inscreverManual_(inscritoId, atividadeId) {
  var res = withLock_(function () {
    var insc = readAll_(SHEETS.INSC).filter(function (r) { return String(r.id) === String(inscritoId); })[0];
    var at = getAtividade_(atividadeId);
    if (!insc || insc.status !== 'ATIVA') return { ok: false, mensagem: 'Inscrito não encontrado ou cancelado.' };
    if (!at) return { ok: false, mensagem: MSG.atividadeInexistente };
    var copia = {};
    Object.keys(at).forEach(function (k) { copia[k] = at[k]; });
    copia.inscricoes_abertas = 'SIM';
    var r = enrollCore_(insc, copia);
    if (r.ok) atualizarContagensSeguro_();
    return r;
  });
  if (res.ok) { try { processOutbox_(3); } catch (e) { /* tick reenvia */ } }
  return res;
}

function atividadePublica_(a, minha) {
  var max = vagasMax_(a);
  var ocup = inscricoesDaAtividade_(a.id, 'CONFIRMADA').length;
  var fila = inscricoesDaAtividade_(a.id, 'FILA').length;
  return {
    id: a.id, dia: dia_(a.dia), inicio: hm_(a.inicio), fim: hm_(a.fim), titulo: a.titulo, tipo: a.tipo,
    restantes: max === null ? null : Math.max(0, max - ocup),
    lotada: max !== null && ocup >= max,
    naFila: fila,
    minha: minha ? { status: minha.status, posicao: minha.posicao === '' ? null : Number(minha.posicao) } : null
  };
}

function getMe_(p) {
  var insc = findInscritoByToken_(p.token);
  if (!insc || insc.status !== 'ATIVA') return { ok: false, code: 'TOKEN', mensagem: MSG.tokenInvalido };
  var minhas = inscricoesDoInscrito_(insc.id);
  var porAtividade = {};
  minhas.forEach(function (m) { porAtividade[m.atividade_id] = m; });
  var lista = readAll_(SHEETS.ATIV).filter(function (a) {
    var exige = String(a.exige_inscricao).toUpperCase() === 'SIM';
    var aberta = String(a.inscricoes_abertas).toUpperCase() === 'SIM';
    return exige && (aberta || porAtividade[a.id]);
  }).map(function (a) {
    var pub = atividadePublica_(a, porAtividade[a.id]);
    pub.aberta = String(a.inscricoes_abertas).toUpperCase() === 'SIM';
    return pub;
  });
  return { ok: true, nome: insc.nome, atividades: lista };
}

function getPublicConfig_() {
  var cfg = getConfig_();
  return {
    ok: true,
    inscricoesAbertas: String(cfg.INSCRICOES).toUpperCase() === 'ABERTAS',
    nomeEvento: cfg.NOME_EVENTO || 'Semana de Engenharia de Produção',
    mensagemFechadas: MSG.fechadas
  };
}

/** Grava ocupadas, restantes e na_fila na aba Atividades (valores, sem fórmulas: independe do idioma da planilha). */
function atualizarContagens_() {
  var ativ = readAll_(SHEETS.ATIV);
  if (!ativ.length) return;
  var conf = {}, fila = {};
  readAll_(SHEETS.IA).forEach(function (r) {
    if (r.status === 'CONFIRMADA') conf[r.atividade_id] = (conf[r.atividade_id] || 0) + 1;
    else if (r.status === 'FILA') fila[r.atividade_id] = (fila[r.atividade_id] || 0) + 1;
  });
  var sh = sheet_(SHEETS.ATIV);
  ativ.forEach(function (a) {
    var max = vagasMax_(a), oc = conf[a.id] || 0;
    sh.getRange(a._row, 11, 1, 3).setValues([[oc, max === null ? 'sem limite' : Math.max(0, max - oc), fila[a.id] || 0]]);
  });
  invalidar_(SHEETS.ATIV);
}
function atualizarContagensSeguro_() { try { atualizarContagens_(); } catch (e) { log_('erro_contagens', 0, String(e)); } }

// ===== Email =====
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
    ? '<p style="margin:20px 0 0;line-height:1.5">Novidades em breve: acompanhe o Instagram da CAEPRO para mais informações: <a href="' + esc_(instagram) + '" style="color:' + COR.laranja + ';font-weight:700">@caeproufpi</a>.</p>'
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

// ===== Scanner =====
/** Scanner: PIN, lista local, registro em lote (portaria e atividade), desfazer e permanência. */

var MSG_PIN_ADMIN = {
  BLOQUEADO: 'Acesso bloqueado temporariamente por excesso de tentativas. Aguarde 5 minutos e tente novamente.',
  SEM_PIN: 'A senha de administrador (PIN_ADMIN) ainda não foi definida na aba Config da planilha.',
  FRACO: 'A senha de administrador (PIN_ADMIN) deve ter pelo menos 8 caracteres e ser diferente do PIN do scanner. Ajuste na aba Config da planilha.',
  INVALIDO: 'Senha incorreta. Verifique a senha de administrador e tente novamente.'
};

var MSG_PIN = {
  BLOQUEADO: 'Acesso bloqueado temporariamente por excesso de tentativas. Aguarde 5 minutos e tente novamente.',
  SEM_PIN: 'O PIN do scanner ainda não foi definido na aba Config. Defina o PIN e tente novamente.',
  INVALIDO: 'PIN incorreto. Verifique o PIN informado pela organização e tente novamente.'
};

function checkPin_(pin, chave, prefixo) {
  chave = chave || 'PIN'; prefixo = prefixo || 'PIN';
  var props = PropertiesService.getScriptProperties();
  var kBloq = prefixo + '_BLOQ_ATE', kFalhas = prefixo + '_FALHAS', kDesde = prefixo + '_FALHAS_DESDE';
  if (Date.now() < Number(props.getProperty(kBloq) || 0)) return 'BLOQUEADO';
  var cfg = getConfig_(), real = String(cfg[chave] || '');
  if (!real) return 'SEM_PIN';
  if (chave === 'PIN_ADMIN' && (real.length < 8 || real === String(cfg.PIN || ''))) return 'FRACO';
  // As tentativas erradas valem só dentro de uma janela de 10 minutos: erros isolados, em horas diferentes, não somam.
  var desde = Number(props.getProperty(kDesde) || 0);
  if (desde && Date.now() - desde > 10 * 60000) { props.setProperty(kFalhas, '0'); props.setProperty(kDesde, '0'); }
  if (String(pin === undefined || pin === null ? '' : pin).trim() === real) { props.setProperty(kFalhas, '0'); props.setProperty(kDesde, '0'); return 'OK'; }
  var f = Number(props.getProperty(kFalhas) || 0) + 1;
  props.setProperty(kFalhas, String(f));
  if (f === 1) props.setProperty(kDesde, String(Date.now()));
  if (f >= 8) {
    props.setProperty(kBloq, String(Date.now() + 5 * 60000));
    props.setProperty(kFalhas, '0');
    alert_(prefixo + '_TENTATIVAS', hoje_(), 'Várias tentativas de ' + (chave === 'PIN_ADMIN' ? 'senha de administrador' : 'PIN') + ' incorretas. O acesso foi bloqueado por 5 minutos.');
  }
  return 'INVALIDO';
}

/** SHA-256 (hex) do token. O scanner guarda só este código: com ele não é possível fabricar um QR Code válido. */
function hashToken_(t) {
  var d = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(t), Utilities.Charset.UTF_8);
  return d.map(function (b) { return ('0' + (b < 0 ? b + 256 : b).toString(16)).slice(-2); }).join('');
}

function pinFalha_(chk) { return { ok: false, code: chk, mensagem: MSG_PIN[chk] }; }

/** Fotografia para o scanner trabalhar localmente (resposta instantânea). */
function scanLista_(p) {
  var chk = checkPin_(p.pin);
  if (chk !== 'OK') return pinFalha_(chk);
  var ativ = readAll_(SHEETS.ATIV);
  var out = { ok: true, v: 2, gerado: Date.now(), i: [], a: [], ia: {}, p: {}, pr: [] };
  readAll_(SHEETS.INSC).forEach(function (r) {
    out.i.push([r.id, hashToken_(r.token), r.nome, r.matricula, r.curso, r.status]);
  });
  ativ.forEach(function (a) {
    out.a.push([a.id, dia_(a.dia), hm_(a.inicio), hm_(a.fim), a.titulo, a.tipo, String(a.exige_inscricao).toUpperCase() === 'SIM' ? 1 : 0]);
  });
  readAll_(SHEETS.IA).forEach(function (r) {
    if (r.status !== 'CONFIRMADA' && r.status !== 'FILA') return;
    (out.ia[r.atividade_id] = out.ia[r.atividade_id] || {})[r.inscrito_id] = r.status === 'CONFIRMADA' ? 'C' : 'F';
  });
  readAll_(SHEETS.PORTARIA).forEach(function (r) {
    if (r.status === 'ANULADO') return;
    out.p[r.inscrito_id + '|' + dia_(r.dia)] = r.tipo;
  });
  readAll_(SHEETS.PRES).forEach(function (r) {
    if (r.status === 'ANULADO') return;
    out.pr.push(r.inscrito_id + '|' + r.atividade_id);
  });
  return out;
}

function tsValido_(ts) {
  ts = Number(ts);
  if (!ts || Math.abs(Date.now() - ts) > 36 * 3600 * 1000) return Date.now();
  return ts;
}
function fmtTs_(ts) { return Utilities.formatDate(new Date(ts), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss'); }
function horaTs_(ts) { return Utilities.formatDate(new Date(ts), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss').slice(11); }

function scanLote_(p) {
  var chk = checkPin_(p.pin);
  if (chk !== 'OK') return pinFalha_(chk);
  var itens = (p.itens || []).slice(0, 50);
  return withLock_(function () {
    var porToken = {}, porHash = {};
    readAll_(SHEETS.INSC).forEach(function (r) { porToken[String(r.token)] = r; porHash[hashToken_(r.token)] = r; });
    var ativ = {};
    readAll_(SHEETS.ATIV).forEach(function (a) { ativ[String(a.id)] = a; });
    var port = readAll_(SHEETS.PORTARIA), pres = readAll_(SHEETS.PRES);
    var clientes = {};
    port.forEach(function (r) { if (r.client_id) clientes[r.client_id] = { aba: SHEETS.PORTARIA, r: r }; });
    pres.forEach(function (r) { if (r.client_id) clientes[r.client_id] = { aba: SHEETS.PRES, r: r }; });
    var conf = {};
    readAll_(SHEETS.IA).forEach(function (r) { if (r.status === 'CONFIRMADA' || r.status === 'FILA') conf[r.inscrito_id + '|' + r.atividade_id] = r.status; });
    var estado = {};
    function refazEstado() {
      estado = {};
      port.forEach(function (r) { if (r.status !== 'ANULADO') estado[r.inscrito_id + '|' + dia_(r.dia)] = r.tipo; });
    }
    refazEstado();
    var presentes = {};
    pres.forEach(function (r) { if (r.status !== 'ANULADO') presentes[r.inscrito_id + '|' + r.atividade_id] = r; });

    var resultados = itens.map(function (it) {
      var t0 = Date.now();
      var cid = String(it.clientId || '');
      try {
        if (it.kind === 'undo') {
          var alvo = clientes[cid];
          if (!alvo) return { clientId: cid, resultado: 'NAO_ENCONTRADO' };
          if (alvo.r.status !== 'ANULADO') {
            updateRow_(alvo.aba, alvo.r._row, { status: 'ANULADO' });
            alvo.r.status = 'ANULADO';
            if (alvo.aba === SHEETS.PORTARIA) refazEstado();
            else delete presentes[alvo.r.inscrito_id + '|' + alvo.r.atividade_id];
          }
          return { clientId: cid, resultado: 'ANULADO' };
        }
        if (cid && clientes[cid]) return { clientId: cid, resultado: 'REGISTRADO', repetido: true };
        var insc = it.h ? (/^[a-f0-9]{64}$/.test(String(it.h)) ? porHash[String(it.h)] : null) : porToken[String(it.token || '')];   // `token` só para versões antigas do scanner
        if (!insc) return { clientId: cid, resultado: 'TOKEN_INVALIDO' };
        if (insc.status !== 'ATIVA') return { clientId: cid, resultado: 'CANCELADA', nome: insc.nome };
        var ts = tsValido_(it.ts);
        var operador = semFormula_(String(it.operador || '').slice(0, 40));
        if (it.modo === 'PORTARIA') {
          var dia = String(it.dia || '');
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dia)) return { clientId: cid, resultado: 'DADOS_INVALIDOS' };
          var chave = insc.id + '|' + dia;
          var tipo = it.tipo === 'ENTRADA' || it.tipo === 'SAIDA' ? it.tipo : (estado[chave] === 'ENTRADA' ? 'SAIDA' : 'ENTRADA');
          var linha = { inscrito_id: insc.id, dia: dia, tipo: tipo, data_hora: fmtTs_(ts), operador: operador, status: 'VALIDO',
            client_id: cid, ts: ts, local_ms: Number(it.localMs) || '', server_ms: Date.now() - t0 };
          appendObj_(SHEETS.PORTARIA, linha);
          linha._row = sheet_(SHEETS.PORTARIA).getLastRow();
          port.push(linha); if (cid) clientes[cid] = { aba: SHEETS.PORTARIA, r: linha };
          estado[chave] = tipo;
          return { clientId: cid, resultado: 'REGISTRADO', tipo: tipo, nome: insc.nome, horario: horaTs_(ts) };
        }
        if (it.modo === 'ATIVIDADE') {
          var at = ativ[String(it.atividadeId)];
          if (!at) return { clientId: cid, resultado: 'DADOS_INVALIDOS' };
          var ck = insc.id + '|' + at.id;
          if (presentes[ck]) return { clientId: cid, resultado: 'JA_REGISTRADO', nome: insc.nome, horario: String(presentes[ck].data_hora).slice(11) };
          var sit = conf[ck] || null;
          if (String(at.exige_inscricao).toUpperCase() === 'SIM' && sit !== 'CONFIRMADA' && !it.forcar) {
            return { clientId: cid, resultado: 'NAO_INSCRITO', nome: insc.nome, situacao: sit };
          }
          var l2 = { inscrito_id: insc.id, atividade_id: at.id, data_hora: fmtTs_(ts), operador: operador, status: 'VALIDO',
            client_id: cid, ts: ts, local_ms: Number(it.localMs) || '', server_ms: Date.now() - t0 };
          appendObj_(SHEETS.PRES, l2);
          l2._row = sheet_(SHEETS.PRES).getLastRow();
          pres.push(l2); if (cid) clientes[cid] = { aba: SHEETS.PRES, r: l2 };
          presentes[ck] = l2;
          return { clientId: cid, resultado: 'REGISTRADO', nome: insc.nome, horario: horaTs_(ts), forcado: !!it.forcar };
        }
        return { clientId: cid, resultado: 'DADOS_INVALIDOS' };
      } catch (e) {
        log_('erro_scan', Date.now() - t0, String(e));
        return { clientId: cid, resultado: 'ERRO' };
      }
    });
    log_('scan_lote', 0, itens.length + ' item(ns)');
    return { ok: true, resultados: resultados };
  });
}

/** Soma pares ENTRADA→SAÍDA por pessoa/dia e gera Certificados. */
function recalcularPermanencia_() {
  var grupos = calcularPermanencia_();
  var perm = [], total = {}, pendPessoa = {}, pendentes = 0;
  Object.keys(grupos).sort().forEach(function (k) {
    var g = grupos[k];
    var m = Math.round(g.min * 10) / 10;
    perm.push([g.insc, g.dia, m, g.pend ? 'SIM' : 'NAO']);
    total[g.insc] = (total[g.insc] || 0) + g.min;
    if (g.pend) { pendPessoa[g.insc] = (pendPessoa[g.insc] || 0) + 1; pendentes++; }
  });
  var cert = Object.keys(total).sort().map(function (id) {
    return [id, Math.round(total[id] / 60 * 100) / 100,
      pendPessoa[id] ? 'Saída não registrada em ' + pendPessoa[id] + ' dia(s): conferir antes de emitir o certificado.' : ''];
  });
  substituirLinhas_(SHEETS.PERM, perm);
  substituirLinhas_(SHEETS.CERT, cert);
  return { pessoas: cert.length, pendentes: pendentes };
}

function substituirLinhas_(nome, matriz) {
  var sh = sheet_(nome), cols = HEADERS[nome].length;
  var ultima = sh.getLastRow();
  if (ultima > 1) sh.getRange(2, 1, ultima - 1, cols).clearContent();
  if (matriz.length) sh.getRange(2, 1, matriz.length, cols).setValues(matriz);
  invalidar_(nome);
}

// ===== Painel =====
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

// ===== AdminApi =====
/**
 * API do painel de administração (/admin/). Todas as ações exigem a senha PIN_ADMIN (validada aqui, a cada chamada),
 * com bloqueio por tentativas. O token (credencial do QR) nunca é devolvido. Ações que alteram dados vão para o Log.
 */

function semAcento_(s) { return String(s === undefined || s === null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); }

function adminLog_(p, evento, detalhe) {
  log_('admin_' + evento, 0, (semFormula_(String(p.operador || 'sem nome').slice(0, 40)) || 'sem nome') + ': ' + detalhe);
}

function pubInsc_(i) {
  return { id: i.id, nome: i.nome, curso: i.curso, periodo: i.periodo, matricula: i.matricula, email: i.email,
    data_hora: i.data_hora, status: i.status, status_email: i.status_email };
}

function inscPorId_(id) {
  var l = readAll_(SHEETS.INSC);
  for (var i = 0; i < l.length; i++) if (String(l[i].id) === String(id)) return l[i];
  return null;
}

function adminHandle_(p) {
  var chk = checkPin_(p.pin, 'PIN_ADMIN', 'ADMIN');
  if (chk !== 'OK') return { ok: false, auth: true, code: chk, mensagem: MSG_PIN_ADMIN[chk] };
  var escrita = /^admin_(editar|cancelar|reativar|reenviar|novo|inscrever|vaga|backup|set_pin|atividade_set|set_inscricoes|reprocessar)/.test(p.action);
  if (escrita && !String(p.operador || '').trim()) return { ok: false, code: 'OPERADOR', mensagem: 'Informe o seu nome no login para registrar as alterações.' };
  switch (p.action) {
    case 'admin_login':
    case 'admin_resumo': return adminResumo_();
    case 'admin_buscar': return adminBuscar_(p);
    case 'admin_lista': return adminLista_(p);
    case 'admin_ficha': return adminFicha_(p);
    case 'admin_editar': return adminEditar_(p);
    case 'admin_cancelar_inscrito': return adminCancelarInscrito_(p);
    case 'admin_reativar_inscrito': return adminReativar_(p);
    case 'admin_reenviar_qr': return adminReenviarQr_(p);
    case 'admin_novo_qr': return adminNovoQr_(p);
    case 'admin_inscrever': return adminInscrever_(p);
    case 'admin_vaga_cancelar': return adminCancelarVaga_(p);
    case 'admin_atividades': return adminAtividades_();
    case 'admin_atividade_lista': return adminAtividadeLista_(p);
    case 'admin_atividade_set': return adminAtividadeSet_(p);
    case 'admin_set_inscricoes': return adminSetInscricoes_(p);
    case 'admin_alertas': return adminAlertas_();
    case 'admin_reprocessar': return adminReprocessar_(p);
    case 'admin_tabela': return adminTabela_(p);
    case 'admin_log': return adminLogLista_(p);
    case 'admin_duplicados': return adminDuplicados_();
    case 'admin_backup': return adminBackup_(p);
    case 'admin_set_pin': return adminSetPin_(p);
    default: return { ok: false, mensagem: 'Ação desconhecida.' };
  }
}

function adminResumo_() {
  var insc = readAll_(SHEETS.INSC), outbox = readAll_(SHEETS.OUTBOX), cfg = getConfig_();
  var ativas = insc.filter(function (i) { return i.status === 'ATIVA'; });
  return {
    ok: true, versao: CODIGO_VERSAO,
    inscricoesAbertas: String(cfg.INSCRICOES).toUpperCase() === 'ABERTAS',
    inscritosAtivos: ativas.length, inscritosCancelados: insc.length - ativas.length,
    emailsPendentes: outbox.filter(function (o) { return o.status === 'PENDENTE'; }).length,
    emailsComErro: outbox.filter(function (o) { return o.status === 'ERRO'; }).length,
    alertasNovos: readAll_(SHEETS.ALERTAS).filter(function (a) { return a.notificado !== 'SIM'; }).length,
    cotaEmailRestante: (function () { try { return MailApp.getRemainingDailyQuota(); } catch (e) { return null; } })(),
    porCurso: contar_(ativas, function (i) { return i.curso; }),
    porPeriodo: contar_(ativas, function (i) { return i.periodo; })
  };
}

function adminBuscar_(p) {
  var q = semAcento_(p.q).trim();
  if (q.length < 2) return { ok: true, resultados: [], mensagem: 'Digite ao menos 2 caracteres.' };
  var achados = readAll_(SHEETS.INSC).filter(function (i) {
    return semAcento_(i.nome).indexOf(q) >= 0 || semAcento_(i.matricula).indexOf(q) >= 0 || semAcento_(i.email).indexOf(q) >= 0;
  });
  return { ok: true, total: achados.length, resultados: achados.slice(0, 30).map(pubInsc_) };
}

/** Lista completa de inscritos (campos públicos do painel, sem token) para a aba Inscritos. */
function adminLista_(p) {
  var todos = readAll_(SHEETS.INSC).map(pubInsc_);
  return { ok: true, total: todos.length, inscritos: todos };
}

function adminFicha_(p) {
  var i = inscPorId_(p.id);
  if (!i) return { ok: false, mensagem: 'Inscrito não encontrado.' };
  var ativs = {}; readAll_(SHEETS.ATIV).forEach(function (a) { ativs[String(a.id)] = a; });
  var minhas = readAll_(SHEETS.IA).filter(function (r) { return String(r.inscrito_id) === String(i.id); }).map(function (r) {
    var a = ativs[String(r.atividade_id)] || {};
    return { iaId: r.id, atividadeId: r.atividade_id, titulo: a.titulo || '', dia: a.dia ? dia_(a.dia) : '', inicio: a.inicio ? hm_(a.inicio) : '', fim: a.fim ? hm_(a.fim) : '',
      status: r.status, posicao: r.posicao === '' ? null : Number(r.posicao), data_hora: r.data_hora };
  });
  var presencas = readAll_(SHEETS.PRES).filter(function (r) { return String(r.inscrito_id) === String(i.id); }).map(function (r) {
    return { atividadeId: r.atividade_id, titulo: (ativs[String(r.atividade_id)] || {}).titulo || '', data_hora: r.data_hora, operador: r.operador, status: r.status };
  });
  var portaria = readAll_(SHEETS.PORTARIA).filter(function (r) { return String(r.inscrito_id) === String(i.id); }).map(function (r) {
    return { dia: dia_(r.dia), tipo: r.tipo, data_hora: r.data_hora, operador: r.operador, status: r.status };
  });
  var emails = readAll_(SHEETS.OUTBOX).filter(function (o) { return String(o.inscrito_id) === String(i.id); }).map(function (o) {
    return { tipo: o.tipo, status: o.status, criado_em: o.criado_em, enviado_em: o.enviado_em, tentativas: o.tentativas, erro: o.erro };
  });
  return { ok: true, inscrito: pubInsc_(i), atividades: minhas, presencas: presencas, portaria: portaria, emails: emails };
}

function adminEditar_(p) {
  var res = withLock_(function () {
    var i = inscPorId_(p.id);
    if (!i) return { ok: false, mensagem: 'Inscrito não encontrado.' };
    var c = p.campos || {};
    var d = {
      nome: normNome_(c.nome !== undefined ? c.nome : i.nome), curso: normNome_(c.curso !== undefined ? c.curso : i.curso),
      periodo: normNome_(c.periodo !== undefined ? c.periodo : i.periodo),
      matricula: normMatricula_(c.matricula !== undefined ? c.matricula : i.matricula), email: normEmail_(c.email !== undefined ? c.email : i.email)
    };
    var erros = validarInscricao_(d);
    if (Object.keys(erros).length) return { ok: false, code: 'INVALIDO', mensagem: MSG.invalido, erros: erros };
    var outro = readAll_(SHEETS.INSC).some(function (x) { return x._row !== i._row && normMatricula_(x.matricula) === d.matricula; });
    if (outro) return { ok: false, code: 'INVALIDO', mensagem: 'Já existe outro inscrito com esta matrícula.', erros: { matricula: 'Matrícula já cadastrada para outra pessoa.' } };
    var mudancas = {}, antes = [];
    ['nome', 'curso', 'periodo', 'matricula', 'email'].forEach(function (k) {
      if (String(i[k]) !== String(d[k])) { mudancas[k] = d[k]; antes.push(k + ': "' + i[k] + '" → "' + d[k] + '"'); }
    });
    if (!Object.keys(mudancas).length) return { ok: true, semMudancas: true };
    var emailMudou = mudancas.email !== undefined;
    if (emailMudou) mudancas.status_email = 'PENDENTE';
    updateRow_(SHEETS.INSC, i._row, mudancas);
    if (emailMudou && i.status === 'ATIVA') enqueueEmail_(i.id, 'CONFIRMACAO');
    adminLog_(p, 'editar', i.id + ' — ' + antes.join('; '));
    return { ok: true, emailReenviado: emailMudou && i.status === 'ATIVA' };
  });
  if (res.ok && res.emailReenviado) { try { processOutbox_(2, p.id); } catch (e) { /* o gatilho reenvia */ } }
  return res;
}

function adminCancelarInscrito_(p) {
  var r = cancelarInscrito_(p.id);
  if (r.ok) { adminLog_(p, 'cancelar_inscrito', p.id + ' (promovidos da fila: ' + r.promovidos + ')'); try { processOutbox_(10); } catch (e) { /* gatilho */ } }
  return r;
}

function adminReativar_(p) {
  return withLock_(function () {
    var i = inscPorId_(p.id);
    if (!i) return { ok: false, mensagem: 'Inscrito não encontrado.' };
    if (i.status === 'ATIVA') return { ok: true, jaAtiva: true };
    updateRow_(SHEETS.INSC, i._row, { status: 'ATIVA' });
    adminLog_(p, 'reativar_inscrito', i.id);
    return { ok: true };
  });
}

function adminReenviarQr_(p) {
  var ok = withLock_(function () {
    var i = inscPorId_(p.id);
    if (!i || i.status !== 'ATIVA') return false;
    updateRow_(SHEETS.INSC, i._row, { status_email: 'PENDENTE' });
    enqueueEmail_(i.id, 'CONFIRMACAO');
    adminLog_(p, 'reenviar_qr', i.id + ' → ' + i.email);
    return true;
  });
  if (!ok) return { ok: false, mensagem: 'Inscrito não encontrado ou cancelado.' };
  try { processOutbox_(2, p.id); } catch (e) { /* gatilho */ }
  return { ok: true };
}

/** Gera um novo QR Code (token) e invalida o anterior: use quando o QR for compartilhado, perdido ou fotografado por outra pessoa. */
function adminNovoQr_(p) {
  var ok = withLock_(function () {
    var i = inscPorId_(p.id);
    if (!i || i.status !== 'ATIVA') return false;
    updateRow_(SHEETS.INSC, i._row, { token: novoToken_(), status_email: 'PENDENTE' });
    enqueueEmail_(i.id, 'CONFIRMACAO');
    adminLog_(p, 'novo_qr', i.id + ' (QR anterior invalidado)');
    return true;
  });
  if (!ok) return { ok: false, mensagem: 'Inscrito não encontrado ou cancelado.' };
  try { processOutbox_(2, p.id); } catch (e) { /* gatilho */ }
  return { ok: true };
}

function adminInscrever_(p) {
  var r = inscreverManual_(p.id, p.atividadeId);
  if (r.ok) adminLog_(p, 'inscrever', p.id + ' em ' + p.atividadeId + ' → ' + r.status);
  return r;
}

function adminCancelarVaga_(p) {
  var r = cancelarVaga_(p.iaId);
  if (r.ok) { adminLog_(p, 'vaga_cancelar', p.iaId + ' (promovidos: ' + (r.promovidos || 0) + ')'); try { processOutbox_(10); } catch (e) { /* gatilho */ } }
  return r;
}

function adminAtividades_() {
  atualizarContagensSeguro_();
  return { ok: true, atividades: readAll_(SHEETS.ATIV).map(function (a) {
    return { id: a.id, dia: dia_(a.dia), inicio: hm_(a.inicio), fim: hm_(a.fim), titulo: a.titulo, tipo: a.tipo,
      vagas_max: a.vagas_max === '' ? '' : Number(a.vagas_max), vagas_min: a.vagas_min === '' ? '' : Number(a.vagas_min),
      aberta: String(a.inscricoes_abertas).toUpperCase() === 'SIM', exige: String(a.exige_inscricao).toUpperCase() === 'SIM',
      ocupadas: a.ocupadas, restantes: a.restantes, na_fila: a.na_fila };
  }) };
}

function adminAtividadeLista_(p) {
  var a = getAtividade_(p.id);
  if (!a) return { ok: false, mensagem: 'Atividade não encontrada.' };
  var porId = {}; readAll_(SHEETS.INSC).forEach(function (i) { porId[String(i.id)] = i; });
  var pres = {}; readAll_(SHEETS.PRES).forEach(function (r) { if (String(r.atividade_id) === String(a.id) && r.status !== 'ANULADO') pres[String(r.inscrito_id)] = r.data_hora; });
  var linhas = readAll_(SHEETS.IA).filter(function (r) { return String(r.atividade_id) === String(a.id) && r.status !== 'CANCELADA'; }).map(function (r) {
    var i = porId[String(r.inscrito_id)] || {};
    return { inscritoId: r.inscrito_id, nome: i.nome, matricula: i.matricula, email: i.email, status: r.status,
      posicao: r.posicao === '' ? null : Number(r.posicao), presenca: pres[String(r.inscrito_id)] || '' };
  });
  return { ok: true, atividade: { id: a.id, titulo: a.titulo }, inscritos: linhas };
}

function adminAtividadeSet_(p) {
  var a = getAtividade_(p.id);
  if (!a) return { ok: false, mensagem: 'Atividade não encontrada.' };
  var c = p.campos || {}, mud = {}, desc = [];
  function inteiro(v) { return v === '' || v === null ? '' : (/^\d{1,4}$/.test(String(v).trim()) ? parseInt(v, 10) : NaN); }
  if (c.vagas_max !== undefined) { var m = inteiro(c.vagas_max); if (isNaN(m)) return { ok: false, mensagem: 'Vagas máximas deve ser um número inteiro (ou vazio para sem limite).' }; mud.vagas_max = m; }
  if (c.vagas_min !== undefined) { var n = inteiro(c.vagas_min); if (isNaN(n)) return { ok: false, mensagem: 'Vagas mínimas deve ser um número inteiro (ou vazio).' }; mud.vagas_min = n; }
  if (c.aberta !== undefined) mud.inscricoes_abertas = c.aberta ? 'SIM' : 'NAO';
  Object.keys(mud).forEach(function (k) { if (String(a[k]) !== String(mud[k])) desc.push(k + ': "' + a[k] + '" → "' + mud[k] + '"'); });
  if (!desc.length) return { ok: true, semMudancas: true };
  updateRow_(SHEETS.ATIV, a._row, mud);
  promoteAll_();
  adminLog_(p, 'atividade_set', a.id + ' — ' + desc.join('; '));
  try { processOutbox_(10); } catch (e) { /* gatilho */ }
  return { ok: true };
}

function adminSetInscricoes_(p) {
  var v = String(p.valor || '').toUpperCase();
  if (v !== 'ABERTAS' && v !== 'FECHADAS') return { ok: false, mensagem: 'Valor inválido.' };
  var linha = readAll_(SHEETS.CONFIG).filter(function (r) { return String(r.chave).trim() === 'INSCRICOES'; })[0];
  if (!linha) return { ok: false, mensagem: 'Chave INSCRICOES não encontrada na aba Config.' };
  updateRow_(SHEETS.CONFIG, linha._row, { valor: v });
  resetConfigCache_();
  adminLog_(p, 'set_inscricoes', v);
  return { ok: true, inscricoesAbertas: v === 'ABERTAS' };
}

/** Histórico das alterações feitas pelo painel (quem, quando, o quê): os 200 mais recentes. */
function adminLogLista_() {
  var itens = readAll_(SHEETS.LOG).filter(function (l) { return /^admin_/.test(String(l.evento)); }).slice(-200).reverse().map(function (l) {
    return { data_hora: l.data_hora, evento: String(l.evento).replace(/^admin_/, ''), detalhe: l.detalhe };
  });
  return { ok: true, itens: itens };
}

/** Possíveis duplicidades entre inscrições ativas: mesmo nome (sem acento/maiúsculas) com matrículas diferentes, ou mesmo e-mail. */
function adminDuplicados_() {
  var ativos = readAll_(SHEETS.INSC).filter(function (i) { return i.status === 'ATIVA'; });
  function agrupar(chaveDe, tipo) {
    var g = {};
    ativos.forEach(function (i) { var k = chaveDe(i); if (k) (g[k] = g[k] || []).push(i); });
    return Object.keys(g).filter(function (k) { return g[k].length > 1; }).map(function (k) {
      return { tipo: tipo, chave: k, inscritos: g[k].map(function (i) { return { id: i.id, nome: i.nome, matricula: i.matricula, email: i.email, curso: i.curso, periodo: i.periodo }; }) };
    });
  }
  var grupos = agrupar(function (i) { return semAcento_(i.nome).replace(/\s+/g, ' ').trim(); }, 'NOME')
    .concat(agrupar(function (i) { return String(i.email || '').trim().toLowerCase(); }, 'EMAIL'));
  return { ok: true, grupos: grupos };
}

/** Cópia de segurança sob demanda (a planilha inteira, na conta dona do sistema). */
function adminBackup_(p) {
  var url = criarBackup_();
  adminLog_(p, 'backup', 'cópia criada');
  return { ok: true, url: url };
}

/** Troca o PIN do scanner (ex.: aparelho perdido): quem estiver com o PIN antigo perde o acesso. O PIN nunca é registrado no log. */
function adminSetPin_(p) {
  var novo = String(p.novoPin === undefined || p.novoPin === null ? '' : p.novoPin).trim();
  var cfg = getConfig_();
  if (novo.length < 4 || novo.length > 20) return { ok: false, code: 'PIN_INVALIDO', mensagem: 'O novo PIN deve ter de 4 a 20 caracteres.' };
  if (novo === String(cfg.PIN_ADMIN || '')) return { ok: false, code: 'PIN_INVALIDO', mensagem: 'O PIN do scanner deve ser diferente da senha do administrador.' };
  var linha = readAll_(SHEETS.CONFIG).filter(function (r) { return String(r.chave).trim() === 'PIN'; })[0];
  if (!linha) return { ok: false, mensagem: 'Chave PIN não encontrada na aba Config.' };
  updateRow_(SHEETS.CONFIG, linha._row, { valor: novo });
  resetConfigCache_();
  var props = PropertiesService.getScriptProperties();
  ['PIN_BLOQ_ATE', 'PIN_FALHAS', 'PIN_FALHAS_DESDE'].forEach(function (k) { props.setProperty(k, '0'); });
  adminLog_(p, 'set_pin_scanner', 'PIN do scanner trocado');
  return { ok: true };
}

function adminAlertas_() {
  var porId = {}; readAll_(SHEETS.INSC).forEach(function (i) { porId[String(i.id)] = i; });
  var alertas = readAll_(SHEETS.ALERTAS).slice(-60).reverse().map(function (a) {
    return { data_hora: a.data_hora, tipo: a.tipo, mensagem: a.mensagem, notificado: a.notificado === 'SIM' };
  });
  var fila = readAll_(SHEETS.OUTBOX).filter(function (o) { return o.status === 'PENDENTE' || o.status === 'ERRO'; }).slice(-60).map(function (o) {
    var i = porId[String(o.inscrito_id)] || {};
    return { id: o.id, tipo: o.tipo, status: o.status, nome: i.nome, email: i.email, tentativas: o.tentativas, erro: o.erro, criado_em: o.criado_em };
  });
  return { ok: true, alertas: alertas, emailsPendentes: fila };
}

function adminReprocessar_(p) {
  var n = processOutbox_(30);
  adminLog_(p, 'reprocessar', n + ' e-mail(s) enviado(s)');
  return { ok: true, enviados: n };
}

/** Tabelas para exportação (CSV no navegador). Nunca inclui a coluna token. */
function adminTabela_(p) {
  var nome = String(p.nome || '');
  var permitidas = { base: SHEETS.BASE, inscritos: SHEETS.INSC, atividades_inscricoes: SHEETS.IA, portaria: SHEETS.PORTARIA,
    presenca: SHEETS.PRES, permanencia: SHEETS.PERM, certificados: SHEETS.CERT };
  var aba = permitidas[nome];
  if (!aba) return { ok: false, mensagem: 'Tabela inválida.' };
  if (nome === 'base') atualizarBase_();
  if (nome === 'permanencia' || nome === 'certificados') recalcularPermanencia_();
  var headers = HEADERS[aba].filter(function (h) { return h !== 'token'; });
  var rows = readAll_(aba).map(function (r) { return headers.map(function (h) { return r[h] === undefined ? '' : r[h]; }); });
  return { ok: true, nome: nome, headers: headers, rows: rows.slice(0, 20000) };
}

// ===== Api =====
/** Web App (API JSON). O front-end envia POST com Content-Type text/plain (evita preflight de CORS). */

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function handle_(p) {
  resetConfigCache_();
  switch (p.action) {
    case 'config': return getPublicConfig_();
    case 'register': return register_(p);
    case 'me': return getMe_(p);
    case 'enroll': return enroll_(p);
    case 'scan_lista': return scanLista_(p);
    case 'scan_lote': return scanLote_(p);
    default:
      if (/^admin_/.test(String(p.action))) return adminHandle_(p);
      return { ok: false, mensagem: 'Ação desconhecida.' };
  }
}

function handleSeguro_(p) {
  try {
    var migrou = garantirMigracao_();
    if (p.action === 'versao') return { ok: true, versao: CODIGO_VERSAO, migrou: migrou };
    return handle_(p);
  }
  catch (err) {
    if (err && err.code === 'OCUPADO') return { ok: false, code: 'OCUPADO', mensagem: MSG.ocupado };
    log_('erro_api', 0, String(err && err.stack ? err.stack : err));
    return { ok: false, code: 'ERRO', mensagem: MSG.erroInterno };
  }
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (!p.action) p.action = 'config';
  return json_(handleSeguro_(p));
}

function doPost(e) {
  var p;
  try { p = JSON.parse(e.postData.contents); }
  catch (err) { return json_({ ok: false, code: 'ERRO', mensagem: MSG.erroInterno }); }
  return json_(handleSeguro_(p));
}

// ===== Admin =====
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

function menuPainel() {
  var r = atualizarPainel_();
  alerta_('Painel atualizado', 'Veja as abas Painel (resumo) e Base_Analise (uma linha por inscrito, pronta para tabela dinâmica). Inscritos ativos: ' + r.inscritos + '.');
}

function menuBackup() {
  try {
    var url = criarBackup_();
    alerta_('Cópia de segurança criada', 'A cópia foi salva no seu Google Drive:\n' + url);
  } catch (e) {
    alerta_('Não foi possível criar a cópia', 'Use Arquivo > Fazer uma cópia na planilha. Detalhe técnico: ' + e);
  }
}

function menuReativarInscrito() {
  var row = linhaSelecionada_(SHEETS.INSC); if (!row) return;
  var insc = inscritoDaLinha_(row); if (!insc) return;
  if (insc.status === 'ATIVA') { alerta_('Reativar', 'Esta inscrição já está ativa.'); return; }
  var r = ui_().alert('Reativar inscrição', 'Reativar a inscrição de ' + insc.nome + ' no evento? As vagas em atividades NÃO são restauradas: a pessoa deverá escolher novamente ou você poderá inscrevê-la manualmente.', ui_().ButtonSet.YES_NO);
  if (r !== ui_().Button.YES) return;
  updateRow_(SHEETS.INSC, insc._row, { status: 'ATIVA' });
  alerta_('Reativar', 'Inscrição reativada.');
}

// ===== Qrcode =====
//---------------------------------------------------------------------
//
// QR Code Generator for JavaScript
//
// Copyright (c) 2009 Kazuhiko Arase
//
// URL: http://www.d-project.com/
//
// Licensed under the MIT license:
//  http://www.opensource.org/licenses/mit-license.php
//
// The word 'QR Code' is registered trademark of
// DENSO WAVE INCORPORATED
//  http://www.denso-wave.com/qrcode/faqpatent-e.html
//
//---------------------------------------------------------------------

var qrcode = function() {

  //---------------------------------------------------------------------
  // qrcode
  //---------------------------------------------------------------------

  /**
   * qrcode
   * @param typeNumber 1 to 40
   * @param errorCorrectionLevel 'L','M','Q','H'
   */
  var qrcode = function(typeNumber, errorCorrectionLevel) {

    var PAD0 = 0xEC;
    var PAD1 = 0x11;

    var _typeNumber = typeNumber;
    var _errorCorrectionLevel = QRErrorCorrectionLevel[errorCorrectionLevel];
    var _modules = null;
    var _moduleCount = 0;
    var _dataCache = null;
    var _dataList = [];

    var _this = {};

    var makeImpl = function(test, maskPattern) {

      _moduleCount = _typeNumber * 4 + 17;
      _modules = function(moduleCount) {
        var modules = new Array(moduleCount);
        for (var row = 0; row < moduleCount; row += 1) {
          modules[row] = new Array(moduleCount);
          for (var col = 0; col < moduleCount; col += 1) {
            modules[row][col] = null;
          }
        }
        return modules;
      }(_moduleCount);

      setupPositionProbePattern(0, 0);
      setupPositionProbePattern(_moduleCount - 7, 0);
      setupPositionProbePattern(0, _moduleCount - 7);
      setupPositionAdjustPattern();
      setupTimingPattern();
      setupTypeInfo(test, maskPattern);

      if (_typeNumber >= 7) {
        setupTypeNumber(test);
      }

      if (_dataCache == null) {
        _dataCache = createData(_typeNumber, _errorCorrectionLevel, _dataList);
      }

      mapData(_dataCache, maskPattern);
    };

    var setupPositionProbePattern = function(row, col) {

      for (var r = -1; r <= 7; r += 1) {

        if (row + r <= -1 || _moduleCount <= row + r) continue;

        for (var c = -1; c <= 7; c += 1) {

          if (col + c <= -1 || _moduleCount <= col + c) continue;

          if ( (0 <= r && r <= 6 && (c == 0 || c == 6) )
              || (0 <= c && c <= 6 && (r == 0 || r == 6) )
              || (2 <= r && r <= 4 && 2 <= c && c <= 4) ) {
            _modules[row + r][col + c] = true;
          } else {
            _modules[row + r][col + c] = false;
          }
        }
      }
    };

    var getBestMaskPattern = function() {

      var minLostPoint = 0;
      var pattern = 0;

      for (var i = 0; i < 8; i += 1) {

        makeImpl(true, i);

        var lostPoint = QRUtil.getLostPoint(_this);

        if (i == 0 || minLostPoint > lostPoint) {
          minLostPoint = lostPoint;
          pattern = i;
        }
      }

      return pattern;
    };

    var setupTimingPattern = function() {

      for (var r = 8; r < _moduleCount - 8; r += 1) {
        if (_modules[r][6] != null) {
          continue;
        }
        _modules[r][6] = (r % 2 == 0);
      }

      for (var c = 8; c < _moduleCount - 8; c += 1) {
        if (_modules[6][c] != null) {
          continue;
        }
        _modules[6][c] = (c % 2 == 0);
      }
    };

    var setupPositionAdjustPattern = function() {

      var pos = QRUtil.getPatternPosition(_typeNumber);

      for (var i = 0; i < pos.length; i += 1) {

        for (var j = 0; j < pos.length; j += 1) {

          var row = pos[i];
          var col = pos[j];

          if (_modules[row][col] != null) {
            continue;
          }

          for (var r = -2; r <= 2; r += 1) {

            for (var c = -2; c <= 2; c += 1) {

              if (r == -2 || r == 2 || c == -2 || c == 2
                  || (r == 0 && c == 0) ) {
                _modules[row + r][col + c] = true;
              } else {
                _modules[row + r][col + c] = false;
              }
            }
          }
        }
      }
    };

    var setupTypeNumber = function(test) {

      var bits = QRUtil.getBCHTypeNumber(_typeNumber);

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[Math.floor(i / 3)][i % 3 + _moduleCount - 8 - 3] = mod;
      }

      for (var i = 0; i < 18; i += 1) {
        var mod = (!test && ( (bits >> i) & 1) == 1);
        _modules[i % 3 + _moduleCount - 8 - 3][Math.floor(i / 3)] = mod;
      }
    };

    var setupTypeInfo = function(test, maskPattern) {

      var data = (_errorCorrectionLevel << 3) | maskPattern;
      var bits = QRUtil.getBCHTypeInfo(data);

      // vertical
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 6) {
          _modules[i][8] = mod;
        } else if (i < 8) {
          _modules[i + 1][8] = mod;
        } else {
          _modules[_moduleCount - 15 + i][8] = mod;
        }
      }

      // horizontal
      for (var i = 0; i < 15; i += 1) {

        var mod = (!test && ( (bits >> i) & 1) == 1);

        if (i < 8) {
          _modules[8][_moduleCount - i - 1] = mod;
        } else if (i < 9) {
          _modules[8][15 - i - 1 + 1] = mod;
        } else {
          _modules[8][15 - i - 1] = mod;
        }
      }

      // fixed module
      _modules[_moduleCount - 8][8] = (!test);
    };

    var mapData = function(data, maskPattern) {

      var inc = -1;
      var row = _moduleCount - 1;
      var bitIndex = 7;
      var byteIndex = 0;
      var maskFunc = QRUtil.getMaskFunction(maskPattern);

      for (var col = _moduleCount - 1; col > 0; col -= 2) {

        if (col == 6) col -= 1;

        while (true) {

          for (var c = 0; c < 2; c += 1) {

            if (_modules[row][col - c] == null) {

              var dark = false;

              if (byteIndex < data.length) {
                dark = ( ( (data[byteIndex] >>> bitIndex) & 1) == 1);
              }

              var mask = maskFunc(row, col - c);

              if (mask) {
                dark = !dark;
              }

              _modules[row][col - c] = dark;
              bitIndex -= 1;

              if (bitIndex == -1) {
                byteIndex += 1;
                bitIndex = 7;
              }
            }
          }

          row += inc;

          if (row < 0 || _moduleCount <= row) {
            row -= inc;
            inc = -inc;
            break;
          }
        }
      }
    };

    var createBytes = function(buffer, rsBlocks) {

      var offset = 0;

      var maxDcCount = 0;
      var maxEcCount = 0;

      var dcdata = new Array(rsBlocks.length);
      var ecdata = new Array(rsBlocks.length);

      for (var r = 0; r < rsBlocks.length; r += 1) {

        var dcCount = rsBlocks[r].dataCount;
        var ecCount = rsBlocks[r].totalCount - dcCount;

        maxDcCount = Math.max(maxDcCount, dcCount);
        maxEcCount = Math.max(maxEcCount, ecCount);

        dcdata[r] = new Array(dcCount);

        for (var i = 0; i < dcdata[r].length; i += 1) {
          dcdata[r][i] = 0xff & buffer.getBuffer()[i + offset];
        }
        offset += dcCount;

        var rsPoly = QRUtil.getErrorCorrectPolynomial(ecCount);
        var rawPoly = qrPolynomial(dcdata[r], rsPoly.getLength() - 1);

        var modPoly = rawPoly.mod(rsPoly);
        ecdata[r] = new Array(rsPoly.getLength() - 1);
        for (var i = 0; i < ecdata[r].length; i += 1) {
          var modIndex = i + modPoly.getLength() - ecdata[r].length;
          ecdata[r][i] = (modIndex >= 0)? modPoly.getAt(modIndex) : 0;
        }
      }

      var totalCodeCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalCodeCount += rsBlocks[i].totalCount;
      }

      var data = new Array(totalCodeCount);
      var index = 0;

      for (var i = 0; i < maxDcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < dcdata[r].length) {
            data[index] = dcdata[r][i];
            index += 1;
          }
        }
      }

      for (var i = 0; i < maxEcCount; i += 1) {
        for (var r = 0; r < rsBlocks.length; r += 1) {
          if (i < ecdata[r].length) {
            data[index] = ecdata[r][i];
            index += 1;
          }
        }
      }

      return data;
    };

    var createData = function(typeNumber, errorCorrectionLevel, dataList) {

      var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, errorCorrectionLevel);

      var buffer = qrBitBuffer();

      for (var i = 0; i < dataList.length; i += 1) {
        var data = dataList[i];
        buffer.put(data.getMode(), 4);
        buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
        data.write(buffer);
      }

      // calc num max data.
      var totalDataCount = 0;
      for (var i = 0; i < rsBlocks.length; i += 1) {
        totalDataCount += rsBlocks[i].dataCount;
      }

      if (buffer.getLengthInBits() > totalDataCount * 8) {
        throw 'code length overflow. ('
          + buffer.getLengthInBits()
          + '>'
          + totalDataCount * 8
          + ')';
      }

      // end code
      if (buffer.getLengthInBits() + 4 <= totalDataCount * 8) {
        buffer.put(0, 4);
      }

      // padding
      while (buffer.getLengthInBits() % 8 != 0) {
        buffer.putBit(false);
      }

      // padding
      while (true) {

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD0, 8);

        if (buffer.getLengthInBits() >= totalDataCount * 8) {
          break;
        }
        buffer.put(PAD1, 8);
      }

      return createBytes(buffer, rsBlocks);
    };

    _this.addData = function(data, mode) {

      mode = mode || 'Byte';

      var newData = null;

      switch(mode) {
      case 'Numeric' :
        newData = qrNumber(data);
        break;
      case 'Alphanumeric' :
        newData = qrAlphaNum(data);
        break;
      case 'Byte' :
        newData = qr8BitByte(data);
        break;
      case 'Kanji' :
        newData = qrKanji(data);
        break;
      default :
        throw 'mode:' + mode;
      }

      _dataList.push(newData);
      _dataCache = null;
    };

    _this.isDark = function(row, col) {
      if (row < 0 || _moduleCount <= row || col < 0 || _moduleCount <= col) {
        throw row + ',' + col;
      }
      return _modules[row][col];
    };

    _this.getModuleCount = function() {
      return _moduleCount;
    };

    _this.make = function() {
      if (_typeNumber < 1) {
        var typeNumber = 1;

        for (; typeNumber < 40; typeNumber++) {
          var rsBlocks = QRRSBlock.getRSBlocks(typeNumber, _errorCorrectionLevel);
          var buffer = qrBitBuffer();

          for (var i = 0; i < _dataList.length; i++) {
            var data = _dataList[i];
            buffer.put(data.getMode(), 4);
            buffer.put(data.getLength(), QRUtil.getLengthInBits(data.getMode(), typeNumber) );
            data.write(buffer);
          }

          var totalDataCount = 0;
          for (var i = 0; i < rsBlocks.length; i++) {
            totalDataCount += rsBlocks[i].dataCount;
          }

          if (buffer.getLengthInBits() <= totalDataCount * 8) {
            break;
          }
        }

        _typeNumber = typeNumber;
      }

      makeImpl(false, getBestMaskPattern() );
    };

    _this.createTableTag = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var qrHtml = '';

      qrHtml += '<table style="';
      qrHtml += ' border-width: 0px; border-style: none;';
      qrHtml += ' border-collapse: collapse;';
      qrHtml += ' padding: 0px; margin: ' + margin + 'px;';
      qrHtml += '">';
      qrHtml += '<tbody>';

      for (var r = 0; r < _this.getModuleCount(); r += 1) {

        qrHtml += '<tr>';

        for (var c = 0; c < _this.getModuleCount(); c += 1) {
          qrHtml += '<td style="';
          qrHtml += ' border-width: 0px; border-style: none;';
          qrHtml += ' border-collapse: collapse;';
          qrHtml += ' padding: 0px; margin: 0px;';
          qrHtml += ' width: ' + cellSize + 'px;';
          qrHtml += ' height: ' + cellSize + 'px;';
          qrHtml += ' background-color: ';
          qrHtml += _this.isDark(r, c)? '#000000' : '#ffffff';
          qrHtml += ';';
          qrHtml += '"/>';
        }

        qrHtml += '</tr>';
      }

      qrHtml += '</tbody>';
      qrHtml += '</table>';

      return qrHtml;
    };

    _this.createSvgTag = function(cellSize, margin, alt, title) {

      var opts = {};
      if (typeof arguments[0] == 'object') {
        // Called by options.
        opts = arguments[0];
        // overwrite cellSize and margin.
        cellSize = opts.cellSize;
        margin = opts.margin;
        alt = opts.alt;
        title = opts.title;
      }

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      // Compose alt property surrogate
      alt = (typeof alt === 'string') ? {text: alt} : alt || {};
      alt.text = alt.text || null;
      alt.id = (alt.text) ? alt.id || 'qrcode-description' : null;

      // Compose title property surrogate
      title = (typeof title === 'string') ? {text: title} : title || {};
      title.text = title.text || null;
      title.id = (title.text) ? title.id || 'qrcode-title' : null;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var c, mc, r, mr, qrSvg='', rect;

      rect = 'l' + cellSize + ',0 0,' + cellSize +
        ' -' + cellSize + ',0 0,-' + cellSize + 'z ';

      qrSvg += '<svg version="1.1" xmlns="http://www.w3.org/2000/svg"';
      qrSvg += !opts.scalable ? ' width="' + size + 'px" height="' + size + 'px"' : '';
      qrSvg += ' viewBox="0 0 ' + size + ' ' + size + '" ';
      qrSvg += ' preserveAspectRatio="xMinYMin meet"';
      qrSvg += (title.text || alt.text) ? ' role="img" aria-labelledby="' +
          escapeXml([title.id, alt.id].join(' ').trim() ) + '"' : '';
      qrSvg += '>';
      qrSvg += (title.text) ? '<title id="' + escapeXml(title.id) + '">' +
          escapeXml(title.text) + '</title>' : '';
      qrSvg += (alt.text) ? '<description id="' + escapeXml(alt.id) + '">' +
          escapeXml(alt.text) + '</description>' : '';
      qrSvg += '<rect width="100%" height="100%" fill="white" cx="0" cy="0"/>';
      qrSvg += '<path d="';

      for (r = 0; r < _this.getModuleCount(); r += 1) {
        mr = r * cellSize + margin;
        for (c = 0; c < _this.getModuleCount(); c += 1) {
          if (_this.isDark(r, c) ) {
            mc = c*cellSize+margin;
            qrSvg += 'M' + mc + ',' + mr + rect;
          }
        }
      }

      qrSvg += '" stroke="transparent" fill="black"/>';
      qrSvg += '</svg>';

      return qrSvg;
    };

    _this.createDataURL = function(cellSize, margin) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      return createDataURL(size, size, function(x, y) {
        if (min <= x && x < max && min <= y && y < max) {
          var c = Math.floor( (x - min) / cellSize);
          var r = Math.floor( (y - min) / cellSize);
          return _this.isDark(r, c)? 0 : 1;
        } else {
          return 1;
        }
      } );
    };

    _this.createImgTag = function(cellSize, margin, alt) {

      cellSize = cellSize || 2;
      margin = (typeof margin == 'undefined')? cellSize * 4 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;

      var img = '';
      img += '<img';
      img += '\u0020src="';
      img += _this.createDataURL(cellSize, margin);
      img += '"';
      img += '\u0020width="';
      img += size;
      img += '"';
      img += '\u0020height="';
      img += size;
      img += '"';
      if (alt) {
        img += '\u0020alt="';
        img += escapeXml(alt);
        img += '"';
      }
      img += '/>';

      return img;
    };

    var escapeXml = function(s) {
      var escaped = '';
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charAt(i);
        switch(c) {
        case '<': escaped += '&lt;'; break;
        case '>': escaped += '&gt;'; break;
        case '&': escaped += '&amp;'; break;
        case '"': escaped += '&quot;'; break;
        default : escaped += c; break;
        }
      }
      return escaped;
    };

    var _createHalfASCII = function(margin) {
      var cellSize = 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r1, r2, p;

      var blocks = {
        '██': '█',
        '█ ': '▀',
        ' █': '▄',
        '  ': ' '
      };

      var blocksLastLineNoMargin = {
        '██': '▀',
        '█ ': '▀',
        ' █': ' ',
        '  ': ' '
      };

      var ascii = '';
      for (y = 0; y < size; y += 2) {
        r1 = Math.floor((y - min) / cellSize);
        r2 = Math.floor((y + 1 - min) / cellSize);
        for (x = 0; x < size; x += 1) {
          p = '█';

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r1, Math.floor((x - min) / cellSize))) {
            p = ' ';
          }

          if (min <= x && x < max && min <= y+1 && y+1 < max && _this.isDark(r2, Math.floor((x - min) / cellSize))) {
            p += ' ';
          }
          else {
            p += '█';
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          ascii += (margin < 1 && y+1 >= max) ? blocksLastLineNoMargin[p] : blocks[p];
        }

        ascii += '\n';
      }

      if (size % 2 && margin > 0) {
        return ascii.substring(0, ascii.length - size - 1) + Array(size+1).join('▀');
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.createASCII = function(cellSize, margin) {
      cellSize = cellSize || 1;

      if (cellSize < 2) {
        return _createHalfASCII(margin);
      }

      cellSize -= 1;
      margin = (typeof margin == 'undefined')? cellSize * 2 : margin;

      var size = _this.getModuleCount() * cellSize + margin * 2;
      var min = margin;
      var max = size - margin;

      var y, x, r, p;

      var white = Array(cellSize+1).join('██');
      var black = Array(cellSize+1).join('  ');

      var ascii = '';
      var line = '';
      for (y = 0; y < size; y += 1) {
        r = Math.floor( (y - min) / cellSize);
        line = '';
        for (x = 0; x < size; x += 1) {
          p = 1;

          if (min <= x && x < max && min <= y && y < max && _this.isDark(r, Math.floor((x - min) / cellSize))) {
            p = 0;
          }

          // Output 2 characters per pixel, to create full square. 1 character per pixels gives only half width of square.
          line += p ? white : black;
        }

        for (r = 0; r < cellSize; r += 1) {
          ascii += line + '\n';
        }
      }

      return ascii.substring(0, ascii.length-1);
    };

    _this.renderTo2dContext = function(context, cellSize) {
      cellSize = cellSize || 2;
      var length = _this.getModuleCount();
      for (var row = 0; row < length; row++) {
        for (var col = 0; col < length; col++) {
          context.fillStyle = _this.isDark(row, col) ? 'black' : 'white';
          context.fillRect(row * cellSize, col * cellSize, cellSize, cellSize);
        }
      }
    }

    return _this;
  };

  //---------------------------------------------------------------------
  // qrcode.stringToBytes
  //---------------------------------------------------------------------

  qrcode.stringToBytesFuncs = {
    'default' : function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        bytes.push(c & 0xff);
      }
      return bytes;
    }
  };

  qrcode.stringToBytes = qrcode.stringToBytesFuncs['default'];

  //---------------------------------------------------------------------
  // qrcode.createStringToBytes
  //---------------------------------------------------------------------

  /**
   * @param unicodeData base64 string of byte array.
   * [16bit Unicode],[16bit Bytes], ...
   * @param numChars
   */
  qrcode.createStringToBytes = function(unicodeData, numChars) {

    // create conversion map.

    var unicodeMap = function() {

      var bin = base64DecodeInputStream(unicodeData);
      var read = function() {
        var b = bin.read();
        if (b == -1) throw 'eof';
        return b;
      };

      var count = 0;
      var unicodeMap = {};
      while (true) {
        var b0 = bin.read();
        if (b0 == -1) break;
        var b1 = read();
        var b2 = read();
        var b3 = read();
        var k = String.fromCharCode( (b0 << 8) | b1);
        var v = (b2 << 8) | b3;
        unicodeMap[k] = v;
        count += 1;
      }
      if (count != numChars) {
        throw count + ' != ' + numChars;
      }

      return unicodeMap;
    }();

    var unknownChar = '?'.charCodeAt(0);

    return function(s) {
      var bytes = [];
      for (var i = 0; i < s.length; i += 1) {
        var c = s.charCodeAt(i);
        if (c < 128) {
          bytes.push(c);
        } else {
          var b = unicodeMap[s.charAt(i)];
          if (typeof b == 'number') {
            if ( (b & 0xff) == b) {
              // 1byte
              bytes.push(b);
            } else {
              // 2bytes
              bytes.push(b >>> 8);
              bytes.push(b & 0xff);
            }
          } else {
            bytes.push(unknownChar);
          }
        }
      }
      return bytes;
    };
  };

  //---------------------------------------------------------------------
  // QRMode
  //---------------------------------------------------------------------

  var QRMode = {
    MODE_NUMBER :    1 << 0,
    MODE_ALPHA_NUM : 1 << 1,
    MODE_8BIT_BYTE : 1 << 2,
    MODE_KANJI :     1 << 3
  };

  //---------------------------------------------------------------------
  // QRErrorCorrectionLevel
  //---------------------------------------------------------------------

  var QRErrorCorrectionLevel = {
    L : 1,
    M : 0,
    Q : 3,
    H : 2
  };

  //---------------------------------------------------------------------
  // QRMaskPattern
  //---------------------------------------------------------------------

  var QRMaskPattern = {
    PATTERN000 : 0,
    PATTERN001 : 1,
    PATTERN010 : 2,
    PATTERN011 : 3,
    PATTERN100 : 4,
    PATTERN101 : 5,
    PATTERN110 : 6,
    PATTERN111 : 7
  };

  //---------------------------------------------------------------------
  // QRUtil
  //---------------------------------------------------------------------

  var QRUtil = function() {

    var PATTERN_POSITION_TABLE = [
      [],
      [6, 18],
      [6, 22],
      [6, 26],
      [6, 30],
      [6, 34],
      [6, 22, 38],
      [6, 24, 42],
      [6, 26, 46],
      [6, 28, 50],
      [6, 30, 54],
      [6, 32, 58],
      [6, 34, 62],
      [6, 26, 46, 66],
      [6, 26, 48, 70],
      [6, 26, 50, 74],
      [6, 30, 54, 78],
      [6, 30, 56, 82],
      [6, 30, 58, 86],
      [6, 34, 62, 90],
      [6, 28, 50, 72, 94],
      [6, 26, 50, 74, 98],
      [6, 30, 54, 78, 102],
      [6, 28, 54, 80, 106],
      [6, 32, 58, 84, 110],
      [6, 30, 58, 86, 114],
      [6, 34, 62, 90, 118],
      [6, 26, 50, 74, 98, 122],
      [6, 30, 54, 78, 102, 126],
      [6, 26, 52, 78, 104, 130],
      [6, 30, 56, 82, 108, 134],
      [6, 34, 60, 86, 112, 138],
      [6, 30, 58, 86, 114, 142],
      [6, 34, 62, 90, 118, 146],
      [6, 30, 54, 78, 102, 126, 150],
      [6, 24, 50, 76, 102, 128, 154],
      [6, 28, 54, 80, 106, 132, 158],
      [6, 32, 58, 84, 110, 136, 162],
      [6, 26, 54, 82, 110, 138, 166],
      [6, 30, 58, 86, 114, 142, 170]
    ];
    var G15 = (1 << 10) | (1 << 8) | (1 << 5) | (1 << 4) | (1 << 2) | (1 << 1) | (1 << 0);
    var G18 = (1 << 12) | (1 << 11) | (1 << 10) | (1 << 9) | (1 << 8) | (1 << 5) | (1 << 2) | (1 << 0);
    var G15_MASK = (1 << 14) | (1 << 12) | (1 << 10) | (1 << 4) | (1 << 1);

    var _this = {};

    var getBCHDigit = function(data) {
      var digit = 0;
      while (data != 0) {
        digit += 1;
        data >>>= 1;
      }
      return digit;
    };

    _this.getBCHTypeInfo = function(data) {
      var d = data << 10;
      while (getBCHDigit(d) - getBCHDigit(G15) >= 0) {
        d ^= (G15 << (getBCHDigit(d) - getBCHDigit(G15) ) );
      }
      return ( (data << 10) | d) ^ G15_MASK;
    };

    _this.getBCHTypeNumber = function(data) {
      var d = data << 12;
      while (getBCHDigit(d) - getBCHDigit(G18) >= 0) {
        d ^= (G18 << (getBCHDigit(d) - getBCHDigit(G18) ) );
      }
      return (data << 12) | d;
    };

    _this.getPatternPosition = function(typeNumber) {
      return PATTERN_POSITION_TABLE[typeNumber - 1];
    };

    _this.getMaskFunction = function(maskPattern) {

      switch (maskPattern) {

      case QRMaskPattern.PATTERN000 :
        return function(i, j) { return (i + j) % 2 == 0; };
      case QRMaskPattern.PATTERN001 :
        return function(i, j) { return i % 2 == 0; };
      case QRMaskPattern.PATTERN010 :
        return function(i, j) { return j % 3 == 0; };
      case QRMaskPattern.PATTERN011 :
        return function(i, j) { return (i + j) % 3 == 0; };
      case QRMaskPattern.PATTERN100 :
        return function(i, j) { return (Math.floor(i / 2) + Math.floor(j / 3) ) % 2 == 0; };
      case QRMaskPattern.PATTERN101 :
        return function(i, j) { return (i * j) % 2 + (i * j) % 3 == 0; };
      case QRMaskPattern.PATTERN110 :
        return function(i, j) { return ( (i * j) % 2 + (i * j) % 3) % 2 == 0; };
      case QRMaskPattern.PATTERN111 :
        return function(i, j) { return ( (i * j) % 3 + (i + j) % 2) % 2 == 0; };

      default :
        throw 'bad maskPattern:' + maskPattern;
      }
    };

    _this.getErrorCorrectPolynomial = function(errorCorrectLength) {
      var a = qrPolynomial([1], 0);
      for (var i = 0; i < errorCorrectLength; i += 1) {
        a = a.multiply(qrPolynomial([1, QRMath.gexp(i)], 0) );
      }
      return a;
    };

    _this.getLengthInBits = function(mode, type) {

      if (1 <= type && type < 10) {

        // 1 - 9

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 10;
        case QRMode.MODE_ALPHA_NUM : return 9;
        case QRMode.MODE_8BIT_BYTE : return 8;
        case QRMode.MODE_KANJI     : return 8;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 27) {

        // 10 - 26

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 12;
        case QRMode.MODE_ALPHA_NUM : return 11;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 10;
        default :
          throw 'mode:' + mode;
        }

      } else if (type < 41) {

        // 27 - 40

        switch(mode) {
        case QRMode.MODE_NUMBER    : return 14;
        case QRMode.MODE_ALPHA_NUM : return 13;
        case QRMode.MODE_8BIT_BYTE : return 16;
        case QRMode.MODE_KANJI     : return 12;
        default :
          throw 'mode:' + mode;
        }

      } else {
        throw 'type:' + type;
      }
    };

    _this.getLostPoint = function(qrcode) {

      var moduleCount = qrcode.getModuleCount();

      var lostPoint = 0;

      // LEVEL1

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount; col += 1) {

          var sameCount = 0;
          var dark = qrcode.isDark(row, col);

          for (var r = -1; r <= 1; r += 1) {

            if (row + r < 0 || moduleCount <= row + r) {
              continue;
            }

            for (var c = -1; c <= 1; c += 1) {

              if (col + c < 0 || moduleCount <= col + c) {
                continue;
              }

              if (r == 0 && c == 0) {
                continue;
              }

              if (dark == qrcode.isDark(row + r, col + c) ) {
                sameCount += 1;
              }
            }
          }

          if (sameCount > 5) {
            lostPoint += (3 + sameCount - 5);
          }
        }
      };

      // LEVEL2

      for (var row = 0; row < moduleCount - 1; row += 1) {
        for (var col = 0; col < moduleCount - 1; col += 1) {
          var count = 0;
          if (qrcode.isDark(row, col) ) count += 1;
          if (qrcode.isDark(row + 1, col) ) count += 1;
          if (qrcode.isDark(row, col + 1) ) count += 1;
          if (qrcode.isDark(row + 1, col + 1) ) count += 1;
          if (count == 0 || count == 4) {
            lostPoint += 3;
          }
        }
      }

      // LEVEL3

      for (var row = 0; row < moduleCount; row += 1) {
        for (var col = 0; col < moduleCount - 6; col += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row, col + 1)
              &&  qrcode.isDark(row, col + 2)
              &&  qrcode.isDark(row, col + 3)
              &&  qrcode.isDark(row, col + 4)
              && !qrcode.isDark(row, col + 5)
              &&  qrcode.isDark(row, col + 6) ) {
            lostPoint += 40;
          }
        }
      }

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount - 6; row += 1) {
          if (qrcode.isDark(row, col)
              && !qrcode.isDark(row + 1, col)
              &&  qrcode.isDark(row + 2, col)
              &&  qrcode.isDark(row + 3, col)
              &&  qrcode.isDark(row + 4, col)
              && !qrcode.isDark(row + 5, col)
              &&  qrcode.isDark(row + 6, col) ) {
            lostPoint += 40;
          }
        }
      }

      // LEVEL4

      var darkCount = 0;

      for (var col = 0; col < moduleCount; col += 1) {
        for (var row = 0; row < moduleCount; row += 1) {
          if (qrcode.isDark(row, col) ) {
            darkCount += 1;
          }
        }
      }

      var ratio = Math.abs(100 * darkCount / moduleCount / moduleCount - 50) / 5;
      lostPoint += ratio * 10;

      return lostPoint;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // QRMath
  //---------------------------------------------------------------------

  var QRMath = function() {

    var EXP_TABLE = new Array(256);
    var LOG_TABLE = new Array(256);

    // initialize tables
    for (var i = 0; i < 8; i += 1) {
      EXP_TABLE[i] = 1 << i;
    }
    for (var i = 8; i < 256; i += 1) {
      EXP_TABLE[i] = EXP_TABLE[i - 4]
        ^ EXP_TABLE[i - 5]
        ^ EXP_TABLE[i - 6]
        ^ EXP_TABLE[i - 8];
    }
    for (var i = 0; i < 255; i += 1) {
      LOG_TABLE[EXP_TABLE[i] ] = i;
    }

    var _this = {};

    _this.glog = function(n) {

      if (n < 1) {
        throw 'glog(' + n + ')';
      }

      return LOG_TABLE[n];
    };

    _this.gexp = function(n) {

      while (n < 0) {
        n += 255;
      }

      while (n >= 256) {
        n -= 255;
      }

      return EXP_TABLE[n];
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrPolynomial
  //---------------------------------------------------------------------

  function qrPolynomial(num, shift) {

    if (typeof num.length == 'undefined') {
      throw num.length + '/' + shift;
    }

    var _num = function() {
      var offset = 0;
      while (offset < num.length && num[offset] == 0) {
        offset += 1;
      }
      var _num = new Array(num.length - offset + shift);
      for (var i = 0; i < num.length - offset; i += 1) {
        _num[i] = num[i + offset];
      }
      return _num;
    }();

    var _this = {};

    _this.getAt = function(index) {
      return _num[index];
    };

    _this.getLength = function() {
      return _num.length;
    };

    _this.multiply = function(e) {

      var num = new Array(_this.getLength() + e.getLength() - 1);

      for (var i = 0; i < _this.getLength(); i += 1) {
        for (var j = 0; j < e.getLength(); j += 1) {
          num[i + j] ^= QRMath.gexp(QRMath.glog(_this.getAt(i) ) + QRMath.glog(e.getAt(j) ) );
        }
      }

      return qrPolynomial(num, 0);
    };

    _this.mod = function(e) {

      if (_this.getLength() - e.getLength() < 0) {
        return _this;
      }

      var ratio = QRMath.glog(_this.getAt(0) ) - QRMath.glog(e.getAt(0) );

      var num = new Array(_this.getLength() );
      for (var i = 0; i < _this.getLength(); i += 1) {
        num[i] = _this.getAt(i);
      }

      for (var i = 0; i < e.getLength(); i += 1) {
        num[i] ^= QRMath.gexp(QRMath.glog(e.getAt(i) ) + ratio);
      }

      // recursive call
      return qrPolynomial(num, 0).mod(e);
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // QRRSBlock
  //---------------------------------------------------------------------

  var QRRSBlock = function() {

    var RS_BLOCK_TABLE = [

      // L
      // M
      // Q
      // H

      // 1
      [1, 26, 19],
      [1, 26, 16],
      [1, 26, 13],
      [1, 26, 9],

      // 2
      [1, 44, 34],
      [1, 44, 28],
      [1, 44, 22],
      [1, 44, 16],

      // 3
      [1, 70, 55],
      [1, 70, 44],
      [2, 35, 17],
      [2, 35, 13],

      // 4
      [1, 100, 80],
      [2, 50, 32],
      [2, 50, 24],
      [4, 25, 9],

      // 5
      [1, 134, 108],
      [2, 67, 43],
      [2, 33, 15, 2, 34, 16],
      [2, 33, 11, 2, 34, 12],

      // 6
      [2, 86, 68],
      [4, 43, 27],
      [4, 43, 19],
      [4, 43, 15],

      // 7
      [2, 98, 78],
      [4, 49, 31],
      [2, 32, 14, 4, 33, 15],
      [4, 39, 13, 1, 40, 14],

      // 8
      [2, 121, 97],
      [2, 60, 38, 2, 61, 39],
      [4, 40, 18, 2, 41, 19],
      [4, 40, 14, 2, 41, 15],

      // 9
      [2, 146, 116],
      [3, 58, 36, 2, 59, 37],
      [4, 36, 16, 4, 37, 17],
      [4, 36, 12, 4, 37, 13],

      // 10
      [2, 86, 68, 2, 87, 69],
      [4, 69, 43, 1, 70, 44],
      [6, 43, 19, 2, 44, 20],
      [6, 43, 15, 2, 44, 16],

      // 11
      [4, 101, 81],
      [1, 80, 50, 4, 81, 51],
      [4, 50, 22, 4, 51, 23],
      [3, 36, 12, 8, 37, 13],

      // 12
      [2, 116, 92, 2, 117, 93],
      [6, 58, 36, 2, 59, 37],
      [4, 46, 20, 6, 47, 21],
      [7, 42, 14, 4, 43, 15],

      // 13
      [4, 133, 107],
      [8, 59, 37, 1, 60, 38],
      [8, 44, 20, 4, 45, 21],
      [12, 33, 11, 4, 34, 12],

      // 14
      [3, 145, 115, 1, 146, 116],
      [4, 64, 40, 5, 65, 41],
      [11, 36, 16, 5, 37, 17],
      [11, 36, 12, 5, 37, 13],

      // 15
      [5, 109, 87, 1, 110, 88],
      [5, 65, 41, 5, 66, 42],
      [5, 54, 24, 7, 55, 25],
      [11, 36, 12, 7, 37, 13],

      // 16
      [5, 122, 98, 1, 123, 99],
      [7, 73, 45, 3, 74, 46],
      [15, 43, 19, 2, 44, 20],
      [3, 45, 15, 13, 46, 16],

      // 17
      [1, 135, 107, 5, 136, 108],
      [10, 74, 46, 1, 75, 47],
      [1, 50, 22, 15, 51, 23],
      [2, 42, 14, 17, 43, 15],

      // 18
      [5, 150, 120, 1, 151, 121],
      [9, 69, 43, 4, 70, 44],
      [17, 50, 22, 1, 51, 23],
      [2, 42, 14, 19, 43, 15],

      // 19
      [3, 141, 113, 4, 142, 114],
      [3, 70, 44, 11, 71, 45],
      [17, 47, 21, 4, 48, 22],
      [9, 39, 13, 16, 40, 14],

      // 20
      [3, 135, 107, 5, 136, 108],
      [3, 67, 41, 13, 68, 42],
      [15, 54, 24, 5, 55, 25],
      [15, 43, 15, 10, 44, 16],

      // 21
      [4, 144, 116, 4, 145, 117],
      [17, 68, 42],
      [17, 50, 22, 6, 51, 23],
      [19, 46, 16, 6, 47, 17],

      // 22
      [2, 139, 111, 7, 140, 112],
      [17, 74, 46],
      [7, 54, 24, 16, 55, 25],
      [34, 37, 13],

      // 23
      [4, 151, 121, 5, 152, 122],
      [4, 75, 47, 14, 76, 48],
      [11, 54, 24, 14, 55, 25],
      [16, 45, 15, 14, 46, 16],

      // 24
      [6, 147, 117, 4, 148, 118],
      [6, 73, 45, 14, 74, 46],
      [11, 54, 24, 16, 55, 25],
      [30, 46, 16, 2, 47, 17],

      // 25
      [8, 132, 106, 4, 133, 107],
      [8, 75, 47, 13, 76, 48],
      [7, 54, 24, 22, 55, 25],
      [22, 45, 15, 13, 46, 16],

      // 26
      [10, 142, 114, 2, 143, 115],
      [19, 74, 46, 4, 75, 47],
      [28, 50, 22, 6, 51, 23],
      [33, 46, 16, 4, 47, 17],

      // 27
      [8, 152, 122, 4, 153, 123],
      [22, 73, 45, 3, 74, 46],
      [8, 53, 23, 26, 54, 24],
      [12, 45, 15, 28, 46, 16],

      // 28
      [3, 147, 117, 10, 148, 118],
      [3, 73, 45, 23, 74, 46],
      [4, 54, 24, 31, 55, 25],
      [11, 45, 15, 31, 46, 16],

      // 29
      [7, 146, 116, 7, 147, 117],
      [21, 73, 45, 7, 74, 46],
      [1, 53, 23, 37, 54, 24],
      [19, 45, 15, 26, 46, 16],

      // 30
      [5, 145, 115, 10, 146, 116],
      [19, 75, 47, 10, 76, 48],
      [15, 54, 24, 25, 55, 25],
      [23, 45, 15, 25, 46, 16],

      // 31
      [13, 145, 115, 3, 146, 116],
      [2, 74, 46, 29, 75, 47],
      [42, 54, 24, 1, 55, 25],
      [23, 45, 15, 28, 46, 16],

      // 32
      [17, 145, 115],
      [10, 74, 46, 23, 75, 47],
      [10, 54, 24, 35, 55, 25],
      [19, 45, 15, 35, 46, 16],

      // 33
      [17, 145, 115, 1, 146, 116],
      [14, 74, 46, 21, 75, 47],
      [29, 54, 24, 19, 55, 25],
      [11, 45, 15, 46, 46, 16],

      // 34
      [13, 145, 115, 6, 146, 116],
      [14, 74, 46, 23, 75, 47],
      [44, 54, 24, 7, 55, 25],
      [59, 46, 16, 1, 47, 17],

      // 35
      [12, 151, 121, 7, 152, 122],
      [12, 75, 47, 26, 76, 48],
      [39, 54, 24, 14, 55, 25],
      [22, 45, 15, 41, 46, 16],

      // 36
      [6, 151, 121, 14, 152, 122],
      [6, 75, 47, 34, 76, 48],
      [46, 54, 24, 10, 55, 25],
      [2, 45, 15, 64, 46, 16],

      // 37
      [17, 152, 122, 4, 153, 123],
      [29, 74, 46, 14, 75, 47],
      [49, 54, 24, 10, 55, 25],
      [24, 45, 15, 46, 46, 16],

      // 38
      [4, 152, 122, 18, 153, 123],
      [13, 74, 46, 32, 75, 47],
      [48, 54, 24, 14, 55, 25],
      [42, 45, 15, 32, 46, 16],

      // 39
      [20, 147, 117, 4, 148, 118],
      [40, 75, 47, 7, 76, 48],
      [43, 54, 24, 22, 55, 25],
      [10, 45, 15, 67, 46, 16],

      // 40
      [19, 148, 118, 6, 149, 119],
      [18, 75, 47, 31, 76, 48],
      [34, 54, 24, 34, 55, 25],
      [20, 45, 15, 61, 46, 16]
    ];

    var qrRSBlock = function(totalCount, dataCount) {
      var _this = {};
      _this.totalCount = totalCount;
      _this.dataCount = dataCount;
      return _this;
    };

    var _this = {};

    var getRsBlockTable = function(typeNumber, errorCorrectionLevel) {

      switch(errorCorrectionLevel) {
      case QRErrorCorrectionLevel.L :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 0];
      case QRErrorCorrectionLevel.M :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 1];
      case QRErrorCorrectionLevel.Q :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 2];
      case QRErrorCorrectionLevel.H :
        return RS_BLOCK_TABLE[(typeNumber - 1) * 4 + 3];
      default :
        return undefined;
      }
    };

    _this.getRSBlocks = function(typeNumber, errorCorrectionLevel) {

      var rsBlock = getRsBlockTable(typeNumber, errorCorrectionLevel);

      if (typeof rsBlock == 'undefined') {
        throw 'bad rs block @ typeNumber:' + typeNumber +
            '/errorCorrectionLevel:' + errorCorrectionLevel;
      }

      var length = rsBlock.length / 3;

      var list = [];

      for (var i = 0; i < length; i += 1) {

        var count = rsBlock[i * 3 + 0];
        var totalCount = rsBlock[i * 3 + 1];
        var dataCount = rsBlock[i * 3 + 2];

        for (var j = 0; j < count; j += 1) {
          list.push(qrRSBlock(totalCount, dataCount) );
        }
      }

      return list;
    };

    return _this;
  }();

  //---------------------------------------------------------------------
  // qrBitBuffer
  //---------------------------------------------------------------------

  var qrBitBuffer = function() {

    var _buffer = [];
    var _length = 0;

    var _this = {};

    _this.getBuffer = function() {
      return _buffer;
    };

    _this.getAt = function(index) {
      var bufIndex = Math.floor(index / 8);
      return ( (_buffer[bufIndex] >>> (7 - index % 8) ) & 1) == 1;
    };

    _this.put = function(num, length) {
      for (var i = 0; i < length; i += 1) {
        _this.putBit( ( (num >>> (length - i - 1) ) & 1) == 1);
      }
    };

    _this.getLengthInBits = function() {
      return _length;
    };

    _this.putBit = function(bit) {

      var bufIndex = Math.floor(_length / 8);
      if (_buffer.length <= bufIndex) {
        _buffer.push(0);
      }

      if (bit) {
        _buffer[bufIndex] |= (0x80 >>> (_length % 8) );
      }

      _length += 1;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrNumber
  //---------------------------------------------------------------------

  var qrNumber = function(data) {

    var _mode = QRMode.MODE_NUMBER;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var data = _data;

      var i = 0;

      while (i + 2 < data.length) {
        buffer.put(strToNum(data.substring(i, i + 3) ), 10);
        i += 3;
      }

      if (i < data.length) {
        if (data.length - i == 1) {
          buffer.put(strToNum(data.substring(i, i + 1) ), 4);
        } else if (data.length - i == 2) {
          buffer.put(strToNum(data.substring(i, i + 2) ), 7);
        }
      }
    };

    var strToNum = function(s) {
      var num = 0;
      for (var i = 0; i < s.length; i += 1) {
        num = num * 10 + chatToNum(s.charAt(i) );
      }
      return num;
    };

    var chatToNum = function(c) {
      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      }
      throw 'illegal char :' + c;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrAlphaNum
  //---------------------------------------------------------------------

  var qrAlphaNum = function(data) {

    var _mode = QRMode.MODE_ALPHA_NUM;
    var _data = data;

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _data.length;
    };

    _this.write = function(buffer) {

      var s = _data;

      var i = 0;

      while (i + 1 < s.length) {
        buffer.put(
          getCode(s.charAt(i) ) * 45 +
          getCode(s.charAt(i + 1) ), 11);
        i += 2;
      }

      if (i < s.length) {
        buffer.put(getCode(s.charAt(i) ), 6);
      }
    };

    var getCode = function(c) {

      if ('0' <= c && c <= '9') {
        return c.charCodeAt(0) - '0'.charCodeAt(0);
      } else if ('A' <= c && c <= 'Z') {
        return c.charCodeAt(0) - 'A'.charCodeAt(0) + 10;
      } else {
        switch (c) {
        case ' ' : return 36;
        case '$' : return 37;
        case '%' : return 38;
        case '*' : return 39;
        case '+' : return 40;
        case '-' : return 41;
        case '.' : return 42;
        case '/' : return 43;
        case ':' : return 44;
        default :
          throw 'illegal char :' + c;
        }
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qr8BitByte
  //---------------------------------------------------------------------

  var qr8BitByte = function(data) {

    var _mode = QRMode.MODE_8BIT_BYTE;
    var _data = data;
    var _bytes = qrcode.stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return _bytes.length;
    };

    _this.write = function(buffer) {
      for (var i = 0; i < _bytes.length; i += 1) {
        buffer.put(_bytes[i], 8);
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // qrKanji
  //---------------------------------------------------------------------

  var qrKanji = function(data) {

    var _mode = QRMode.MODE_KANJI;
    var _data = data;

    var stringToBytes = qrcode.stringToBytesFuncs['SJIS'];
    if (!stringToBytes) {
      throw 'sjis not supported.';
    }
    !function(c, code) {
      // self test for sjis support.
      var test = stringToBytes(c);
      if (test.length != 2 || ( (test[0] << 8) | test[1]) != code) {
        throw 'sjis not supported.';
      }
    }('\u53cb', 0x9746);

    var _bytes = stringToBytes(data);

    var _this = {};

    _this.getMode = function() {
      return _mode;
    };

    _this.getLength = function(buffer) {
      return ~~(_bytes.length / 2);
    };

    _this.write = function(buffer) {

      var data = _bytes;

      var i = 0;

      while (i + 1 < data.length) {

        var c = ( (0xff & data[i]) << 8) | (0xff & data[i + 1]);

        if (0x8140 <= c && c <= 0x9FFC) {
          c -= 0x8140;
        } else if (0xE040 <= c && c <= 0xEBBF) {
          c -= 0xC140;
        } else {
          throw 'illegal char at ' + (i + 1) + '/' + c;
        }

        c = ( (c >>> 8) & 0xff) * 0xC0 + (c & 0xff);

        buffer.put(c, 13);

        i += 2;
      }

      if (i < data.length) {
        throw 'illegal char at ' + (i + 1);
      }
    };

    return _this;
  };

  //=====================================================================
  // GIF Support etc.
  //

  //---------------------------------------------------------------------
  // byteArrayOutputStream
  //---------------------------------------------------------------------

  var byteArrayOutputStream = function() {

    var _bytes = [];

    var _this = {};

    _this.writeByte = function(b) {
      _bytes.push(b & 0xff);
    };

    _this.writeShort = function(i) {
      _this.writeByte(i);
      _this.writeByte(i >>> 8);
    };

    _this.writeBytes = function(b, off, len) {
      off = off || 0;
      len = len || b.length;
      for (var i = 0; i < len; i += 1) {
        _this.writeByte(b[i + off]);
      }
    };

    _this.writeString = function(s) {
      for (var i = 0; i < s.length; i += 1) {
        _this.writeByte(s.charCodeAt(i) );
      }
    };

    _this.toByteArray = function() {
      return _bytes;
    };

    _this.toString = function() {
      var s = '';
      s += '[';
      for (var i = 0; i < _bytes.length; i += 1) {
        if (i > 0) {
          s += ',';
        }
        s += _bytes[i];
      }
      s += ']';
      return s;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64EncodeOutputStream
  //---------------------------------------------------------------------

  var base64EncodeOutputStream = function() {

    var _buffer = 0;
    var _buflen = 0;
    var _length = 0;
    var _base64 = '';

    var _this = {};

    var writeEncoded = function(b) {
      _base64 += String.fromCharCode(encode(b & 0x3f) );
    };

    var encode = function(n) {
      if (n < 0) {
        // error.
      } else if (n < 26) {
        return 0x41 + n;
      } else if (n < 52) {
        return 0x61 + (n - 26);
      } else if (n < 62) {
        return 0x30 + (n - 52);
      } else if (n == 62) {
        return 0x2b;
      } else if (n == 63) {
        return 0x2f;
      }
      throw 'n:' + n;
    };

    _this.writeByte = function(n) {

      _buffer = (_buffer << 8) | (n & 0xff);
      _buflen += 8;
      _length += 1;

      while (_buflen >= 6) {
        writeEncoded(_buffer >>> (_buflen - 6) );
        _buflen -= 6;
      }
    };

    _this.flush = function() {

      if (_buflen > 0) {
        writeEncoded(_buffer << (6 - _buflen) );
        _buffer = 0;
        _buflen = 0;
      }

      if (_length % 3 != 0) {
        // padding
        var padlen = 3 - _length % 3;
        for (var i = 0; i < padlen; i += 1) {
          _base64 += '=';
        }
      }
    };

    _this.toString = function() {
      return _base64;
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // base64DecodeInputStream
  //---------------------------------------------------------------------

  var base64DecodeInputStream = function(str) {

    var _str = str;
    var _pos = 0;
    var _buffer = 0;
    var _buflen = 0;

    var _this = {};

    _this.read = function() {

      while (_buflen < 8) {

        if (_pos >= _str.length) {
          if (_buflen == 0) {
            return -1;
          }
          throw 'unexpected end of file./' + _buflen;
        }

        var c = _str.charAt(_pos);
        _pos += 1;

        if (c == '=') {
          _buflen = 0;
          return -1;
        } else if (c.match(/^\s$/) ) {
          // ignore if whitespace.
          continue;
        }

        _buffer = (_buffer << 6) | decode(c.charCodeAt(0) );
        _buflen += 6;
      }

      var n = (_buffer >>> (_buflen - 8) ) & 0xff;
      _buflen -= 8;
      return n;
    };

    var decode = function(c) {
      if (0x41 <= c && c <= 0x5a) {
        return c - 0x41;
      } else if (0x61 <= c && c <= 0x7a) {
        return c - 0x61 + 26;
      } else if (0x30 <= c && c <= 0x39) {
        return c - 0x30 + 52;
      } else if (c == 0x2b) {
        return 62;
      } else if (c == 0x2f) {
        return 63;
      } else {
        throw 'c:' + c;
      }
    };

    return _this;
  };

  //---------------------------------------------------------------------
  // gifImage (B/W)
  //---------------------------------------------------------------------

  var gifImage = function(width, height) {

    var _width = width;
    var _height = height;
    var _data = new Array(width * height);

    var _this = {};

    _this.setPixel = function(x, y, pixel) {
      _data[y * _width + x] = pixel;
    };

    _this.write = function(out) {

      //---------------------------------
      // GIF Signature

      out.writeString('GIF87a');

      //---------------------------------
      // Screen Descriptor

      out.writeShort(_width);
      out.writeShort(_height);

      out.writeByte(0x80); // 2bit
      out.writeByte(0);
      out.writeByte(0);

      //---------------------------------
      // Global Color Map

      // black
      out.writeByte(0x00);
      out.writeByte(0x00);
      out.writeByte(0x00);

      // white
      out.writeByte(0xff);
      out.writeByte(0xff);
      out.writeByte(0xff);

      //---------------------------------
      // Image Descriptor

      out.writeString(',');
      out.writeShort(0);
      out.writeShort(0);
      out.writeShort(_width);
      out.writeShort(_height);
      out.writeByte(0);

      //---------------------------------
      // Local Color Map

      //---------------------------------
      // Raster Data

      var lzwMinCodeSize = 2;
      var raster = getLZWRaster(lzwMinCodeSize);

      out.writeByte(lzwMinCodeSize);

      var offset = 0;

      while (raster.length - offset > 255) {
        out.writeByte(255);
        out.writeBytes(raster, offset, 255);
        offset += 255;
      }

      out.writeByte(raster.length - offset);
      out.writeBytes(raster, offset, raster.length - offset);
      out.writeByte(0x00);

      //---------------------------------
      // GIF Terminator
      out.writeString(';');
    };

    var bitOutputStream = function(out) {

      var _out = out;
      var _bitLength = 0;
      var _bitBuffer = 0;

      var _this = {};

      _this.write = function(data, length) {

        if ( (data >>> length) != 0) {
          throw 'length over';
        }

        while (_bitLength + length >= 8) {
          _out.writeByte(0xff & ( (data << _bitLength) | _bitBuffer) );
          length -= (8 - _bitLength);
          data >>>= (8 - _bitLength);
          _bitBuffer = 0;
          _bitLength = 0;
        }

        _bitBuffer = (data << _bitLength) | _bitBuffer;
        _bitLength = _bitLength + length;
      };

      _this.flush = function() {
        if (_bitLength > 0) {
          _out.writeByte(_bitBuffer);
        }
      };

      return _this;
    };

    var getLZWRaster = function(lzwMinCodeSize) {

      var clearCode = 1 << lzwMinCodeSize;
      var endCode = (1 << lzwMinCodeSize) + 1;
      var bitLength = lzwMinCodeSize + 1;

      // Setup LZWTable
      var table = lzwTable();

      for (var i = 0; i < clearCode; i += 1) {
        table.add(String.fromCharCode(i) );
      }
      table.add(String.fromCharCode(clearCode) );
      table.add(String.fromCharCode(endCode) );

      var byteOut = byteArrayOutputStream();
      var bitOut = bitOutputStream(byteOut);

      // clear code
      bitOut.write(clearCode, bitLength);

      var dataIndex = 0;

      var s = String.fromCharCode(_data[dataIndex]);
      dataIndex += 1;

      while (dataIndex < _data.length) {

        var c = String.fromCharCode(_data[dataIndex]);
        dataIndex += 1;

        if (table.contains(s + c) ) {

          s = s + c;

        } else {

          bitOut.write(table.indexOf(s), bitLength);

          if (table.size() < 0xfff) {

            if (table.size() == (1 << bitLength) ) {
              bitLength += 1;
            }

            table.add(s + c);
          }

          s = c;
        }
      }

      bitOut.write(table.indexOf(s), bitLength);

      // end code
      bitOut.write(endCode, bitLength);

      bitOut.flush();

      return byteOut.toByteArray();
    };

    var lzwTable = function() {

      var _map = {};
      var _size = 0;

      var _this = {};

      _this.add = function(key) {
        if (_this.contains(key) ) {
          throw 'dup key:' + key;
        }
        _map[key] = _size;
        _size += 1;
      };

      _this.size = function() {
        return _size;
      };

      _this.indexOf = function(key) {
        return _map[key];
      };

      _this.contains = function(key) {
        return typeof _map[key] != 'undefined';
      };

      return _this;
    };

    return _this;
  };

  var createDataURL = function(width, height, getPixel) {
    var gif = gifImage(width, height);
    for (var y = 0; y < height; y += 1) {
      for (var x = 0; x < width; x += 1) {
        gif.setPixel(x, y, getPixel(x, y) );
      }
    }

    var b = byteArrayOutputStream();
    gif.write(b);

    var base64 = base64EncodeOutputStream();
    var bytes = b.toByteArray();
    for (var i = 0; i < bytes.length; i += 1) {
      base64.writeByte(bytes[i]);
    }
    base64.flush();

    return 'data:image/gif;base64,' + base64;
  };

  //---------------------------------------------------------------------
  // returns qrcode function.

  return qrcode;
}();

// multibyte support
!function() {

  qrcode.stringToBytesFuncs['UTF-8'] = function(s) {
    // http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
    function toUTF8Array(str) {
      var utf8 = [];
      for (var i=0; i < str.length; i++) {
        var charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
          utf8.push(0xc0 | (charcode >> 6),
              0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
          utf8.push(0xe0 | (charcode >> 12),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
          i++;
          // UTF-16 encodes 0x10000-0x10FFFF by
          // subtracting 0x10000 and splitting the
          // 20 bits of 0x0-0xFFFFF into two halves
          charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff));
          utf8.push(0xf0 | (charcode >>18),
              0x80 | ((charcode>>12) & 0x3f),
              0x80 | ((charcode>>6) & 0x3f),
              0x80 | (charcode & 0x3f));
        }
      }
      return utf8;
    }
    return toUTF8Array(s);
  };

}();

(function (factory) {
  if (typeof define === 'function' && define.amd) {
      define([], factory);
  } else if (typeof exports === 'object') {
      module.exports = factory();
  }
}(function () {
    return qrcode;
}));
