const CACHE_NAME = 'libya-exchange-pos-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/apple-touch-icon.png',
  '/icon.svg'
];

// Install Event: Precaches core app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching static assets for offline POS operation');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Non-blocking cache error on install:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Cleans up older caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache version:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Offline-first with Stale-While-Revalidate for app assets & Network-first for APIs
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignore non-GET requests (e.g. POST /api/*)
  if (request.method !== 'GET') {
    return;
  }

  // Handle Chrome extension schemes or non-HTTP(S)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API Requests: Network-first with cache fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response(
              JSON.stringify({ 
                offline: true, 
                message: 'أنت تعمل حالياً بدون اتصال بالإنترنت (Offline Mode). تم تفعيل الحفظ المحلي في المتصفح.' 
              }),
              { 
                status: 200, 
                headers: { 'Content-Type': 'application/json' } 
              }
            );
          });
        })
    );
    return;
  }

  // Static Assets & Navigation: Stale-While-Revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          // If offline and request is HTML navigation, serve root index.html
          if (request.mode === 'navigate') {
            return caches.match('/') || caches.match('/index.html');
          }
          throw err;
        });

      // Return cached version immediately if available, or wait for network
      return cachedResponse || fetchPromise;
    })
  );
});
