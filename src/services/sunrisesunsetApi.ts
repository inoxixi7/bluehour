import { LocationCoords } from '../types';

export interface SunriseSunsetApiResponse {
  results: {
    date: string;
    sunrise: string;
    sunset: string;
    first_light: string;
    last_light: string;
    dawn: string;
    dusk: string;
    solar_noon: string;
    golden_hour: string;
    day_length: string;
    timezone: string;
    utc_offset: number;
  };
  status: string;
}

export interface SunTimesFromApi {
  sunrise: string;
  sunset: string;
  firstLight: string;
  lastLight: string;
  dawn: string;
  dusk: string;
  solarNoon: string;
  goldenHour: string;
  timezone: string;
  utcOffset: number;
  date: string;
}

export const fetchSunTimes = async (coords: LocationCoords, date?: string): Promise<SunTimesFromApi> => {
  const { latitude, longitude } = coords;
  
  // 构建API URL，使用24小时时间格式
  const baseUrl = 'https://api.sunrisesunset.io/json';
  const params = new URLSearchParams({
    lat: latitude.toString(),
    lng: longitude.toString(),
    time_format: '24', // 使用24小时格式，直接显示
  });

  if (date) {
    params.append('date', date);
  }

  const url = `${baseUrl}?${params.toString()}`;
  
  console.log('请求太阳时间API:', url);

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data: SunriseSunsetApiResponse = await response.json();
    
    if (data.status !== 'OK') {
      throw new Error(`API返回错误状态: ${data.status}`);
    }

    console.log('API返回数据:', data);

    // 直接返回API的时间字符串
    return {
      sunrise: data.results.sunrise,
      sunset: data.results.sunset,
      firstLight: data.results.first_light,
      lastLight: data.results.last_light,
      dawn: data.results.dawn,
      dusk: data.results.dusk,
      solarNoon: data.results.solar_noon,
      goldenHour: data.results.golden_hour,
      timezone: data.results.timezone,
      utcOffset: data.results.utc_offset,
      date: data.results.date,
    };
  } catch (error) {
    console.error('获取太阳时间失败:', error);
    throw new Error(error instanceof Error ? error.message : '获取太阳时间失败');
  }
};
