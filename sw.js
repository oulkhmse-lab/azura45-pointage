const CACHE = 'azura45-v3';

self.addEventListener('message', e => {
  if(e.data && e.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(['./', './index.html']).catch(()=>{}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if(
    e.request.url.includes('firebase') ||
    e.request.url.includes('gstatic') ||
    e.request.url.includes('googleapis') ||
    e.request.url.includes('jsdelivr') ||
    e.request.url.includes('fonts.')
  ) return;

  // index.html — network first دايما
  if(e.request.url.endsWith('/') || e.request.url.includes('index.html')){
    e.respondWith(
      fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }).catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(res => {
        if(res && res.status===200){
          caches.open(CACHE).then(c=>c.put(e.request,res.clone()));
        }
        return res;
      })
    )
  );
});
