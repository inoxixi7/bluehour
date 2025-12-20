import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeColors {
  // 背景色
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // 卡片
  card: string;
  cardBorder: string;
  
  // 文字
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // 主色调
  primary: string;
  accent: string;
  
  // 状态色
  success: string;
  warning: string;
  error: string;
  information: string;
  
  // 特殊色（摄影相关）
  sunrise: string;
  sunset: string;
  goldenHour: string;
  blueHour: string;
  twilight: string;
  
  // 边框和分隔线
  border: string;
  divider: string;
  
  // 按钮
  buttonPrimary: string;
  buttonPrimaryText: string;
  buttonSecondary: string;
  buttonSecondaryText: string;
}

interface Theme {
  colors: ThemeColors;
  isDark: boolean;
}

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  backgroundSecondary: '#F5F7FA',
  backgroundTertiary: '#E8ECF1',
  
  card: '#FFFFFF',
  cardBorder: '#E1E8ED',
  
  text: '#1A202C',
  textSecondary: '#4A5568',
  textTertiary: '#718096',
  
  primary: '#3B82F6',
  accent: '#F59E0B',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  information: '#3B82F6',
  
  sunrise: '#FF6B35',
  sunset: '#FF8C42',
  goldenHour: '#FFB627',
  blueHour: '#4A90E2',
  twilight: '#6B7FD7',
  
  border: '#E1E8ED',
  divider: '#E5E7EB',
  
  buttonPrimary: '#3B82F6',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#F3F4F6',
  buttonSecondaryText: '#374151',
};

const darkColors: ThemeColors = {
  background: '#0F172A',
  backgroundSecondary: '#1E293B',
  backgroundTertiary: '#334155',
  
  card: '#1E293B',
  cardBorder: '#334155',
  
  text: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  
  primary: '#60A5FA',
  accent: '#FBBF24',
  
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  information: '#60A5FA',
  
  sunrise: '#FF8C42',
  sunset: '#FFA06B',
  goldenHour: '#FFC857',
  blueHour: '#5BA3F5',
  twilight: '#8B9FE8',
  
  border: '#334155',
  divider: '#475569',
  
  buttonPrimary: '#3B82F6',
  buttonPrimaryText: '#FFFFFF',
  buttonSecondary: '#334155',
  buttonSecondaryText: '#F1F5F9',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_mode';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('auto');
  
  // 从存储加载主题设置
  useEffect(() => {
    loadThemeMode();
  }, []);
  
  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'auto')) {
        setThemeModeState(savedMode as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme mode:', error);
    }
  };
  
  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };
  
  // 计算当前主题
  const isDark = themeMode === 'auto' 
    ? systemColorScheme === 'dark'
    : themeMode === 'dark';
  
  const theme: Theme = {
    colors: isDark ? darkColors : lightColors,
    isDark,
  };
  
  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
