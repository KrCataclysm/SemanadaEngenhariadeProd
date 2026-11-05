/* Service worker das páginas do participante: guarda a "casca" (páginas, scripts, estilos, fontes) para o QR Code abrir sem internet.
   Rede primeiro: quem está online sempre recebe a versão mais nova. As chamadas ao sistema (Apps Script) e o token nunca passam por aqui.
   Ao mudar a lista abaixo, aumente a VERSAO. */
const VERSAO = 'inscricao-v1';
const ARQUIVOS = [
  './', 'index.html', 'qr.html', 'qr.js', 'atividades.html', 'atividades.js', 'app.js', 'comum.js', 'config.js', 'privacidade.html',
  'vendor/qrcode.js', 'manifest.webmanifest', '../assets/css/style.css', '../assets/logo-evento.svg', '../assets/logo-caepro.png',
  '../assets/fonts/inter-latin-wght-normal.woff2', '../assets/fonts/sora-latin-wght-normal.woff2',
  '../assets/icons/qr-192.png', '../assets/icons/qr-512.png', '../assets/icons/qr-apple-touch-icon.png', '../assets/icons/favicon-32.png'
];
const PERMITIDOS = new Set(ARQUIVOS.map(u => new URL(u, self.location).pathname));   // só estes caminhos passam pelo service worker
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSAO).then(c => Promise.all(ARQUIVOS.map(u => c.add(new Request(u, { cache: 'reload' }))))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('inscricao-') && k !== VERSAO).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin || !PERMITIDOS.has(url.pathname)) return;
  e.respondWith((async () => {
    const cache = await caches.open(VERSAO);
    try {
      const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), 4000);
      const r = await fetch(req, { cache: 'no-cache', signal: ctl.signal }); clearTimeout(t);
      if (r && r.ok) cache.put(new Request(url.origin + url.pathname), r.clone());   // chave sem "?t=": o token nunca vai para o cache
      return r;
    } catch (_) {
      const g = await cache.match(new Request(url.origin + url.pathname));
      if (g) return g;
      if (req.mode === 'navigate') { const c = await cache.match('qr.html'); if (c) return c; }
      return new Response('Sem conexão.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
    }
  })());
});
