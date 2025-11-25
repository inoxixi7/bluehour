import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Layout } from '../../constants/Layout';

interface StepperProps {
  label: string;
  value: string;
  onIncrement: () => void;
  onDecrement: () => void;
  canIncrement?: boolean;
  canDecrement?: boolean;
  disabled?: boolean;
  textColor: string;
  buttonColor: string;
  disabledColor: string;
}

export const Stepper: React.FC<StepperProps> = ({
  label,
  value,
  onIncrement,
  onDecrement,
  canIncrement = true,
  canDecrement = true,
  disabled = false,
  textColor,
  buttonColor,
  disabledColor,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <View style={styles.controlRow}>
        <TouchableOpacity
          onPress={onDecrement}
          disabled={disabled || !canDecrement}
          style={[
            styles.button,
            { opacity: disabled || !canDecrement ? 0.3 : 1 }
          ]}
        >
          <Ionicons 
            name="remove-circle-outline" 
            size={32} 
            color={disabled || !canDecrement ? disabledColor : buttonColor} 
          />
        </TouchableOpacity>
        
        <View style={styles.valueContainer}>
          <Text style={[styles.value, { color: textColor, opacity: disabled ? 0.4 : 1 }]}>
            {value}
          </Text>
        </View>
        
        <TouchableOpacity
          onPress={onIncrement}
          disabled={disabled || !canIncrement}
          style={[
            styles.button,
            { opacity: disabled || !canIncrement ? 0.3 : 1 }
          ]}
        >
          <Ionicons 
            name="add-circle-outline" 
            size={32} 
            color={disabled || !canIncrement ? disabledColor : buttonColor} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    padding: Layout.spacing.xs,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
  },
  value: {
    fontSize: Layout.fontSize.xl,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
