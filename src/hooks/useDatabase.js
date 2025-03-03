import { useState, useEffect, useCallback, useRef } from 'react';
import { dbOperations, initDB } from '../utils/db';

export const useDatabase = () => {
    const [pins, setPins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const initialized = useRef(false);

    // Initialize database
    const initialize = useCallback(async () => {
        if (initialized.current) return;
        try {
            await initDB();
            initialized.current = true;
            console.log('Database initialized');
        } catch (err) {
            console.error('Failed to initialize database:', err);
            setError('Failed to initialize database');
        }
    }, []);

    // Load all pins
    const loadPins = useCallback(async () => {
        if (!initialized.current) {
            await initialize();
        }
        try {
            setLoading(true);
            setError(null);
            console.log('Loading pins from database...');
            const allPins = await dbOperations.getAllPins();
            console.log('Loaded pins:', allPins);
            if (Array.isArray(allPins)) {
                // Ensure all coordinates are numbers
                const formattedPins = allPins.map(pin => ({
                    ...pin,
                    lat: parseFloat(pin.lat),
                    lng: parseFloat(pin.lng)
                }));
                setPins(formattedPins);
                console.log('Formatted pins:', formattedPins);
            } else {
                console.warn('No pins found or invalid data format');
                setPins([]);
            }
        } catch (err) {
            console.error('Error loading pins:', err);
            setError(err.message);
            setPins([]);
        } finally {
            setLoading(false);
        }
    }, [initialize]);

    // Initialize database and load pins on mount
    useEffect(() => {
        const init = async () => {
            await initialize();
            await loadPins();
        };
        init();

        // Reload pins when the page becomes visible
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('Page became visible, reloading pins...');
                loadPins();
            }
        };

        // Reload pins when storage changes (for cross-tab synchronization)
        const handleStorageChange = (event) => {
            if (event.key === 'pinsUpdated') {
                console.log('Storage changed, reloading pins...');
                loadPins();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('storage', handleStorageChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [initialize, loadPins]);

    // Add a new pin
    const addPin = async (pinData) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Adding new pin:', pinData);
            const newPinId = await dbOperations.addPin(pinData);
            const newPin = { ...pinData, id: newPinId };
            setPins(currentPins => [...currentPins, newPin]);
            console.log('Pin added successfully with ID:', newPinId);
            return newPinId;
        } catch (err) {
            console.error('Error adding pin:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Update an existing pin
    const updatePin = async (id, pinData) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Updating pin:', id, pinData);
            await dbOperations.updatePin(id, pinData);
            setPins(currentPins => 
                currentPins.map(pin => 
                    pin.id === id ? { ...pinData, id } : pin
                )
            );
            console.log('Pin updated successfully');
        } catch (err) {
            console.error('Error updating pin:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Delete a pin
    const deletePin = async (id) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Deleting pin:', id);
            await dbOperations.deletePin(id);
            setPins(currentPins => currentPins.filter(pin => pin.id !== id));
            console.log('Pin deleted successfully');
        } catch (err) {
            console.error('Error deleting pin:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get pins by category
    const getPinsByCategory = async (category) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Getting pins by category:', category);
            const categoryPins = await dbOperations.getPinsByCategory(category);
            setPins(categoryPins || []);
            console.log('Retrieved pins by category:', categoryPins);
        } catch (err) {
            console.error('Error getting pins by category:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Get pins by status
    const getPinsByStatus = async (status) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Getting pins by status:', status);
            const statusPins = await dbOperations.getPinsByStatus(status);
            setPins(statusPins || []);
            console.log('Retrieved pins by status:', statusPins);
        } catch (err) {
            console.error('Error getting pins by status:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        pins,
        loading,
        error,
        addPin,
        updatePin,
        deletePin,
        loadPins,
        getPinsByCategory,
        getPinsByStatus
    };
}; 