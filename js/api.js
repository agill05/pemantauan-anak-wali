async function apiCall(action, payload = {}, showFullLoader = false, retries = 3, silent = false, timeoutMs = 25000) {
    if (showFullLoader) showLoading();

    // satu request_id untuk semua retry: backend menolak duplikat tulis (idempotent)
    const requestId = (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : Date.now() + "-" + Math.random().toString(36).slice(2, 10);

    for (let attempt = 1; attempt <= retries; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "text/plain;charset=utf-8" },
                body: JSON.stringify({ action: action, token: appState.token, payload: payload, request_id: requestId }),
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const json = await response.json();
            if (showFullLoader) hideLoading();
            return json;
        } catch (err) {
            clearTimeout(timeoutId);
            console.error(`Attempt ${attempt} failed:`, err);
            
            if (attempt === retries) {
                if (showFullLoader) hideLoading();
                const isTimeout = err.name === 'AbortError';
                if (!silent) {
                    showToast(isTimeout ? "Koneksi lambat (Timeout). Menyimpan lokal." : "Koneksi terputus. Menyimpan lokal.", "warning");
                }
                return null;
            }
            await new Promise(res => setTimeout(res, 1200));
        }
    }
}

let _lastVersiSheet = null;
// Return signature versi sheet kalau ada perubahan, null kalau tidak ada. Fail-open saat error.
async function cekVersiData() {
    const res = await apiCall("getVersi", {}, false, 1, true, 8000);
    if (!res || res.status !== "success" || !res.data) return "gagal-" + Date.now();
    const sig = JSON.stringify(res.data);
    return sig === _lastVersiSheet ? null : sig;
}

function startSilentTokenRefresh() {
    if (silentTokenRefreshInterval) clearInterval(silentTokenRefreshInterval);

    silentTokenRefreshInterval = setInterval(async () => {
        if (!appState.token) return;

        const res = await apiCall("refreshToken", {}, false);
        if (res && res.status === "success" && res.token) {
            appState.token = res.token;
            if (res.user) syncUserFlags(res.user);

            const savedSession = JSON.parse(localStorage.getItem("session_anak_wali") || "{}");
            savedSession.token = res.token;
            localStorage.setItem("session_anak_wali", JSON.stringify(savedSession));
        }
    }, 10 * 60 * 1000);
}

let networkListenersReady = false;

function setupNetworkStatusListeners() {
    if (networkListenersReady) return;
    networkListenersReady = true;

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
        } else {
            banner?.classList.remove("hidden");
        }
    };

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
}

async function fetchAllAppData(force = true) {
    if (!force && appState.siswa.length > 0) return;

    const resBootstrap = await apiCall("getBootstrapData", {}, false);
    if (resBootstrap && resBootstrap.status === "success") {
        appState.kelas = resBootstrap.data.initial.kelas || [];
        appState.guru = resBootstrap.data.initial.guru || [];
        appState.siswa = resBootstrap.data.initial.siswa || [];
        appState.myStudents = appState.siswa;
        if (resBootstrap.data.initial.pengaturan) appState.pengaturan = resBootstrap.data.initial.pengaturan;
        saveAppStateToLocal();
    }
}
