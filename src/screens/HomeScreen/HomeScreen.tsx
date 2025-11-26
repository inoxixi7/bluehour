import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocationData } from '../../contexts/LocationDataContext';
import { Layout } from '../../constants/Layout';
import { useNavigation } from '@react-navigation/native';
import { buildLightTimeline, getCurrentPhaseState, getNextBlueHourWindow } from '../../utils/lightPhases';
import { formatDate, formatTime } from '../../utils/formatters';
import { formatTimeCountdown } from '../../utils/i18nHelpers';
import { formatLocationName } from '../../utils/locationHelpers';
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
    getSunTimesForDate,
    locationLoading,
    sunTimesLoading,
    locationError,
  } = useLocationData();

  const sunTimes = getSunTimesForDate(new Date());

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

  const isLoading = locationLoading || (sunTimesLoading && !sunTimes);

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

  // Filter timeline to show only photography golden hours (blue hour and golden hour)
  const photographyTimeline = useMemo(() => {
    return timeline.filter(segment => 
      segment.id === 'morningBlueHour' || 
      segment.id === 'morningGoldenHour' || 
      segment.id === 'eveningGoldenHour' || 
      segment.id === 'eveningBlueHour'
    );
  }, [timeline]);

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
          <View style={styles.headerTop}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {locationName ? formatLocationName(locationName) : t('home.hero.waitingLocation')}
            </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Settings')}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <Ionicons name="settings-outline" size={26} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        <Card style={[styles.heroCard, { backgroundColor: theme.colors.card }]}> 
          <View style={styles.heroRow}>
            <Text style={styles.heroEmoji}>{phaseState?.current.icon || '🌌'}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.heroPhase, { color: theme.colors.text }]}> 
                {phaseState ? t(phaseState.current.labelKey) : t('home.hero.waitingPhase')}
              </Text>
              {nextBlueHour && (
                <Text style={[styles.heroCountdown, { color: theme.colors.textSecondary }]}> 
                  {t('sunTimes.currentPhase.distanceTo', {
                    phase: nextBlueHour.isNextDay 
                      ? t('sunTimes.currentPhase.tomorrows') + t(nextBlueHour.labelKey)
                      : t(nextBlueHour.labelKey),
                    time: formatTimeCountdown(Math.round((nextBlueHour.start.getTime() - now.getTime()) / (1000 * 60)), t),
                  })}
                </Text>
              )}
            </View>
          </View>
          {locationError && (
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              {locationError}
            </Text>
          )}
        </Card>

        {photographyTimeline.length > 0 && (
            <Card style={[styles.timelineCard, { backgroundColor: theme.colors.card }]}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('SunTimes')}
                activeOpacity={0.7}
                style={styles.timelineTitleRow}
              >
                <Text style={[styles.timelineTitle, { color: theme.colors.text }]}>
                  {t('home.timeline.title')}
                </Text>
                <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              {photographyTimeline.map((segment) => (
                <View key={segment.id + segment.start.toISOString()} style={styles.timelineRow}>
                  <View
                    style={[styles.timelineDot, { backgroundColor: theme.colors[segment.accent] || theme.colors.text }]}
                  />
                  <Text style={[styles.timelineLabel, { color: theme.colors.text }]}>
                    {t(segment.labelKey)}
                  </Text>
                  <Text style={[styles.timelineTime, { color: theme.colors.textSecondary }]}>
                    {formatTime(segment.start, timezoneInfo.timezone)} — {formatTime(segment.end, timezoneInfo.timezone)}
                  </Text>
                </View>
              ))}
            </Card>
        )}

        <TouchableOpacity
          onPress={() => navigation.navigate('ExposureLab')}
          activeOpacity={0.9}
        >
          <Card style={[styles.labCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.labHeader}>
              <Ionicons name="flask-outline" size={32} color={theme.colors.accent} style={{ marginRight: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.labTitle, { color: theme.colors.text }]}>
                  {t('home.features.exposureLab.title')}
                </Text>
                <Text style={[styles.labDescription, { color: theme.colors.textSecondary }]}>
                  {t('home.features.exposureLab.description')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={theme.colors.accent} />
            </View>
          </Card>
        </TouchableOpacity>

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
    padding: Layout.spacing.md,
    paddingBottom: Layout.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  headerTop: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  headerTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '700',
    flex: 1,
  },
  headerButton: {
    padding: Layout.spacing.xs,
    marginLeft: Layout.spacing.sm,
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
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  heroEmoji: {
    fontSize: 48,
    marginRight: Layout.spacing.md,
  },
  heroPhase: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
  },
  heroCountdown: {
    marginTop: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
    lineHeight: 20,
  },
  errorText: {
    marginTop: Layout.spacing.sm,
    fontSize: Layout.fontSize.sm,
  },
  timelineCard: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.md,
  },
  timelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.sm,
  },
  timelineTitle: {
    fontSize: Layout.fontSize.base,
    fontWeight: '700',
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xs,
    paddingVertical: Layout.spacing.xs,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Layout.spacing.sm,
  },
  timelineLabel: {
    fontSize: Layout.fontSize.base,
    fontWeight: '500',
    flex: 1,
  },
  timelineTime: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '400',
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
  labCard: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.md,
  },
  labHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labTitle: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  labDescription: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 18,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
  },
  footerText: {
    fontSize: Layout.fontSize.sm,
  },
});

export default HomeScreen;
