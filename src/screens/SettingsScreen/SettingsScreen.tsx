import React from 'react';
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>

        {/* 偏好设置 */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
            {t('settings.preferences')}
          </Text>
          
          <Card style={styles.settingCard}>
            <TouchableOpacity
              onPress={() => navigation.navigate('LanguageSelection')}
              activeOpacity={0.7}
              style={styles.settingItem}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="language" size={20} color={theme.colors.primary} />
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  {t('settings.language')}
                </Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
                  {LANGUAGE_NAMES[i18n.language as keyof typeof LANGUAGE_NAMES] || i18n.language}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />

            <TouchableOpacity
              onPress={() => navigation.navigate('ThemeSelection')}
              activeOpacity={0.7}
              style={styles.settingItem}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="color-palette" size={20} color={theme.colors.primary} />
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  {t('settings.theme')}
                </Text>
              </View>
              <View style={styles.settingRight}>
                <Text style={[styles.settingValue, { color: theme.colors.textSecondary }]}>
                  {getThemeLabel(themeMode)}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </Card>
        </View>

        {/* 关于 */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
            {t('settings.about')}
          </Text>
          
          <Card style={styles.settingCard}>
            <TouchableOpacity
              onPress={() => navigation.navigate('About')}
              activeOpacity={0.7}
              style={styles.settingItem}
            >
              <View style={styles.settingLeft}>
                <Ionicons name="information-circle" size={20} color={theme.colors.primary} />
                <Text style={[styles.settingLabel, { color: theme.colors.text }]}>
                  {t('settings.aboutApp')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* 联系与支持 */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
            {t('settings.feedbackSupport')}
          </Text>
          
          <Card style={styles.card}>
            <TouchableOpacity
              onPress={handleOpenGitHub}
              style={styles.linkButton}
              activeOpacity={0.7}
            >
              <Ionicons name="logo-github" size={20} color={theme.colors.text} />
              <Text style={[styles.linkButtonText, { color: theme.colors.text }]}>
                {t('settings.github')}
              </Text>
              <Ionicons name="open-outline" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            
            <TouchableOpacity
              onPress={handleContactSupport}
              style={styles.linkButton}
              activeOpacity={0.7}
            >
              <Ionicons name="mail" size={20} color={theme.colors.text} />
              <Text style={[styles.linkButtonText, { color: theme.colors.text }]}>
                {t('settings.contactSupport')}
              </Text>
              <Ionicons name="open-outline" size={16} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </Card>
        </View>

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
    paddingBottom: Layout.spacing.xxl,
  },
  section: {
    marginBottom: Layout.spacing.lg,
  },
  sectionHeader: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.xs,
  },
  card: {
    padding: Layout.spacing.lg,
  },
  settingCard: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.lg,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    flex: 1,
  },
  settingLabel: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '500',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  settingValue: {
    fontSize: Layout.fontSize.base,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: Layout.spacing.lg,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
  },
  linkButtonText: {
    fontSize: Layout.fontSize.base,
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    alignItems: 'center',
    marginTop: Layout.spacing.md,
    paddingVertical: Layout.spacing.lg,
  },
  footerText: {
    fontSize: Layout.fontSize.xs,
    marginBottom: 4,
    opacity: 0.7,
  },
});

export default SettingsScreen;
