const CACHE_NAME = 'toa-mairie-static-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Network-first for API calls, cache-first for static assets
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
  }
});

// Simple message handler to trigger sync from page
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_OFFLINE') {
    // Could trigger background sync here if supported
    event.waitUntil(handleSync());
  }
});

async function handleSync() {
  // Simple post to /forms/sync/offline retrieving queued submissions from IndexedDB via postMessage is complex.
  // The page will perform the actual sync using the stored queue.
  return;
}
