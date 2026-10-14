import { formatDateKey, formatTimezoneOffset } from '../timezone';

describe('formatDateKey', () => {
  it('uses the calendar date of the given timezone', () => {
    // 2026-01-01 23:30 UTC 在东京已是 1 月 2 日，在纽约仍是 1 月 1 日
    const date = new Date('2026-01-01T23:30:00Z');
    expect(formatDateKey(date, 'Asia/Tokyo')).toBe('2026-01-02');
    expect(formatDateKey(date, 'America/New_York')).toBe('2026-01-01');
  });

  it('falls back to the local date without a timezone', () => {
    const date = new Date(2026, 4, 9, 0, 30);
    expect(formatDateKey(date)).toBe('2026-05-09');
  });
});

describe('formatTimezoneOffset', () => {
  it.each([
    [480, 'UTC+8'],
    [-300, 'UTC-5'],
    [330, 'UTC+5:30'],
  ])('formats %p minutes as %p', (minutes, expected) => {
    expect(formatTimezoneOffset(minutes)).toBe(expected);
  });
});
