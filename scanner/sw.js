/* Service worker do scanner: guarda a "casca" do aplicativo para abrir mesmo sem internet no local do evento.
   As chamadas ao sistema (Apps Script) nunca passam por aqui: o scanner trata a conexão e a fila por conta própria. */
const VERSAO = 'scanner-v3';
const ARQUIVOS = [
  './', 'index.html', 'scanner.js', 'vendor/jsQR.js', 'manifest.webmanifest', '../inscricao/config.js',
  '../assets/css/style.css', '../assets/logo-evento.svg', '../assets/logo-caepro.png',
  '../assets/fonts/inter-latin-wght-normal.woff2', '../assets/fonts/sora-latin-wght-normal.woff2',
  '../assets/icons/icon-192.png', '../assets/icons/icon-512.png', '../assets/icons/apple-touch-icon.png'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSAO).then(c => Promise.all(ARQUIVOS.map(u => c.add(new Request(u, { cache: 'reload' }))))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('scanner-') && k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
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
