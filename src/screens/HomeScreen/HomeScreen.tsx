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

  const calculatorShortcuts = [
    {
      id: 'ev',
      icon: '💡',
      title: t('calculator.evTitle'),
    },
    {
      id: 'nd',
      icon: '🕶️',
      title: t('calculator.ndTitle'),
    },
    {
      id: 'dof',
      icon: '🎯',
      title: t('calculator.dofTitle'),
    },
  ];

  const toolsItems = [
    {
      id: 'language',
      icon: '🌐',
      title: t('settings.language'),
      description: t('home.sections.languageShortcut'),
      onPress: () => navigation.navigate('LanguageSelection'),
    },
    {
      id: 'theme',
      icon: '🌓',
      title: t('settings.theme'),
      description: t('home.sections.themeShortcut'),
      onPress: () => navigation.navigate('ThemeSelection'),
    },
    {
      id: 'settings',
      icon: '⚙️',
      title: t('settings.title'),
      description: t('home.sections.settingsShortcut'),
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
          <View style={[styles.heroActionRow, { borderTopColor: theme.colors.border }]}> 
            <View style={styles.heroActionInfo}>
              <Text style={styles.heroActionIcon}>{quickActions.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.heroActionTitle, { color: theme.colors.text }]}> 
                  {quickActions.title}
                </Text>
                <Text style={[styles.heroActionDescription, { color: theme.colors.textSecondary }]}> 
                  {quickActions.description}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.heroActionButton, { backgroundColor: theme.colors.accent }]}
              onPress={() => navigation.navigate('ExposureLab')}
              activeOpacity={0.9}
            >
              <Text style={[styles.heroActionButtonText, { color: theme.colors.background }]}> 
                {t('home.sections.exposureLabAction')}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {timeline.length > 0 && (
          <Card style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}> 
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                  {t('home.features.sunTimeline.title')}
                </Text>
                <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}> 
                  {t('home.features.sunTimeline.description')}
                </Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('SunTimes')}>
                <Text style={[styles.cardAction, { color: theme.colors.accent }]}> 
                  {t('home.sections.sunPlannerAction')}
                </Text>
              </TouchableOpacity>
            </View>
            {timeline.slice(0, 4).map((segment) => (
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

        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}> 
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('home.features.exposureLab.title')}
              </Text>
              <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}> 
                {t('home.features.exposureLab.description')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ExposureLab')}>
              <Text style={[styles.cardAction, { color: theme.colors.accent }]}> 
                {t('home.sections.exposureLabAction')}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.shortcutLabel, { color: theme.colors.textSecondary }]}> 
            {t('home.sections.calculatorShortcuts')}
          </Text>
          <View style={styles.shortcutRow}>
            {calculatorShortcuts.map((shortcut, index) => (
              <TouchableOpacity
                key={shortcut.id}
                style={[
                  styles.shortcutButton,
                  { borderColor: theme.colors.border },
                  index !== calculatorShortcuts.length - 1 && styles.shortcutSpacing,
                ]}
                onPress={() => navigation.navigate('ExposureLab')}
                activeOpacity={0.85}
              >
                <Text style={styles.shortcutIcon}>{shortcut.icon}</Text>
                <Text style={[styles.shortcutText, { color: theme.colors.text }]}>{shortcut.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={[styles.sectionCard, { backgroundColor: theme.colors.card }]}> 
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
                {t('home.sections.toolsTitle')}
              </Text>
              <Text style={[styles.cardDescription, { color: theme.colors.textSecondary }]}> 
                {t('home.sections.toolsDescription')}
              </Text>
            </View>
          </View>
          {toolsItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.toolRow,
                { borderColor: theme.colors.border },
                index !== 0 && styles.toolRowDivider,
              ]}
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <Text style={styles.toolIcon}>{item.icon}</Text>
              <View style={styles.toolTexts}>
                <Text style={[styles.toolTitle, { color: theme.colors.text }]}>{item.title}</Text>
                <Text style={[styles.toolDescription, { color: theme.colors.textSecondary }]}> 
                  {item.description}
                </Text>
              </View>
              <Text style={[styles.toolChevron, { color: theme.colors.textTertiary }]}>→</Text>
            </TouchableOpacity>
          ))}
        </Card>

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
  heroActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
    paddingTop: Layout.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  heroActionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  heroActionIcon: {
    fontSize: 24,
    marginRight: Layout.spacing.sm,
  },
  heroActionTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  heroActionDescription: {
    marginTop: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
  },
  heroActionButton: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.lg,
    marginLeft: Layout.spacing.md,
  },
  heroActionButtonText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
  sectionCard: {
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    marginBottom: Layout.spacing.md,
  },
  cardDescription: {
    fontSize: Layout.fontSize.sm,
    marginTop: Layout.spacing.xs,
  },
  cardAction: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
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
  shortcutLabel: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    marginBottom: Layout.spacing.sm,
  },
  shortcutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  shortcutButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
  },
  shortcutSpacing: {
    marginRight: Layout.spacing.sm,
  },
  shortcutIcon: {
    fontSize: 28,
    marginBottom: Layout.spacing.xs,
  },
  shortcutText: {
    fontSize: Layout.fontSize.sm,
    textAlign: 'center',
  },
  toolRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Layout.spacing.md,
  },
  toolRowDivider: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  toolIcon: {
    fontSize: 24,
    marginRight: Layout.spacing.md,
  },
  toolTexts: {
    flex: 1,
  },
  toolTitle: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
  },
  toolDescription: {
    fontSize: Layout.fontSize.sm,
    marginTop: Layout.spacing.xs,
  },
  toolChevron: {
    fontSize: Layout.fontSize.lg,
    marginLeft: Layout.spacing.sm,
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
