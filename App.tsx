import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import PhotographyTimerScreen from './src/screens/PhotographyTimerScreen';
import { useI18n, AppLocale } from './src/i18n';
import { I18nContext } from './src/i18n/context';

export default function App() {
  const i18n = useI18n();
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <I18nContext.Provider value={i18n}>
        <PhotographyTimerScreen key={i18n.locale} />
      </I18nContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
