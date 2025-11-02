import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Card } from '../../../components/common/Card';
import { AppButton } from '../../../components/common/AppButton';
import { useTheme } from '../../../contexts/ThemeContext';
import { Layout } from '../../../constants/Layout';
import { SHUTTER_SPEEDS, ND_FILTERS } from '../../../constants/Photography';
import { calculateNDShutter } from '../../../utils/photographyCalculations';
import { formatShutterSpeed } from '../../../utils/formatters';

const NDCalculator: React.FC = () => {
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
        <Text style={[styles.title, { color: theme.colors.text }]}>ND 滤镜计算器</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          计算使用 ND 滤镜后所需的快门速度
        </Text>

        {/* 基础快门速度 */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>基础快门速度</Text>
          <Text style={styles.hint}>（不使用 ND 滤镜时的测光值）</Text>

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
          <Text style={styles.sectionTitle}>ND 滤镜</Text>
          
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
                    label={`${filter.name} - ${filter.stops} 档`}
                    value={index}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.ndInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>减光档位:</Text>
              <Text style={styles.infoValue}>{selectedND.stops} 档</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>减光系数:</Text>
              <Text style={styles.infoValue}>{selectedND.factor}x</Text>
            </View>
          </View>
        </Card>

        {/* 计算按钮 */}
        <AppButton
          title="计算新快门速度"
          onPress={handleCalculate}
          variant="accent"
          style={styles.calculateButton}
        />

        {/* 计算结果 */}
        {calculatedShutter !== null && (
          <Card style={styles.resultCard}>
            <Text style={styles.sectionTitle}>计算结果</Text>
            
            <View style={styles.resultDisplay}>
              <Text style={styles.resultLabel}>新的快门速度:</Text>
              <Text style={styles.resultValue}>
                {formatShutterSpeed(calculatedShutter)}
              </Text>
            </View>

            {calculatedShutter >= 1 && (
              <>
                <AppButton
                  title={isTimerRunning ? `剩余 ${Math.ceil(remainingTime)}秒` : "启动计时器"}
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

        {/* 使用提示 */}
        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 使用提示</Text>
          <Text style={styles.tipText}>
            1. 先不装滤镜，使用相机测光得到基础快门速度{'\n'}
            2. 选择您使用的 ND 滤镜型号{'\n'}
            3. 点击计算，获得新的快门速度{'\n'}
            4. 如果快门速度超过 1 秒，可使用计时器辅助拍摄
          </Text>
        </Card>
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
