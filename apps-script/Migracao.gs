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
      try { preencherNomes_(false); ocultarColunasTecnicas_(); } catch (e) { log_('erro_nomes', 0, String(e)); }
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

function abasComNome_() { return [SHEETS.IA, SHEETS.OUTBOX, SHEETS.PORTARIA, SHEETS.PRES, SHEETS.PERM, SHEETS.CERT]; }   // função (não variável): a ordem de carga dos arquivos não importa

/**
 * Escreve o NOME ao lado do código (inscrito_id) nas abas de movimento, para a equipe identificar a pessoa sem consultar a aba Inscritos.
 * Com todos=false só preenche as células vazias (linhas antigas e linhas gravadas por versões anteriores do código); com todos=true
 * reescreve tudo (depois de editar um nome).
 */
function preencherNomes_(todos) {
  var nomes = {}; readAll_(SHEETS.INSC).forEach(function (r) { nomes[String(r.id)] = String(r.nome); });
  abasComNome_().forEach(function (aba) {
    var sh = sheet_(aba), ultima = sh.getLastRow(); if (ultima < 2) return;
    var h = HEADERS[aba], cId = h.indexOf('inscrito_id') + 1, cNome = h.indexOf('nome') + 1, n = ultima - 1;
    var ids = sh.getRange(2, cId, n, 1).getValues(), atuais = sh.getRange(2, cNome, n, 1).getValues(), novos = [], mudou = false;
    for (var i = 0; i < n; i++) {
      var atual = String(atuais[i][0] === undefined || atuais[i][0] === null ? '' : atuais[i][0]), nm = nomes[String(ids[i][0])];
      var v = (todos || atual === '') && nm !== undefined ? nm : atual;
      if (v !== atual) mudou = true;
      novos.push([v]);
    }
    if (mudou) { sh.getRange(2, cNome, n, 1).setValues(novos); invalidar_(aba); }
  });
}

/** Esconde (uma única vez) as colunas técnicas de Portaria e Presença, para o nome ficar logo depois do status. Os dados continuam lá. */
function ocultarColunasTecnicas_() {
  var props = PropertiesService.getScriptProperties();
  if (props.getProperty('COLUNAS_OCULTAS_V1') === 'SIM') return;
  [SHEETS.PORTARIA, SHEETS.PRES].forEach(function (aba) {
    var sh = sheet_(aba), h = HEADERS[aba];
    ['client_id', 'ts', 'local_ms', 'server_ms'].forEach(function (c) { try { sh.hideColumns(h.indexOf(c) + 1); } catch (e) { /* sem suporte */ } });
  });
  props.setProperty('COLUNAS_OCULTAS_V1', 'SIM');
}
