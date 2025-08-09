import { SunTimes, LocationCoords, PhotographyPhase, PhotographyPeriod } from '../types';
import { fetchSunTimes } from '../services/sunrisesunsetApi';

export const calculateSunTimes = async (coords: LocationCoords, date?: Date): Promise<SunTimes> => {
  const dateString = date ? date.toISOString().split('T')[0] : undefined;
  return await fetchSunTimes(coords, dateString);
};

export const getNextPhotographyPeriod = (sunTimes: SunTimes, currentTime: Date = new Date(), currentMinutesOverride?: number): PhotographyPeriod | null => {
  const currentTimeStr = currentTime.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // 将时间字符串转换为分钟数进行比较
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  // 将分钟数转换回时间字符串
  const minutesToTimeString = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };
  
  const currentMinutes = currentMinutesOverride !== undefined ? currentMinutesOverride : timeToMinutes(currentTimeStr);
  const firstLightMinutes = timeToMinutes(sunTimes.firstLight);
  const dawnMinutes = timeToMinutes(sunTimes.dawn);
  const sunriseMinutes = timeToMinutes(sunTimes.sunrise);
  const goldenHourEndMinutes = sunriseMinutes + 60; // 日出后1小时
  const goldenHourStartMinutes = timeToMinutes(sunTimes.goldenHour);
  const sunsetMinutes = timeToMinutes(sunTimes.sunset);
  const duskMinutes = timeToMinutes(sunTimes.dusk);
  const lastLightMinutes = timeToMinutes(sunTimes.lastLight);

  // 按时间顺序检查下一个摄影时段
  if (currentMinutes < firstLightMinutes) {
    return {
      phase: 'night' as PhotographyPhase,
      name: '夜间',
      description: '拍摄星空、城市夜景',
      nextPhase: 'first-light' as PhotographyPhase,
      nextTime: sunTimes.firstLight,
      isIdeal: false
    };
  }
  
  if (currentMinutes < dawnMinutes) {
    return {
      phase: 'first-light' as PhotographyPhase,
      name: '第一道光',
      description: '天空开始泛亮，适合拍摄山峦剪影',
      nextPhase: 'dawn' as PhotographyPhase,
      nextTime: sunTimes.dawn,
      isIdeal: false
    };
  }
  
  if (currentMinutes < sunriseMinutes) {
    return {
      phase: 'dawn' as PhotographyPhase,
      name: '黎明',
      description: '光线柔和，适合风景摄影',
      nextPhase: 'sunrise' as PhotographyPhase,
      nextTime: sunTimes.sunrise,
      isIdeal: true
    };
  }
  
  if (currentMinutes < goldenHourEndMinutes) {
    return {
      phase: 'sunrise' as PhotographyPhase,
      name: '日出 & 黄金时刻',
      description: '温暖的光线，最佳摄影时机',
      nextPhase: 'day' as PhotographyPhase,
      nextTime: minutesToTimeString(goldenHourEndMinutes),
      isIdeal: true
    };
  }
  
  if (currentMinutes < goldenHourStartMinutes) {
    return {
      phase: 'day' as PhotographyPhase,
      name: '白天',
      description: '光线较强，适合建筑、人像摄影',
      nextPhase: 'golden-hour' as PhotographyPhase,
      nextTime: sunTimes.goldenHour,
      isIdeal: false
    };
  }
  
  if (currentMinutes < sunsetMinutes) {
    return {
      phase: 'golden-hour' as PhotographyPhase,
      name: '黄金时刻',
      description: '傍晚温暖光线，最佳摄影时机',
      nextPhase: 'sunset' as PhotographyPhase,
      nextTime: sunTimes.sunset,
      isIdeal: true
    };
  }
  
  if (currentMinutes < duskMinutes) {
    return {
      phase: 'sunset' as PhotographyPhase,
      name: '日落',
      description: '日落景观，剪影效果',
      nextPhase: 'blue-hour' as PhotographyPhase,
      nextTime: sunTimes.dusk,
      isIdeal: true
    };
  }
  
  if (currentMinutes < lastLightMinutes) {
    return {
      phase: 'blue-hour' as PhotographyPhase,
      name: '蓝色时刻',
      description: '天空呈现深蓝色，城市灯光开始亮起',
      nextPhase: 'night' as PhotographyPhase,
      nextTime: sunTimes.lastLight,
      isIdeal: true
    };
  }
  
  // 已经是夜晚，返回下一个周期的第一道光
  return {
    phase: 'night' as PhotographyPhase,
    name: '夜间',
    description: '拍摄星空、城市夜景',
    nextPhase: 'first-light' as PhotographyPhase,
    nextTime: sunTimes.firstLight, // 这里应该是明天的时间，但为了简化，先用今天的
    isIdeal: false
  };
};

