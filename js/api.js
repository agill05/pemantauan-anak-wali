async function apiCall(action, payload = {}, showFullLoader = false, retries = 3) {
    if (showFullLoader) showLoading();

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: action, token: appState.token, payload: payload })
            });
            const json = await response.json();
            if (showFullLoader) hideLoading();
            return json;
        } catch (err) {
            console.error(`Attempt ${attempt} failed:`, err);
            if (attempt === retries) {
                if (showFullLoader) hideLoading();
                showToast("Koneksi terputus. Menyimpan lokal.", "warning");
                return null;
            }
            await new Promise(res => setTimeout(res, 1200));
        }
    }
}

function startSilentTokenRefresh() {
    if (silentTokenRefreshInterval) clearInterval(silentTokenRefreshInterval);

    silentTokenRefreshInterval = setInterval(async () => {
        if (!appState.token) return;

        const res = await apiCall("refreshToken", {}, false);
        if (res && res.status === "success" && res.token) {
            appState.token = res.token;

            const savedSession = JSON.parse(localStorage.getItem("session_anak_wali") || "{}");
            savedSession.token = res.token;
            localStorage.setItem("session_anak_wali", JSON.stringify(savedSession));
        }
    }, 10 * 60 * 1000);
}

function setupNetworkStatusListeners() {
    const banner = document.getElementById("offline-banner");

    const updateStatus = async () => {
        if (navigator.onLine) {
            banner?.classList.add("hidden");
            showToast("Koneksi terhubung kembali.");

            const offlineData = localStorage.getItem("offline_absensi_queue");
            if (offlineData) {
                try {
                    const parsed = JSON.parse(offlineData);
                    const isAdmin = appState.user && appState.user.role === "admin";
                    if (parsed.tanggal && parsed.tanggal !== getDateWITA() && !isAdmin) {
                        localStorage.removeItem("offline_absensi_queue");
                        Swal.fire({
                            icon: "warning",
                            title: "Presensi Tidak Terkirim",
                            text: `Presensi tanggal ${formatTanggalLabel(parsed.tanggal)} tidak sempat terkirim sebelum hari berganti dan sudah terkunci. Hubungi admin untuk koreksi.`,
                            confirmButtonColor: "#2563eb"
                        });
                    } else {
                        showLoading("Menyinkronkan data presensi offline...");
                        const res = await apiCall("saveAbsensi", parsed, false);
                        hideLoading();
                        if (res && res.status === "success") {
                            localStorage.removeItem("offline_absensi_queue");
                            showToast("Data presensi offline berhasil disinkronkan ke server!");
                        } else if (res && res.status === "error" && (res.code === "DATE_LOCKED" || res.code === "DATE_FUTURE")) {
                            localStorage.removeItem("offline_absensi_queue");
                            Swal.fire({ icon: "warning", title: "Presensi Tidak Terkirim", text: res.message, confirmButtonColor: "#2563eb" });
                        }
                    }
                } catch (e) { }
            }
            triggerBackgroundSync();
        } else {
            banner?.classList.remove("hidden");
        }
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
}

async function triggerBackgroundSync() {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register('sync-presensi-queue');
            console.log('Background Sync berhasil didaftarkan');
        } catch (err) {
            console.error('Pendaftaran Background Sync gagal:', err);
        }
    }
}

async function fetchAllAppData(force = true) {
    if (!force && appState.siswa.length > 0) return;

    const resBootstrap = await apiCall("getBootstrapData", {}, false);
    if (resBootstrap && resBootstrap.status === "success") {
        appState.kelas = resBootstrap.data.initial.kelas || [];
        appState.guru = resBootstrap.data.initial.guru || [];
        appState.siswa = resBootstrap.data.initial.siswa || [];
        appState.myStudents = resBootstrap.data.initial.siswa || [];
        if (resBootstrap.data.initial.pengaturan) {
            appState.pengaturan = resBootstrap.data.initial.pengaturan;
        }
        saveAppStateToLocal();
    }
}

function handleLogout(force = false) {
    const executeLogout = () => {
        if (silentTokenRefreshInterval) clearInterval(silentTokenRefreshInterval);
        if (notificationPollingInterval) clearInterval(notificationPollingInterval);
        if (dataPollingInterval) clearInterval(dataPollingInterval);

        document.documentElement.classList.remove("has-session");
        sessionStorage.removeItem("app_last_view");
        localStorage.removeItem("session_anak_wali");
        localStorage.removeItem("cache_appState_full");
        localStorage.removeItem("notif_ditangani_cache");
        localStorage.removeItem("login_last_role");
        
        appState = {
            token: null,
            user: null,
            kelas: [],
            guru: [],
            siswa: [],
            myStudents: [],
            absensi: [],
            kebiasaan: [],
            keagamaan: [],
            akademik: [],
            prestasi: [],
            pembinaan: [],
            activeSiswaDetail: null,
            laporanRekap: [],
            currentNotifications: [],
            notificationsReady: false,
            handledNotifications: [],
            pengaturan: { nama_kepsek: "", nip_kepsek: "" }
        };
        location.reload();
    };

    if (force) {
        executeLogout();
    } else {
        Swal.fire({
            title: 'Konfirmasi Keluar',
            text: "Apakah Anda yakin ingin keluar dari aplikasi?",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Keluar',
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) executeLogout();
        });
    }
}