const CACHE_NAME = 'anak-wali-pwa-v1';

// Daftar aset statis utama yang akan disimpan ke cache saat instalasi awal
const STATIC_ASSETS = [
    './',
    './index.html',
    './app.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/sweetalert2@11',
    'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
];

// ==================================================================
// 1. EVENT INSTALLATION (Caching Aset Statis)
// ==================================================================
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Caching static assets...');
            return cache.addAll(STATIC_ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// ==================================================================
// 2. EVENT ACTIVATION (Pembersihan Cache Lama)
// ==================================================================
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[Service Worker] Clearing old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// ==================================================================
// 3. EVENT FETCH (Stale-While-Revalidate & Network-First Strategy)
// ==================================================================
self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);

    // Jangan cache permintaan API Google Apps Script (selalu ambil jaringan terbaru)
    if (url.origin.includes('script.google.com') || url.origin.includes('script.googleusercontent.com')) {
        event.respondWith(
            fetch(req).catch(() => {
                // Return fallback response jika benar-benar offline saat API request
                return new Response(JSON.stringify({
                    status: 'error',
                    offline: true,
                    message: 'Koneksi internet terputus. Data akan disinkronkan saat terhubung kembali.'
                }), {
                    headers: { 'Content-Type': 'application/json' }
                });
            })
        );
        return;
    }

    // Strategi Stale-While-Revalidate untuk aset lokal & CDN
    event.respondWith(
        caches.match(req).then((cachedResponse) => {
            const fetchPromise = fetch(req).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(req, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // Jika jaringan gagal, kembalikan offline fallback jika ada
            });

            return cachedResponse || fetchPromise;
        })
    );
});

// ==================================================================
// 4. BACKGROUND SYNC (Sinkronisasi Data Presensi Terjadwal)
// ==================================================================
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-presensi-queue') {
        console.log('[Service Worker] Executing Background Sync for Presensi Queue...');
        event.waitUntil(
            // Notifikasi balik ke seluruh tab aplikasi bahwa koneksi telah pulih
            self.clients.matchAll().then((clients) => {
                clients.forEach((client) => {
                    client.postMessage({
                        type: 'NETWORK_RESTORED_SYNC',
                        message: 'Koneksi pulih. Memulai sinkronisasi otomatis.'
                    });
                });
            })
        );
    }
});

// ==================================================================
// 5. PUSH NOTIFICATIONS & CLICK HANDLER
// ==================================================================
self.addEventListener('push', (event) => {
    let payload = { title: 'Peringatan Sistem', body: 'Terdapat pembaruan pada data siswa.' };

    if (event.data) {
        try {
            payload = event.data.json();
        } catch (e) {
            payload.body = event.data.text();
        }
    }

    const options = {
        body: payload.body,
        icon: 'https://ui-avatars.com/api/?name=AW&background=2563eb&color=fff&size=192',
        badge: 'https://ui-avatars.com/api/?name=AW&background=2563eb&color=fff&size=72',
        vibrate: [200, 100, 200],
        tag: 'siswa-bermasalah-alert',
        renotify: true,
        data: {
            url: self.registration.scope
        }
    };

    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === event.notification.data.url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow(event.notification.data.url);
            }
        })
    );
});