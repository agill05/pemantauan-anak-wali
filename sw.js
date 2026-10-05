const CACHE_NAME = "anak-wali-pwa-v31";

const ASSETS_TO_CACHE = [
    "./",
    "./index.html",
    "./css/style.css",
    "./css/tailwind.css",
    "./js/config.js",
    "./js/state.js",
    "./js/api.js",
    "./js/ui.js",
    "./js/pdf.js",
    "./js/modules/auth.js",
    "./js/modules/absensi.js",
    "./js/modules/kebiasaan.js",
    "./js/modules/keagamaan.js",
    "./js/modules/akademik.js",
    "./js/modules/pembinaan.js",
    "./js/modules/dashboard.js",
    "./js/modules/siswa.js",
    "./js/modules/laporan.js",
    "./js/modules/admin.js",
    "./js/modules/magiclink.js",
    "./js/main.js",
    "./assets/img/logo-sekolah.png",
    "./assets/img/logo-sekolah-login.png",
    "./assets/img/logo-tutwuri.png",
    "./assets/img/background-sekolah.jpg",
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css",
    "https://cdn.jsdelivr.net/npm/chart.js",
    "https://cdn.jsdelivr.net/npm/sweetalert2@11",
    "https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js",
    "https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js",
    "https://cdn.jsdelivr.net/npm/jspdf-autotable@3.8.2/dist/jspdf.plugin.autotable.min.js"
];

function isCacheable(response) {
    return !!response && response.ok && response.status === 200 &&
        (response.type === "basic" || response.type === "cors");
}

async function precacheOne(cache, url) {
    try {
        const response = await fetch(new Request(url, { cache: "reload" }));
        if (isCacheable(response)) await cache.put(url, response);
    } catch (err) {
    }
}

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => Promise.all(ASSETS_TO_CACHE.map((url) => precacheOne(cache, url))))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

    if (event.request.url.includes("script.google.com")) return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                if (isCacheable(networkResponse) && networkResponse.type === "basic") {
                    const responseToCache = networkResponse.clone();
                    event.waitUntil(
                        caches.open(CACHE_NAME)
                            .then((cache) => cache.put(event.request, responseToCache))
                            .catch(() => {})
                    );
                }
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }
                    if (event.request.headers.get("accept")?.includes("text/html")) {
                        return caches.match("./index.html").then((r) => r || Response.error());
                    }
                    return Response.error();
                });
            })
    );
});

self.addEventListener("sync", (event) => {
    if (event.tag === "sync-presensi-queue") {
        event.waitUntil(handleBackgroundSync());
    }
});

async function handleBackgroundSync() {
    console.log("[Service Worker] Pemicu sinkronisasi latar belakang aktif.");
}

self.addEventListener("notificationclick", (event) => {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url && "focus" in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow("./");
            }
        })
    );
});