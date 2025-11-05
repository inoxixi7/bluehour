import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';
import { useNavigation } from '@react-navigation/native';
import CurrentPhaseCard from '../../components/CurrentPhaseCard';

type FeatureCard = {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  route: string;
};

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();

  const features: FeatureCard[] = [
    {
      id: 'sunTimes',
      title: t('home.features.sunTimes.title'),
      description: t('home.features.sunTimes.description'),
      icon: '🌅',
      color: theme.colors.blueHour,
      route: 'SunTimes',
    },
    {
      id: 'evCalculator',
      title: t('home.features.evCalculator.title'),
      description: t('home.features.evCalculator.description'),
      icon: '📷',
      color: theme.colors.primary,
      route: 'EVCalculator',
    },
    {
      id: 'ndCalculator',
      title: t('home.features.ndCalculator.title'),
      description: t('home.features.ndCalculator.description'),
      icon: '⚫',
      color: theme.colors.twilight,
      route: 'NDCalculator',
    },
    {
      id: 'dofCalculator',
      title: t('home.features.dofCalculator.title'),
      description: t('home.features.dofCalculator.description'),
      icon: '🎯',
      color: theme.colors.success,
      route: 'DoFCalculator',
    },
    {
      id: 'settings',
      title: t('home.features.settings.title'),
      description: t('home.features.settings.description'),
      icon: '⚙️',
      color: theme.colors.textSecondary,
      route: 'Settings',
    },
  ];

  const renderFeatureCard = (feature: FeatureCard, index: number) => {
    const isLastOdd = features.length % 2 !== 0 && index === features.length - 1;
    
    return (
      <TouchableOpacity
        key={feature.id}
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.cardBorder,
          },
          isLastOdd && styles.fullWidthCard,
        ]}
        onPress={() => navigation.navigate(feature.route)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: feature.color + '20' }]}>
          <Text style={styles.icon}>{feature.icon}</Text>
        </View>
        <Text style={[styles.cardTitle, { color: theme.colors.text }]}>
          {feature.title}
        </Text>
        <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}>
          {feature.description}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
        nestedScrollEnabled={true}
        scrollEnabled={true}
      >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('home.title')}
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          {t('home.subtitle')}
        </Text>
      </View>

      {/* Current Phase Card */}
      <CurrentPhaseCard />

      {/* Feature Cards Grid */}
      <View style={styles.grid}>
        {features.map((feature, index) => renderFeatureCard(feature, index))}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
          用 ❤️ 为摄影爱好者打造
        </Text>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
    paddingTop: Layout.spacing.md,
  },
  title: {
    fontSize: Layout.fontSize.hero,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: Layout.fontSize.lg,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xl,
  },
  card: {
    width: '48%',
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    alignItems: 'center',
    minHeight: 180,
    justifyContent: 'space-between',
  },
  fullWidthCard: {
    width: '100%',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Layout.spacing.md,
  },
  icon: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.xs,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: Layout.fontSize.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
  },
  footerText: {
    fontSize: Layout.fontSize.sm,
  },
});

export default HomeScreen;
