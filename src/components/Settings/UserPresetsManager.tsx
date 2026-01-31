/**
 * 用户预设管理界面
 * 在Settings中显示，允许用户创建、编辑、删除预设
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserPresets } from '../../hooks/useUserPresets';
import { UserPreset } from '../../types/userPreset';
import { Card } from '../common/Card';
import { AppButton } from '../common/AppButton';
import { Touchable } from '../common/Touchable';
import { Layout } from '../../constants/Layout';
import { CreatePresetStepper } from './CreatePresetStepper';

export const UserPresetsManager: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { presets, activePresetId, createPreset, updatePreset, deletePreset, setActivePreset } =
    useUserPresets();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingPreset, setEditingPreset] = useState<UserPreset | null>(null);

  const styles = createStyles(theme.colors);

  // 打开创建预设对话框
  const handleCreateNew = () => {
    setEditingPreset(null);
    setModalVisible(true);
  };

  // 打开编辑预设对话框
  const handleEdit = (preset: UserPreset) => {
    setEditingPreset(preset);
    setModalVisible(true);
  };

  // 保存预设
  const handleSave = async (presetData: Partial<UserPreset>) => {
    try {
      if (editingPreset) {
        await updatePreset(editingPreset.id, presetData);
      } else {
        await createPreset(presetData as any);
      }

      setModalVisible(false);
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.userPresets.saveFailed'));
    }
  };

  // 删除预设
  const handleDelete = (preset: UserPreset) => {
    Alert.alert(t('common.delete'), t('settings.userPresets.deleteConfirm', { name: preset.name }), [
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
            <CreatePresetStepper
              initialData={editingPreset}
              onSave={handleSave}
              onCancel={() => setModalVisible(false)}
            />
          </View>
        </View>
      </Modal>
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
