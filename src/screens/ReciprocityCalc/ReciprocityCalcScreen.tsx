import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';

import { Layout } from '../../constants/Layout';
import { Card } from '../../components/common/Card';
import { AppButton } from '../../components/common/AppButton';
import { RECIPROCITY_PROFILES } from '../../constants/Photography';
import { applyReciprocityCorrection } from '../../utils/photographyCalculations';
import { formatShutterSpeed } from '../../utils/formatters';

const LONG_EXPOSURE_TIMES = [
  { value: 1, label: '1s' },
  { value: 2, label: '2s' },
  { value: 4, label: '4s' },
  { value: 8, label: '8s' },
  { value: 10, label: '10s' },
  { value: 15, label: '15s' },
  { value: 20, label: '20s' },
  { value: 30, label: '30s' },
  { value: 45, label: '45s' },
  { value: 60, label: '1m' },
  { value: 90, label: '1m 30s' },
  { value: 120, label: '2m' },
  { value: 180, label: '3m' },
  { value: 240, label: '4m' },
  { value: 300, label: '5m' },
  { value: 480, label: '8m' },
  { value: 600, label: '10m' },
  { value: 900, label: '15m' },
  { value: 1200, label: '20m' },
  { value: 1800, label: '30m' },
  { value: 2700, label: '45m' },
  { value: 3600, label: '1h' },
];

const ReciprocityCalcScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const [baseShutter, setBaseShutter] = useState(1);
  const [profileId, setProfileId] = useState('digital');

  // 计时器状态
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'done'>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reciprocityProfile = RECIPROCITY_PROFILES.find(profile => profile.id === profileId);

  const reciprocityCorrected = useMemo(
    () => applyReciprocityCorrection(baseShutter, reciprocityProfile?.curve),
    [baseShutter, reciprocityProfile]
  );

  // 向上取整作为计时器目标
  const roundedTarget = Math.max(0, Math.round(reciprocityCorrected));

  // 监听 Active Preset 变化

  // 重置计时器当目标改变时
  useEffect(() => {
    if (timerState === 'idle') {
      setRemainingSeconds(roundedTarget);
    }
  }, [roundedTarget, timerState]);

  // 计时器逻辑
  useEffect(() => {
    if (timerState !== 'running') return;

    timerRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setTimerState('done');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerState]);

  const toggleTimer = () => {
    if (timerState === 'running') {
      setTimerState('idle');
      if (timerRef.current) clearInterval(timerRef.current);
      setRemainingSeconds(roundedTarget); // 重置
    } else {
      setTimerState('running');
    }
  };

  const formatCountdown = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const colors = theme.colors;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('calculator.exposureLab.reciprocityProfiles')}
          </Text>
        </View>

        <View style={styles.pickerWrapper}>
          {Platform.OS === 'ios' ? (
            <View>
              <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>
                {reciprocityProfile
                  ? t(reciprocityProfile.nameKey)
                  : t('calculator.exposureLab.reciprocity.digital')}
              </Text>
              {/* iOS Picker can be modal or expanded, here simplified */}
              <Picker
                selectedValue={profileId}
                onValueChange={itemValue => setProfileId(itemValue)}
                itemStyle={{ color: colors.text, height: 120 }}
              >
                {RECIPROCITY_PROFILES.map(profile => (
                  <Picker.Item
                    key={profile.id}
                    label={t(profile.nameKey)}
                    value={profile.id}
                    color={colors.text}
                  />
                ))}
              </Picker>
            </View>
          ) : (
            <Picker
              selectedValue={profileId}
              onValueChange={itemValue => setProfileId(itemValue)}
              style={{ color: colors.text, backgroundColor: colors.background }}
              dropdownIconColor={colors.text}
            >
              {RECIPROCITY_PROFILES.map(profile => (
                <Picker.Item key={profile.id} label={t(profile.nameKey)} value={profile.id} />
              ))}
            </Picker>
          )}
        </View>

        {reciprocityProfile && reciprocityProfile.descriptionKey && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t(reciprocityProfile.descriptionKey)}
          </Text>
        )}
      </Card>

      <Card style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Metered Shutter Speed</Text>
        </View>

        <View style={styles.pickerWrapper}>
          {Platform.OS === 'ios' ? (
            <View>
              <Text style={[styles.pickerLabel, { color: colors.textSecondary }]}>
                {LONG_EXPOSURE_TIMES.find(i => i.value === baseShutter)?.label}
              </Text>
              <Picker
                selectedValue={baseShutter}
                onValueChange={itemValue => setBaseShutter(itemValue)}
                itemStyle={{ color: colors.text, height: 120 }}
              >
                {LONG_EXPOSURE_TIMES.map(item => (
                  <Picker.Item
                    key={item.value}
                    label={item.label}
                    value={item.value}
                    color={colors.text}
                  />
                ))}
              </Picker>
            </View>
          ) : (
            <Picker
              selectedValue={baseShutter}
              onValueChange={itemValue => setBaseShutter(itemValue)}
              style={{ color: colors.text, backgroundColor: colors.background }}
              dropdownIconColor={colors.text}
            >
              {LONG_EXPOSURE_TIMES.map(item => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))}
            </Picker>
          )}
        </View>
      </Card>

      {/* Result Display */}
      <Card style={[styles.resultCard, { backgroundColor: colors.card }]}>
        <View style={styles.resultRow}>
          <View style={styles.resultItem}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              {t('calculator.exposureLab.resultBase')}
            </Text>
            <Text style={[styles.resultValueSmall, { color: colors.text }]}>
              {formatShutterSpeed(baseShutter)}
            </Text>
          </View>

          <Ionicons name="arrow-forward" size={24} color={colors.textSecondary} />

          <View style={styles.resultItem}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              {t('calculator.exposureLab.resultReciprocity')}
            </Text>
            <Text style={[styles.resultValue, { color: colors.accent }]}>
              {formatShutterSpeed(reciprocityCorrected)}
            </Text>
          </View>
        </View>
      </Card>

      {/* Timer */}
      <Card style={[styles.timerCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.timerTitle, { color: colors.text }]}>
          {t('calculator.exposureLab.timerTitle')}
        </Text>
        <Text
          style={[
            styles.timerDisplay,
            { color: timerState === 'running' ? colors.primary : colors.text },
          ]}
        >
          {formatCountdown(remainingSeconds)}
        </Text>

        <AppButton
          title={
            timerState === 'running'
              ? t('calculator.exposureLab.stopTimer')
              : timerState === 'done'
                ? t('calculator.exposureLab.timerDone')
                : t('calculator.exposureLab.startTimer')
          }
          onPress={toggleTimer}
          variant={timerState === 'running' ? 'outline' : 'primary'}
          style={{ marginTop: Layout.spacing.md }}
        />
      </Card>
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
    marginBottom: Layout.spacing.md,
  },
  header: {
    marginBottom: Layout.spacing.sm,
  },
  title: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  pickerWrapper: {
    marginHorizontal: -Layout.spacing.xs,
  },
  pickerLabel: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 20,
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
    marginBottom: Layout.spacing.lg,
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
    marginBottom: Layout.spacing.xl,
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
});

export default ReciprocityCalcScreen;
