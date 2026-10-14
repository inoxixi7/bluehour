import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Modal, Vibration } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { RootStackNavigationProp } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Touchable } from '../../components/common/Touchable';

import { Layout } from '../../constants/Layout';
import { Card } from '../../components/common/Card';
import { AppButton } from '../../components/common/AppButton';
import { Dropdown } from '../../components/common/Dropdown';
import { HelpSections } from '../../components/common/HelpSections';
import { RECIPROCITY_PROFILES, SHUTTER_SPEEDS } from '../../constants/Photography';
import { ReciprocitySource } from '../../constants/FilmReciprocity';
import { useUserPresets } from '../../contexts/UserPresetsContext';
import { calculateReciprocity } from '../../utils/photographyCalculations';
import { formatExtraStops, formatShutterSpeed } from '../../utils/formatters';
import {
  cancelExposureTimerNotification,
  requestNotificationPermissions,
  scheduleExposureTimerNotification,
} from '../../services/notificationService';

const LONG_EXPOSURE_TIMES = [
  1, 2, 4, 8, 10, 15, 20, 30, 45, 60, 90, 120, 180, 240, 300, 480, 600, 900, 1200, 1800, 2700, 3600,
];

const SOURCE_LABEL_KEYS: Record<ReciprocitySource, string> = {
  manufacturer: 'reciprocity.sourceManufacturer',
  community: 'reciprocity.sourceCommunity',
  estimate: 'reciprocity.sourceEstimate',
};

type ReciprocityCalcRouteProp = RouteProp<{ params: { initialShutter?: number } }, 'params'>;

const formatCountdown = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mmss = `${m.toString().padStart(h > 0 ? 2 : 1, '0')}:${s.toString().padStart(2, '0')}`;
  return h > 0 ? `${h}:${mmss}` : mmss;
};

const ReciprocityCalcScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<ReciprocityCalcRouteProp>();
  const { activePreset } = useUserPresets();

  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [baseShutter, setBaseShutter] = useState(route.params?.initialShutter || 1);
  const [profileId, setProfileId] = useState('digital');

  // 计时器状态：以结束时间戳计时，避免 setInterval 漂移和应用切到后台时停表
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'done'>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const endTimeRef = useRef<number | null>(null);

  const reciprocityProfile =
    RECIPROCITY_PROFILES.find(profile => profile.id === profileId) ?? RECIPROCITY_PROFILES[0];

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: t('reciprocity.title'),
      headerRight: () => (
        <Touchable onPress={() => setHelpModalVisible(true)} style={{ marginRight: 16 }}>
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
        </Touchable>
      ),
    });
  }, [navigation, theme.colors.primary, t]);

  // 胶片选项（数码置顶，其余按名称排序）
  const filmOptions = useMemo(() => {
    const options = RECIPROCITY_PROFILES.map((profile, idx) => ({
      label: t(profile.nameKey, { defaultValue: profile.name }),
      value: idx,
      isDigital: profile.type === 'digital',
    }));

    return options
      .sort((a, b) => {
        if (a.isDigital) return -1;
        if (b.isDigital) return 1;
        return a.label.localeCompare(b.label);
      })
      .map(({ label, value }) => ({ label, value }));
  }, [t]);

  // 快门选项（值即秒数）：优先使用 activePreset 中 ≥1s 的快门，否则使用 LONG_EXPOSURE_TIMES
  const shutterOptions = useMemo(() => {
    const presetSeconds = (activePreset?.shutterSpeeds ?? []).filter(
      value => value >= 1 && SHUTTER_SPEEDS.some(s => s.value === value)
    );
    const values = presetSeconds.length > 0 ? [...presetSeconds] : [...LONG_EXPOSURE_TIMES];

    // 从曝光计算器带入的快门（如 ND 换算后的 256s）不在列表中时也要能显示
    if (!values.includes(baseShutter)) {
      values.push(baseShutter);
    }

    return values.sort((a, b) => a - b).map(value => ({ label: formatShutterSpeed(value), value }));
  }, [activePreset, baseShutter]);

  const result = useMemo(
    () => calculateReciprocity(baseShutter, reciprocityProfile),
    [baseShutter, reciprocityProfile]
  );
  const reciprocityCorrected = result.correctedSeconds;

  // 计时器目标（向上取整，宁可略多曝光也不欠曝）
  const roundedTarget = Math.max(0, Math.ceil(reciprocityCorrected - 0.05));

  // 空闲时同步计时器显示
  useEffect(() => {
    if (timerState === 'idle') {
      setRemainingSeconds(roundedTarget);
    }
  }, [roundedTarget, timerState]);

  // 计时器逻辑
  useEffect(() => {
    if (timerState !== 'running' || endTimeRef.current === null) return;

    const tick = () => {
      const left = Math.max(0, Math.ceil((endTimeRef.current! - Date.now()) / 1000));
      setRemainingSeconds(left);
      if (left === 0) {
        setTimerState('done');
        Vibration.vibrate([0, 500, 200, 500]);
      }
    };

    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [timerState]);

  const resetTimer = useCallback(() => {
    endTimeRef.current = null;
    cancelExposureTimerNotification();
    setTimerState('idle');
    setRemainingSeconds(roundedTarget);
  }, [roundedTarget]);

  const toggleTimer = () => {
    if (timerState === 'idle' && roundedTarget > 0) {
      const endTime = Date.now() + roundedTarget * 1000;
      endTimeRef.current = endTime;
      setTimerState('running');
      // 应用切到后台或锁屏时，用系统通知提醒曝光结束
      if (Platform.OS !== 'web') {
        requestNotificationPermissions()
          .then(granted => {
            if (granted) {
              return scheduleExposureTimerNotification(new Date(endTime));
            }
          })
          .catch(error => console.error('Failed to schedule timer notification:', error));
      }
    } else {
      // 运行中 → 停止并重置；完成 → 重置
      resetTimer();
    }
  };

  const colors = theme.colors;

  const handleFilmChange = (index: number) => {
    const profile = RECIPROCITY_PROFILES[index];
    if (profile) {
      setProfileId(profile.id);
    }
  };

  const selectedFilmIndex = RECIPROCITY_PROFILES.findIndex(p => p.id === profileId);
  const isDigital = reciprocityProfile.type === 'digital';

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={[styles.card, styles.firstCard, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t('reciprocity.filmProfile')}</Text>
        </View>

        <Dropdown
          options={filmOptions}
          selectedValue={selectedFilmIndex}
          onValueChange={handleFilmChange}
          placeholder={t('reciprocity.selectFilm')}
          textColor={colors.text}
          backgroundColor={colors.card}
          borderColor={colors.border}
          accentColor={theme.colors.primary}
        />

        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {t(reciprocityProfile.descriptionKey)}
        </Text>

        {!isDigital && (
          <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
            {t('reciprocity.dataSource')}: {t(SOURCE_LABEL_KEYS[reciprocityProfile.source])}
          </Text>
        )}
      </Card>

      <Card style={[styles.card, styles.secondCard, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('reciprocity.meteredShutter')}
          </Text>
        </View>

        <Dropdown
          options={shutterOptions}
          selectedValue={baseShutter}
          onValueChange={setBaseShutter}
          placeholder={formatShutterSpeed(baseShutter)}
          textColor={colors.text}
          backgroundColor={colors.card}
          borderColor={colors.border}
          accentColor={theme.colors.primary}
        />
      </Card>

      {/* Result Display */}
      <Card style={[styles.resultCard, { backgroundColor: colors.card }]}>
        <View style={styles.resultRow}>
          <View style={styles.resultItem}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              {t('reciprocity.resultBase')}
            </Text>
            <Text style={[styles.resultValueSmall, { color: colors.text }]}>
              {formatShutterSpeed(baseShutter)}
            </Text>
          </View>

          <Ionicons name="arrow-forward" size={24} color={colors.textSecondary} />

          <View style={styles.resultItem}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              {t('reciprocity.resultReciprocity')}
            </Text>
            <Text style={[styles.resultValue, { color: colors.accent }]}>
              {formatShutterSpeed(reciprocityCorrected)}
            </Text>
          </View>
        </View>

        {!isDigital && (
          <Text style={[styles.extraStops, { color: colors.textSecondary }]}>
            {t('reciprocity.extraStops')}: {formatExtraStops(result.extraStops)}
          </Text>
        )}

        {result.isExtrapolated && reciprocityProfile.maxReliableSeconds !== undefined && (
          <View style={[styles.warningBox, { borderColor: colors.warning }]}>
            <Ionicons name="warning-outline" size={16} color={colors.warning} />
            <Text style={[styles.warningText, { color: colors.text }]}>
              {t('reciprocity.extrapolatedWarning', {
                max: formatShutterSpeed(reciprocityProfile.maxReliableSeconds),
              })}
            </Text>
          </View>
        )}
      </Card>

      {/* Timer */}
      <Card style={[styles.timerCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.timerTitle, { color: colors.text }]}>
          {t('reciprocity.timerTitle')}
        </Text>
        <Text
          style={[
            styles.timerDisplay,
            { color: timerState === 'running' ? colors.primary : colors.text },
          ]}
        >
          {formatCountdown(remainingSeconds)}
        </Text>

        {timerState === 'done' && (
          <Text style={[styles.timerDoneText, { color: colors.success }]}>
            {t('reciprocity.timerDone')}
          </Text>
        )}

        <AppButton
          title={
            timerState === 'running'
              ? t('reciprocity.stopTimer')
              : timerState === 'done'
                ? t('reciprocity.resetTimer')
                : t('reciprocity.startTimer')
          }
          onPress={toggleTimer}
          variant={timerState === 'running' ? 'outline' : 'primary'}
          style={{ marginTop: Layout.spacing.md }}
        />
      </Card>

      {/* Help Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={helpModalVisible}
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('reciprocityHelp.title')}
              </Text>
              <Touchable onPress={() => setHelpModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Touchable>
            </View>
            <ScrollView style={styles.modalScroll}>
              <HelpSections
                i18nPrefix="reciprocityHelp"
                sectionCount={3}
                textColor={colors.text}
                secondaryColor={colors.textSecondary}
                accentColor={colors.primary}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.md,
  },
  card: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    marginTop: Layout.spacing.lg,
  },
  firstCard: {
    zIndex: 10,
    marginTop: 0,
  },
  secondCard: {
    zIndex: 5,
  },
  header: {
    marginBottom: Layout.spacing.sm,
  },
  title: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 20,
    marginTop: Layout.spacing.sm,
  },
  sourceText: {
    fontSize: Layout.fontSize.xs,
    marginTop: Layout.spacing.xs,
  },
  extraStops: {
    fontSize: Layout.fontSize.sm,
    textAlign: 'center',
    marginTop: Layout.spacing.md,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.spacing.xs,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.sm,
    marginTop: Layout.spacing.md,
  },
  warningText: {
    flex: 1,
    fontSize: Layout.fontSize.sm,
    lineHeight: 20,
  },
  timerDoneText: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    marginTop: Layout.spacing.sm,
  },
  sectionHeader: {
    marginBottom: Layout.spacing.md,
    marginTop: Layout.spacing.sm,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
  },
  resultCard: {
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    marginTop: Layout.spacing.lg,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resultItem: {
    alignItems: 'center',
    flex: 1,
  },
  resultLabel: {
    fontSize: Layout.fontSize.xs,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  resultValueSmall: {
    fontSize: 20,
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  timerCard: {
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    marginTop: Layout.spacing.lg,
  },
  timerTitle: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    marginBottom: Layout.spacing.md,
    textTransform: 'uppercase',
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: Platform.OS === 'ios' ? 34 : Layout.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
    flex: 1,
  },
  modalScroll: {
    padding: Layout.spacing.lg,
  },
});

export default ReciprocityCalcScreen;
