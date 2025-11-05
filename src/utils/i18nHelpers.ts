/**
 * 辅助函数 - 格式化时间倒计时
 */
export const formatTimeCountdown = (minutes: number, t: (key: string, options?: any) => string): string => {
  if (minutes < 60) {
    return t('sunTimes.timeFormat.minutes', { count: minutes });
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return t('sunTimes.timeFormat.hours', { count: hours });
  }
  
  return t('sunTimes.timeFormat.hoursMinutes', { hours, minutes: mins });
};