export const getPhotographyPeriodInfo = (phase: PhotographyPhase): PhotographyPeriod => {
  const map: Record<PhotographyPhase, PhotographyPeriod> = {
    'night': { phase: 'night', name: '夜晚', description: '深夜时段，适合拍摄星空和夜景', nextPhase: 'first-light', nextTime: '', isIdeal: false },
    'first-light': { phase: 'first-light', name: '第一道光', description: '天空开始泛亮', nextPhase: 'dawn', nextTime: '', isIdeal: false },
    'dawn': { phase: 'dawn', name: '黎明', description: '光线柔和，适合风景', nextPhase: 'sunrise', nextTime: '', isIdeal: true },
    'sunrise': { phase: 'sunrise', name: '日出 & 黄金时刻', description: '温暖光线，最佳拍摄', nextPhase: 'day', nextTime: '', isIdeal: true },
    'day': { phase: 'day', name: '白天', description: '常规日光时段', nextPhase: 'golden-hour', nextTime: '', isIdeal: false },
    'golden-hour': { phase: 'golden-hour', name: '黄金时刻', description: '傍晚温暖光线', nextPhase: 'sunset', nextTime: '', isIdeal: true },
    'sunset': { phase: 'sunset', name: '日落', description: '日落景观与剪影', nextPhase: 'blue-hour', nextTime: '', isIdeal: true },
    'blue-hour': { phase: 'blue-hour', name: '蓝色时刻', description: '深蓝天空与灯光', nextPhase: 'night', nextTime: '', isIdeal: true },
  };
  return map[phase];
};

export const formatTime = (timeStr: string): string => {
  // 直接返回API提供的时间字符串
  return timeStr;
};

