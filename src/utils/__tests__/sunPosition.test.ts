import { getSunTimes } from '../../api/sunTimeService';
import { calculateSunTimesLocally } from '../sunPosition';

const minutesBetween = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 60000;

describe('calculateSunTimesLocally', () => {
  it('matches published sunrise/sunset for London at the winter solstice', () => {
    const times = calculateSunTimesLocally(51.5074, -0.1278, '2026-12-21');
    expect(minutesBetween(times.sunrise, new Date('2026-12-21T08:04:00Z'))).toBeLessThan(3);
    expect(minutesBetween(times.sunset, new Date('2026-12-21T15:53:00Z'))).toBeLessThan(3);
  });

  it('matches published sunrise/sunset for Tokyo at the summer solstice', () => {
    const times = calculateSunTimesLocally(35.6762, 139.6503, '2026-06-21');
    // 东京当地 04:25 / 19:00（UTC+9）
    expect(minutesBetween(times.sunrise, new Date('2026-06-20T19:25:00Z'))).toBeLessThan(3);
    expect(minutesBetween(times.sunset, new Date('2026-06-21T10:00:00Z'))).toBeLessThan(3);
  });

  it('orders twilight phases correctly', () => {
    const t = calculateSunTimesLocally(48.8566, 2.3522, '2026-03-20');
    const order = [
      t.astronomicalTwilightBegin,
      t.nauticalTwilightBegin,
      t.civilTwilightBegin,
      t.sunrise,
      t.solarNoon,
      t.sunset,
      t.civilTwilightEnd,
      t.nauticalTwilightEnd,
      t.astronomicalTwilightEnd,
    ].map(d => d.getTime());
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  });

  it('does not throw during polar night', () => {
    const t = calculateSunTimesLocally(78.2232, 15.6267, '2026-12-21'); // 朗伊尔城
    expect(t.dayLengthSeconds).toBe(0);
  });
});

describe('getSunTimes offline fallback', () => {
  const originalFetch = global.fetch;
  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('falls back to local calculation when the API is unreachable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError('Network request failed'));
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    const times = await getSunTimes(51.5074, -0.1278, '2026-12-21');
    expect(minutesBetween(times.sunrise, new Date('2026-12-21T08:04:00Z'))).toBeLessThan(3);
    expect(times.morningGoldenHourStart.getTime()).toBeLessThan(
      times.morningGoldenHourEnd.getTime()
    );
    expect(times.dayLength).toBeGreaterThan(7 * 60);
    expect(times.dayLength).toBeLessThan(8 * 60);
  }, 15000); // 接口失败前会重试 3 次（约 3 秒）
});
