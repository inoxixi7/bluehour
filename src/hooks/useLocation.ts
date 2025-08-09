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

      // 检查系统定位服务是否开启
      const servicesEnabled = await Location.hasServicesEnabledAsync();
      if (!servicesEnabled) {
        throw new Error('定位服务未开启');
      }

      // 请求权限
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        throw new Error('位置权限被拒绝');
      }

      const TIMEOUT_MS = 10000; // 主请求超时 10s

      const withTimeout = async <T,>(p: Promise<T>, ms: number, tag: string): Promise<T> => {
        return new Promise<T>((resolve, reject) => {
          const to = setTimeout(() => {
            reject(new Error(`${tag} 超时 (${ms}ms)`));
          }, ms);
          p.then(v => { clearTimeout(to); resolve(v); })
           .catch(e => { clearTimeout(to); reject(e); });
        });
      };

      // 第一步：高精度尝试（有超时）
      let position: Location.LocationObject | null = null;
      try {
        position = await withTimeout(
          Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
          TIMEOUT_MS,
          '高精度定位'
        );
      } catch (highErr) {
        console.warn('高精度定位失败，尝试降级:', highErr);
      }

      // 第二步：若失败，低精度快速获取
      if (!position) {
        try {
          position = await withTimeout(
            Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
            6000,
            '低精度定位'
          );
        } catch (lowErr) {
          console.warn('低精度定位失败，尝试使用最后已知位置:', lowErr);
        }
      }

      // 第三步：最后已知位置回退
      if (!position) {
        try {
          const last = await Location.getLastKnownPositionAsync();
          if (last) {
            position = last;
            console.log('使用最后已知位置');
          }
        } catch (lastErr) {
          console.warn('获取最后已知位置失败:', lastErr);
        }
      }

      if (!position) {
        throw new Error('无法获取当前位置');
      }

      console.log('最终获取到的位置:', position.coords);
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
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
