const CONFIG = {
    INTERVAL_MS: 15000,
    STORAGE_KEY: 'geotracker_csv',
    MAX_PREVIEW_LINES: 50,
    CSV_HEADER: 'timestamp,latitude,longitude,online,effectiveType,downlink,rtt\n'
};

let appState = {
    isRecording: false,
    geoWatchId: null,
    intervalId: null,
    lastCoords: null,
    lastNetworkInfo: null,
    totalRecords: 0
};

let deferredPrompt = null;

const ui = {
    latitude: document.getElementById('latitude'),
    longitude: document.getElementById('longitude'),
    accuracy: document.getElementById('accuracy'),
    lastUpdate: document.getElementById('lastUpdate'),
    geoAlert: document.getElementById('geoAlert'),
    geoAlertText: document.getElementById('geoAlertText'),

    onlineBadge: document.getElementById('onlineBadge'),
    connectionType: document.getElementById('connectionType'),
    effectiveType: document.getElementById('effectiveType'),
    downlink: document.getElementById('downlink'),
    rtt: document.getElementById('rtt'),

    swStatus: document.getElementById('swStatus'),
    recordingStatus: document.getElementById('recordingStatus'),
    recordCount: document.getElementById('recordCount'),

    startBtn: document.getElementById('startBtn'),
    stopBtn: document.getElementById('stopBtn'),
    previewBtn: document.getElementById('previewBtn'),
    downloadBtn: document.getElementById('downloadBtn'),
    clearBtn: document.getElementById('clearBtn'),

    noCsvAlert: document.getElementById('noCsvAlert'),
    recordInfo: document.getElementById('recordInfo'),
    recordInfoText: document.getElementById('recordInfoText'),
    csvPreviewContainer: document.getElementById('csvPreviewContainer'),
    csvPreview: document.getElementById('csvPreview'),

    installBanner: document.getElementById('installBanner'),
    installBtn: document.getElementById('installBtn')
};

document.addEventListener('DOMContentLoaded', () => {
    loadCSVFromStorage();
    updateRecordCount();

    ui.startBtn.addEventListener('click', startRecording);
    ui.stopBtn.addEventListener('click', stopRecording);
    ui.previewBtn.addEventListener('click', toggleCSVPreview);
    ui.downloadBtn.addEventListener('click', downloadCSV);
    ui.clearBtn.addEventListener('click', clearAllData);

    window.addEventListener('online', updateConnectionInfo);
    window.addEventListener('offline', updateConnectionInfo);

    if (navigator.connection) {
        navigator.connection.addEventListener('change', updateConnectionInfo);
    }

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        ui.installBanner.classList.add('show');

        ui.installBtn.addEventListener('click', () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            deferredPrompt.userChoice.finally(() => {
                deferredPrompt = null;
                ui.installBanner.classList.remove('show');
            });
        });
    });

    window.addEventListener('appinstalled', () => {
        ui.installBanner.classList.remove('show');
    });

    updateConnectionInfo();
});

function startRecording() {
    if (!navigator.geolocation) {
        showGeoAlert('Geolocation not supported', true);
        return;
    }

    appState.isRecording = true;
    ui.startBtn.disabled = true;
    ui.stopBtn.disabled = false;
    ui.recordingStatus.textContent = 'Activo';

    showGeoAlert('Getting location...', false);

    requestLocation();

    if (appState.intervalId) clearInterval(appState.intervalId);
    appState.intervalId = setInterval(() => {
        if (appState.isRecording) requestLocation();
    }, CONFIG.INTERVAL_MS);

    appState.geoWatchId = navigator.geolocation.watchPosition(
        (position) => {
            appState.lastCoords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date(position.timestamp)
            };
            updateLocationUI();
        },
        handleGeoError,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
}

function requestLocation() {
    navigator.geolocation.getCurrentPosition(
        (position) => {
            appState.lastCoords = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                timestamp: new Date(position.timestamp)
            };
            updateLocationUI();
            recordData();
            hideGeoAlert();
        },
        handleGeoError,
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
    );
}

function handleGeoError(error) {
    let message = 'Location error';

    if (error.code === error.PERMISSION_DENIED) message = 'Permiso denegado';
    else if (error.code === error.POSITION_UNAVAILABLE) message = 'Posicion inaccesible';
    else if (error.code === error.TIMEOUT) message = 'Tiempo agotado';

    showGeoAlert(message, true);
}

