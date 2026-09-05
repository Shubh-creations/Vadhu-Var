/**
 * Production Service Worker Auto-Update & Cache Sync Engine
 */
export function registerServiceWorker() {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  if (import.meta.env.DEV) {
    // In local dev, always unregister service workers
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (let reg of registrations) reg.unregister();
    });
    if ('caches' in window) {
      caches.keys().then((names) => {
        for (let name of names) caches.delete(name);
      });
    }
    return;
  }

  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          // Immediately check for updates
          registration.update();

          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) return;

            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  // Automatically activate the latest deployment
                  if (registration.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
                  }
                  window.dispatchEvent(new CustomEvent('swUpdateAvailable', { detail: registration }));
                }
              }
            };
          };
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });

    // Auto-reload smoothly when new worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }
}
