import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useTranslation } from 'react-i18next';
import { CalculatorTabParamList } from './types';
import { useTheme } from '../contexts/ThemeContext';
import { Layout } from '../constants/Layout';

// 导入计算器子页面
import EVCalculator from '../screens/CalculatorScreen/tabs/EVCalculator';
import NDCalculator from '../screens/CalculatorScreen/tabs/NDCalculator';
import DoFCalculator from '../screens/CalculatorScreen/tabs/DoFCalculator';

const Tab = createMaterialTopTabNavigator<CalculatorTabParamList>();

const CalculatorNavigator: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.card,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
        },
        tabBarIndicatorStyle: {
          backgroundColor: theme.colors.accent,
          height: 3,
        },
        tabBarLabelStyle: {
          fontSize: Layout.fontSize.sm,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="EVCalculator"
        component={EVCalculator}
        options={{
          title: t('calculator.evTitle'),
        }}
      />
      <Tab.Screen
        name="NDCalculator"
        component={NDCalculator}
        options={{
          title: t('calculator.ndTitle'),
        }}
      />
      <Tab.Screen
        name="DoFCalculator"
        component={DoFCalculator}
        options={{
          title: t('calculator.dofTitle'),
        }}
      />
    </Tab.Navigator>
  );
};

export default CalculatorNavigator;
