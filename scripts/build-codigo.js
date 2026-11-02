// Gera apps-script/dist/Codigo.gs (arquivo único para colar no editor do Apps Script).
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, '..', 'apps-script');
const ordem = ['Versao', 'Logo', 'Migracao', 'Config', 'Db', 'Setup', 'Inscricao', 'Atividades', 'Email', 'Scanner', 'Painel', 'AdminApi', 'Api', 'Admin', 'Qrcode'];
const corpo = ordem.map(n => `\n// ===== ${n} =====\n` + fs.readFileSync(path.join(dir, n + '.gs'), 'utf8')).join('');
const saida = '// Semana de Engenharia de Produção — código único (gerado por scripts/build-codigo.js a partir de apps-script/*.gs).\n' +
  '// Cole tudo em Código.gs no editor do Apps Script.\n' + corpo;
new (require('vm').Script)(saida); // falha se houver erro de sintaxe
fs.mkdirSync(path.join(dir, 'dist'), { recursive: true });
fs.writeFileSync(path.join(dir, 'dist', 'Codigo.gs'), saida);
console.log('apps-script/dist/Codigo.gs gerado (' + saida.split('\n').length + ' linhas)');
