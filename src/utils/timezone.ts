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
  const utcTime = now.getTime() + now.getTimezoneOffset() * 60000;
  const targetTime = new Date(utcTime + timezoneOffsetMinutes * 60000);
  return targetTime;
};

/**
 * 将日期格式化为 YYYY-MM-DD
 * @param date Date 对象
 * @param timezone IANA 时区（可选）；不传时使用设备本地日期（而不是 UTC 日期）
 */
export const formatDateKey = (date: Date, timezone?: string): string => {
  if (timezone) {
    try {
      return new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
    } catch (error) {
      console.warn('Invalid timezone, falling back to local date:', timezone, error);
    }
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
