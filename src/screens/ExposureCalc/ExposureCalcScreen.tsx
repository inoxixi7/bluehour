import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from '../../navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';
import { Card } from '../../components/common/Card';
import { HorizontalScrollPicker } from '../../components/common/HorizontalScrollPicker';
import { Touchable } from '../../components/common/Touchable';
import { Dropdown } from '../../components/common/Dropdown';
import { HelpSections } from '../../components/common/HelpSections';
import {
  APERTURE_VALUES,
  SHUTTER_SPEEDS,
  ISO_VALUES,
  ND_FILTERS,
  EV_SCENES,
} from '../../constants/Photography';
import { calculateEV, calculateNDShutter } from '../../utils/photographyCalculations';
import {
  applyParamChange,
  applyTargetEV,
  ExposureParam,
  ExposureValues,
  isAutoAdjusted,
  toggleParamLock,
} from '../../utils/exposureLocks';
import { formatEV, formatShutterSpeed } from '../../utils/formatters';

const ExposureCalcScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();

  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [values, setValues] = useState<ExposureValues>({ aperture: 8, shutter: 1 / 4, iso: 100 });
  const { aperture, shutter, iso } = values;

  // 独立锁定状态：每个参数可以独立锁定
  // 胶片模式下 ISO 锁定，用户可选择锁定光圈或快门
  const [lockedParams, setLockedParams] = useState<Set<ExposureParam>>(
    new Set(['iso']) // 默认只锁定 ISO（胶片模式友好）
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

  const handleParamChange = (param: ExposureParam, value: number) => {
    setValues(applyParamChange(values, param, value, lockedParams, evLocked ? targetEV : null));
  };

  // 处理ND滤镜改变
  // ND 滤镜只影响最终快门速度，不改变测光得到的 EV 或其他参数
  const handleNdChange = (stops: number) => {
    setNdStops(stops);
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
      // 选择新场景：锁定目标 EV，并按当前锁定的参数计算出达到它的组合
      setSelectedSceneIndex(sceneIndex);
      setTargetEV(scene.ev);
      setEvLocked(true);
      setValues(applyTargetEV(values, scene.ev, lockedParams));
    }
  };

  const renderParamPicker = (
    param: ExposureParam,
    value: number,
    items: { label: string; value: number }[]
  ) => {
    const isLocked = lockedParams.has(param);
    const isAuto = isAutoAdjusted(param, lockedParams, evLocked);
    const toggleLock = () => setLockedParams(prev => toggleParamLock(prev, param, evLocked));

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
            {t('calculator.ndTitle')}
          </Text>
          <Dropdown
            options={ndOptions.map(o => ({ label: o.name, value: o.stops }))}
            selectedValue={ndStops}
            onValueChange={handleNdChange}
            placeholder={t('calculator.exposureLab.ndNone')}
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
        onPress={() =>
          navigation.navigate('ReciprocityCalc', {
            initialShutter: ndStops > 0 ? ndAdjustedShutter : shutter,
          })
        }
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
              <HelpSections
                i18nPrefix="exposureLabHelp"
                sectionCount={5}
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
});

export default ExposureCalcScreen;
