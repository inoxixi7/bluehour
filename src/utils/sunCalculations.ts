import { SunTimes, LocationCoords, PhotographyPhase, PhotographyPeriod } from '../types';
import { fetchSunTimes } from '../services/sunrisesunsetApi';

export const calculateSunTimes = async (coords: LocationCoords, date?: Date): Promise<SunTimes> => {
  const dateString = date ? date.toISOString().split('T')[0] : undefined;
  return await fetchSunTimes(coords, dateString);
};

export const getNextPhotographyPeriod = (sunTimes: SunTimes, currentTime: Date = new Date()): PhotographyPeriod | null => {
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
  
  const currentMinutes = timeToMinutes(currentTimeStr);
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
      isIdeal: false,
      tips: [
        '使用三脚架确保稳定',
        '尝试长曝光拍摄星轨',
        '拍摄城市夜景和光轨',
        '使用手动对焦到无穷远'
      ],
      color: '#1a1a2e'
    };
  }
  
  if (currentMinutes < dawnMinutes) {
    return {
      phase: 'first-light' as PhotographyPhase,
      name: '第一道光',
      description: '天空开始泛亮，适合拍摄山峦剪影',
      nextPhase: 'dawn' as PhotographyPhase,
      nextTime: sunTimes.dawn,
      isIdeal: false,
      tips: [
        '拍摄建筑剪影',
        '捕捉天空的深蓝色调',
        '使用较长曝光时间',
        '注意白平衡设置'
      ],
      color: '#16213e'
    };
  }
  
  if (currentMinutes < sunriseMinutes) {
    return {
      phase: 'dawn' as PhotographyPhase,
      name: '黎明',
      description: '光线柔和，适合风景摄影',
      nextPhase: 'sunrise' as PhotographyPhase,
      nextTime: sunTimes.sunrise,
      isIdeal: true,
      tips: [
        '拍摄人像，光线柔和',
        '捕捉温暖的色调',
        '逆光拍摄营造氛围',
        '注意阴影细节'
      ],
      color: '#ff6b35'
    };
  }
  
  if (currentMinutes < goldenHourEndMinutes) {
    return {
      phase: 'sunrise' as PhotographyPhase,
      name: '日出 & 黄金时刻',
      description: '温暖的光线，最佳摄影时机',
      nextPhase: 'day' as PhotographyPhase,
      nextTime: minutesToTimeString(goldenHourEndMinutes),
      isIdeal: true,
      tips: [
        '拍摄日出剪影',
        '捕捉温暖的光线',
        '人像摄影的最佳时间',
        '注意测光和曝光'
      ],
      color: '#ff922b'
    };
  }
  
  if (currentMinutes < goldenHourStartMinutes) {
    return {
      phase: 'day' as PhotographyPhase,
      name: '白天',
      description: '光线较强，适合建筑、人像摄影',
      nextPhase: 'golden-hour' as PhotographyPhase,
      nextTime: sunTimes.goldenHour,
      isIdeal: false,
      tips: [
        '使用偏振镜减少反光',
        '注意高对比度场景',
        '寻找有趣的阴影',
        '街头摄影的好时机'
      ],
      color: '#4dabf7'
    };
  }
  
  if (currentMinutes < sunsetMinutes) {
    return {
      phase: 'golden-hour' as PhotographyPhase,
      name: '黄金时刻',
      description: '傍晚温暖光线，最佳摄影时机',
      nextPhase: 'sunset' as PhotographyPhase,
      nextTime: sunTimes.sunset,
      isIdeal: true,
      tips: [
        '拍摄日落剪影',
        '捕捉温暖的光线',
        '人像摄影的最佳时间',
        '注意测光和曝光'
      ],
      color: '#ff922b'
    };
  }
  
  if (currentMinutes < duskMinutes) {
    return {
      phase: 'sunset' as PhotographyPhase,
      name: '日落',
      description: '日落景观，剪影效果',
      nextPhase: 'blue-hour' as PhotographyPhase,
      nextTime: sunTimes.dusk,
      isIdeal: true,
      tips: [
        '拍摄日落剪影',
        '捕捉温暖的光线',
        '人像摄影的最佳时间',
        '注意测光和曝光'
      ],
      color: '#ff922b'
    };
  }
  
  if (currentMinutes < lastLightMinutes) {
    return {
      phase: 'blue-hour' as PhotographyPhase,
      name: '蓝色时刻',
      description: '天空呈现深蓝色，城市灯光开始亮起',
      nextPhase: 'night' as PhotographyPhase,
      nextTime: sunTimes.lastLight,
      isIdeal: true,
      tips: [
        '拍摄城市夜景',
        '捕捉天空的蓝紫色调',
        '建筑灯光开始亮起',
        '使用三脚架拍摄'
      ],
      color: '#364fc7'
    };
  }
  
  // 已经是夜晚，返回下一个周期的第一道光
  return {
    phase: 'night' as PhotographyPhase,
    name: '夜间',
    description: '拍摄星空、城市夜景',
    nextPhase: 'first-light' as PhotographyPhase,
    nextTime: sunTimes.firstLight, // 这里应该是明天的时间，但为了简化，先用今天的
    isIdeal: false,
    tips: [
      '使用三脚架确保稳定',
      '尝试长曝光拍摄星轨',
      '拍摄城市夜景和光轨',
      '使用手动对焦到无穷远'
    ],
    color: '#1a1a2e'
  };
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

export const getCurrentPhotographyPhase = (sunTimes: SunTimes, currentTime: Date = new Date()): PhotographyPhase => {
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
  
  const currentMinutes = timeToMinutes(currentTimeStr);
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
