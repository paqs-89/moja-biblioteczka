const CACHE_NAME = 'biblioteczka-pwa-v5';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icons/icon.svg',
  './data/books.json'
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
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Nigdy nie buforuj zapytań do GitHub API ani zewnętrznych katalogów ISBN
  if (
    url.hostname.includes('api.github.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('data.bn.org.pl') ||
    url.pathname.includes('/api/books')
  ) {
    return;
  }

  // Network-first (z fallbackiem do cache offline) dla plików aplikacji i bazy JSON
  event.respondWith(
    fetch(req)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(req))
  );
});
