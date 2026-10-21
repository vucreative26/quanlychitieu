const CACHE_NAME = 'fintech-pwa-v6';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './database.json',
  './assets/app.css',
  './assets/lucide.min.js',
  './assets/chart.umd.js',
  './assets/features.js',
  './assets/biometrics.js',
  './icon.svg',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('fintech-pwa-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  // Serve the saved app immediately; refresh HTML and the seed database in
  // the background so a slow connection cannot hold up the PIN screen.
  const update = async (cache) => {
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  };
  const cachePromise = caches.open(CACHE_NAME);
  const cachedPromise = cachePromise.then(cache => cache.match(request));
  const shouldRefresh = request.mode === 'navigate' || url.pathname.endsWith('/database.json');
  if (shouldRefresh) {
    const networkPromise = cachePromise.then(update);
    event.waitUntil(networkPromise.catch(() => {}));
    event.respondWith((async () => {
      const cached = await cachedPromise;
      if (cached) return cached;
      try {
        return await networkPromise;
      } catch (error) {
        if (request.mode === 'navigate') {
          const fallback = await (await cachePromise).match('./index.html');
          if (fallback) return fallback;
        }
        return Response.error();
      }
    })());
  } else {
    event.respondWith((async () => {
      const cached = await cachedPromise;
      return cached || update(await cachePromise);
    })());
  }
});
