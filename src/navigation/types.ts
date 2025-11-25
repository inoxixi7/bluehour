// Navigation 类型定义

import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// 底部标签导航参数类型
export type RootTabParamList = {
  SunTimes: undefined;
  Calculator: undefined;
  Settings: undefined;
};

// 底部标签导航 Props 类型
export type RootTabNavigationProp = BottomTabNavigationProp<RootTabParamList>;
