export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface SunTimes {
  sunrise: string;
  sunset: string;
  firstLight: string;
  lastLight: string;
  dawn: string;
  dusk: string;
  solarNoon: string;
  goldenHour: string; // 这是黄金时刻开始时间
  timezone: string;
  utcOffset: number;
  date: string;
}

export interface PhotographyPeriod {
  phase: PhotographyPhase;
  name: string;
  description: string;
  nextPhase: PhotographyPhase;
  nextTime: string;
  isIdeal: boolean;
  tips: string[];
  color: string;
}

export type PhotographyPhase = 
  | 'night'
  | 'first-light'
  | 'dawn'
  | 'sunrise'
  | 'day'
  | 'golden-hour'
  | 'sunset'
  | 'blue-hour';
