import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { Card } from '../../components/common/Card';
import { AppButton } from '../../components/common/AppButton';
import { useTheme, ThemeMode } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';
import { LANGUAGE_NAMES } from '../../locales/i18n';

const SettingsScreen: React.FC = () => {
  const { theme, themeMode } = useTheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  
  const handleOpenGitHub = () => {
    Linking.openURL('https://github.com/inoxixi7');
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@example.com');
  };

  const getThemeLabel = (mode: ThemeMode) => {
    switch (mode) {
      case 'light':
        return t('settings.themeLight');
      case 'dark':
        return t('settings.themeDark');
      case 'auto':
        return t('settings.themeAuto');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>

        {/* 语言设置 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('LanguageSelection')}
          activeOpacity={0.7}
        >
          <Card style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={[styles.sectionTitle, styles.settingLabel, { color: theme.colors.accent }]}>
                {t('settings.language')}
              </Text>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
                  {LANGUAGE_NAMES[i18n.language as keyof typeof LANGUAGE_NAMES] || i18n.language}
                </Text>
                <Text style={[styles.arrow, { color: theme.colors.textSecondary }]}>›</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* 主题设置 */}
        <TouchableOpacity
          onPress={() => navigation.navigate('ThemeSelection')}
          activeOpacity={0.7}
        >
          <Card style={styles.card}>
            <View style={styles.settingRow}>
              <Text style={[styles.sectionTitle, styles.settingLabel, { color: theme.colors.accent }]}>
                {t('settings.theme')}
              </Text>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
                  {getThemeLabel(themeMode)}
                </Text>
                <Text style={[styles.arrow, { color: theme.colors.textSecondary }]}>›</Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

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
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28, // 确保有足够的高度对齐
  },
  settingLabel: {
    marginBottom: 0, // 覆盖 sectionTitle 的 marginBottom
    lineHeight: 28, // 确保行高一致
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  settingValue: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '600',
    lineHeight: 28, // 与标题行高一致
  },
  arrow: {
    fontSize: 24,
    fontWeight: '300',
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
