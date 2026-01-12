// 光圈值（F值）列表
export const APERTURE_VALUES = [
  1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8,
  3.2, 3.5, 4.0, 4.5, 5.0, 5.6, 6.3, 7.1, 8.0, 9.0,
  10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32
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
  50, 64, 80, 100, 125, 160, 200, 250, 320, 400,
  500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200,
  4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600
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

export interface ReciprocityCurvePoint {
  baseSeconds: number;
  correctedSeconds: number;
}

export interface ReciprocityProfile {
  id: string;
  nameKey: string;
  descriptionKey: string;
  hintKey: string;
  curve: ReciprocityCurvePoint[];
}

/**
 * 倒易律分段参数（三段式模型）
 */
interface ReciprocitySegmentParams {
  type: 'c41' | 'bw-modern' | 'bw-classic' | 'slide';
  T1: number;           // 幂函数结束点（秒）
  T2: number;           // 中段结束点（秒）
  p: number;            // 幂函数指数
  logK: number;         // 对数段系数
  maxMultiplier: number; // 超长曝光最大倍率
  note?: string;
}

const BASE_SECONDS = [1, 2, 4, 8, 15, 30, 60, 120, 240, 480, 900, 1800, 3600];

/**
 * Segmented Damping Model - 三段连续函数（C¹连续）
 * 这是感知建模（Perceptual Model），非化学仿真，所有参数均为相对尺度
 * 
 * Segment 1 (t ≤ T1): M(t) = 1 (Toe - 线性，无失败)
 * Segment 2 (T1 < t ≤ T2): M(t) = 1 + ((t - T1) / T1)^p (Mid - 非线性增长)
 * Segment 3 (t > T2): M(t) = min(M_T2 + ln(1 + (t - T2) / logK), maxM) (Shoulder - 对数阻尼)
 * 
 * 其中 M_T2 = 1 + ((T2 - T1) / T1)^p 保证 C¹ 连续性
 * t_corrected = t * M(t)
 */
const createSegmentedCurve = (params: ReciprocitySegmentParams) => {
  const { T1, T2, p, logK, maxMultiplier } = params;
  
  return BASE_SECONDS.map(t => {
    let M: number; // Exposure multiplier
    
    if (t <= T1) {
      // Segment 1: Toe - 无补偿
      M = 1;
    } else if (t <= T2) {
      // Segment 2: Mid - 非线性增长
      M = 1 + Math.pow((t - T1) / T1, p);
      // CRITICAL FIX: Zone B 也必须应用 maxMultiplier（HC-09 硬约束）
      M = Math.min(M, maxMultiplier);
    } else {
      // Segment 3: Shoulder - 对数阻尼
      // 计算连接点（保证连续性）- 使用截断后的 M_T2
      const M_T2_raw = 1 + Math.pow((T2 - T1) / T1, p);
      const M_T2 = Math.min(M_T2_raw, maxMultiplier);
      // 使用自然对数 ln
      const M_raw = M_T2 + Math.log(1 + (t - T2) / logK);
      // 限制最大倍率
      M = Math.min(M_raw, maxMultiplier);
    }
    
    const correctedSeconds = t * M;
    
    return {
      baseSeconds: t,
      correctedSeconds: Math.round(correctedSeconds)
    };
  });
};

/**
 * 简化的幂函数曲线（向后兼容）
 */
const createPowerCurve = (p: number) => {
  return BASE_SECONDS.map(t => ({
    baseSeconds: t,
    correctedSeconds: Math.round(Math.pow(t, p))
  }));
};

export const RECIPROCITY_PROFILES: ReciprocityProfile[] = [
  {
    id: 'digital',
    nameKey: 'calculator.exposureLab.reciprocity.digital',
    descriptionKey: 'calculator.exposureLab.reciprocity.digitalDescription',
    hintKey: 'calculator.exposureLab.reciprocity.digitalHint',
    curve: [],
  },
  // --- Foma (Fomapan) ---
  {
    id: 'foma100',
    nameKey: 'calculator.exposureLab.reciprocity.foma100',
    descriptionKey: 'calculator.exposureLab.reciprocity.foma100Description',
    hintKey: 'calculator.exposureLab.reciprocity.foma100Hint',
    curve: [
      { baseSeconds: 1, correctedSeconds: 1 },
      { baseSeconds: 2, correctedSeconds: 3 },
      { baseSeconds: 4, correctedSeconds: 9 },
      { baseSeconds: 8, correctedSeconds: 28 },
      { baseSeconds: 15, correctedSeconds: 65 },
      { baseSeconds: 30, correctedSeconds: 150 },
      { baseSeconds: 60, correctedSeconds: 360 },
    ],
  },
  {
    id: 'foma200',
    nameKey: 'calculator.exposureLab.reciprocity.foma200',
    descriptionKey: 'calculator.exposureLab.reciprocity.foma200Description',
    hintKey: 'calculator.exposureLab.reciprocity.foma200Hint',
    curve: [
      { baseSeconds: 1, correctedSeconds: 1 },
      { baseSeconds: 2, correctedSeconds: 3 },
      { baseSeconds: 4, correctedSeconds: 8 },
      { baseSeconds: 8, correctedSeconds: 22 },
      { baseSeconds: 15, correctedSeconds: 50 },
      { baseSeconds: 30, correctedSeconds: 110 },
      { baseSeconds: 60, correctedSeconds: 250 },
    ],
  },
  {
    id: 'foma400',
    nameKey: 'calculator.exposureLab.reciprocity.foma400',
    descriptionKey: 'calculator.exposureLab.reciprocity.foma400Description',
    hintKey: 'calculator.exposureLab.reciprocity.foma400Hint',
    curve: [
      { baseSeconds: 1, correctedSeconds: 1 },
      { baseSeconds: 2, correctedSeconds: 3 },
      { baseSeconds: 4, correctedSeconds: 9 },
      { baseSeconds: 8, correctedSeconds: 28 },
      { baseSeconds: 15, correctedSeconds: 65 },
      { baseSeconds: 30, correctedSeconds: 150 },
      { baseSeconds: 60, correctedSeconds: 360 },
    ],
  },
  // --- Kodak Motion Picture (Vision3) ---
  {
    id: 'kodak_50d',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_50d',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_50dDescription',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_50dHint',
    curve: createSegmentedCurve({ type: 'c41', T1: 30, T2: 300, p: 0.56, logK: 14, maxMultiplier: 4 }),
  },
  {
    id: 'kodak_250d',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_250d',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_250dDescription',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_250dHint',
    curve: createSegmentedCurve({ type: 'c41', T1: 30, T2: 300, p: 0.56, logK: 15, maxMultiplier: 4 }),
  },
  {
    id: 'kodak_500t',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_500t',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_500tDescription',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_500tHint',
    curve: createSegmentedCurve({ type: 'c41', T1: 30, T2: 300, p: 0.56, logK: 16, maxMultiplier: 4 }),
  },
  // --- Color Negative (C-41) ---
  {
    id: 'kodak_portra160',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_portra160',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_portra160Description',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_portra160Hint',
    curve: createSegmentedCurve({ type: 'c41', T1: 30, T2: 300, p: 0.56, logK: 17, maxMultiplier: 4 }),
  },
  {
    id: 'kodak_portra400',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_portra400',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_portra400Description',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_portra400Hint',
    curve: createSegmentedCurve({ type: 'c41', T1: 30, T2: 300, p: 0.56, logK: 17, maxMultiplier: 4 }),
  },
  {
    id: 'kodak_portra800',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_portra800',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_portra800Description',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_portra800Hint',
    curve: createSegmentedCurve({ type: 'c41', T1: 30, T2: 300, p: 0.56, logK: 18, maxMultiplier: 4 }),
  },
  {
    id: 'kodak_portra',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_portra',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_portraDescription',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_portraHint',
    curve: createSegmentedCurve({ type: 'c41', T1: 30, T2: 300, p: 0.56, logK: 17, maxMultiplier: 4 }),
  },
  {
    id: 'kodak_ektar100',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_ektar100',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_ektar100Description',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_ektar100Hint',
    curve: createSegmentedCurve({ type: 'c41', T1: 30, T2: 240, p: 0.63, logK: 21, maxMultiplier: 4 }),
  },
  {
    id: 'kodak_gold',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_gold',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_goldDescription',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_goldHint',
    curve: createSegmentedCurve({ type: 'c41', T1: 20, T2: 240, p: 0.6, logK: 22, maxMultiplier: 5 }),
  },
  {
    id: 'fuji_superia',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_superia',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_superiaDescription',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_superiaHint',
    curve: createSegmentedCurve({ type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 17, maxMultiplier: 4 }),
  },
  {
    id: 'fuji_superia200',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_superia200',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_superia200Description',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_superia200Hint',
    curve: createSegmentedCurve({ type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 17, maxMultiplier: 4 }),
  },
  {
    id: 'fuji_superia1600',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_superia1600',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_superia1600Description',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_superia1600Hint',
    curve: createSegmentedCurve({ type: 'c41', T1: 20, T2: 240, p: 0.6, logK: 21, maxMultiplier: 5 }),
  },
  {
    id: 'fuji_c200',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_c200',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_c200Description',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_c200Hint',
    curve: createSegmentedCurve({ type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 17, maxMultiplier: 4 }),
  },
  {
    id: 'fuji_color100',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_color100',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_color100Description',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_color100Hint',
    curve: createSegmentedCurve({ type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 17, maxMultiplier: 4 }),
  },
  {
    id: 'fuji_pro160c',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_pro160c',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_pro160cDescription',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_pro160cHint',
    curve: createSegmentedCurve({ type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 17, maxMultiplier: 4 }),
  },
  {
    id: 'fuji_pro160ns',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_pro160ns',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_pro160nsDescription',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_pro160nsHint',
    curve: createSegmentedCurve({ type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 17, maxMultiplier: 4 }),
  },
  {
    id: 'fuji_xtra400',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_xtra400',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_xtra400Description',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_xtra400Hint',
    curve: createSegmentedCurve({ type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 18, maxMultiplier: 4 }),
  },
  {
    id: 'fuji_nexia400',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_nexia400',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_nexia400Description',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_nexia400Hint',
    curve: createSegmentedCurve({ type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 18, maxMultiplier: 4 }),
  },
  {
    id: 'fuji_64t',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_64t',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_64tDescription',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_64tHint',
    curve: createSegmentedCurve({ type: 'c41', T1: 20, T2: 180, p: 0.44, logK: 11, maxMultiplier: 3 }),
  },
  {
    id: 'cinestill_800t',
    nameKey: 'calculator.exposureLab.reciprocity.cinestill_800t',
    descriptionKey: 'calculator.exposureLab.reciprocity.cinestill_800tDescription',
    hintKey: 'calculator.exposureLab.reciprocity.cinestill_800tHint',
    curve: createSegmentedCurve({ type: 'c41', T1: 30, T2: 300, p: 0.56, logK: 15, maxMultiplier: 4 }),
  },
  {
    id: 'lomo_cn',
    nameKey: 'calculator.exposureLab.reciprocity.lomo_cn',
    descriptionKey: 'calculator.exposureLab.reciprocity.lomo_cnDescription',
    hintKey: 'calculator.exposureLab.reciprocity.lomo_cnHint',
    curve: createSegmentedCurve({ type: 'c41', T1: 15, T2: 200, p: 0.65, logK: 27, maxMultiplier: 6 }),
  },
  {
    id: 'holga400',
    nameKey: 'calculator.exposureLab.reciprocity.holga400',
    descriptionKey: 'calculator.exposureLab.reciprocity.holga400Description',
    hintKey: 'calculator.exposureLab.reciprocity.holga400Hint',
    curve: createSegmentedCurve({ type: 'c41', T1: 20, T2: 240, p: 0.6, logK: 22, maxMultiplier: 5 }),
  },
  // --- Black & White ---
  {
    id: 'kodak_trix320',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_trix320',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_trix320Description',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_trix320Hint',
    curve: createSegmentedCurve({ type: 'bw-classic', T1: 10, T2: 120, p: 0.79, logK: 37, maxMultiplier: 8 }),
  },
  {
    id: 'kodak_trix',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_trix',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_trixDescription',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_trixHint',
    curve: createSegmentedCurve({ type: 'bw-classic', T1: 10, T2: 120, p: 0.79, logK: 37, maxMultiplier: 8 }),
  },
  {
    id: 'kodak_tmax100',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_tmax100',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_tmax100Description',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_tmax100Hint',
    curve: createSegmentedCurve({ type: 'bw-modern', T1: 60, T2: 600, p: 0.44, logK: 10, maxMultiplier: 3 }),
  },
  {
    id: 'kodak_tmax400',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_tmax400',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_tmax400Description',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_tmax400Hint',
    curve: createSegmentedCurve({ type: 'bw-modern', T1: 45, T2: 600, p: 0.51, logK: 12, maxMultiplier: 4 }),
  },
  {
    id: 'kodak_tmax3200',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_tmax3200',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_tmax3200Description',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_tmax3200Hint',
    curve: createSegmentedCurve({ type: 'bw-modern', T1: 45, T2: 600, p: 0.51, logK: 13, maxMultiplier: 4 }),
  },
  {
    id: 'ilford_hp5',
    nameKey: 'calculator.exposureLab.reciprocity.ilford_hp5',
    descriptionKey: 'calculator.exposureLab.reciprocity.ilford_hp5Description',
    hintKey: 'calculator.exposureLab.reciprocity.ilford_hp5Hint',
    curve: createSegmentedCurve({ type: 'bw-classic', T1: 12, T2: 180, p: 0.72, logK: 34, maxMultiplier: 8 }),
  },
  {
    id: 'ilford_fp4',
    nameKey: 'calculator.exposureLab.reciprocity.ilford_fp4',
    descriptionKey: 'calculator.exposureLab.reciprocity.ilford_fp4Description',
    hintKey: 'calculator.exposureLab.reciprocity.ilford_fp4Hint',
    curve: createSegmentedCurve({ type: 'bw-classic', T1: 10, T2: 120, p: 0.68, logK: 28, maxMultiplier: 6 }),
  },
  {
    id: 'ilford_delta100',
    nameKey: 'calculator.exposureLab.reciprocity.ilford_delta100',
    descriptionKey: 'calculator.exposureLab.reciprocity.ilford_delta100Description',
    hintKey: 'calculator.exposureLab.reciprocity.ilford_delta100Hint',
    curve: createSegmentedCurve({ type: 'bw-modern', T1: 60, T2: 600, p: 0.44, logK: 10, maxMultiplier: 3 }),
  },
  {
    id: 'ilford_delta400',
    nameKey: 'calculator.exposureLab.reciprocity.ilford_delta400',
    descriptionKey: 'calculator.exposureLab.reciprocity.ilford_delta400Description',
    hintKey: 'calculator.exposureLab.reciprocity.ilford_delta400Hint',
    curve: createSegmentedCurve({ type: 'bw-modern', T1: 45, T2: 600, p: 0.51, logK: 13, maxMultiplier: 4 }),
  },
  {
    id: 'ilford_delta3200',
    nameKey: 'calculator.exposureLab.reciprocity.ilford_delta3200',
    descriptionKey: 'calculator.exposureLab.reciprocity.ilford_delta3200Description',
    hintKey: 'calculator.exposureLab.reciprocity.ilford_delta3200Hint',
    curve: createSegmentedCurve({ type: 'bw-modern', T1: 45, T2: 600, p: 0.51, logK: 13, maxMultiplier: 4 }),
  },
  {
    id: 'ilford_panf',
    nameKey: 'calculator.exposureLab.reciprocity.ilford_panf',
    descriptionKey: 'calculator.exposureLab.reciprocity.ilford_panfDescription',
    hintKey: 'calculator.exposureLab.reciprocity.ilford_panfHint',
    curve: createSegmentedCurve({ type: 'bw-classic', T1: 6, T2: 60, p: 1.02, logK: 48, maxMultiplier: 10 }),
  },
  {
    id: 'ilford_xp2',
    nameKey: 'calculator.exposureLab.reciprocity.ilford_xp2',
    descriptionKey: 'calculator.exposureLab.reciprocity.ilford_xp2Description',
    hintKey: 'calculator.exposureLab.reciprocity.ilford_xp2Hint',
    curve: createSegmentedCurve({ type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 19, maxMultiplier: 4 }),
  },
  {
    id: 'ilford_sfx',
    nameKey: 'calculator.exposureLab.reciprocity.ilford_sfx',
    descriptionKey: 'calculator.exposureLab.reciprocity.ilford_sfxDescription',
    hintKey: 'calculator.exposureLab.reciprocity.ilford_sfxHint',
    curve: createSegmentedCurve({ type: 'bw-classic', T1: 12, T2: 150, p: 0.78, logK: 38, maxMultiplier: 8 }),
  },
  {
    id: 'ilford_kentmere100',
    nameKey: 'calculator.exposureLab.reciprocity.ilford_kentmere100',
    descriptionKey: 'calculator.exposureLab.reciprocity.ilford_kentmere100Description',
    hintKey: 'calculator.exposureLab.reciprocity.ilford_kentmere100Hint',
    curve: createSegmentedCurve({ type: 'bw-classic', T1: 10, T2: 120, p: 0.68, logK: 28, maxMultiplier: 6 }),
  },
  {
    id: 'ilford_kentmere400',
    nameKey: 'calculator.exposureLab.reciprocity.ilford_kentmere400',
    descriptionKey: 'calculator.exposureLab.reciprocity.ilford_kentmere400Description',
    hintKey: 'calculator.exposureLab.reciprocity.ilford_kentmere400Hint',
    curve: createSegmentedCurve({ type: 'bw-classic', T1: 12, T2: 180, p: 0.72, logK: 33, maxMultiplier: 8 }),
  },
  {
    id: 'shanghai_gp3',
    nameKey: 'calculator.exposureLab.reciprocity.shanghai_gp3',
    descriptionKey: 'calculator.exposureLab.reciprocity.shanghai_gp3Description',
    hintKey: 'calculator.exposureLab.reciprocity.shanghai_gp3Hint',
    curve: createSegmentedCurve({ type: 'bw-classic', T1: 12, T2: 150, p: 0.78, logK: 35, maxMultiplier: 8 }),
  },
  {
    id: 'lomo_potsdam100',
    nameKey: 'calculator.exposureLab.reciprocity.lomo_potsdam100',
    descriptionKey: 'calculator.exposureLab.reciprocity.lomo_potsdam100Description',
    hintKey: 'calculator.exposureLab.reciprocity.lomo_potsdam100Hint',
    curve: createSegmentedCurve({ type: 'bw-classic', T1: 10, T2: 120, p: 0.79, logK: 37, maxMultiplier: 8 }),
  },
  {
    id: 'fuji_acros',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_acros',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_acrosDescription',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_acrosHint',
    curve: [
      { baseSeconds: 1, correctedSeconds: 1 },
      { baseSeconds: 120, correctedSeconds: 120 },
      { baseSeconds: 240, correctedSeconds: 340 }, // +0.5 stop approx
      { baseSeconds: 480, correctedSeconds: 680 },
      { baseSeconds: 900, correctedSeconds: 1270 },
    ],
  },
  // --- Slide (E-6) ---
  {
    id: 'kodak_e100',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_e100',
    descriptionKey: 'calculator.exposureLab.reciprocity.kodak_e100Description',
    hintKey: 'calculator.exposureLab.reciprocity.kodak_e100Hint',
    curve: createSegmentedCurve({ type: 'slide', T1: 4, T2: 90, p: 0.31, logK: 10, maxMultiplier: 3 }),
  },
  {
    id: 'fuji_astia100f',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_astia100f',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_astia100fDescription',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_astia100fHint',
    curve: [
      { baseSeconds: 1, correctedSeconds: 1 },
      { baseSeconds: 128, correctedSeconds: 128 },
      { baseSeconds: 240, correctedSeconds: 300 },
    ],
  },
  {
    id: 'fuji_provia400x',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_provia400x',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_provia400xDescription',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_provia400xHint',
    curve: createSegmentedCurve({ type: 'slide', T1: 4, T2: 75, p: 0.45, logK: 10, maxMultiplier: 4 }),
  },
  {
    id: 'fuji_sensia200',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_sensia200',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_sensia200Description',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_sensia200Hint',
    curve: createSegmentedCurve({ type: 'slide', T1: 4, T2: 80, p: 0.44, logK: 10, maxMultiplier: 4 }),
  },
  {
    id: 'fuji_t64',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_t64',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_t64Description',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_t64Hint',
    curve: createSegmentedCurve({ type: 'slide', T1: 3, T2: 60, p: 0.44, logK: 11, maxMultiplier: 4 }),
  },
  {
    id: 'fuji_velvia100',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_velvia100',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_velvia100Description',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_velvia100Hint',
    curve: [
      { baseSeconds: 1, correctedSeconds: 1 },
      { baseSeconds: 4, correctedSeconds: 5 },
      { baseSeconds: 8, correctedSeconds: 11 },
      { baseSeconds: 16, correctedSeconds: 26 },
      { baseSeconds: 32, correctedSeconds: 64 },
      { baseSeconds: 60, correctedSeconds: 140 },
    ],
  },
  {
    id: 'fuji_velvia100f',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_velvia100f',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_velvia100fDescription',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_velvia100fHint',
    curve: [
      { baseSeconds: 1, correctedSeconds: 1 },
      { baseSeconds: 4, correctedSeconds: 5 },
      { baseSeconds: 8, correctedSeconds: 11 },
      { baseSeconds: 16, correctedSeconds: 26 },
      { baseSeconds: 32, correctedSeconds: 64 },
      { baseSeconds: 60, correctedSeconds: 140 },
    ],
  },
  {
    id: 'fuji_velvia50',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_velvia50',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_velvia50Description',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_velvia50Hint',
    curve: [
      { baseSeconds: 1, correctedSeconds: 1 },
      { baseSeconds: 4, correctedSeconds: 5 },
      { baseSeconds: 8, correctedSeconds: 12 },
      { baseSeconds: 16, correctedSeconds: 32 },
      { baseSeconds: 32, correctedSeconds: 80 },
      { baseSeconds: 60, correctedSeconds: 180 },
    ],
  },
  {
    id: 'fuji_pro400h',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_pro400h',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_pro400hDescription',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_pro400hHint',
    curve: createSegmentedCurve({ type: 'c41', T1: 20, T2: 240, p: 0.6, logK: 19, maxMultiplier: 5 }),
  },
  {
    id: 'fuji_provia100f',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_provia100f',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_provia100fDescription',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_provia100fHint',
    curve: [
      { baseSeconds: 1, correctedSeconds: 1 },
      { baseSeconds: 128, correctedSeconds: 128 },
      { baseSeconds: 240, correctedSeconds: 300 }, // Slight correction after 128s
    ],
  },
];

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
  14, 16, 18, 20, 24, 28, 35, 40, 50, 55, 85, 100, 105, 135, 200, 300, 400, 500, 600
];

