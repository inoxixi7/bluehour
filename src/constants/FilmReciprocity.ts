/**
 * 胶片倒易律失效数据库
 *
 * 每款胶片使用以下两种模型之一（详见 docs/RECIPROCITY_DATA.md）：
 *
 * 1. power（幂函数 / Schwarzschild 模型）
 *      t ≤ T0:  Tc = Tm
 *      t > T0:  Tc = T0 · (Tm / T0)^P
 *    Ilford 官方公式 Tc = Tm^P 即 T0 = 1 的特例。
 *
 * 2. table（厂商数据表）
 *    数据点 (Tm, Tc) 在 log-log 坐标下分段线性插值；
 *    第一个点为「无需补偿」的阈值（Tc = Tm），
 *    超出最后一个点后沿最后一段的斜率外推（不设倍率上限）。
 *
 * 倒易律失效在长曝光下不会「封顶」，旧模型的 maxMultiplier 截断会导致严重欠曝，已移除。
 */

export type FilmType = 'bw' | 'color-negative' | 'slide' | 'digital';

/**
 * 数据来源
 * - manufacturer: 厂商技术手册
 * - community: 社区测试的经验值
 * - estimate: 无公开数据，按同类胶片估算
 */
export type ReciprocitySource = 'manufacturer' | 'community' | 'estimate';

/** 数据表中的一个点：[测光时间 Tm, 校正时间 Tc]（秒） */
export type ReciprocityDataPoint = readonly [number, number];

export type ReciprocityModel =
  | { kind: 'none' }
  | { kind: 'power'; exponent: number; threshold: number }
  | { kind: 'table'; points: readonly ReciprocityDataPoint[] };

export interface FilmReciprocityData {
  id: string;
  /** 显示名称（i18n 缺失时的回退） */
  name: string;
  iso: number;
  type: FilmType;
  model: ReciprocityModel;
  source: ReciprocitySource;
  /** 数据可靠的最长测光时间（秒），超出后结果为外推值 */
  maxReliableSeconds?: number;
}

/** 由停数表示的补偿换算为时间倍率：+1/3 档 = ×2^(1/3) */
const stops = (tm: number, extraStops: number): ReciprocityDataPoint => [
  tm,
  tm * Math.pow(2, extraStops),
];

const power = (exponent: number, threshold = 1): ReciprocityModel => ({
  kind: 'power',
  exponent,
  threshold,
});

const table = (...points: ReciprocityDataPoint[]): ReciprocityModel => ({
  kind: 'table',
  points,
});

// ---- 可复用的模型 ----

// Kodak Tri-X (F-4017): 1s +1档→2s, 10s +2档→50s, 100s +3档→1200s
const KODAK_TRIX = table([0.1, 0.1], [1, 2], [10, 50], [100, 1200]);

// Kodak Vision3: 10s→20s, 100s→400s，恰好符合 Tc = Tm^1.30
const KODAK_VISION3 = power(1.3);

// 专业彩色负片：Kodak 官方仅说明 1s 内无需补偿，长曝常用 Tc = Tm^1.33
const PRO_COLOR_NEG = power(1.33);

// 民用彩色负片：乳剂更薄，失效稍快
const CONSUMER_COLOR_NEG = power(1.35);

// Fuji 民用彩负：2s 内无需补偿，之后约 +1/3、+2/3、+1 档
const FUJI_CONSUMER_NEG = table([2, 2], stops(4, 1 / 3), stops(16, 2 / 3), stops(64, 1));

// Fuji 专业彩负 (Pro 400H / 160NS / 160C)
const FUJI_PRO_NEG = table([4, 4], stops(16, 1 / 3), stops(64, 2 / 3));

// Fuji Provia 100F / Astia 100F: 128s 内无需补偿，4min +1/3 档，8min +1/2 档
const FUJI_MODERN_SLIDE = table([128, 128], stops(240, 1 / 3), stops(480, 1 / 2));

// Fuji Velvia 100 / 100F: 1min 内无需补偿，4min +1/3 档，8min +1/2 档
const FUJI_VELVIA100 = table([60, 60], stops(240, 1 / 3), stops(480, 1 / 2));

// Fuji 早期/民用反转片
const FUJI_OLDER_SLIDE = table([4, 4], stops(16, 1 / 3), stops(64, 1 / 2));

// Fomapan 100 / 400：1s ×2，10s ×8，100s ×16
const FOMAPAN = table([0.5, 0.5], [1, 2], [10, 80], [100, 1600]);

