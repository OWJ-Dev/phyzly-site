/* Phyzly Portfolio offline support (v508). Release 16c0c58a95.
   Pages: network first, so a new release always shows when online; the last copy opens when offline.
   The app's code (named by its contents), fonts, libraries and icons: from the cache, fetched once.
   Only this site's own files are touched. Account data never goes through here: it lives on the device and in the
   database, which is another address. */
const V = 'pz-16c0c58a95';
const CORE = ['./', 'main.16c0c58a95.js', 'manifest.webmanifest', 'favicon.svg', 'icon-192.png', 'apple-touch-icon.png',
  '/vendor/supabase-js-2.118.0.js', '/vendor/fonts/inter-latin-wght-normal.woff2'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(V).then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('pz-') && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const HOME = new URL('./', self.registration.scope).href;
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  if (r.mode === 'navigate') {
    const home = u.pathname === new URL(HOME).pathname || u.pathname === new URL(HOME).pathname + 'index.html';
    e.respondWith(fetch(r).then(res => {
      if (home && res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(HOME, cp)); }
      return res;
    }).catch(() => caches.match(home ? HOME : r, { ignoreSearch: true }).then(m => m || caches.match(HOME))));
    return;
  }
  const stat = /\/main\.[0-9a-f]{10}\.js$/.test(u.pathname) || u.pathname.startsWith('/vendor/') || /\.(png|svg|woff2|webmanifest)$/.test(u.pathname);
  if (stat) {
    e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => {
      if (res.ok) { const cp = res.clone(); caches.open(V).then(c => c.put(r, cp)); }
      return res;
    })));
  }
});
