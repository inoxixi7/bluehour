import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/common/Card';
import { AppButton } from '../../components/common/AppButton';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';
import { changeLanguage, SUPPORTED_LANGUAGES, LANGUAGE_NAMES, SupportedLanguage } from '../../locales/i18n';

const SettingsScreen: React.FC = () => {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { t, i18n } = useTranslation();
  
  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/inoxixi7');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@example.com');
  };

  const handleLanguageChange = async (language: SupportedLanguage) => {
    await changeLanguage(language);
  };

  const renderLanguageOption = (language: SupportedLanguage) => {
    const isSelected = i18n.language === language;
    return (
      <TouchableOpacity
        key={language}
        style={[
          styles.themeOption,
          isSelected && { 
            backgroundColor: theme.colors.primary + '20',
            borderColor: theme.colors.primary,
          }
        ]}
        onPress={() => handleLanguageChange(language)}
      >
        <Text style={[
          styles.themeLabel,
          { color: theme.colors.text },
          isSelected && { color: theme.colors.primary, fontWeight: '600' }
        ]}>
          {LANGUAGE_NAMES[language]}
        </Text>
        {isSelected && (
          <Text style={{ color: theme.colors.primary, marginLeft: 'auto' }}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderThemeOption = (mode: ThemeMode, label: string, icon: string) => {
    const isSelected = themeMode === mode;
    return (
      <TouchableOpacity
        style={[
          styles.themeOption,
          isSelected && { 
            backgroundColor: theme.colors.primary + '20',
            borderColor: theme.colors.primary,
          }
        ]}
        onPress={() => setThemeMode(mode)}
      >
        <Text style={[
          styles.themeIcon,
          isSelected && { color: theme.colors.primary }
        ]}>
          {icon}
        </Text>
        <Text style={[
          styles.themeLabel,
          { color: theme.colors.text },
          isSelected && { color: theme.colors.primary, fontWeight: '600' }
        ]}>
          {label}
        </Text>
        {isSelected && (
          <Text style={{ color: theme.colors.primary, marginLeft: 'auto' }}>✓</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>

        {/* 语言设置 */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>{t('settings.language')}</Text>
          <View style={styles.themeOptions}>
            {SUPPORTED_LANGUAGES.map(lang => renderLanguageOption(lang))}
          </View>
        </Card>

        {/* 主题设置 */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>{t('settings.theme')}</Text>
          <View style={styles.themeOptions}>
            {renderThemeOption('light', t('settings.themeLight'), '☀️')}
            {renderThemeOption('dark', t('settings.themeDark'), '🌙')}
            {renderThemeOption('auto', t('settings.themeAuto'), '🔄')}
          </View>
        </Card>

        {/* 关于 */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>{t('settings.about')}</Text>
          <Text style={[styles.appName, { color: theme.colors.blueHour }]}>{t('settings.appName')}</Text>
          <Text style={[styles.version, { color: theme.colors.textSecondary }]}>{t('settings.version')} 1.0.0</Text>
          <Text style={[styles.description, { color: theme.colors.text }]}>
            {t('settings.description')}
          </Text>
        </Card>

        {/* 功能说明 */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>{t('settings.features')}</Text>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🌅</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{t('settings.featureList.blueHour.title')}</Text>
              <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                {t('settings.featureList.blueHour.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📷</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{t('settings.featureList.evCalculator.title')}</Text>
              <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                {t('settings.featureList.evCalculator.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⚫</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{t('settings.featureList.ndFilter.title')}</Text>
              <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                {t('settings.featureList.ndFilter.description')}
              </Text>
            </View>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🎯</Text>
            <View style={styles.featureContent}>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{t('settings.featureList.dof.title')}</Text>
              <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                {t('settings.featureList.dof.description')}
              </Text>
            </View>
          </View>
        </Card>

        {/* 数据来源 */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>{t('settings.dataSource')}</Text>
          <Text style={[styles.infoText, { color: theme.colors.text }]}>
            {t('settings.dataSourceText')}
          </Text>
        </Card>

        {/* 联系方式 */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>{t('settings.feedbackSupport')}</Text>
          <AppButton
            title={t('settings.github')}
            onPress={handleOpenGitHub}
            variant="outline"
            style={styles.button}
          />
          <AppButton
            title={t('settings.contactSupport')}
            onPress={handleContactSupport}
            variant="outline"
            style={styles.button}
          />
        </Card>

        {/* 版权信息 */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            {t('settings.copyright')}
          </Text>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            {t('settings.madeWithLove')}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Layout.spacing.md,
  },
  title: {
    fontSize: Layout.fontSize.hero,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.lg,
    textAlign: 'center',
  },
  card: {
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.md,
  },
  sectionDescription: {
    fontSize: Layout.fontSize.sm,
    marginBottom: Layout.spacing.md,
    lineHeight: 20,
  },
  themeOptions: {
    gap: Layout.spacing.sm,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
    marginBottom: Layout.spacing.sm,
  },
  themeIcon: {
    fontSize: Layout.fontSize.xxl,
    marginRight: Layout.spacing.md,
  },
  themeLabel: {
    fontSize: Layout.fontSize.base,
  },
  appName: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.xs,
  },
  version: {
    fontSize: Layout.fontSize.base,
    marginBottom: Layout.spacing.md,
  },
  description: {
    fontSize: Layout.fontSize.base,
    lineHeight: 24,
  },
  featureItem: {
    flexDirection: 'row',
    marginBottom: Layout.spacing.md,
    paddingBottom: Layout.spacing.md,
  },
  featureIcon: {
    fontSize: Layout.iconSize.lg,
    marginRight: Layout.spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  featureDescription: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 20,
  },
  infoText: {
    fontSize: Layout.fontSize.base,
    lineHeight: 24,
  },
  button: {
    marginBottom: Layout.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.xl,
  },
  footerText: {
    fontSize: Layout.fontSize.sm,
    marginBottom: Layout.spacing.xs,
  },
});

export default SettingsScreen;
