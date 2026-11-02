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
import {
  calculateEV,
  calculateNDShutter,
  ExposureParam,
  ExposureValues,
  solveExposure,
} from '../../utils/photographyCalculations';
import { formatEV, formatShutterSpeed } from '../../utils/formatters';

const EV_MIN = -6;
const EV_MAX = 20;

const ExposureCalcScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<RootStackNavigationProp>();

  const [helpModalVisible, setHelpModalVisible] = useState(false);
  // 手动参数的值；自动参数的值由 solveExposure 算出
  const [values, setValues] = useState<ExposureValues>({ aperture: 8, shutter: 1 / 4, iso: 100 });
  // 场景亮度，调参数时保持不变
  const [ev, setEv] = useState(() => calculateEV(8, 1 / 4, 100));
  // 自动计算的参数，默认快门（相当于光圈优先）
  const [autoParam, setAutoParam] = useState<ExposureParam>('shutter');
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

  const solved = useMemo(() => solveExposure(ev, autoParam, values), [ev, autoParam, values]);
  const { aperture, shutter, iso } = solved.values;
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
    setValues({ ...solved.values, [param]: value });
  };

  const selectAutoParam = (param: ExposureParam) => {
    setValues(solved.values);
    setAutoParam(param);
  };

  const stepEv = (delta: number) => {
    setEv(prev => Math.min(EV_MAX, Math.max(EV_MIN, Math.round(prev + delta))));
    setSelectedSceneIndex(null);
  };

  const handleSceneSelect = (sceneIndex: number) => {
    if (sceneIndex === -1) {
      setSelectedSceneIndex(null);
      return;
    }
    setSelectedSceneIndex(sceneIndex);
    setEv(sceneCards[sceneIndex].ev);
  };

  const renderParamPicker = (
    param: ExposureParam,
    value: number,
    items: { label: string; value: number }[]
  ) => {
    const isAuto = param === autoParam;

    return (
      <View style={styles.paramBlock}>
        <View style={styles.paramLabelRow}>
          <Text style={[styles.paramLabel, { color: theme.colors.textSecondary }]}>
            {t(`calculator.exposureLab.${param}`)}
          </Text>
          <Touchable
            onPress={() => selectAutoParam(param)}
            style={[
              styles.autoChip,
              isAuto
                ? { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent }
                : { borderColor: theme.colors.border },
            ]}
          >
            <Text
              style={[styles.autoChipText, { color: isAuto ? '#fff' : theme.colors.textSecondary }]}
            >
              {t('calculator.exposureLab.auto')}
            </Text>
          </Touchable>
        </View>

        {/* 自动参数只显示结果，不能拖动 */}
        <View style={styles.pickerContainer} pointerEvents={isAuto ? 'none' : 'auto'}>
          <HorizontalScrollPicker
            label=""
            options={items}
            selectedValue={value}
            onValueChange={val => handleParamChange(param, val)}
            textColor={isAuto ? theme.colors.accent : theme.colors.text}
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
            onValueChange={setNdStops}
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
          <Text style={[styles.evBadgeValue, { color: colors.text }]}>{formatEV(ev)}</Text>
        </View>
        <View style={styles.evButtons}>
          {[-1, 1].map(delta => (
            <Touchable
              key={delta}
              onPress={() => stepEv(delta)}
              style={[styles.evButton, { borderColor: colors.border }]}
            >
              <Ionicons name={delta < 0 ? 'remove' : 'add'} size={20} color={colors.text} />
            </Touchable>
          ))}
        </View>
      </Card>

      {solved.outOfRangeStops !== 0 && (
        <Text style={[styles.warning, { color: colors.error }]}>
          {t(
            solved.outOfRangeStops > 0
              ? 'calculator.exposureLab.overexposed'
              : 'calculator.exposureLab.underexposed',
            { stops: Math.abs(solved.outOfRangeStops) }
          )}
        </Text>
      )}

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
  evButtons: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
  },
  evButton: {
    padding: Layout.spacing.xs,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.sm,
  },
  warning: {
    fontSize: Layout.fontSize.sm,
    marginTop: -Layout.spacing.sm,
    marginBottom: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.xs,
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
  autoChip: {
    paddingVertical: 2,
    paddingHorizontal: Layout.spacing.sm,
    borderWidth: 1,
    borderRadius: 12,
  },
  autoChipText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
  pickerContainer: {
    height: 80,
    justifyContent: 'center',
    position: 'relative',
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
