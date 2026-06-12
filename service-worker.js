const CACHE_NAME = "mundial-probabilidades-v0-2-4";
const APP_SHELL = [
  "./",
  "./index.html",
  "./assets/css/styles.css",
  "./assets/js/config.js",
  "./assets/js/model.js",
  "./assets/js/data.js",
  "./assets/js/app.js",
  "./assets/img/forecast-pitch.png",
  "./assets/img/icon-192.png",
  "./assets/img/icon-512.png",
  "./data/worldcup2026_latest.json",
  "./data/sources_manifest.json",
  "./manifest.webmanifest"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match("./index.html")))
  );
});
