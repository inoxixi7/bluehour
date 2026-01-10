// sunrise-sunset.org API 服务封装

import { SunTimesResponse, SunTimesRequest, ProcessedSunTimes } from '../types/api';
import { fetchWithRetry, fetchWithCache, generateCacheKey, isNetworkError } from '../utils/apiHelpers';

const BASE_URL = 'https://api.sunrise-sunset.org/json';
const CACHE_PREFIX = 'suntimes';
const CACHE_TTL = 6 * 60 * 60 * 1000; // 6小时（日出日落时间变化缓慢）

/**
 * 获取日出日落时间（内部函数，不带缓存）
 * @param lat 纬度
 * @param lng 经度
 * @param date 日期（可选，格式：YYYY-MM-DD）
 * @returns Promise<SunTimesResponse>
 */
const fetchSunTimesRaw = async (
  lat: number,
  lng: number,
  date?: string
): Promise<SunTimesResponse> => {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lng: lng.toString(),
    formatted: '0', // 返回 ISO 8601 格式
  });

  if (date) {
    params.append('date', date);
  }

  const url = `${BASE_URL}?${params.toString()}`;
  
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data: SunTimesResponse = await response.json();

  if (data.status !== 'OK') {
    throw new Error(`API returned error status: ${data.status}`);
  }

  return data;
};

/**
 * 处理 API 返回的数据，计算黄金时刻和蓝色时刻
 * @param response API 响应
 * @returns 处理后的太阳时间数据
 */
export const processSunTimes = (response: SunTimesResponse): ProcessedSunTimes => {
  const { results } = response;

  // 直接解析 ISO 8601 时间字符串为 Date 对象，不做任何转换
  const sunrise = new Date(results.sunrise);
  const sunset = new Date(results.sunset);
  const solarNoon = new Date(results.solar_noon);
  const civilTwilightBegin = new Date(results.civil_twilight_begin);
  const civilTwilightEnd = new Date(results.civil_twilight_end);
  const nauticalTwilightBegin = new Date(results.nautical_twilight_begin);
  const nauticalTwilightEnd = new Date(results.nautical_twilight_end);
  const astronomicalTwilightBegin = new Date(results.astronomical_twilight_begin);
  const astronomicalTwilightEnd = new Date(results.astronomical_twilight_end);

  // 计算黄金时刻（Golden Hour）
  // 黄金时刻发生在太阳高度角低于6度时
  // 早晨黄金时刻：日出前约1小时到日出后约1小时
  const morningGoldenHourStart = new Date(sunrise.getTime() - 60 * 60 * 1000); // 日出前1小时
  const morningGoldenHourEnd = new Date(sunrise.getTime() + 60 * 60 * 1000);   // 日出后1小时

  // 傍晚黄金时刻：日落前1小时到日落后约1小时
  const eveningGoldenHourStart = new Date(sunset.getTime() - 60 * 60 * 1000);  // 日落前1小时
  const eveningGoldenHourEnd = new Date(sunset.getTime() + 60 * 60 * 1000);    // 日落后1小时

  // 计算蓝色时刻（Blue Hour）
  // 蓝色时刻发生在太阳在地平线下4-8度时（民用和航海晨昏蒙影之间）
  // 早晨蓝色时刻：航海晨昏蒙影结束到民用晨昏蒙影结束之间
  const morningBlueHourStart = new Date(nauticalTwilightBegin.getTime());
  const morningBlueHourEnd = new Date(civilTwilightBegin.getTime());

  // 傍晚蓝色时刻：民用晨昏蒙影结束到航海晨昏蒙影结束之间
  const eveningBlueHourStart = new Date(civilTwilightEnd.getTime());
  const eveningBlueHourEnd = new Date(nauticalTwilightEnd.getTime());

  // 计算白昼长度（分钟）
  // API 可能返回字符串 "HH:MM:SS" 或数字（秒数）
  console.log('📊 day_length type:', typeof results.day_length, 'value:', results.day_length);
  let dayLength: number;
  if (typeof results.day_length === 'string') {
    const [hours, minutes, seconds] = results.day_length.split(':').map(Number);
    dayLength = hours * 60 + minutes + seconds / 60;
  } else {
    // 如果是数字，假设单位是秒，转换为分钟
    dayLength = results.day_length / 60;
  }
  console.log('⏱️  Calculated day length (minutes):', dayLength);

  return {
    sunrise,
    sunset,
    solarNoon,
    civilTwilightBegin,
    civilTwilightEnd,
    nauticalTwilightBegin,
    nauticalTwilightEnd,
    astronomicalTwilightBegin,
    astronomicalTwilightEnd,
    morningGoldenHourStart,
    morningGoldenHourEnd,
    morningBlueHourStart,
    morningBlueHourEnd,
    eveningGoldenHourStart,
    eveningGoldenHourEnd,
    eveningBlueHourStart,
    eveningBlueHourEnd,
    dayLength,
  };
};

/**
 * 获取并处理太阳时间数据（带缓存和重试）
 * @param lat 纬度
 * @param lng 经度
 * @param date 日期（可选，格式：YYYY-MM-DD）
 * @param forceRefresh 强制刷新缓存
 * @returns Promise<ProcessedSunTimes>
 */
export const getSunTimes = async (
  lat: number,
  lng: number,
  date?: string,
  forceRefresh: boolean = false
): Promise<ProcessedSunTimes> => {
  // 生成缓存键
  const cacheKey = generateCacheKey(CACHE_PREFIX, {
    lat: lat.toFixed(4),
    lng: lng.toFixed(4),
    date: date || 'today',
  });

  try {
    // 使用缓存包装的重试机制
    const response = await fetchWithCache(
      cacheKey,
      () => fetchWithRetry(() => fetchSunTimesRaw(lat, lng, date)),
      CACHE_TTL,
      forceRefresh
    );
    
    return processSunTimes(response);
  } catch (error) {
    // 如果是网络错误，尝试从过期缓存中读取
    if (isNetworkError(error)) {
      console.warn('⚠️ 网络错误，尝试使用过期缓存...');
      try {
        const cachedData = await fetchWithCache(
          cacheKey,
          () => Promise.reject(error), // 不会真正执行
          Infinity, // 接受任何过期时间
          false
        );
        console.log('📦 使用过期缓存数据');
        return processSunTimes(cachedData);
      } catch (cacheError) {
        // 缓存也没有，抛出原始错误
        throw error;
      }
    }
    throw error;
  }
};
