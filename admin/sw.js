/* Service worker do painel de administração.
   Guarda só a "casca" do aplicativo (páginas, scripts, estilos, fontes e ícones) para abrir rápido e sem internet.
   NUNCA guarda dados de inscritos: as chamadas ao sistema (Apps Script) são de outro domínio e não passam por aqui.
   Ao mudar a lista de arquivos abaixo, aumente a VERSAO. */
const VERSAO = 'admin-v3';
const ARQUIVOS = [
  './', 'index.html', 'admin.js', 'manifest.webmanifest', '../inscricao/comum.js', '../inscricao/config.js',
  '../assets/css/style.css', '../assets/logo-evento.svg', '../assets/logo-caepro.png',
  '../assets/fonts/inter-latin-wght-normal.woff2', '../assets/fonts/sora-latin-wght-normal.woff2',
  '../assets/icons/admin-192.png', '../assets/icons/admin-512.png', '../assets/icons/admin-apple-touch-icon.png', '../assets/icons/favicon-32.png'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSAO).then(c => Promise.all(ARQUIVOS.map(u => c.add(new Request(u, { cache: 'reload' }))))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('admin-') && k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Rede primeiro (revalida sempre, 4 s de limite): quem está online sempre recebe a versão mais nova; sem internet, abre o que está guardado.
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSAO);
    try {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 4000);
      const r = await fetch(req, { cache: 'no-cache', signal: ctl.signal }); clearTimeout(t);
      if (r && r.ok) cache.put(req, r.clone());
      return r;
    } catch (_) {
      const g = await cache.match(req, { ignoreSearch: true });
      if (g) return g;
      if (req.mode === 'navigate') { const c = await cache.match('index.html'); if (c) return c; }
      return new Response('Sem conexão.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