function updateLocationUI() {
    if (!appState.lastCoords) return;

    const { latitude, longitude, accuracy, timestamp } = appState.lastCoords;

    ui.latitude.textContent = latitude.toFixed(6);
    ui.longitude.textContent = longitude.toFixed(6);
    ui.accuracy.textContent = accuracy.toFixed(1) + ' m';
    ui.lastUpdate.textContent = timestamp.toLocaleString();
}

function showGeoAlert(message, isError) {
    ui.geoAlert.style.display = 'block';
    ui.geoAlertText.textContent = message;
    ui.geoAlert.className = isError ? 'alert error' : 'alert info';
}

function hideGeoAlert() {
    ui.geoAlert.style.display = 'none';
}

function updateConnectionInfo() {
    const isOnline = navigator.onLine;
    ui.onlineBadge.textContent = isOnline ? 'En Linea' : 'Fuera de linea';

    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (conn) {
        appState.lastNetworkInfo = {
            online: isOnline,
            effectiveType: conn.effectiveType || 'N/A',
            downlink: conn.downlink ?? 'N/A',
            rtt: conn.rtt ?? 'N/A'
        };

        ui.connectionType.textContent = conn.type || 'N/A';
        ui.effectiveType.textContent = conn.effectiveType || 'N/A';
        ui.downlink.textContent = conn.downlink ?? 'N/A';
        ui.rtt.textContent = conn.rtt ?? 'N/A';
    }
}

function recordData() {
    if (!appState.lastCoords || !appState.lastNetworkInfo) return;

    const { latitude, longitude, timestamp } = appState.lastCoords;
    const { online, effectiveType, downlink, rtt } = appState.lastNetworkInfo;

    const line = `${timestamp.toISOString()},${latitude},${longitude},${online},${effectiveType},${downlink},${rtt}\n`;

    let csv = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!csv) csv = CONFIG.CSV_HEADER;

    csv += line;
    localStorage.setItem(CONFIG.STORAGE_KEY, csv);

    appState.totalRecords++;
    updateRecordCount();
}

function loadCSVFromStorage() {
    const csv = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!csv) {
        appState.totalRecords = 0;
        return;
    }

    const lines = csv.trim().split('\n');
    appState.totalRecords = Math.max(0, lines.length - 1);
}

function updateRecordCount() {
    ui.recordCount.textContent = appState.totalRecords;

    const csv = localStorage.getItem(CONFIG.STORAGE_KEY);
    const hasData = csv && appState.totalRecords > 0;

    ui.noCsvAlert.style.display = hasData ? 'none' : 'block';
    ui.recordInfo.style.display = hasData ? 'block' : 'none';

    if (hasData) {
        ui.recordInfoText.textContent = appState.totalRecords + ' registros';
    }

    ui.previewBtn.disabled = !hasData;
    ui.downloadBtn.disabled = !hasData;
    ui.clearBtn.disabled = !hasData;
}

function toggleCSVPreview() {
    const visible = ui.csvPreviewContainer.style.display === 'block';

    if (visible) {
        ui.csvPreviewContainer.style.display = 'none';
        ui.previewBtn.textContent = 'Ver Data';
    } else {
        generateCSVPreview();
        ui.csvPreviewContainer.style.display = 'block';
        ui.previewBtn.textContent = 'Ocultar Data';
    }
}

function generateCSVPreview() {
    const csv = localStorage.getItem(CONFIG.STORAGE_KEY) || '';
    const lines = csv.trim().split('\n');
    ui.csvPreview.textContent = lines.slice(0, CONFIG.MAX_PREVIEW_LINES).join('\n');
}

function downloadCSV() {
    const csv = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!csv) return;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);

    link.href = url;
    link.download = `geotracker_${ts}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearAllData() {
    if (!confirm('¿Desea Borrar todos los datos?')) return;

    localStorage.removeItem(CONFIG.STORAGE_KEY);
    appState.totalRecords = 0;
    updateRecordCount();
    ui.csvPreviewContainer.style.display = 'none';
    ui.previewBtn.textContent = 'Vista Previa';
}

function stopRecording() {
    appState.isRecording = false;

    if (appState.intervalId) {
        clearInterval(appState.intervalId);
        appState.intervalId = null;
    }

    if (appState.geoWatchId !== null) {
        navigator.geolocation.clearWatch(appState.geoWatchId);
        appState.geoWatchId = null;
    }

    ui.startBtn.disabled = false;
    ui.stopBtn.disabled = true;
    ui.recordingStatus.textContent = 'Inactivo';

    hideGeoAlert();
}
