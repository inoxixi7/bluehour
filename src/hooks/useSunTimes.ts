import { useState, useCallback } from 'react';
import { getSunTimes } from '../api/sunTimeService';
import { ProcessedSunTimes } from '../types/api';
import { formatDateKey } from '../utils/timezone';

export const useSunTimes = () => {
  const [sunTimes, setSunTimes] = useState<ProcessedSunTimes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSunTimes = useCallback(
    async (lat: number, lng: number, date: Date, timezone?: string) => {
      try {
        setLoading(true);
        setError(null);

        const dateStr = formatDateKey(date, timezone);

        console.log('📅 Fetching sun times for date:', dateStr);

        const data = await getSunTimes(lat, lng, dateStr);
        setSunTimes(data);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch sun times');
        console.error('Error fetching sun times:', err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    sunTimes,
    loading,
    error,
    fetchSunTimes,
  };
};
