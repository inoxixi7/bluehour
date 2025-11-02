import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';
import {
  APERTURE_VALUES,
  SHUTTER_SPEEDS,
  ISO_VALUES,
} from '../../constants/Photography';
import {
  formatAperture,
  formatShutterSpeed,
  formatISO,
} from '../../utils/formatters';

interface ExposureValueInputProps {
  aperture: number;
  shutter: number;
  iso: number;
  onApertureChange: (value: number) => void;
  onShutterChange: (value: number) => void;
  onISOChange: (value: number) => void;
  lockAperture?: boolean;
  lockShutter?: boolean;
  lockISO?: boolean;
  showLabels?: boolean;
}

/**
 * 曝光三要素联动输入组件
 * 用于 EV 计算器等需要同时调整光圈、快门、ISO 的场景
 */
export const ExposureValueInput: React.FC<ExposureValueInputProps> = ({
  aperture,
  shutter,
  iso,
  onApertureChange,
  onShutterChange,
  onISOChange,
  lockAperture = false,
  lockShutter = false,
  lockISO = false,
  showLabels = true,
}) => {
  return (
    <View style={styles.container}>
      {/* 光圈选择 */}
      <View style={styles.inputGroup}>
        {showLabels && (
          <View style={styles.labelRow}>
            <Text style={styles.label}>光圈</Text>
            {lockAperture && <Text style={styles.lockBadge}>🔒</Text>}
          </View>
        )}
        <View style={[styles.pickerContainer, lockAperture && styles.locked]}>
          <Picker
            selectedValue={aperture}
            onValueChange={onApertureChange}
            enabled={!lockAperture}
            style={styles.picker}
          >
            {APERTURE_VALUES.map((val) => (
              <Picker.Item
                key={val}
                label={formatAperture(val)}
                value={val}
                color={lockAperture ? Colors.textDisabled : Colors.text}
              />
            ))}
          </Picker>
        </View>
        <Text style={styles.displayValue}>{formatAperture(aperture)}</Text>
      </View>

      {/* 快门选择 */}
      <View style={styles.inputGroup}>
        {showLabels && (
          <View style={styles.labelRow}>
            <Text style={styles.label}>快门</Text>
            {lockShutter && <Text style={styles.lockBadge}>🔒</Text>}
          </View>
        )}
        <View style={[styles.pickerContainer, lockShutter && styles.locked]}>
          <Picker
            selectedValue={shutter}
            onValueChange={onShutterChange}
            enabled={!lockShutter}
            style={styles.picker}
          >
            {SHUTTER_SPEEDS.map((item) => (
              <Picker.Item
                key={item.label}
                label={item.label}
                value={item.value}
                color={lockShutter ? Colors.textDisabled : Colors.text}
              />
            ))}
          </Picker>
        </View>
        <Text style={styles.displayValue}>{formatShutterSpeed(shutter)}</Text>
      </View>

      {/* ISO 选择 */}
      <View style={styles.inputGroup}>
        {showLabels && (
          <View style={styles.labelRow}>
            <Text style={styles.label}>ISO</Text>
            {lockISO && <Text style={styles.lockBadge}>🔒</Text>}
          </View>
        )}
        <View style={[styles.pickerContainer, lockISO && styles.locked]}>
          <Picker
            selectedValue={iso}
            onValueChange={onISOChange}
            enabled={!lockISO}
            style={styles.picker}
          >
            {ISO_VALUES.map((val) => (
              <Picker.Item
                key={val}
                label={formatISO(val)}
                value={val}
                color={lockISO ? Colors.textDisabled : Colors.text}
              />
            ))}
          </Picker>
        </View>
        <Text style={styles.displayValue}>{formatISO(iso)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Layout.spacing.md,
  },
  inputGroup: {
    marginBottom: Layout.spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  label: {
    fontSize: Layout.fontSize.base,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  lockBadge: {
    marginLeft: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
  },
  pickerContainer: {
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  locked: {
    backgroundColor: Colors.primaryDark,
    borderColor: Colors.textDisabled,
    opacity: 0.6,
  },
  picker: {
    color: Colors.text,
    height: 50,
  },
  displayValue: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '600',
    color: Colors.accent,
    textAlign: 'center',
    marginTop: Layout.spacing.xs,
  },
});