export const FILM_RECIPROCITY_DATA: FilmReciprocityData[] = [
  {
    id: 'digital',
    name: 'Digital',
    iso: 100,
    type: 'digital',
    model: { kind: 'none' },
    source: 'manufacturer',
  },

  // ---- Ilford / Kentmere（官方公式 Tc = Tm^P）----
  {
    id: 'ilford_panf',
    name: 'Ilford Pan F Plus 50',
    iso: 50,
    type: 'bw',
    model: power(1.33),
    source: 'manufacturer',
  },
  {
    id: 'ilford_fp4',
    name: 'Ilford FP4 Plus',
    iso: 125,
    type: 'bw',
    model: power(1.26),
    source: 'manufacturer',
  },
  {
    id: 'ilford_hp5',
    name: 'Ilford HP5 Plus',
    iso: 400,
    type: 'bw',
    model: power(1.31),
    source: 'manufacturer',
  },
  {
    id: 'ilford_delta100',
    name: 'Ilford Delta 100',
    iso: 100,
    type: 'bw',
    model: power(1.26),
    source: 'manufacturer',
  },
  {
    id: 'ilford_delta400',
    name: 'Ilford Delta 400',
    iso: 400,
    type: 'bw',
    model: power(1.41),
    source: 'manufacturer',
  },
  {
    id: 'ilford_delta3200',
    name: 'Ilford Delta 3200',
    iso: 3200,
    type: 'bw',
    model: power(1.33),
    source: 'manufacturer',
  },
  {
    id: 'ilford_sfx',
    name: 'Ilford SFX 200',
    iso: 200,
    type: 'bw',
    model: power(1.43),
    source: 'manufacturer',
  },
  {
    id: 'ilford_xp2',
    name: 'Ilford XP2 Super',
    iso: 400,
    type: 'bw',
    model: power(1.31),
    source: 'manufacturer',
  },
  {
    id: 'ilford_kentmere100',
    name: 'Kentmere 100',
    iso: 100,
    type: 'bw',
    model: power(1.26),
    source: 'manufacturer',
  },
  {
    id: 'ilford_kentmere400',
    name: 'Kentmere 400',
    iso: 400,
    type: 'bw',
    model: power(1.3),
    source: 'manufacturer',
  },

  // ---- Kodak 黑白 ----
  {
    id: 'kodak_trix',
    name: 'Kodak Tri-X 400',
    iso: 400,
    type: 'bw',
    model: KODAK_TRIX,
    source: 'manufacturer',
    maxReliableSeconds: 100,
  },
  {
    id: 'kodak_trix320',
    name: 'Kodak Tri-X 320',
    iso: 320,
    type: 'bw',
    model: KODAK_TRIX,
    source: 'manufacturer',
    maxReliableSeconds: 100,
  },
  {
    // T-Max 100: 1s +1/3档, 10s→15s, 100s→200s
    id: 'kodak_tmax100',
    name: 'Kodak T-Max 100',
    iso: 100,
    type: 'bw',
    model: table([0.1, 0.1], stops(1, 1 / 3), [10, 15], [100, 200]),
    source: 'manufacturer',
    maxReliableSeconds: 100,
  },
  {
    // T-Max 400: 1s +1/3档, 10s→15s, 100s→300s
    id: 'kodak_tmax400',
    name: 'Kodak T-Max 400',
    iso: 400,
    type: 'bw',
    model: table([0.1, 0.1], stops(1, 1 / 3), [10, 15], [100, 300]),
    source: 'manufacturer',
    maxReliableSeconds: 100,
  },
  {
    id: 'kodak_tmax3200',
    name: 'Kodak T-Max P3200',
    iso: 3200,
    type: 'bw',
    model: table([0.1, 0.1], stops(1, 1 / 2), [10, 20], [100, 300]),
    source: 'estimate',
    maxReliableSeconds: 100,
  },

  // ---- Fuji 黑白 ----
  {
    // Acros II: 120s 内无需补偿；120–1000s +1/2 档
    id: 'fuji_acros',
    name: 'Fuji Neopan Acros II 100',
    iso: 100,
    type: 'bw',
    model: table([120, 120], stops(240, 1 / 2), stops(1000, 1 / 2)),
    source: 'manufacturer',
    maxReliableSeconds: 1000,
  },

  // ---- Foma ----
  {
    id: 'foma100',
    name: 'Fomapan 100 Classic',
    iso: 100,
    type: 'bw',
    model: FOMAPAN,
    source: 'manufacturer',
    maxReliableSeconds: 100,
  },
  {
    id: 'foma200',
    name: 'Fomapan 200 Creative',
    iso: 200,
    type: 'bw',
    model: table([0.5, 0.5], stops(1, 0.5), [10, 40], [100, 800]),
    source: 'estimate',
    maxReliableSeconds: 100,
  },
  {
    id: 'foma400',
    name: 'Fomapan 400 Action',
    iso: 400,
    type: 'bw',
    model: FOMAPAN,
    source: 'manufacturer',
    maxReliableSeconds: 100,
  },

  // ---- 其他黑白 ----
  {
    id: 'shanghai_gp3',
    name: 'Shanghai GP3 100',
    iso: 100,
    type: 'bw',
    model: power(1.4),
    source: 'estimate',
  },
  {
    id: 'lomo_potsdam100',
    name: 'Lomography Potsdam Kino 100',
    iso: 100,
    type: 'bw',
    model: power(1.31),
    source: 'estimate',
  },

  // ---- Kodak 彩色负片 ----
  {
    id: 'kodak_portra160',
    name: 'Kodak Portra 160',
    iso: 160,
    type: 'color-negative',
    model: PRO_COLOR_NEG,
    source: 'community',
  },
  {
    id: 'kodak_portra400',
    name: 'Kodak Portra 400',
    iso: 400,
    type: 'color-negative',
    model: PRO_COLOR_NEG,
    source: 'community',
  },
  {
    id: 'kodak_portra800',
    name: 'Kodak Portra 800',
    iso: 800,
    type: 'color-negative',
    model: PRO_COLOR_NEG,
    source: 'community',
  },
  {
    id: 'kodak_ektar100',
    name: 'Kodak Ektar 100',
    iso: 100,
    type: 'color-negative',
    model: PRO_COLOR_NEG,
    source: 'community',
  },
  {
    id: 'kodak_gold',
    name: 'Kodak Gold 200',
    iso: 200,
    type: 'color-negative',
    model: CONSUMER_COLOR_NEG,
    source: 'community',
  },

  // ---- 电影卷 ----
  {
    id: 'kodak_50d',
    name: 'Kodak Vision3 50D',
    iso: 50,
    type: 'color-negative',
    model: KODAK_VISION3,
    source: 'community',
    maxReliableSeconds: 100,
  },
  {
    id: 'kodak_250d',
    name: 'Kodak Vision3 250D',
    iso: 250,
    type: 'color-negative',
    model: KODAK_VISION3,
    source: 'community',
    maxReliableSeconds: 100,
  },
  {
    id: 'kodak_500t',
    name: 'Kodak Vision3 500T',
    iso: 500,
    type: 'color-negative',
    model: KODAK_VISION3,
    source: 'community',
    maxReliableSeconds: 100,
  },
  {
    id: 'cinestill_800t',
    name: 'CineStill 800T',
    iso: 800,
    type: 'color-negative',
    model: KODAK_VISION3,
    source: 'community',
    maxReliableSeconds: 100,
  },

  // ---- Fuji 彩色负片 ----
  {
    id: 'fuji_pro160c',
    name: 'Fuji Pro 160C',
    iso: 160,
    type: 'color-negative',
    model: FUJI_PRO_NEG,
    source: 'estimate',
    maxReliableSeconds: 64,
  },
  {
    id: 'fuji_pro160ns',
    name: 'Fuji Pro 160NS',
    iso: 160,
    type: 'color-negative',
    model: FUJI_PRO_NEG,
    source: 'estimate',
    maxReliableSeconds: 64,
  },
  {
    id: 'fuji_pro400h',
    name: 'Fuji Pro 400H',
    iso: 400,
    type: 'color-negative',
    model: FUJI_PRO_NEG,
    source: 'estimate',
    maxReliableSeconds: 64,
  },
  {
    id: 'fuji_c200',
    name: 'Fuji C200',
    iso: 200,
    type: 'color-negative',
    model: FUJI_CONSUMER_NEG,
    source: 'estimate',
    maxReliableSeconds: 64,
  },
  {
    id: 'fuji_color100',
    name: 'Fujicolor 100',
    iso: 100,
    type: 'color-negative',
    model: FUJI_CONSUMER_NEG,
    source: 'estimate',
    maxReliableSeconds: 64,
  },
  {
    id: 'fuji_superia200',
    name: 'Fuji Superia 200',
    iso: 200,
    type: 'color-negative',
    model: FUJI_CONSUMER_NEG,
    source: 'estimate',
    maxReliableSeconds: 64,
  },
  {
    id: 'fuji_superia',
    name: 'Fuji Superia X-TRA 400',
    iso: 400,
    type: 'color-negative',
    model: FUJI_CONSUMER_NEG,
    source: 'estimate',
    maxReliableSeconds: 64,
  },
  {
    id: 'fuji_xtra400',
    name: 'Fuji X-TRA 400',
    iso: 400,
    type: 'color-negative',
    model: FUJI_CONSUMER_NEG,
    source: 'estimate',
    maxReliableSeconds: 64,
  },
  {
    id: 'fuji_nexia400',
    name: 'Fuji Nexia 400',
    iso: 400,
    type: 'color-negative',
    model: FUJI_CONSUMER_NEG,
    source: 'estimate',
    maxReliableSeconds: 64,
  },
  {
    id: 'fuji_superia1600',
    name: 'Fuji Superia 1600',
    iso: 1600,
    type: 'color-negative',
    model: FUJI_CONSUMER_NEG,
    source: 'estimate',
    maxReliableSeconds: 64,
  },

  // ---- 其他彩色负片 ----
  {
    id: 'lomo_cn',
    name: 'Lomography Color Negative 800',
    iso: 800,
    type: 'color-negative',
    model: power(1.4),
    source: 'community',
  },
  {
    id: 'holga400',
    name: 'Holga 400',
    iso: 400,
    type: 'color-negative',
    model: CONSUMER_COLOR_NEG,
    source: 'estimate',
  },

  // ---- 反转片 (E-6) ----
  {
    id: 'kodak_e100',
    name: 'Kodak Ektachrome E100',
    iso: 100,
    type: 'slide',
    model: table([10, 10], stops(100, 1 / 3), stops(240, 1 / 2)),
    source: 'community',
    maxReliableSeconds: 240,
  },
  {
    id: 'fuji_provia100f',
    name: 'Fujichrome Provia 100F',
    iso: 100,
    type: 'slide',
    model: FUJI_MODERN_SLIDE,
    source: 'manufacturer',
    maxReliableSeconds: 480,
  },
  {
    id: 'fuji_astia100f',
    name: 'Fujichrome Astia 100F',
    iso: 100,
    type: 'slide',
    model: FUJI_MODERN_SLIDE,
    source: 'manufacturer',
    maxReliableSeconds: 480,
  },
  {
    id: 'fuji_provia400x',
    name: 'Fujichrome Provia 400X',
    iso: 400,
    type: 'slide',
    model: FUJI_MODERN_SLIDE,
    source: 'estimate',
    maxReliableSeconds: 480,
  },
  {
    id: 'fuji_velvia100',
    name: 'Fujichrome Velvia 100',
    iso: 100,
    type: 'slide',
    model: FUJI_VELVIA100,
    source: 'manufacturer',
    maxReliableSeconds: 480,
  },
  {
    id: 'fuji_velvia100f',
    name: 'Fujichrome Velvia 100F',
    iso: 100,
    type: 'slide',
    model: FUJI_VELVIA100,
    source: 'manufacturer',
    maxReliableSeconds: 480,
  },
  {
    // Velvia 50: 4s +1/3, 8s +1/2, 16s +2/3, 32s +1 档；64s 以上官方不推荐
    id: 'fuji_velvia50',
    name: 'Fujichrome Velvia 50',
    iso: 50,
    type: 'slide',
    model: table([1, 1], stops(4, 1 / 3), stops(8, 1 / 2), stops(16, 2 / 3), stops(32, 1)),
    source: 'manufacturer',
    maxReliableSeconds: 32,
  },
  {
    id: 'fuji_sensia200',
    name: 'Fujichrome Sensia 200',
    iso: 200,
    type: 'slide',
    model: FUJI_OLDER_SLIDE,
    source: 'estimate',
    maxReliableSeconds: 64,
  },
  {
    id: 'fuji_64t',
    name: 'Fujichrome 64T',
    iso: 64,
    type: 'slide',
    model: FUJI_OLDER_SLIDE,
    source: 'estimate',
    maxReliableSeconds: 64,
  },
  {
    id: 'fuji_t64',
    name: 'Fujichrome T64',
    iso: 64,
    type: 'slide',
    model: FUJI_OLDER_SLIDE,
    source: 'estimate',
    maxReliableSeconds: 64,
  },
];
