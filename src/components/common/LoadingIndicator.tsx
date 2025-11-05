import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';

interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'large';
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message,
  size = 'large',
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const displayMessage = message || t('common.loading');
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🌅</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>BlueHour</Text>
        <Text style={[styles.message, { color: theme.colors.textSecondary }]}>{displayMessage}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  emoji: {
    fontSize: 64,
    marginBottom: Layout.spacing.md,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.sm,
  },
  message: {
    fontSize: Layout.fontSize.md,
    textAlign: 'center',
  },
});
