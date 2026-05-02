// IndexedDB manager for local data storage
const DB_NAME = 'anidock_db';
// v2 introduces the `library` store for user-curated lists (watching, planned,
// paused, completed, dropped) plus tags, score and notes per anime.
const DB_VERSION = 2;

export interface Driver {
  id: string;
  name: string;
  domain: string;
  version: string;
  author?: string;
  config: {
    requiresExternalLink?: boolean;
    selectors: {
      animeList?: string;
      animeTitle: string;
      animeImage?: string;
      animeSynopsis?: string;
      animeUrl: string;
      animePageTitle?: string;
      episodeList: string;
      episodeNumber: string;
      episodeTitle?: string;
      episodeUrl: string;
      videoPlayer?: string;
      externalLinkSelector?: string;
    };
    pagination?: {
      nextButton?: string;
      pageParam?: string;
    };
    baseUrl: string;
  };
  catalogUrl?: string;
  sourceUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalAnime {
  id: string;
  driverId: string;
  title: string;
  alternativeTitles?: string[];
  synopsis?: string;
  coverUrl?: string;
  sourceUrl: string;
  metadata?: Record<string, any>;
  episodes: LocalEpisode[];
  createdAt: string;
  updatedAt: string;
}

export interface LocalEpisode {
  id: string;
  episodeNumber: number;
  title?: string;
  sourceUrl: string;
  thumbnailUrl?: string;
  watched?: boolean;
  watchedAt?: string;
}

export interface WatchHistoryEntry {
  id: string;
  animeTitle: string;
  animeCover?: string;
  animeSourceUrl: string;
  episodeNumber: number;
  episodeTitle?: string;
  episodeUrl: string;
  driverId?: string;
  watchedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnimeIndex {
  id: string;
  driverId: string;
  name: string;
  sourceUrl: string;
  totalAnimes: number;
  animes: LocalAnime[];
  createdAt: string;
  updatedAt: string;
}

// User-curated library entry for one anime. The id is composed as
// `${driverId}:${animeSourceUrl}` so that re-indexing the catalog (which
// regenerates LocalAnime UUIDs) does not orphan the entry.
export type LibraryStatus =
  | 'watching'
  | 'planned'
  | 'paused'
  | 'completed'
  | 'dropped';

export interface LibraryEntry {
  id: string;
  driverId: string;
  animeSourceUrl: string;
  animeTitle: string;
  animeCover?: string;
  status: LibraryStatus;
  tags: string[];
  score?: number;
  notes?: string;
  addedAt: string;
  updatedAt: string;
}

export const LIBRARY_STATUSES: LibraryStatus[] = [
  'watching',
  'planned',
  'paused',
  'completed',
  'dropped',
];

export function buildLibraryEntryId(driverId: string, animeSourceUrl: string): string {
  return `${driverId}:${animeSourceUrl}`;
}

class IndexedDBManager {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('drivers')) {
          db.createObjectStore('drivers', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('indexes')) {
          const indexStore = db.createObjectStore('indexes', { keyPath: 'id' });
          indexStore.createIndex('driverId', 'driverId', { unique: false });
        }

        if (!db.objectStoreNames.contains('watchHistory')) {
          const historyStore = db.createObjectStore('watchHistory', { keyPath: 'id' });
          historyStore.createIndex('watchedAt', 'watchedAt', { unique: false });
          historyStore.createIndex('animeSourceUrl', 'animeSourceUrl', { unique: false });
        }

