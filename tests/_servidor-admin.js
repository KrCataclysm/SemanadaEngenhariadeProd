// Servidor local + backend simulado, compartilhado pelos testes do painel (PWA e dispositivos).
const http = require('http'), fs = require('fs'), path = require('path');
const { makeEnv } = require('./mocks');
const root = path.join(__dirname, '..');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
module.exports = function iniciar(PORT) {
  const B = 'http://localhost:' + PORT, env = makeEnv(); env.ctx.setup_();
  const set = (k, v) => { const r = env.ctx.readAll_('Config').find(x => x.chave === k); env.ctx.updateRow_('Config', r._row, { valor: v }); env.ctx.resetConfigCache_(); };
  set('INSCRICOES', 'ABERTAS'); set('PIN', '4321'); set('PIN_ADMIN', 'senhaForte123');
  const reg = n => env.ctx.register_({ nome: 'Pessoa Teste ' + n, curso: 'Engenharia de Produção', periodo: '5º', matricula: '2024000' + n, email: 'p' + n + '@exemplo.com' });
  const pessoas = [1, 2, 3].map(reg);
  const a = env.ctx.getAtividade_('A16'); env.ctx.updateRow_('Atividades', a._row, { vagas_max: 2, inscricoes_abertas: 'SIM' });
  pessoas.forEach(p => env.ctx.enroll_({ token: p.token, atividadeId: 'A16' }));
  const estado = { swAdmin: null };   // permite simular o lançamento de uma nova versão do service worker
  const srv = http.createServer((req, res) => {
    const u = new URL(req.url, B);
    if (u.pathname === '/admin/sw.js' && estado.swAdmin) { res.writeHead(200, { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' }); return res.end(fs.readFileSync(path.join(root, 'admin/sw.js'), 'utf8').replace(/admin-v3/g, estado.swAdmin)); }
    if (u.pathname === '/api') { let b = ''; req.on('data', d => b += d); req.on('end', () => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(env.ctx.handleSeguro_(req.method === 'POST' ? JSON.parse(b) : Object.fromEntries(u.searchParams)))); }); return; }
    if (u.pathname === '/inscricao/config.js') { res.writeHead(200, { 'Content-Type': 'text/javascript' }); return res.end(`window.APP_CONFIG={API_URL:"${B}/api"}`); }
    const f = path.join(root, u.pathname.endsWith('/') ? u.pathname + 'index.html' : u.pathname);
    if (!f.startsWith(root) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); return res.end(); }
    res.writeHead(200, { 'Content-Type': mime[path.extname(f)] || 'application/octet-stream' }); res.end(fs.readFileSync(f));
  });
  return { B, env, srv, estado, listen: () => new Promise(r => srv.listen(PORT, r)), root };
};
