// 摄影计算核心逻辑

import { APERTURE_VALUES, ISO_VALUES, SHUTTER_SPEEDS } from '../constants/Photography';
import { FilmReciprocityData, ReciprocityModel } from '../constants/FilmReciprocity';

/**
 * 计算曝光值 (EV，以 ISO 100 为基准的场景亮度)
 * EV = log2(N² / t) − log2(ISO / 100)
 *
 * 同一场景下 ISO 提高一档、快门缩短一档，EV 保持不变。
 */
export const calculateEV = (aperture: number, shutter: number, iso: number): number => {
  const ev = Math.log2((aperture * aperture) / shutter) - Math.log2(iso / 100);
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

  // 计算档位差 (stops > 0 表示变暗了，需要补偿增加曝光)
  let stops = 0;
  switch (changedParam) {
    case 'aperture':
      // log2(new^2 / base^2) -> 变大光圈值(f/2.8->f/4) -> 变暗 -> stops > 0
      stops = calculateStops(baseSettings.aperture * baseSettings.aperture, newValue * newValue);
      break;
    case 'shutter':
      // log2(base / new) -> 变长快门(1s->2s) -> 变亮 -> stops < 0
      stops = calculateStops(newValue, baseSettings.shutter);
      break;
    case 'iso':
      // log2(base / new) -> 变大ISO(100->200) -> 变亮 -> stops < 0
      stops = calculateStops(newValue, baseSettings.iso);
      break;
  }

  // 确定需要调整的参数（除了改变的和锁定的之外的那个）
  const paramsArray: Array<'aperture' | 'shutter' | 'iso'> = ['aperture', 'shutter', 'iso'];
  const adjustParam = paramsArray.find(p => p !== changedParam && p !== lockedParam)!;

  // 应用补偿
  // stops > 0 (变暗了) -> 需要增加曝光
  // stops < 0 (变亮了) -> 需要减少曝光
  switch (adjustParam) {
    case 'aperture':
      // 光圈值越小越亮，所以指数为负
      // 需要增加曝光(stops>0) -> 2^(-positive) < 1 -> 光圈值变小 -> 正确
      const newAperture = baseSettings.aperture * Math.pow(2, -stops / 2);
      result.aperture = findClosestAperture(newAperture);
      break;
    case 'shutter':
      // 快门值越大越亮，所以指数为正
      // 需要增加曝光(stops>0) -> 2^(positive) > 1 -> 快门时间变长 -> 正确
      const newShutter = baseSettings.shutter * Math.pow(2, stops);
      result.shutter = findClosestShutter(newShutter);
      break;
    case 'iso':
      // ISO值越大越亮，所以指数为正
      // 需要增加曝光(stops>0) -> 2^(positive) > 1 -> ISO变大 -> 正确
      const newISO = baseSettings.iso * Math.pow(2, stops);
      result.iso = findClosestISO(newISO);
      break;
  }

  return result;
};

/**
 * 根据目标 EV 值和已知参数计算等效曝光
 * 用于 EV 锁定模式
 * @param targetEV 目标 EV 值
 * @param changedParam 改变的参数名
 * @param newValue 新的参数值
 * @param lockedParam 锁定的参数名
 * @returns 计算结果，如果无法达到目标 EV 则返回 null
 */