        if (!db.objectStoreNames.contains('library')) {
          const libraryStore = db.createObjectStore('library', { keyPath: 'id' });
          libraryStore.createIndex('status', 'status', { unique: false });
          libraryStore.createIndex('driverId', 'driverId', { unique: false });
          libraryStore.createIndex('animeSourceUrl', 'animeSourceUrl', { unique: false });
        }
      };
    });
  }

  private ensureDB(): IDBDatabase {
    if (!this.db) throw new Error('Database not initialized');
    return this.db;
  }

  // Driver operations
  async saveDriver(driver: Driver): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['drivers'], 'readwrite');
      const store = transaction.objectStore('drivers');
      const request = store.put(driver);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getDriver(id: string): Promise<Driver | undefined> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['drivers'], 'readonly');
      const store = transaction.objectStore('drivers');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllDrivers(): Promise<Driver[]> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['drivers'], 'readonly');
      const store = transaction.objectStore('drivers');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteDriver(id: string): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['drivers'], 'readwrite');
      const store = transaction.objectStore('drivers');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Index operations
  async saveIndex(index: AnimeIndex): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['indexes'], 'readwrite');
      const store = transaction.objectStore('indexes');
      const request = store.put(index);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getIndex(id: string): Promise<AnimeIndex | undefined> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['indexes'], 'readonly');
      const store = transaction.objectStore('indexes');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getIndexesByDriver(driverId: string): Promise<AnimeIndex[]> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['indexes'], 'readonly');
      const store = transaction.objectStore('indexes');
      const index = store.index('driverId');
      const request = index.getAll(driverId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllIndexes(): Promise<AnimeIndex[]> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['indexes'], 'readonly');
      const store = transaction.objectStore('indexes');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteIndex(id: string): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['indexes'], 'readwrite');
      const store = transaction.objectStore('indexes');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Watch history operations
  async saveWatchHistory(entry: WatchHistoryEntry): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['watchHistory'], 'readwrite');
      const store = transaction.objectStore('watchHistory');
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getWatchHistory(): Promise<WatchHistoryEntry[]> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['watchHistory'], 'readonly');
      const store = transaction.objectStore('watchHistory');
      const index = store.index('watchedAt');
      const request = index.openCursor(null, 'prev');
      const results: WatchHistoryEntry[] = [];

      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getLastWatchedEpisode(animeSourceUrl: string): Promise<WatchHistoryEntry | undefined> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['watchHistory'], 'readonly');
      const store = transaction.objectStore('watchHistory');
      const index = store.index('animeSourceUrl');
      const request = index.openCursor(IDBKeyRange.only(animeSourceUrl), 'prev');

      request.onsuccess = () => {
        const cursor = request.result;
        resolve(cursor ? cursor.value : undefined);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async deleteWatchHistoryEntry(id: string): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['watchHistory'], 'readwrite');
      const store = transaction.objectStore('watchHistory');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async clearAllData(): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        ['drivers', 'indexes', 'watchHistory', 'library'],
        'readwrite',
      );

      transaction.objectStore('drivers').clear();
      transaction.objectStore('indexes').clear();
      transaction.objectStore('watchHistory').clear();
      transaction.objectStore('library').clear();

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  // Library operations

  async saveLibraryEntry(entry: LibraryEntry): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['library'], 'readwrite');
      const store = transaction.objectStore('library');
      const request = store.put(entry);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getLibraryEntry(id: string): Promise<LibraryEntry | undefined> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['library'], 'readonly');
      const store = transaction.objectStore('library');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllLibraryEntries(): Promise<LibraryEntry[]> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['library'], 'readonly');
      const store = transaction.objectStore('library');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getLibraryEntriesByStatus(status: LibraryStatus): Promise<LibraryEntry[]> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['library'], 'readonly');
      const store = transaction.objectStore('library');
      const index = store.index('status');
      const request = index.getAll(status);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteLibraryEntry(id: string): Promise<void> {
    const db = this.ensureDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['library'], 'readwrite');
      const store = transaction.objectStore('library');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Export/Import operations
  async exportAllData(): Promise<{
    drivers: Driver[];
    indexes: AnimeIndex[];
    watchHistory: WatchHistoryEntry[];
    library: LibraryEntry[];
    exportDate: string;
    version: string;
  }> {
    const [drivers, indexes, watchHistory, library] = await Promise.all([
      this.getAllDrivers(),
      this.getAllIndexes(),
      this.getWatchHistory(),
      this.getAllLibraryEntries(),
    ]);

    return {
      drivers,
      indexes,
      watchHistory,
      library,
      exportDate: new Date().toISOString(),
      version: '2.0',
    };
  }

  async importAllData(data: {
    drivers?: Driver[];
    indexes?: AnimeIndex[];
    watchHistory?: WatchHistoryEntry[];
    library?: LibraryEntry[];
  }): Promise<void> {
    const db = this.ensureDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(
        ['drivers', 'indexes', 'watchHistory', 'library'],
        'readwrite',
      );

      // Import drivers
      if (data.drivers) {
        const driverStore = transaction.objectStore('drivers');
        data.drivers.forEach(driver => driverStore.put(driver));
      }

      // Import indexes
      if (data.indexes) {
        const indexStore = transaction.objectStore('indexes');
        data.indexes.forEach(index => indexStore.put(index));
      }

      // Import watch history
      if (data.watchHistory) {
        const historyStore = transaction.objectStore('watchHistory');
        data.watchHistory.forEach(entry => historyStore.put(entry));
      }

      // Import library entries (v2 backups). Older v1 backups simply omit
      // this field, which is fine — the existing entries are kept.
      if (data.library) {
        const libraryStore = transaction.objectStore('library');
        data.library.forEach(entry => libraryStore.put(entry));
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }
}

export const db = new IndexedDBManager();
