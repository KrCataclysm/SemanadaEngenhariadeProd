/* Service worker do painel de administração.
   Guarda só a "casca" do aplicativo (páginas, scripts, estilos, fontes e ícones) para abrir rápido e sem internet.
   NUNCA guarda dados de inscritos: as chamadas ao sistema (Apps Script) são de outro domínio e não passam por aqui.
   Ao mudar a lista de arquivos abaixo, aumente a VERSAO. */
const VERSAO = 'admin-v1';
const ARQUIVOS = [
  './', 'index.html', 'admin.js', 'manifest.webmanifest', '../inscricao/comum.js', '../inscricao/config.js',
  '../assets/css/style.css', '../assets/logo-evento.svg', '../assets/logo-caepro.png',
  '../assets/fonts/inter-latin-wght-normal.woff2', '../assets/fonts/sora-latin-wght-normal.woff2',
  '../assets/icons/admin-192.png', '../assets/icons/admin-512.png', '../assets/icons/admin-apple-touch-icon.png', '../assets/icons/favicon-32.png'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS))); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('admin-') && k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'ATUALIZAR') self.skipWaiting(); });
// Stale-while-revalidate: abre na hora com o que está guardado e atualiza em segundo plano.
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(caches.open(VERSAO).then(async cache => {
    const guardado = await cache.match(req, { ignoreSearch: true });
    const rede = fetch(req).then(r => { if (r && r.ok) cache.put(req, r.clone()); return r; }).catch(() => null);
    if (guardado) return guardado;
    const r = await rede;
    if (r) return r;
    if (req.mode === 'navigate') { const casca = await cache.match('index.html'); if (casca) return casca; }
    return new Response('Sem conexão.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }));
});
