import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';
import { useNavigation } from '@react-navigation/native';
import { useLocation } from '../../hooks/useLocation';
import { useSunTimes } from '../../hooks/useSunTimes';
import { buildLightTimeline, getCurrentPhaseState, getNextBlueHourWindow } from '../../utils/lightPhases';
import { formatDate, formatTime } from '../../utils/formatters';
import { formatTimeCountdown } from '../../utils/i18nHelpers';
import { Card } from '../../components/common/Card';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const {
    location,
    locationName,
    timezoneInfo,
    loading: locationLoading,
    error: locationError,
    getCurrentLocation,
  } = useLocation();
  const {
    sunTimes,
    loading: sunTimesLoading,
    error: sunError,
    fetchSunTimes,
  } = useSunTimes();

  useEffect(() => {
    if (location && timezoneInfo.timezone) {
      fetchSunTimes(location.latitude, location.longitude, new Date(), timezoneInfo.timezone);
    }
  }, [location, timezoneInfo.timezone, fetchSunTimes]);

  const timeline = useMemo(() => (sunTimes ? buildLightTimeline(sunTimes) : []), [sunTimes]);
  const now = new Date();
  const phaseState = useMemo(
    () => (sunTimes ? getCurrentPhaseState(timeline, now) : null),
    [sunTimes, timeline, now]
  );
  const nextBlueHour = useMemo(
    () => (sunTimes ? getNextBlueHourWindow(sunTimes, now) : null),
    [sunTimes, now]
  );

  const isLoading = (locationLoading || sunTimesLoading) && !sunTimes;

  const quickActions = useMemo(() => {
    if (!phaseState) {
      return {
        icon: '⏱️',
        title: t('home.cta.defaultTitle'),
        description: t('home.cta.defaultDescription'),
      };
    }

    switch (phaseState.current.id) {
      case 'daylight':
        return {
          icon: '⚫',
          title: t('home.cta.dayTitle'),
          description: t('home.cta.dayDescription'),
        };
      case 'eveningBlueHour':
      case 'morningBlueHour':
      case 'nextMorningBlueHour':
        return {
          icon: '🔵',
          title: t('home.cta.blueTitle'),
          description: t('home.cta.blueDescription'),
        };
      default:
        return {
          icon: '🌙',
          title: t('home.cta.nightTitle'),
          description: t('home.cta.nightDescription'),
        };
    }
  }, [phaseState, t]);

  const featureCards = [
    {
      id: 'sunTimes',
      title: t('home.features.sunTimeline.title'),
      description: t('home.features.sunTimeline.description'),
      icon: '🌅',
      onPress: () => navigation.navigate('SunTimes'),
    },
    {
      id: 'exposureLab',
      title: t('home.features.exposureLab.title'),
      description: t('home.features.exposureLab.description'),
      icon: '⏱️',
      onPress: () => navigation.navigate('ExposureLab'),
    },
    {
      id: 'settings',
      title: t('home.features.settings.title'),
      description: t('home.features.settings.description'),
      icon: '⚙️',
      onPress: () => navigation.navigate('Settings'),
    },
  ];

  if (isLoading) {
    return <LoadingIndicator message={t('common.loading')} />;
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}> 
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{t('home.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('home.subtitle')}
          </Text>
          <Text style={[styles.dateText, { color: theme.colors.textTertiary }]}>
            {formatDate(now)}
          </Text>
        </View>

        <Card style={[styles.heroCard, { backgroundColor: theme.colors.card }]}> 
          <View style={styles.heroRow}>
            <Text style={styles.heroEmoji}>{phaseState?.current.icon || '🌌'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroPhase, { color: theme.colors.text }]}> 
                {phaseState ? t(phaseState.current.labelKey) : t('home.hero.waitingPhase')}
              </Text>
              {phaseState && (
                <Text style={[styles.heroCountdown, { color: theme.colors.textSecondary }]}> 
                  {t('sunTimes.currentPhase.distanceTo', {
                    phase: t(phaseState.next.labelKey),
                    time: formatTimeCountdown(phaseState.minutesUntilTransition, t),
                  })}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.heroFooter}>
            <Text style={[styles.heroLocation, { color: theme.colors.textSecondary }]}> 
              📍 {locationName || t('home.hero.locating')}
            </Text>
            <TouchableOpacity onPress={getCurrentLocation}>
              <Text style={[styles.refreshText, { color: theme.colors.accent }]}>
                {t('home.hero.refreshLocation')}
              </Text>
            </TouchableOpacity>
          </View>
          {nextBlueHour && (
            <View style={styles.heroNextRow}>
              <Text style={[styles.heroNextLabel, { color: theme.colors.textSecondary }]}>
                {t('home.hero.nextBlueHour')}
              </Text>
              <Text style={[styles.heroNextValue, { color: theme.colors.blueHour }]}>
                {formatTime(nextBlueHour.start, timezoneInfo.timezone)} · {t(nextBlueHour.labelKey)}
              </Text>
            </View>
          )}
          {(locationError || sunError) && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {locationError || sunError}
            </Text>
          )}
        </Card>

        {timeline.length > 0 && (
          <Card style={[styles.timelineCard, { backgroundColor: theme.colors.card }]}> 
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
              {t('home.timeline.title')}
            </Text>
            {timeline.slice(0, 5).map((segment) => (
              <View key={segment.id + segment.start.toISOString()} style={styles.timelineRow}>
                <View
                  style={[styles.timelineDot, { backgroundColor: theme.colors[segment.accent] || theme.colors.text }]}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.timelineLabel, { color: theme.colors.text }]}> 
                    {segment.icon} {t(segment.labelKey)}
                  </Text>
                  <Text style={[styles.timelineTime, { color: theme.colors.textSecondary }]}>
                    {formatTime(segment.start, timezoneInfo.timezone)} — {formatTime(segment.end, timezoneInfo.timezone)}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        )}

        <TouchableOpacity
          style={[styles.ctaCard, { backgroundColor: theme.colors.backgroundSecondary }]}
          onPress={() => navigation.navigate('ExposureLab')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaIcon}>{quickActions.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[styles.ctaTitle, { color: theme.colors.text }]}>{quickActions.title}</Text>
            <Text style={[styles.ctaDescription, { color: theme.colors.textSecondary }]}>
              {quickActions.description}
            </Text>
          </View>
          <Text style={[styles.ctaChevron, { color: theme.colors.accent }]}>→</Text>
        </TouchableOpacity>

        <View style={styles.featureGrid}>
          {featureCards.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              style={[styles.featureCard, { borderColor: theme.colors.border }]}
              onPress={feature.onPress}
              activeOpacity={0.8}
            >
              <Text style={styles.featureIcon}>{feature.icon}</Text>
              <Text style={[styles.featureTitle, { color: theme.colors.text }]}>{feature.title}</Text>
              <Text style={[styles.featureDescription, { color: theme.colors.textSecondary }]}>
                {feature.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            {t('settings.madeWithLove')}
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
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: Layout.fontSize.hero,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: Layout.fontSize.base,
    marginTop: Layout.spacing.xs,
  },
  dateText: {
    marginTop: Layout.spacing.xs,
  },
  heroCard: {
    borderRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.lg,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  heroEmoji: {
    fontSize: 48,
    marginRight: Layout.spacing.md,
  },
  heroPhase: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
  },
  heroCountdown: {
    marginTop: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
  },
  heroFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroLocation: {
    fontSize: Layout.fontSize.sm,
  },
  refreshText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
  heroNextRow: {
    marginTop: Layout.spacing.md,
  },
  heroNextLabel: {
    fontSize: Layout.fontSize.sm,
  },
  heroNextValue: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
  },
  errorText: {
    marginTop: Layout.spacing.sm,
    fontSize: Layout.fontSize.sm,
  },
  timelineCard: {
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    marginBottom: Layout.spacing.md,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Layout.spacing.md,
  },
  timelineLabel: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
  },
  timelineTime: {
    fontSize: Layout.fontSize.sm,
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.xl,
    marginBottom: Layout.spacing.lg,
  },
  ctaIcon: {
    fontSize: 32,
    marginRight: Layout.spacing.md,
  },
  ctaTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
  },
  ctaDescription: {
    marginTop: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
  },
  ctaChevron: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    marginLeft: Layout.spacing.sm,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.lg,
  },
  featureCard: {
    width: '48%',
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: Layout.spacing.sm,
  },
  featureTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  featureDescription: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 20,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
  },
  footerText: {
    fontSize: Layout.fontSize.sm,
  },
});

export default HomeScreen;
