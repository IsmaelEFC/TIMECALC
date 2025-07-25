let db;
const DB_NAME = "CapturaSyncDB";
const STORE_NAME = "capturas";

function abrirDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onupgradeneeded = event => {
            db = event.target.result;
            db.createObjectStore(STORE_NAME, { keyPath: "timestamp" });
        };
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };
        request.onerror = () => reject(request.error);
    });
}

async function guardarCaptura(data) {
    if (!db) await abrirDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    return new Promise((resolve, reject) => {
        const req = store.add(data);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
    });
}

async function cargarCapturas(callback) {
    if (!db) await abrirDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => callback(request.result);
    request.onerror = () => callback([]);
}

async function eliminarCapturaDB(timestamp, callback) {
    if (!db) await abrirDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.delete(timestamp);
    request.onsuccess = () => callback(null);
    request.onerror = () => callback(request.error);
}