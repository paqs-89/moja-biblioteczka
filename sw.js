const CACHE_NAME = 'biblioteczka-pwa-v9';
const STATIC_ASSETS = [
  './',
  './index.html',
  './styles.css?v=9',
  './app.js?v=9',
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

  // Nigdy nie przechwytuj zapytań do zewnętrznych domen (API katalogów, okładek, GitHuba)
  if (url.origin !== self.location.origin) {
    return;
  }

  // Network-first z pominięciem przestarzałego cache HTTP przeglądarki dla plików aplikacji
  event.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, responseClone));
        }
        return networkResponse;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }))
  );
});
