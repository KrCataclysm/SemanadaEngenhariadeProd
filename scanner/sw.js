/* Service worker do scanner: guarda a "casca" do aplicativo para abrir mesmo sem internet no local do evento.
   As chamadas ao sistema (Apps Script) nunca passam por aqui: o scanner trata a conexão e a fila por conta própria. */
const VERSAO = 'scanner-v2';
const ARQUIVOS = [
  './', 'index.html', 'scanner.js', 'vendor/jsQR.js', 'manifest.webmanifest', '../inscricao/config.js',
  '../assets/css/style.css', '../assets/logo-evento.svg', '../assets/logo-caepro.png',
  '../assets/fonts/inter-latin-wght-normal.woff2', '../assets/fonts/sora-latin-wght-normal.woff2',
  '../assets/icons/icon-192.png', '../assets/icons/icon-512.png', '../assets/icons/apple-touch-icon.png'
];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('scanner-') && k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Stale-while-revalidate: abre na hora com o que está guardado e atualiza em segundo plano.
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  e.respondWith(caches.open(VERSAO).then(async cache => {
    const guardado = await cache.match(req, { ignoreSearch: true });
    const rede = fetch(req).then(r => { if (r && r.ok) cache.put(req, r.clone()); return r; }).catch(() => null);
    return guardado || (await rede) || new Response('Sem conexão.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }));
});
