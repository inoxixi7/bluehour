// 全局类型定义

// 地理位置
export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
  city?: string;
  country?: string;
}

// 曝光参数
export interface ExposureSettings {
  aperture: number; // 光圈 (F值)
  shutter: number; // 快门速度 (秒)
  iso: number; // ISO 感光度
}

// ND 滤镜计算结果
export interface NDCalculationResult {
  originalShutter: number;
  newShutter: number;
  ndStops: number;
  ndFactor: number;
}

// 时区信息
export interface TimeZoneInfo {
  offset: number;
  name: string;
}

// 当前位置坐标
export interface LocationData {
  latitude: number;
  longitude: number;
}

// 地点时区
export interface TimezoneData {
  timezone: string;
  offset: number;
}
