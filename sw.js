const CACHE_NAME = "demo-paw-cache-v2";
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "https://cdn.tailwindcss.com",
    "https://cdn.jsdelivr.net/npm/sweetalert2@11",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
];

// Install Service Worker & Cache Aset Statis
self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
    self.skipWaiting();
});

// Bersihkan Cache Lama Saat Ada Pembaruan Versi
self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) return caches.delete(key);
                })
            )
        )
    );
    self.clients.claim();
});

// Strategi Cache-First untuk Aset Statis (Abaikan Request ke GAS API)
self.addEventListener("fetch", (event) => {
    if (event.request.url.includes("script.google.com")) {
        return; // Izinkan Panggilan API GAS Berjalan Normal
    }
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || fetch(event.request);
        })
    );
});