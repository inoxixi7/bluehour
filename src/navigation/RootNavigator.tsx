import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';
import { Layout } from '../constants/Layout';

// 导入屏幕
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import SunTimesScreen from '../screens/SunTimesScreen/SunTimesScreen';
import EVCalculator from '../screens/CalculatorScreen/tabs/EVCalculator';
import NDCalculator from '../screens/CalculatorScreen/tabs/NDCalculator';
import DoFCalculator from '../screens/CalculatorScreen/tabs/DoFCalculator';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  SunTimes: undefined;
  EVCalculator: undefined;
  NDCalculator: undefined;
  DoFCalculator: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: Layout.fontSize.lg,
        },
        cardStyle: {
          flex: 1,
        },
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SunTimes"
        component={SunTimesScreen}
        options={{
          title: '蓝调时刻',
        }}
      />
      <Stack.Screen
        name="EVCalculator"
        component={EVCalculator}
        options={{
          title: 'EV 曝光计算器',
        }}
      />
      <Stack.Screen
        name="NDCalculator"
        component={NDCalculator}
        options={{
          title: 'ND 滤镜计算器',
        }}
      />
      <Stack.Screen
        name="DoFCalculator"
        component={DoFCalculator}
        options={{
          title: '景深计算器',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: '设置',
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
