import { useState, useEffect, useMemo } from 'react';
import { LocationCoords, SunTimes, PhotographyPhase, PhotographyPeriod } from '../types';
import { 
  calculateSunTimes, 
  getCurrentPhotographyPhase, 
  getNextPhotographyPeriod
} from '../utils/sunCalculations';

interface UseSunTimesResult {
  sunTimes: SunTimes | null;
  currentPhase: PhotographyPhase | null;
  currentPeriodInfo: PhotographyPeriod | null;
  nextPhaseTime: string | null;
  timeUntilNextPhase: string | null;
  loading: boolean;
  error: string | null;
  refreshSunTimes: () => Promise<void>;
}

export const useSunTimes = (location: LocationCoords | null) => {
  const [sunTimes, setSunTimes] = useState<SunTimes | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchSunTimesData = async () => {
    if (!location) {
      console.log('没有位置信息，跳过获取太阳时间');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('开始获取太阳时间数据，位置:', location);
      const times = await calculateSunTimes(location);
      console.log('获取到太阳时间数据:', times);
      setSunTimes(times);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '获取太阳时间失败';
      console.error('获取太阳时间失败:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSunTimesData();
  }, [location]);

  // 计算当前摄影阶段
  const currentPhase = useMemo(() => {
    if (!sunTimes) return null;
    return getCurrentPhotographyPhase(sunTimes, currentTime);
  }, [sunTimes, currentTime]);

  // 获取当前时段信息
  const currentPeriodInfo = useMemo(() => {
    if (!sunTimes) return null;
    return getNextPhotographyPeriod(sunTimes, currentTime);
  }, [sunTimes, currentTime]);

  // 下一个阶段的时间
  const nextPhaseTime = useMemo(() => {
    return currentPeriodInfo?.nextTime || null;
  }, [currentPeriodInfo]);

  // 计算到下一个阶段的时间差
  const timeUntilNextPhase = useMemo(() => {
    if (!nextPhaseTime) return null;
    
    const currentTimeStr = currentTime.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    
    const timeToMinutes = (timeStr: string): number => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const currentMinutes = timeToMinutes(currentTimeStr);
    const nextMinutes = timeToMinutes(nextPhaseTime);
    
    let diffMinutes = nextMinutes - currentMinutes;
    if (diffMinutes < 0) {
      diffMinutes += 24 * 60; // 如果是明天，加上一天的分钟数
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return `${hours}小时${minutes}分钟`;
    } else {
      return `${minutes}分钟`;
    }
  }, [nextPhaseTime, currentTime]);

  return {
    sunTimes,
    currentPhase,
    currentPeriodInfo,
    nextPhaseTime,
    timeUntilNextPhase,
    loading,
    error,
    refreshSunTimes: fetchSunTimesData,
  };
};
