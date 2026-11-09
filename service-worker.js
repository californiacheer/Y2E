const CACHE_NAME = 'the-app-hub-v45';
const CORE_ASSETS = ['./','./index.html','./manifest.json','./icons/icon-192.png','./icons/icon-512.png','./apps/y2k.html','./apps/shazam.html','./apps/whitegold.html','./apps/sugar.html'];
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => Promise.all(CORE_ASSETS.map((u) => cache.add(new Request(u, {cache:'reload'})).catch(() => {})))));
});
self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first: when online you always get the newest version; the saved copy is only the offline fallback.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(req, { cache: 'no-cache' }).then((res) => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {}); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