// 模糊圈直径（CoC，单位：mm）
// 用于景深计算
export const COC_BY_SENSOR: { [key: number]: number } = {
  1.0: 0.029,  // 全画幅
  1.5: 0.019,  // APS-C (Nikon/Sony)
  1.6: 0.018,  // APS-C (Canon)
  2.0: 0.015,  // M4/3
  2.7: 0.011,  // 1"
};

// EV 场景参考表
export interface EVScene {
  ev: number;
  descriptionKey: string;
  icon: string;
  params: { aperture: number; shutter: number; iso: number };
}

export const EV_SCENES: EVScene[] = [
  { ev: 16, descriptionKey: 'calculator.ev.scenes.ev16', icon: '☀️', params: { aperture: 16, shutter: 1 / 250, iso: 100 } },
  { ev: 15, descriptionKey: 'calculator.ev.scenes.ev15', icon: '☀️', params: { aperture: 16, shutter: 1 / 125, iso: 100 } },
  { ev: 14, descriptionKey: 'calculator.ev.scenes.ev14', icon: '🌤️', params: { aperture: 11, shutter: 1 / 125, iso: 100 } },
  { ev: 13, descriptionKey: 'calculator.ev.scenes.ev13', icon: '⛅', params: { aperture: 8, shutter: 1 / 125, iso: 100 } },
  { ev: 12, descriptionKey: 'calculator.ev.scenes.ev12', icon: '☁️', params: { aperture: 5.6, shutter: 1 / 125, iso: 100 } },
  { ev: 11, descriptionKey: 'calculator.ev.scenes.ev11', icon: '🌥️', params: { aperture: 4, shutter: 1 / 125, iso: 100 } },
  { ev: 10, descriptionKey: 'calculator.ev.scenes.ev10', icon: '🌩️', params: { aperture: 2.8, shutter: 1 / 125, iso: 100 } },
  { ev: 9, descriptionKey: 'calculator.ev.scenes.ev9', icon: '🏙️', params: { aperture: 2.8, shutter: 1 / 60, iso: 100 } },
  { ev: 8, descriptionKey: 'calculator.ev.scenes.ev8', icon: '🌃', params: { aperture: 2.8, shutter: 1 / 30, iso: 100 } },
  { ev: 7, descriptionKey: 'calculator.ev.scenes.ev7', icon: '💡', params: { aperture: 2.8, shutter: 1 / 15, iso: 100 } },
  { ev: 6, descriptionKey: 'calculator.ev.scenes.ev6', icon: '🏠', params: { aperture: 2.8, shutter: 1 / 8, iso: 100 } },
  { ev: 5, descriptionKey: 'calculator.ev.scenes.ev5', icon: '🏮', params: { aperture: 2.8, shutter: 1 / 4, iso: 100 } },
  { ev: 4, descriptionKey: 'calculator.ev.scenes.ev4', icon: '🕯️', params: { aperture: 2.8, shutter: 1 / 2, iso: 100 } },
  { ev: 3, descriptionKey: 'calculator.ev.scenes.ev3', icon: '🌕', params: { aperture: 2.8, shutter: 1, iso: 100 } },
  { ev: 2, descriptionKey: 'calculator.ev.scenes.ev2', icon: '⚡', params: { aperture: 2.8, shutter: 2, iso: 100 } },
  { ev: 1, descriptionKey: 'calculator.ev.scenes.ev1', icon: '🌆', params: { aperture: 2.8, shutter: 4, iso: 100 } },
  { ev: 0, descriptionKey: 'calculator.ev.scenes.ev0', icon: '✨', params: { aperture: 2.8, shutter: 8, iso: 100 } },
  { ev: -1, descriptionKey: 'calculator.ev.scenes.evMinus1', icon: '🌌', params: { aperture: 2.8, shutter: 15, iso: 100 } },
  { ev: -2, descriptionKey: 'calculator.ev.scenes.evMinus2', icon: '🔭', params: { aperture: 2.8, shutter: 30, iso: 100 } },
  { ev: -3, descriptionKey: 'calculator.ev.scenes.evMinus3', icon: '🌑', params: { aperture: 2.8, shutter: 60, iso: 100 } },
  { ev: -4, descriptionKey: 'calculator.ev.scenes.evMinus4', icon: '🌑', params: { aperture: 2.8, shutter: 120, iso: 100 } },
  { ev: -5, descriptionKey: 'calculator.ev.scenes.evMinus5', icon: '🌑', params: { aperture: 2.8, shutter: 240, iso: 100 } },
  { ev: -6, descriptionKey: 'calculator.ev.scenes.evMinus6', icon: '🌑', params: { aperture: 2.8, shutter: 480, iso: 100 } },
];

