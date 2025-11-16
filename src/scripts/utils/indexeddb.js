const DB_NAME = "StoryMapsDB";
const DB_VERSION = 1;
const STORE_NAME = "stories";
const SYNC_STORE_NAME = "syncQueue";

class IndexedDBService {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // Create stories store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const storyStore = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
          });
          storyStore.createIndex("createdAt", "createdAt", { unique: false });
          storyStore.createIndex("name", "name", { unique: false });
        }

        // Create sync queue store
        if (!db.objectStoreNames.contains(SYNC_STORE_NAME)) {
          const syncStore = db.createObjectStore(SYNC_STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          syncStore.createIndex("type", "type", { unique: false });
          syncStore.createIndex("status", "status", { unique: false });
        }
      };
    });
  }

  // CREATE - Save story to IndexedDB
  async saveStory(story) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put({
        ...story,
        synced: true,
        savedAt: new Date().toISOString(),
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // READ - Get all stories from IndexedDB
  async getAllStories() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // READ - Get story by ID
  async getStoryById(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // READ - Search stories by description
  async searchStories(query) {
    if (!this.db) await this.init();

    const allStories = await this.getAllStories();
    const lowerQuery = query.toLowerCase();

    return allStories.filter(
      (story) =>
        (story.description || "").toLowerCase().includes(lowerQuery) ||
        (story.name || "").toLowerCase().includes(lowerQuery)
    );
  }

  // READ - Sort stories
  async getStoriesSorted(sortBy = "createdAt", order = "desc") {
    if (!this.db) await this.init();

    const allStories = await this.getAllStories();

    return allStories.sort((a, b) => {
      const aVal = a[sortBy] || "";
      const bVal = b[sortBy] || "";

      if (order === "desc") {
        return bVal > aVal ? 1 : -1;
      } else {
        return aVal > bVal ? 1 : -1;
      }
    });
  }

  // DELETE - Remove story from IndexedDB
  async deleteStory(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // SYNC - Add to sync queue
  async addToSyncQueue(storyData, type = "add") {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SYNC_STORE_NAME], "readwrite");
      const store = transaction.objectStore(SYNC_STORE_NAME);
      const request = store.add({
        type,
        data: storyData,
        status: "pending",
        createdAt: new Date().toISOString(),
      });

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // SYNC - Get pending sync items
  async getPendingSyncItems() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SYNC_STORE_NAME], "readonly");
      const store = transaction.objectStore(SYNC_STORE_NAME);
      const index = store.index("status");
      const request = index.getAll("pending");

      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  }

  // SYNC - Update sync item status
  async updateSyncItemStatus(id, status) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SYNC_STORE_NAME], "readwrite");
      const store = transaction.objectStore(SYNC_STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const item = getRequest.result;
        if (item) {
          item.status = status;
          const updateRequest = store.put(item);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  // SYNC - Remove sync item
  async removeSyncItem(id) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SYNC_STORE_NAME], "readwrite");
      const store = transaction.objectStore(SYNC_STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // SYNC - Clear all stories
  async clearAllStories() {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

export default new IndexedDBService();
