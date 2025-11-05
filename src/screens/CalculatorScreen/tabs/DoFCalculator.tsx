import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/common/Card';
import { AppButton } from '../../../components/common/AppButton';
import { AppTextInput } from '../../../components/common/AppTextInput';
import { useTheme } from '../../../contexts/ThemeContext';
import { Layout } from '../../../constants/Layout';
import {
  APERTURE_VALUES,
  COMMON_FOCAL_LENGTHS,
  SENSOR_TYPES,
  COC_BY_SENSOR,
} from '../../../constants/Photography';
import { calculateDepthOfField } from '../../../utils/photographyCalculations';
import { formatAperture, formatDistance } from '../../../utils/formatters';

const DoFCalculator: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [aperture, setAperture] = useState(5.6);
  const [focalLength, setFocalLength] = useState(50);
  const [focusDistance, setFocusDistance] = useState(3);
  const [sensorIndex, setSensorIndex] = useState(0); // 全画幅默认
  const [result, setResult] = useState<any>(null);

  // 传感器类型翻译键映射
  const sensorTranslationKeys = [
    'calculator.dof.sensors.fullFrame',
    'calculator.dof.sensors.apscCanon',
    'calculator.dof.sensors.apscNikonSony',
    'calculator.dof.sensors.m43',
    'calculator.dof.sensors.oneInch',
  ];

  const handleCalculate = () => {
    const sensor = SENSOR_TYPES[sensorIndex];
    const coc = COC_BY_SENSOR[sensor.cropFactor];
    
    const dofResult = calculateDepthOfField(
      aperture,
      focalLength,
      focusDistance,
      coc
    );
    
    setResult(dofResult);
  };
  
  const styles = createStyles(theme.colors);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('calculator.dof.title')}</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          {t('calculator.dof.description')}
        </Text>

        {/* 参数输入 */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>{t('calculator.dof.sensorSize')}</Text>

          {/* 传感器类型 */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>{t('calculator.dof.sensorSize')}:</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={sensorIndex}
                onValueChange={(value) => setSensorIndex(value)}
                style={styles.pickerStyle}
              >
                {SENSOR_TYPES.map((sensor, index) => (
                  <Picker.Item
                    key={index}
                    label={t(sensorTranslationKeys[index])}
                    value={index}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* 焦距 */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>{t('calculator.dof.focalLength')} ({t('calculator.dof.focalLengthUnit')}):</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={focalLength}
                onValueChange={(value) => setFocalLength(value)}
                style={styles.pickerStyle}
              >
                {COMMON_FOCAL_LENGTHS.map(fl => (
                  <Picker.Item key={fl} label={`${fl}mm`} value={fl} />
                ))}
              </Picker>
            </View>
          </View>

          {/* 光圈 */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>{t('calculator.dof.aperture')}:</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={aperture}
                onValueChange={(value) => setAperture(value)}
                style={styles.pickerStyle}
              >
                {APERTURE_VALUES.map(val => (
                  <Picker.Item key={val} label={`f/${val}`} value={val} />
                ))}
              </Picker>
            </View>
          </View>

          {/* 对焦距离 */}
          <AppTextInput
            label={`${t('calculator.dof.focusDistance')} (${t('calculator.dof.focusDistanceUnit')})`}
            value={focusDistance.toString()}
            onChangeText={(text) => {
              const num = parseFloat(text);
              if (!isNaN(num) && num > 0) {
                setFocusDistance(num);
              }
            }}
            keyboardType="decimal-pad"
            placeholder="3"
          />
        </Card>

        {/* 计算按钮 */}
        <AppButton
          title={t('calculator.dof.calculate')}
          onPress={handleCalculate}
          variant="accent"
          style={styles.calculateButton}
        />

        {/* 计算结果 */}
        {result && (
          <>
            <Card style={styles.resultCard}>
              <Text style={styles.sectionTitle}>{t('calculator.dof.results')}</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>{t('calculator.dof.nearLimit')}:</Text>
                <Text style={styles.resultValue}>
                  {formatDistance(result.nearLimit)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>{t('calculator.dof.farLimit')}:</Text>
                <Text style={styles.resultValue}>
                  {formatDistance(result.farLimit)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>{t('calculator.dof.totalDof')}:</Text>
                <Text style={styles.resultValue}>
                  {formatDistance(result.totalDoF)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>{t('calculator.dof.nearLimit')}:</Text>
                <Text style={styles.resultValue}>
                  {formatDistance(result.inFrontOfSubject)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>{t('calculator.dof.farLimit')}:</Text>
                <Text style={styles.resultValue}>
                  {formatDistance(result.behindSubject)}
                </Text>
              </View>
            </Card>

            <Card style={styles.hyperFocalCard}>
              <Text style={styles.sectionTitle}>{t('calculator.dof.hyperfocal')}</Text>
              <Text style={styles.hyperFocalValue}>
                {formatDistance(result.hyperFocalDistance)}
              </Text>
              <Text style={styles.hyperFocalHint}>
                {t('calculator.dof.hyperfocalDesc')}
              </Text>
            </Card>
          </>
        )}

        {/* 使用提示 */}
        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 {t('calculator.dof.tips')}</Text>
          <Text style={styles.tipText}>
            <Text style={styles.bold}>{t('calculator.dof.portraitTip')}:</Text> {t('calculator.dof.portraitDesc')}{'\n\n'}
            <Text style={styles.bold}>{t('calculator.dof.landscapeTip')}:</Text> {t('calculator.dof.landscapeDesc')}{'\n\n'}
            <Text style={styles.bold}>{t('calculator.dof.streetTip')}:</Text> {t('calculator.dof.streetDesc')}
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
    marginBottom: Layout.spacing.md,
  },
  pickerContainer: {
    marginBottom: Layout.spacing.md,
  },
  pickerLabel: {
    fontSize: Layout.fontSize.base,
    marginBottom: Layout.spacing.xs,
  },
  picker: {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
  },
  pickerStyle: {
    color: colors.text,
  },
  calculateButton: {
    marginBottom: Layout.spacing.lg,
  },
  resultCard: {
    marginBottom: Layout.spacing.md,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  resultLabel: {
    fontSize: Layout.fontSize.base,
    color: colors.textSecondary,
  },
  resultValue: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.accent,
    marginVertical: Layout.spacing.sm,
  },
  hyperFocalCard: {
    marginBottom: Layout.spacing.md,
    alignItems: 'center',
  },
  hyperFocalValue: {
    fontSize: Layout.fontSize.hero,
    fontWeight: 'bold',
    color: colors.goldenHour,
    marginBottom: Layout.spacing.sm,
  },
  hyperFocalHint: {
    fontSize: Layout.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
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
  bold: {
    fontWeight: 'bold',
    color: colors.accent,
  },
});

export default DoFCalculator;