export const calculateEquivalentExposureWithEV = (
  targetEV: number,
  changedParam: 'aperture' | 'shutter' | 'iso',
  newValue: number,
  lockedParam: 'aperture' | 'shutter' | 'iso',
  currentValues: { aperture: number; shutter: number; iso: number }
): EVEquivalentResult | null => {
  // 确定需要调整的参数
  const paramsArray: Array<'aperture' | 'shutter' | 'iso'> = ['aperture', 'shutter', 'iso'];
  const adjustParam = paramsArray.find(p => p !== changedParam && p !== lockedParam)!;

  let aperture: number = currentValues.aperture;
  let shutter: number = currentValues.shutter;
  let iso: number = currentValues.iso;

  // 设置改变的参数
  if (changedParam === 'aperture') {
    aperture = newValue;
  } else if (changedParam === 'shutter') {
    shutter = newValue;
  } else if (changedParam === 'iso') {
    iso = newValue;
  }

  // 锁定的参数保持不变(已经从 currentValues 设置了)

  // EV = log2(N² / t) − log2(ISO / 100)  =>  log2(N² / t) = EV + log2(ISO / 100)
  // 超出标准值范围半档以上视为无法达到目标 EV
  const exceedsRange = (values: readonly number[], raw: number, stopScale = 1) =>
    stopScale * Math.log2(values[0] / raw) > 0.5 ||
    stopScale * Math.log2(raw / values[values.length - 1]) > 0.5;

  if (adjustParam === 'aperture') {
    const raw = Math.sqrt(shutter * Math.pow(2, targetEV + Math.log2(iso / 100)));
    // 光圈每档对应 F 值 √2 倍，因此档数 = 2·log2
    if (exceedsRange(APERTURE_VALUES, raw, 2)) {
      return null;
    }
    aperture = findClosestAperture(raw);
  } else if (adjustParam === 'shutter') {
    const raw = (aperture * aperture) / Math.pow(2, targetEV + Math.log2(iso / 100));
    if (exceedsRange(STANDARD_SHUTTERS, raw)) {
      return null;
    }
    shutter = findClosestShutter(raw);
  } else {
    const raw = 100 * Math.pow(2, Math.log2((aperture * aperture) / shutter) - targetEV);
    if (exceedsRange(ISO_VALUES, raw)) {
      return null;
    }
    iso = findClosestISO(raw);
  }

  return {
    aperture,
    shutter,
    iso,
    ev: targetEV,
  };
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
 * 倒易律校正结果
 */
export interface ReciprocityResult {
  /** 校正后的曝光时间（秒） */
  correctedSeconds: number;
  /** 额外补偿的档数 log2(Tc / Tm) */
  extraStops: number;
  /** 测光时间超出了胶片数据的可靠范围（结果为外推值） */
  isExtrapolated: boolean;
}

/**
 * 根据倒易律模型计算校正后的曝光时间
 *
 * - power: Tm ≤ T0 时 Tc = Tm；否则 Tc = T0 · (Tm / T0)^P
 * - table: 在 log-log 坐标下对厂商数据点做分段线性插值，
 *          超出最后一个点时沿最后一段斜率外推
 *
 * @param meteredSeconds 测光（已含 ND）曝光时间（秒）
 * @param model 胶片的倒易律模型
 */
export const applyReciprocityCorrection = (
  meteredSeconds: number,
  model: ReciprocityModel
): number => {
  if (!(meteredSeconds > 0) || !Number.isFinite(meteredSeconds)) {
    return meteredSeconds;
  }

  switch (model.kind) {
    case 'none':
      return meteredSeconds;

    case 'power': {
      const { exponent, threshold } = model;
      if (meteredSeconds <= threshold) {
        return meteredSeconds;
      }
      return threshold * Math.pow(meteredSeconds / threshold, exponent);
    }

    case 'table': {
      const points = model.points;
      if (points.length === 0 || meteredSeconds <= points[0][0]) {
        return meteredSeconds;
      }
      if (points.length === 1) {
        return meteredSeconds;
      }

      const logT = Math.log(meteredSeconds);
      // 找到所在区间；超出末端时使用最后一段外推
      let i = 0;
      while (i < points.length - 2 && meteredSeconds > points[i + 1][0]) {
        i++;
      }
      const [x0, y0] = points[i];
      const [x1, y1] = points[i + 1];
      const slope = (Math.log(y1) - Math.log(y0)) / (Math.log(x1) - Math.log(x0));
      return Math.exp(Math.log(y0) + slope * (logT - Math.log(x0)));
    }
  }
};

/**
 * 计算胶片的倒易律校正结果（含补偿档数与可靠性标记）
 */
export const calculateReciprocity = (
  meteredSeconds: number,
  film: Pick<FilmReciprocityData, 'model' | 'maxReliableSeconds'>
): ReciprocityResult => {
  const correctedSeconds = applyReciprocityCorrection(meteredSeconds, film.model);
  const extraStops =
    meteredSeconds > 0 && correctedSeconds > 0 ? Math.log2(correctedSeconds / meteredSeconds) : 0;
  const isExtrapolated =
    film.maxReliableSeconds !== undefined && meteredSeconds > film.maxReliableSeconds;

  return { correctedSeconds, extraStops, isExtrapolated };
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
  const nearLimit =
    (distanceMM * (hyperFocal - focalLength)) / (hyperFocal + distanceMM - 2 * focalLength);

  // 景深远点 (mm)
  let farLimit: number;
  if (distanceMM < hyperFocal - focalLength) {
    farLimit = (distanceMM * (hyperFocal - focalLength)) / (hyperFocal - distanceMM);
  } else {
    farLimit = Infinity;
  }

  // 总景深
  const totalDoF = farLimit === Infinity ? Infinity : farLimit - nearLimit;

  // 对焦点前后的景深
  const inFrontOfSubject = distanceMM - nearLimit;
  const behindSubject = farLimit === Infinity ? Infinity : farLimit - distanceMM;

  return {
    nearLimit: nearLimit / 1000, // 转换为米
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

/**
 * 在对数空间中寻找最接近的标准值（按「档」的距离而不是线性差值）
 */
const findClosestInLogSpace = (values: readonly number[], target: number): number =>
  values.reduce((prev, curr) =>
    Math.abs(Math.log(curr / target)) < Math.abs(Math.log(prev / target)) ? curr : prev
  );

const STANDARD_SHUTTERS = SHUTTER_SPEEDS.map(s => s.value);

const findClosestAperture = (value: number): number =>
  findClosestInLogSpace(APERTURE_VALUES, value);
const findClosestShutter = (value: number): number =>
  findClosestInLogSpace(STANDARD_SHUTTERS, value);
const findClosestISO = (value: number): number => findClosestInLogSpace(ISO_VALUES, value);
