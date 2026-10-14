import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocationData } from '../../contexts/LocationDataContext';
import { Layout } from '../../constants/Layout';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../../navigation/types';
import {
  buildLightTimeline,
  getCurrentPhaseState,
  getNextBlueHourWindow,
} from '../../utils/lightPhases';
import { formatTime } from '../../utils/formatters';
import { formatTimeCountdown } from '../../utils/i18nHelpers';
import { formatLocationName } from '../../utils/locationHelpers';
import { Card } from '../../components/common/Card';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { Touchable } from '../../components/common/Touchable';
import { getWeatherIcon } from '../../api/weatherService';
import { useNow } from '../../hooks/useNow';
import { useWeather } from '../../hooks/useWeather';
import { useGoldenHourNotifications } from '../../hooks/useGoldenHourNotifications';
import { AppIntroModal } from './AppIntroModal';
import { getDailyTip, getShootingAdvice } from './homeContent';

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();
  const {
    locationName,
    timezoneInfo,
    getSunTimesForDate,
    locationLoading,
    sunTimesLoading,
    locationError,
    getCurrentLocation,
    location,
  } = useLocationData();

  const [refreshing, setRefreshing] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  const { weather, loading: weatherLoading, failed: weatherFailed } = useWeather(location);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getCurrentLocation();
      setRefreshCount(prev => prev + 1); // 增加刷新计数，触发建议更新
      // Weather will be refreshed automatically via useEffect when location updates
    } catch (error) {
      console.error('Failed to refresh location:', error);
    } finally {
      setRefreshing(false);
    }
  }, [getCurrentLocation]);

  // 当前时间每 30 秒刷新一次，让当前光线阶段和倒计时随时间更新
  const now = useNow();
  const sunTimes = getSunTimesForDate(now);

  useGoldenHourNotifications(sunTimes, timezoneInfo.timezone || undefined);

  const timeline = useMemo(() => (sunTimes ? buildLightTimeline(sunTimes) : []), [sunTimes]);
  const phaseState = useMemo(
    () => (sunTimes ? getCurrentPhaseState(timeline, now) : null),
    [sunTimes, timeline, now]
  );

  const nextBlueHour = useMemo(
    () => (sunTimes ? getNextBlueHourWindow(sunTimes, now) : null),
    [sunTimes, now]
  );

  const isLoading = locationLoading || (sunTimesLoading && !sunTimes);

  const quickActions = useMemo(
    () => getShootingAdvice(phaseState?.current.id ?? null, t, refreshCount),
    [phaseState, t, refreshCount]
  );

  const dailyTip = useMemo(() => getDailyTip(t), [t]);

  // Filter timeline to show only photography golden hours (blue hour and golden hour)
  const photographyTimeline = useMemo(() => {
    return timeline.filter(
      segment =>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.text}
            colors={[theme.colors.accent]} // Android
            progressBackgroundColor={theme.colors.card} // Android
          />
        }
      >
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.greeting, { color: theme.colors.text }]}>
              {t('home.greeting')}
            </Text>
            <Text style={[styles.dateText, { color: theme.colors.textSecondary }]}>
              {new Intl.DateTimeFormat(i18n.language === 'zh' ? 'zh-CN' : i18n.language, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long',
              }).format(now)}
            </Text>
          </View>
          <Touchable
            onPress={() => setShowIntro(true)}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Ionicons name="information-circle-outline" size={26} color={theme.colors.text} />
          </Touchable>
          <Touchable
            onPress={() => navigation.navigate('Settings')}
            style={styles.headerButton}
            activeOpacity={0.7}
          >
            <Ionicons name="settings-outline" size={26} color={theme.colors.text} />
          </Touchable>
        </View>

        {/* Main Hero Card with Phase + Weather */}
        <Touchable onPress={() => navigation.navigate('SunTimes')} activeOpacity={0.9}>
          <Card style={[styles.heroCard, { backgroundColor: theme.colors.card }]}>
            <View style={styles.heroMainRow}>
              {/* Left: Phase Info */}
              <View style={styles.heroLeft}>
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
                          time: formatTimeCountdown(
                            Math.round(
                              (nextBlueHour.start.getTime() - now.getTime()) / (1000 * 60)
                            ),
                            t
                          ),
                        })}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Right: Weather Info */}
              <View style={styles.heroRight}>
                {weatherLoading ? (
                  <View style={styles.weatherCompact}>
                    <Text
                      style={[styles.weatherLoadingText, { color: theme.colors.textSecondary }]}
                    >
                      {t('weather.loading')}
                    </Text>
                  </View>
                ) : weatherFailed || !weather ? (
                  <View style={styles.weatherCompact}>
                    <Ionicons
                      name="cloud-offline-outline"
                      size={24}
                      color={theme.colors.textSecondary}
                    />
                  </View>
                ) : (
                  <View style={styles.weatherCompact}>
                    <View style={styles.weatherTempRow}>
                      <Text style={styles.weatherEmojiCompact}>
                        {getWeatherIcon(weather.weatherCode)}
                      </Text>
                      <Text style={[styles.weatherTempCompact, { color: theme.colors.text }]}>
                        {weather.temperature}°
                      </Text>
                    </View>
                    {(() => {
                      // 判断当地时间是否在日出到日落之间
                      if (!sunTimes) return false;

                      const nowUTC = new Date();
                      const sunrise = sunTimes.sunrise;
                      const sunset = sunTimes.sunset;

                      // 判断是否是夜晚（日落后或日出前）
                      const isNight = nowUTC < sunrise || nowUTC > sunset;

                      return isNight ? (
                        <View
                          style={[
                            styles.weatherEVBadgeCompact,
                            { backgroundColor: theme.colors.textTertiary + '30' },
                          ]}
                        >
                          <Text
                            style={[
                              styles.weatherEVTextCompact,
                              { color: theme.colors.textSecondary },
                            ]}
                          >
                            {t('weather.notApplicable')}
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.weatherEVBadgeCompact,
                            { backgroundColor: theme.colors.primary + '20' },
                          ]}
                        >
                          <Text
                            style={[styles.weatherEVTextCompact, { color: theme.colors.primary }]}
                          >
                            EV {weather.recommendedEV}
                          </Text>
                        </View>
                      );
                    })()}
                  </View>
                )}
              </View>
            </View>

            {locationError && (
              <Text style={[styles.errorText, { color: theme.colors.error }]}>{locationError}</Text>
            )}

            {photographyTimeline.length > 0 && (
              <View style={styles.timelineSection}>
                <View style={styles.divider} />
                <View style={styles.timelineTitleRow}>
                  <Text style={[styles.timelineTitle, { color: theme.colors.text }]}>
                    {t('home.timeline.title')}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={theme.colors.textSecondary} />
                </View>
                {photographyTimeline.map(segment => (
                  <View key={segment.id + segment.start.toISOString()} style={styles.timelineRow}>
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: theme.colors[segment.accent] || theme.colors.text },
                      ]}
                    />
                    <Text style={[styles.timelineLabel, { color: theme.colors.text }]}>
                      {t(segment.labelKey)}
                    </Text>
                    <Text style={[styles.timelineTime, { color: theme.colors.textSecondary }]}>
                      {formatTime(segment.start, timezoneInfo.timezone)} —{' '}
                      {formatTime(segment.end, timezoneInfo.timezone)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </Card>
        </Touchable>

        <View>
          <Touchable onPress={() => navigation.navigate('ExposureCalc')} activeOpacity={0.9}>
            <Card
              style={[
                styles.labCard,
                { backgroundColor: theme.colors.card, marginBottom: Layout.spacing.md },
              ]}
            >
              <View style={styles.labHeader}>
                <Ionicons
                  name="sunny-outline"
                  size={32}
                  color={theme.colors.accent}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.labTitle, { color: theme.colors.text }]}>
                    {t('home.features.exposureCalc.title')}
                  </Text>
                  <Text style={[styles.labDescription, { color: theme.colors.textSecondary }]}>
                    {t('home.features.exposureCalc.description')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.accent} />
              </View>
            </Card>
          </Touchable>

          <Touchable onPress={() => navigation.navigate('ReciprocityCalc')} activeOpacity={0.9}>
            <Card style={[styles.labCard, { backgroundColor: theme.colors.card, marginBottom: 0 }]}>
              <View style={styles.labHeader}>
                <Ionicons
                  name="timer-outline"
                  size={32}
                  color={theme.colors.accent}
                  style={{ marginRight: 12 }}
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.labTitle, { color: theme.colors.text }]}>
                    {t('home.features.reciprocityCalc.title')}
                  </Text>
                  <Text style={[styles.labDescription, { color: theme.colors.textSecondary }]}>
                    {t('home.features.reciprocityCalc.description')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.accent} />
              </View>
            </Card>
          </Touchable>
        </View>

        <View style={styles.adviceCardsRow}>
          {/* 左侧卡片 - 动态建议 */}
          <Card style={[styles.adviceCardLeft, { backgroundColor: theme.colors.card }]}>
            <View style={styles.adviceHeaderRow}>
              <Ionicons name="sparkles-outline" size={20} color={theme.colors.accent} />
              <Text style={[styles.adviceCardLabel, { color: theme.colors.text }]}>
                {t('home.advice.currentLight')}
              </Text>
            </View>
            <Text style={[styles.adviceTitle, { color: theme.colors.text }]}>
              {quickActions.title}
            </Text>
            <Text style={[styles.adviceText, { color: theme.colors.textSecondary }]}>
              {quickActions.description}
            </Text>
          </Card>

          {/* 右侧卡片 - 每日贴士 */}
          <Card style={[styles.adviceCardRight, { backgroundColor: theme.colors.card }]}>
            <View style={styles.tipHeaderRow}>
              <Ionicons name="bulb-outline" size={20} color={theme.colors.accent} />
              <Text style={[styles.tipCardLabel, { color: theme.colors.text }]}>
                {dailyTip.title}
              </Text>
            </View>
            <Text style={[styles.tipTitle, { color: theme.colors.text }]}>{dailyTip.content}</Text>
          </Card>
        </View>

        {/* 位置信息条 - 移到底部 */}
        <Card style={[styles.locationCard, { backgroundColor: theme.colors.backgroundSecondary }]}>
          <View style={styles.locationContent}>
            <View style={styles.locationLeft}>
              <Ionicons name="location-outline" size={16} color={theme.colors.textSecondary} />
              <Text style={[styles.locationText, { color: theme.colors.textSecondary }]}>
                {locationName ? formatLocationName(locationName) : t('home.hero.waitingLocation')}
              </Text>
            </View>
            <Touchable
              onPress={onRefresh}
              style={styles.refreshButton}
              disabled={refreshing}
              activeOpacity={0.7}
            >
              <Ionicons
                name="refresh"
                size={16}
                color={theme.colors.textSecondary}
                style={refreshing ? { opacity: 0.5 } : {}}
              />
            </Touchable>
          </View>
        </Card>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textTertiary }]}>
            {t('settings.madeWithLove')}
          </Text>
        </View>
      </ScrollView>

      <AppIntroModal visible={showIntro} onClose={() => setShowIntro(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.lg,
  },
  headerButton: {
    padding: Layout.spacing.xs,
  },
  greeting: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  dateText: {
    fontSize: Layout.fontSize.sm,
    marginTop: 2,
  },
  heroCard: {
    borderRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  heroMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.spacing.md,
  },
  heroLeft: {
    flex: 1,
  },
  heroRight: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'flex-start',
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
  weatherCompact: {
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  weatherTempRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  weatherEmojiCompact: {
    fontSize: 32,
  },
  weatherTempCompact: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
  },
  weatherLoadingText: {
    fontSize: Layout.fontSize.xs,
    textAlign: 'center',
  },
  weatherEVBadgeCompact: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: 6,
    borderRadius: Layout.borderRadius.sm,
  },
  weatherEVTextCompact: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '700',
  },
  errorText: {
    marginTop: Layout.spacing.sm,
    fontSize: Layout.fontSize.sm,
  },
  timelineSection: {
    marginTop: Layout.spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
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
    fontSize: Layout.fontSize.base,
    fontWeight: '500',
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
  adviceCardsRow: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  adviceCardLeft: {
    flex: 1,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
  },
  adviceCardRight: {
    flex: 1,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
  },
  adviceHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    gap: 6,
  },
  adviceCardLabel: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  adviceTitle: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
    lineHeight: 22,
  },
  adviceText: {
    fontSize: Layout.fontSize.md,
    lineHeight: 20,
  },
  tipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    gap: 6,
  },
  tipCardLabel: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
  },
  tipTitle: {
    fontSize: Layout.fontSize.md,
    fontWeight: '500',
    lineHeight: 20,
  },
  locationCard: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
  },
  locationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  locationText: {
    fontSize: Layout.fontSize.xs,
    flex: 1,
  },
  refreshButton: {
    padding: Layout.spacing.xs,
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
