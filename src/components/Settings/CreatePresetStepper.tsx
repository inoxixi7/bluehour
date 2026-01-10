/**
 * 创建预设的分步向导组件
 * 第一步：预设名称、相机、镜头
 * 第二步：支持的光圈 (多选)
 * 第三步：支持的快门 (多选)
 * 第四步：支持的ISO (多选)
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { UserPreset } from '../../types/userPreset';
import { PRESET_APERTURES, PRESET_SHUTTERS, PRESET_ISOS } from '../../constants/Photography';
import { AppButton } from '../common/AppButton';
import { Touchable } from '../common/Touchable';
import { Layout } from '../../constants/Layout';

interface CreatePresetStepperProps {
  initialData?: UserPreset | null;
  onSave: (presetData: Partial<UserPreset>) => Promise<void>;
  onCancel: () => void;
}

export const CreatePresetStepper: React.FC<CreatePresetStepperProps> = ({
  initialData,
  onSave,
  onCancel,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const styles = createStyles(theme.colors);

  // 当前步骤 (1-4)
  const [currentStep, setCurrentStep] = useState(1);

  // 表单状态
  const [presetName, setPresetName] = useState(initialData?.name || '');
  const [camera, setCamera] = useState(initialData?.camera || '');
  const [lens, setLens] = useState(initialData?.lens || '');
  const [selectedApertures, setSelectedApertures] = useState<number[]>(
    initialData?.apertures || []
  );
  const [selectedShutters, setSelectedShutters] = useState<number[]>(
    initialData?.shutterSpeeds || []
  );
  const [selectedISOs, setSelectedISOs] = useState<number[]>(initialData?.isos || []);

  const toggleSelection = (list: number[], val: number, setter: (v: number[]) => void) => {
    if (list.includes(val)) {
      setter(list.filter(i => i !== val));
    } else {
      setter([...list, val].sort((a, b) => a - b));
    }
  };

  const handleNext = () => {
    // 验证第一步
    if (currentStep === 1 && !presetName.trim()) {
      Alert.alert(t('common.error'), '请输入预设名称');
      return;
    }
    
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    if (!presetName.trim()) {
      Alert.alert(t('common.error'), '请输入预设名称');
      return;
    }

    try {
      const presetData: Partial<UserPreset> = {
        name: presetName.trim(),
        camera: camera.trim() || undefined,
        lens: lens.trim() || undefined,
        apertures: selectedApertures,
        shutterSpeeds: selectedShutters,
        isos: selectedISOs,
        updatedAt: new Date(),
      };

      await onSave(presetData);
    } catch (error) {
      Alert.alert(t('common.error'), '保存预设失败');
    }
  };

  const renderStepIndicator = () => {
    return (
      <View style={styles.stepIndicator}>
        {[1, 2, 3, 4].map(step => (
          <View key={step} style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                step === currentStep && styles.stepCircleActive,
                step < currentStep && styles.stepCircleCompleted,
                { borderColor: theme.colors.border },
              ]}
            >
              {step < currentStep ? (
                <Ionicons name="checkmark" size={16} color="#fff" />
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    step === currentStep && styles.stepNumberActive,
                  ]}
                >
                  {step}
                </Text>
              )}
            </View>
            {step < 4 && (
              <View
                style={[
                  styles.stepLine,
                  step < currentStep && styles.stepLineCompleted,
                  { backgroundColor: theme.colors.border },
                ]}
              />
            )}
          </View>
        ))}
      </View>
    );
  };

  const renderStep1 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>基本信息</Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        请输入预设名称、相机和镜头信息
      </Text>

      {/* 预设名称 */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('settings.userPresets.presetName')} *
        </Text>
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={presetName}
          onChangeText={setPresetName}
          placeholder={t('settings.userPresets.presetNamePlaceholder')}
          placeholderTextColor={theme.colors.textTertiary}
        />
      </View>

      {/* 相机 */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('settings.userPresets.camera')}
        </Text>
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={camera}
          onChangeText={setCamera}
          placeholder={t('settings.userPresets.cameraPlaceholder')}
          placeholderTextColor={theme.colors.textTertiary}
        />
      </View>

      {/* 镜头 */}
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: theme.colors.text }]}>
          {t('settings.userPresets.lens')}
        </Text>
        <TextInput
          style={[
            styles.input,
            { color: theme.colors.text, borderColor: theme.colors.border },
          ]}
          value={lens}
          onChangeText={setLens}
          placeholder={t('settings.userPresets.lensPlaceholder')}
          placeholderTextColor={theme.colors.textTertiary}
        />
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>支持的光圈</Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        选择您的设备支持的光圈值（可多选）
      </Text>

      <View style={styles.checkboxGrid}>
        {PRESET_APERTURES.map(aperture => {
          const isSelected = selectedApertures.includes(aperture);
          return (
            <Touchable
              key={aperture}
              onPress={() =>
                toggleSelection(selectedApertures, aperture, setSelectedApertures)
              }
              style={[
                styles.checkboxItem,
                { borderColor: theme.colors.border },
                isSelected && {
                  backgroundColor: theme.colors.primary + '20',
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: theme.colors.border },
                  isSelected && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text
                style={[
                  styles.checkboxLabel,
                  { color: theme.colors.text },
                  isSelected && { color: theme.colors.primary, fontWeight: '600' },
                ]}
              >
                f/{aperture}
              </Text>
            </Touchable>
          );
        })}
      </View>
      
      <Text style={[styles.selectionCount, { color: theme.colors.textSecondary }]}>
        已选择 {selectedApertures.length} 项
      </Text>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>支持的快门</Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        选择您的设备支持的快门速度（可多选）
      </Text>

      <View style={styles.checkboxGrid}>
        {PRESET_SHUTTERS.map(shutter => {
          const isSelected = selectedShutters.includes(shutter.value);
          return (
            <Touchable
              key={shutter.value}
              onPress={() =>
                toggleSelection(selectedShutters, shutter.value, setSelectedShutters)
              }
              style={[
                styles.checkboxItem,
                { borderColor: theme.colors.border },
                isSelected && {
                  backgroundColor: theme.colors.primary + '20',
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: theme.colors.border },
                  isSelected && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text
                style={[
                  styles.checkboxLabel,
                  { color: theme.colors.text },
                  isSelected && { color: theme.colors.primary, fontWeight: '600' },
                ]}
              >
                {shutter.label}
              </Text>
            </Touchable>
          );
        })}
      </View>
      
      <Text style={[styles.selectionCount, { color: theme.colors.textSecondary }]}>
        已选择 {selectedShutters.length} 项
      </Text>
    </View>
  );

  const renderStep4 = () => (
    <View style={styles.stepContent}>
      <Text style={[styles.stepTitle, { color: theme.colors.text }]}>支持的 ISO</Text>
      <Text style={[styles.stepDescription, { color: theme.colors.textSecondary }]}>
        选择您的设备支持的 ISO 值（可多选）
      </Text>

      <View style={styles.checkboxGrid}>
        {PRESET_ISOS.map(iso => {
          const isSelected = selectedISOs.includes(iso);
          return (
            <Touchable
              key={iso}
              onPress={() => toggleSelection(selectedISOs, iso, setSelectedISOs)}
              style={[
                styles.checkboxItem,
                { borderColor: theme.colors.border },
                isSelected && {
                  backgroundColor: theme.colors.primary + '20',
                  borderColor: theme.colors.primary,
                },
              ]}
            >
              <View
                style={[
                  styles.checkbox,
                  { borderColor: theme.colors.border },
                  isSelected && {
                    backgroundColor: theme.colors.primary,
                    borderColor: theme.colors.primary,
                  },
                ]}
              >
                {isSelected && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
              <Text
                style={[
                  styles.checkboxLabel,
                  { color: theme.colors.text },
                  isSelected && { color: theme.colors.primary, fontWeight: '600' },
                ]}
              >
                ISO {iso}
              </Text>
            </Touchable>
          );
        })}
      </View>
      
      <Text style={[styles.selectionCount, { color: theme.colors.textSecondary }]}>
        已选择 {selectedISOs.length} 项
      </Text>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {initialData ? t('settings.userPresets.editPreset') : t('settings.userPresets.createNew')}
        </Text>
        <Touchable onPress={onCancel}>
          <Ionicons name="close" size={24} color={theme.colors.text} />
        </Touchable>
      </View>

      {renderStepIndicator()}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderCurrentStep()}
      </ScrollView>

      <View style={styles.footer}>
        {currentStep > 1 && (
          <AppButton
            title="上一步"
            onPress={handlePrevious}
            variant="secondary"
            style={styles.footerButton}
          />
        )}
        {currentStep < 4 ? (
          <AppButton
            title="下一步"
            onPress={handleNext}
            variant="primary"
            style={currentStep === 1 ? styles.footerButtonFull : styles.footerButton}
          />
        ) : (
          <AppButton
            title={t('common.save')}
            onPress={handleSave}
            variant="primary"
            style={styles.footerButton}
          />
        )}
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Layout.spacing.lg,
    },
    title: {
      fontSize: Layout.fontSize.lg,
      fontWeight: '600',
    },
    stepIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Layout.spacing.xl,
      paddingHorizontal: Layout.spacing.md,
    },
    stepItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    stepCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'transparent',
    },
    stepCircleActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    stepCircleCompleted: {
      borderColor: colors.primary,
      backgroundColor: colors.primary,
    },
    stepNumber: {
      fontSize: Layout.fontSize.sm,
      color: colors.textSecondary,
    },
    stepNumberActive: {
      color: '#fff',
      fontWeight: '600',
    },
    stepLine: {
      flex: 1,
      height: 2,
      marginHorizontal: Layout.spacing.xs,
    },
    stepLineCompleted: {
      backgroundColor: colors.primary,
    },
    content: {
      flex: 1,
    },
    stepContent: {
      paddingHorizontal: Layout.spacing.md,
    },
    stepTitle: {
      fontSize: Layout.fontSize.xl,
      fontWeight: '700',
      marginBottom: Layout.spacing.sm,
    },
    stepDescription: {
      fontSize: Layout.fontSize.base,
      marginBottom: Layout.spacing.xl,
      lineHeight: 22,
    },
    formGroup: {
      marginBottom: Layout.spacing.lg,
    },
    label: {
      fontSize: Layout.fontSize.sm,
      fontWeight: '600',
      marginBottom: Layout.spacing.xs,
    },
    input: {
      borderWidth: 1,
      borderRadius: Layout.borderRadius.md,
      padding: Layout.spacing.md,
      fontSize: Layout.fontSize.base,
    },
    checkboxGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Layout.spacing.sm,
      marginBottom: Layout.spacing.md,
    },
    checkboxItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Layout.spacing.md,
      paddingVertical: Layout.spacing.sm,
      borderRadius: Layout.borderRadius.md,
      borderWidth: 1.5,
      minWidth: 90,
      gap: Layout.spacing.sm,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: Layout.borderRadius.sm,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxLabel: {
      fontSize: Layout.fontSize.sm,
    },
    selectionCount: {
      fontSize: Layout.fontSize.sm,
      textAlign: 'center',
      marginTop: Layout.spacing.md,
    },
    footer: {
      flexDirection: 'row',
      gap: Layout.spacing.md,
      paddingTop: Layout.spacing.lg,
      paddingHorizontal: Layout.spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    footerButton: {
      flex: 1,
    },
    footerButtonFull: {
      flex: 1,
    },
  });
