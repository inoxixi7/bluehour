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
  const [ndStops, setNdStops] = useState(0);
  const [profileId, setProfileId] = useState('digital');
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'done'>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sceneCards = EV_SCENES.slice(8, 18); // focus on low-light presets
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

    const result = calculateEquivalentExposure(
      { aperture, shutter, iso },
      param,
      value,
      lockedParam
    );

    setAperture(result.aperture);
    setShutter(result.shutter);
    setISO(result.iso);
  };

  const handleSceneSelect = (sceneIndex: number) => {
    const scene = sceneCards[sceneIndex];
    setAperture(scene.params.aperture);
    setShutter(scene.params.shutter);
    setISO(scene.params.iso);
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

      <Card style={styles.heroCard}>
        <Text style={[styles.heroLabel, { color: theme.colors.textSecondary }]}>
          {t('calculator.exposureLab.currentEv')}
        </Text>
        <Text style={[styles.heroValue, { color: theme.colors.blueHour }]}>{formatEV(currentEV)}</Text>
        <Text style={[styles.heroHint, { color: theme.colors.textSecondary }]}>
          {t('calculator.exposureLab.evHelper')}
        </Text>
      </Card>

      <Card style={styles.sectionCard}>
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
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            {t('calculator.exposureLab.sceneShortcuts')}
          </Text>
          <Text style={[styles.sectionHint, { color: theme.colors.textSecondary }]}>
            {t('calculator.exposureLab.sceneHint')}
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('calculator.exposureLab.resultTitle')}
        </Text>
        <View style={styles.resultRow}>
          <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>
            {t('calculator.exposureLab.resultBase')}
          </Text>
          <Text style={[styles.resultValue, { color: theme.colors.text }]}
          >
            {formatShutterSpeed(shutter)}
          </Text>
        </View>
        <View style={styles.resultRow}>
          <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>
            {t('calculator.exposureLab.resultNd')}
          </Text>
          <Text style={[styles.resultValue, { color: theme.colors.text }]}>
            {formatShutterSpeed(ndAdjustedShutter)}
          </Text>
        </View>
        <View style={styles.resultRow}>
          <Text style={[styles.resultLabel, { color: theme.colors.textSecondary }]}>
            {t('calculator.exposureLab.resultReciprocity')}
          </Text>
          <Text style={[styles.resultValue, { color: theme.colors.blueHour }]}>
            {formatShutterSpeed(reciprocityCorrected)}
          </Text>
        </View>
      </Card>

      <Card style={styles.timerCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('calculator.exposureLab.timerTitle')}
        </Text>
        <Text style={[styles.timerValue, { color: theme.colors.accent }]}>{timerLabel}</Text>
        <View style={styles.timerButtons}>
          {timerState === 'running' ? (
            <AppButton title={t('calculator.exposureLab.stopTimer')} onPress={stopTimer} variant="secondary" />
          ) : (
            <AppButton title={t('calculator.exposureLab.startTimer')} onPress={startTimer} variant="primary" />
          )}
        </View>
        {timerState === 'done' && (
          <Text style={[styles.sectionHint, { color: theme.colors.success }]}>
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
      marginBottom: Layout.spacing.lg,
    },
    heroCard: {
      alignItems: 'center',
      paddingVertical: Layout.spacing.xl,
      marginBottom: Layout.spacing.md,
      backgroundColor: colors.backgroundSecondary,
    },
    heroLabel: {
      fontSize: Layout.fontSize.sm,
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    heroValue: {
      fontSize: 56,
      fontWeight: 'bold',
      marginTop: Layout.spacing.sm,
    },
    heroHint: {
      fontSize: Layout.fontSize.sm,
      marginTop: Layout.spacing.xs,
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
      marginBottom: Layout.spacing.sm,
    },
    sectionHint: {
      fontSize: Layout.fontSize.sm,
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
      minWidth: 220,
    },
    sceneEmoji: {
      fontSize: 22,
      marginRight: Layout.spacing.sm,
    },
    sceneTitle: {
      fontWeight: '600',
    },
    sceneParams: {
      fontSize: Layout.fontSize.sm,
    },
    resultCard: {
      marginBottom: Layout.spacing.md,
      padding: Layout.spacing.lg,
    },
    resultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: Layout.spacing.sm,
    },
    resultLabel: {
      fontSize: Layout.fontSize.sm,
    },
    resultValue: {
      fontSize: Layout.fontSize.lg,
      fontWeight: '600',
    },
    timerCard: {
      padding: Layout.spacing.lg,
    },
    timerValue: {
      fontSize: 48,
      fontWeight: '700',
      textAlign: 'center',
      marginBottom: Layout.spacing.md,
    },
    timerButtons: {
      alignItems: 'center',
    },
  });

export default ExposureLabScreen;
