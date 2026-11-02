// Prepara a pasta build/gas que o clasp envia ao Apps Script: todos os .gs (sem o arquivo único dist/) + manifesto,
// com a versão do código gravada em Versao.gs (identificador do commit).
const fs = require('fs'), path = require('path');
const origem = path.join(__dirname, '..', 'apps-script'), destino = path.join(__dirname, '..', 'build', 'gas');
const versao = (process.env.GITHUB_SHA || 'local').slice(0, 7);
fs.rmSync(destino, { recursive: true, force: true }); fs.mkdirSync(destino, { recursive: true });
fs.readdirSync(origem).filter(f => f.endsWith('.gs') || f === 'appsscript.json').forEach(f => fs.copyFileSync(path.join(origem, f), path.join(destino, f)));
fs.writeFileSync(path.join(destino, 'Versao.gs'), `/** Gerado na publicação. */\nvar CODIGO_VERSAO = '${versao}';\n`);
fs.readdirSync(destino).filter(f => f.endsWith('.gs')).forEach(f => new (require('vm').Script)(fs.readFileSync(path.join(destino, f), 'utf8'), { filename: f }));
console.log(`build/gas pronto: ${fs.readdirSync(destino).length} arquivos, versão ${versao}`);
