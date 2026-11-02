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
  CERT: 'Certificados'
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

/** Colunas que precisam ficar como texto (evita converter "0123" ou tokens em número). */
var TEXT_COLUMNS = {};
TEXT_COLUMNS[SHEETS.ATIV] = ['id', 'dia', 'inicio', 'fim'];
TEXT_COLUMNS[SHEETS.INSC] = ['id', 'token', 'matricula', 'data_hora'];
TEXT_COLUMNS[SHEETS.IA] = ['id', 'inscrito_id', 'atividade_id', 'data_hora'];
TEXT_COLUMNS[SHEETS.OUTBOX] = ['id', 'inscrito_id', 'atividade_id', 'criado_em', 'enviado_em'];
TEXT_COLUMNS[SHEETS.ALERTAS] = ['data_hora', 'chave'];
TEXT_COLUMNS[SHEETS.LOG] = ['data_hora'];
TEXT_COLUMNS[SHEETS.PORTARIA] = ['inscrito_id', 'dia', 'data_hora', 'client_id'];
TEXT_COLUMNS[SHEETS.PRES] = ['inscrito_id', 'atividade_id', 'data_hora', 'client_id'];
TEXT_COLUMNS[SHEETS.PERM] = ['inscrito_id', 'dia'];
TEXT_COLUMNS[SHEETS.CERT] = ['inscrito_id'];

var DEFAULT_CONFIG = [
  ['INSCRICOES', 'FECHADAS', 'ABERTAS ou FECHADAS: controla a inscrição no evento.'],
  ['PIN', '', 'PIN da equipe para o scanner (defina antes do evento).'],
  ['EMAIL_ALERTAS', '', 'E-mail que recebe os alertas (vazio = e-mail da conta dona da planilha).'],
  ['NOME_EVENTO', 'Semana de Engenharia de Produção', 'Nome oficial (assunto e título dos e-mails).'],
  ['SITE_URL', '', 'Endereço do GitHub Pages, sem barra no final. Ex.: https://usuario.github.io/repositorio'],
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
  erroInterno: 'Ocorreu um erro inesperado ao processar sua solicitação. Aguarde alguns instantes e tente novamente. ' + CONTATO_TXT
};

var PRIORIDADE_EMAIL = { CONFIRMACAO: 0, PROMOCAO: 1, FILA: 2, ATIVIDADE: 3 };
var MAX_TENTATIVAS_EMAIL = 6;
