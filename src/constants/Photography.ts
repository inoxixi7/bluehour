import reciprocityConfig from '../../film-reciprocity-config-enhanced.json';
import allfilmConfig from '../../docs/allfilm.json';

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
  segmentParams?: ReciprocitySegmentParams; // 分段模型参数
}

/**
 * 倒易律分段参数（三段式模型）
 */
export interface ReciprocitySegmentParams {
  type: 'c41' | 'bw-modern' | 'bw-classic' | 'slide';
  T1: number;           // 幂函数结束点（秒）
  p: number;            // 幂函数指数
  maxMultiplier: number; // 超长曝光最大倍率
  T2?: number;           // 兼容旧模型（不再使用）
  logK?: number;         // 兼容旧模型（不再使用）
  note?: string;
}

type ReciprocityConfigFilm = {
  id: string;
  type: ReciprocitySegmentParams['type'];
  modelParams: Omit<ReciprocitySegmentParams, 'type' | 'note'>;
};

type ReciprocityConfigCategory = {
  films: ReciprocityConfigFilm[];
};

type ReciprocityConfig = {
  films: ReciprocityConfigCategory[];
};

type AllFilmGroup = {
  names: string[];
  params: {
    t1: number;
    p: number;
    max_mult: number;
  };
};

type AllFilmConfig = {
  films: AllFilmGroup[];
};

const reciprocityConfigData = reciprocityConfig as ReciprocityConfig;
const allfilmConfigData = allfilmConfig as AllFilmConfig;

const normalizeName = (value: string) => value.trim().toLowerCase();

const explicitNameToId = new Map<string, string>([
  ['Kodak Portra 160', 'kodak_portra160'],
  ['Kodak Portra 400', 'kodak_portra400'],
  ['Kodak Portra 800', 'kodak_portra800'],
  ['Fuji Pro 160C', 'fuji_pro160c'],
  ['Fuji Pro 160NS', 'fuji_pro160ns'],
  ['Fuji Pro 400H', 'fuji_pro400h'],
  ['Kodak Vision3 50D', 'kodak_50d'],
  ['Kodak Vision3 250D', 'kodak_250d'],
  ['Kodak Vision3 500T', 'kodak_500t'],
  ['Cinestill 800T', 'cinestill_800t'],
  ['Kodak Ektar 100', 'kodak_ektar100'],
  ['Kodak Gold 200', 'kodak_gold'],
  ['Fuji Superia 100', 'fuji_superia'],
  ['Fuji Superia 200', 'fuji_superia200'],
  ['Fuji Superia 400', 'fuji_superia'],
  ['Fuji Superia 1600', 'fuji_superia1600'],
  ['Fuji C200', 'fuji_c200'],
  ['Fuji X-TRA 400', 'fuji_xtra400'],
  ['Fuji Nexia 400', 'fuji_nexia400'],
  ['Lomo CN 800', 'lomo_cn'],
  ['Kodak T-Max 100', 'kodak_tmax100'],
  ['Kodak T-Max 400', 'kodak_tmax400'],
  ['Kodak T-Max 3200', 'kodak_tmax3200'],
  ['Ilford Delta 100', 'ilford_delta100'],
  ['Ilford Delta 400', 'ilford_delta400'],
  ['Ilford Delta 3200', 'ilford_delta3200'],
  ['Fuji Acros', 'fuji_acros'],
  ['Fuji Acros II', 'fuji_acros'],
  ['Kodak Tri-X 320', 'kodak_trix320'],
  ['Kodak Tri-X 400', 'kodak_trix'],
  ['Ilford HP5', 'ilford_hp5'],
  ['Ilford SFX 200', 'ilford_sfx'],
  ['Kentmere 100', 'ilford_kentmere100'],
  ['Kentmere 400', 'ilford_kentmere400'],
  ['Fomapan 100', 'foma100'],
  ['Fomapan 200', 'foma200'],
  ['Fomapan 400', 'foma400'],
  ['Shanghai GP3', 'shanghai_gp3'],
  ['Ilford FP4', 'ilford_fp4'],
  ['Ilford XP2', 'ilford_xp2'],
  ['Fuji Neopan', 'fuji_acros'],
  ['Lomo Potsdam 100', 'lomo_potsdam100'],
  ['Ilford Pan F 50', 'ilford_panf'],
  ['Kodak Ektachrome E100', 'kodak_e100'],
  ['Fuji Provia 100F', 'fuji_provia100f'],
  ['Fujichrome Provia 100F', 'fuji_provia100f'],
  ['Fujichrome Provia 400X', 'fuji_provia400x'],
  ['Fujichrome Astia 100F', 'fuji_astia100f'],
  ['Fujichrome Velvia 100', 'fuji_velvia100'],
  ['Fujichrome Velvia 100F', 'fuji_velvia100f'],
  ['Fujichrome Velvia 50', 'fuji_velvia50'],
  ['Fujichrome Sensia 200', 'fuji_sensia200'],
  ['Fujichrome 64T', 'fuji_64t'],
  ['Fujichrome T64', 'fuji_t64'],
  ['Holga 400', 'holga400'],
].map(([name, id]) => [normalizeName(name), id]));

