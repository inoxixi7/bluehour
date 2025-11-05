import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';
import { changeLanguage, SUPPORTED_LANGUAGES, LANGUAGE_NAMES, SupportedLanguage } from '../../locales/i18n';

const LanguageSelectionScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();

  const handleLanguageChange = async (language: SupportedLanguage) => {
    await changeLanguage(language);
    // 不自动返回,让用户自行选择
  };

  const renderLanguageOption = (language: SupportedLanguage) => {
    const isSelected = i18n.language === language;
    return (
      <TouchableOpacity
        key={language}
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
        onPress={() => handleLanguageChange(language)}
        activeOpacity={0.7}
      >
        <Text style={[
          styles.optionLabel,
          { color: theme.colors.text },
          isSelected && { color: theme.colors.primary, fontWeight: '600' }
        ]}>
          {LANGUAGE_NAMES[language]}
        </Text>
        {isSelected && (
          <Text style={[styles.checkmark, { color: theme.colors.primary }]}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {t('settings.selectLanguageDesc')}
          </Text>
          
          <View style={styles.optionsContainer}>
            {SUPPORTED_LANGUAGES.map(lang => renderLanguageOption(lang))}
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
    gap: Layout.spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
  },
  optionLabel: {
    fontSize: Layout.fontSize.lg,
    flex: 1,
  },
  checkmark: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: Layout.spacing.md,
  },
});

export default LanguageSelectionScreen;
