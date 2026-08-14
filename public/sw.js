const CACHE_NAME = 'vadhu-var-v2.1.0';
const STATIC_ASSETS_CACHE = 'vadhu-var-assets-v2.1.0';

const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg'
];

// 1. INSTALL EVENT
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// 2. ACTIVATE EVENT: Delete obsolete caches & claim clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME && cache !== STATIC_ASSETS_CACHE) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. LISTEN FOR SKIP_WAITING MESSAGE
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// 4. FETCH EVENT: Split Caching Strategies
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Exclude Vite Dev Server HMR & Module requests completely from SW caching
  if (
    url.pathname.startsWith('/src/') ||
    url.pathname.startsWith('/node_modules/') ||
    url.pathname.includes('@vite') ||
    url.pathname.includes('hot-update')
  ) {
    return;
  }

  // Strategy A: Supabase REST API & Storage -> NETWORK-ONLY (Never Cache API Data)
  if (url.hostname.includes('supabase.co') || url.pathname.includes('/rest/v1/')) {
    return; // Default browser fetch handling
  }

  // Strategy B: Hashed Static Assets (Vite build /assets/*.js, *.css) -> CACHE-FIRST
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(STATIC_ASSETS_CACHE).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Strategy C: App Shell (index.html, /) -> NETWORK-FIRST with Timeout Fallback
  if (event.request.mode === 'navigate' || url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // Default Stale-While-Revalidate for other static assets (icons, manifests)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
        }
        return networkResponse;
      }).catch(() => null);

      return cachedResponse || fetchPromise;
    })
  );
});
