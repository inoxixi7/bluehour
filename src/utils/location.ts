// 跨平台位置获取工具
import { Platform } from 'react-native';
import * as Location from 'expo-location';

export interface LocationCoords {
  latitude: number;
  longitude: number;
}

/**
 * 获取当前位置（兼容 Web 和移动端）
 */
export const getCurrentLocation = async (): Promise<LocationCoords> => {
  // 在 Web 环境使用浏览器的 Geolocation API
  if (Platform.OS === 'web') {
    return new Promise((resolve, reject) => {
      const nav = navigator as any;
      if (!nav.geolocation) {
        reject(new Error('浏览器不支持地理定位'));
        return;
      }

      console.log('🌐 使用浏览器 Geolocation API');
      
      nav.geolocation.getCurrentPosition(
        (position: any) => {
          console.log('✅ 浏览器位置获取成功:', position.coords);
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error: any) => {
          console.error('❌ 浏览器位置获取失败:', error);
          reject(new Error(`位置获取失败: ${error.message}`));
        },
        {
          timeout: 10000,
          maximumAge: 60000,
          enableHighAccuracy: false,
        }
      );
    });
  }

  // 移动端使用 expo-location
  console.log('📱 使用 expo-location');
  const { status } = await Location.requestForegroundPermissionsAsync();
  
  if (status !== 'granted') {
    throw new Error('位置权限未授予');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
  };
};
