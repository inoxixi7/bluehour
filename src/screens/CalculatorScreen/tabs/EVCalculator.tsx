import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/common/Card';
import { useTheme } from '../../../contexts/ThemeContext';
import { Layout } from '../../../constants/Layout';
import { APERTURE_VALUES, SHUTTER_SPEEDS, ISO_VALUES, EV_SCENES, EVScene } from '../../../constants/Photography';
import { calculateEquivalentExposure, calculateEV } from '../../../utils/photographyCalculations';
import { formatEV, formatShutterSpeed } from '../../../utils/formatters';

const EVCalculator: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  
  // 统一的曝光设置
  const [aperture, setAperture] = useState(5.6);
  const [shutter, setShutter] = useState(1/125);
  const [iso, setISO] = useState(100);

  // 锁定的参数
  const [lockedParam, setLockedParam] = useState<'aperture' | 'shutter' | 'iso'>('iso');

  // 场景选择模态框
  const [showSceneModal, setShowSceneModal] = useState(false);

  // 实时计算等效曝光
  const recalculate = (
    changedParam: 'aperture' | 'shutter' | 'iso',
    newValue: number
  ) => {
    if (changedParam === lockedParam) return;

    const result = calculateEquivalentExposure(
      { aperture, shutter, iso },
      changedParam,
      newValue,
      lockedParam
    );

    setAperture(result.aperture);
    setShutter(result.shutter);
    setISO(result.iso);
  };

  const handleSceneSelect = (scene: EVScene) => {
    setAperture(scene.params.aperture);
    setShutter(scene.params.shutter);
    setISO(scene.params.iso);
    setShowSceneModal(false);
  };

  const currentEV = calculateEV(aperture, shutter, iso);
  
  const styles = createStyles(theme.colors);

  const renderParamControl = (
    param: 'aperture' | 'shutter' | 'iso',
    value: number,
    options: { label: string; value: number }[],
    label: string
  ) => {
    const isLocked = lockedParam === param;

    return (
      <View style={styles.paramContainer}>
        <View style={styles.paramHeader}>
          <Text style={[styles.paramLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
          <TouchableOpacity 
            onPress={() => setLockedParam(param)}
            style={[styles.lockButton, isLocked && styles.lockButtonActive]}
          >
            <Text style={styles.lockIcon}>{isLocked ? '🔒' : '🔓'}</Text>
          </TouchableOpacity>
        </View>
        
        <View style={[styles.pickerWrapper, isLocked && styles.pickerDisabled]}>
          <Picker
            selectedValue={value}
            onValueChange={(val) => recalculate(param, val)}
            style={styles.picker}
            itemStyle={{ color: theme.colors.text, fontSize: 16 }}
            dropdownIconColor={theme.colors.text}
            enabled={!isLocked}
          >
            {options.map(opt => (
              <Picker.Item key={opt.label} label={opt.label} value={opt.value} color={theme.colors.text} />
            ))}
          </Picker>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('calculator.ev.title')}</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {t('calculator.ev.description')}
        </Text>

        <Card style={styles.card}>
          <View style={styles.evDisplay}>
            <Text style={[styles.evLabel, { color: theme.colors.textSecondary }]}>EV</Text>
            <Text style={[styles.evValue, { color: theme.colors.primary }]}>{formatEV(currentEV)}</Text>
            
            <TouchableOpacity 
              style={[styles.sceneButton, { backgroundColor: theme.colors.backgroundSecondary }]}
              onPress={() => setShowSceneModal(true)}
            >
              <Text style={[styles.sceneButtonText, { color: theme.colors.primary }]}>
                📷 {t('calculator.ev.selectScene')}
              </Text>
            </TouchableOpacity>
          </View>

          {renderParamControl(
            'aperture', 
            aperture, 
            APERTURE_VALUES.map(v => ({ label: `f/${v}`, value: v })), 
            t('calculator.ev.aperture')
          )}

          {renderParamControl(
            'shutter', 
            shutter, 
            SHUTTER_SPEEDS, 
            t('calculator.ev.shutter')
          )}

          {renderParamControl(
            'iso', 
            iso, 
            ISO_VALUES.map(v => ({ label: `ISO ${v}`, value: v })), 
            t('calculator.ev.iso')
          )}

        </Card>

        {/* Scene Selection Modal */}
        <Modal
          visible={showSceneModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSceneModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {t('calculator.ev.selectScene')}
                </Text>
                <TouchableOpacity onPress={() => setShowSceneModal(false)}>
                  <Text style={[styles.closeButton, { color: theme.colors.textSecondary }]}>✕</Text>
                </TouchableOpacity>
              </View>
              
              <FlatList
                data={EV_SCENES}
                keyExtractor={(item) => item.ev.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.sceneItem, { borderBottomColor: theme.colors.divider }]}
                    onPress={() => handleSceneSelect(item)}
                  >
                    <View style={styles.sceneIconContainer}>
                      <Text style={styles.sceneIcon}>{item.icon}</Text>
                    </View>
                    <View style={styles.sceneInfo}>
                      <View style={styles.sceneHeaderRow}>
                        <Text style={[styles.sceneEv, { color: theme.colors.primary }]}>EV {item.ev}</Text>
                        <Text style={[styles.sceneDescription, { color: theme.colors.text }]}>{t(item.descriptionKey)}</Text>
                      </View>
                      <Text style={[styles.sceneParams, { color: theme.colors.textSecondary }]}>
                        f/{item.params.aperture} · {formatShutterSpeed(item.params.shutter)} · ISO {item.params.iso}
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    </ScrollView>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Layout.spacing.md,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.sm,
  },
  description: {
    fontSize: Layout.fontSize.base,
    marginBottom: Layout.spacing.lg,
  },
  card: {
    padding: Layout.spacing.md,
  },
  evDisplay: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider || '#e0e0e0',
  },
  evLabel: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
  },
  evValue: {
    fontSize: 48,
    fontWeight: 'bold',
    includeFontPadding: false,
  },
  sceneButton: {
    marginTop: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.round,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  sceneButtonText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: '600',
  },
  paramContainer: {
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
  lockButton: {
    padding: 4,
    borderRadius: 4,
  },
  lockButtonActive: {
    backgroundColor: colors.backgroundSecondary || '#f0f0f0',
  },
  lockIcon: {
    fontSize: 18,
  },
  pickerWrapper: {
    backgroundColor: colors.backgroundSecondary || '#f5f5f5',
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pickerDisabled: {
    opacity: 0.5,
    backgroundColor: '#e0e0e0',
  },
  picker: {
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    padding: Layout.spacing.md,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  modalTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 24,
    padding: Layout.spacing.xs,
  },
  sceneItem: {
    flexDirection: 'row',
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  sceneIconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
    backgroundColor: colors.backgroundSecondary,
    borderRadius: Layout.borderRadius.round,
  },
  sceneIcon: {
    fontSize: 24,
  },
  sceneInfo: {
    flex: 1,
  },
  sceneHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  sceneEv: {
    fontSize: Layout.fontSize.md,
    fontWeight: 'bold',
    marginRight: Layout.spacing.sm,
    width: 50,
  },
  sceneDescription: {
    fontSize: Layout.fontSize.md,
    fontWeight: '600',
    flex: 1,
  },
  sceneParams: {
    fontSize: Layout.fontSize.sm,
  },
});

export default EVCalculator;
