const CACHE = 'azura45-v1';
const ASSETS = [
  './',
  './index.html',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{}))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Firebase requests — toujours online
  if(e.request.url.includes('firebase') || e.request.url.includes('gstatic')) return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if(cached) return cached;
      return fetch(e.request).then(res => {
        if(res && res.status===200 && res.type==='basic'){
          const clone = res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return res;
      }).catch(()=> cached || new Response('Hors ligne', {status:503}));
    })
  );
});
