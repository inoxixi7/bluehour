// Navigation 类型定义

import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp } from '@react-navigation/native';
import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';

// 底部标签导航参数类型
export type RootTabParamList = {
  SunTimes: undefined;
  Calculator: undefined;
  Settings: undefined;
};

// 计算器顶部标签导航参数类型
export type CalculatorTabParamList = {
  EVCalculator: undefined;
  NDCalculator: undefined;
  DoFCalculator: undefined;
};

// 底部标签导航 Props 类型
export type RootTabNavigationProp = BottomTabNavigationProp<RootTabParamList>;

// 计算器标签导航 Props 类型
export type CalculatorTabNavigationProp = MaterialTopTabNavigationProp<CalculatorTabParamList>;

// 组合导航 Props 类型（用于嵌套导航）
export type CalculatorScreenNavigationProp = CompositeNavigationProp<
  RootTabNavigationProp,
  CalculatorTabNavigationProp
>;
