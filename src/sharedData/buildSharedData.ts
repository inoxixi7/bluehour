/**
 * 生成 iOS / Android 原生版本共用的数据与测试向量
 *
 * - shared/data/*.json：胶片倒易率数据、摄影常量（原生 App 直接读取）
 * - shared/test-vectors/*.json：由当前 TypeScript 实现算出的输入 → 输出，
 *   原生实现必须在容差内复现这些结果
 *
 * 文件由 `npm run shared:update` 生成；`npm test` 会检查文件与代码是否一致。
 */

import { FILM_RECIPROCITY_DATA } from '../constants/FilmReciprocity';
import {
  APERTURE_VALUES,
  EV_SCENES,
  ISO_VALUES,
  ND_FILTERS,
  SHUTTER_SPEEDS,
} from '../constants/Photography';
import {
  ExposureParam,
  ExposureValues,
  applyParamChange,
  applyTargetEV,
  isAutoAdjusted,
  toggleParamLock,
} from '../utils/exposureLocks';
import i18n from '../locales/i18n';
import { formatExtraStops, formatShutterSpeed } from '../utils/formatters';
import {
  calculateDepthOfField,
  calculateEV,
  calculateEquivalentExposure,
  calculateEquivalentExposureWithEV,
  calculateHyperFocalDistance,
  calculateNDShutter,
  calculateReciprocity,
} from '../utils/photographyCalculations';
import {
  calculateGoldenAndBlueHours,
  calculateSunTimesLocally,
  getSolarElevation,
} from '../utils/sunPosition';
import {
  buildLightTimeline,
  getCurrentPhaseState,
  getNextBlueHourWindow,
} from '../utils/lightPhases';
import { ProcessedSunTimes } from '../types/api';

/** 数据格式版本，结构变化时递增 */
export const SHARED_DATA_VERSION = 1;

const PARAMS: readonly ExposureParam[] = ['aperture', 'shutter', 'iso'];

/** JSON 不能表示 Infinity，用 null 代替 */
const finiteOrNull = (value: number): number | null => (Number.isFinite(value) ? value : null);

/** 所有锁定组合（保持 aperture → shutter → iso 的顺序） */
const LOCK_SUBSETS: ExposureParam[][] = [
  [],
  ['aperture'],
  ['shutter'],
  ['iso'],
  ['aperture', 'shutter'],
  ['aperture', 'iso'],
  ['shutter', 'iso'],
  ['aperture', 'shutter', 'iso'],
];

// ---- 数据 ----

const buildFilms = () => ({
  version: SHARED_DATA_VERSION,
  films: FILM_RECIPROCITY_DATA.map(film => ({
    id: film.id,
    name: film.name,
    iso: film.iso,
    type: film.type,
    source: film.source,
    maxReliableSeconds: film.maxReliableSeconds ?? null,
    model:
      film.model.kind === 'table'
        ? { kind: 'table', points: film.model.points.map(([tm, tc]) => [tm, tc]) }
        : film.model,
  })),
});

const buildPhotography = () => ({
  version: SHARED_DATA_VERSION,
  apertures: APERTURE_VALUES,
  shutterSpeeds: SHUTTER_SPEEDS,
  isos: ISO_VALUES,
  ndFilters: ND_FILTERS,
  evScenes: EV_SCENES,
});

// ---- 测试向量 ----

const METERED_SECONDS = [0, 0.25, 0.5, 1, 2, 3, 5, 10, 30, 60, 100, 128, 200, 240, 500, 1000, 3600];

const buildReciprocityVectors = () => ({
  description:
    'calculateReciprocity(meteredSeconds, film)：校正时间、额外档数、是否超出可靠范围（外推）',
  cases: FILM_RECIPROCITY_DATA.flatMap(film =>
    METERED_SECONDS.map(meteredSeconds => ({
      filmId: film.id,
      meteredSeconds,
      ...calculateReciprocity(meteredSeconds, film),
    }))
  ),
});

