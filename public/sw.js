const CACHE_NAME = 'expat-savvy-v1';

const STATIC_ASSETS = [
  '/',
  '/favicon.svg',
  '/manifest.json',
  '/assets/css/main.css',
  '/assets/js/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});