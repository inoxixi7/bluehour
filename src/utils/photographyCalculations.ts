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

export type ExposureParam = 'aperture' | 'shutter' | 'iso';

export interface ExposureValues {
  aperture: number;
  shutter: number;
  iso: number;
}

export interface SolvedExposure {
  values: ExposureValues;
  /** 超出标准值范围时剩余的曝光偏差（档），正数为过曝、负数为欠曝；在范围内为 0 */
  outOfRangeStops: number;
}

/**
 * 按场景亮度 ev 计算自动参数 auto，另外两个参数保持 values 中的值（对应相机的光圈优先 / 快门优先 / 自动 ISO）
 * 超出标准值范围时取最接近的极值，并在 outOfRangeStops 中给出偏差
 */
export const solveExposure = (
  ev: number,
  auto: ExposureParam,
  values: ExposureValues
): SolvedExposure => {
  const { aperture, shutter, iso } = values;
  // EV = log2(N² / t) − log2(ISO / 100)
  const evAtIso = ev + Math.log2(iso / 100);
  const [range, raw, closest] =
    auto === 'aperture'
      ? [APERTURE_VALUES, Math.sqrt(shutter * Math.pow(2, evAtIso)), findClosestAperture]
      : auto === 'shutter'
        ? [STANDARD_SHUTTERS, (aperture * aperture) / Math.pow(2, evAtIso), findClosestShutter]
        : [
            ISO_VALUES,
            100 * Math.pow(2, Math.log2((aperture * aperture) / shutter) - ev),
            findClosestISO,
          ];

  const result = { ...values, [auto]: closest(raw) };
  const inRange = raw >= Math.min(...range) && raw <= Math.max(...range);
  const actualEV =
    Math.log2((result.aperture * result.aperture) / result.shutter) - Math.log2(result.iso / 100);
  // `|| 0` 去掉 -0
  const outOfRangeStops = inRange ? 0 : Math.round((ev - actualEV) * 10) / 10 || 0;
  return { values: result, outOfRangeStops };
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
