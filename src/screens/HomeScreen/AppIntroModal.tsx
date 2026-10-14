import React from 'react';
import { View, Text, StyleSheet, ScrollView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';
import { Touchable } from '../../components/common/Touchable';

interface AppIntroModalProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * 首页的应用介绍弹窗
 */
export const AppIntroModal: React.FC<AppIntroModalProps> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {t('home.intro.title')}
            </Text>
            <Touchable onPress={onClose} style={styles.modalCloseButton}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </Touchable>
          </View>
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.modalDescription, { color: theme.colors.text }]}>
              {t('home.intro.description')}
            </Text>

            <Text style={[styles.modalSectionTitle, { color: theme.colors.text }]}>
              {t('home.intro.featuresTitle')}
            </Text>

            <View style={styles.modalFeature}>
              <Text style={styles.modalFeatureIcon}>🌅</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalFeatureTitle, { color: theme.colors.text }]}>
                  {t('home.intro.feature1Title')}
                </Text>
                <Text style={[styles.modalFeatureDesc, { color: theme.colors.textSecondary }]}>
                  {t('home.intro.feature1Desc')}
                </Text>
              </View>
            </View>

            <View style={styles.modalFeature}>
              <Text style={styles.modalFeatureIcon}>📷</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalFeatureTitle, { color: theme.colors.text }]}>
                  {t('home.intro.feature2Title')}
                </Text>
                <Text style={[styles.modalFeatureDesc, { color: theme.colors.textSecondary }]}>
                  {t('home.intro.feature2Desc')}
                </Text>
              </View>
            </View>

            <View style={styles.modalFeature}>
              <Text style={styles.modalFeatureIcon}>🎞️</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.modalFeatureTitle, { color: theme.colors.text }]}>
                  {t('home.intro.feature3Title')}
                </Text>
                <Text style={[styles.modalFeatureDesc, { color: theme.colors.textSecondary }]}>
                  {t('home.intro.feature3Desc')}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  modalContent: {
    borderRadius: Layout.borderRadius.xl,
    maxWidth: 500,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.md,
  },
  modalTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    flex: 1,
  },
  modalCloseButton: {
    padding: Layout.spacing.xs,
  },
  modalScroll: {
    paddingHorizontal: Layout.spacing.lg,
    paddingBottom: Layout.spacing.lg,
  },
  modalDescription: {
    fontSize: Layout.fontSize.base,
    lineHeight: 24,
    marginBottom: Layout.spacing.lg,
  },
  modalSectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    marginBottom: Layout.spacing.md,
  },
  modalFeature: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  modalFeatureIcon: {
    fontSize: 28,
  },
  modalFeatureTitle: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  modalFeatureDesc: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 20,
  },
});
