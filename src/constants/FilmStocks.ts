/**
 * 胶卷数据库
 * 由倒易律数据（./FilmReciprocity.ts）派生，包含 ISO 与倒易律模型
 */

import { FilmStock } from '../types/userPreset';
import { ReciprocityModel } from './FilmReciprocity';
import { RECIPROCITY_PROFILES } from './Photography';

/**
 * 预置胶卷数据库（不含数码选项）
 */
export const FILM_STOCK_DATABASE: FilmStock[] = RECIPROCITY_PROFILES.filter(
  profile => profile.type !== 'digital'
).map(profile => ({
  id: profile.id,
  name: profile.name,
  nameKey: profile.nameKey,
  descriptionKey: profile.descriptionKey,
  iso: profile.iso,
  reciprocityModel: profile.model,
  isCustom: false,
}));

const POPULAR_FILM_IDS = [
  'kodak_portra400',
  'fuji_acros',
  'kodak_trix',
  'ilford_hp5',
  'cinestill_800t',
];

/**
 * 常用胶卷快速选择列表
 */
export const POPULAR_FILMS: FilmStock[] = POPULAR_FILM_IDS.map(id =>
  FILM_STOCK_DATABASE.find(film => film.id === id)
).filter((film): film is FilmStock => film !== undefined);

/**
 * 创建自定义胶卷
 */
export const createCustomFilm = (
  name: string,
  iso: number,
  reciprocityModel?: ReciprocityModel
): FilmStock => ({
  id: `custom_${Date.now()}`,
  name,
  iso,
  reciprocityModel,
  isCustom: true,
});

/**
 * 根据ID获取胶卷数据
 */
export const getFilmById = (id: string): FilmStock | undefined => {
  return FILM_STOCK_DATABASE.find(film => film.id === id);
};

/**
 * 搜索胶卷
 */
export const searchFilms = (query: string): FilmStock[] => {
  const lowerQuery = query.toLowerCase();
  return FILM_STOCK_DATABASE.filter(
    film =>
      film.name.toLowerCase().includes(lowerQuery) ||
      (film.description && film.description.toLowerCase().includes(lowerQuery))
  );
};
