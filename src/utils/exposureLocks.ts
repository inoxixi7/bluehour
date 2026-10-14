/**
 * 曝光计算器的参数锁定逻辑
 *
 * 光圈 / 快门 / ISO 三个参数可以分别锁定。用户改动一个参数时，
 * 由未锁定的参数自动补偿，以保持 EV 不变（或达到锁定的目标 EV）。
 * 这里只做纯计算，不依赖 React，便于测试。
 */

import {
  calculateEquivalentExposure,
  calculateEquivalentExposureWithEV,
} from './photographyCalculations';

export type ExposureParam = 'aperture' | 'shutter' | 'iso';

export interface ExposureValues {
  aperture: number;
  shutter: number;
  iso: number;
}

const ALL_PARAMS: readonly ExposureParam[] = ['aperture', 'shutter', 'iso'];

/**
 * 用户把 param 改成 value 后，计算三个参数的新值
 *
 * - 目标 EV 已锁定：由未锁定的参数（优先快门）补偿到目标 EV；
 *   若补偿值超出范围，保持原值不变
 * - 其他两个参数都锁定：只改这个参数，EV 随之变化
 * - 否则：由未锁定的参数（优先快门）补偿，保持当前 EV
 */
export const applyParamChange = (
  values: ExposureValues,
  param: ExposureParam,
  value: number,
  locked: ReadonlySet<ExposureParam>,
  targetEV: number | null
): ExposureValues => {
  const others = ALL_PARAMS.filter(p => p !== param);
  const lockedOthers = others.filter(p => locked.has(p));
  const unlockedOthers = others.filter(p => !locked.has(p));

  // 优先用快门补偿；被锁定的参数（若有）保持不变
  const adjustParam = unlockedOthers.includes('shutter') ? 'shutter' : unlockedOthers[0];
  const keepParam = lockedOthers[0] ?? unlockedOthers.find(p => p !== adjustParam);

  if (unlockedOthers.length === 0 || !keepParam) {
    // 其他两个参数都锁定：只改这个参数，EV 随之变化
    return { ...values, [param]: value };
  }

  if (targetEV !== null) {
    const result = calculateEquivalentExposureWithEV(targetEV, param, value, keepParam, values);
    return result
      ? { aperture: result.aperture, shutter: result.shutter, iso: result.iso }
      : values;
  }

  const result = calculateEquivalentExposure(values, param, value, keepParam);
  return { aperture: result.aperture, shutter: result.shutter, iso: result.iso };
};

/**
 * 选择场景（目标 EV）后，计算达到该 EV 的参数
 * - 锁定两个参数：计算第三个
 * - 锁定一个参数：保持光圈（或另一个未锁定参数），调整剩下的那个
 * - 都没锁定：保持光圈和 ISO，调整快门
 * 无法达到时保持原值
 */
export const applyTargetEV = (
  values: ExposureValues,
  targetEV: number,
  locked: ReadonlySet<ExposureParam>
): ExposureValues => {
  const lockedList = ALL_PARAMS.filter(p => locked.has(p));
  let changedParam: ExposureParam;
  let lockedParam: ExposureParam;

  if (lockedList.length >= 2) {
    [changedParam, lockedParam] = lockedList;
  } else if (lockedList.length === 1) {
    const free = ALL_PARAMS.filter(p => !locked.has(p));
    changedParam = free.includes('aperture') ? 'aperture' : free[0];
    lockedParam = lockedList[0];
  } else {
    changedParam = 'aperture';
    lockedParam = 'iso';
  }

  const result = calculateEquivalentExposureWithEV(
    targetEV,
    changedParam,
    values[changedParam],
    lockedParam,
    values
  );
  return result ? { aperture: result.aperture, shutter: result.shutter, iso: result.iso } : values;
};

/**
 * 该参数是否会被自动调整（界面上显示「会自动调整」）
 */
export const isAutoAdjusted = (
  param: ExposureParam,
  locked: ReadonlySet<ExposureParam>,
  evLocked: boolean
): boolean => {
  if (locked.has(param)) return false;
  const others = ALL_PARAMS.filter(p => p !== param);
  const lockedOthers = others.filter(p => locked.has(p));
  if (lockedOthers.length === 2) return true;
  if (evLocked && lockedOthers.length === 1) {
    // 优先调整快门；快门被锁时才轮到这个参数
    return param === 'shutter' || locked.has('shutter');
  }
  return false;
};

/**
 * 切换参数的锁定状态
 * - 最多锁定两个参数（锁定第三个时，先解锁一个非 ISO 的参数）
 * - EV 锁定时至少保留一个锁（默认 ISO），否则曝光组合无法确定
 */
export const toggleParamLock = (
  locked: ReadonlySet<ExposureParam>,
  param: ExposureParam,
  evLocked: boolean
): Set<ExposureParam> => {
  const next = new Set(locked);
  if (next.has(param)) {
    next.delete(param);
    if (evLocked && next.size === 0) {
      next.add('iso');
    }
  } else {
    if (next.size >= 2) {
      const current = Array.from(next);
      next.delete(current.find(p => p !== 'iso') ?? current[0]);
    }
    next.add(param);
  }
  return next;
};
