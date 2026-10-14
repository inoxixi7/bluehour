import { FILM_RECIPROCITY_DATA, FilmReciprocityData } from './FilmReciprocity';

// 光圈值（F值）列表
export const APERTURE_VALUES = [
  1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8, 3.2, 3.5, 4.0, 4.5, 5.0, 5.6, 6.3, 7.1, 8.0,
  9.0, 10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32,
];

// 快门速度列表（秒）
export const SHUTTER_SPEEDS = [
  // 高速快门
  { value: 1 / 8000, label: '1/8000s' },
  { value: 1 / 4000, label: '1/4000s' },
  { value: 1 / 2000, label: '1/2000s' },
  { value: 1 / 1000, label: '1/1000s' },
  { value: 1 / 500, label: '1/500s' },
  { value: 1 / 250, label: '1/250s' },
  { value: 1 / 125, label: '1/125s' },
  { value: 1 / 60, label: '1/60s' },
  { value: 1 / 30, label: '1/30s' },
  { value: 1 / 15, label: '1/15s' },
  { value: 1 / 8, label: '1/8s' },
  { value: 1 / 4, label: '1/4s' },
  { value: 1 / 2, label: '1/2s' },
  { value: 1, label: '1s' },
  // 长曝光
  { value: 2, label: '2s' },
  { value: 4, label: '4s' },
  { value: 8, label: '8s' },
  { value: 15, label: '15s' },
  { value: 30, label: '30s' },
  { value: 60, label: '1min' },
  { value: 120, label: '2min' },
  { value: 240, label: '4min' },
  { value: 480, label: '8min' },
  { value: 900, label: '15min' },
  { value: 1800, label: '30min' },
  { value: 3600, label: '1h' },
  { value: 7200, label: '2h' },
  { value: 14400, label: '4h' },
  { value: 28800, label: '8h' },
  { value: 43200, label: '12h' },
  { value: 86400, label: '24h' },
  { value: 172800, label: '48h' },
];

// ISO 值列表
export const ISO_VALUES = [
  50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200,
  4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600,
];

// ND 滤镜类型
export interface NDFilter {
  name: string;
  stops: number;
  factor: number;
}

export const ND_FILTERS: NDFilter[] = [
  { name: 'ND2 (0.3)', stops: 1, factor: 2 },
  { name: 'ND4 (0.6)', stops: 2, factor: 4 },
  { name: 'ND8 (0.9)', stops: 3, factor: 8 },
  { name: 'ND16 (1.2)', stops: 4, factor: 16 },
  { name: 'ND32 (1.5)', stops: 5, factor: 32 },
  { name: 'ND64 (1.8)', stops: 6, factor: 64 },
  { name: 'ND128 (2.1)', stops: 7, factor: 128 },
  { name: 'ND256 (2.4)', stops: 8, factor: 256 },
  { name: 'ND512 (2.7)', stops: 9, factor: 512 },
  { name: 'ND1000 (3.0)', stops: 10, factor: 1024 },
  { name: 'ND2000 (3.3)', stops: 11, factor: 2048 },
  { name: 'ND4000 (3.6)', stops: 12, factor: 4096 },
];

export interface ReciprocityProfile extends FilmReciprocityData {
  nameKey: string;
  descriptionKey: string;
}

const RECIPROCITY_KEY_PREFIX = 'calculator.exposureLab.reciprocity';

/**
 * 倒易律配置列表（第一项为数码，无需补偿）
 * 数据与模型定义见 ./FilmReciprocity.ts
 */
export const RECIPROCITY_PROFILES: ReciprocityProfile[] = FILM_RECIPROCITY_DATA.map(film => ({
  ...film,
  nameKey: `${RECIPROCITY_KEY_PREFIX}.${film.id}`,
  descriptionKey: `${RECIPROCITY_KEY_PREFIX}.${film.id}Description`,
}));

// 相机传感器类型
export interface SensorType {
  name: string;
  cropFactor: number;
}

