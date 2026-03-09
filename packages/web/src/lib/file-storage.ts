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
		const db = await openDB();
		const transaction = db.transaction([STORE_NAME], "readwrite");
		const store = transaction.objectStore(STORE_NAME);

		// Clear existing files
		await new Promise<void>((resolve, reject) => {
			const clearRequest = store.clear();
			clearRequest.onsuccess = () => resolve();
			clearRequest.onerror = () => reject(clearRequest.error);
		});

		// Store each file
		for (const file of files) {
			const arrayBuffer = await file.arrayBuffer();
			const base64 = btoa(
				String.fromCharCode(...new Uint8Array(arrayBuffer)),
			);

			const storedFile: StoredFile = {
				name: file.name,
				type: file.type,
				size: file.size,
				lastModified: file.lastModified,
				data: base64,
			};

			await new Promise<void>((resolve, reject) => {
				const request = store.put(storedFile);
				request.onsuccess = () => resolve();
				request.onerror = () => reject(request.error);
			});
		}

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
			const binaryString = atob(stored.data);
			const bytes = new Uint8Array(binaryString.length);
			for (let i = 0; i < binaryString.length; i++) {
				bytes[i] = binaryString.charCodeAt(i);
			}
			const blob = new Blob([bytes], { type: stored.type });
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
