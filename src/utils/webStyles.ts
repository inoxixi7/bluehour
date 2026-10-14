import type { ViewStyle } from 'react-native';

/**
 * react-native-web 支持、但 React Native 类型里没有的样式
 * （如 cursor、position: 'fixed'），集中在这里做一次类型转换
 */
export const webStyle = (style: Record<string, string | number>): ViewStyle =>
  style as unknown as ViewStyle;