export const SENSOR_TYPES: SensorType[] = [
  { name: '全画幅 (Full Frame)', cropFactor: 1.0 },
  { name: 'APS-C (Canon)', cropFactor: 1.6 },
  { name: 'APS-C (Nikon/Sony)', cropFactor: 1.5 },
  { name: 'M4/3 (Micro Four Thirds)', cropFactor: 2.0 },
  { name: '1" (CX)', cropFactor: 2.7 },
];

// 常用焦距
export const COMMON_FOCAL_LENGTHS = [
  14, 16, 18, 20, 24, 28, 35, 40, 50, 55, 85, 100, 105, 135, 200, 300, 400, 500, 600,
];

// 模糊圈直径（CoC，单位：mm）
// 用于景深计算
export const COC_BY_SENSOR: { [key: number]: number } = {
  1.0: 0.029, // 全画幅
  1.5: 0.019, // APS-C (Nikon/Sony)
  1.6: 0.018, // APS-C (Canon)
  2.0: 0.015, // M4/3
  2.7: 0.011, // 1"
};

// EV 场景参考表
export interface EVScene {
  ev: number;
  descriptionKey: string;
  icon: string;
  params: { aperture: number; shutter: number; iso: number };
}

export const EV_SCENES: EVScene[] = [
  {
    ev: 16,
    descriptionKey: 'calculator.ev.scenes.ev16',
    icon: '☀️',
    params: { aperture: 16, shutter: 1 / 250, iso: 100 },
  },
  {
    ev: 15,
    descriptionKey: 'calculator.ev.scenes.ev15',
    icon: '☀️',
    params: { aperture: 16, shutter: 1 / 125, iso: 100 },
  },
  {
    ev: 14,
    descriptionKey: 'calculator.ev.scenes.ev14',
    icon: '🌤️',
    params: { aperture: 11, shutter: 1 / 125, iso: 100 },
  },
  {
    ev: 13,
    descriptionKey: 'calculator.ev.scenes.ev13',
    icon: '⛅',
    params: { aperture: 8, shutter: 1 / 125, iso: 100 },
  },
  {
    ev: 12,
    descriptionKey: 'calculator.ev.scenes.ev12',
    icon: '☁️',
    params: { aperture: 5.6, shutter: 1 / 125, iso: 100 },
  },
  {
    ev: 11,
    descriptionKey: 'calculator.ev.scenes.ev11',
    icon: '🌥️',
    params: { aperture: 4, shutter: 1 / 125, iso: 100 },
  },
  {
    ev: 10,
    descriptionKey: 'calculator.ev.scenes.ev10',
    icon: '🌩️',
    params: { aperture: 2.8, shutter: 1 / 125, iso: 100 },
  },
  {
    ev: 9,
    descriptionKey: 'calculator.ev.scenes.ev9',
    icon: '🏙️',
    params: { aperture: 2.8, shutter: 1 / 60, iso: 100 },
  },
  {
    ev: 8,
    descriptionKey: 'calculator.ev.scenes.ev8',
    icon: '🌃',
    params: { aperture: 2.8, shutter: 1 / 30, iso: 100 },
  },
  {
    ev: 7,
    descriptionKey: 'calculator.ev.scenes.ev7',
    icon: '💡',
    params: { aperture: 2.8, shutter: 1 / 15, iso: 100 },
  },
  {
    ev: 6,
    descriptionKey: 'calculator.ev.scenes.ev6',
    icon: '🏠',
    params: { aperture: 2.8, shutter: 1 / 8, iso: 100 },
  },
  {
    ev: 5,
    descriptionKey: 'calculator.ev.scenes.ev5',
    icon: '🏮',
    params: { aperture: 2.8, shutter: 1 / 4, iso: 100 },
  },
  {
    ev: 4,
    descriptionKey: 'calculator.ev.scenes.ev4',
    icon: '🕯️',
    params: { aperture: 2.8, shutter: 1 / 2, iso: 100 },
  },
  {
    ev: 3,
    descriptionKey: 'calculator.ev.scenes.ev3',
    icon: '🌕',
    params: { aperture: 2.8, shutter: 1, iso: 100 },
  },
  {
    ev: 2,
    descriptionKey: 'calculator.ev.scenes.ev2',
    icon: '⚡',
    params: { aperture: 2.8, shutter: 2, iso: 100 },
  },
  {
    ev: 1,
    descriptionKey: 'calculator.ev.scenes.ev1',
    icon: '🌆',
    params: { aperture: 2.8, shutter: 4, iso: 100 },
  },
  {
    ev: 0,
    descriptionKey: 'calculator.ev.scenes.ev0',
    icon: '✨',
    params: { aperture: 2.8, shutter: 8, iso: 100 },
  },
  {
    ev: -1,
    descriptionKey: 'calculator.ev.scenes.evMinus1',
    icon: '🌌',
    params: { aperture: 2.8, shutter: 15, iso: 100 },
  },
  {
    ev: -2,
    descriptionKey: 'calculator.ev.scenes.evMinus2',
    icon: '🔭',
    params: { aperture: 2.8, shutter: 30, iso: 100 },
  },
  {
    ev: -3,
    descriptionKey: 'calculator.ev.scenes.evMinus3',
    icon: '🌑',
    params: { aperture: 2.8, shutter: 60, iso: 100 },
  },
  {
    ev: -4,
    descriptionKey: 'calculator.ev.scenes.evMinus4',
    icon: '🌑',
    params: { aperture: 2.8, shutter: 120, iso: 100 },
  },
  {
    ev: -5,
    descriptionKey: 'calculator.ev.scenes.evMinus5',
    icon: '🌑',
    params: { aperture: 2.8, shutter: 240, iso: 100 },
  },
  {
    ev: -6,
    descriptionKey: 'calculator.ev.scenes.evMinus6',
    icon: '🌑',
    params: { aperture: 2.8, shutter: 480, iso: 100 },
  },
];

