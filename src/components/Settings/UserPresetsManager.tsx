/**
 * 用户预设管理界面
 * 在Settings中显示，允许用户创建、编辑、删除预设
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserPresets } from '../../hooks/useUserPresets';
import { UserPreset } from '../../types/userPreset';
import { PRESET_APERTURES, PRESET_SHUTTERS, PRESET_ISOS } from '../../constants/Photography';
import { Card } from '../common/Card';
import { AppButton } from '../common/AppButton';
import { Touchable } from '../common/Touchable';
import { Layout } from '../../constants/Layout';

export const UserPresetsManager: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { presets, activePresetId, createPreset, updatePreset, deletePreset, setActivePreset } =
    useUserPresets();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingPreset, setEditingPreset] = useState<UserPreset | null>(null);

  // 表单状态
  const [presetName, setPresetName] = useState('');
  const [camera, setCamera] = useState('');
  const [lens, setLens] = useState('');
  const [selectedApertures, setSelectedApertures] = useState<number[]>([]);
  const [selectedShutters, setSelectedShutters] = useState<number[]>([]);
  const [selectedISOs, setSelectedISOs] = useState<number[]>([]);

  const styles = createStyles(theme.colors);

  const toggleSelection = (list: number[], val: number, setter: (v: number[]) => void) => {
    if (list.includes(val)) {
      setter(list.filter(i => i !== val));
    } else {
      setter([...list, val]);
    }
  };

  // 打开创建预设对话框
  const handleCreateNew = () => {
    setEditingPreset(null);
    setPresetName('');
    setCamera('');
    setLens('');
    setSelectedApertures([]);
    setSelectedShutters([]);
    setSelectedISOs([]);
    setModalVisible(true);
  };

  // 打开编辑预设对话框
  const handleEdit = (preset: UserPreset) => {
    setEditingPreset(preset);
    setPresetName(preset.name);
    setCamera(preset.camera || '');
    setLens(preset.lens || '');
    setSelectedApertures(preset.apertures || []);
    setSelectedShutters(preset.shutterSpeeds || []);
    setSelectedISOs(preset.isos || []);
    setModalVisible(true);
  };

  // 保存预设
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

      if (editingPreset) {
        await updatePreset(editingPreset.id, presetData);
      } else {
        // Create need full type but Partial is accepted by logic if we cast or if hook accepts partial
        // The implementation of createPreset usually expects Omit<UserPreset, 'id'...>
        // We supply the new fields.
        // Assuming createPreset fills createdAt/id.
        await createPreset(presetData as any);
      }

      setModalVisible(false);
    } catch (error) {
      Alert.alert(t('common.error'), '保存预设失败');
    }
  };

  // 删除预设
  const handleDelete = (preset: UserPreset) => {
    Alert.alert(t('common.delete'), `确定要删除预设"${preset.name}"吗？`, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => deletePreset(preset.id),
      },
    ]);
  };

  // 激活/取消激活预设
  const handleToggleActive = (presetId: string) => {
    if (activePresetId === presetId) {
      setActivePreset(undefined);
    } else {
      setActivePreset(presetId);
    }
  };

  return (
    <View style={styles.container}>
      {/* 预设列表 */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          {t('settings.userPresets.title')}
        </Text>
        <AppButton
          title={t('settings.userPresets.createNew')}
          onPress={handleCreateNew}
          variant="primary"
          size="small"
        />
      </View>

      {presets.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Text style={[styles.emptyText, { color: theme.colors.textSecondary }]}>
            {t('settings.userPresets.empty')}
          </Text>
        </Card>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {presets.map(preset => (
            <Card key={preset.id} style={styles.presetCard}>
              <View style={styles.presetHeader}>
                <View style={styles.presetInfo}>
                  <Text style={[styles.presetName, { color: theme.colors.text }]}>
                    {preset.name}
                  </Text>
                  {activePresetId === preset.id && (
                    <View style={[styles.activeBadge, { backgroundColor: theme.colors.primary }]}>
                      <Text style={styles.activeBadgeText}>{t('settings.userPresets.active')}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.presetActions}>
                  <Touchable onPress={() => handleEdit(preset)} style={styles.actionButton}>
                    <Ionicons name="create-outline" size={20} color={theme.colors.primary} />
                  </Touchable>
                  <Touchable onPress={() => handleDelete(preset)} style={styles.actionButton}>
                    <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
                  </Touchable>
                </View>
              </View>

              {/* 预设详情 */}
              <View style={styles.presetDetails}>
                {preset.camera && (
                  <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                    📷 {preset.camera}
                  </Text>
                )}
                {preset.lens && (
                  <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                    🔍 {preset.lens}
                  </Text>
                )}
                <Text style={[styles.detailText, { color: theme.colors.textSecondary }]}>
                  ⚙️ {preset.apertures?.length || 0} Av, {preset.shutterSpeeds?.length || 0} Tv,{' '}
                  {preset.isos?.length || 0} ISO
                </Text>
              </View>

              {/* 激活按钮 */}
              <AppButton
                title={
                  activePresetId === preset.id
                    ? t('settings.userPresets.deactivate')
                    : t('settings.userPresets.activate')
                }
                onPress={() => handleToggleActive(preset.id)}
                variant={activePresetId === preset.id ? 'secondary' : 'primary'}
                size="small"
              />
            </Card>
          ))}
        </ScrollView>
      )}

      {/* 创建/编辑预设Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                {editingPreset
                  ? t('settings.userPresets.editPreset')
                  : t('settings.userPresets.createNew')}
              </Text>
              <Touchable onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Touchable>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
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

              {/* Apertures */}
              <MultiSelectGrid
                title="支持光圈 (Apertures)"
                options={PRESET_APERTURES}
                selectedValues={selectedApertures}
                onToggle={val => toggleSelection(selectedApertures, val, setSelectedApertures)}
                labelExtractor={item => `f/${item}`}
                valueExtractor={item => item}
                theme={theme}
              />

              {/* Shutter Speeds */}
              <MultiSelectGrid
                title="支持快门 (Shutter Speeds)"
                options={PRESET_SHUTTERS}
                selectedValues={selectedShutters}
                onToggle={val => toggleSelection(selectedShutters, val, setSelectedShutters)}
                labelExtractor={item => item.label}
                valueExtractor={item => item.value}
                theme={theme}
              />

              {/* ISOs */}
              <MultiSelectGrid
                title="支持 ISO"
                options={PRESET_ISOS}
                selectedValues={selectedISOs}
                onToggle={val => toggleSelection(selectedISOs, val, setSelectedISOs)}
                labelExtractor={item => `ISO ${item}`}
                valueExtractor={item => item}
                theme={theme}
              />
            </ScrollView>

            {/* 保存按钮 */}
            <View style={styles.modalFooter}>
              <AppButton
                title={t('common.cancel')}
                onPress={() => setModalVisible(false)}
                variant="secondary"
                style={{ flex: 1 }}
              />
              <AppButton
                title={t('common.save')}
                onPress={handleSave}
                variant="primary"
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const MultiSelectGrid: React.FC<{
  title: string;
  options: any[];
  selectedValues: number[];
  onToggle: (value: number) => void;
  labelExtractor: (item: any) => string;
  valueExtractor: (item: any) => number;
  theme: any;
}> = ({ title, options, selectedValues, onToggle, labelExtractor, valueExtractor, theme }) => {
  return (
    <View style={{ marginBottom: Layout.spacing.md }}>
      <Text
        style={{
          fontSize: Layout.fontSize.sm,
          fontWeight: '600',
          marginBottom: Layout.spacing.xs,
          color: theme.colors.text,
        }}
      >
        {title}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {options.map(item => {
          const val = valueExtractor(item);
          const isSelected = selectedValues.includes(val);
          return (
            <Touchable
              key={val}
              onPress={() => onToggle(val)}
              style={{
                paddingHorizontal: 8,
                paddingVertical: 6,
                borderRadius: 4,
                borderWidth: 1,
                borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                backgroundColor: isSelected ? theme.colors.primary + '20' : 'transparent',
                minWidth: 40,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: isSelected ? theme.colors.primary : theme.colors.text,
                }}
              >
                {labelExtractor(item)}
              </Text>
            </Touchable>
          );
        })}
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
      marginBottom: Layout.spacing.md,
    },
    title: {
      fontSize: Layout.fontSize.lg,
      fontWeight: '600',
    },
    list: {
      flex: 1,
    },
    emptyCard: {
      padding: Layout.spacing.xl,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: Layout.fontSize.base,
      textAlign: 'center',
    },
    presetCard: {
      marginBottom: Layout.spacing.md,
      padding: Layout.spacing.md,
    },
    presetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: Layout.spacing.sm,
    },
    presetInfo: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: Layout.spacing.sm,
    },
    presetName: {
      fontSize: Layout.fontSize.base,
      fontWeight: '600',
    },
    activeBadge: {
      paddingHorizontal: Layout.spacing.sm,
      paddingVertical: Layout.spacing.xs / 2,
      borderRadius: Layout.borderRadius.sm,
    },
    activeBadgeText: {
      color: '#fff',
      fontSize: Layout.fontSize.xs,
      fontWeight: '600',
    },
    presetActions: {
      flexDirection: 'row',
      gap: Layout.spacing.sm,
    },
    actionButton: {
      padding: Layout.spacing.xs,
    },
    presetDetails: {
      marginBottom: Layout.spacing.md,
      gap: Layout.spacing.xs,
    },
    detailText: {
      fontSize: Layout.fontSize.sm,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      borderRadius: Layout.borderRadius.lg,
      padding: Layout.spacing.lg,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Layout.spacing.md,
    },
    modalTitle: {
      fontSize: Layout.fontSize.lg,
      fontWeight: '600',
    },
    modalBody: {
      flex: 1,
    },
    modalFooter: {
      flexDirection: 'row',
      gap: Layout.spacing.md,
      marginTop: Layout.spacing.md,
    },
    formGroup: {
      marginBottom: Layout.spacing.md,
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
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    filmOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: Layout.spacing.md,
      borderWidth: 1,
      borderRadius: Layout.borderRadius.md,
      marginBottom: Layout.spacing.sm,
    },
    filmName: {
      flex: 1,
      fontSize: Layout.fontSize.base,
      fontWeight: '500',
    },
    filmISO: {
      fontSize: Layout.fontSize.sm,
      marginRight: Layout.spacing.sm,
    },
  });
