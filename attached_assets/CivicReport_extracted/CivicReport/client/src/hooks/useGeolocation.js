import { useCallback, useState } from 'react';

// Hook for browser geolocation
export const useGeolocation = () => {
    const [location, setLocation] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const getLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Geolocation is not supported by your browser');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                });
                setError(null);
                setLoading(false);
            },
            (error) => {
                setError(error.message);
                setLoading(false);
            }
        );
    }, []);

    return { location, error, loading, getLocation };
};
