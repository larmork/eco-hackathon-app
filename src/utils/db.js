// Database configuration
const DB_NAME = 'eco_hackathon_db';
const DB_VERSION = 1;
const STORE_NAME = 'pins';

// Initialize database
export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            reject(event.target.error);
        };

        request.onsuccess = (event) => {
            const db = event.target.result;
            console.log('Database opened successfully');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                store.createIndex('lat', 'lat', { unique: false });
                store.createIndex('lng', 'lng', { unique: false });
                store.createIndex('category', 'category', { unique: false });
                store.createIndex('status', 'status', { unique: false });
                console.log('Database schema initialized');
            }
        };
    });
};

// CRUD Operations
export const dbOperations = {
    async getDB() {
        return await initDB();
    },

    async getAllPins() {
        try {
            const db = await this.getDB();
            return new Promise((resolve, reject) => {
                const transaction = db.transaction([STORE_NAME], 'readonly');
                const store = transaction.objectStore(STORE_NAME);
                const request = store.getAll();

                request.onsuccess = () => {
                    const pins = request.result.map(pin => ({
                        ...pin,
                        lat: Number(pin.lat),
                        lng: Number(pin.lng)
                    }));
                    console.log('Retrieved pins:', pins);
                    resolve(pins);
                };

                request.onerror = () => {
                    console.error('Error getting pins:', request.error);
                    reject(request.error);
                };
            });
        } catch (error) {
            console.error('Error in getAllPins:', error);
            return [];
        }
    },

    async addPin(pinData) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            const pin = {
                ...pinData,
                lat: Number(pinData.lat),
                lng: Number(pinData.lng),
                created: new Date().toISOString(),
                history: []
            };
            
            const request = store.add(pin);
            
            request.onsuccess = () => {
                const newPinId = request.result;
                console.log('Pin added with ID:', newPinId);
                resolve(newPinId);
            };

            request.onerror = () => {
                console.error('Error adding pin:', request.error);
                reject(request.error);
            };
        });
    },

    async updatePin(id, pinData) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            const updatedPin = {
                ...pinData,
                id: id,
                lat: Number(pinData.lat),
                lng: Number(pinData.lng)
            };
            
            const request = store.put(updatedPin);
            
            request.onsuccess = () => {
                console.log('Pin updated successfully');
                resolve();
            };
            
            request.onerror = () => {
                console.error('Error updating pin:', request.error);
                reject(request.error);
            };
        });
    },

    async deletePin(id) {
        const db = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);
            
            request.onsuccess = () => {
                console.log('Pin deleted successfully');
                resolve();
            };
            
            request.onerror = () => {
                console.error('Error deleting pin:', request.error);
                reject(request.error);
            };
        });
    },

    // Get a single pin by id
    async getPinById(id) {
        const database = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);
            
            request.onsuccess = () => {
                if (request.result) {
                    const pin = {
                        ...request.result,
                        lat: Number(request.result.lat),
                        lng: Number(request.result.lng),
                        history: request.result.history || []
                    };
                    resolve(pin);
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => {
                console.error('Error getting pin:', request.error);
                reject(request.error);
            };

            transaction.oncomplete = () => {
                console.log('Get pin by id transaction completed');
            };
        });
    },

    // Get pins by category
    async getPinsByCategory(category) {
        const database = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('category');
            const request = index.getAll(category);
            
            request.onsuccess = () => {
                const pins = request.result.map(pin => ({
                    ...pin,
                    lat: Number(pin.lat),
                    lng: Number(pin.lng),
                    history: pin.history || []
                }));
                resolve(pins);
            };

            request.onerror = () => {
                console.error('Error getting pins by category:', request.error);
                reject(request.error);
            };

            transaction.oncomplete = () => {
                console.log('Get pins by category transaction completed');
            };
        });
    },

    // Get pins by status
    async getPinsByStatus(status) {
        const database = await this.getDB();
        return new Promise((resolve, reject) => {
            const transaction = database.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const index = store.index('status');
            const request = index.getAll(status);
            
            request.onsuccess = () => {
                const pins = request.result.map(pin => ({
                    ...pin,
                    lat: Number(pin.lat),
                    lng: Number(pin.lng),
                    history: pin.history || []
                }));
                resolve(pins);
            };

            request.onerror = () => {
                console.error('Error getting pins by status:', request.error);
                reject(request.error);
            };

            transaction.oncomplete = () => {
                console.log('Get pins by status transaction completed');
            };
        });
    }
}; 