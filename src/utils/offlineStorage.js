const DB_NAME = 'KinTagOfflineVault';
// 🌟 CRITICAL: We changed this to 2. This tells the browser to upgrade the database and add the new folders!
const DB_VERSION = 1; 

// The 5 folders we need to store all Dashboard data
const STORES = ['profiles', 'scans', 'systemMessages', 'activeAlerts', 'userData'];

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    // This only runs once when the version number goes up
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      STORES.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id' });
        }
      });
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

// 🌟 NEW: A dynamic function that saves ANY array of data to the correct folder
export const saveToCache = async (storeName, dataArray) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      
      // Wipe the old cache for this specific folder, then save the fresh data
      store.clear().onsuccess = () => {
        dataArray.forEach(item => store.put(item));
      };

      transaction.oncomplete = () => resolve(true);
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (err) {
    console.error(`Failed saving ${storeName}:`, err);
  }
};

// 🌟 NEW: A dynamic function that loads ANY array of data from the correct folder
export const getFromCache = async (storeName) => {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`Failed loading ${storeName}:`, err);
    return [];
  }
};
