// sunrise-sunset.org API 响应类型

export interface SunTimesResponse {
  results: {
    sunrise: string;              // 日出时间 (UTC)
    sunset: string;               // 日落时间 (UTC)
    solar_noon: string;           // 太阳正午 (UTC)
    day_length: string | number;  // 白昼长度（字符串 "HH:MM:SS" 或秒数）
    civil_twilight_begin: string;       // 民用晨昏蒙影开始
    civil_twilight_end: string;         // 民用晨昏蒙影结束
    nautical_twilight_begin: string;    // 航海晨昏蒙影开始
    nautical_twilight_end: string;      // 航海晨昏蒙影结束
    astronomical_twilight_begin: string; // 天文晨昏蒙影开始
    astronomical_twilight_end: string;   // 天文晨昏蒙影结束
  };
  status: string;
}

// 处理后的太阳时间数据
export interface ProcessedSunTimes {
  // 原始时间
  sunrise: Date;
  sunset: Date;
  solarNoon: Date;
  
  // 晨昏蒙影
  civilTwilightBegin: Date;
  civilTwilightEnd: Date;
  nauticalTwilightBegin: Date;
  nauticalTwilightEnd: Date;
  astronomicalTwilightBegin: Date;
  astronomicalTwilightEnd: Date;
  
  // 计算的黄金时刻和蓝色时刻
  morningGoldenHourStart: Date;
  morningGoldenHourEnd: Date;
  morningBlueHourStart: Date;
  morningBlueHourEnd: Date;
  
  eveningGoldenHourStart: Date;
  eveningGoldenHourEnd: Date;
  eveningBlueHourStart: Date;
  eveningBlueHourEnd: Date;
  
  // 白昼长度（分钟）
  dayLength: number;
}

// API 请求参数
export interface SunTimesRequest {
  lat: number;
  lng: number;
  date?: string;  // 格式: YYYY-MM-DD
  formatted?: 0 | 1;  // 0 = ISO 8601, 1 = 可读格式
}
