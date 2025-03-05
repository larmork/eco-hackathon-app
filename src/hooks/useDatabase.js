import { useState, useEffect, useCallback } from 'react';
import { getDB } from '../utils/db';

export function useDatabase() {
    const [pins, setPins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [initialized, setInitialized] = useState(false);

    const initialize = useCallback(async () => {
        try {
            const db = await getDB();
            setInitialized(true);
            return db;
        } catch (err) {
            console.error('Failed to initialize database:', err);
            setError('Failed to initialize database');
            return null;
        }
    }, []);

    const loadPins = useCallback(async () => {
        try {
            const db = await getDB();
            const allPins = await db.getAllPins();
            
            const formattedPins = allPins.map(pin => ({
                ...pin,
                lat: parseFloat(pin.lat),
                lng: parseFloat(pin.lng)
            }));

            setPins(formattedPins);
            setLoading(false);
            setError(null);
        } catch (err) {
            console.error('Error loading pins:', err);
            setPins([]);
            setLoading(false);
            setError('Failed to load pins');
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            const db = await initialize();
            if (db) {
                await loadPins();
            }
        };
        init();
    }, [initialize, loadPins]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                loadPins();
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [loadPins]);

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'pins') {
                loadPins();
            }
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [loadPins]);

    const addPin = async (pin) => {
        try {
            const db = await getDB();
            await db.addPin(pin);
            await loadPins();
            return true;
        } catch (err) {
            console.error('Error adding pin:', err);
            setError('Failed to add pin');
            return false;
        }
    };

    const updatePin = async (id, pin) => {
        try {
            const db = await getDB();
            await db.updatePin(id, pin);
            await loadPins();
            return true;
        } catch (err) {
            console.error('Error updating pin:', err);
            setError('Failed to update pin');
            return false;
        }
    };

    const deletePin = async (id) => {
        try {
            const db = await getDB();
            await db.deletePin(id);
            await loadPins();
            return true;
        } catch (err) {
            console.error('Error deleting pin:', err);
            setError('Failed to delete pin');
            return false;
        }
    };

    const getPinsByCategory = async (category) => {
        try {
            const db = await getDB();
            const categoryPins = await db.getPinsByCategory(category);
            return categoryPins;
        } catch (err) {
            console.error('Error getting pins by category:', err);
            setError('Failed to get pins by category');
            return [];
        }
    };

    const getPinsByStatus = async (status) => {
        try {
            const db = await getDB();
            const statusPins = await db.getPinsByStatus(status);
            return statusPins;
        } catch (err) {
            console.error('Error getting pins by status:', err);
            setError('Failed to get pins by status');
            return [];
        }
    };

    return {
        pins,
        loading,
        error,
        addPin,
        updatePin,
        deletePin,
        getPinsByCategory,
        getPinsByStatus,
        loadPins
    };
} 