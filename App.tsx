import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet, Text } from 'react-native';
import RootNavigator from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/contexts/ThemeContext';
import { initI18n } from './src/locales/i18n';

function AppContent() {
  const { theme } = useTheme();
  const [i18nInitialized, setI18nInitialized] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        await initI18n();
        setI18nInitialized(true);
      } catch (error) {
        console.error('❌ i18n 初始化失败:', error);
        setI18nInitialized(true); // 即使失败也继续加载
      }
    };
    init();
  }, []);

  if (!i18nInitialized) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text style={{ color: theme.colors.text }}>Loading...</Text>
      </View>
    );
  }
  
  return (
    <View style={styles.appContainer}>
      <NavigationContainer>
        <StatusBar style={theme.isDark ? 'light' : 'dark'} />
        <RootNavigator />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
