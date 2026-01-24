import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Modal, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Touchable } from '../../components/common/Touchable';

import { Layout } from '../../constants/Layout';
import { Card } from '../../components/common/Card';
import { AppButton } from '../../components/common/AppButton';
import { Dropdown } from '../../components/common/Dropdown';
import { RECIPROCITY_PROFILES, SHUTTER_SPEEDS } from '../../constants/Photography';
import { useUserPresets } from '../../hooks/useUserPresets';
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

type ReciprocityCalcRouteProp = RouteProp<{ params: { initialShutter?: number } }, 'params'>;

const ReciprocityCalcScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const route = useRoute<ReciprocityCalcRouteProp>();
  const { activePreset } = useUserPresets();

  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [baseShutter, setBaseShutter] = useState(route.params?.initialShutter || 1);
  const [profileId, setProfileId] = useState('digital');

  // 计时器状态
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'done'>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const reciprocityProfile = RECIPROCITY_PROFILES.find(profile => profile.id === profileId);

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

  // 胶片选项
  const filmOptions = useMemo(
    () => {
      const options = RECIPROCITY_PROFILES.map((profile, idx) => ({
        label: t(profile.nameKey),
        value: idx,
        isDigital: profile.id === 'digital',
      }));

      return options
        .sort((a, b) => {
          if (a.isDigital) return -1;
          if (b.isDigital) return 1;
          return a.label.localeCompare(b.label);
        })
        .map(({ label, value }) => ({ label, value }));
    },
    [t]
  );

  // 快门选项：优先使用activePreset的快门速度，否则使用LONG_EXPOSURE_TIMES
  const shutterOptions = useMemo(() => {
    if (activePreset && activePreset.shutterSpeeds && activePreset.shutterSpeeds.length > 0) {
      // 从预设中获取快门速度，并转换为秒值
      const presetShutters = activePreset.shutterSpeeds
        .map(value => {
          const shutterItem = SHUTTER_SPEEDS.find(s => s.value === value);
          return shutterItem ? { value: shutterItem.value, label: shutterItem.label } : null;
        })
        .filter((item): item is { value: number; label: string } => item !== null)
        // 只保留 >= 1秒的快门速度用于长曝光（包括秒、分钟、小时）
        .filter(item => item.value >= 1);

      if (presetShutters.length > 0) {
        return presetShutters.map((item, idx) => ({
          label: item.label,
          value: idx,
        }));
      }
    }
    // 备用：使用LONG_EXPOSURE_TIMES
    return LONG_EXPOSURE_TIMES.map((item, idx) => ({
      label: item.label,
      value: idx,
    }));
  }, [activePreset]);

  const reciprocityCorrected = useMemo(
    () => applyReciprocityCorrection(baseShutter, reciprocityProfile?.curve, reciprocityProfile?.segmentParams),
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

  const handleFilmChange = (index: number) => {
    const profile = RECIPROCITY_PROFILES[index];
    if (profile) {
      setProfileId(profile.id);
    }
  };

  const handleShutterChange = (index: number) => {
    if (activePreset && activePreset.shutterSpeeds && activePreset.shutterSpeeds.length > 0) {
      // 从预设快门速度获取
      const presetShutters = activePreset.shutterSpeeds
        .map(value => SHUTTER_SPEEDS.find(s => s.value === value))
        .filter((item): item is { value: number; label: string } => item !== undefined && item !== null && item.value >= 1);
      
      const time = presetShutters[index];
      if (time) {
        setBaseShutter(time.value);
      }
    } else {
      // 使用LONG_EXPOSURE_TIMES
      const time = LONG_EXPOSURE_TIMES[index];
      if (time) {
        setBaseShutter(time.value);
      }
    }
  };

  const selectedFilmIndex = RECIPROCITY_PROFILES.findIndex(p => p.id === profileId);
  
  // 计算选中的快门索引
  const selectedShutterIndex = useMemo(() => {
    if (activePreset && activePreset.shutterSpeeds && activePreset.shutterSpeeds.length > 0) {
      const presetShutters = activePreset.shutterSpeeds
        .map(value => SHUTTER_SPEEDS.find(s => s.value === value))
        .filter((item): item is { value: number; label: string } => item !== undefined && item !== null && item.value >= 1);
      return presetShutters.findIndex(t => t.value === baseShutter);
    }
    return LONG_EXPOSURE_TIMES.findIndex(t => t.value === baseShutter);
  }, [activePreset, baseShutter]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Card style={[styles.card, styles.firstCard, { backgroundColor: colors.card }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t('reciprocity.filmProfile')}
          </Text>
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

        {reciprocityProfile && reciprocityProfile.descriptionKey && (
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {t(reciprocityProfile.descriptionKey)}
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
          selectedValue={selectedShutterIndex}
          onValueChange={handleShutterChange}
          placeholder="1s"
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

        <AppButton
          title={
            timerState === 'running'
              ? t('reciprocity.stopTimer')
              : timerState === 'done'
                ? t('reciprocity.timerDone')
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
              <Text style={[styles.modalDescription, { color: colors.text }]}>
                {t('reciprocityHelp.description')}
              </Text>

              <View style={styles.helpSection}>
                <Text style={[styles.helpSectionTitle, { color: colors.primary }]}>
                  {t('reciprocityHelp.section1.title')}
                </Text>
                {(t('reciprocityHelp.section1.content', { returnObjects: true }) as string[]).map((item: string, idx: number) => (
                  <Text key={idx} style={[styles.helpText, { color: colors.textSecondary }]}>
                    • {item}
                  </Text>
                ))}
              </View>

              <View style={styles.helpSection}>
                <Text style={[styles.helpSectionTitle, { color: colors.primary }]}>
                  {t('reciprocityHelp.section2.title')}
                </Text>
                {(t('reciprocityHelp.section2.content', { returnObjects: true }) as string[]).map((item: string, idx: number) => (
                  <Text key={idx} style={[styles.helpText, { color: colors.textSecondary }]}>
                    • {item}
                  </Text>
                ))}
              </View>

              <View style={styles.helpSection}>
                <Text style={[styles.helpSectionTitle, { color: colors.primary }]}>
                  {t('reciprocityHelp.section3.title')}
                </Text>
                {(t('reciprocityHelp.section3.content', { returnObjects: true }) as string[]).map((item: string, idx: number) => (
                  <Text key={idx} style={[styles.helpText, { color: colors.textSecondary }]}>
                    • {item}
                  </Text>
                ))}
              </View>
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
  modalDescription: {
    fontSize: Layout.fontSize.base,
    lineHeight: 24,
    marginBottom: Layout.spacing.lg,
  },
  helpSection: {
    marginBottom: Layout.spacing.lg,
  },
  helpSectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    marginBottom: Layout.spacing.sm,
  },
  helpText: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 22,
    marginBottom: Layout.spacing.xs,
  },
});

export default ReciprocityCalcScreen;
