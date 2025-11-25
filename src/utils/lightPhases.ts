import { ProcessedSunTimes } from '../types/api';

export type LightPhaseId =
  | 'morningBlueHour'
  | 'morningGoldenHour'
  | 'daylight'
  | 'eveningGoldenHour'
  | 'eveningBlueHour'
  | 'night'
  | 'nextMorningBlueHour';

export interface LightPhaseSegment {
  id: LightPhaseId;
  labelKey: string;
  start: Date;
  end: Date;
  icon: string;
  accent: 'blueHour' | 'goldenHour' | 'primary' | 'twilight' | 'textTertiary';
}

export interface PhaseState {
  current: LightPhaseSegment;
  next: LightPhaseSegment;
  minutesUntilTransition: number;
  progress: number;
}

export interface BlueHourWindow {
  id: 'morning' | 'evening' | 'tomorrow';
  start: Date;
  end: Date;
  labelKey: string;
  isNextDay: boolean;
}

const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const buildLightTimeline = (sunTimes: ProcessedSunTimes): LightPhaseSegment[] => {
  const nextMorningBlueStart = addDays(sunTimes.morningBlueHourStart, 1);
  const nextMorningBlueEnd = addDays(sunTimes.morningBlueHourEnd, 1);

  return [
    {
      id: 'morningBlueHour',
      labelKey: 'sunTimes.phases.morningBlueHour',
      start: sunTimes.morningBlueHourStart,
      end: sunTimes.morningBlueHourEnd,
      icon: '🔵',
      accent: 'blueHour',
    },
    {
      id: 'morningGoldenHour',
      labelKey: 'sunTimes.phases.morningGoldenHour',
      start: sunTimes.morningGoldenHourStart,
      end: sunTimes.morningGoldenHourEnd,
      icon: '✨',
      accent: 'goldenHour',
    },
    {
      id: 'daylight',
      labelKey: 'sunTimes.phases.daylight',
      start: sunTimes.morningGoldenHourEnd,
      end: sunTimes.eveningGoldenHourStart,
      icon: '☀️',
      accent: 'primary',
    },
    {
      id: 'eveningGoldenHour',
      labelKey: 'sunTimes.phases.eveningGoldenHour',
      start: sunTimes.eveningGoldenHourStart,
      end: sunTimes.eveningGoldenHourEnd,
      icon: '✨',
      accent: 'goldenHour',
    },
    {
      id: 'eveningBlueHour',
      labelKey: 'sunTimes.phases.eveningBlueHour',
      start: sunTimes.eveningBlueHourStart,
      end: sunTimes.eveningBlueHourEnd,
      icon: '🌆',
      accent: 'blueHour',
    },
    {
      id: 'night',
      labelKey: 'sunTimes.phases.night',
      start: sunTimes.eveningBlueHourEnd,
      end: nextMorningBlueStart,
      icon: '🌙',
      accent: 'textTertiary',
    },
    {
      id: 'nextMorningBlueHour',
      labelKey: 'sunTimes.phases.morningBlueHour',
      start: nextMorningBlueStart,
      end: nextMorningBlueEnd,
      icon: '🔵',
      accent: 'blueHour',
    },
  ];
};

export const getCurrentPhaseState = (
  timeline: LightPhaseSegment[],
  now: Date
): PhaseState | null => {
  if (!timeline.length) {
    return null;
  }

  const nowTime = now.getTime();
  let currentIndex = timeline.length - 1;

  timeline.forEach((segment, index) => {
    if (nowTime >= segment.start.getTime() && nowTime < segment.end.getTime()) {
      currentIndex = index;
    }
  });

  const current = timeline[currentIndex];
  const next = timeline[(currentIndex + 1) % timeline.length];
  const total = current.end.getTime() - current.start.getTime();
  const elapsed = nowTime - current.start.getTime();

  const progress = total <= 0 ? 0 : clamp(elapsed / total, 0, 1);
  const minutesUntilTransition = Math.max(
    0,
    Math.round((current.end.getTime() - nowTime) / (1000 * 60))
  );

  return {
    current,
    next,
    minutesUntilTransition,
    progress,
  };
};

export const getNextBlueHourWindow = (
  sunTimes: ProcessedSunTimes,
  now: Date
): BlueHourWindow | null => {
  const windows: BlueHourWindow[] = [
    {
      id: 'morning',
      start: sunTimes.morningBlueHourStart,
      end: sunTimes.morningBlueHourEnd,
      labelKey: 'sunTimes.phases.morningBlueHour',
      isNextDay: false,
    },
    {
      id: 'evening',
      start: sunTimes.eveningBlueHourStart,
      end: sunTimes.eveningBlueHourEnd,
      labelKey: 'sunTimes.phases.eveningBlueHour',
      isNextDay: false,
    },
    {
      id: 'tomorrow',
      start: addDays(sunTimes.morningBlueHourStart, 1),
      end: addDays(sunTimes.morningBlueHourEnd, 1),
      labelKey: 'sunTimes.phases.morningBlueHour',
      isNextDay: true,
    },
  ];

  const nowTime = now.getTime();
  const upcoming = windows.find((window) => window.start.getTime() > nowTime);

  return upcoming || windows[windows.length - 1] || null;
};
