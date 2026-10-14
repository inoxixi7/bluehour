import type { TFunction } from 'i18next';

export interface ShootingAdvice {
  icon: string;
  title: string;
  description: string;
}

type AdviceGroup = 'default' | 'day' | 'blue' | 'night';

const ADVICE_ICONS: Record<AdviceGroup, string[]> = {
  default: ['⏱️', '📸'],
  day: ['🗺️', '🔍', '🏞️'],
  blue: ['⚖️', '🏙️', '🌆'],
  night: ['✨', '🌌', '🚗'],
};

const adviceGroupForPhase = (phaseId: string | null): AdviceGroup => {
  switch (phaseId) {
    case null:
      return 'default';
    case 'daylight':
      return 'day';
    case 'eveningBlueHour':
    case 'morningBlueHour':
    case 'nextMorningBlueHour':
      return 'blue';
    default:
      return 'night';
  }
};

/**
 * 根据当前光线阶段给出拍摄建议
 * 每小时轮换一条；下拉刷新（refreshCount 增加）时也会换一条
 */
export const getShootingAdvice = (
  phaseId: string | null,
  t: TFunction,
  refreshCount: number,
  now: Date = new Date()
): ShootingAdvice => {
  const group = adviceGroupForPhase(phaseId);
  const icons = ADVICE_ICONS[group];
  const index = (refreshCount + Math.floor(now.getTime() / 1000 / 3600)) % icons.length;
  const n = index + 1;
  return {
    icon: icons[index],
    title: t(`home.advice.${group}.title${n}`),
    description: t(`home.advice.${group}.desc${n}`),
  };
};

const TIP_KEYS = ['tripod', 'aperture', 'iso', 'raw', 'foreground'];

/**
 * 每日贴士：按一年中的第几天轮换
 */
export const getDailyTip = (t: TFunction, now: Date = new Date()) => {
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  return {
    title: t('home.tips.title'),
    content: t(`home.tips.items.${TIP_KEYS[dayOfYear % TIP_KEYS.length]}`),
  };
};
