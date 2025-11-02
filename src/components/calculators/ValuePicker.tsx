import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Dimensions,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { Layout } from '../../constants/Layout';

interface ValuePickerProps<T> {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onValueChange: (value: T) => void;
  disabled?: boolean;
  formatValue?: (value: T) => string;
}

/**
 * 优化的数值选择器组件
 * 使用模态框和列表视图，提供更好的用户体验
 * 支持泛型，可用于各种类型的值选择
 */
export function ValuePicker<T>({
  label,
  value,
  options,
  onValueChange,
  disabled = false,
  formatValue,
}: ValuePickerProps<T>) {
  const [modalVisible, setModalVisible] = useState(false);

  const displayValue = formatValue
    ? formatValue(value)
    : options.find((opt) => opt.value === value)?.label || String(value);

  const handleSelect = (selectedValue: T) => {
    onValueChange(selectedValue);
    setModalVisible(false);
  };

  return (
    <>
      <View style={styles.container}>
        <Text style={styles.label}>{label}</Text>
        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={() => !disabled && setModalVisible(true)}
          disabled={disabled}
        >
          <Text style={[styles.buttonText, disabled && styles.buttonTextDisabled]}>
            {displayValue}
          </Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* 标题栏 */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>选择 {label}</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* 选项列表 */}
            <FlatList
              data={options}
              keyExtractor={(item, index) => `${index}-${item.label}`}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.option,
                      isSelected && styles.optionSelected,
                    ]}
                    onPress={() => handleSelect(item.value)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {isSelected && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                );
              }}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
              showsVerticalScrollIndicator={true}
              style={styles.list}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontSize: Layout.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Layout.spacing.xs,
    fontWeight: '600',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryDark,
  },
  buttonDisabled: {
    backgroundColor: Colors.primaryDark,
    opacity: 0.5,
  },
  buttonText: {
    fontSize: Layout.fontSize.lg,
    color: Colors.text,
    fontWeight: '600',
  },
  buttonTextDisabled: {
    color: Colors.textDisabled,
  },
  arrow: {
    fontSize: Layout.fontSize.sm,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Layout.borderRadius.xl,
    borderTopRightRadius: Layout.borderRadius.xl,
    maxHeight: height * 0.7,
    paddingBottom: Layout.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primaryDark,
  },
  modalTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: Layout.fontSize.xl,
    color: Colors.text,
    fontWeight: 'bold',
  },
  list: {
    flex: 1,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    backgroundColor: Colors.surface,
  },
  optionSelected: {
    backgroundColor: Colors.primaryLight,
  },
  optionText: {
    fontSize: Layout.fontSize.base,
    color: Colors.text,
  },
  optionTextSelected: {
    color: Colors.accent,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: Layout.fontSize.xl,
    color: Colors.accent,
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.primaryDark,
  },
});
