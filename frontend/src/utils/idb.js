// Minimal IndexedDB helper for queuing offline submissions
export function openDB(dbName = 'toa_mairie', version = 1) {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, version);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('offline_submissions')) {
        db.createObjectStore('offline_submissions', { keyPath: 'id', autoIncrement: true });
      }
    };
    req.onerror = (err) => reject(err);
    req.onsuccess = () => resolve(req.result);
  });
}

export async function addSubmission(payload) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_submissions', 'readwrite');
    const store = tx.objectStore('offline_submissions');
    const req = store.add({ payload, createdAt: Date.now() });
    req.onsuccess = () => resolve(req.result);
    req.onerror = (e) => reject(e);
  });
}

export async function getAllSubmissions() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_submissions', 'readonly');
    const store = tx.objectStore('offline_submissions');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = (e) => reject(e);
  });
}

export async function deleteSubmission(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_submissions', 'readwrite');
    const store = tx.objectStore('offline_submissions');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = (e) => reject(e);
  });
}
