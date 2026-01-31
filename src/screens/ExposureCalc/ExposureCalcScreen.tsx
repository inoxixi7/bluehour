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
import { Dropdown } from '../../components/common/Dropdown';
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
  const { presets, activePreset, setActivePreset } = useUserPresets();

  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [aperture, setAperture] = useState(8);
  const [shutter, setShutter] = useState(1 / 4);
  const [iso, setISO] = useState(100);

  // 独立锁定状态：每个参数可以独立锁定
  // 胶片模式下 ISO 锁定，用户可选择锁定光圈或快门
  const [lockedParams, setLockedParams] = useState<Set<'aperture' | 'shutter' | 'iso'>>(
    new Set(['iso'])  // 默认只锁定 ISO（胶片模式友好）
  );

  // EV锁定（场景亮度锁定）
  const [targetEV, setTargetEV] = useState<number | null>(null);
  const [evLocked, setEvLocked] = useState(false);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);

  const [ndStops, setNdStops] = useState(0);

  const sceneCards = EV_SCENES;
  
  // 场景选项
  const sceneOptions = useMemo(() => {
    return [
      { label: t('calculator.exposureLab.noScene'), value: -1 },
      ...sceneCards.map((scene, idx) => ({
        label: `${scene.icon} ${t(scene.descriptionKey)}`,
        value: idx,
      })),
    ];
  }, [sceneCards, t]);
  
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

  // 应用预设
  useEffect(() => {
    // 这里暂时不自动应用预设的ISO锁定
    // 用户可以通过预设中定义的默认值来初始化参数
  }, [activePreset]);

  const handleParamChange = (param: 'aperture' | 'shutter' | 'iso', value: number) => {
    const allParams: ('aperture' | 'shutter' | 'iso')[] = ['aperture', 'shutter', 'iso'];
    const otherParams = allParams.filter(p => p !== param);
    const lockedOthers = otherParams.filter(p => lockedParams.has(p));
    const unlockedOthers = otherParams.filter(p => !lockedParams.has(p));

    // 情况1：EV锁定模式
    if (evLocked && targetEV !== null) {
      // 需要找一个可调整的参数来维持目标EV
      // 优先调整未锁定的参数
      let adjustParam: 'aperture' | 'shutter' | 'iso' | null = null;
      
      if (unlockedOthers.length > 0) {
        // 有未锁定的其他参数，优先调整快门（最常见的调整项）
        adjustParam = unlockedOthers.includes('shutter') ? 'shutter' : unlockedOthers[0];
      } else if (lockedOthers.length > 0) {
        // 所有其他参数都锁定了，无法维持EV，提示用户
        // 但仍然允许调整，EV会变化
        const newValues = { aperture, shutter, iso };
        newValues[param] = value;
        setAperture(newValues.aperture);
        setShutter(newValues.shutter);
        setISO(newValues.iso);
        return;
      }

      if (adjustParam) {
        // 找一个作为「保持不变」的参考参数（被锁定的优先）
        const keepParam = lockedOthers[0] || (unlockedOthers.find(p => p !== adjustParam) ?? adjustParam);
        
        const result = calculateEquivalentExposureWithEV(targetEV, param, value, keepParam, {
          aperture,
          shutter,
          iso,
        });

        if (result) {
          setAperture(result.aperture);
          setShutter(result.shutter);
          setISO(result.iso);
        }
      }
      return;
    }

    // 情况2：普通模式（无EV锁定）
    // 如果其他两个都锁定，直接改变当前参数，EV会变化
    if (lockedOthers.length === 2) {
      const newValues = { aperture, shutter, iso };
      newValues[param] = value;
      setAperture(newValues.aperture);
      setShutter(newValues.shutter);
      setISO(newValues.iso);
      return;
    }

    // 如果有1个锁定的其他参数，调整未锁定的那个来保持EV
    if (lockedOthers.length === 1 && unlockedOthers.length === 1) {
      const result = calculateEquivalentExposure(
        { aperture, shutter, iso },
        param,
        value,
        lockedOthers[0]
      );
      setAperture(result.aperture);
      setShutter(result.shutter);
      setISO(result.iso);
      return;
    }

    // 如果没有其他参数被锁定，优先调整快门来保持EV
    if (lockedOthers.length === 0) {
      const adjustParam = unlockedOthers.includes('shutter') ? 'shutter' : unlockedOthers[0];
      const keepParam = unlockedOthers.find(p => p !== adjustParam)!;
      
      // 保持 keepParam 不变，调整 adjustParam
      const result = calculateEquivalentExposure(
        { aperture, shutter, iso },
        param,
        value,
        keepParam
      );
      setAperture(result.aperture);
      setShutter(result.shutter);
      setISO(result.iso);
    }
  };

  // 处理ND滤镜改变
  const handleNdChange = (stops: number) => {
    const oldNdStops = ndStops;
    setNdStops(stops);
    
    // ND滤镜只影响显示的最终快门速度，不应该改变EV或其他参数
    // 因为ND滤镜是在相机前加的，不影响测光
    // 所以这里不需要调整任何曝光参数
  };

  const handleSceneSelect = (sceneIndex: number) => {
    if (sceneIndex === -1) {
      // 取消场景选择
      setSelectedSceneIndex(null);
      setEvLocked(false);
      setTargetEV(null);
      return;
    }
    
    const scene = sceneCards[sceneIndex];

    if (selectedSceneIndex === sceneIndex && evLocked) {
      // 如果再次点击同一个场景，取消EV锁定
      setSelectedSceneIndex(null);
      setEvLocked(false);
      setTargetEV(null);
    } else {
      // 选择新场景
      setSelectedSceneIndex(sceneIndex);
      setTargetEV(scene.ev);
      setEvLocked(true);

      // 根据当前锁定的参数，计算其他参数以达到目标EV
      const allParams = ['aperture', 'shutter', 'iso'] as const;
      const lockedList = allParams.filter(p => lockedParams.has(p));

      if (lockedList.length >= 2) {
        // 如果有两个参数被锁定，计算第三个参数
        const freeParam = allParams.find(p => !lockedParams.has(p))!;
        
        // 使用第一个锁定参数作为changedParam（值不变），第二个作为lockedParam
        const result = calculateEquivalentExposureWithEV(
          scene.ev,
          lockedList[0],
          lockedList[0] === 'aperture' ? aperture : lockedList[0] === 'shutter' ? shutter : iso,
          lockedList[1],
          { aperture, shutter, iso }
        );
        
        if (result) {
          setAperture(result.aperture);
          setShutter(result.shutter);
          setISO(result.iso);
        }
      } else if (lockedList.length === 1) {
        // 只有一个参数被锁定（典型：胶片模式下ISO锁定）
        // 优先调整快门来达到目标EV
        const lockedParam = lockedList[0];
        const freeParams = allParams.filter(p => !lockedParams.has(p));
        
        // keepParam保持当前值，adjustParam会被计算
        const keepParam = freeParams.includes('aperture') ? 'aperture' : freeParams[0];
        
        const result = calculateEquivalentExposureWithEV(
          scene.ev,
          keepParam,
          keepParam === 'aperture' ? aperture : keepParam === 'shutter' ? shutter : iso,
          lockedParam,
          { aperture, shutter, iso }
        );
        
        if (result) {
          setAperture(result.aperture);
          setShutter(result.shutter);
          setISO(result.iso);
        }
      } else {
        // 没有参数锁定，保持光圈和ISO不变，调整快门
        const result = calculateEquivalentExposureWithEV(
          scene.ev,
          'aperture',  // 保持光圈不变
          aperture,
          'iso',       // ISO作为参考（但也会保持不变，因为调整的是快门）
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
    const allParams = ['aperture', 'shutter', 'iso'] as const;
    const otherParams = allParams.filter(p => p !== param);
    const lockedOthers = otherParams.filter(p => lockedParams.has(p));
    const unlockedOthers = otherParams.filter(p => !lockedParams.has(p));
    
    // 判断是否显示 "会自动调整"
    // 情况1: 其他两个参数都锁定 -> 此参数是唯一自由变量，会根据EV自动计算
    // 情况2: EV锁定 + 此参数未锁定 + 有1个其他参数锁定 -> 调整另一个时此参数会自动补偿
    //        但如果是快门且光圈未锁，我们优先调快门，所以快门是auto
    let isAuto = false;
    if (!isLocked) {
      if (lockedOthers.length === 2) {
        // 其他两个都锁定，此参数必然是自动计算的
        isAuto = true;
      } else if (evLocked && lockedOthers.length === 1) {
        // EV锁定+1个参数锁定：未锁定的参数中，优先调整快门
        // 所以如果此参数是快门，它是auto；否则不是
        if (param === 'shutter') {
          isAuto = true;
        } else if (!unlockedOthers.includes('shutter')) {
          // 快门被锁了，那就调整此参数
          isAuto = true;
        }
      }
    }

    const toggleLock = () => {
      setLockedParams(prev => {
        const next = new Set(prev);
        if (next.has(param)) {
          // 解锁该参数
          next.delete(param);
          
          // 检查：如果EV锁定且所有参数都解锁了，至少保留一个锁
          // 否则无法确定曝光组合
          if (evLocked && next.size === 0) {
            // 保持至少一个锁定（优先保持ISO锁定）
            next.add('iso');
          }
        } else {
          // 锁定该参数
          // 检查：如果已经锁定了2个参数，再锁定第三个会导致系统过约束
          // 此时需要解锁一个其他参数
          if (next.size >= 2) {
            // 优先解锁非ISO的参数
            const toUnlock = Array.from(next).find(p => p !== 'iso') || Array.from(next)[0];
            next.delete(toUnlock);
          }
          next.add(param);
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
      {/* 场景预设和ND Filter选择器 - 并排显示 */}
      <View style={styles.topControlsRow}>
        <View style={[styles.controlHalf, styles.controlHalfLeft]}>
          <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>
            {t('calculator.exposureLab.sceneValues')}
          </Text>
          <Dropdown
            options={sceneOptions}
            selectedValue={selectedSceneIndex ?? -1}
            onValueChange={handleSceneSelect}
            placeholder={t('calculator.exposureLab.noScene')}
            textColor={colors.text}
            backgroundColor={colors.card}
            borderColor={colors.border}
            accentColor={theme.colors.primary}
          />
        </View>
        <View style={[styles.controlHalf, styles.controlHalfRight]}>
          <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>
            ND Filter
          </Text>
          <Dropdown
            options={ndOptions.map(o => ({ label: o.name, value: o.stops }))}
            selectedValue={ndStops}
            onValueChange={handleNdChange}
            placeholder="None"
            textColor={colors.text}
            backgroundColor={colors.card}
            borderColor={colors.border}
            accentColor={theme.colors.primary}
          />
        </View>
      </View>

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

      {/* Reciprocity Button */}
      <Touchable
        onPress={() => navigation.navigate('ReciprocityCalc', { 
          initialShutter: ndStops > 0 ? ndAdjustedShutter : shutter 
        })}
        style={[styles.reciprocityButton, { backgroundColor: colors.primary }]}
      >
        <Ionicons name="arrow-forward-circle-outline" size={20} color="#fff" />
        <Text style={styles.reciprocityButtonText}>
          {t('calculator.exposureLab.toReciprocity')}
        </Text>
      </Touchable>

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
  topControlsRow: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
    zIndex: 100,
  },
  controlHalf: {
    flex: 1,
    zIndex: 1,
  },
  controlHalfLeft: {
    paddingRight: Layout.spacing.xs,
    zIndex: 2,
  },
  controlHalfRight: {
    paddingLeft: Layout.spacing.xs,
    zIndex: 1,
  },
  controlLabel: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.xs,
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
  reciprocityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.xs,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    marginBottom: Layout.spacing.md,
  },
  reciprocityButtonText: {
    color: '#fff',
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
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
