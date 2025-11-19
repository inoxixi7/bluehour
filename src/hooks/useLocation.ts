import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';
import { reverseGeocode, getTimezone } from '../api/geocodingService';

export interface LocationData {
    latitude: number;
    longitude: number;
}

export interface TimezoneData {
    timezone: string;
    offset: number;
}

export const useLocation = (autoLoad: boolean = true) => {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [locationName, setLocationName] = useState<string>('');
    const [timezoneInfo, setTimezoneInfo] = useState<TimezoneData>({ timezone: '', offset: 0 });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateLocationData = useCallback(async (lat: number, lng: number, name?: string) => {
        try {
            setLoading(true);
            setError(null);

            setLocation({ latitude: lat, longitude: lng });

            // 1. Get Name if not provided
            let finalName = name;
            if (!finalName) {
                finalName = await reverseGeocode(lat, lng);
            }
            setLocationName(finalName || '');

            // 2. Get Timezone
            const tz = await getTimezone(lat, lng);
            setTimezoneInfo({ timezone: tz.timezone, offset: tz.offset });

        } catch (err: any) {
            setError(err.message || 'Failed to update location data');
            console.error('Error updating location:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const getCurrentLocation = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            console.log('🌍 Requesting location permission...');
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                console.log('⚠️ Location permission denied');
                setError('Permission to access location was denied');
                setLoading(false);
                return;
            }

            console.log('📍 Getting current position...');
            const loc = await Location.getCurrentPositionAsync({});
            const coords = {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
            };
            console.log('✅ Location obtained:', coords);

            await updateLocationData(coords.latitude, coords.longitude);
        } catch (err: any) {
            setError(err.message || 'Failed to get current location');
            console.error('Error getting current location:', err);
            setLoading(false);
        }
    }, [updateLocationData]);

    useEffect(() => {
        if (autoLoad) {
            getCurrentLocation();
        }
    }, [autoLoad, getCurrentLocation]);

    return {
        location,
        locationName,
        timezoneInfo,
        loading,
        error,
        getCurrentLocation,
        updateLocationData
    };
};