const BASE_SETTINGS: ExposureValues[] = [
  { aperture: 8, shutter: 1 / 125, iso: 100 },
  { aperture: 2.8, shutter: 1 / 60, iso: 400 },
  { aperture: 16, shutter: 30, iso: 50 },
];

const NEW_VALUES: Record<ExposureParam, number[]> = {
  aperture: [1.4, 4, 11, 22],
  shutter: [1 / 4000, 1 / 30, 2, 240],
  iso: [50, 200, 1600, 12800],
};

const buildExposureVectors = () => {
  const ev = [1.4, 2.8, 5.6, 8, 16, 22].flatMap(aperture =>
    [1 / 1000, 1 / 60, 1 / 4, 1, 30].flatMap(shutter =>
      [50, 100, 400, 3200].map(iso => ({
        aperture,
        shutter,
        iso,
        ev: calculateEV(aperture, shutter, iso),
      }))
    )
  );

  const ndShutter = [1 / 125, 1 / 8, 1, 4].flatMap(baseShutter =>
    [1, 3, 6, 10].map(ndStops => ({
      baseShutter,
      ndStops,
      shutter: calculateNDShutter(baseShutter, ndStops),
    }))
  );

  const equivalent = BASE_SETTINGS.flatMap(base =>
    PARAMS.flatMap(changedParam =>
      PARAMS.filter(p => p !== changedParam).flatMap(lockedParam =>
        NEW_VALUES[changedParam].map(newValue => ({
          base,
          changedParam,
          newValue,
          lockedParam,
          result: calculateEquivalentExposure(base, changedParam, newValue, lockedParam),
        }))
      )
    )
  );

  const equivalentWithEV = [-4, 0, 8, 12, 15, 20].flatMap(targetEV =>
    BASE_SETTINGS.flatMap(current =>
      PARAMS.flatMap(changedParam =>
        PARAMS.filter(p => p !== changedParam).flatMap(lockedParam =>
          NEW_VALUES[changedParam].slice(1, 3).map(newValue => ({
            targetEV,
            changedParam,
            newValue,
            lockedParam,
            current,
            result: calculateEquivalentExposureWithEV(
              targetEV,
              changedParam,
              newValue,
              lockedParam,
              current
            ),
          }))
        )
      )
    )
  );

  return {
    description:
      'calculateEV / calculateNDShutter / calculateEquivalentExposure / calculateEquivalentExposureWithEV（result 为 null 表示无法达到目标 EV）',
    ev,
    ndShutter,
    equivalent,
    equivalentWithEV,
  };
};

const buildExposureLockVectors = () => {
  const applyParamChangeCases = BASE_SETTINGS.slice(0, 2).flatMap(values =>
    LOCK_SUBSETS.filter(locked => locked.length < 3).flatMap(locked =>
      [null, 10].flatMap(targetEV =>
        PARAMS.flatMap(param =>
          NEW_VALUES[param].slice(1, 3).map(value => ({
            values,
            param,
            value,
            locked,
            targetEV,
            result: applyParamChange(values, param, value, new Set(locked), targetEV),
          }))
        )
      )
    )
  );

  const applyTargetEVCases = BASE_SETTINGS.flatMap(values =>
    LOCK_SUBSETS.filter(locked => locked.length < 3).flatMap(locked =>
      [-2, 5, 11, 16].map(targetEV => ({
        values,
        targetEV,
        locked,
        result: applyTargetEV(values, targetEV, new Set(locked)),
      }))
    )
  );

  const isAutoAdjustedCases = LOCK_SUBSETS.flatMap(locked =>
    [false, true].flatMap(evLocked =>
      PARAMS.map(param => ({
        param,
        locked,
        evLocked,
        result: isAutoAdjusted(param, new Set(locked), evLocked),
      }))
    )
  );

  // toggleParamLock 的结果与集合的插入顺序有关，因此输入、输出都按插入顺序记录
  const lockOrders = LOCK_SUBSETS.filter(locked => locked.length < 3).flatMap(locked =>
    locked.length === 2 ? [locked, [...locked].reverse()] : [locked]
  );
  const toggleParamLockCases = lockOrders.flatMap(locked =>
    [false, true].flatMap(evLocked =>
      PARAMS.map(param => ({
        locked,
        param,
        evLocked,
        result: Array.from(toggleParamLock(new Set(locked), param, evLocked)),
      }))
    )
  );

  return {
    description:
      'exposureLocks.ts：locked 为按插入顺序排列的锁定参数；toggleParamLock 的 result 也按插入顺序',
    applyParamChange: applyParamChangeCases,
    applyTargetEV: applyTargetEVCases,
    isAutoAdjusted: isAutoAdjustedCases,
    toggleParamLock: toggleParamLockCases,
  };
};

