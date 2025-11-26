import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
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
        <View style={styles.paramHeader}>
          <TouchableOpacity
            onPress={() => setLockedParam(param)}
            style={[styles.lockBadge, isLocked && { backgroundColor: theme.colors.primary }]}
          >
            <Text style={[styles.lockText, { color: isLocked ? '#fff' : theme.colors.textSecondary }]}>
              {isLocked ? '🔒' : '🔓'}
            </Text>
          </TouchableOpacity>
        </View>
        <HorizontalScrollPicker
          label={label}
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
      <Text style={[styles.title, { color: theme.colors.text }]}>
        {t('calculator.exposureLab.title')}
      </Text>
      <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
        {t('calculator.exposureLab.subtitle')}
      </Text>

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
        <View style={styles.evBadge}>
          <View>
            <Text style={[styles.evBadgeLabel, { color: theme.colors.textSecondary }]}>
              {t('calculator.exposureLab.currentEv')}
            </Text>
            <Text style={[styles.evBadgeValue, { color: evLocked ? theme.colors.primary : theme.colors.blueHour }]}>
              {formatEV(currentEV)}
              {evLocked && ' 🔒'}
            </Text>
          </View>
          {evLocked && (
            <TouchableOpacity onPress={handleUnlockEV} style={[styles.unlockButton, { borderColor: theme.colors.border }]}>
              <Text style={[styles.unlockText, { color: theme.colors.primary }]}>解锁</Text>
            </TouchableOpacity>
          )}
        </View>
        {evLocked && targetEV !== null && Math.abs(currentEV - targetEV) > 0.3 && (
          <View style={[styles.warningBadge, { backgroundColor: theme.colors.backgroundSecondary }]}>
            <Text style={[styles.warningText, { color: theme.colors.accent }]}>
              ⚠️ 当前参数无法精确达到目标 EV{formatEV(targetEV)}
            </Text>
          </View>
        )}
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('calculator.exposureLab.baseSettings')}
        </Text>
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
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={ndStops} onValueChange={(value) => setNdStops(Number(value))}>
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
        <View style={styles.pickerWrapper}>
          <Picker selectedValue={profileId} onValueChange={(value) => setProfileId(String(value))}>
            {RECIPROCITY_PROFILES.map((profile) => (
              <Picker.Item key={profile.id} label={t(profile.nameKey)} value={profile.id} />
            ))}
          </Picker>
        </View>
        <Text style={[styles.sectionHint, { color: theme.colors.textSecondary }]}>
          {reciprocityProfile ? t(reciprocityProfile.descriptionKey) : ''}
        </Text>
      </Card>

      <Card style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>
            {t('calculator.exposureLab.resultTitle')}
          </Text>
          <View style={styles.resultSteps}>
            <Text style={[styles.stepText, { color: theme.colors.textSecondary }]}>
              {formatShutterSpeed(shutter)}
            </Text>
            <Text style={[styles.stepArrow, { color: theme.colors.textSecondary }]}>→</Text>
            <Text style={[styles.stepText, { color: theme.colors.textSecondary }]}>
              {formatShutterSpeed(ndAdjustedShutter)}
            </Text>
          </View>
        </View>
        <Text style={[styles.finalValue, { color: theme.colors.blueHour }]}>
          {formatShutterSpeed(reciprocityCorrected)}
        </Text>
        <Text style={[styles.resultHint, { color: theme.colors.textSecondary }]}>
          {t('calculator.exposureLab.resultReciprocity')}
        </Text>
      </Card>

      <Card style={styles.timerCard}>
        <View style={styles.timerHeader}>
          <Text style={[styles.timerLabel, { color: theme.colors.textSecondary }]}>
            {t('calculator.exposureLab.timerTitle')}
          </Text>
          <Text style={[styles.timerValue, { color: theme.colors.accent }]}>{timerLabel}</Text>
        </View>
        <View style={styles.timerButtons}>
          {timerState === 'running' ? (
            <AppButton title={t('calculator.exposureLab.stopTimer')} onPress={stopTimer} variant="secondary" />
          ) : (
            <AppButton title={t('calculator.exposureLab.startTimer')} onPress={startTimer} variant="primary" />
          )}
        </View>
        {timerState === 'done' && (
          <Text style={[styles.timerDone, { color: theme.colors.success }]}>
            {t('calculator.exposureLab.timerDone')}
          </Text>
        )}
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
      marginBottom: Layout.spacing.md,
    },
    paramHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Layout.spacing.xs,
    },
    paramLabel: {
      fontSize: Layout.fontSize.base,
      fontWeight: '600',
    },
    lockBadge: {
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: Layout.borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    lockText: {
      fontSize: Layout.fontSize.sm,
    },
    pickerWrapper: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Layout.borderRadius.md,
      backgroundColor: colors.background,
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
    timerLabel: {
      fontSize: Layout.fontSize.sm,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: Layout.spacing.xs,
    },
    timerValue: {
      fontSize: 42,
      fontWeight: '700',
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
