import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Layout } from '../../constants/Layout';

interface HelpSectionsProps {
  /** 翻译前缀，例如 'reciprocityHelp'；读取 description 和 section1…sectionN */
  i18nPrefix: string;
  sectionCount: number;
  textColor: string;
  secondaryColor: string;
  accentColor: string;
}

/**
 * 帮助弹窗正文：一段说明 + 若干带标题的要点列表
 */
export const HelpSections: React.FC<HelpSectionsProps> = ({
  i18nPrefix,
  sectionCount,
  textColor,
  secondaryColor,
  accentColor,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Text style={[styles.description, { color: textColor }]}>
        {t(`${i18nPrefix}.description`)}
      </Text>

      {Array.from({ length: sectionCount }, (_, i) => {
        const key = `${i18nPrefix}.section${i + 1}`;
        const content = t(`${key}.content`, { returnObjects: true });
        const items = Array.isArray(content) ? (content as string[]) : [];
        return (
          <View key={key} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: accentColor }]}>{t(`${key}.title`)}</Text>
            {items.map((item, idx) => (
              <Text key={idx} style={[styles.item, { color: secondaryColor }]}>
                • {item}
              </Text>
            ))}
          </View>
        );
      })}
    </>
  );
};

const styles = StyleSheet.create({
  description: {
    fontSize: Layout.fontSize.base,
    lineHeight: 24,
    marginBottom: Layout.spacing.lg,
  },
  section: {
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    marginBottom: Layout.spacing.sm,
  },
  item: {
    fontSize: Layout.fontSize.sm,
    lineHeight: 22,
    marginBottom: Layout.spacing.xs,
  },
});
