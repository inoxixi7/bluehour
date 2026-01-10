import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserPresets } from '../../hooks/useUserPresets';
import { Layout } from '../../constants/Layout';
import { Card } from '../../components/common/Card';
import { HorizontalScrollPicker } from '../../components/common/HorizontalScrollPicker';
import { Touchable } from '../../components/common/Touchable';
import {
  APERTURE_VALUES,
  SHUTTER_SPEEDS,
  ISO_VALUES,
  ND_FILTERS,
  EV_SCENES,
} from '../../constants/Photography';
import {
  calculateEquivalentExposure,
  calculateEquivalentExposureWithEV,
  calculateEV,
  calculateNDShutter,
} from '../../utils/photographyCalculations';
import { formatEV, formatShutterSpeed } from '../../utils/formatters';

const ExposureCalcScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { activePreset } = useUserPresets();

  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [aperture, setAperture] = useState(8);
  const [shutter, setShutter] = useState(1 / 4);
  const [iso, setISO] = useState(100);

  // 双锁定模式
  const [lockedParams, setLockedParams] = useState<Set<'aperture' | 'shutter' | 'iso'>>(
    new Set(['aperture', 'iso'])
  );

  // EV锁定
  const [targetEV, setTargetEV] = useState<number | null>(null);
  const [evLocked, setEvLocked] = useState(false);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);

  const [ndStops, setNdStops] = useState(0);

  const sceneCards = EV_SCENES;
  const ndOptions = useMemo(
    () => [
      { name: t('calculator.exposureLab.ndNone'), stops: 0 },
      ...ND_FILTERS.map(filter => ({ name: filter.name, stops: filter.stops })),
    ],
    [t]
  );

  const currentEV = useMemo(() => calculateEV(aperture, shutter, iso), [aperture, shutter, iso]);
  const ndAdjustedShutter = useMemo(() => calculateNDShutter(shutter, ndStops), [shutter, ndStops]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: t('calculator.exposureLab.title'), // 将来可能改名为 Exposure Calculator
      headerRight: () => (
        <Touchable onPress={() => setHelpModalVisible(true)} style={{ marginRight: 16 }}>
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.primary} />
        </Touchable>
      ),
    });
  }, [navigation, theme.colors.primary, t]);

  // 应用预设：如果是胶卷，锁定ISO
  useEffect(() => {
    if (activePreset?.useFilm && activePreset.filmStock) {
      setISO(activePreset.filmStock.iso);

      // 强制锁定 ISO
      setLockedParams(prev => {
        if (prev.has('iso')) return prev;

        const newLocked = new Set(prev);
        newLocked.add('iso');

        if (newLocked.has('shutter')) {
          newLocked.delete('shutter');
        } else if (newLocked.has('aperture')) {
          newLocked.delete('aperture');
        }
        return newLocked;
      });
    }
  }, [activePreset]);

  const handleParamChange = (param: 'aperture' | 'shutter' | 'iso', value: number) => {
    const allParams: ('aperture' | 'shutter' | 'iso')[] = ['aperture', 'shutter', 'iso'];
    let currentLockedParams = lockedParams;
    const unlockedParams = allParams.filter(p => !currentLockedParams.has(p));

    if (unlockedParams.length === 0) {
      return;
    }

    // EV锁定模式
    if (evLocked && targetEV !== null) {
      const otherParams = allParams.filter(p => p !== param);
      // 优先选择 ISO 作为固定的参数（如果它在其他参数中且已被锁定）
      let lockedOther = otherParams.find(p => p === 'iso' && currentLockedParams.has(p));

      if (!lockedOther) {
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
      }
    } else {
      // 普通模式
      const otherParams = allParams.filter(p => p !== param);
      const allOthersLocked = otherParams.every(p => currentLockedParams.has(p));

      // 如果其他两个都被锁定（意味着用户正在调整唯一未锁定的参数）
      // 直接更新，允许 EV 变化
      if (allOthersLocked || !otherParams.find(p => currentLockedParams.has(p))) {
        const newValues = { aperture, shutter, iso };
        newValues[param] = value;
        setAperture(newValues.aperture);
        setShutter(newValues.shutter);
        setISO(newValues.iso);
        return;
      }

      const lockedOther = otherParams.find(p => currentLockedParams.has(p))!;

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

    if (selectedSceneIndex === sceneIndex && evLocked) {
      setSelectedSceneIndex(null);
      setEvLocked(false);
      setTargetEV(null);
    } else {
      setSelectedSceneIndex(sceneIndex);
      setTargetEV(scene.ev);
      setEvLocked(true);

      // 更新参数以匹配目标 EV
      // 我们需要决定调整哪个参数。在双锁定模式下，通常只有1个自由参数。
      // 但 EV 改变必然导致所有参数（除非锁定）变化。
      // 这里简化逻辑：我们尝试保持光圈和 ISO 不变（如果可能），调整快门。
      // 或者遵循当前的锁定逻辑？

      // 这里的逻辑：直接算出一个合理的组合。
      // 我们可以复用 calculateEquivalentExposureWithEV，但这需要在"调整EV"而不是"调整参数"的情境下。
      // 简单起见，我们假设用户想要在这个场景的 EV 下，保持当前的 光圈和ISO（如果它们被锁或合理），调整快门。

      // 我们使用当前的 lockedParams 逻辑
      // 如果 Shutter 是未锁定的，那就最好。

      // 为了应用新的 EV，我们虚拟地改变一个被锁定的参数的值（不，这样不对）。
      // 其实我们只需要根据当前的两个锁定参数，算出第三个参数即可。
      // 找到两个锁定参数
      const allParams = ['aperture', 'shutter', 'iso'] as const;
      const lockedList = allParams.filter(p => lockedParams.has(p));

      if (lockedList.length >= 2) {
        // 两个都锁了，那就算第三个
        const p1 = lockedList[0];
        // const p2 = lockedList[1];

        // 使用 calculateEquivalentExposureWithEV，这里有一点 tricky
        // 该函数是：保持 EV 不变，改变 param，求另一个。
        // 现在我们也想要达成 目标 EV。
        // 我们可以伪造一个调用：
        // 我们想求 target 的值。
        // 已知 EV，已知 lockedList[0] (p1) 和 lockedList[1] (p2)。
        // 等等，calculateEquivalentExposureWithEV 需要 "changedParam" 和 "lockedParam"。
        // 如果我们把 p1 当作 lockedParam，把 p2 当作 changedParam (值不变)，
        // 可是我们不想改变 p2。

        // 其实很简单：EV = log2(A^2/T) + log2(S/100)
        // 已知 EV, A, S -> 求 T?
        // 我们没有现成的 helper 来做 "已知EV和两个参数求第三个"。
        // 但 calculateEquivalentExposureWithEV(targetEV, p1, currentValue_of_p1, p2)
        // 它的意思是：我想让 EV 变成 targetEV，同时我想把 p1 设为 currentValue。且保持 p2 不变。
        // 这会算出第三个参数！
        // 对！就是这样。

        const result = calculateEquivalentExposureWithEV(
          scene.ev,
          p1,
          p1 === 'aperture' ? aperture : p1 === 'shutter' ? shutter : iso,
          lockedList[1],
          { aperture, shutter, iso }
        );
        if (result) {
          setAperture(result.aperture);
          setShutter(result.shutter);
          setISO(result.iso);
        }
      }
    }
  };

  const renderParamPicker = (
    param: 'aperture' | 'shutter' | 'iso',
    value: number,
    items: { label: string; value: number }[]
  ) => {
    const isLocked = lockedParams.has(param);
    // 判断是否显示 "会自动调整"
    // 如果该参数未锁定，且我们处于EV锁定模式，或者虽然不是EV锁定但另外两个都锁定了(所以它是唯一的自由变量)
    // 那么它就是"会自动调整"的。
    const allParams = ['aperture', 'shutter', 'iso'] as const;
    const otherParams = allParams.filter(p => p !== param);
    const othersLocked = otherParams.every(p => lockedParams.has(p));

    // 如果它是未锁定的，并且 (EV锁定开启 OR 其他两个都锁定)，那它就是那个被计算出来的结果
    // 注意：如果 EV锁定关闭 且 其他两个没全锁（比如只有1个锁），那调整它会导致 EV 变化，它其实是 Input。
    const isAuto = !isLocked && (evLocked || othersLocked);

    const toggleLock = () => {
      setLockedParams(prev => {
        const next = new Set(prev);
        if (next.has(param)) {
          // 尝试解锁
          // 必须得保留至少一个解锁的参数? 不，双锁定模式下，必须有且仅有2个锁定的。
          // 如果我们解锁这个，剩下就是1个锁定的。
          next.delete(param);

          // 为了维持双锁定（2个锁），我们需要锁定那个之前未锁定的参数。
          const currentUnlocked = allParams.find(p => !prev.has(p));
          if (currentUnlocked) {
            next.add(currentUnlocked);
          }
        } else {
          // 尝试锁定
          // 我们需要解锁另一个，以保持总数是2。
          // 优先解锁谁？
          // 假设我们不想动 ISO (如果是胶卷)。
          // 解锁除了 ISO 和 本参数 之外的那个。
          // 比如 Locked=[A, I], User clicks S (lock).
          // Param=S. Next=[A, I, S].
          // Remove A? then [I, S].
          // Remove I? then [A, S].
          // 如果 activePreset 是胶卷，优先保留 ISO 锁。

          next.add(param);
          // 找出其他的锁定参数
          const others = Array.from(prev).filter(p => p !== param);
          // others 应该有2个。
          // 我们要删掉一个。
          let toRemove = others[0];

          // 智能选择要移除的锁：
          // 如果 others 包含 ISO 且是胶卷模式，不要移除 ISO。
          if (activePreset?.useFilm) {
            const nonISO = others.find(p => p !== 'iso');
            if (nonISO) toRemove = nonISO; // 移除光圈或快门，保留 ISO
          } else {
            // 默认逻辑（比如移除快门，保留光圈？）
            // 或者移除列表里的第一个
          }
          next.delete(toRemove as any);
        }
        return next;
      });
    };

    return (
      <View style={styles.paramBlock}>
        <View style={styles.paramLabelRow}>
          <Text style={[styles.paramLabel, { color: theme.colors.textSecondary }]}>
            {t(`calculator.exposureLab.${param}`)}
          </Text>
          <Touchable
            onPress={toggleLock}
            style={[styles.lockButton, isLocked && styles.lockButtonActive]}
          >
            <Ionicons
              name={isLocked ? 'lock-closed' : 'lock-open-outline'}
              size={16}
              color={isLocked ? theme.colors.primary : theme.colors.textSecondary}
            />
          </Touchable>
        </View>

        <View style={styles.pickerContainer}>
          {isAuto && (
            <View style={styles.autoBadge}>
              <Ionicons name="stats-chart" size={12} color={theme.colors.textSecondary} />
              <Text style={[styles.autoText, { color: theme.colors.textSecondary }]}>
                {t('calculator.exposureLab.willAdjust')}
              </Text>
            </View>
          )}
          <HorizontalScrollPicker
            label=""
            options={items}
            selectedValue={value}
            onValueChange={val => handleParamChange(param, val)}
            textColor={
              isAuto ? theme.colors.accent : isLocked ? theme.colors.primary : theme.colors.text
            }
            accentColor={theme.colors.primary}
            disabledColor={theme.colors.textSecondary}
          />
        </View>
      </View>
    );
  };

  const colors = theme.colors;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* activePreset 卡片 ... (省略，保持不变) */}
      {activePreset && (
        <Touchable
          onPress={() => navigation.navigate('Settings', { screen: 'UserPresets' })}
          activeOpacity={0.9}
        >
          <Card style={[styles.presetCard, { backgroundColor: colors.card }]}>
            <View style={styles.presetHeader}>
              <View style={styles.presetTitleRow}>
                <Ionicons name="camera-outline" size={16} color={colors.primary} />
                <Text style={[styles.presetTitle, { color: colors.textSecondary }]}>
                  {t('settings.userPresets.currentPreset')}
                </Text>
              </View>
              <Touchable
                onPress={() => navigation.navigate('Settings', { screen: 'UserPresets' })}
                style={{ padding: 4 }}
              >
                <Ionicons name="settings-outline" size={16} color={colors.textSecondary} />
              </Touchable>
            </View>

            <Text style={[styles.presetName, { color: colors.text }]}>{activePreset.name}</Text>

            <View style={styles.presetDetailsRow}>
              {activePreset.camera && (
                <Text style={[styles.presetDetailText, { color: colors.textSecondary }]}>
                  📷 {activePreset.camera} {activePreset.lens ? `+ ${activePreset.lens}` : ''}
                </Text>
              )}
              {activePreset.useFilm && activePreset.filmStock && (
                <Text style={[styles.presetDetailText, { color: colors.textSecondary }]}>
                  🎞️ {activePreset.filmStock.name} (ISO {activePreset.filmStock.iso})
                </Text>
              )}
            </View>
          </Card>
        </Touchable>
      )}

      {/* EV Display */}
      <Card style={[styles.evBadge, { backgroundColor: colors.card }]}>
        <View>
          <Text style={[styles.evBadgeLabel, { color: colors.textSecondary }]}>EV</Text>
          <Text style={[styles.evBadgeValue, { color: colors.text }]}>{formatEV(currentEV)}</Text>
        </View>
        {evLocked ? (
          <Touchable
            onPress={() => {
              setEvLocked(false);
              setTargetEV(null);
              setSelectedSceneIndex(null);
            }}
            style={[styles.unlockButton, { borderColor: colors.error }]}
          >
            <Text style={[styles.unlockText, { color: colors.error }]}>
              {t('calculator.exposureLab.unlock')}
            </Text>
          </Touchable>
        ) : (
          <Touchable
            onPress={() => {
              setTargetEV(currentEV);
              setEvLocked(true);
            }}
            style={[styles.unlockButton, { borderColor: colors.success }]}
          >
            <Text style={[styles.unlockText, { color: colors.success }]}>
              {t('calculator.exposureLab.lock')}
            </Text>
          </Touchable>
        )}
      </Card>

      {/* Parameters */}
      <View style={styles.sectionCardContent}>
        {renderParamPicker(
          'aperture',
          aperture,
          APERTURE_VALUES.map(v => ({ value: v, label: `f/${v}` }))
        )}
        {renderParamPicker('shutter', shutter, SHUTTER_SPEEDS)}
        {renderParamPicker(
          'iso',
          iso,
          ISO_VALUES.map(v => ({ value: v, label: `ISO ${v}` }))
        )}
      </View>

      {/* Scenes */}
      <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {t('calculator.exposureLab.sceneValues')}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sceneScroll}>
          {sceneCards.map((scene, index) => {
            const isSelected = selectedSceneIndex === index;
            return (
              <Touchable
                key={index}
                onPress={() => handleSceneSelect(index)}
                style={[
                  styles.scenePill,
                  {
                    borderColor: isSelected ? colors.primary : colors.border,
                    backgroundColor: isSelected ? colors.primary + '10' : 'transparent',
                  },
                ]}
              >
                <Text style={styles.sceneEmoji}>{scene.icon}</Text>
                <View>
                  <Text style={[styles.sceneTitle, { color: colors.text }]}>
                    {t(scene.descriptionKey)}
                  </Text>
                  <Text style={[styles.sceneParams, { color: colors.textSecondary }]}>
                    Target EV {scene.ev}
                  </Text>
                </View>
              </Touchable>
            );
          })}
        </ScrollView>
      </View>

      {/* ND Filter */}
      <View style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>ND Filter</Text>
        <HorizontalScrollPicker
          label=""
          options={ndOptions.map(o => ({ value: o.stops, label: o.name }))}
          selectedValue={ndStops}
          onValueChange={setNdStops}
          textColor={colors.text}
          accentColor={theme.colors.primary}
          disabledColor={colors.textSecondary}
        />
      </View>

      {/* Result */}
      {ndStops > 0 && (
        <Card style={[styles.resultCard, { backgroundColor: colors.card }]}>
          <View style={styles.resultHeader}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              {t('calculator.exposureLab.resultNd')}
            </Text>
          </View>
          <Text style={[styles.finalValue, { color: colors.text }]}>
            {formatShutterSpeed(ndAdjustedShutter)}
          </Text>
        </Card>
      )}

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
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                {t('exposureLabHelp.title')}
              </Text>
              <Touchable onPress={() => setHelpModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Touchable>
            </View>
            <ScrollView>
              <Text style={[styles.modalText, { color: colors.text }]}>
                {t('exposureLabHelp.description')}
              </Text>
              {/* More help text... */}
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
  evBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
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
  sectionCard: {
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    marginBottom: Layout.spacing.md,
  },
  sectionCardContent: {
    marginBottom: Layout.spacing.md,
  },
  paramBlock: {
    marginBottom: Layout.spacing.sm,
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
    padding: 4,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  lockButtonActive: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  pickerContainer: {
    height: 80,
    justifyContent: 'center',
    position: 'relative',
  },
  compactPicker: {
    height: 80,
  },
  autoBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(128,128,128,0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  autoText: {
    fontSize: 10,
    fontStyle: 'italic',
  },
  sceneScroll: {
    marginHorizontal: -Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
  },
  scenePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginRight: Layout.spacing.sm,
    minWidth: 180,
  },
  sceneEmoji: {
    fontSize: 24,
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
    borderRadius: Layout.borderRadius.lg,
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
  finalValue: {
    fontSize: 48,
    fontWeight: '700',
    marginVertical: Layout.spacing.sm,
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
  modalText: {
    fontSize: Layout.fontSize.base,
    lineHeight: 24,
  },
});

export default ExposureCalcScreen;
