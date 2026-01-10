import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserPresets } from '../../hooks/useUserPresets';
import { Layout } from '../../constants/Layout';
import { Card } from '../../components/common/Card';
import { AppButton } from '../../components/common/AppButton';
import { HorizontalScrollPicker } from '../../components/common/HorizontalScrollPicker';
import { Touchable } from '../../components/common/Touchable';
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
  const navigation = useNavigation();
  const { activePreset } = useUserPresets();

  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [aperture, setAperture] = useState(8);
  const [shutter, setShutter] = useState(1 / 4);
  const [iso, setISO] = useState(100);

  // 双锁定模式：允许锁定任意两个参数
  const [lockedParams, setLockedParams] = useState<Set<'aperture' | 'shutter' | 'iso'>>(
    new Set(['aperture', 'iso']) // 默认锁定光圈和ISO，调整快门
  );

  // EV锁定模式：锁定EV值，允许在相同曝光下调整参数组合
  const [targetEV, setTargetEV] = useState<number | null>(null);
  const [evLocked, setEvLocked] = useState(false);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);

  const [ndStops, setNdStops] = useState(0);
  const [profileId, setProfileId] = useState('digital');
  const [timerState, setTimerState] = useState<'idle' | 'running' | 'done'>('idle');
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sceneCards = EV_SCENES; // 显示所有场景 EV16 到 EV-6
  const reciprocityProfile = RECIPROCITY_PROFILES.find(profile => profile.id === profileId);
  const ndOptions = useMemo(
    () => [
      { name: t('calculator.exposureLab.ndNone'), stops: 0 },
      ...ND_FILTERS.map(filter => ({ name: filter.name, stops: filter.stops })),
    ],
    [t]
  );

  const currentEV = useMemo(() => calculateEV(aperture, shutter, iso), [aperture, shutter, iso]);
  const ndAdjustedShutter = useMemo(() => calculateNDShutter(shutter, ndStops), [shutter, ndStops]);
  const reciprocityCorrected = useMemo(
    () => applyReciprocityCorrection(ndAdjustedShutter, reciprocityProfile?.curve),
    [ndAdjustedShutter, reciprocityProfile]
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Touchable onPress={() => setHelpModalVisible(true)} style={{ marginRight: 16 }}>
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
        </Touchable>
      ),
    });
  }, [navigation, theme.colors.primary]);

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
      setRemainingSeconds(prev => {
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

  // 应用预设：自动设置胶卷ISO和倒易律，并锁定ISO
  useEffect(() => {
    if (activePreset?.useFilm && activePreset.filmStock) {
      setISO(activePreset.filmStock.iso);

      // 自动设置倒易律配置
      if (activePreset.filmStock.id) {
        setProfileId(activePreset.filmStock.id);
      }

      // 强制锁定 ISO
      setLockedParams(prev => {
        // 如果 ISO 已经在锁定其重，不需要改变
        if (prev.has('iso')) {
          return prev;
        }

        // 如果 ISO 未锁定，我们需要锁定它
        // 为了维持“双锁定”规则（只有两个锁定），我们需要解锁另一个
        // 默认策略：保持光圈锁定，解释快门（让快门自动调整）
        // 除非只有快门是锁定的（这在双锁定逻辑下不应该发生，因为总是2个）

        const newLocked = new Set(prev);
        newLocked.add('iso');

        // 此时有3个锁定了，必须移除一个
        // 优先移除快门，保留光圈
        if (newLocked.has('shutter')) {
          newLocked.delete('shutter');
        } else if (newLocked.has('aperture')) {
          // 如果奇怪地没有快门但有光圈（不太可能），移除光圈
          newLocked.delete('aperture');
        }

        return newLocked;
      });
    }
  }, [activePreset]);

  const handleParamChange = (param: 'aperture' | 'shutter' | 'iso', value: number) => {
    // 双锁定模式逻辑
    const allParams: ('aperture' | 'shutter' | 'iso')[] = ['aperture', 'shutter', 'iso'];

    // 计算当前未锁定的参数
    let currentLockedParams = lockedParams;
    const unlockedParams = allParams.filter(p => !currentLockedParams.has(p));

    // 确保至少有一个参数是解锁的
    if (unlockedParams.length === 0) {
      console.warn('所有参数都被锁定，无法调整');
      return;
    }

    // EV锁定模式：保持EV不变，调整未锁定的参数
    if (evLocked && targetEV !== null) {
      // 找到其他两个参数
      const otherParams = allParams.filter(p => p !== param);
      // 使用新的锁定状态
      // 优先选择 ISO 作为固定的参数（如果它在其他参数中且已被锁定）
      // 这样在计算时，会调整剩下的那个参数（例如光圈），而保持 ISO 不变
      let lockedOther = otherParams.find(p => p === 'iso' && currentLockedParams.has(p));

      if (!lockedOther) {
        // 如果没有 ISO 或 ISO 未锁定，则选择任意一个锁定的参数
        lockedOther = otherParams.find(p => currentLockedParams.has(p)) || otherParams[0];
      }

      const result = calculateEquivalentExposureWithEV(targetEV, param, value, lockedOther, {
        aperture,
        shutter,
        iso,
      });

      if (result) {
        setAperture(result.aperture);
        setShutter(result.shutter);
        setISO(result.iso);
      } else {
        // 无法达到目标 EV，显示警告但仍更新值
        console.warn('无法在当前参数范围内达到目标 EV');
        const newValues = { aperture, shutter, iso };
        newValues[param] = value;
        setAperture(newValues.aperture);
        setShutter(newValues.shutter);
        setISO(newValues.iso);
      }
    } else {
      // 普通双锁定模式：等效曝光计算
      const otherParams = allParams.filter(p => p !== param);

      // 检查其他两个参数是否都被锁定了
      const allOthersLocked = otherParams.every(p => currentLockedParams.has(p));

      // 如果其他两个都被锁定（意味着用户正在调整唯一未锁定的参数），
      // 或者没有任何其他参数被锁定（不应该发生），
      // 我们直接更新值，允许 EV 发生因参数调整而产生的变化。
      if (allOthersLocked || !otherParams.find(p => currentLockedParams.has(p))) {
        const newValues = { aperture, shutter, iso };
        newValues[param] = value;
        setAperture(newValues.aperture);
        setShutter(newValues.shutter);
        setISO(newValues.iso);
        // 这里也会导致 EV 变化，但 targetEV 只有在 EV 锁定时才重要
        return;
      }

      // 使用新的锁定状态（这里只会在至少有一个其他参数未锁定时执行，但在双锁定模式下通常是2个锁）
      // 等等，上面如果 allOthersLocked 为 true 已经返回了。
      // 如果走到这里，说明并不是两个都锁了。
      // 但在双锁定模式设计下，必定有2个锁定的。
      // 唯一的例外是如果用户手动解除了一个锁，变成只有1个锁。
      // 在那种情况下，我们确实需要维持 EV。

      const lockedOther = otherParams.find(p => currentLockedParams.has(p))!;

      // 计算等效曝光，调整未锁定的参数
      const result = calculateEquivalentExposure(
        { aperture, shutter, iso },
        param,
        value,
        lockedOther
      );

      setAperture(result.aperture);
      setShutter(result.shutter);
      setISO(result.iso);
    }
  };

  const handleSceneSelect = (sceneIndex: number) => {
    const scene = sceneCards[sceneIndex];

    // 如果已经选中，再次点击取消预设
    if (selectedSceneIndex === sceneIndex && evLocked) {
      setSelectedSceneIndex(null);
      setEvLocked(false);
      setTargetEV(null);
      return;
    }

    // 应用场景参数
    setAperture(scene.params.aperture);
    setShutter(scene.params.shutter);
    setISO(scene.params.iso);

    // 锁定选中场景的 EV 值（不可手动解锁）
    setTargetEV(scene.ev);
    setEvLocked(true);
    setSelectedSceneIndex(sceneIndex);
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
    const isLocked = lockedParams.has(param);
    const unlockedCount = 3 - lockedParams.size;

    const handleLockToggle = () => {
      const newLockedParams = new Set(lockedParams);

      if (isLocked) {
        // 解锁：至少保持一个参数解锁
        if (lockedParams.size < 3) {
          newLockedParams.delete(param);
        }
      } else {
        // 锁定：最多锁定两个参数
        if (lockedParams.size < 2) {
          newLockedParams.add(param);
        }
      }

      setLockedParams(newLockedParams);
    };

    return (
      <View style={styles.paramBlock}>
        <View style={styles.paramLabelRow}>
          <Text style={[styles.paramLabel, { color: theme.colors.text }]}>{label}</Text>
          {!isLocked && unlockedCount === 1 && (
            <Text style={[styles.autoAdjustHint, { color: theme.colors.textSecondary }]}>
              📊 {t('calculator.exposureLab.willAdjust')}
            </Text>
          )}
          <Touchable
            onPress={handleLockToggle}
            style={[styles.lockButton, isLocked && styles.lockButtonActive]}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isLocked ? 'lock-closed' : 'lock-open'}
              size={16}
              color={isLocked ? theme.colors.primary : theme.colors.textSecondary}
            />
          </Touchable>
        </View>
        <HorizontalScrollPicker
          label=""
          options={options}
          selectedValue={value}
          onValueChange={newValue => handleParamChange(param, newValue)}
          disabled={false}
          textColor={theme.colors.text}
          accentColor={theme.colors.primary}
          disabledColor={theme.colors.textSecondary}
        />
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 当前预设信息卡片 */}
      {activePreset && (
        <Card style={styles.presetCard}>
          <View style={styles.presetHeader}>
            <View style={styles.presetTitleRow}>
              <Ionicons name="camera-outline" size={18} color={theme.colors.primary} />
              <Text style={[styles.presetTitle, { color: theme.colors.textSecondary }]}>
                {t('settings.userPresets.currentPreset')}
              </Text>
            </View>
            <AppButton
              title={t('settings.userPresets.manage')}
              onPress={() => navigation.navigate('UserPresets' as never)}
              size="small"
              variant="outline"
            />
          </View>

          <Text style={[styles.presetName, { color: theme.colors.text }]}>{activePreset.name}</Text>

          <View style={styles.presetDetailsRow}>
            {activePreset.camera && (
              <Text style={[styles.presetDetailText, { color: theme.colors.textSecondary }]}>
                📷 {activePreset.camera}
              </Text>
            )}
            {activePreset.lens && (
              <Text style={[styles.presetDetailText, { color: theme.colors.textSecondary }]}>
                🔍 {activePreset.lens}
              </Text>
            )}
            {activePreset.useFilm && activePreset.filmStock && (
              <Text style={[styles.presetDetailText, { color: theme.colors.textSecondary }]}>
                🎞️ {activePreset.filmStock.name} (ISO {activePreset.filmStock.iso})
              </Text>
            )}
          </View>
        </Card>
      )}

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
                <Touchable onPress={handleUnlockEV} style={styles.topCardLockIcon}>
                  <Ionicons name="lock-closed" size={16} color={theme.colors.primary} />
                </Touchable>
              )}
            </View>
            <Text
              style={[
                styles.evValue,
                { color: evLocked ? theme.colors.primary : theme.colors.blueHour },
              ]}
            >
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
                    {timerState === 'running'
                      ? t('calculator.exposureLab.timer.countdown')
                      : t('calculator.exposureLab.timer.bulb')}
                  </Text>
                  <Text
                    style={[
                      styles.timerValue,
                      { color: timerState === 'running' ? theme.colors.accent : theme.colors.text },
                    ]}
                  >
                    {timerLabel}
                  </Text>
                </View>
                <Touchable
                  onPress={timerState === 'running' ? stopTimer : startTimer}
                  style={[
                    styles.timerButton,
                    {
                      backgroundColor:
                        timerState === 'running'
                          ? theme.colors.textSecondary
                          : theme.colors.primary,
                    },
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.timerButtonText}>
                    {timerState === 'running'
                      ? t('calculator.exposureLab.stop')
                      : t('calculator.exposureLab.start')}
                  </Text>
                </Touchable>
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={Platform.OS === 'web'}
          style={styles.sceneScroll}
        >
          {sceneCards.map((scene, index) => (
            <Touchable
              key={scene.ev}
              style={[styles.scenePill, { borderColor: theme.colors.border }]}
              onPress={() => handleSceneSelect(index)}
            >
              <Text style={styles.sceneEmoji}>{scene.icon}</Text>
              <View>
                <Text style={[styles.sceneTitle, { color: theme.colors.text }]}>
                  {t(scene.descriptionKey)}
                </Text>
                <Text style={[styles.sceneParams, { color: theme.colors.textSecondary }]}>
                  f/{scene.params.aperture} · {formatShutterSpeed(scene.params.shutter)} · ISO{' '}
                  {scene.params.iso}
                </Text>
              </View>
            </Touchable>
          ))}
        </ScrollView>
      </Card>

      <Card style={styles.sectionCard}>
        {renderParamPicker(
          t('calculator.ev.aperture'),
          'aperture',
          aperture,
          APERTURE_VALUES.map(value => ({ value, label: `f/${value}` }))
        )}
        {renderParamPicker(t('calculator.ev.shutter'), 'shutter', shutter, SHUTTER_SPEEDS)}
        {renderParamPicker(
          t('calculator.ev.iso'),
          'iso',
          iso,
          ISO_VALUES.map(value => ({ value, label: `ISO ${value}` }))
        )}
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          {t('calculator.exposureLab.ndSection')}
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={ndStops}
            onValueChange={value => setNdStops(Number(value))}
            style={styles.compactPicker}
            itemStyle={styles.pickerItem}
          >
            {ndOptions.map(option => (
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
            onValueChange={value => setProfileId(String(value))}
            style={styles.compactPicker}
            itemStyle={styles.pickerItem}
          >
            {RECIPROCITY_PROFILES.map(profile => (
              <Picker.Item key={profile.id} label={t(profile.nameKey)} value={profile.id} />
            ))}
          </Picker>
        </View>
        <Text style={[styles.sectionHint, { color: theme.colors.textSecondary }]}>
          {reciprocityProfile ? t(reciprocityProfile.descriptionKey) : ''}
        </Text>
      </Card>

      <Modal
        animationType="slide"
        transparent={true}
        visible={helpModalVisible}
        onRequestClose={() => setHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {t('exposureLabHelp.title')}
              </Text>
              <Touchable
                onPress={() => setHelpModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Touchable>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {[1, 2, 3, 4, 5].map(i => (
                <View key={i} style={styles.helpSection}>
                  <Text style={[styles.helpSectionTitle, { color: theme.colors.primary }]}>
                    {t(`exposureLabHelp.section${i}.title`)}
                  </Text>
                  {(
                    t(`exposureLabHelp.section${i}.content`, { returnObjects: true }) as string[]
                  ).map((line, index) => (
                    <Text key={index} style={[styles.helpText, { color: theme.colors.text }]}>
                      • {line}
                    </Text>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    presetCard: {
      marginBottom: Layout.spacing.md,
      padding: Layout.spacing.md,
    },
    presetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Layout.spacing.sm,
    },
    presetTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Layout.spacing.xs,
    },
    presetTitle: {
      fontSize: Layout.fontSize.xs,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    presetName: {
      fontSize: Layout.fontSize.lg,
      fontWeight: '600',
      marginBottom: Layout.spacing.sm,
    },
    presetDetailsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Layout.spacing.md,
    },
    presetDetailText: {
      fontSize: Layout.fontSize.sm,
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
    autoAdjustHint: {
      fontSize: 11,
      marginLeft: Layout.spacing.xs,
      fontStyle: 'italic',
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
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      borderRadius: 20,
      padding: Layout.spacing.lg,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Layout.spacing.md,
    },
    modalTitle: {
      fontSize: Layout.fontSize.lg,
      fontWeight: 'bold',
    },
    helpSection: {
      marginBottom: Layout.spacing.md,
    },
    helpSectionTitle: {
      fontSize: Layout.fontSize.base,
      fontWeight: 'bold',
      marginBottom: Layout.spacing.xs,
    },
    helpText: {
      fontSize: Layout.fontSize.sm,
      marginBottom: 4,
      lineHeight: 20,
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
