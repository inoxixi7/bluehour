import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/common/Card';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';

const AboutScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        
        {/* 应用信息 */}
        <Card style={styles.card}>
          <View style={styles.appHeader}>
            <Text style={[styles.appName, { color: theme.colors.text }]}>{t('settings.appName')}</Text>
            <Text style={[styles.version, { color: theme.colors.textSecondary }]}>v1.0.0</Text>
          </View>
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            {t('settings.description')}
          </Text>
        </Card>

        {/* 功能介绍 */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
            {t('settings.features')}
          </Text>
          
          {[
            { icon: 'sunny', color: theme.colors.blueHour, titleKey: 'settings.featureList.blueHour.title', descKey: 'settings.featureList.blueHour.description' },
            { icon: 'timer', color: theme.colors.accent, titleKey: 'settings.featureList.exposureLab.title', descKey: 'settings.featureList.exposureLab.description' },
          ].map((feature) => (
            <Card style={styles.featureCard} key={feature.titleKey}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '20' }]}>
                  <Ionicons name={feature.icon as any} size={24} color={feature.color} />
                </View>
                <View style={styles.featureContent}>
                  <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{t(feature.titleKey)}</Text>
                  <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                    {t(feature.descKey)}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        {/* 数据来源 */}
        <View style={styles.section}>
          <Text style={[styles.sectionHeader, { color: theme.colors.textSecondary }]}>
            {t('settings.dataSource')}
          </Text>
          
          <Card style={styles.card}>
            <Text style={[styles.infoText, { color: theme.colors.textSecondary }]}>
              {t('settings.dataSourceText')}
            </Text>
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
    marginBottom: Layout.spacing.lg,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  appName: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: '700',
  },
  version: {
    fontSize: Layout.fontSize.base,
    fontWeight: '500',
  },
  description: {
    fontSize: Layout.fontSize.base,
    lineHeight: 22,
  },
  featureCard: {
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: Layout.fontSize.base,
    lineHeight: 20,
  },
  infoText: {
    fontSize: Layout.fontSize.base,
    lineHeight: 22,
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

export default AboutScreen;
