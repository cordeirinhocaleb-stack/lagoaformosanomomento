/**
 * Local Storage Service
 * Handles storing and retrieving files locally in IndexedDB before upload
 */

const DB_NAME = 'LFNM_LocalFiles';
const STORE_NAME = 'files';
const DB_VERSION = 1;

interface StoredFile {
    id: string;
    file: File;
    type: string;
    name: string;
    size: number;
    timestamp: number;
}

/**
 * Open or create IndexedDB database
 */
function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            }
        };
    });
}

/**
 * Store a file locally in IndexedDB for later upload
 * Returns a unique local ID that can be used to retrieve the file
 */
export async function storeLocalFile(file: File): Promise<string> {
    const localId = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
        const db = await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const record: StoredFile = {
            id: localId,
            file: file,
            type: file.type,
            name: file.name,
            size: file.size,
            timestamp: Date.now()
        };

        await new Promise<void>((resolve, reject) => {
            const request = store.put(record);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        console.log('📦 Arquivo armazenado localmente:', localId, file.name);
        return localId;
    } catch (error) {
        console.error('❌ Erro ao armazenar arquivo:', error);
        throw new Error('Falha ao armazenar arquivo localmente');
    }
}

/**
 * Retrieve a locally stored file by its ID
 */
export async function getLocalFile(localId: string): Promise<File | null> {
    try {
        const db = await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        const result = await new Promise<StoredFile | undefined>((resolve, reject) => {
            const request = store.get(localId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        return result?.file || null;
    } catch (error) {
        console.error('❌ Erro ao recuperar arquivo:', error);
        return null;
    }
}

/**
 * Delete a locally stored file
 */
export async function removeLocalFile(localId: string): Promise<void> {
    try {
        const db = await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        await new Promise<void>((resolve, reject) => {
            const request = store.delete(localId);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        console.log('🗑️ Arquivo local removido:', localId);
    } catch (error) {
        console.error('❌ Erro ao deletar arquivo:', error);
    }
}

/**
 * Get all pending files
 */
export async function getAllPendingFiles(): Promise<StoredFile[]> {
    try {
        const db = await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);

        const result = await new Promise<StoredFile[]>((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result as StoredFile[]);
            request.onerror = () => reject(request.error);
        });

        return result;
    } catch (error) {
        console.error('❌ Erro ao listar arquivos pendentes:', error);
        return [];
    }
}

/**
 * Check if a string is a local file ID
 */
export function isLocalFileId(id: string): boolean {
    return id.startsWith('local_');
}

/**
 * Clear all stored files
 */
export async function clearAllFiles(): Promise<void> {
    try {
        const db = await openDatabase();
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        await new Promise<void>((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        console.log('🗑️ Todos os arquivos locais removidos');
    } catch (error) {
        console.error('❌ Erro ao limpar arquivos:', error);
    }
}
