const CACHE_NAME = 'gudul-ticaret-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.json'
];

// Install Event: Pre-cache core shells
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline resources');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clear outdated cache stores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Cleaning deprecated cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate caching pattern
self.addEventListener('fetch', (event) => {
  // Process only local HTTP GET requests
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return local cache immediately, while refreshing from network in the background
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          console.log('[Service Worker] Offline / Fetch error:', err);
        });

      return cachedResponse || fetchPromise;
    })
  );
});
