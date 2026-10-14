// 地理编码服务 - 支持多语言地点搜索

import { debugLog } from '../utils/logger';

export interface GeocodingResult {
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  type: string;
  importance: number;
  timezone?: string;
  timezoneOffset?: number; // UTC 偏移量（分钟）
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * 搜索地点（支持多语言）
 * @param query 搜索关键词（可以是任何语言）
 * @param limit 返回结果数量限制
 * @param userLanguage 用户当前使用的语言代码 (zh/en/ja/de)
 * @returns Promise<GeocodingResult[]>
 */
export const searchLocation = async (
  query: string,
  limit: number = 5,
  userLanguage: string = 'en'
): Promise<GeocodingResult[]> => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    // 根据用户语言构建优先级语言列表
    const languageMap: { [key: string]: string } = {
      zh: 'zh-CN,zh,en,ja,de',
      en: 'en,zh-CN,ja,de',
      ja: 'ja,en,zh-CN,de',
      de: 'de,en,zh-CN,ja',
    };
    
    const acceptLanguage = languageMap[userLanguage] || languageMap['en'];

    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      limit: limit.toString(),
      'accept-language': acceptLanguage,
      addressdetails: '1',
    });

    const url = `${NOMINATIM_BASE_URL}/search?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BlueHourPhotoApp/1.0', // Nominatim 要求设置 User-Agent
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const data = await response.json();

    // 转换为我们的格式
    const results: GeocodingResult[] = data.map((item: any) => ({
      name: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      type: item.type || 'unknown',
      importance: item.importance || 0,
    }));

    return results;
  } catch (error) {
    console.error('❌ Error searching location:', error);
    throw error;
  }
};

/**
 * 反向地理编码 - 根据坐标获取地址
 * @param latitude 纬度
 * @param longitude 经度
 * @param userLanguage 用户当前使用的语言代码 (zh/en/ja/de)
 * @returns Promise<string> 地址名称
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number,
  userLanguage: string = 'en'
): Promise<string> => {
  try {
    // 根据用户语言构建语言参数
    const languageMap: { [key: string]: string } = {
      zh: 'zh-CN,zh',
      en: 'en',
      ja: 'ja',
      de: 'de',
    };
    
    const acceptLanguage = languageMap[userLanguage] || 'en';

    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      format: 'json',
      'accept-language': acceptLanguage,
      addressdetails: '1',
    });

    const url = `${NOMINATIM_BASE_URL}/reverse?${params.toString()}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'BlueHourPhotoApp/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Reverse geocoding failed: ${response.status}`);
    }

    const data = await response.json();
    return data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  } catch (error) {
    console.error('❌ Error in reverse geocoding:', error);
    return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  }
};

/**
 * 根据坐标获取时区信息（使用 geo-tz 离线库）
 * @param latitude 纬度
 * @param longitude 经度
 * @returns {timezone: string, offset: number} 时区名称和UTC偏移量（分钟）
 */
export const getTimezone = async (
  latitude: number,
  longitude: number
): Promise<{ timezone: string; offset: number }> => {
  try {
    // 1. 优先尝试 Open-Meteo API (稳定、免费、无需key)
    try {
      debugLog('🌐 查询时区 (Open-Meteo):', latitude, longitude);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=auto`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.timezone) {
          debugLog('✅ 从 Open-Meteo 获取时区:', data.timezone);
          return {
            timezone: data.timezone,
            offset: data.utc_offset_seconds / 60 // 秒 -> 分钟
          };
        }
      }
    } catch (e) {
      console.warn('⚠️ Open-Meteo 请求失败，尝试备选方案:', e);
    }

    // 2. 备选: timeapi.io
    try {
      debugLog('🌐 查询时区 (timeapi.io):', latitude, longitude);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `https://timeapi.io/api/TimeZone/coordinate?latitude=${latitude}&longitude=${longitude}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.timeZone) {
          debugLog('✅ 从 timeapi.io 获取时区:', data.timeZone);
          // timeapi.io 不直接返回 offset 分钟数，需要计算或再次请求，这里我们只拿 timezone ID
          // 下面会统一计算 offset
          return {
            timezone: data.timeZone,
            offset: calculateOffset(data.timeZone)
          };
        }
      }
    } catch (error) {
      console.warn('⚠️ timeapi.io 请求失败:', error);
    }

    // 3. 降级方案: 使用设备本地时区
    console.warn('⚠️ 所有时区 API 请求失败，使用设备时区作为降级');
    const deviceTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    return {
      timezone: deviceTimezone,
      offset: calculateOffset(deviceTimezone)
    };

  } catch (error) {
    console.error('❌ Error getting timezone:', error);
    return {
      timezone: 'UTC',
      offset: 0,
    };
  }
};

/**
 * 根据时区 ID 计算当前 UTC 偏移量（分钟）
 */
const calculateOffset = (timezone: string): number => {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'longOffset'
    });

    const parts = formatter.formatToParts(now);
    const timeZoneNamePart = parts.find(part => part.type === 'timeZoneName');

    if (timeZoneNamePart && timeZoneNamePart.value) {
      const match = timeZoneNamePart.value.match(/GMT([+-])(\d{2}):(\d{2})/);
      if (match) {
        const sign = match[1] === '+' ? 1 : -1;
        const hours = parseInt(match[2], 10);
        const minutes = parseInt(match[3], 10);
        return sign * (hours * 60 + minutes);
      }
    }
    return -now.getTimezoneOffset();
  } catch (e) {
    return 0;
  }
};
