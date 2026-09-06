const CACHE_NAME = 'pahariyatri-v1';
const CACHE_ASSETS = [
    '/',
    '/offline.html',
];

// Install Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CACHE_ASSETS).catch((error) => {
                console.error('Failed to cache assets:', error);
            });
        })
    );
});

// Fetch Event
//
// Bug fix (2026-08-30): this used to intercept EVERY fetch the page made —
// including XHR/fetch calls to api.pahariyatri.com, not just page loads. If
// the backend was down or unreachable, this swallowed the real network
// error and resolved the request with offline.html's raw HTML instead —
// so the app's own `fetch(...).then(r => r.json())` calls would throw a
// JSON-parse error on HTML content instead of getting the network failure
// they actually handle (retry logic, "couldn't load" empty states, etc).
// A failed backend call now genuinely fails, and the app's existing
// per-page error/retry handling deals with it — this service worker only
// ever substitutes offline.html for a failed *page navigation*, which is
// what an offline fallback page is actually for.
self.addEventListener('fetch', (event) => {
    if (event.request.mode !== 'navigate') {
        return; // let API/XHR/asset requests fail normally — don't intercept them
    }
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => caches.match('/offline.html'));
        })
    );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
