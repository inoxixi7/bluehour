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
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from '../../locales/i18n';
import { useTheme } from '../../contexts/ThemeContext';
import { useLocationData } from '../../contexts/LocationDataContext';
import { Layout } from '../../constants/Layout';
import { useNavigation } from '@react-navigation/native';
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

const HomeScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const {
    locationName,
    timezoneInfo,
    getSunTimesForDate,
    locationLoading,
    sunTimesLoading,
    locationError,
    getCurrentLocation,
  } = useLocationData();

  const [refreshing, setRefreshing] = useState(false);
  const [showIntro, setShowIntro] = useState(false);

  const [refreshCount, setRefreshCount] = useState(0);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getCurrentLocation();
      setRefreshCount(prev => prev + 1); // 增加刷新计数，触发建议更新
    } catch (error) {
      console.error('Failed to refresh location:', error);
    } finally {
      setRefreshing(false);
    }
  }, [getCurrentLocation]);

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
    const getRandomAdvice = (
      adviceList: Array<{ icon: string; title: string; description: string }>
    ) => {
      const index = (refreshCount + Math.floor(Date.now() / 1000 / 3600)) % adviceList.length;
      return adviceList[index];
    };

    if (!phaseState) {
      const defaultAdvices = [
        {
          icon: '⏱️',
          title: t('home.advice.default.title1'),
          description: t('home.advice.default.desc1'),
        },
        {
          icon: '📸',
          title: t('home.advice.default.title2'),
          description: t('home.advice.default.desc2'),
        },
      ];
      return getRandomAdvice(defaultAdvices);
    }

    switch (phaseState.current.id) {
      case 'daylight':
        const dayAdvices = [
          {
            icon: '🗺️',
            title: t('home.advice.day.title1'),
            description: t('home.advice.day.desc1'),
          },
          {
            icon: '🔍',
            title: t('home.advice.day.title2'),
            description: t('home.advice.day.desc2'),
          },
          {
            icon: '🏞️',
            title: t('home.advice.day.title3'),
            description: t('home.advice.day.desc3'),
          },
        ];
        return getRandomAdvice(dayAdvices);

      case 'eveningBlueHour':
      case 'morningBlueHour':
      case 'nextMorningBlueHour':
        const blueAdvices = [
          {
            icon: '⚖️',
            title: t('home.advice.blue.title1'),
            description: t('home.advice.blue.desc1'),
          },
          {
            icon: '🏙️',
            title: t('home.advice.blue.title2'),
            description: t('home.advice.blue.desc2'),
          },
          {
            icon: '🌆',
            title: t('home.advice.blue.title3'),
            description: t('home.advice.blue.desc3'),
          },
        ];
        return getRandomAdvice(blueAdvices);

      default:
        const nightAdvices = [
          {
            icon: '✨',
            title: t('home.advice.night.title1'),
            description: t('home.advice.night.desc1'),
          },
          {
            icon: '🌌',
            title: t('home.advice.night.title2'),
            description: t('home.advice.night.desc2'),
          },
          {
            icon: '🚗',
            title: t('home.advice.night.title3'),
            description: t('home.advice.night.desc3'),
          },
        ];
        return getRandomAdvice(nightAdvices);
    }
  }, [phaseState, t, refreshCount]);

  const dailyTip = useMemo(() => {
    const tips = ['tripod', 'aperture', 'iso', 'raw', 'foreground'];
    const dayOfYear = Math.floor(
      (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        1000 /
        60 /
        60 /
        24
    );
    const tipKey = tips[dayOfYear % tips.length];
    return {
      title: t('home.tips.title'),
      content: t(`home.tips.items.${tipKey}`),
    };
  }, [t]);

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
                    time: formatTimeCountdown(
                      Math.round((nextBlueHour.start.getTime() - now.getTime()) / (1000 * 60)),
                      t
                    ),
                  })}
                </Text>
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
                <Touchable
                  onPress={() => navigation.navigate('SunTimes')}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                    {t('home.timeline.detail')}
                  </Text>
                </Touchable>
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

        <View style={{ gap: Layout.spacing.md, marginBottom: Layout.spacing.md }}>
          <Touchable onPress={() => navigation.navigate('ExposureCalc')} activeOpacity={0.9}>
            <Card style={[styles.labCard, { backgroundColor: theme.colors.card, marginBottom: 0 }]}>
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
              <Text style={styles.adviceIconSmall}>{quickActions.icon}</Text>
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

      {/* App Introduction Modal */}
      <Modal
        visible={showIntro}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowIntro(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {t('home.intro.title')}
              </Text>
              <Touchable onPress={() => setShowIntro(false)} style={styles.modalCloseButton}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Touchable>
            </View>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalDescription, { color: theme.colors.text }]}>
                {t('home.intro.description')}
              </Text>
              
              <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
                {t('home.intro.featuresTitle')}
              </Text>
              
              <View style={styles.modalFeature}>
                <Text style={styles.modalFeatureIcon}>🌅</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalFeatureTitle, { color: theme.colors.text }]}>
                    {t('home.intro.feature1Title')}
                  </Text>
                  <Text style={[styles.modalFeatureDesc, { color: theme.colors.textSecondary }]}>
                    {t('home.intro.feature1Desc')}
                  </Text>
                </View>
              </View>

              <View style={styles.modalFeature}>
                <Text style={styles.modalFeatureIcon}>📷</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalFeatureTitle, { color: theme.colors.text }]}>
                    {t('home.intro.feature2Title')}
                  </Text>
                  <Text style={[styles.modalFeatureDesc, { color: theme.colors.textSecondary }]}>
                    {t('home.intro.feature2Desc')}
                  </Text>
                </View>
              </View>

              <View style={styles.modalFeature}>
                <Text style={styles.modalFeatureIcon}>🎞️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalFeatureTitle, { color: theme.colors.text }]}>
                    {t('home.intro.feature3Title')}
                  </Text>
                  <Text style={[styles.modalFeatureDesc, { color: theme.colors.textSecondary }]}>
                    {t('home.intro.feature3Desc')}
                  </Text>
                </View>
              </View>

              
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  detailText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '500',
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
  adviceIconSmall: {
    fontSize: 20,
  },
  adviceCardLabel: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
  },
  adviceTitle: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  adviceText: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 18,
  },
  tipHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    gap: 6,
  },
  tipCardLabel: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
  },
  tipTitle: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  modalContent: {
    borderRadius: Layout.borderRadius.xl,
    maxWidth: 500,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  modalTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    flex: 1,
  },
  modalCloseButton: {
    padding: Layout.spacing.xs,
  },
  modalScroll: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.lg,
  },
  modalDescription: {
    fontSize: Layout.fontSize.base,
    lineHeight: 24,
    marginBottom: Layout.spacing.lg,
  },
  modalSectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    marginBottom: Layout.spacing.md,
  },
  modalFeature: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  modalFeatureIcon: {
    fontSize: 28,
  },
  modalFeatureTitle: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  modalFeatureDesc: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 20,
  },
  modalFooter: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 20,
    marginTop: Layout.spacing.md,
    fontStyle: 'italic',
  },
});

export default HomeScreen;