export const getTimeUntilNext = (targetTimeStr: string, currentTime: Date = new Date()): string => {
  // 将时间字符串转换为今天的Date对象进行计算
  const [targetHours, targetMinutes] = targetTimeStr.split(':').map(Number);
  const targetDate = new Date();
  targetDate.setHours(targetHours, targetMinutes, 0, 0);
  
  const diff = targetDate.getTime() - currentTime.getTime();
  
  if (diff <= 0) {
    return '已过';
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}小时${minutes}分钟后`;
  }
  
  return `${minutes}分钟后`;
};

export const getCurrentPhotographyPhase = (sunTimes: SunTimes, currentTime: Date = new Date(), currentMinutesOverride?: number): PhotographyPhase => {
  const currentTimeStr = currentTime.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // 将时间字符串转换为分钟数进行比较
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const currentMinutes = currentMinutesOverride !== undefined ? currentMinutesOverride : timeToMinutes(currentTimeStr);
  const firstLightMinutes = timeToMinutes(sunTimes.firstLight);
  const dawnMinutes = timeToMinutes(sunTimes.dawn);
  const sunriseMinutes = timeToMinutes(sunTimes.sunrise);
  const goldenHourEndMinutes = sunriseMinutes + 60; // 日出后1小时
  const goldenHourStartMinutes = timeToMinutes(sunTimes.goldenHour);
  const sunsetMinutes = timeToMinutes(sunTimes.sunset);
  const duskMinutes = timeToMinutes(sunTimes.dusk);
  const lastLightMinutes = timeToMinutes(sunTimes.lastLight);

  // 按时间顺序检查当前摄影阶段
  if (currentMinutes < firstLightMinutes) {
    return 'night';
  }
  
  if (currentMinutes < dawnMinutes) {
    return 'first-light';
  }
  
  if (currentMinutes < sunriseMinutes) {
    return 'dawn';
  }
  
  if (currentMinutes < goldenHourEndMinutes) {
    return 'sunrise';
  }
  
  if (currentMinutes < goldenHourStartMinutes) {
    return 'day';
  }
  
  if (currentMinutes < sunsetMinutes) {
    return 'golden-hour';
  }
  
  if (currentMinutes < duskMinutes) {
    return 'sunset';
  }
  
  if (currentMinutes < lastLightMinutes) {
    return 'blue-hour';
  }
  
  return 'night';
};

// 新增：基于 civil/nautical (dawn/dusk) 差值推导黄金时刻与蓝调时刻动态区间的函数 deriveDynamicPeriods
export interface DynamicLightPeriods {
  morningGolden: { start: string; end: string };
  eveningGolden: { start: string; end: string };
  morningBlue: { start: string; end: string };
  eveningBlue: { start: string; end: string };
}

// 基于日出/日落与 civil twilight(dawn/dusk) 的差值推算光照区间：
// 假设：dawn(-6°) -> sunrise(0°) 区间 6°；sunset(0°) -> dusk(-6°) 区间 6°。
// 近似线性：每度耗时相等，用于估算 -4° 以及 +6° 时刻。
// 定义：
//  - 早黄金：(-4°) ~ (+6°)  =>  dawn + (2/6)*Δ晨 -> sunrise + Δ晨
//  - 晚黄金：( +6°) ~ (-4°) =>  sunset - Δ晚 -> sunset + (2/6)*Δ晚
//  - 早蓝调：(-6°) ~ (-4°) =>  dawn -> dawn + (2/6)*Δ晨
//  - 晚蓝调：(-4°) ~ (-6°) =>  sunset + (2/6)*Δ晚 -> dusk
// 若 Δ 为 0 或异常，则回退到原 API 字段（黄金：sunrise~sunrise+60min，蓝调：sunset~dusk）
export const deriveDynamicPeriods = (sunTimes: SunTimes): DynamicLightPeriods => {
  const toMin = (t: string) => { const [h,m] = t.split(':').map(Number); return h*60 + m; };
  const toStr = (mins: number) => { const h = Math.floor((mins+1440)%1440 / 60); const m = (mins % 60 + 60)%60; return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`; };
  const clampDay = (t: number) => ((t% (24*60)) + 24*60) % (24*60);

  const dawnM = toMin(sunTimes.dawn);          // -6° (civil dawn)
  const sunriseM = toMin(sunTimes.sunrise);    // 0°
  const sunsetM = toMin(sunTimes.sunset);      // 0°
  const duskM = toMin(sunTimes.dusk);          // -6° (civil dusk)
  const goldenApiStartM = toMin(sunTimes.goldenHour); // API 晚黄金起点（假定≈-4°）

  const deltaMorning = sunriseM - dawnM;       // (~6°区间)
  const deltaEvening = duskM - sunsetM;        // (~6°区间)
  const perDegMorning = deltaMorning > 0 ? deltaMorning / 6 : 0;
  const perDegEvening = deltaEvening > 0 ? deltaEvening / 6 : 0;

  // 角度参考：
  //   早： -6°(dawn) -> -4° = +2°; -4° -> +6° = +10° (用 -4°点、+6°点来界定黄金)
  // 规则实现：
  //   早蓝调：从 dawn 前 10 分钟 到 dawn + 2/6*Δ (即 -4°)
  //   早黄金：从 dawn 后 10 分钟 到 sunrise + Δ (即 +6°)
  //   晚黄金：从 golden_hour(API) 到 sunset + Δ (即 +6°)
  //   晚蓝调：从 sunset + 2/6*Δ (即 -4°) 到 dusk

  if (deltaMorning <= 0 || deltaEvening <= 0) {
    // 回退：保持简单区间
    const fallbackGoldDur = 52;
    return {
      morningGolden: { start: toStr(clampDay(sunriseM)), end: toStr(clampDay(sunriseM + fallbackGoldDur)) },
      eveningGolden: { start: toStr(clampDay(goldenApiStartM)), end: toStr(clampDay(goldenApiStartM + fallbackGoldDur)) },
      morningBlue: { start: toStr(clampDay(dawnM - 10)), end: toStr(clampDay(dawnM + 10)) },
      eveningBlue: { start: toStr(clampDay(sunsetM)), end: toStr(clampDay(duskM)) },
    };
  }

  // 计算关键点
  const morningMinus4Deg = dawnM + perDegMorning * 2;          // -4°
  const morningPlus6Deg  = sunriseM + deltaMorning;            // +6°
  const eveningMinus4Deg = sunsetM + perDegEvening * 2;        // -4°
  const eveningPlus6Deg  = sunsetM + deltaEvening;             // +6°

  // 早蓝调
  const morningBlueStart = dawnM - 10;                         // 前10分钟
  const morningBlueEnd   = Math.max(morningBlueStart + 5, morningMinus4Deg); // 至 -4°（确保至少5分钟避免反向）

  // 早黄金
  const morningGoldenStart = Math.max(dawnM + 10, morningMinus4Deg); // 从黎明后10分钟或 -4° 较晚的一个
  const morningGoldenEnd   = morningPlus6Deg;

  // 晚黄金
  const eveningGoldenStart = goldenApiStartM;                  // ≈ +6° 起点
  const eveningGoldenEnd   = eveningMinus4Deg;                 // -4° 终点

  // 晚蓝调
  const eveningBlueStart = eveningMinus4Deg;                   // -4°
  const eveningBlueEnd   = duskM;                              // -6°
  
  return {
    morningGolden: { start: toStr(clampDay(morningGoldenStart)), end: toStr(clampDay(morningGoldenEnd)) },
    eveningGolden: { start: toStr(clampDay(eveningGoldenStart)), end: toStr(clampDay(eveningGoldenEnd)) },
    morningBlue:   { start: toStr(clampDay(morningBlueStart)),   end: toStr(clampDay(morningBlueEnd)) },
    eveningBlue:   { start: toStr(clampDay(eveningBlueStart)),   end: toStr(clampDay(eveningBlueEnd)) },
  };
};
