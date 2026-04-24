var CACHE_NAME = 'azura45-v3';
var STATIC = ['/'];

self.addEventListener('install', function(e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(STATIC).catch(function(){});
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE_NAME; })
            .map(function(k){ return caches.delete(k); })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  /* لا تعترض أبداً: Firebase, googleapis, POST requests */
  if (
    e.request.method !== 'GET' ||
    url.includes('firebaseio.com') ||
    url.includes('googleapis.com') ||
    url.includes('firebase') ||
    url.includes('gstatic.com') ||
    url.includes('cdnjs') ||
    url.includes('jsdelivr') ||
    url.includes('unpkg')
  ) {
    return; /* اتركو يمشي مباشرة للشبكة */
  }

  /* غير هاد: cache first للملفات الستاتيكية فقط */
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      return cached || fetch(e.request).catch(function(){
        return cached;
      });
    })
  );
});
