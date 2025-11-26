import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';
import { Card } from '../../components/common/Card';
import { AppButton } from '../../components/common/AppButton';
import { HorizontalScrollPicker } from '../../components/common/HorizontalScrollPicker';
import {
  APERTURE_VALUES,
  SHUTTER_SPEEDS,
  ISO_VALUES,
  ND_FILTERS,
  EV_SCENES,
  RECIPROCITY_PROFILES,
} from '../../constants/Photography';
import {
  calculateEquivalentExposure,
  calculateEquivalentExposureWithEV,
  calculateEV,
  calculateNDShutter,
  applyReciprocityCorrection,
} from '../../utils/photographyCalculations';
import { formatEV, formatShutterSpeed } from '../../utils/formatters';

const ExposureLabScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [aperture, setAperture] = useState(8);
  const [shutter, setShutter] = useState(1 / 4);
  const [iso, setISO] = useState(100);
  const [lockedParam, setLockedParam] = useState<'aperture' | 'shutter' | 'iso'>('iso');
  const [targetEV, setTargetEV] = useState<number | null>(null); // 目标 EV 值
  const [evLocked, setEvLocked] = useState(false); // EV 是否锁定
  const [ndStops, setNdStops] = useState(0);
  const [profileId, setProfileId] = useState('digital');
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'done'>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sceneCards = EV_SCENES; // 显示所有场景 EV16 到 EV-6
  const reciprocityProfile = RECIPROCITY_PROFILES.find((profile) => profile.id === profileId);
  const ndOptions = useMemo(
    () => [
      { name: t('calculator.exposureLab.ndNone'), stops: 0 },
      ...ND_FILTERS.map((filter) => ({ name: filter.name, stops: filter.stops })),
    ],
    [t]
  );

  const currentEV = useMemo(() => calculateEV(aperture, shutter, iso), [aperture, shutter, iso]);
  const ndAdjustedShutter = useMemo(() => calculateNDShutter(shutter, ndStops), [shutter, ndStops]);
  const reciprocityCorrected = useMemo(
    () => applyReciprocityCorrection(ndAdjustedShutter, reciprocityProfile?.curve),
    [ndAdjustedShutter, reciprocityProfile]
  );

  const roundedTarget = Math.max(0, Math.round(reciprocityCorrected));

  useEffect(() => {
    setTimerState('idle');
    setRemainingSeconds(roundedTarget);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [roundedTarget]);

  useEffect(() => {
    if (timerState !== 'running') {
      return;
    }

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setTimerState('done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [timerState]);

  const handleParamChange = (
    param: 'aperture' | 'shutter' | 'iso',
    value: number
  ) => {
    if (param === lockedParam) {
      return;
    }

    // 如果 EV 锁定,使用目标 EV 值计算
    if (evLocked && targetEV !== null) {
      const result = calculateEquivalentExposureWithEV(
        targetEV,
        param,
        value,
        lockedParam,
        { aperture, shutter, iso }
      );

      if (result) {
        setAperture(result.aperture);
        setShutter(result.shutter);
        setISO(result.iso);
      } else {
        // 无法达到目标 EV,仍然更新参数但会显示警告
        const tempResult: any = {};
        tempResult[param] = value;
        tempResult[lockedParam] = lockedParam === 'aperture' ? aperture : 
                                   lockedParam === 'shutter' ? shutter : iso;
        
        // 确定第三个参数
        const paramsArray: Array<'aperture' | 'shutter' | 'iso'> = ['aperture', 'shutter', 'iso'];
        const adjustParam = paramsArray.find(p => p !== param && p !== lockedParam)!;
        tempResult[adjustParam] = adjustParam === 'aperture' ? aperture : 
                                   adjustParam === 'shutter' ? shutter : iso;
        
        setAperture(tempResult.aperture);
        setShutter(tempResult.shutter);
        setISO(tempResult.iso);
      }
    } else {
      // 正常的等效曝光计算
      const result = calculateEquivalentExposure(
        { aperture, shutter, iso },
        param,
        value,
        lockedParam
      );

      setAperture(result.aperture);
      setShutter(result.shutter);
      setISO(result.iso);
    }
  };

  const handleSceneSelect = (sceneIndex: number) => {
    const scene = sceneCards[sceneIndex];
    setAperture(scene.params.aperture);
    setShutter(scene.params.shutter);
    setISO(scene.params.iso);
    // 锁定选中场景的 EV 值
    setTargetEV(scene.ev);
    setEvLocked(true);
  };

  const handleUnlockEV = () => {
    setEvLocked(false);
    setTargetEV(null);
  };

  const timerLabel = useMemo(() => {
    if (remainingSeconds >= 60) {
      const minutes = Math.floor(remainingSeconds / 60);
      const seconds = remainingSeconds % 60;
      if (seconds === 0) {
        return `${minutes}${t('common.units.min')}`;
      }
      return `${minutes}${t('common.units.min')} ${seconds}${t('common.units.sec')}`;
    }
    return `${remainingSeconds}${t('common.units.sec')}`;
  }, [remainingSeconds, t]);

  const startTimer = () => {
    if (roundedTarget < 1) {
      return;
    }
    setRemainingSeconds(roundedTarget);
    setTimerState('running');
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setTimerState('idle');
    setRemainingSeconds(roundedTarget);
  };

  const styles = createStyles(theme.colors);

  const renderParamPicker = (
    label: string,
    param: 'aperture' | 'shutter' | 'iso',
    value: number,
    options: { value: number; label: string }[]
  ) => {
    const isLocked = lockedParam === param;

    return (
      <View style={styles.paramBlock}>
        <View style={styles.paramLabelRow}>
          <Text style={[styles.paramLabel, { color: theme.colors.text }]}>{label}</Text>
          <TouchableOpacity
            onPress={() => setLockedParam(param)}
            style={[styles.lockButton, isLocked && styles.lockButtonActive]}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isLocked ? 'lock-closed' : 'lock-open'} 
              size={16} 
              color={isLocked ? theme.colors.primary : theme.colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <HorizontalScrollPicker
          label=""
          options={options}
          selectedValue={value}
          onValueChange={(newValue) => handleParamChange(param, newValue)}
          disabled={isLocked}
          textColor={theme.colors.text}
          accentColor={theme.colors.primary}
          disabledColor={theme.colors.textSecondary}
        />
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 顶部两个信息卡片横向排列 */}
      <View style={styles.topCardsRow}>
        {/* 测光 EV */}
        <Card style={styles.topCard}>
          <View style={styles.evCardContent}>
            <View style={styles.topCardHeader}>
              <Text style={[styles.topCardLabel, { color: theme.colors.textSecondary }]}>
                {t('calculator.exposureLab.currentEv')}
              </Text>
              {evLocked && (
                <TouchableOpacity onPress={handleUnlockEV} style={styles.topCardLockIcon}>
                  <Ionicons name="lock-closed" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={[styles.evValue, { color: evLocked ? theme.colors.primary : theme.colors.blueHour }]}>
              {formatEV(currentEV)}
            </Text>
          </View>
        </Card>

        {/* 长曝光结果 + B门计时器 */}
        <Card style={styles.topCardWide}>
          <View style={styles.resultTimerColumn}>
            <View style={styles.resultSection}>
              <Text style={[styles.topCardLabel, { color: theme.colors.textSecondary }]}>
                {t('calculator.exposureLab.resultTitle')}
              </Text>
              <Text style={[styles.resultValue, { color: theme.colors.blueHour }]}>
                {formatShutterSpeed(reciprocityCorrected)}
              </Text>
              <Text style={[styles.topCardHint, { color: theme.colors.textSecondary }]}>
                {formatShutterSpeed(shutter)} → {formatShutterSpeed(ndAdjustedShutter)}
              </Text>
            </View>
            <View style={styles.timerSection}>
              <View style={styles.timerRow}>
                <View style={styles.timerInfo}>
                  <Text style={[styles.timerLabel, { color: theme.colors.textSecondary }]}>
                    {timerState === 'running' ? t('calculator.exposureLab.timer.countdown') : t('calculator.exposureLab.timer.bulb')}
                  </Text>
                  <Text style={[styles.timerValue, { color: timerState === 'running' ? theme.colors.accent : theme.colors.text }]}>
                    {timerLabel}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={timerState === 'running' ? stopTimer : startTimer}
                  style={[styles.timerButton, { backgroundColor: timerState === 'running' ? theme.colors.textSecondary : theme.colors.primary }]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.timerButtonText}>
                    {timerState === 'running' ? t('calculator.exposureLab.stop') : t('calculator.exposureLab.start')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Card>
      </View>

      {evLocked && targetEV !== null && Math.abs(currentEV - targetEV) > 0.3 && (
        <View style={[styles.warningBadge, { backgroundColor: theme.colors.backgroundSecondary }]}>
          <Text style={[styles.warningText, { color: theme.colors.accent }]}>
            ⚠️ 当前参数无法精确达到目标 EV{formatEV(targetEV)}
          </Text>
        </View>
      )}

      <Card style={styles.sceneCard}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('calculator.exposureLab.sceneShortcuts')}
          </Text>
          <Text style={[styles.sectionHint, { color: theme.colors.textSecondary }]}>
            {t('calculator.exposureLab.sceneHint')}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sceneScroll}>
          {sceneCards.map((scene, index) => (
            <TouchableOpacity
              key={scene.ev}
              style={[styles.scenePill, { borderColor: theme.colors.border }]}
              onPress={() => handleSceneSelect(index)}
            >
              <Text style={styles.sceneEmoji}>{scene.icon}</Text>
              <View>
                <Text style={[styles.sceneTitle, { color: theme.colors.text }]}>{t(scene.descriptionKey)}</Text>
                <Text style={[styles.sceneParams, { color: theme.colors.textSecondary }]}>
                  f/{scene.params.aperture} · {formatShutterSpeed(scene.params.shutter)} · ISO {scene.params.iso}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </Card>

      <Card style={styles.sectionCard}>
        {renderParamPicker(
          t('calculator.ev.aperture'),
          'aperture',
          aperture,
          APERTURE_VALUES.map((value) => ({ value, label: `f/${value}` }))
        )}
        {renderParamPicker(
          t('calculator.ev.shutter'),
          'shutter',
          shutter,
          SHUTTER_SPEEDS
        )}
        {renderParamPicker(
          t('calculator.ev.iso'),
          'iso',
          iso,
          ISO_VALUES.map((value) => ({ value, label: `ISO ${value}` }))
        )}
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('calculator.exposureLab.ndSection')}
        </Text>
        <View style={styles.pickerContainer}>
          <Picker 
            selectedValue={ndStops} 
            onValueChange={(value) => setNdStops(Number(value))}
            style={styles.compactPicker}
            itemStyle={styles.pickerItem}
          >
            {ndOptions.map((option) => (
              <Picker.Item key={option.name} label={option.name} value={option.stops} />
            ))}
          </Picker>
        </View>
        <Text style={[styles.sectionHint, { color: theme.colors.textSecondary }]}>
          {t('calculator.exposureLab.ndHint')}
        </Text>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('calculator.exposureLab.reciprocitySection')}
        </Text>
        <View style={styles.pickerContainer}>
          <Picker 
            selectedValue={profileId} 
            onValueChange={(value) => setProfileId(String(value))}
            style={styles.compactPicker}
            itemStyle={styles.pickerItem}
          >
            {RECIPROCITY_PROFILES.map((profile) => (
              <Picker.Item key={profile.id} label={t(profile.nameKey)} value={profile.id} />
            ))}
          </Picker>
        </View>
        <Text style={[styles.sectionHint, { color: theme.colors.textSecondary }]}>
          {reciprocityProfile ? t(reciprocityProfile.descriptionKey) : ''}
        </Text>
      </Card>
    </ScrollView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: Layout.spacing.lg,
      paddingBottom: Layout.spacing.xxl,
    },
    topCardsRow: {
      flexDirection: 'row',
      gap: Layout.spacing.sm,
      marginBottom: Layout.spacing.md,
    },
    topCard: {
      flex: 1,
      padding: Layout.spacing.md,
      minHeight: 100,
    },
    evCardContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topCardWide: {
      flex: 2,
      padding: Layout.spacing.md,
    },
    resultTimerColumn: {
      flex: 1,
      gap: Layout.spacing.sm,
    },
    resultSection: {
      alignItems: 'center',
    },
    timerSection: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: Layout.spacing.sm,
    },
    timerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Layout.spacing.sm,
    },
    timerInfo: {
      flex: 1,
    },
    topCardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    topCardLabel: {
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontWeight: '500',
    },
    evValue: {
      fontSize: 40,
      fontWeight: '700',
      letterSpacing: -1,
    },
    resultValue: {
      fontSize: 36,
      fontWeight: '700',
      marginVertical: 4,
      letterSpacing: -0.5,
    },
    topCardHint: {
      fontSize: 13,
      marginTop: 2,
      opacity: 0.8,
    },
    topCardLockIcon: {
      padding: 2,
    },
    timerLabel: {
      fontSize: 13,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontWeight: '500',
      marginBottom: 2,
    },
    timerValue: {
      fontSize: 26,
      fontWeight: '700',
      letterSpacing: -0.5,
    },
    timerButton: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 14,
      minWidth: 70,
      alignItems: 'center',
    },
    timerButtonText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    title: {
      fontSize: Layout.fontSize.hero,
      fontWeight: '700',
      marginBottom: Layout.spacing.xs,
    },
    subtitle: {
      fontSize: Layout.fontSize.base,
      marginBottom: Layout.spacing.md,
    },
    sceneCard: {
      marginBottom: Layout.spacing.md,
      padding: Layout.spacing.md,
    },
    sceneScroll: {
      marginHorizontal: -Layout.spacing.md,
      paddingHorizontal: Layout.spacing.md,
    },
    evBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: Layout.spacing.sm,
      paddingHorizontal: Layout.spacing.md,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: Layout.borderRadius.md,
      marginBottom: Layout.spacing.md,
    },
    evBadgeLabel: {
      fontSize: Layout.fontSize.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    evBadgeValue: {
      fontSize: Layout.fontSize.xl,
      fontWeight: '700',
    },
    unlockButton: {
      paddingVertical: Layout.spacing.xs,
      paddingHorizontal: Layout.spacing.sm,
      borderWidth: 1,
      borderRadius: Layout.borderRadius.sm,
    },
    unlockText: {
      fontSize: Layout.fontSize.sm,
      fontWeight: '600',
    },
    warningBadge: {
      paddingVertical: Layout.spacing.sm,
      paddingHorizontal: Layout.spacing.md,
      borderRadius: Layout.borderRadius.md,
      marginBottom: Layout.spacing.sm,
    },
    warningText: {
      fontSize: Layout.fontSize.sm,
      textAlign: 'center',
    },
    sectionCard: {
      marginBottom: Layout.spacing.md,
      padding: Layout.spacing.lg,
    },
    sectionHeader: {
      marginBottom: Layout.spacing.sm,
    },
    sectionTitle: {
      fontSize: Layout.fontSize.lg,
      fontWeight: '600',
      marginBottom: Layout.spacing.md,
    },
    sectionHint: {
      fontSize: Layout.fontSize.sm,
      marginBottom: Layout.spacing.xs,
    },
    sectionCardContent: {
      marginTop: Layout.spacing.sm,
    },
    paramBlock: {
      marginBottom: Layout.spacing.xs,
    },
    paramLabelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Layout.spacing.xs,
      paddingHorizontal: Layout.spacing.xs,
    },
    paramLabel: {
      fontSize: Layout.fontSize.base,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    lockButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
    },
    lockButtonActive: {
      backgroundColor: colors.primary + '20',
    },
    pickerContainer: {
      ...Platform.select({
        web: {
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: Layout.borderRadius.md,
          backgroundColor: colors.background,
          overflow: 'hidden',
        },
        default: {},
      }),
    },
    compactPicker: {
      ...Platform.select({
        web: {
          height: 44,
          fontSize: Layout.fontSize.base,
        },
        ios: {
          height: 120,
        },
        android: {
          height: 50,
        },
      }),
    },
    pickerItem: {
      height: 120,
      fontSize: Layout.fontSize.base,
    },
    scenePill: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: Layout.borderRadius.lg,
      padding: Layout.spacing.md,
      marginRight: Layout.spacing.sm,
      minWidth: 200,
    },
    sceneEmoji: {
      fontSize: 20,
      marginRight: Layout.spacing.sm,
    },
    sceneTitle: {
      fontWeight: '600',
      fontSize: Layout.fontSize.sm,
    },
    sceneParams: {
      fontSize: Layout.fontSize.xs,
      marginTop: 2,
    },
    resultCard: {
      marginBottom: Layout.spacing.md,
      padding: Layout.spacing.lg,
      alignItems: 'center',
    },
    resultHeader: {
      width: '100%',
      marginBottom: Layout.spacing.sm,
    },
    resultLabel: {
      fontSize: Layout.fontSize.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    resultSteps: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Layout.spacing.xs,
    },
    stepText: {
      fontSize: Layout.fontSize.sm,
    },
    stepArrow: {
      fontSize: Layout.fontSize.sm,
      marginHorizontal: Layout.spacing.xs,
    },
    finalValue: {
      fontSize: 52,
      fontWeight: '700',
      marginVertical: Layout.spacing.sm,
    },
    resultHint: {
      fontSize: Layout.fontSize.sm,
    },
    timerCard: {
      padding: Layout.spacing.lg,
    },
    timerHeader: {
      alignItems: 'center',
      marginBottom: Layout.spacing.md,
    },
    timerButtons: {
      alignItems: 'center',
    },
    timerDone: {
      fontSize: Layout.fontSize.sm,
      textAlign: 'center',
      marginTop: Layout.spacing.sm,
    },
  });

export default ExposureLabScreen;
