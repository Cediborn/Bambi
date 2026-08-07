/* BAMBI service worker — offline-first app shell.
 *
 * Strategy (kept deliberately simple and dependency-free):
 *  - install: precache the shell routes + icons so the app opens offline,
 *  - static assets (/_next/static, fonts, images): cache-first, refreshed
 *    in the background so updates arrive on the next visit,
 *  - page navigations: network-first, falling back to the cached shell
 *    when offline — BAMBI keeps working on a train, in a tunnel, anywhere.
 *
 * Bump `CACHE` to a new version to invalidate everything on the next
 * load (the activate handler clears old caches automatically).
 *
 * Offline scope note: navigations to routes you visited online fall back
 * to the cached shell; a route never opened online will still 404 on its
 * chunks. Visit once, and it works offline from then on.
 */

const CACHE = "bambi-v1";

const APP_SHELL = [
  "/",
  "/today",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Page navigations: network first, offline shell as the fallback.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match("/today"))
        )
    );
    return;
  }

  // Static assets: serve from cache instantly, refresh quietly behind it.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