const LOCATIONS = [
  { name: 'Tokyo', lat: 35.6762, lng: 139.6503 },
  { name: 'Zurich', lat: 47.3769, lng: 8.5417 },
  { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
  { name: 'Sydney', lat: -33.8688, lng: 151.2093 },
  { name: 'Quito', lat: -0.1807, lng: -78.4678 },
  { name: 'Reykjavik', lat: 64.1466, lng: -21.9426 },
  { name: 'Tromso', lat: 69.6492, lng: 18.9553 },
];

const DATES = ['2026-03-20', '2026-06-21', '2026-09-23', '2026-12-21'];

const toEpochMs = (date: Date) => date.getTime();

const mapDates = <T extends Record<string, Date | number>>(obj: T) =>
  Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      value instanceof Date ? toEpochMs(value) : value,
    ])
  );

const buildSunVectors = () => {
  const elevation = LOCATIONS.flatMap(({ name, lat, lng }) =>
    [
      '2026-01-15T00:00:00Z',
      '2026-03-20T06:30:15Z',
      '2026-06-21T12:00:00Z',
      '2026-09-23T18:45:30Z',
      '2026-12-21T23:59:59Z',
    ].map(iso => ({
      location: name,
      lat,
      lng,
      epochMs: Date.parse(iso),
      elevation: getSolarElevation(new Date(iso), lat, lng),
    }))
  );

  const sunTimes = LOCATIONS.flatMap(({ name, lat, lng }) =>
    DATES.map(date => {
      const local = calculateSunTimesLocally(lat, lng, date);
      return {
        location: name,
        lat,
        lng,
        date,
        result: mapDates({ ...local }),
        goldenAndBlueHours: mapDates(
          calculateGoldenAndBlueHours(local.sunrise, local.sunset, lat, lng)
        ),
      };
    })
  );

  return {
    description:
      'sunPosition.ts：时间均为 UTC 毫秒时间戳。注意 getSolarElevation 只取到整秒（忽略毫秒）。' +
      'goldenAndBlueHours = calculateGoldenAndBlueHours(本地计算的日出, 日落, lat, lng)',
    elevation,
    sunTimes,
  };
};

const buildOpticsVectors = () => {
  const depthOfField = [1.8, 5.6, 16].flatMap(aperture =>
    [24, 50, 200].flatMap(focalLength =>
      [0.5, 3, 20].flatMap(distance =>
        [0.029, 0.019].map(coc => {
          const result = calculateDepthOfField(aperture, focalLength, distance, coc);
          return {
            aperture,
            focalLength,
            distance,
            coc,
            result: Object.fromEntries(
              Object.entries(result).map(([key, value]) => [key, finiteOrNull(value)])
            ),
          };
        })
      )
    )
  );

  const hyperFocal = [2.8, 8, 22].flatMap(aperture =>
    [16, 35, 85].map(focalLength => ({
      aperture,
      focalLength,
      coc: 0.029,
      result: calculateHyperFocalDistance(aperture, focalLength, 0.029),
    }))
  );

  return {
    description: '景深与超焦距（米）；null 表示无穷远',
    depthOfField,
    hyperFocal,
  };
};

const UNIT_KEYS = ['second', 'seconds', 'sec', 'minutes', 'min', 'hours'] as const;

