/* AQUACAST static demo app shell. Never cache user-imported CSVs or dynamic third-party responses. */
const CACHE = 'aquacast-shell-v393';
const SHELL = [
  './', './index.html', './manifest.webmanifest',
  './css/styles.css', './assets/aquacast-logo.png',
  './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './js/data.js', './js/charts.js', './js/evaluation.js',
  './js/forecast-insights.js', './js/station-forecast-guide.js',
  './js/chart-mode.js', './js/imports.js', './js/accuracy-dashboard.js', './js/transparency.js', './js/app.js', './js/notifications.js', './js/investigations.js', './js/pwa.js', './js/notice-modal.js'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('aquacast-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // CDN and third-party content not stored.
  if (!url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('./index.html')));
    return;
  }
  event.respondWith(caches.match(request).then(cached => cached || fetch(request)));
});
