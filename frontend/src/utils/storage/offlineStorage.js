/**
 * Utilitário de Armazenamento Resiliente com suporte a IndexedDB e fallback para localStorage
 */
const DB_NAME = 'AmoriOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'app_cache';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB não suportado'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function setItemOffline(key, value) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch {
    try {
      localStorage.setItem(`offline_${key}`, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
}

export async function getItemOffline(key) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result !== undefined ? req.result : null);
      req.onerror = () => resolve(null);
    });
  } catch {
    try {
      const item = localStorage.getItem(`offline_${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }
}
