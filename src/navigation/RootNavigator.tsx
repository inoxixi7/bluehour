import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { Layout } from '../constants/Layout';

// 导入屏幕
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import SunTimesScreen from '../screens/SunTimesScreen/SunTimesScreen';
import ExposureLabScreen from '../screens/ExposureLab/ExposureLabScreen'; // Deprecated, keeping for safety
import ExposureCalcScreen from '../screens/ExposureCalc/ExposureCalcScreen';
import ReciprocityCalcScreen from '../screens/ReciprocityCalc/ReciprocityCalcScreen';
import SettingsScreen from '../screens/SettingsScreen/SettingsScreen';
import LanguageSelectionScreen from '../screens/SettingsScreen/LanguageSelectionScreen';
import ThemeSelectionScreen from '../screens/SettingsScreen/ThemeSelectionScreen';
import AboutScreen from '../screens/SettingsScreen/AboutScreen';
import UserPresetsScreen from '../screens/UserPresetsScreen/UserPresetsScreen';

export type RootStackParamList = {
  Home: undefined;
  SunTimes: undefined;
  ExposureLab: undefined; // Deprecated
  ExposureCalc: undefined;
  ReciprocityCalc: undefined;
  Settings: undefined;
  LanguageSelection: undefined;
  ThemeSelection: undefined;
  About: undefined;
  UserPresets: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RootNavigator: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

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
          title: t('sunTimes.title'),
        }}
      />
      <Stack.Screen
        name="ExposureLab"
        component={ExposureLabScreen}
        options={{
          title: t('calculator.exposureLab.title'),
        }}
      />
      <Stack.Screen
        name="ExposureCalc"
        component={ExposureCalcScreen}
        options={{
          title: t('home.features.exposureCalc.title'),
        }}
      />
      <Stack.Screen
        name="ReciprocityCalc"
        component={ReciprocityCalcScreen}
        options={{
          title: t('home.features.reciprocityCalc.title'),
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('settings.title'),
        }}
      />
      <Stack.Screen
        name="LanguageSelection"
        component={LanguageSelectionScreen}
        options={{
          title: t('settings.language'),
        }}
      />
      <Stack.Screen
        name="ThemeSelection"
        component={ThemeSelectionScreen}
        options={{
          title: t('settings.theme'),
        }}
      />
      <Stack.Screen
        name="UserPresets"
        component={UserPresetsScreen}
        options={{
          title: t('settings.userPresets.title'),
        }}
      />
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{
          title: t('settings.about'),
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
