const DB_NAME = 'MeusSitesDB';
const DB_VERSION = 1;

let db = null;

const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Erro ao abrir o IndexedDB:', event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      if (!database.objectStoreNames.contains('sites')) {
        const siteStore = database.createObjectStore('sites', { keyPath: 'id', autoIncrement: true });
        siteStore.createIndex('category', 'category', { unique: false });
        siteStore.createIndex('favorite', 'favorite', { unique: false });
      }

      if (!database.objectStoreNames.contains('categories')) {
        const catStore = database.createObjectStore('categories', { keyPath: 'id', autoIncrement: true });
        catStore.createIndex('name', 'name', { unique: true });
      }

      if (!database.objectStoreNames.contains('recent')) {
        database.createObjectStore('recent', { keyPath: 'id', autoIncrement: true });
      }

      // Popular categorias padrão
      const defaultCategories = [
        'Favoritos', 'Trabalho', 'Entretenimento', 'Redes sociais', 
        'Notícias', 'Compras', 'Estudos', 'Ferramentas', 'Outros'
      ];
      
      event.target.transaction.oncomplete = () => {
        const catTransaction = database.transaction('categories', 'readwrite');
        const catStore = catTransaction.objectStore('categories');
        defaultCategories.forEach(cat => catStore.add({ name: cat }));
      };
    };
  });
};

const dbOperations = {
  async getAll(storeName) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async add(storeName, item) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(item);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async update(storeName, item) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(item);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  async delete(storeName, id) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
};