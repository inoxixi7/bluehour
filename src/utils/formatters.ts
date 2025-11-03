// 格式化工具函数

/**
 * 格式化快门速度显示
 * @param seconds 快门速度（秒）
 * @returns 格式化的字符串
 */
export const formatShutterSpeed = (seconds: number): string => {
  if (seconds >= 1) {
    if (seconds >= 60) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      if (remainingSeconds === 0) {
        return `${minutes}分钟`;
      }
      return `${minutes}分${remainingSeconds}秒`;
    }
    return seconds === 1 ? '1秒' : `${seconds}秒`;
  } else {
    const denominator = Math.round(1 / seconds);
    return `1/${denominator}秒`;
  }
};

/**
 * 格式化光圈显示
 * @param aperture 光圈值
 * @returns 格式化的字符串
 */
export const formatAperture = (aperture: number): string => {
  return `f/${aperture.toFixed(1)}`;
};

/**
 * 格式化 ISO 显示
 * @param iso ISO 值
 * @returns 格式化的字符串
 */
export const formatISO = (iso: number): string => {
  return `ISO ${iso}`;
};

/**
 * 格式化距离显示
 * @param meters 距离（米）
 * @returns 格式化的字符串
 */
export const formatDistance = (meters: number): string => {
  if (meters === Infinity) {
    return '∞';
  }
  if (meters < 1) {
    return `${(meters * 100).toFixed(0)}cm`;
  }
  if (meters < 10) {
    return `${meters.toFixed(2)}m`;
  }
  return `${meters.toFixed(1)}m`;
};

/**
 * 格式化焦距显示
 * @param mm 焦距（毫米）
 * @returns 格式化的字符串
 */
export const formatFocalLength = (mm: number): string => {
  return `${mm}mm`;
};

/**
 * 格式化时间显示（24小时制）
 * @param date Date 对象
 * @param timezone 时区（可选，如 "Europe/Zurich"）
 * @returns HH:MM 格式
 */
export const formatTime = (date: Date, timezone?: string): string => {
  if (timezone) {
    // 使用指定时区格式化时间
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      const parts = formatter.formatToParts(date);
      const hour = parts.find(p => p.type === 'hour')?.value || '00';
      const minute = parts.find(p => p.type === 'minute')?.value || '00';
      return `${hour}:${minute}`;
    } catch (e) {
      console.error('Error formatting time with timezone:', e);
    }
  }
  
  // 没有指定时区，使用浏览器本地时区
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

/**
 * 格式化时间显示（带秒）
 * @param date Date 对象
 * @returns HH:MM:SS 格式
 */
export const formatTimeWithSeconds = (date: Date): string => {
  // 使用 UTC 方法，因为我们已经在 processSunTimes 中将时间转换为目标时区了
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  const seconds = date.getUTCSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

/**
 * 格式化日期显示
 * @param date Date 对象
 * @returns YYYY年MM月DD日 格式
 */
export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}年${month}月${day}日`;
};

/**
 * 格式化日期时间显示
 * @param date Date 对象
 * @returns YYYY-MM-DD HH:MM 格式
 */
export const formatDateTime = (date: Date): string => {
  return `${formatDate(date)} ${formatTime(date)}`;
};

/**
 * 格式化持续时间
 * @param minutes 分钟数
 * @returns 格式化的字符串
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${Math.round(minutes)}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (mins === 0) {
    return `${hours}小时`;
  }
  return `${hours}小时${mins}分钟`;
};

/**
 * 格式化 EV 值
 * @param ev EV 值
 * @returns 格式化的字符串
 */
export const formatEV = (ev: number): string => {
  return ev >= 0 ? `EV ${ev.toFixed(1)}` : `EV ${ev.toFixed(1)}`;
};

/**
 * 格式化档位
 * @param stops 档位数
 * @returns 格式化的字符串
 */
export const formatStops = (stops: number): string => {
  const absStops = Math.abs(stops);
  const rounded = Math.round(absStops * 3) / 3; // 精确到 1/3 档
  const sign = stops >= 0 ? '+' : '-';
  return `${sign}${rounded.toFixed(1)} 档`;
};
