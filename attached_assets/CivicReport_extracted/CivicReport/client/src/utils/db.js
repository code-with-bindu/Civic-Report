/**
 * db.js — IndexedDB database for offline storage
 */

const DB_NAME = 'CivicReportDB';
const DB_VERSION = 1;

// Store names
const STORES = {
  PENDING_ISSUES: 'pendingIssues',
  PENDING_VOTES: 'pendingVotes',
  SYNC_QUEUE: 'syncQueue',
};

let db = null;

/**
 * Initialize IndexedDB
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      console.log('✅ IndexedDB initialized');
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create object stores if they don't exist
      if (!database.objectStoreNames.contains(STORES.PENDING_ISSUES)) {
        database.createObjectStore(STORES.PENDING_ISSUES, { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains(STORES.PENDING_VOTES)) {
        database.createObjectStore(STORES.PENDING_VOTES, { keyPath: 'id', autoIncrement: true });
      }
      if (!database.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
        database.createObjectStore(STORES.SYNC_QUEUE, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

/**
 * Add pending issue to offline queue
 */
export const savePendingIssue = (issueData) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([STORES.PENDING_ISSUES], 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_ISSUES);

    const data = {
      ...issueData,
      savedAt: new Date().toISOString(),
      synced: false,
    };

    const request = store.add(data);

    request.onsuccess = () => {
      console.log('✅ Issue saved offline:', request.result);
      resolve(request.result);
    };

    request.onerror = () => {
      console.error('❌ Failed to save issue offline:', request.error);
      reject(request.error);
    };
  });
};

/**
 * Get all pending issues
 */
export const getPendingIssues = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([STORES.PENDING_ISSUES], 'readonly');
    const store = transaction.objectStore(STORES.PENDING_ISSUES);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Delete pending issue after sync
 */
export const deletePendingIssue = (id) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([STORES.PENDING_ISSUES], 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_ISSUES);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log('✅ Pending issue deleted:', id);
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Add pending vote
 */
export const savePendingVote = (voteData) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([STORES.PENDING_VOTES], 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_VOTES);

    const data = {
      ...voteData,
      savedAt: new Date().toISOString(),
      synced: false,
    };

    const request = store.add(data);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Get all pending votes
 */
export const getPendingVotes = () => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([STORES.PENDING_VOTES], 'readonly');
    const store = transaction.objectStore(STORES.PENDING_VOTES);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};

/**
 * Delete pending vote after sync
 */
export const deletePendingVote = (id) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('Database not initialized'));
      return;
    }

    const transaction = db.transaction([STORES.PENDING_VOTES], 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_VOTES);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
};
