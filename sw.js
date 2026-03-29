const CACHE = 'azura45-v1';
const ASSETS = [
  './',
  './index.html',
  './logo.png',
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.0/firebase-database-compat.js'
];

// Install — cache all assets
self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(cache){
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Fetch — cache first, then network
self.addEventListener('fetch', function(e){
  // Skip Firebase real-time requests (always need network)
  if(e.request.url.includes('firebasedatabase.app') ||
     e.request.url.includes('firebaseio.com')){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached){
      if(cached) return cached;
      return fetch(e.request).then(function(response){
        // Cache new successful responses
        if(response && response.status === 200 && response.type !== 'opaque'){
          var clone = response.clone();
          caches.open(CACHE).then(function(cache){
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function(){
        // Offline fallback
        if(e.request.destination === 'document'){
          return caches.match('./index.html');
        }
      });
    })
  );
});
