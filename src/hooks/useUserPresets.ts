/**
 * 用户预设管理 Hook
 * 提供预设的创建、读取、更新、删除功能
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreset, UserPresetList, FilmStock } from '../types/userPreset';

const PRESETS_STORAGE_KEY = '@user_presets';
const ACTIVE_PRESET_KEY = '@active_preset_id';

export const useUserPresets = () => {
  const [presets, setPresets] = useState<UserPreset[]>([]);
  const [activePresetId, setActivePresetId] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  // 加载预设
  const loadPresets = useCallback(async () => {
    try {
      setLoading(true);
      const [presetsJson, activeId] = await Promise.all([
        AsyncStorage.getItem(PRESETS_STORAGE_KEY),
        AsyncStorage.getItem(ACTIVE_PRESET_KEY),
      ]);

      if (presetsJson) {
        const parsed: UserPreset[] = JSON.parse(presetsJson);
        // 转换日期字符串为Date对象
        const presetsWithDates = parsed.map((p) => ({
          ...p,
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
        }));
        setPresets(presetsWithDates);
      }

      if (activeId) {
        setActivePresetId(activeId);
      }
    } catch (error) {
      console.error('加载预设失败:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // 保存预设列表
  const savePresets = useCallback(async (newPresets: UserPreset[]) => {
    try {
      await AsyncStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(newPresets));
      setPresets(newPresets);
    } catch (error) {
      console.error('保存预设失败:', error);
      throw error;
    }
  }, []);

  // 创建新预设
  const createPreset = useCallback(
    async (preset: Omit<UserPreset, 'id' | 'createdAt' | 'updatedAt'>) => {
      const newPreset: UserPreset = {
        ...preset,
        id: `preset_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const newPresets = [...presets, newPreset];
      await savePresets(newPresets);
      return newPreset;
    },
    [presets, savePresets]
  );

  // 更新预设
  const updatePreset = useCallback(
    async (id: string, updates: Partial<Omit<UserPreset, 'id' | 'createdAt'>>) => {
      const newPresets = presets.map((p) =>
        p.id === id
          ? {
              ...p,
              ...updates,
              updatedAt: new Date(),
            }
          : p
      );

      await savePresets(newPresets);
    },
    [presets, savePresets]
  );

  // 删除预设
  const deletePreset = useCallback(
    async (id: string) => {
      const newPresets = presets.filter((p) => p.id !== id);
      await savePresets(newPresets);

      // 如果删除的是激活的预设，清除激活状态
      if (activePresetId === id) {
        await setActivePreset(undefined);
      }
    },
    [presets, savePresets, activePresetId]
  );

  // 设置激活的预设
  const setActivePreset = useCallback(async (id: string | undefined) => {
    try {
      if (id) {
        await AsyncStorage.setItem(ACTIVE_PRESET_KEY, id);
      } else {
        await AsyncStorage.removeItem(ACTIVE_PRESET_KEY);
      }
      setActivePresetId(id);
    } catch (error) {
      console.error('设置激活预设失败:', error);
    }
  }, []);

  // 获取激活的预设
  const getActivePreset = useCallback((): UserPreset | undefined => {
    if (!activePresetId) return undefined;
    return presets.find((p) => p.id === activePresetId);
  }, [activePresetId, presets]);

  // 初始加载
  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  return {
    presets,
    activePresetId,
    activePreset: getActivePreset(),
    loading,
    createPreset,
    updatePreset,
    deletePreset,
    setActivePreset,
    refreshPresets: loadPresets,
  };
};
