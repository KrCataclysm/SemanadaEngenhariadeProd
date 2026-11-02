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
