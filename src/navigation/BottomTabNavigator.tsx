import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from './types';
import { useTheme } from '../contexts/ThemeContext';
import { Layout } from '../constants/Layout';

// 导入屏幕组件
import SunTimesScreen from '../screens/SunTimesScreen/SunTimesScreen';
import ExposureCalcScreen from '../screens/ExposureCalc/ExposureCalcScreen';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';

// 图标组件（使用简单的文字占位，实际项目中应使用图标库如 @expo/vector-icons）
import { Text } from 'react-native';

const Tab = createBottomTabNavigator<RootTabParamList>();

const BottomTabNavigator: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderTopColor: theme.colors.border,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: Layout.fontSize.lg,
        },
      }}
    >
      <Tab.Screen
        name="SunTimes"
        component={SunTimesScreen}
        options={{
          title: '蓝调时刻',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>🌅</Text>,
        }}
      />
      <Tab.Screen
        name="Calculator"
        component={ExposureCalcScreen}
        options={{
          title: '曝光计算器',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>⏱️</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '设置',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 24 }}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
