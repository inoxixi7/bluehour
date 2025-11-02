import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { CalculatorTabParamList } from './types';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

// 导入计算器子页面
import EVCalculator from '../screens/CalculatorScreen/tabs/EVCalculator';
import NDCalculator from '../screens/CalculatorScreen/tabs/NDCalculator';
import DoFCalculator from '../screens/CalculatorScreen/tabs/DoFCalculator';

const Tab = createMaterialTopTabNavigator<CalculatorTabParamList>();

const CalculatorNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.primaryLight,
        },
        tabBarIndicatorStyle: {
          backgroundColor: Colors.accent,
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
          title: 'EV 曝光',
        }}
      />
      <Tab.Screen
        name="NDCalculator"
        component={NDCalculator}
        options={{
          title: 'ND 滤镜',
        }}
      />
      <Tab.Screen
        name="DoFCalculator"
        component={DoFCalculator}
        options={{
          title: '景深',
        }}
      />
    </Tab.Navigator>
  );
};

export default CalculatorNavigator;
