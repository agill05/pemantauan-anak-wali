const CACHE_NAME = "paw-cache-v4.4";
const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js"
];

self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

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

// Strategi Network-First untuk HTML & JS Aplikasi (Agar Update Vercel Langsung Aktif)
self.addEventListener("fetch", (event) => {
    if (event.request.url.includes("script.google.com")) {
        return; // API Request selalu bypass Service Worker
    }

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
                }
                return networkResponse;
            })
            .catch(() => caches.match(event.request)) // Fallback ke Cache hanya saat Offline
    );
});

// ==================================================================
// SYSTEM PUSH NOTIFICATION LISTENERS (Out-of-App Delivery)
// ==================================================================
self.addEventListener("push", (event) => {
    const data = event.data ? event.data.json() : { 
        title: "Peringatan Anak Wali", 
        body: "Ada perhatian khusus pada perkembangan siswa wali Anda." 
    };
    const options = {
        body: data.body,
        icon: "https://ui-avatars.com/api/?name=AW&background=2563eb&color=fff&size=192",
        badge: "https://ui-avatars.com/api/?name=AW&background=2563eb&color=fff&size=64",
        data: data.url || "./",
        vibrate: [200, 100, 200]
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: "window" }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(event.notification.data || "./");
            }
        })
    );
});