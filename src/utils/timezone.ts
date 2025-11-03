// 时区工具函数 - 简化版

/**
 * 格式化时区偏移量为可读字符串
 * @param offsetMinutes 时区偏移量（分钟）
 * @returns 格式化的字符串，如 "UTC+8" 或 "UTC-5"
 */
export const formatTimezoneOffset = (offsetMinutes: number): string => {
  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;
  const sign = offsetMinutes >= 0 ? '+' : '-';
  
  if (minutes === 0) {
    return `UTC${sign}${hours}`;
  }
  return `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}`;
};

/**
 * 获取时区友好的显示名称
 * @param timezone 时区标识符（如 "Asia/Shanghai"）
 * @param offsetMinutes 时区偏移量（分钟）
 * @returns 显示名称，如 "Asia/Shanghai (UTC+8)"
 */
export const getTimezoneDisplayName = (timezone: string, offsetMinutes: number): string => {
  return `${timezone} (${formatTimezoneOffset(offsetMinutes)})`;
};

/**
 * 根据时区偏移量获取目标地点的当前时间
 * @param timezoneOffsetMinutes 目标时区相对UTC的偏移量（分钟）
 * @returns 目标地点的当前时间（Date对象）
 */
export const getCurrentTimeInTimezone = (timezoneOffsetMinutes: number): Date => {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const targetTime = new Date(utcTime + (timezoneOffsetMinutes * 60000));
  return targetTime;
};
