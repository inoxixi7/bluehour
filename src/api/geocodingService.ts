// 地理编码服务 - 支持多语言地点搜索

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
 * @returns Promise<GeocodingResult[]>
 */
export const searchLocation = async (
  query: string,
  limit: number = 5
): Promise<GeocodingResult[]> => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const params = new URLSearchParams({
      q: query.trim(),
      format: 'json',
      limit: limit.toString(),
      'accept-language': 'zh-CN,en,ja,de', // 支持中文、英文、日文、德文
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
 * @returns Promise<string> 地址名称
 */
export const reverseGeocode = async (
  latitude: number,
  longitude: number
): Promise<string> => {
  try {
    const params = new URLSearchParams({
      lat: latitude.toString(),
      lon: longitude.toString(),
      format: 'json',
      'accept-language': 'zh-CN',
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
    let timezone = 'UTC';

    // 统一使用 timeapi.io 获取准确的时区（跨平台兼容）
    console.log('🌐 查询时区:', latitude, longitude);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5秒超时
      
      const response = await fetch(
        `https://timeapi.io/api/TimeZone/coordinate?latitude=${latitude}&longitude=${longitude}`,
        { signal: controller.signal }
      );
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.timeZone) {
          timezone = data.timeZone;
          console.log('✅ 从 timeapi.io 获取时区:', timezone);
        }
      }
    } catch (error) {
      console.warn('⚠️ timeapi.io 请求失败，使用设备时区作为降级:', error);
      // 降级到设备本地时区
      timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    }

    // 使用 Intl API 获取准确的时区偏移量（分钟）
    const now = new Date();
    let offset = 0;

    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
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
          offset = sign * (hours * 60 + minutes);
        }
      }

      // 如果解析失败，使用降级方案
      if (!offset) {
        offset = -now.getTimezoneOffset();
      }
    } catch (error) {
      console.error('计算时区偏移量失败:', error);
      offset = -now.getTimezoneOffset();
    }

    return {
      timezone,
      offset,
    };
  } catch (error) {
    console.error('❌ Error getting timezone:', error);
    return {
      timezone: 'UTC',
      offset: 0,
    };
  }
};
