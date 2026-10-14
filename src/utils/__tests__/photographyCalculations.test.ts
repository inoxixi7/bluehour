import { RECIPROCITY_PROFILES } from '../../constants/Photography';
import {
  applyReciprocityCorrection,
  calculateEV,
  calculateEquivalentExposure,
  calculateEquivalentExposureWithEV,
  calculateNDShutter,
  calculateReciprocity,
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

describe('calculateEquivalentExposureWithEV', () => {
  it('solves the shutter speed for a target EV at ISO 400', () => {
    const result = calculateEquivalentExposureWithEV(15, 'aperture', 16, 'iso', {
      aperture: 16,
      shutter: 1 / 30,
      iso: 400,
    });
    expect(result?.shutter).toBe(1 / 500);
  });

  it('returns null when the target cannot be reached', () => {
    const result = calculateEquivalentExposureWithEV(20, 'aperture', 1.4, 'iso', {
      aperture: 1.4,
      shutter: 1,
      iso: 25600,
    });
    expect(result).toBeNull();
  });
});

describe('calculateEquivalentExposure', () => {
  it('shortens the shutter by one stop when ISO doubles', () => {
    const result = calculateEquivalentExposure(
      { aperture: 8, shutter: 1 / 125, iso: 100 },
      'iso',
      200,
      'aperture'
    );
    expect(result.shutter).toBe(1 / 250);
    expect(result.aperture).toBe(8);
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
    expect(calculateReciprocity(240, acros).extraStops).toBeCloseTo(0.5, 6);
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
