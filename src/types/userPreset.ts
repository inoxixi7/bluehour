// 用户预设类型定义

import { ReciprocityCurvePoint } from '../constants/Photography';

/**
 * 胶卷数据
 */
export interface FilmStock {
  id: string;
  name: string;
  nameKey?: string; // 多语言key
  iso: number;
  reciprocityCurve?: ReciprocityCurvePoint[];
  isCustom?: boolean; // 是否是用户自定义
  description?: string;
  descriptionKey?: string;
}

/**
 * 用户设备预设
 */
export interface UserPreset {
  id: string;
  name: string; // 预设名称，如"风光套装"
  
  // 相机信息
  camera?: string; // 相机名称，如"Nikon Z6 II"
  
  // 镜头信息
  lens?: string; // 镜头名称及焦段，如"24-70mm f/2.8"
  
  // Supported settings (selected subsets)
  shutterSpeeds?: number[];
  apertures?: number[];
  isos?: number[];

  // Default exposure parameters (optional)
  defaultAperture?: number;
  defaultShutter?: number;
  defaultISO?: number;
  
  // 创建和更新时间
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 用户预设列表
 */
export interface UserPresetList {
  presets: UserPreset[];
  activePresetId?: string; // 当前激活的预设ID
}
