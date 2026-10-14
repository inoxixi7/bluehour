import {
  applyParamChange,
  applyTargetEV,
  ExposureParam,
  isAutoAdjusted,
  toggleParamLock,
} from '../exposureLocks';
import { calculateEV } from '../photographyCalculations';

const base = { aperture: 8, shutter: 1 / 125, iso: 100 };
const locks = (...params: ExposureParam[]) => new Set<ExposureParam>(params);
const ev = (v: typeof base) => calculateEV(v.aperture, v.shutter, v.iso);

describe('applyParamChange', () => {
  it('compensates with the shutter when ISO is locked', () => {
    // f/8 → f/11：暗一档，快门延长一档
    const next = applyParamChange(base, 'aperture', 11, locks('iso'), null);
    expect(next).toEqual({ aperture: 11, shutter: 1 / 60, iso: 100 });
  });

  it('prefers the shutter when nothing is locked', () => {
    const next = applyParamChange(base, 'iso', 200, locks(), null);
    expect(next.shutter).toBe(1 / 250);
    expect(next.aperture).toBe(8);
  });

  it('adjusts the aperture when the shutter itself changes and nothing is locked', () => {
    const next = applyParamChange(base, 'shutter', 1 / 250, locks(), null);
    expect(next.aperture).toBe(5.6);
    expect(next.iso).toBe(100);
  });

  it('only changes the parameter when the other two are locked', () => {
    const next = applyParamChange(base, 'aperture', 11, locks('iso', 'shutter'), null);
    expect(next).toEqual({ ...base, aperture: 11 });
  });

  it('keeps the locked target EV', () => {
    const next = applyParamChange(base, 'aperture', 11, locks('iso'), 12);
    expect(ev(next)).toBeCloseTo(12, 0);
    expect(next.aperture).toBe(11);
    expect(next.iso).toBe(100);
  });

  it('leaves values unchanged when the target EV cannot be reached', () => {
    const next = applyParamChange(base, 'aperture', 1.0, locks('iso'), 20);
    expect(next).toEqual(base);
  });
});

describe('applyTargetEV', () => {
  it('reaches the scene EV by adjusting the shutter when only ISO is locked', () => {
    const next = applyTargetEV({ aperture: 8, shutter: 1, iso: 100 }, 13, locks('iso'));
    expect(next.aperture).toBe(8);
    expect(next.iso).toBe(100);
    expect(next.shutter).toBe(1 / 125);
  });

  it('solves the free parameter when two are locked', () => {
    const next = applyTargetEV(
      { aperture: 8, shutter: 1 / 125, iso: 400 },
      15,
      locks('shutter', 'iso')
    );
    expect(next.shutter).toBe(1 / 125);
    expect(next.iso).toBe(400);
    expect(ev(next)).toBeCloseTo(15, 0);
  });
});

describe('isAutoAdjusted', () => {
  it('marks the only free parameter as automatic', () => {
    expect(isAutoAdjusted('aperture', locks('shutter', 'iso'), false)).toBe(true);
  });

  it('marks the shutter as automatic under EV lock with one other lock', () => {
    expect(isAutoAdjusted('shutter', locks('iso'), true)).toBe(true);
    expect(isAutoAdjusted('aperture', locks('iso'), true)).toBe(false);
  });

  it('never marks a locked parameter', () => {
    expect(isAutoAdjusted('iso', locks('iso'), true)).toBe(false);
  });
});

describe('toggleParamLock', () => {
  it('keeps at most two locks, unlocking a non-ISO one first', () => {
    const next = toggleParamLock(locks('iso', 'aperture'), 'shutter', false);
    expect([...next].sort()).toEqual(['iso', 'shutter']);
  });

  it('keeps ISO locked when everything would be unlocked under EV lock', () => {
    expect([...toggleParamLock(locks('aperture'), 'aperture', true)]).toEqual(['iso']);
    expect([...toggleParamLock(locks('aperture'), 'aperture', false)]).toEqual([]);
  });
});
