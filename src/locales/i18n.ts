import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import zh from './zh';
import en from './en';
import ja from './ja';
import de from './de';

// 支持的语言列表
export const SUPPORTED_LANGUAGES = ['zh', 'en', 'ja', 'de'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// 语言显示名称映射
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
  de: 'Deutsch',
};

// 存储键
const LANGUAGE_STORAGE_KEY = '@bluehour_language';

/**
 * 根据系统语言确定默认语言
 */
const getDefaultLanguage = (): SupportedLanguage => {
  try {
    // 获取系统语言列表
    const locales = Localization.getLocales();
    
    if (locales && locales.length > 0) {
      // 尝试匹配完整的 locale (如 "zh-CN")
      for (const locale of locales) {
        const languageCode = locale.languageCode;
        
        // 检查是否是支持的语言
        if (SUPPORTED_LANGUAGES.includes(languageCode as SupportedLanguage)) {
          console.log('✅ 检测到系统语言:', languageCode);
          return languageCode as SupportedLanguage;
        }
      }
    }
    
    console.log('⚠️ 系统语言不在支持列表中，使用默认语言: en');
    return 'en'; // 默认使用英语
  } catch (error) {
    console.error('❌ 获取系统语言失败:', error);
    return 'en';
  }
};

/**
 * 从存储中获取保存的语言设置
 */
export const getSavedLanguage = async (): Promise<SupportedLanguage | null> => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as SupportedLanguage)) {
      return savedLanguage as SupportedLanguage;
    }
    return null;
  } catch (error) {
    console.error('❌ 读取保存的语言设置失败:', error);
    return null;
  }
};

/**
 * 保存语言设置到存储
 */
export const saveLanguage = async (language: SupportedLanguage): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    console.log('✅ 语言设置已保存:', language);
  } catch (error) {
    console.error('❌ 保存语言设置失败:', error);
  }
};

/**
 * 初始化 i18n
 */
export const initI18n = async (): Promise<void> => {
  // 先尝试获取保存的语言设置
  const savedLanguage = await getSavedLanguage();
  
  // 如果没有保存的设置，使用系统语言
  const defaultLanguage = savedLanguage || getDefaultLanguage();
  
  console.log('🌍 初始化 i18n，使用语言:', defaultLanguage);

  await i18n
    .use(initReactI18next)
    .init({
      resources: {
        zh: { translation: zh },
        en: { translation: en },
        ja: { translation: ja },
        de: { translation: de },
      },
      lng: defaultLanguage,
      fallbackLng: 'en', // 如果翻译缺失，降级到英语
      interpolation: {
        escapeValue: false, // React 已经做了 XSS 防护
      },
      react: {
        useSuspense: false, // 禁用 Suspense，避免 React Native 问题
      },
    } as any);
};

/**
 * 切换语言
 */
export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
  try {
    await i18n.changeLanguage(language);
    await saveLanguage(language);
    console.log('✅ 语言已切换至:', language);
  } catch (error) {
    console.error('❌ 切换语言失败:', error);
  }
};

export default i18n;
