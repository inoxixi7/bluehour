import React from 'react';
import { View, Text, StyleSheet, Modal, ScrollView, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';
import { Touchable } from '../common/Touchable';

interface LightPhaseGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LightPhaseGuideModal: React.FC<LightPhaseGuideModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  const phases = [
    {
      key: 'astronomicalTwilight',
      color: theme.colors.twilight,
      icon: 'moon',
      // Placeholder for image
      imageColor: '#0B1026', 
    },
    {
      key: 'nauticalTwilight',
      color: theme.colors.twilight,
      icon: 'boat',
      imageColor: '#18264D',
    },
    {
      key: 'blueHour',
      color: theme.colors.blueHour,
      icon: 'camera',
      imageColor: '#2C4A87',
    },
    {
      key: 'civilTwilight',
      color: theme.colors.twilight,
      icon: 'partly-sunny',
      imageColor: '#6B7A8F',
    },
    {
      key: 'goldenHour',
      color: theme.colors.goldenHour,
      icon: 'sunny',
      imageColor: '#FFD700',
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
              {t('sunTimes.guide.title')}
            </Text>
            <Touchable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Touchable>
          </View>

          {/* Content */}
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {phases.map((phase) => (
              <View key={phase.key} style={[styles.phaseItem, { borderBottomColor: theme.colors.border }]}>
                <View style={styles.phaseHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: phase.color + '20' }]}>
                    <Ionicons name={phase.icon as any} size={20} color={phase.color} />
                  </View>
                  <Text style={[styles.phaseTitle, { color: theme.colors.text }]}>
                    {t(`sunTimes.guide.${phase.key}.title`)}
                  </Text>
                </View>
                
                <Text style={[styles.phaseDesc, { color: theme.colors.textSecondary }]}>
                  {t(`sunTimes.guide.${phase.key}.desc`)}
                </Text>

                {/* Image Placeholder Area */}
                <View style={[styles.imagePlaceholder, { backgroundColor: phase.imageColor }]}>
                  <Ionicons name="image-outline" size={32} color="rgba(255,255,255,0.5)" />
                  <Text style={styles.imagePlaceholderText}>Example Photo</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.spacing.lg,
    paddingBottom: 40,
  },
  phaseItem: {
    marginBottom: Layout.spacing.xl,
    paddingBottom: Layout.spacing.lg,
    borderBottomWidth: 1,
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Layout.spacing.md,
  },
  phaseTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
  },
  phaseDesc: {
    fontSize: Layout.fontSize.base,
    lineHeight: 22,
    marginBottom: Layout.spacing.md,
  },
  imagePlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePlaceholderText: {
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    fontSize: Layout.fontSize.sm,
  },
});
