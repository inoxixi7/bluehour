import { RECIPROCITY_PROFILES } from '../../constants/Photography';
import {
  applyReciprocityCorrection,
  calculateEV,
  calculateNDShutter,
  calculateReciprocity,
  solveExposure,
} from '../photographyCalculations';

const profile = (id: string) => {
  const found = RECIPROCITY_PROFILES.find(p => p.id === id);
  if (!found) throw new Error(`missing profile ${id}`);
  return found;
};

describe('calculateEV', () => {
  it('matches the sunny-16 reference at ISO 100', () => {
    expect(calculateEV(16, 1 / 125, 100)).toBeCloseTo(15, 0);
  });

  it('describes the same scene regardless of ISO', () => {
    // ISO +2 档、快门 −2 档：同一场景，EV 不变
    expect(calculateEV(16, 1 / 500, 400)).toBe(calculateEV(16, 1 / 125, 100));
  });
});

describe('solveExposure', () => {
  it('solves the shutter for sunny 16 (aperture priority)', () => {
    const { values, outOfRangeStops } = solveExposure(15, 'shutter', {
      aperture: 16,
      shutter: 1,
      iso: 400,
    });
    expect(values).toEqual({ aperture: 16, shutter: 1 / 500, iso: 400 });
    expect(outOfRangeStops).toBe(0);
  });

  it('solves the aperture (shutter priority) and ISO (auto ISO)', () => {
    expect(
      solveExposure(15, 'aperture', { aperture: 2, shutter: 1 / 125, iso: 100 }).values.aperture
    ).toBe(16);
    expect(solveExposure(15, 'iso', { aperture: 16, shutter: 1 / 250, iso: 100 }).values.iso).toBe(
      200
    );
  });

  it('clamps to the range and reports the remaining error', () => {
    // EV 20 at f/1.4 ISO 25600 would need far shorter than 1/8000 s: overexposed
    const bright = solveExposure(20, 'shutter', { aperture: 1.4, shutter: 1, iso: 25600 });
    expect(bright.values.shutter).toBe(1 / 8000);
    expect(bright.outOfRangeStops).toBeGreaterThan(0);
    // EV -10 at f/32 ISO 100 needs about 12 days, past the 48h maximum: underexposed
    const dark = solveExposure(-10, 'shutter', { aperture: 32, shutter: 1, iso: 100 });
    expect(dark.outOfRangeStops).toBeLessThan(0);
  });
});

describe('calculateNDShutter', () => {
  it('multiplies the shutter by 2^stops', () => {
    expect(calculateNDShutter(1 / 4, 10)).toBe(256);
  });
});

describe('reciprocity correction', () => {
  it('does not change digital exposures', () => {
    expect(calculateReciprocity(120, profile('digital')).correctedSeconds).toBe(120);
  });

  it('hits the Kodak Tri-X datasheet points exactly', () => {
    const trix = profile('kodak_trix');
    expect(applyReciprocityCorrection(1, trix.model)).toBeCloseTo(2, 6);
    expect(applyReciprocityCorrection(10, trix.model)).toBeCloseTo(50, 6);
    expect(applyReciprocityCorrection(100, trix.model)).toBeCloseTo(1200, 6);
  });

  it('uses the Ilford power formula Tc = Tm^P', () => {
    const hp5 = profile('ilford_hp5');
    expect(applyReciprocityCorrection(30, hp5.model)).toBeCloseTo(Math.pow(30, 1.31), 6);
    expect(applyReciprocityCorrection(1, hp5.model)).toBe(1);
  });

  it('needs no compensation for Acros II up to 120s', () => {
    const acros = profile('fuji_acros');
    expect(applyReciprocityCorrection(120, acros.model)).toBe(120);
    // 官方数据：120–1000s 一律 +1/2 档
    expect(calculateReciprocity(130, acros).extraStops).toBeCloseTo(0.5, 6);
    expect(calculateReciprocity(1000, acros).extraStops).toBeCloseTo(0.5, 6);
  });

  it('is not capped for very long exposures', () => {
    // 旧模型把 Tri-X 的倍率截断在 6 倍
    const result = calculateReciprocity(100, profile('kodak_trix'));
    expect(result.correctedSeconds / 100).toBeCloseTo(12, 6);
  });

  it('flags results beyond the published data range', () => {
    const trix = profile('kodak_trix');
    expect(calculateReciprocity(100, trix).isExtrapolated).toBe(false);
    expect(calculateReciprocity(240, trix).isExtrapolated).toBe(true);
  });

  it.each(RECIPROCITY_PROFILES.map(p => [p.id, p] as const))(
    '%s is monotonic and never shorter than the metered time',
    (_id, film) => {
      let previous = 0;
      for (let t = 0.05; t < 20000; t *= 1.1) {
        const corrected = applyReciprocityCorrection(t, film.model);
        expect(corrected).toBeGreaterThanOrEqual(t - 1e-9);
        expect(corrected).toBeGreaterThanOrEqual(previous - 1e-9);
        previous = corrected;
      }
    }
  );
});
