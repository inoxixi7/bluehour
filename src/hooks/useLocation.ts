import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { LocationCoords } from '../types';

interface UseLocationResult {
  location: LocationCoords | null;
  loading: boolean;
  error: string | null;
  refreshLocation: () => Promise<void>;
}

export const useLocation = (): UseLocationResult => {
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLocation = async () => {
    try {
      setLoading(true);
      setError(null);

      // 请求位置权限
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('位置权限被拒绝');
      }

      // 获取当前位置，使用高精度模式
      const result = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 15000,    // 15秒超时
      });

      console.log('获取到的位置:', result.coords);

      setLocation({
        latitude: result.coords.latitude,
        longitude: result.coords.longitude,
      });
    } catch (err) {
      console.error('位置获取错误:', err);
      setError(err instanceof Error ? err.message : '获取位置失败');
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    await getLocation();
  };

  useEffect(() => {
    getLocation();
  }, []);

  return {
    location,
    loading,
    error,
    refreshLocation,
  };
};
