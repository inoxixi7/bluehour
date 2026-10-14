// Navigation 类型定义

import type { StackNavigationProp } from '@react-navigation/stack';

export type RootStackParamList = {
  Home: undefined;
  SunTimes: undefined;
  ExposureCalc: undefined;
  ReciprocityCalc: { initialShutter?: number } | undefined;
  Settings: undefined;
  LanguageSelection: undefined;
  ThemeSelection: undefined;
  About: undefined;
  UserPresets: undefined;
};

export type RootStackNavigationProp = StackNavigationProp<RootStackParamList>;
