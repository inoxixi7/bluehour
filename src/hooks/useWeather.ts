import { useEffect, useState } from 'react';
import { getCurrentWeather, WeatherData } from '../api/weatherService';
import { LocationData } from '../types';

/**
 * 获取指定位置的当前天气；位置变化时自动重新获取
 */
export const useWeather = (location: LocationData | null) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!location) return;

    // 位置快速切换时，丢弃旧请求的结果
    let cancelled = false;
    setLoading(true);
    setFailed(false);

    getCurrentWeather(location.latitude, location.longitude)
      .then(data => {
        if (!cancelled) setWeather(data);
      })
      .catch(error => {
        console.error('Failed to fetch weather:', error);
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [location]);

  return { weather, loading, failed };
};
