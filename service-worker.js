self.addEventListener('install', e => {
  e.waitUntil(
      caches.open('v1').then(cache =>
          cache.addAll([
              './',
              './index.html',
              './style.css',
              './app.js',
              './captura-db.js',
              './manifest.json',
              './icons/icon-192x192.png',
              './icons/icon-512x512.png'
          ])
      )
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
      caches.match(e.request).then(response => response || fetch(e.request))
  );
});