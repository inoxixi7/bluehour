/**
 * API 辅助工具
 * 提供重试、缓存等功能
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { debugLog } from './logger';

/**
 * 带重试机制的 fetch
 * @param fetchFn 要执行的异步函数
 * @param maxRetries 最大重试次数
 * @param delay 重试延迟（毫秒）
 */
export const fetchWithRetry = async <T>(
  fetchFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      const isLastAttempt = i === maxRetries - 1;
      
      if (isLastAttempt) {
        console.error(`❌ API 请求失败，已重试 ${maxRetries} 次:`, error);
        throw error;
      }
      
      const waitTime = delay * (i + 1); // 递增延迟
      console.warn(`⚠️ API 请求失败，${waitTime}ms 后重试 (${i + 1}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw new Error('Max retries reached');
};

interface CacheData<T> {
  data: T;
  timestamp: number;
}

/**
 * 带缓存的 fetch
 * @param cacheKey 缓存键
 * @param fetchFn 要执行的异步函数
 * @param ttl 缓存有效时间（毫秒），默认 1 小时
 * @param forceRefresh 强制刷新缓存
 */
export const fetchWithCache = async <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl: number = 3600000, // 1小时
  forceRefresh: boolean = false
): Promise<T> => {
  // 如果不强制刷新，尝试从缓存读取
  if (!forceRefresh) {
    try {
      const cached = await AsyncStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp }: CacheData<T> = JSON.parse(cached);
        const age = Date.now() - timestamp;
        
        if (age < ttl) {
          debugLog(`📦 使用缓存数据: ${cacheKey} (${Math.round(age / 1000)}s 前)`);
          return data;
        } else {
          debugLog(`⏰ 缓存已过期: ${cacheKey} (${Math.round(age / 1000)}s 前)`);
        }
      }
    } catch (e) {
      console.warn('⚠️ 读取缓存失败:', e);
    }
  }

  // 获取新数据
  debugLog(`🌐 获取新数据: ${cacheKey}`);
  const data = await fetchFn();
  
  // 保存到缓存
  try {
    const cacheData: CacheData<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    debugLog(`💾 数据已缓存: ${cacheKey}`);
  } catch (e) {
    console.warn('⚠️ 保存缓存失败:', e);
    // 缓存失败不影响返回数据
  }

  return data;
};

/**
 * 清除指定的缓存
 */
export const clearCache = async (cacheKey: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(cacheKey);
    debugLog(`🗑️ 缓存已清除: ${cacheKey}`);
  } catch (e) {
    console.warn('⚠️ 清除缓存失败:', e);
  }
};

/**
 * 清除所有以特定前缀开头的缓存
 */
export const clearCacheByPrefix = async (prefix: string): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const keysToRemove = keys.filter(key => key.startsWith(prefix));
    await AsyncStorage.multiRemove(keysToRemove);
    debugLog(`🗑️ 已清除 ${keysToRemove.length} 个缓存项 (前缀: ${prefix})`);
  } catch (e) {
    console.warn('⚠️ 批量清除缓存失败:', e);
  }
};

/**
 * 网络请求错误类型检测
 */
export const isNetworkError = (error: any): boolean => {
  return (
    error.message === 'Network request failed' ||
    error.message === 'Failed to fetch' ||
    error.name === 'NetworkError'
  );
};

/**
 * 生成缓存键
 */
export const generateCacheKey = (prefix: string, params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  return `${prefix}:${sortedParams}`;
};
