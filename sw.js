/* Today — offline service worker.
 *
 * The app is a single self-contained page with no network calls, so caching the
 * shell is all it takes to run with no connection. Bump CACHE when you change
 * any file and the old cache is cleaned up on the next launch.
 */
const CACHE = "today-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-180.png",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first: instant load, works fully offline. Falls back to the network
// only for anything not pre-cached (there is nothing, but it stays correct if
// assets are added later).
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).catch(() =>
      caches.match("./index.html")
    ))
  );
});
