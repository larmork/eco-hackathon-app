import Dexie from 'dexie';

const db = new Dexie('eco_map_db');

db.version(1).stores({
  pins: '++id, lat, lng, title, description, category, size, status, created, updatedAt, history'
});

let dbInstance = null;

export async function getDB() {
  if (!dbInstance) {
    try {
      await db.open();
      dbInstance = {
        getAllPins: async () => {
          return await db.pins.toArray();
        },

        addPin: async (pin) => {
          return await db.pins.add(pin);
        },

        updatePin: async (id, pin) => {
          return await db.pins.update(id, pin);
        },

        deletePin: async (id) => {
          return await db.pins.delete(id);
        },

        getPinById: async (id) => {
          return await db.pins.get(id);
        },

        getPinsByCategory: async (category) => {
          return await db.pins.where('category').equals(category).toArray();
        },

        getPinsByStatus: async (status) => {
          return await db.pins.where('status').equals(status).toArray();
        }
      };
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }
  return dbInstance;
} 