export const PRESET_SHUTTERS = [
  { value: 1/64000, label: '1/64000s' },
  { value: 1/32000, label: '1/32000s' },
  { value: 1/16000, label: '1/16000s' },
  { value: 1/8000, label: '1/8000s' },
  { value: 1/4000, label: '1/4000s' },
  { value: 1/2000, label: '1/2000s' },
  { value: 1/1000, label: '1/1000s' },
  { value: 1/500, label: '1/500s' },
  { value: 1/250, label: '1/250s' },
  { value: 1/125, label: '1/125s' },
  { value: 1/60, label: '1/60s' },
  { value: 1/30, label: '1/30s' },
  { value: 1/15, label: '1/15s' },
  { value: 1/8, label: '1/8s' },
  { value: 1/4, label: '1/4s' },
  { value: 1/2, label: '1/2s' },
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
  0.5, 0.7, 0.95, 1.0, 1.1, 1.2, 1.4, 1.6, 1.8, 2.0, 2.2, 2.5, 2.8, 3.2, 3.5, 4.0, 4.5, 5.0, 5.6, 6.3, 7.1, 8.0, 9.0, 10, 11, 13, 14, 16, 18, 20, 22, 25, 29, 32, 36, 40, 45, 51, 57, 64, 72, 81, 90, 101, 114, 128, 144, 161, 180, 203, 228, 256
];

export const PRESET_ISOS = [
  1, 3, 6, 12, 25, 50, 64, 80, 100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400, 8000, 10000, 12800, 16000, 20000, 25600, 51200, 102400, 204800, 409600, 509600
];
