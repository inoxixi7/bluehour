import type { TFunction } from 'i18next';
import { getDailyTip, getShootingAdvice } from '../homeContent';

// 直接返回 key，便于断言选中了哪条文案
const t = ((key: string) => key) as unknown as TFunction;
const at = (iso: string) => new Date(iso);

describe('getShootingAdvice', () => {
  it('uses the default advice before the light phase is known', () => {
    const advice = getShootingAdvice(null, t, 0, at('2026-01-01T00:00:00Z'));
    expect(advice.title).toMatch(/^home\.advice\.default\.title[12]$/);
  });

  it.each([
    ['daylight', 'day'],
    ['morningBlueHour', 'blue'],
    ['eveningBlueHour', 'blue'],
    ['nextMorningBlueHour', 'blue'],
    ['night', 'night'],
    ['eveningGoldenHour', 'night'],
  ])('maps phase %s to the %s advice group', (phase, group) => {
    const advice = getShootingAdvice(phase, t, 0, at('2026-01-01T00:00:00Z'));
    expect(advice.title.startsWith(`home.advice.${group}.title`)).toBe(true);
    expect(advice.description.replace('desc', 'title')).toBe(advice.title);
  });

  it('rotates the advice on refresh', () => {
    const now = at('2026-01-01T00:00:00Z');
    const first = getShootingAdvice('daylight', t, 0, now);
    const second = getShootingAdvice('daylight', t, 1, now);
    expect(second.title).not.toBe(first.title);
  });
});

describe('getDailyTip', () => {
  it('changes from one day to the next', () => {
    const a = getDailyTip(t, new Date(2026, 4, 1, 12));
    const b = getDailyTip(t, new Date(2026, 4, 2, 12));
    expect(a.content).not.toBe(b.content);
    expect(a.content).toMatch(/^home\.tips\.items\./);
  });
});
