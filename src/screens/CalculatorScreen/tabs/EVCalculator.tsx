import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Card } from '../../../components/common/Card';
import { AppButton } from '../../../components/common/AppButton';
import { useTheme } from '../../../contexts/ThemeContext';
import { Layout } from '../../../constants/Layout';
import { APERTURE_VALUES, SHUTTER_SPEEDS, ISO_VALUES } from '../../../constants/Photography';
import { calculateEquivalentExposure, calculateEV } from '../../../utils/photographyCalculations';
import { formatAperture, formatShutterSpeed, formatISO, formatEV } from '../../../utils/formatters';

const EVCalculator: React.FC = () => {
  const { theme } = useTheme();
  // 基准曝光设置
  const [baseAperture, setBaseAperture] = useState(5.6);
  const [baseShutter, setBaseShutter] = useState(1/125);
  const [baseISO, setBaseISO] = useState(100);

  // 新的曝光设置
  const [newAperture, setNewAperture] = useState(5.6);
  const [newShutter, setNewShutter] = useState(1/125);
  const [newISO, setNewISO] = useState(100);

  // 锁定的参数
  const [lockedParam, setLockedParam] = useState<'aperture' | 'shutter' | 'iso'>('iso');

  // 计算等效曝光
  const handleCalculate = () => {
    // 找出改变的参数
    let changedParam: 'aperture' | 'shutter' | 'iso' | null = null;
    if (newAperture !== baseAperture) changedParam = 'aperture';
    else if (newShutter !== baseShutter) changedParam = 'shutter';
    else if (newISO !== baseISO) changedParam = 'iso';

    if (!changedParam) {
      return; // 没有改变
    }

    const result = calculateEquivalentExposure(
      { aperture: baseAperture, shutter: baseShutter, iso: baseISO },
      changedParam,
      changedParam === 'aperture' ? newAperture : changedParam === 'shutter' ? newShutter : newISO,
      lockedParam
    );

    setNewAperture(result.aperture);
    setNewShutter(result.shutter);
    setNewISO(result.iso);
  };

  const baseEV = calculateEV(baseAperture, baseShutter, baseISO);
  const newEV = calculateEV(newAperture, newShutter, newISO);
  
  const styles = createStyles(theme.colors);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>EV 曝光等效计算器</Text>
        <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
          保持曝光量不变，自由调整光圈、快门和 ISO
        </Text>

        {/* 基准曝光 */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>基准曝光</Text>
          <Text style={[styles.evText, { color: theme.colors.primary }]}>{formatEV(baseEV)}</Text>

          <View style={[styles.paramRow, { borderBottomColor: theme.colors.divider }]}>
            <Text style={[styles.paramLabel, { color: theme.colors.textSecondary }]}>光圈:</Text>
            <Text style={[styles.paramValue, { color: theme.colors.text }]}>{formatAperture(baseAperture)}</Text>
          </View>
          
          <View style={[styles.paramRow, { borderBottomColor: theme.colors.divider }]}>
            <Text style={[styles.paramLabel, { color: theme.colors.textSecondary }]}>快门:</Text>
            <Text style={[styles.paramValue, { color: theme.colors.text }]}>{formatShutterSpeed(baseShutter)}</Text>
          </View>
          
          <View style={[styles.paramRow, { borderBottomColor: theme.colors.divider }]}>
            <Text style={[styles.paramLabel, { color: theme.colors.textSecondary }]}>ISO:</Text>
            <Text style={[styles.paramValue, { color: theme.colors.text }]}>{formatISO(baseISO)}</Text>
          </View>

          <AppButton
            title="重置为当前值"
            onPress={() => {
              setBaseAperture(newAperture);
              setBaseShutter(newShutter);
              setBaseISO(newISO);
            }}
            variant="outline"
            size="small"
            style={styles.resetButton}
          />
        </Card>

        {/* 新的曝光 */}
        <Card style={styles.card}>
          <Text style={[styles.sectionTitle, { color: theme.colors.accent }]}>调整曝光</Text>
          <Text style={[styles.evText, { color: theme.colors.primary }]}>{formatEV(newEV)}</Text>

          {/* 光圈选择 */}
          <View style={styles.pickerContainer}>
            <Text style={[styles.pickerLabel, { color: theme.colors.textSecondary }]}>光圈:</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={newAperture}
                onValueChange={(value) => setNewAperture(value)}
                style={styles.pickerStyle}
              >
                {APERTURE_VALUES.map(val => (
                  <Picker.Item key={val} label={`f/${val}`} value={val} />
                ))}
              </Picker>
            </View>
          </View>

          {/* 快门选择 */}
          <View style={styles.pickerContainer}>
            <Text style={[styles.pickerLabel, { color: theme.colors.textSecondary }]}>快门:</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={newShutter}
                onValueChange={(value) => setNewShutter(value)}
                style={styles.pickerStyle}
              >
                {SHUTTER_SPEEDS.map(item => (
                  <Picker.Item key={item.label} label={item.label} value={item.value} />
                ))}
              </Picker>
            </View>
          </View>

          {/* ISO 选择 */}
          <View style={styles.pickerContainer}>
            <Text style={[styles.pickerLabel, { color: theme.colors.textSecondary }]}>ISO:</Text>
            <View style={styles.picker}>
              <Picker
                selectedValue={newISO}
                onValueChange={(value) => setNewISO(value)}
                style={styles.pickerStyle}
              >
                {ISO_VALUES.map(val => (
                  <Picker.Item key={val} label={`ISO ${val}`} value={val} />
                ))}
              </Picker>
            </View>
          </View>

          {/* 锁定参数选择 */}
          <View style={styles.lockSection}>
            <Text style={[styles.lockTitle, { color: theme.colors.textSecondary }]}>锁定参数:</Text>
            <View style={styles.lockButtons}>
              <AppButton
                title="光圈"
                onPress={() => setLockedParam('aperture')}
                variant={lockedParam === 'aperture' ? 'accent' : 'outline'}
                size="small"
                style={styles.lockButton}
              />
              <AppButton
                title="快门"
                onPress={() => setLockedParam('shutter')}
                variant={lockedParam === 'shutter' ? 'accent' : 'outline'}
                size="small"
                style={styles.lockButton}
              />
              <AppButton
                title="ISO"
                onPress={() => setLockedParam('iso')}
                variant={lockedParam === 'iso' ? 'accent' : 'outline'}
                size="small"
                style={styles.lockButton}
              />
            </View>
          </View>

          <AppButton
            title="计算等效曝光"
            onPress={handleCalculate}
            variant="accent"
            style={styles.calculateButton}
          />
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
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.md,
  },
  evText: {
    fontSize: Layout.fontSize.title,
    fontWeight: 'bold',
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
  },
  paramLabel: {
    fontSize: Layout.fontSize.base,
  },
  paramValue: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
  },
  resetButton: {
    marginTop: Layout.spacing.md,
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
  lockSection: {
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  lockTitle: {
    fontSize: Layout.fontSize.base,
    marginBottom: Layout.spacing.sm,
  },
  lockButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lockButton: {
    flex: 1,
    marginHorizontal: Layout.spacing.xs,
  },
  calculateButton: {
    marginTop: Layout.spacing.md,
  },
});

export default EVCalculator;
