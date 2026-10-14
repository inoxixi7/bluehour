import { useEffect, useState } from 'react';

/**
 * 当前时间，按固定间隔刷新（用于随时间变化的光线阶段和倒计时）
 * @param intervalMs 刷新间隔，默认 30 秒
 */
export const useNow = (intervalMs = 30 * 1000): Date => {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs]);

  return now;
};
