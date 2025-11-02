import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Card } from '../../../components/common/Card';
import { AppButton } from '../../../components/common/AppButton';
import { AppTextInput } from '../../../components/common/AppTextInput';
import { Colors } from '../../../constants/Colors';
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
  const [aperture, setAperture] = useState(5.6);
  const [focalLength, setFocalLength] = useState(50);
  const [focusDistance, setFocusDistance] = useState(3);
  const [sensorIndex, setSensorIndex] = useState(0); // 全画幅默认
  const [result, setResult] = useState<any>(null);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>景深计算器</Text>
        <Text style={styles.description}>
          计算清晰范围和超焦距，精确控制景深
        </Text>

        {/* 参数输入 */}
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>相机和镜头设置</Text>

          {/* 传感器类型 */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>传感器类型:</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={sensorIndex}
                onValueChange={(value) => setSensorIndex(value)}
                style={styles.pickerStyle}
              >
                {SENSOR_TYPES.map((sensor, index) => (
                  <Picker.Item
                    key={index}
                    label={sensor.name}
                    value={index}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {/* 焦距 */}
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}>焦距 (mm):</Text>
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
            <Text style={styles.pickerLabel}>光圈:</Text>
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
            label="对焦距离 (米)"
            value={focusDistance.toString()}
            onChangeText={(text) => {
              const num = parseFloat(text);
              if (!isNaN(num) && num > 0) {
                setFocusDistance(num);
              }
            }}
            keyboardType="decimal-pad"
            placeholder="例如: 3"
          />
        </Card>

        {/* 计算按钮 */}
        <AppButton
          title="计算景深"
          onPress={handleCalculate}
          variant="accent"
          style={styles.calculateButton}
        />

        {/* 计算结果 */}
        {result && (
          <>
            <Card style={styles.resultCard}>
              <Text style={styles.sectionTitle}>清晰范围</Text>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>近点:</Text>
                <Text style={styles.resultValue}>
                  {formatDistance(result.nearLimit)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>远点:</Text>
                <Text style={styles.resultValue}>
                  {formatDistance(result.farLimit)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>总景深:</Text>
                <Text style={styles.resultValue}>
                  {formatDistance(result.totalDoF)}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>对焦点前:</Text>
                <Text style={styles.resultValue}>
                  {formatDistance(result.inFrontOfSubject)}
                </Text>
              </View>

              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>对焦点后:</Text>
                <Text style={styles.resultValue}>
                  {formatDistance(result.behindSubject)}
                </Text>
              </View>
            </Card>

            <Card style={styles.hyperFocalCard}>
              <Text style={styles.sectionTitle}>超焦距</Text>
              <Text style={styles.hyperFocalValue}>
                {formatDistance(result.hyperFocalDistance)}
              </Text>
              <Text style={styles.hyperFocalHint}>
                对焦在此距离，可使从超焦距的一半到无限远都清晰
              </Text>
            </Card>
          </>
        )}

        {/* 使用提示 */}
        <Card style={styles.tipCard}>
          <Text style={styles.tipTitle}>💡 使用场景</Text>
          <Text style={styles.tipText}>
            <Text style={styles.bold}>人像摄影:</Text> 使用大光圈（如 f/1.8），景深浅，背景虚化{'\n\n'}
            <Text style={styles.bold}>风光摄影:</Text> 使用小光圈（如 f/11），对焦在超焦距处，确保前景到远景都清晰{'\n\n'}
            <Text style={styles.bold}>街拍:</Text> 使用中等光圈（如 f/5.6），平衡景深和快门速度
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Layout.spacing.md,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Layout.spacing.sm,
  },
  description: {
    fontSize: Layout.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.lg,
  },
  card: {
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.accent,
    marginBottom: Layout.spacing.md,
  },
  pickerContainer: {
    marginBottom: Layout.spacing.md,
  },
  pickerLabel: {
    fontSize: Layout.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
  },
  picker: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
  },
  pickerStyle: {
    color: Colors.text,
  },
  calculateButton: {
    marginBottom: Layout.spacing.lg,
  },
  resultCard: {
    marginBottom: Layout.spacing.md,
    backgroundColor: Colors.primaryLight,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryDark,
  },
  resultLabel: {
    fontSize: Layout.fontSize.base,
    color: Colors.textSecondary,
  },
  resultValue: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.accent,
    marginVertical: Layout.spacing.sm,
  },
  hyperFocalCard: {
    marginBottom: Layout.spacing.md,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
  },
  hyperFocalValue: {
    fontSize: Layout.fontSize.hero,
    fontWeight: 'bold',
    color: Colors.goldenHour,
    marginBottom: Layout.spacing.sm,
  },
  hyperFocalHint: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tipCard: {
    backgroundColor: Colors.primaryLight,
    marginBottom: Layout.spacing.xl,
  },
  tipTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    color: Colors.goldenHour,
    marginBottom: Layout.spacing.md,
  },
  tipText: {
    fontSize: Layout.fontSize.base,
    color: Colors.text,
    lineHeight: 24,
  },
  bold: {
    fontWeight: 'bold',
    color: Colors.accent,
  },
});

export default DoFCalculator;
