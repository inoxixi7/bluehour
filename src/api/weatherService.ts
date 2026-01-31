/**
 * Open-Meteo 天气服务
 * 获取当前天气状况、温度和风速
 */

export interface WeatherData {
  temperature: number; // 摄氏度
  windSpeed: number; // km/h
  weatherCode: number; // WMO Weather interpretation codes
  weatherDescription: string; // 天气描述
  recommendedEV: number; // 推荐的EV值
}

/**
 * WMO Weather Code 到天气描述和EV值的映射
 * 基于 WMO Weather interpretation codes
 */
const weatherCodeMap: Record<number, { description: string; ev: number }> = {
  0: { description: 'Clear sky', ev: 15 }, // 晴朗天空
  1: { description: 'Mainly clear', ev: 14 }, // 基本晴朗
  2: { description: 'Partly cloudy', ev: 13 }, // 部分多云
  3: { description: 'Overcast', ev: 12 }, // 阴天
  45: { description: 'Foggy', ev: 10 }, // 雾
  48: { description: 'Depositing rime fog', ev: 10 }, // 雾凇
  51: { description: 'Light drizzle', ev: 11 }, // 小雨
  53: { description: 'Moderate drizzle', ev: 10 }, // 中雨
  55: { description: 'Dense drizzle', ev: 9 }, // 大雨
  61: { description: 'Slight rain', ev: 11 }, // 小雨
  63: { description: 'Moderate rain', ev: 10 }, // 中雨
  65: { description: 'Heavy rain', ev: 9 }, // 大雨
  71: { description: 'Slight snow', ev: 10 }, // 小雪
  73: { description: 'Moderate snow', ev: 9 }, // 中雪
  75: { description: 'Heavy snow', ev: 8 }, // 大雪
  80: { description: 'Slight rain showers', ev: 11 }, // 阵雨
  81: { description: 'Moderate rain showers', ev: 10 }, // 中阵雨
  82: { description: 'Violent rain showers', ev: 9 }, // 强阵雨
  95: { description: 'Thunderstorm', ev: 8 }, // 雷暴
  96: { description: 'Thunderstorm with hail', ev: 7 }, // 雷暴冰雹
  99: { description: 'Thunderstorm with heavy hail', ev: 7 }, // 强雷暴冰雹
};

/**
 * 获取天气描述的多语言键
 */
const getWeatherI18nKey = (weatherCode: number): string => {
  const codeMap: Record<number, string> = {
    0: 'weather.clearSky',
    1: 'weather.mainlyClear',
    2: 'weather.partlyCloudy',
    3: 'weather.overcast',
    45: 'weather.foggy',
    48: 'weather.foggy',
    51: 'weather.lightDrizzle',
    53: 'weather.moderateDrizzle',
    55: 'weather.denseDrizzle',
    61: 'weather.slightRain',
    63: 'weather.moderateRain',
    65: 'weather.heavyRain',
    71: 'weather.slightSnow',
    73: 'weather.moderateSnow',
    75: 'weather.heavySnow',
    80: 'weather.slightRainShowers',
    81: 'weather.moderateRainShowers',
    82: 'weather.violentRainShowers',
    95: 'weather.thunderstorm',
    96: 'weather.thunderstormHail',
    99: 'weather.thunderstormHeavyHail',
  };
  return codeMap[weatherCode] || 'weather.unknown';
};

/**
 * 获取天气图标
 */
export const getWeatherIcon = (weatherCode: number): string => {
  if (weatherCode === 0) return '☀️';
  if (weatherCode === 1) return '🌤️';
  if (weatherCode === 2) return '⛅';
  if (weatherCode === 3) return '☁️';
  if (weatherCode === 45 || weatherCode === 48) return '🌫️';
  if ([51, 53, 55, 61, 80].includes(weatherCode)) return '🌧️';
  if ([63, 65, 81, 82].includes(weatherCode)) return '⛈️';
  if ([71, 73, 75].includes(weatherCode)) return '❄️';
  if ([95, 96, 99].includes(weatherCode)) return '⚡';
  return '🌡️';
};

/**
 * 获取当前天气数据
 * @param latitude 纬度
 * @param longitude 经度
 * @returns Promise<WeatherData>
 */
export const getCurrentWeather = async (
  latitude: number,
  longitude: number
): Promise<WeatherData> => {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'temperature_2m,weather_code,wind_speed_10m',
      timezone: 'auto',
    });

    const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
    
    console.log('🌤️ [WeatherService] 获取天气数据:', { latitude, longitude });
    
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API request failed: ${response.status}`);
    }

    const data = await response.json();
    
    const weatherCode = data.current.weather_code;
    const weatherInfo = weatherCodeMap[weatherCode] || { description: 'Unknown', ev: 12 };

    const weatherData: WeatherData = {
      temperature: Math.round(data.current.temperature_2m),
      windSpeed: Math.round(data.current.wind_speed_10m),
      weatherCode: weatherCode,
      weatherDescription: weatherInfo.description,
      recommendedEV: weatherInfo.ev,
    };

    console.log('✅ [WeatherService] 天气数据获取成功:', weatherData);
    return weatherData;
  } catch (error) {
    console.error('❌ [WeatherService] 获取天气失败:', error);
    throw error;
  }
};

/**
 * 导出天气描述的i18n键获取函数
 */
export { getWeatherI18nKey };