/** 调用前需要把 i18n 切换到英文（见 sharedData.test.ts） */
const buildFormatterVectors = () => ({
  description:
    '格式化函数。formatExtraStops 与语言无关（负号为 U+2212）；' +
    'formatShutterSpeed 使用英文单位 shutterUnits（原生版本用各自语言的单位替换）',
  formatExtraStops: [-1.66, -0.04, 0, 0.04, 0.05, 1 / 3, 0.5, 1, 2.3333, 3.66].map(stops => ({
    stops,
    result: formatExtraStops(stops),
  })),
  shutterUnits: Object.fromEntries(UNIT_KEYS.map(key => [key, i18n.t(`common.units.${key}`)])),
  formatShutterSpeed: [
    0,
    -1,
    1 / 8000,
    1 / 250,
    1 / 3,
    0.29,
    0.4,
    0.6,
    0.97,
    1,
    1.04,
    1.26,
    2,
    9.96,
    10,
    30,
    59.6,
    60,
    75,
    120,
    599,
    3600,
    4020,
    5430,
    86400,
    172800,
  ].map(seconds => ({ seconds, result: formatShutterSpeed(seconds) })),
});

const MINUTE_MS = 60 * 1000;

const buildLightPhaseVectors = () => {
  const cases = LOCATIONS.filter(({ name }) =>
    ['Tokyo', 'Zurich', 'Tromso'].includes(name)
  ).flatMap(({ name, lat, lng }) =>
    DATES.map(date => {
      const local = calculateSunTimesLocally(lat, lng, date);
      // buildLightTimeline 等只用到黄金 / 蓝调时刻字段
      const hours = calculateGoldenAndBlueHours(local.sunrise, local.sunset, lat, lng);
      const sunTimes = hours as unknown as ProcessedSunTimes;
      const timeline = buildLightTimeline(sunTimes);

      // 每个阶段的开始、中点、结束前 1 分钟，以及第一个阶段之前、最后一个阶段之后
      const first = timeline[0].start.getTime();
      const last = timeline[timeline.length - 1].end.getTime();
      const nows = [
        first - 3 * 60 * MINUTE_MS,
        ...timeline.flatMap(({ start, end }) => [
          start.getTime(),
          (start.getTime() + end.getTime()) / 2,
          end.getTime() - MINUTE_MS,
        ]),
        last + MINUTE_MS,
      ].map(Math.floor);

      return {
        location: name,
        lat,
        lng,
        date,
        goldenAndBlueHours: mapDates(hours),
        timeline: timeline.map(({ id, start, end }) => ({
          id,
          start: toEpochMs(start),
          end: toEpochMs(end),
        })),
        states: nows.map(nowMs => {
          const now = new Date(nowMs);
          const state = getCurrentPhaseState(timeline, now);
          const blue = getNextBlueHourWindow(sunTimes, now);
          return {
            nowMs,
            current: state?.current.id ?? null,
            next: state?.next.id ?? null,
            minutesUntilTransition: state?.minutesUntilTransition ?? null,
            progress: state?.progress ?? null,
            nextBlueHour: blue && {
              id: blue.id,
              start: toEpochMs(blue.start),
              end: toEpochMs(blue.end),
              isNextDay: blue.isNextDay,
            },
          };
        }),
      };
    })
  );

  return {
    description:
      'lightPhases.ts：goldenAndBlueHours 为输入（UTC 毫秒），timeline = buildLightTimeline，' +
      'states 为不同时刻的 getCurrentPhaseState 与 getNextBlueHourWindow',
    cases,
  };
};

/** 输出文件：相对 shared/ 的路径 → 内容 */
export const buildSharedFiles = (): Record<string, unknown> => ({
  'data/films.json': buildFilms(),
  'data/photography.json': buildPhotography(),
  'test-vectors/reciprocity.json': buildReciprocityVectors(),
  'test-vectors/exposure.json': buildExposureVectors(),
  'test-vectors/exposure-locks.json': buildExposureLockVectors(),
  'test-vectors/sun.json': buildSunVectors(),
  'test-vectors/light-phases.json': buildLightPhaseVectors(),
  'test-vectors/optics.json': buildOpticsVectors(),
  'test-vectors/formatters.json': buildFormatterVectors(),
});
