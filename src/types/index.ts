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
  aperture: number;    // 光圈 (F值)
  shutter: number;     // 快门速度 (秒)
  iso: number;         // ISO 感光度
}

// 景深计算结果
export interface DepthOfFieldResult {
  nearLimit: number;      // 清晰范围近点 (米)
  farLimit: number;       // 清晰范围远点 (米)
  totalDoF: number;       // 总景深 (米)
  hyperFocalDistance: number; // 超焦距 (米)
  inFrontOfSubject: number;   // 对焦点前的景深
  behindSubject: number;      // 对焦点后的景深
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