export const PRESET_SHUTTERS = [
  { value: 1 / 64000, label: '1/64000s' },
  { value: 1 / 32000, label: '1/32000s' },
  { value: 1 / 16000, label: '1/16000s' },
  { value: 1 / 8000, label: '1/8000s' },
  { value: 1 / 4000, label: '1/4000s' },
  { value: 1 / 2000, label: '1/2000s' },
  { value: 1 / 1000, label: '1/1000s' },
  { value: 1 / 500, label: '1/500s' },
  { value: 1 / 250, label: '1/250s' },
  { value: 1 / 125, label: '1/125s' },
  { value: 1 / 60, label: '1/60s' },
  { value: 1 / 30, label: '1/30s' },
  { value: 1 / 15, label: '1/15s' },
  { value: 1 / 8, label: '1/8s' },
  { value: 1 / 4, label: '1/4s' },
  { value: 1 / 2, label: '1/2s' },
  { value: 1, label: '1s' },
  { value: 2, label: '2s' },
  { value: 4, label: '4s' },
  { value: 8, label: '8s' },
  { value: 15, label: '15s' },
  { value: 30, label: '30s' },
  { value: 60, label: '1m' },
  { value: 120, label: '2m' },
  { value: 240, label: '4m' },
  { value: 480, label: '8m' },
  { value: 900, label: '15m' },
  { value: 1800, label: '30m' },
  { value: 3600, label: '1h' },
  { value: 7200, label: '2h' },
  { value: 14400, label: '4h' },
  { value: 28800, label: '8h' },
  { value: 43200, label: '12h' },
  { value: 86400, label: '24h' },
  { value: 172800, label: '2d 0h' },
];

export const PRESET_APERTURES = [
  0.5, 0.7, 0.95, 1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8, 3.2, 3.5, 4.0, 4.5, 5.0, 5.6,
  6.3, 7.1, 8.0, 9.0, 10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32, 36, 40, 45, 51, 57, 64, 72, 81,
  90, 101, 114, 128, 144, 161, 180, 203, 228, 256,
];

export const PRESET_ISOS = [
  1, 3, 6, 12, 25, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600,
  2000, 2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600, 51200, 102400,
  204800, 409600, 509600,
];
