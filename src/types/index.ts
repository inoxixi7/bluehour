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

// 新增：地理编码（城市搜索）结果结构，抽象为最少依赖的字段，方便未来替换 API。
export interface GeocodeResult {
  // 标准化的展示名称
  displayName: string;
  // 原始提供者返回的描述（可与 displayName 相同）
  description?: string;
  // 纬度（十进制度）
  latitude: number;
  // 经度（十进制度）
  longitude: number;
  // 可能的类型（city, town, village 等），便于筛选或优先级策略
  type?: string;
  // 原始 provider id（例如 osm_id），方便后续做详情查询或缓存
  providerId?: string | number;
  // 数据源名称，便于未来切换多源（如 'nominatim'）
  source?: string;
}
