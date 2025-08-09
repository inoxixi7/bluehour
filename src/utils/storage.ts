import AsyncStorage from '@react-native-async-storage/async-storage';
import { GeocodeResult } from '../types';

const KEY_SELECTION_HISTORY = 'selection_history_v1';
const MAX_LEN = 5;

/**
 * 加载最近选择历史（如果无数据返回空数组）
 */
export async function loadSelectionHistory(): Promise<GeocodeResult[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_SELECTION_HISTORY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, MAX_LEN);
  } catch (e) {
    console.warn('加载选择历史失败:', e);
    return [];
  }
}

/**
 * 保存最近选择历史（自动截断到最大长度）
 */
export async function saveSelectionHistory(list: GeocodeResult[]): Promise<void> {
  try {
    const sliced = list.slice(0, MAX_LEN);
    await AsyncStorage.setItem(KEY_SELECTION_HISTORY, JSON.stringify(sliced));
  } catch (e) {
    console.warn('保存选择历史失败:', e);
  }
}
