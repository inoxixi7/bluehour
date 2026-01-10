/**
 * 胶卷数据库
 * 包含常见胶卷的ISO和倒易律数据
 */

import { FilmStock } from '../types/userPreset';
import { RECIPROCITY_PROFILES } from './Photography';

/**
 * 预置胶卷数据库
 * 从 Photography 常量中的倒易律配置转换而来
 */
export const FILM_STOCK_DATABASE: FilmStock[] = RECIPROCITY_PROFILES.filter(
  (profile) => profile.id !== 'digital' // 排除数码选项
).map((profile) => ({
  id: profile.id,
  name: profile.id, // 临时使用ID作为名称
  nameKey: profile.nameKey,
  description: profile.id,
  descriptionKey: profile.descriptionKey,
  iso: getFilmISO(profile.id), // 从ID推断ISO
  reciprocityCurve: profile.curve,
  isCustom: false,
}));

/**
 * 从胶卷ID推断标准ISO值
 */
function getFilmISO(filmId: string): number {
  // 从ID中提取ISO
  const isoMatch = filmId.match(/(\d+)/);
  if (isoMatch) {
    return parseInt(isoMatch[1], 10);
  }

  // 默认ISO值映射
  const defaultISO: Record<string, number> = {
    kodak_portra: 400,
    kodak_gold: 200,
    kodak_trix: 400,
    fuji_superia: 400,
    fuji_acros: 100,
    ilford_hp5: 400,
    ilford_fp4: 125,
    ilford_delta3200: 3200,
    ilford_panf: 50,
    cinestill_800t: 800,
    lomo_cn: 400,
  };

  return defaultISO[filmId] || 400;
}

/**
 * 常用胶卷快速选择列表
 */
export const POPULAR_FILMS: FilmStock[] = [
  {
    id: 'kodak_portra_400',
    name: 'Kodak Portra 400',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_portra',
    iso: 400,
    reciprocityCurve: RECIPROCITY_PROFILES.find((p) => p.id === 'kodak_portra')?.curve,
    isCustom: false,
  },
  {
    id: 'fuji_acros',
    name: 'Fuji Neopan Acros II 100',
    nameKey: 'calculator.exposureLab.reciprocity.fuji_acros',
    iso: 100,
    reciprocityCurve: RECIPROCITY_PROFILES.find((p) => p.id === 'fuji_acros')?.curve,
    isCustom: false,
  },
  {
    id: 'kodak_trix',
    name: 'Kodak Tri-X 400',
    nameKey: 'calculator.exposureLab.reciprocity.kodak_trix',
    iso: 400,
    reciprocityCurve: RECIPROCITY_PROFILES.find((p) => p.id === 'kodak_trix')?.curve,
    isCustom: false,
  },
  {
    id: 'ilford_hp5',
    name: 'Ilford HP5 Plus 400',
    nameKey: 'calculator.exposureLab.reciprocity.ilford_hp5',
    iso: 400,
    reciprocityCurve: RECIPROCITY_PROFILES.find((p) => p.id === 'ilford_hp5')?.curve,
    isCustom: false,
  },
  {
    id: 'cinestill_800t',
    name: 'Cinestill 800T',
    nameKey: 'calculator.exposureLab.reciprocity.cinestill_800t',
    iso: 800,
    reciprocityCurve: RECIPROCITY_PROFILES.find((p) => p.id === 'cinestill_800t')?.curve,
    isCustom: false,
  },
];

/**
 * 创建自定义胶卷
 */
export const createCustomFilm = (
  name: string,
  iso: number,
  reciprocityCurve?: any[]
): FilmStock => ({
  id: `custom_${Date.now()}`,
  name,
  iso,
  reciprocityCurve,
  isCustom: true,
});

/**
 * 根据ID获取胶卷数据
 */
export const getFilmById = (id: string): FilmStock | undefined => {
  return FILM_STOCK_DATABASE.find((film) => film.id === id);
};

/**
 * 搜索胶卷
 */
export const searchFilms = (query: string): FilmStock[] => {
  const lowerQuery = query.toLowerCase();
  return FILM_STOCK_DATABASE.filter(
    (film) =>
      film.name.toLowerCase().includes(lowerQuery) ||
      (film.description && film.description.toLowerCase().includes(lowerQuery))
  );
};
