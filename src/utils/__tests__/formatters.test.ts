import i18n, { initI18n } from '../../locales/i18n';
import { formatExtraStops, formatShutterSpeed } from '../formatters';

beforeAll(async () => {
  await initI18n();
  await i18n.changeLanguage('en');
});

describe('formatShutterSpeed', () => {
  it.each([
    [1 / 250, '1/250s'],
    [0.6, '0.6s'],
    [1, '1s'],
    [1.26, '1.3s'],
    [30, '30s'],
    [60, '1min'],
    [75, '1min15s'],
    [3600, '1h'],
    [4020, '1h7min'],
  ])('formats %p as %p', (seconds, expected) => {
    expect(formatShutterSpeed(seconds)).toBe(expected);
  });
});

describe('formatExtraStops', () => {
  it('shows the sign and one decimal', () => {
    expect(formatExtraStops(1.333)).toBe('+1.3 EV');
    expect(formatExtraStops(0)).toBe('±0.0 EV');
  });
});
