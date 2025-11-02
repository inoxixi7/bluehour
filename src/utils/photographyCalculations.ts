// 摄影计算核心逻辑

/**
 * 计算曝光值 (EV)
 * EV = log2(aperture^2 / shutter) + log2(ISO / 100)
 */
export const calculateEV = (aperture: number, shutter: number, iso: number): number => {
  const ev = Math.log2((aperture * aperture) / shutter) + Math.log2(iso / 100);
  return Math.round(ev * 10) / 10; // 保留一位小数
};

/**
 * 计算档位差
 * stops = log2(value2 / value1)
 */
export const calculateStops = (value1: number, value2: number): number => {
  return Math.log2(value2 / value1);
};

/**
 * EV 等效曝光计算
 * 当改变一个参数时，计算保持相同 EV 所需的其他参数值
 */
export interface EVEquivalentResult {
  aperture: number;
  shutter: number;
  iso: number;
  ev: number;
}

/**
 * 根据锁定的参数计算等效曝光
 * @param baseSettings 基准曝光设置
 * @param changedParam 改变的参数名
 * @param newValue 新的参数值
 * @param lockedParam 锁定的参数名（另一个不变的参数）
 */
export const calculateEquivalentExposure = (
  baseSettings: { aperture: number; shutter: number; iso: number },
  changedParam: 'aperture' | 'shutter' | 'iso',
  newValue: number,
  lockedParam: 'aperture' | 'shutter' | 'iso'
): EVEquivalentResult => {
  const baseEV = calculateEV(baseSettings.aperture, baseSettings.shutter, baseSettings.iso);
  
  const result: EVEquivalentResult = {
    aperture: baseSettings.aperture,
    shutter: baseSettings.shutter,
    iso: baseSettings.iso,
    ev: baseEV,
  };
  
  // 更新改变的参数
  result[changedParam] = newValue;
  
  // 计算档位差
  let stops = 0;
  switch (changedParam) {
    case 'aperture':
      stops = calculateStops(baseSettings.aperture * baseSettings.aperture, newValue * newValue);
      break;
    case 'shutter':
      stops = calculateStops(newValue, baseSettings.shutter);
      break;
    case 'iso':
      stops = calculateStops(newValue, baseSettings.iso);
      break;
  }
  
  // 确定需要调整的参数（除了改变的和锁定的之外的那个）
  const paramsArray: Array<'aperture' | 'shutter' | 'iso'> = ['aperture', 'shutter', 'iso'];
  const adjustParam = paramsArray.find(p => p !== changedParam && p !== lockedParam)!;
  
  // 应用补偿
  switch (adjustParam) {
    case 'aperture':
      // 光圈需要补偿相反的档位
      const newAperture = baseSettings.aperture * Math.pow(2, -stops / 2);
      result.aperture = findClosestAperture(newAperture);
      break;
    case 'shutter':
      // 快门需要补偿相反的档位
      const newShutter = baseSettings.shutter * Math.pow(2, -stops);
      result.shutter = findClosestShutter(newShutter);
      break;
    case 'iso':
      // ISO 需要补偿相反的档位
      const newISO = baseSettings.iso * Math.pow(2, -stops);
      result.iso = findClosestISO(newISO);
      break;
  }
  
  return result;
};

/**
 * ND 滤镜计算
 * @param baseShutter 基础快门速度（秒）
 * @param ndStops ND 滤镜的档位数
 * @returns 新的快门速度（秒）
 */
export const calculateNDShutter = (baseShutter: number, ndStops: number): number => {
  return baseShutter * Math.pow(2, ndStops);
};

/**
 * 景深计算
 * @param aperture 光圈 (F值)
 * @param focalLength 焦距 (mm)
 * @param distance 对焦距离 (米)
 * @param coc 模糊圈直径 (mm)
 */
export const calculateDepthOfField = (
  aperture: number,
  focalLength: number,
  distance: number,
  coc: number
) => {
  // 将距离转换为 mm
  const distanceMM = distance * 1000;
  
  // 超焦距 (mm)
  const hyperFocal = (focalLength * focalLength) / (aperture * coc) + focalLength;
  
  // 景深近点 (mm)
  const nearLimit = (distanceMM * (hyperFocal - focalLength)) / 
                    (hyperFocal + distanceMM - 2 * focalLength);
  
  // 景深远点 (mm)
  let farLimit: number;
  if (distanceMM < hyperFocal - focalLength) {
    farLimit = (distanceMM * (hyperFocal - focalLength)) / 
               (hyperFocal - distanceMM);
  } else {
    farLimit = Infinity;
  }
  
  // 总景深
  const totalDoF = farLimit === Infinity ? Infinity : (farLimit - nearLimit);
  
  // 对焦点前后的景深
  const inFrontOfSubject = distanceMM - nearLimit;
  const behindSubject = farLimit === Infinity ? Infinity : (farLimit - distanceMM);
  
  return {
    nearLimit: nearLimit / 1000,           // 转换为米
    farLimit: farLimit === Infinity ? Infinity : farLimit / 1000,
    totalDoF: totalDoF === Infinity ? Infinity : totalDoF / 1000,
    hyperFocalDistance: hyperFocal / 1000,
    inFrontOfSubject: inFrontOfSubject / 1000,
    behindSubject: behindSubject === Infinity ? Infinity : behindSubject / 1000,
  };
};

/**
 * 计算超焦距
 * @param aperture 光圈 (F值)
 * @param focalLength 焦距 (mm)
 * @param coc 模糊圈直径 (mm)
 * @returns 超焦距 (米)
 */
export const calculateHyperFocalDistance = (
  aperture: number,
  focalLength: number,
  coc: number
): number => {
  const hyperFocal = (focalLength * focalLength) / (aperture * coc) + focalLength;
  return hyperFocal / 1000; // 转换为米
};

// 辅助函数：找到最接近的光圈值
const APERTURE_VALUES = [
  1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8,
  3.2, 3.5, 4.0, 4.5, 5.0, 5.6, 6.3, 7.1, 8.0, 9.0,
  10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32
];

const findClosestAperture = (value: number): number => {
  return APERTURE_VALUES.reduce((prev, curr) => {
    return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
  });
};

// 辅助函数：找到最接近的快门速度
const STANDARD_SHUTTERS = [
  1/8000, 1/4000, 1/2000, 1/1000, 1/500, 1/250, 1/125, 1/60,
  1/30, 1/15, 1/8, 1/4, 1/2, 1, 2, 4, 8, 15, 30, 60, 120, 240, 480, 900, 1800
];

const findClosestShutter = (value: number): number => {
  return STANDARD_SHUTTERS.reduce((prev, curr) => {
    return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
  });
};

// 辅助函数：找到最接近的 ISO 值
const ISO_VALUES = [
  50, 64, 80, 100, 125, 160, 200, 250, 320, 400,
  500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200,
  4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600
];

const findClosestISO = (value: number): number => {
  return ISO_VALUES.reduce((prev, curr) => {
    return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
  });
};
