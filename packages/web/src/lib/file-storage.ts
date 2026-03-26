// File persistence using IndexedDB for storing uploaded files across sessions
const DB_NAME = "struktur-files";
const STORE_NAME = "uploaded-files";
const DB_VERSION = 1;

interface StoredFile {
  name: string;
  type: string;
  size: number;
  lastModified: number;
  data: string; // base64 encoded
}

// Chunk size for base64 encoding (64KB chunks to stay well below stack limits)
const CHUNK_SIZE = 64 * 1024;

/**
 * Convert ArrayBuffer to base64 string without stack overflow
 * Uses chunking to avoid the spread operator limit
 */
function arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";

  // Process in chunks to avoid stack overflow
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    const chunk = bytes.slice(i, i + CHUNK_SIZE);
    // Use apply with the chunk array instead of spread
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }

  return btoa(binary);
}

/**
 * Convert base64 string to ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "name" });
      }
    };
  });
}

export async function saveFilesToStorage(files: File[]): Promise<void> {
  try {
    // Read all files first (outside of transaction)
    const storedFiles: StoredFile[] = [];
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const base64 = arrayBufferToBase64(arrayBuffer);
      storedFiles.push({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
        data: base64,
      });
    }

    // Now open transaction and write all at once
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    // Clear existing files
    await new Promise<void>((resolve, reject) => {
      const clearRequest = store.clear();
      clearRequest.onsuccess = () => resolve();
      clearRequest.onerror = () => reject(clearRequest.error);
    });

    // Store all files (no await between operations to keep transaction alive)
    const putPromises = storedFiles.map((storedFile) => {
      return new Promise<void>((resolve, reject) => {
        const request = store.put(storedFile);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    });

    await Promise.all(putPromises);

    // Wait for the transaction to complete
    await new Promise<void>((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(new Error("Transaction aborted"));
    });

    db.close();
  } catch (error) {
    console.error("Failed to save files to storage:", error);
  }
}

export async function loadFilesFromStorage(): Promise<File[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);

    const storedFiles: StoredFile[] = await new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result as StoredFile[]);
      request.onerror = () => reject(request.error);
    });

    db.close();

    // Convert stored files back to File objects
    return storedFiles.map((stored) => {
      const arrayBuffer = base64ToArrayBuffer(stored.data);
      const blob = new Blob([arrayBuffer], { type: stored.type });
      return new File([blob], stored.name, {
        type: stored.type,
        lastModified: stored.lastModified,
      });
    });
  } catch (error) {
    console.error("Failed to load files from storage:", error);
    return [];
  }
}

export async function clearStoredFiles(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });

    db.close();
  } catch (error) {
    console.error("Failed to clear stored files:", error);
  }
}
