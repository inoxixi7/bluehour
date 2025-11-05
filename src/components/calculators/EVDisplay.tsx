import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import { calculateEV } from '../../utils/photographyCalculations';
import { formatEV } from '../../utils/formatters';

interface EVDisplayProps {
  aperture: number;
  shutter: number;
  iso: number;
  showDetails?: boolean;
}

/**
 * EV 值显示组件
 * 显示当前曝光设置的 EV 值，可选择显示详细信息
 */
export const EVDisplay: React.FC<EVDisplayProps> = ({
  aperture,
  shutter,
  iso,
  showDetails = false,
}) => {
  const { t } = useTranslation();
  const ev = calculateEV(aperture, shutter, iso);

  // 根据 EV 值判断曝光情况
  const getExposureDescription = (ev: number): string => {
    if (ev < -2) return t('common.exposureConditions.veryDark');
    if (ev < 3) return t('common.exposureConditions.lowLight');
    if (ev < 7) return t('common.exposureConditions.indoor');
    if (ev < 11) return t('common.exposureConditions.overcast');
    if (ev < 14) return t('common.exposureConditions.shadedSunny');
    if (ev < 16) return t('common.exposureConditions.sunny');
    return t('common.exposureConditions.veryBright');
  };

  const getExposureColor = (ev: number): string => {
    if (ev < -2) return Colors.blueHour;
    if (ev < 7) return Colors.primary;
    if (ev < 14) return Colors.goldenHour;
    return Colors.accent;
  };

  return (
    <View style={styles.container}>
      <View style={styles.evValueContainer}>
        <Text style={styles.evLabel}>{t('common.evValue')}</Text>
        <Text style={[styles.evValue, { color: getExposureColor(ev) }]}>
          {formatEV(ev)}
        </Text>
      </View>

      {showDetails && (
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{t('common.environment')}:</Text>
            <Text style={styles.detailValue}>
              {getExposureDescription(ev)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.parameterGrid}>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>{t('calculator.ev.aperture')}</Text>
              <Text style={styles.parameterValue}>f/{aperture}</Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>{t('calculator.ev.shutter')}</Text>
              <Text style={styles.parameterValue}>
                {shutter >= 1 ? `${shutter}s` : `1/${Math.round(1 / shutter)}`}
              </Text>
            </View>
            <View style={styles.parameterItem}>
              <Text style={styles.parameterLabel}>{t('calculator.ev.iso')}</Text>
              <Text style={styles.parameterValue}>{iso}</Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    ...Layout.shadow.medium,
  },
  evValueContainer: {
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  evLabel: {
    fontSize: Layout.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  evValue: {
    fontSize: Layout.fontSize.hero,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  detailsContainer: {
    marginTop: Layout.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  detailLabel: {
    fontSize: Layout.fontSize.base,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.primaryDark,
    marginVertical: Layout.spacing.md,
  },
  parameterGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  parameterItem: {
    alignItems: 'center',
  },
  parameterLabel: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  parameterValue: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.accent,
  },
});
