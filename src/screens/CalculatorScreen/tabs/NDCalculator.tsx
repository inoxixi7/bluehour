import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/common/Card';
import { AppButton } from '../../../components/common/AppButton';
import { useTheme } from '../../../contexts/ThemeContext';
import { Layout } from '../../../constants/Layout';
import { SHUTTER_SPEEDS, ND_FILTERS } from '../../../constants/Photography';
import { calculateNDShutter } from '../../../utils/photographyCalculations';
import { formatShutterSpeed } from '../../../utils/formatters';

const NDCalculator: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [baseShutter, setBaseShutter] = useState(1/60);
  const [selectedNDIndex, setSelectedNDIndex] = useState(9); // ND1000 默认
  const [calculatedShutter, setCalculatedShutter] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const handleCalculate = () => {
    const ndFilter = ND_FILTERS[selectedNDIndex];
    const newShutter = calculateNDShutter(baseShutter, ndFilter.stops);
    setCalculatedShutter(newShutter);
  };

  const startTimer = () => {
    if (!calculatedShutter) return;
    
    setIsTimerRunning(true);
    setRemainingTime(calculatedShutter);

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const selectedND = ND_FILTERS[selectedNDIndex];
  const styles = createStyles(theme.colors);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('calculator.nd.title')}</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {t('calculator.nd.description')}
        </Text>

        {/* 基础快门速度 */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{t('calculator.nd.originalShutter')}</Text>
          <Text style={styles.hint}>{t('calculator.nd.originalShutterHint')}</Text>

          <View style={styles.pickerContainer}>
            <View style={styles.picker}>
              <Picker
                selectedValue={baseShutter}
                onValueChange={(value) => setBaseShutter(value)}
                style={styles.pickerStyle}
              >
                {SHUTTER_SPEEDS.map(item => (
                  <Picker.Item key={item.label} label={item.label} value={item.value} />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.valueDisplay}>
            <Text style={styles.valueText}>{formatShutterSpeed(baseShutter)}</Text>
          </View>
        </Card>

        {/* ND 滤镜选择 */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{t('calculator.nd.ndStrength')}</Text>
          
          <View style={styles.pickerContainer}>
            <View style={styles.picker}>
              <Picker
                selectedValue={selectedNDIndex}
                onValueChange={(value) => setSelectedNDIndex(value)}
                style={styles.pickerStyle}
              >
                {ND_FILTERS.map((filter, index) => (
                  <Picker.Item
                    key={index}
                    label={`${filter.name} - ${filter.stops} ${t('calculator.nd.stops')}`}
                    value={index}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.ndInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('calculator.nd.stops')}:</Text>
              <Text style={styles.infoValue}>{selectedND.stops} {t('calculator.nd.stops')}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Factor:</Text>
              <Text style={styles.infoValue}>{selectedND.factor}x</Text>
            </View>
          </View>
        </Card>

        {/* 计算按钮 */}
        <AppButton
          title={t('calculator.nd.calculate')}
          onPress={handleCalculate}
          variant="accent"
          style={styles.calculateButton}
        />

        {/* 计算结果 */}
        {calculatedShutter !== null && (
          <Card style={styles.resultCard}>
            <Text style={styles.sectionTitle}>{t('calculator.ev.adjustExposure')}</Text>
            
            <View style={styles.resultDisplay}>
              <Text style={styles.resultLabel}>{t('calculator.nd.newShutter')}:</Text>
              <Text style={styles.resultValue}>
                {formatShutterSpeed(calculatedShutter)}
              </Text>
            </View>

            {calculatedShutter >= 1 && (
              <>
                <AppButton
                  title={isTimerRunning ? `${Math.ceil(remainingTime)}s` : t('calculator.nd.startTimer')}
                  onPress={startTimer}
                  variant="primary"
                  disabled={isTimerRunning}
                  style={styles.timerButton}
                />
                
                {isTimerRunning && (
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill,
                        { width: `${(remainingTime / calculatedShutter) * 100}%` }
                      ]} 
                    />
                  </View>
                )}
              </>
            )}
          </Card>
        )}
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
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.sm,
  },
  hint: {
    fontSize: Layout.fontSize.sm,
    marginBottom: Layout.spacing.md,
  },
  pickerContainer: {
    marginBottom: Layout.spacing.md,
  },
  picker: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
  },
  pickerStyle: {
    color: colors.text,
  },
  valueDisplay: {
    backgroundColor: colors.backgroundTertiary,
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.md,
    alignItems: 'center',
  },
  valueText: {
    fontSize: Layout.fontSize.title,
    fontWeight: 'bold',
    color: colors.primary,
  },
  ndInfo: {
    marginTop: Layout.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  infoLabel: {
    fontSize: Layout.fontSize.base,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  calculateButton: {
    marginBottom: Layout.spacing.lg,
  },
  resultCard: {
    marginBottom: Layout.spacing.md,
  },
  resultDisplay: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
  },
  resultLabel: {
    fontSize: Layout.fontSize.base,
    color: colors.textSecondary,
    marginBottom: Layout.spacing.sm,
  },
  resultValue: {
    fontSize: Layout.fontSize.hero,
    fontWeight: 'bold',
    color: colors.goldenHour,
  },
  timerButton: {
    marginTop: Layout.spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: 4,
    marginTop: Layout.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent,
  },
  tipCard: {
    marginBottom: Layout.spacing.xl,
  },
  tipTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: colors.goldenHour,
    marginBottom: Layout.spacing.md,
  },
  tipText: {
    fontSize: Layout.fontSize.base,
    color: colors.text,
    lineHeight: 24,
  },
});

export default NDCalculator;
