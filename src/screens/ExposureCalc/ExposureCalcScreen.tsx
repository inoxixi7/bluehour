import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserPresets } from '../../hooks/useUserPresets';
import { Layout } from '../../constants/Layout';
import { Card } from '../../components/common/Card';
import { Touchable } from '../../components/common/Touchable';
import { Dropdown } from '../../components/common/Dropdown';
import { ExposureScaleRow } from '../../components/Exposure/ExposureScaleRow';
import {
  APERTURE_VALUES,
  SHUTTER_SPEEDS,
  ISO_VALUES,
  ND_FILTERS,
  EV_SCENES,
  RECIPROCITY_PROFILES,
} from '../../constants/Photography';
import {
  calculateEquivalentExposureWithEV,
  calculateEV,
  calculateNDShutter,
  applyReciprocityCorrection,
} from '../../utils/photographyCalculations';
import { formatEV, formatShutterSpeed } from '../../utils/formatters';

type ExposureParam = 'aperture' | 'shutter' | 'iso';

const ExposureCalcScreen: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { activePreset } = useUserPresets();

  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [aperture, setAperture] = useState(8);
  const [shutter, setShutter] = useState(1 / 4);
  const [iso, setISO] = useState(100);

  // EV锁定
  const [targetEV, setTargetEV] = useState<number | null>(() => calculateEV(8, 1 / 4, 100));
  const [evLocked, setEvLocked] = useState(true);
  const [selectedSceneIndex, setSelectedSceneIndex] = useState<number | null>(null);

  const [ndStops, setNdStops] = useState(0);
  const [profileId, setProfileId] = useState('digital');

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

  const filmOptions = useMemo(
    () =>
      RECIPROCITY_PROFILES.map((profile, idx) => ({
        label: t(profile.nameKey),
        value: idx,
        isDigital: profile.id === 'digital',
      }))
        .sort((a, b) => {
          if (a.isDigital) return -1;
          if (b.isDigital) return 1;
          return a.label.localeCompare(b.label);
        })
        .map(({ label, value }) => ({ label, value })),
    [t]
  );

  const currentEV = useMemo(() => calculateEV(aperture, shutter, iso), [aperture, shutter, iso]);
  const ndAdjustedShutter = useMemo(() => calculateNDShutter(shutter, ndStops), [shutter, ndStops]);
  const reciprocityProfile = RECIPROCITY_PROFILES.find(profile => profile.id === profileId);
  const reciprocityCorrected = useMemo(
    () =>
      applyReciprocityCorrection(
        ndAdjustedShutter,
        reciprocityProfile?.curve,
        reciprocityProfile?.segmentParams
      ),
    [ndAdjustedShutter, reciprocityProfile]
  );
  const selectedFilmIndex = RECIPROCITY_PROFILES.findIndex(profile => profile.id === profileId);

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

  const syncShutterForEV = (nextAperture: number, nextIso = iso, ev = targetEV ?? currentEV) => {
    const result = calculateEquivalentExposureWithEV(ev, 'aperture', nextAperture, 'iso', {
      aperture,
      shutter,
      iso: nextIso,
    });
    return result?.shutter ?? shutter;
  };

  const syncApertureForEV = (nextShutter: number, nextIso = iso, ev = targetEV ?? currentEV) => {
    const result = calculateEquivalentExposureWithEV(ev, 'shutter', nextShutter, 'iso', {
      aperture,
      shutter,
      iso: nextIso,
    });
    return result?.aperture ?? aperture;
  };

  const handleParamChange = (param: ExposureParam, value: number) => {
    if (!evLocked) {
      if (param === 'aperture') setAperture(value);
      if (param === 'shutter') setShutter(value);
      if (param === 'iso') setISO(value);
      return;
    }

    if (param === 'aperture') {
      setAperture(value);
      setShutter(syncShutterForEV(value));
      return;
    }

    if (param === 'shutter') {
      setShutter(value);
      setAperture(syncApertureForEV(value));
      return;
    }

    setISO(value);
    setShutter(syncShutterForEV(aperture, value));
  };

  // 处理ND滤镜改变
  const handleNdChange = (stops: number) => {
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
      setShutter(syncShutterForEV(aperture, iso, scene.ev));
    }
  };

  const handleFilmChange = (index: number) => {
    const profile = RECIPROCITY_PROFILES[index];
    if (profile) {
      setProfileId(profile.id);
    }
  };

  const colors = theme.colors;
  const apertureOptions = APERTURE_VALUES.map(v => ({ value: v, label: `f/${v}` }));
  const shutterOptions = SHUTTER_SPEEDS.map(item => ({
    value: item.value,
    label: item.label.replace('min', 'm'),
  }));
  const isoOptions = ISO_VALUES.map(v => ({ value: v, label: `${v}` }));

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
      <View style={styles.evBadge}>
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
      </View>

      {/* Parameters */}
      <View style={styles.scaleDeck}>
        <View
          style={[styles.centerGuide, { backgroundColor: colors.primary }]}
          pointerEvents="none"
        />
        <View
          style={[styles.centerGuideDot, { backgroundColor: colors.primary }]}
          pointerEvents="none"
        />
        <View style={styles.scaleCouplingHeader}>
          <Text style={[styles.scaleDeckTitle, { color: colors.text }]}>
            {evLocked ? t('calculator.exposureLab.lock') : t('calculator.exposureLab.unlock')} EV
          </Text>
          <Text style={[styles.scaleDeckMeta, { color: colors.textSecondary }]}>
            {evLocked ? formatEV(targetEV ?? currentEV) : formatEV(currentEV)}
          </Text>
        </View>
        <ExposureScaleRow
          label={t('calculator.exposureLab.aperture')}
          value={aperture}
          options={apertureOptions}
          onValueChange={val => handleParamChange('aperture', val)}
          textColor={colors.text}
          mutedColor={colors.textSecondary}
          accentColor={colors.primary}
        />
        <ExposureScaleRow
          label={t('calculator.exposureLab.shutter')}
          value={shutter}
          options={shutterOptions}
          onValueChange={val => handleParamChange('shutter', val)}
          textColor={colors.text}
          mutedColor={colors.textSecondary}
          accentColor={colors.primary}
        />
      </View>

      <View style={styles.isoScale}>
        <ExposureScaleRow
          label={t('calculator.exposureLab.iso')}
          value={iso}
          options={isoOptions}
          onValueChange={val => handleParamChange('iso', val)}
          textColor={colors.text}
          mutedColor={colors.textSecondary}
          accentColor={colors.accent}
          compact
        />
      </View>

      <View style={styles.reciprocityControl}>
        <Text style={[styles.controlLabel, { color: colors.textSecondary }]}>
          {t('calculator.exposureLab.reciprocity.filmProfile')}
        </Text>
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
      </View>

      {/* Result */}
      <Card style={[styles.resultCard, { backgroundColor: colors.card }]}>
        <View style={styles.exposureResultGrid}>
          <View style={styles.exposureResultItem}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              {t('calculator.exposureLab.resultBase')}
            </Text>
            <Text style={[styles.resultValueSmall, { color: colors.text }]}>
              {formatShutterSpeed(shutter)}
            </Text>
          </View>
          <View style={styles.exposureResultItem}>
            <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
              {t('calculator.exposureLab.resultNd')}
            </Text>
            <Text style={[styles.resultValueSmall, { color: colors.text }]}>
              {formatShutterSpeed(ndAdjustedShutter)}
            </Text>
          </View>
        </View>
        <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>
          {t('calculator.exposureLab.resultReciprocity')}
        </Text>
        <Text style={[styles.finalValue, { color: colors.accent }]}>
          {formatShutterSpeed(reciprocityCorrected)}
        </Text>
      </Card>

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
  scaleDeck: {
    position: 'relative',
    marginBottom: Layout.spacing.md,
    paddingVertical: Layout.spacing.md,
    overflow: 'hidden',
  },
  scaleCouplingHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.xs,
  },
  scaleDeckTitle: {
    fontSize: Layout.fontSize.base,
    fontWeight: '700',
    letterSpacing: 0,
  },
  scaleDeckMeta: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  centerGuide: {
    position: 'absolute',
    top: 46,
    bottom: 28,
    left: '50%',
    width: 2,
    marginLeft: -1,
    opacity: 0.86,
    zIndex: 5,
  },
  centerGuideDot: {
    position: 'absolute',
    left: '50%',
    top: 136,
    width: 10,
    height: 10,
    marginLeft: -5,
    borderRadius: 5,
    zIndex: 6,
  },
  isoScale: {
    marginBottom: Layout.spacing.md,
    overflow: 'hidden',
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
  coupledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Layout.borderRadius.sm,
    backgroundColor: 'rgba(128,128,128,0.1)',
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
  reciprocityControl: {
    marginBottom: Layout.spacing.md,
    zIndex: 10,
  },
  resultCard: {
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.lg,
    alignItems: 'center',
    borderRadius: Layout.borderRadius.lg,
  },
  exposureResultGrid: {
    flexDirection: 'row',
    width: '100%',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  exposureResultItem: {
    flex: 1,
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
  finalValue: {
    fontSize: 48,
    fontWeight: '700',
    marginVertical: Layout.spacing.sm,
  },
  resultValueSmall: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    marginTop: Layout.spacing.xs,
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
