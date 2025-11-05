import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';

const ThemeSelectionScreen: React.FC = () => {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation();

  const handleThemeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    // 不自动返回,让用户自行选择
  };

  const themeOptions: Array<{ mode: ThemeMode; label: string; icon: string; description: string }> = [
    {
      mode: 'light',
      label: t('settings.themeLight'),
      icon: '☀️',
      description: t('settings.themeLightDesc'),
    },
    {
      mode: 'dark',
      label: t('settings.themeDark'),
      icon: '🌙',
      description: t('settings.themeDarkDesc'),
    },
    {
      mode: 'auto',
      label: t('settings.themeAuto'),
      icon: '🔄',
      description: t('settings.themeAutoDesc'),
    },
  ];

  const renderThemeOption = (option: typeof themeOptions[0]) => {
    const isSelected = themeMode === option.mode;
    return (
      <TouchableOpacity
        key={option.mode}
        style={[
          styles.option,
          { 
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.border,
          },
          isSelected && { 
            backgroundColor: theme.colors.primary + '20',
            borderColor: theme.colors.primary,
            borderWidth: 2,
          }
        ]}
        onPress={() => handleThemeChange(option.mode)}
        activeOpacity={0.7}
      >
        <View style={styles.optionContent}>
          <View style={styles.optionHeader}>
            <Text style={[
              styles.icon,
              isSelected && { transform: [{ scale: 1.1 }] }
            ]}>
              {option.icon}
            </Text>
            <Text style={[
              styles.optionLabel,
              { color: theme.colors.text },
              isSelected && { color: theme.colors.primary, fontWeight: '600' }
            ]}>
              {option.label}
            </Text>
            {isSelected && (
              <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
            )}
          </View>
          <Text style={[styles.optionDescription, { color: theme.colors.textSecondary }]}>
            {option.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {t('settings.selectThemeDesc')}
          </Text>
          
          <View style={styles.optionsContainer}>
            {themeOptions.map(option => renderThemeOption(option))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Layout.spacing.lg,
  },
  description: {
    fontSize: Layout.fontSize.md,
    marginBottom: Layout.spacing.lg,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: Layout.spacing.lg,
  },
  option: {
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
  },
  optionContent: {
    gap: Layout.spacing.sm,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
  },
  icon: {
    fontSize: 24,
  },
  optionLabel: {
    fontSize: Layout.fontSize.lg,
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  optionDescription: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 20,
    marginLeft: 40, // icon + gap offset
  },
});

export default ThemeSelectionScreen;