const { nameToId, idToType } = (() => {
  const nameMap = new Map<string, string>();
  const typeMap = new Map<string, ReciprocitySegmentParams['type']>();
  reciprocityConfigData.films.forEach(category => {
    category.films.forEach(film => {
      if (film?.id) {
        typeMap.set(film.id, film.type);
      }
      if (film?.name && film?.id) {
        nameMap.set(normalizeName(film.name), film.id);
      }
    });
  });
  explicitNameToId.forEach((id, name) => {
    nameMap.set(name, id);
  });
  return { nameToId: nameMap, idToType: typeMap };
})();

const reciprocityParamsById = (() => {
  const map = new Map<string, ReciprocitySegmentParams>();

  allfilmConfigData.films.forEach(group => {
    const { t1, p, max_mult } = group.params;
    group.names.forEach(name => {
      const id = nameToId.get(normalizeName(name));
      if (!id) return;
      const type = idToType.get(id) ?? 'c41';
      map.set(id, {
        type,
        T1: t1,
        p,
        maxMultiplier: max_mult,
      });
    });
  });

  return map;
})();

const getReciprocityParams = (
  id: string,
  fallback: ReciprocitySegmentParams
): ReciprocitySegmentParams => reciprocityParamsById.get(id) ?? fallback;

const BASE_SECONDS = [1, 2, 4, 8, 15, 30, 60, 120, 240, 480, 900, 1800, 3600];

/**
 * Segmented Damping Model - 三段连续函数(C¹连续)
 * 这是感知建模(Perceptual Model),非化学仿真,所有参数均为相对尺度
 * 
 * Segment 1 (t ≤ T1): M(t) = 1 (Toe - 线性,无失败)
 * Segment 2 (T1 < t ≤ T2): M(t) = 1 + ((t - T1) / T1)^p (Mid - 非线性增长)
 * Segment 3 (t > T2): M(t) = min(M_T2 + ln(1 + (t - T2) / logK), maxM) (Shoulder - 对数阻尼)
 * 
 * 其中 M_T2 = 1 + ((T2 - T1) / T1)^p 保证 C¹ 连续性
 * t_corrected = t * M(t)
 */
const createSegmentedCurve = (params: ReciprocitySegmentParams) => {
  const { T1, p, maxMultiplier } = params;

  return BASE_SECONDS.map(t => {
    const ratio = Math.max(1, t / Math.max(T1, 1));
    const multiplier = Math.min(Math.pow(ratio, p), maxMultiplier);
    const correctedSeconds = Math.round(t * multiplier);

    return {
      baseSeconds: t,
      correctedSeconds,
    };
  });
};

/**
 * 创建带参数的倒易律配置
 */
