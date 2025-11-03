// sunrise-sunset.org API 服务封装

import { SunTimesResponse, SunTimesRequest, ProcessedSunTimes } from '../types/api';

const BASE_URL = 'https://api.sunrise-sunset.org/json';

/**
 * 获取日出日落时间
 * @param lat 纬度
 * @param lng 经度
 * @param date 日期（可选，格式：YYYY-MM-DD）
 * @returns Promise<SunTimesResponse>
 */
export const fetchSunTimes = async (
  lat: number,
  lng: number,
  date?: string
): Promise<SunTimesResponse> => {
  try {
    const params = new URLSearchParams({
      lat: lat.toString(),
      lng: lng.toString(),
      formatted: '0', // 返回 ISO 8601 格式
    });

    if (date) {
      params.append('date', date);
    }

    const url = `${BASE_URL}?${params.toString()}`;
    console.log('🌅 Fetching sun times from:', url);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: SunTimesResponse = await response.json();
    console.log('✅ API Response:', data);

    if (data.status !== 'OK') {
      throw new Error(`API returned error status: ${data.status}`);
    }

    return data;
  } catch (error) {
    console.error('❌ Error fetching sun times:', error);
    throw error;
  }
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
 * 获取并处理太阳时间数据
 * @param lat 纬度
 * @param lng 经度
 * @param date 日期（可选）
 * @returns Promise<ProcessedSunTimes>
 */
export const getSunTimes = async (
  lat: number,
  lng: number,
  date?: string
): Promise<ProcessedSunTimes> => {
  const response = await fetchSunTimes(lat, lng, date);
  return processSunTimes(response);
};
