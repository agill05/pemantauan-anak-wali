let autoPollingInterval = null;
const POLLING_INTERVAL_MS = 20000;

let lastFetchTimes = {
    bootstrap: 0,
    absensi: 0,
    kebiasaan: 0,
    keagamaan: 0,
    akademik: 0,
    pembinaan: 0,
    laporan: 0
};

let kebiasaanDebounceTimer = null;
let pendingKebiasaanQueue = new Map();
let silentTokenRefreshInterval = null;
let notificationPollingInterval = null;
let headerClockInterval = null;

let appState = {
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
    handledNotifications: []
};

function saveAppStateToLocal() {
    try {
        localStorage.setItem("cache_appState_full", JSON.stringify({
            kelas: appState.kelas,
            guru: appState.guru,
            siswa: appState.siswa,
            myStudents: appState.myStudents,
            absensi: appState.absensi,
            kebiasaan: appState.kebiasaan,
            keagamaan: appState.keagamaan,
            akademik: appState.akademik,
            prestasi: appState.prestasi,
            pembinaan: appState.pembinaan,
            laporanRekap: appState.laporanRekap,
            lastFetchTimes: lastFetchTimes
        }));
    } catch (e) { }
}

function loadAppStateFromLocal() {
    const cached = localStorage.getItem("cache_appState_full");
    if (cached) {
        try {
            const data = JSON.parse(cached);
            if (data.lastFetchTimes) {
                lastFetchTimes = { ...lastFetchTimes, ...data.lastFetchTimes };
                delete data.lastFetchTimes;
            }
            appState = { ...appState, ...data };
            return true;
        } catch (e) { }
    }
    return false;
}