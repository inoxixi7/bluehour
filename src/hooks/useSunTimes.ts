import { useState, useCallback } from 'react';
import { getSunTimes } from '../api/sunTimeService';
import { ProcessedSunTimes } from '../types/api';

export const useSunTimes = () => {
    const [sunTimes, setSunTimes] = useState<ProcessedSunTimes | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSunTimes = useCallback(async (lat: number, lng: number, date: Date, timezone?: string) => {
        try {
            setLoading(true);
            setError(null);

            let dateStr: string;
            if (timezone) {
                // Use target timezone to format date
                const formatter = new Intl.DateTimeFormat('en-CA', {
                    timeZone: timezone,
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
                dateStr = formatter.format(date); // Format: YYYY-MM-DD
            } else {
                // Fallback to local timezone
                dateStr = date.toISOString().split('T')[0];
            }

            console.log('📅 Fetching sun times for date:', dateStr);

            const data = await getSunTimes(lat, lng, dateStr);
            setSunTimes(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch sun times');
            console.error('Error fetching sun times:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        sunTimes,
        loading,
        error,
        fetchSunTimes
    };
};