const createReciprocityProfile = (
  id: string,
  nameKey: string,
  descriptionKey: string,
  hintKey: string,
  params: ReciprocitySegmentParams
): ReciprocityProfile => {
  const resolvedParams = getReciprocityParams(id, params);
  return {
    id,
    nameKey,
    descriptionKey,
    hintKey,
    curve: createSegmentedCurve(resolvedParams),
    segmentParams: resolvedParams,
  };
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
  createReciprocityProfile('foma100', 
    'calculator.exposureLab.reciprocity.foma100',
    'calculator.exposureLab.reciprocity.foma100Description',
    'calculator.exposureLab.reciprocity.foma100Hint',
    { type: 'bw-classic', T1: 1, T2: 800, p: 0.42, logK: 20, maxMultiplier: 8 }),
  createReciprocityProfile('foma200',
    'calculator.exposureLab.reciprocity.foma200',
    'calculator.exposureLab.reciprocity.foma200Description',
    'calculator.exposureLab.reciprocity.foma200Hint',
    { type: 'bw-classic', T1: 1, T2: 800, p: 0.38, logK: 18, maxMultiplier: 7 }),
  createReciprocityProfile('foma400',
    'calculator.exposureLab.reciprocity.foma400',
    'calculator.exposureLab.reciprocity.foma400Description',
    'calculator.exposureLab.reciprocity.foma400Hint',
    { type: 'bw-classic', T1: 1, T2: 800, p: 0.42, logK: 20, maxMultiplier: 8 }),
  // --- Kodak Motion Picture (Vision3) ---
  createReciprocityProfile('kodak_50d',
    'calculator.exposureLab.reciprocity.kodak_50d',
    'calculator.exposureLab.reciprocity.kodak_50dDescription',
    'calculator.exposureLab.reciprocity.kodak_50dHint',
    { type: 'c41', T1: 30, T2: 300, p: 0.56, logK: 14, maxMultiplier: 4 }),
  createReciprocityProfile('kodak_250d',
    'calculator.exposureLab.reciprocity.kodak_250d',
    'calculator.exposureLab.reciprocity.kodak_250dDescription',
    'calculator.exposureLab.reciprocity.kodak_250dHint',
    { type: 'c41', T1: 30, T2: 300, p: 0.56, logK: 15, maxMultiplier: 4 }),
  createReciprocityProfile('kodak_500t',
    'calculator.exposureLab.reciprocity.kodak_500t',
    'calculator.exposureLab.reciprocity.kodak_500tDescription',
    'calculator.exposureLab.reciprocity.kodak_500tHint',
    { type: 'c41', T1: 30, T2: 300, p: 0.56, logK: 16, maxMultiplier: 4 }),
  // --- Color Negative (C-41) ---
  createReciprocityProfile('kodak_portra160',
    'calculator.exposureLab.reciprocity.kodak_portra160',
    'calculator.exposureLab.reciprocity.kodak_portra160Description',
    'calculator.exposureLab.reciprocity.kodak_portra160Hint',
    { type: 'c41', T1: 30, T2: 300, p: 0.56, logK: 17, maxMultiplier: 4 }),
  createReciprocityProfile('kodak_portra400',
    'calculator.exposureLab.reciprocity.kodak_portra400',
    'calculator.exposureLab.reciprocity.kodak_portra400Description',
    'calculator.exposureLab.reciprocity.kodak_portra400Hint',
    { type: 'c41', T1: 20, T2: 105, p: 1.33, logK: 15, maxMultiplier: 24 }),
  createReciprocityProfile('kodak_portra800',
    'calculator.exposureLab.reciprocity.kodak_portra800',
    'calculator.exposureLab.reciprocity.kodak_portra800Description',
    'calculator.exposureLab.reciprocity.kodak_portra800Hint',
    { type: 'c41', T1: 30, T2: 300, p: 0.56, logK: 18, maxMultiplier: 4 }),
  createReciprocityProfile('kodak_ektar100',
    'calculator.exposureLab.reciprocity.kodak_ektar100',
    'calculator.exposureLab.reciprocity.kodak_ektar100Description',
    'calculator.exposureLab.reciprocity.kodak_ektar100Hint',
    { type: 'c41', T1: 30, T2: 240, p: 0.63, logK: 21, maxMultiplier: 4 }),
  createReciprocityProfile('kodak_gold',
    'calculator.exposureLab.reciprocity.kodak_gold',
    'calculator.exposureLab.reciprocity.kodak_goldDescription',
    'calculator.exposureLab.reciprocity.kodak_goldHint',
    { type: 'c41', T1: 20, T2: 240, p: 0.6, logK: 22, maxMultiplier: 5 }),
  createReciprocityProfile('fuji_superia',
    'calculator.exposureLab.reciprocity.fuji_superia',
    'calculator.exposureLab.reciprocity.fuji_superiaDescription',
    'calculator.exposureLab.reciprocity.fuji_superiaHint',
    { type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 17, maxMultiplier: 4 }),
  createReciprocityProfile('fuji_superia200',
    'calculator.exposureLab.reciprocity.fuji_superia200',
    'calculator.exposureLab.reciprocity.fuji_superia200Description',
    'calculator.exposureLab.reciprocity.fuji_superia200Hint',
    { type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 17, maxMultiplier: 4 }),
  createReciprocityProfile('fuji_superia1600',
    'calculator.exposureLab.reciprocity.fuji_superia1600',
    'calculator.exposureLab.reciprocity.fuji_superia1600Description',
    'calculator.exposureLab.reciprocity.fuji_superia1600Hint',
    { type: 'c41', T1: 20, T2: 240, p: 0.6, logK: 21, maxMultiplier: 5 }),
  createReciprocityProfile('fuji_c200',
    'calculator.exposureLab.reciprocity.fuji_c200',
    'calculator.exposureLab.reciprocity.fuji_c200Description',
    'calculator.exposureLab.reciprocity.fuji_c200Hint',
    { type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 17, maxMultiplier: 4 }),
  createReciprocityProfile('fuji_color100',
    'calculator.exposureLab.reciprocity.fuji_color100',
    'calculator.exposureLab.reciprocity.fuji_color100Description',
    'calculator.exposureLab.reciprocity.fuji_color100Hint',
    { type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 17, maxMultiplier: 4 }),
  createReciprocityProfile('fuji_pro160c',
    'calculator.exposureLab.reciprocity.fuji_pro160c',
    'calculator.exposureLab.reciprocity.fuji_pro160cDescription',
    'calculator.exposureLab.reciprocity.fuji_pro160cHint',
    { type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 17, maxMultiplier: 4 }),
  createReciprocityProfile('fuji_pro160ns',
    'calculator.exposureLab.reciprocity.fuji_pro160ns',
    'calculator.exposureLab.reciprocity.fuji_pro160nsDescription',
    'calculator.exposureLab.reciprocity.fuji_pro160nsHint',
    { type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 17, maxMultiplier: 4 }),
  createReciprocityProfile('fuji_xtra400',
    'calculator.exposureLab.reciprocity.fuji_xtra400',
    'calculator.exposureLab.reciprocity.fuji_xtra400Description',
    'calculator.exposureLab.reciprocity.fuji_xtra400Hint',
    { type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 18, maxMultiplier: 4 }),
  createReciprocityProfile('fuji_nexia400',
    'calculator.exposureLab.reciprocity.fuji_nexia400',
    'calculator.exposureLab.reciprocity.fuji_nexia400Description',
    'calculator.exposureLab.reciprocity.fuji_nexia400Hint',
    { type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 18, maxMultiplier: 4 }),
  createReciprocityProfile('fuji_64t',
    'calculator.exposureLab.reciprocity.fuji_64t',
    'calculator.exposureLab.reciprocity.fuji_64tDescription',
    'calculator.exposureLab.reciprocity.fuji_64tHint',
    { type: 'c41', T1: 20, T2: 180, p: 0.44, logK: 11, maxMultiplier: 3 }),
  createReciprocityProfile('cinestill_800t',
    'calculator.exposureLab.reciprocity.cinestill_800t',
    'calculator.exposureLab.reciprocity.cinestill_800tDescription',
    'calculator.exposureLab.reciprocity.cinestill_800tHint',
    { type: 'c41', T1: 30, T2: 300, p: 0.56, logK: 15, maxMultiplier: 4 }),
  createReciprocityProfile('lomo_cn',
    'calculator.exposureLab.reciprocity.lomo_cn',
    'calculator.exposureLab.reciprocity.lomo_cnDescription',
    'calculator.exposureLab.reciprocity.lomo_cnHint',
    { type: 'c41', T1: 15, T2: 200, p: 0.65, logK: 27, maxMultiplier: 6 }),
  createReciprocityProfile('holga400',
    'calculator.exposureLab.reciprocity.holga400',
    'calculator.exposureLab.reciprocity.holga400Description',
    'calculator.exposureLab.reciprocity.holga400Hint',
    { type: 'c41', T1: 20, T2: 240, p: 0.6, logK: 22, maxMultiplier: 5 }),
  // --- Black & White ---
<<<<<<< HEAD
  createReciprocityProfile('kodak_trix320',
    'calculator.exposureLab.reciprocity.kodak_trix320',
    'calculator.exposureLab.reciprocity.kodak_trix320Description',
    'calculator.exposureLab.reciprocity.kodak_trix320Hint',
    { type: 'bw-classic', T1: 10, T2: 120, p: 0.79, logK: 37, maxMultiplier: 8 }),
  createReciprocityProfile('kodak_trix',
    'calculator.exposureLab.reciprocity.kodak_trix',
    'calculator.exposureLab.reciprocity.kodak_trixDescription',
    'calculator.exposureLab.reciprocity.kodak_trixHint',
    { type: 'bw-classic', T1: 10, T2: 120, p: 0.79, logK: 37, maxMultiplier: 8 }),
  createReciprocityProfile('kodak_tmax100',
    'calculator.exposureLab.reciprocity.kodak_tmax100',
    'calculator.exposureLab.reciprocity.kodak_tmax100Description',
    'calculator.exposureLab.reciprocity.kodak_tmax100Hint',
    { type: 'bw-modern', T1: 60, T2: 600, p: 0.44, logK: 10, maxMultiplier: 3 }),
  createReciprocityProfile('kodak_tmax400',
    'calculator.exposureLab.reciprocity.kodak_tmax400',
    'calculator.exposureLab.reciprocity.kodak_tmax400Description',
    'calculator.exposureLab.reciprocity.kodak_tmax400Hint',
    { type: 'bw-modern', T1: 45, T2: 600, p: 0.51, logK: 12, maxMultiplier: 4 }),
  createReciprocityProfile('kodak_tmax3200',
    'calculator.exposureLab.reciprocity.kodak_tmax3200',
    'calculator.exposureLab.reciprocity.kodak_tmax3200Description',
    'calculator.exposureLab.reciprocity.kodak_tmax3200Hint',
    { type: 'bw-modern', T1: 45, T2: 600, p: 0.51, logK: 13, maxMultiplier: 4 }),
  createReciprocityProfile('ilford_hp5',
    'calculator.exposureLab.reciprocity.ilford_hp5',
    'calculator.exposureLab.reciprocity.ilford_hp5Description',
    'calculator.exposureLab.reciprocity.ilford_hp5Hint',
    { type: 'bw-classic', T1: 12, T2: 180, p: 0.72, logK: 34, maxMultiplier: 8 }),
  createReciprocityProfile('ilford_fp4',
    'calculator.exposureLab.reciprocity.ilford_fp4',
    'calculator.exposureLab.reciprocity.ilford_fp4Description',
    'calculator.exposureLab.reciprocity.ilford_fp4Hint',
    { type: 'bw-classic', T1: 10, T2: 120, p: 0.68, logK: 28, maxMultiplier: 6 }),
  createReciprocityProfile('ilford_delta100',
    'calculator.exposureLab.reciprocity.ilford_delta100',
    'calculator.exposureLab.reciprocity.ilford_delta100Description',
    'calculator.exposureLab.reciprocity.ilford_delta100Hint',
    { type: 'bw-modern', T1: 60, T2: 600, p: 0.44, logK: 10, maxMultiplier: 3 }),
  createReciprocityProfile('ilford_delta400',
    'calculator.exposureLab.reciprocity.ilford_delta400',
    'calculator.exposureLab.reciprocity.ilford_delta400Description',
    'calculator.exposureLab.reciprocity.ilford_delta400Hint',
    { type: 'bw-modern', T1: 45, T2: 600, p: 0.51, logK: 13, maxMultiplier: 4 }),
  createReciprocityProfile('ilford_delta3200',
    'calculator.exposureLab.reciprocity.ilford_delta3200',
    'calculator.exposureLab.reciprocity.ilford_delta3200Description',
    'calculator.exposureLab.reciprocity.ilford_delta3200Hint',
    { type: 'bw-modern', T1: 45, T2: 600, p: 0.51, logK: 13, maxMultiplier: 4 }),
  createReciprocityProfile('ilford_panf',
    'calculator.exposureLab.reciprocity.ilford_panf',
    'calculator.exposureLab.reciprocity.ilford_panfDescription',
    'calculator.exposureLab.reciprocity.ilford_panfHint',
    { type: 'bw-classic', T1: 6, T2: 60, p: 1.02, logK: 48, maxMultiplier: 10 }),
  createReciprocityProfile('ilford_xp2',
    'calculator.exposureLab.reciprocity.ilford_xp2',
    'calculator.exposureLab.reciprocity.ilford_xp2Description',
    'calculator.exposureLab.reciprocity.ilford_xp2Hint',
    { type: 'c41', T1: 25, T2: 240, p: 0.57, logK: 19, maxMultiplier: 4 }),
  createReciprocityProfile('ilford_sfx',
    'calculator.exposureLab.reciprocity.ilford_sfx',
    'calculator.exposureLab.reciprocity.ilford_sfxDescription',
    'calculator.exposureLab.reciprocity.ilford_sfxHint',
    { type: 'bw-classic', T1: 12, T2: 150, p: 0.78, logK: 38, maxMultiplier: 8 }),
  createReciprocityProfile('ilford_kentmere100',
    'calculator.exposureLab.reciprocity.ilford_kentmere100',
    'calculator.exposureLab.reciprocity.ilford_kentmere100Description',
    'calculator.exposureLab.reciprocity.ilford_kentmere100Hint',
    { type: 'bw-classic', T1: 10, T2: 120, p: 0.68, logK: 28, maxMultiplier: 6 }),
  createReciprocityProfile('ilford_kentmere400',
    'calculator.exposureLab.reciprocity.ilford_kentmere400',
    'calculator.exposureLab.reciprocity.ilford_kentmere400Description',
    'calculator.exposureLab.reciprocity.ilford_kentmere400Hint',
    { type: 'bw-classic', T1: 12, T2: 180, p: 0.72, logK: 33, maxMultiplier: 8 }),
  createReciprocityProfile('shanghai_gp3',
    'calculator.exposureLab.reciprocity.shanghai_gp3',
    'calculator.exposureLab.reciprocity.shanghai_gp3Description',
    'calculator.exposureLab.reciprocity.shanghai_gp3Hint',
    { type: 'bw-classic', T1: 12, T2: 150, p: 0.78, logK: 35, maxMultiplier: 8 }),
  createReciprocityProfile('lomo_potsdam100',
    'calculator.exposureLab.reciprocity.lomo_potsdam100',
    'calculator.exposureLab.reciprocity.lomo_potsdam100Description',
    'calculator.exposureLab.reciprocity.lomo_potsdam100Hint',
    { type: 'bw-classic', T1: 10, T2: 120, p: 0.79, logK: 37, maxMultiplier: 8 }),
  createReciprocityProfile('fuji_acros',
    'calculator.exposureLab.reciprocity.fuji_acros',
    'calculator.exposureLab.reciprocity.fuji_acrosDescription',
    'calculator.exposureLab.reciprocity.fuji_acrosHint',
    {
=======
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
    curve: createSegmentedCurve({
      // 旧曲线（880487f）特征：120s 前无补偿；240s 起约 +0.5 stop（≈1.42x）并基本保持
      // 用高 p 延后增长，在 240s 处触顶到 ≈1.42x，之后保持温和上限，避免长曝夸张外推
>>>>>>> efc59aa (？)
      T1: 120,
      T2: 240,
      p: 5.0,
      logK: 50,
      maxMultiplier: 1.42,
    }),
  // --- Slide (E-6) ---
<<<<<<< HEAD
  createReciprocityProfile('kodak_e100',
    'calculator.exposureLab.reciprocity.kodak_e100',
    'calculator.exposureLab.reciprocity.kodak_e100Description',
    'calculator.exposureLab.reciprocity.kodak_e100Hint',
    { type: 'slide', T1: 4, T2: 90, p: 0.31, logK: 10, maxMultiplier: 3 }),
  createReciprocityProfile('fuji_astia100f',
    'calculator.exposureLab.reciprocity.fuji_astia100f',
    'calculator.exposureLab.reciprocity.fuji_astia100fDescription',
    'calculator.exposureLab.reciprocity.fuji_astia100fHint',
    {
=======
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
    curve: createSegmentedCurve({
      type: 'slide',
      // 目标（与旧点一致）：240s → ~300s；并避免 30min 直接飙到 3x
>>>>>>> efc59aa (？)
      T1: 128,
      T2: 2000,
      p: 10.3,
      logK: 50,
      maxMultiplier: 1.33,
    }),
<<<<<<< HEAD
  createReciprocityProfile('fuji_provia400x',
    'calculator.exposureLab.reciprocity.fuji_provia400x',
    'calculator.exposureLab.reciprocity.fuji_provia400xDescription',
    'calculator.exposureLab.reciprocity.fuji_provia400xHint',
    { type: 'slide', T1: 4, T2: 75, p: 0.45, logK: 10, maxMultiplier: 4 }),
  createReciprocityProfile('fuji_sensia200',
    'calculator.exposureLab.reciprocity.fuji_sensia200',
    'calculator.exposureLab.reciprocity.fuji_sensia200Description',
    'calculator.exposureLab.reciprocity.fuji_sensia200Hint',
    { type: 'slide', T1: 4, T2: 80, p: 0.44, logK: 10, maxMultiplier: 4 }),
  createReciprocityProfile('fuji_t64',
    'calculator.exposureLab.reciprocity.fuji_t64',
    'calculator.exposureLab.reciprocity.fuji_t64Description',
    'calculator.exposureLab.reciprocity.fuji_t64Hint',
    { type: 'slide', T1: 3, T2: 60, p: 0.44, logK: 11, maxMultiplier: 4 }),
  createReciprocityProfile('fuji_velvia100',
    'calculator.exposureLab.reciprocity.fuji_velvia100',
    'calculator.exposureLab.reciprocity.fuji_velvia100Description',
    'calculator.exposureLab.reciprocity.fuji_velvia100Hint',
    {
      T1: 1,
      T2: 100,
      p: 0.65,
      logK: 15,
      maxMultiplier: 6,
    }),
  createReciprocityProfile('fuji_velvia100f',
    'calculator.exposureLab.reciprocity.fuji_velvia100f',
    'calculator.exposureLab.reciprocity.fuji_velvia100fDescription',
    'calculator.exposureLab.reciprocity.fuji_velvia100fHint',
    {
      T1: 1,
      T2: 100,
      p: 0.65,
      logK: 15,
      maxMultiplier: 6,
    }),
  createReciprocityProfile('fuji_velvia50',
    'calculator.exposureLab.reciprocity.fuji_velvia50',
    'calculator.exposureLab.reciprocity.fuji_velvia50Description',
    'calculator.exposureLab.reciprocity.fuji_velvia50Hint',
    {
      T1: 1,
      T2: 100,
      p: 0.7,
      logK: 15,
      maxMultiplier: 7,
    }),
  createReciprocityProfile('fuji_pro400h',
    'calculator.exposureLab.reciprocity.fuji_pro400h',
    'calculator.exposureLab.reciprocity.fuji_pro400hDescription',
    'calculator.exposureLab.reciprocity.fuji_pro400hHint',
    { type: 'c41', T1: 20, T2: 240, p: 0.6, logK: 19, maxMultiplier: 5 }),
  createReciprocityProfile('fuji_provia100f',
    'calculator.exposureLab.reciprocity.fuji_provia100f',
    'calculator.exposureLab.reciprocity.fuji_provia100fDescription',
    'calculator.exposureLab.reciprocity.fuji_provia100fHint',
    {
=======
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
    curve: createSegmentedCurve({
      // 旧曲线（880487f）在 60s 时约 2.33x（60→140）；避免把 30min 直接拉到 6x
      // 以 8s 作为“开始显著失效”的拐点，p 取较小使增长温和，maxMultiplier 略高于 60s 的 2.33x
      T1: 8,
      T2: 90,
      p: 0.15,
      logK: 25,
      maxMultiplier: 3.0,
    }),
  },
  {
    id: 'fuji_velvia100f',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_velvia100f',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_velvia100fDescription',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_velvia100fHint',
    curve: createSegmentedCurve({
      // 与 Velvia 100 采用同一组拟合（旧曲线相同）
      T1: 8,
      T2: 90,
      p: 0.15,
      logK: 25,
      maxMultiplier: 3.0,
    }),
  },
  {
    id: 'fuji_velvia50',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_velvia50',
    descriptionKey: 'calculator.exposureLab.reciprocity.fuji_velvia50Description',
    hintKey: 'calculator.exposureLab.reciprocity.fuji_velvia50Hint',
    curve: createSegmentedCurve({
      // 旧曲线（880487f）在 60s 时约 3x（60→180）；用 T1=4 + 低 p 近似 4–60s 的缓慢上升
      T1: 4,
      T2: 60,
      p: 0.26,
      logK: 25,
      maxMultiplier: 4.0,
    }),
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
    curve: createSegmentedCurve({
      type: 'slide',
      // 目标（与旧点一致）：240s → ~300s；30min 基准时落在 ~35–40min 区间
>>>>>>> efc59aa (？)
      T1: 128,
      T2: 2000,
      p: 10.3,
      logK: 50,
      maxMultiplier: 1.33,
    }),
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
