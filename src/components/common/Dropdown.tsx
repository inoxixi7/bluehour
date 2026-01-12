import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Modal, FlatList, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { Layout } from '../../constants/Layout';
import { Touchable } from './Touchable';

interface DropdownOption {
  label: string;
  value: number;
}

interface DropdownProps {
  options: DropdownOption[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  placeholder?: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  accentColor: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  options,
  selectedValue,
  onValueChange,
  placeholder = 'Select...',
  textColor,
  backgroundColor,
  borderColor,
  accentColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempValue, setTempValue] = useState(selectedValue);

  const selectedOption = options.find(opt => opt.value === selectedValue);

  // 对于iOS，使用Modal模式的Picker
  if (Platform.OS === 'ios') {
    return (
      <>
        <Touchable
          onPress={() => {
            setTempValue(selectedValue);
            setIsOpen(true);
          }}
          style={[styles.pickerWrapper, { backgroundColor, borderColor }]}
        >
          <Text
            style={[
              styles.pickerText,
              { color: textColor },
              !selectedOption && styles.placeholderText,
            ]}
            numberOfLines={1}
          >
            {selectedOption?.label || placeholder}
          </Text>
          <Ionicons name="chevron-down" size={20} color={textColor} style={styles.icon} />
        </Touchable>

        <Modal
          visible={isOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setIsOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity 
              style={styles.modalBackdrop} 
              onPress={() => setIsOpen(false)}
              activeOpacity={1}
            />
            <View style={[styles.modalContent, { backgroundColor }]}>
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setIsOpen(false)}>
                  <Text style={[styles.modalButton, { color: accentColor }]}>取消</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    onValueChange(tempValue);
                    setIsOpen(false);
                  }}
                >
                  <Text style={[styles.modalButton, styles.modalButtonDone, { color: accentColor }]}>
                    完成
                  </Text>
                </TouchableOpacity>
              </View>
              <Picker
                selectedValue={tempValue}
                onValueChange={setTempValue}
                style={styles.iosPicker}
                itemStyle={{ color: textColor }}
              >
                {options.map((option) => (
                  <Picker.Item 
                    key={option.value} 
                    label={option.label} 
                    value={option.value}
                    color={textColor}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </Modal>
      </>
    );
  }

  // 对于Android，使用原生Picker
  if (Platform.OS === 'android') {
    return (
      <View style={[styles.pickerWrapper, { backgroundColor, borderColor }]}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={[styles.picker, { color: textColor }]}
          dropdownIconColor={textColor}
        >
          {options.map((option) => (
            <Picker.Item key={option.value} label={option.label} value={option.value} />
          ))}
        </Picker>
      </View>
    );
  }

  // Web版使用自定义下拉菜单
  return (
    <View style={[styles.container, isOpen && styles.containerOpen]}>
      <Touchable
        onPress={() => setIsOpen(!isOpen)}
        style={[
          styles.selector,
          { backgroundColor, borderColor },
          isOpen && { borderColor: accentColor, zIndex: 1000 },
        ]}
      >
        <Text
          style={[
            styles.selectorText,
            { color: textColor },
            !selectedOption && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={textColor}
          style={styles.icon}
        />
      </Touchable>

      {isOpen && (
        <>
          <TouchableOpacity 
            style={styles.backdrop} 
            onPress={() => setIsOpen(false)}
            activeOpacity={1}
          />
          <View style={[styles.dropdown, { backgroundColor, borderColor: accentColor }]}>
            <FlatList
              data={options}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <Touchable
                  onPress={() => {
                    onValueChange(item.value);
                    setIsOpen(false);
                  }}
                  style={[
                    styles.option,
                    item.value === selectedValue && { backgroundColor: accentColor + '15' },
                  ]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      { color: textColor },
                      item.value === selectedValue && { color: accentColor, fontWeight: '600' },
                    ]}
                    numberOfLines={1}
                  >
                    {item.label}
                  </Text>
                  {item.value === selectedValue && (
                    <Ionicons name="checkmark" size={18} color={accentColor} />
                  )}
                </Touchable>
              )}
              style={styles.optionsList}
              showsVerticalScrollIndicator={true}
            />
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1,
  },
  containerOpen: {
    zIndex: 1000,
  },
  pickerWrapper: {
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
    height: 50,
    justifyContent: 'center',
    ...(Platform.OS === 'ios' && {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Layout.spacing.md,
    }),
  },
  pickerText: {
    fontSize: Layout.fontSize.base,
    flex: 1,
  },
  picker: {
    height: 50,
    ...(Platform.OS === 'android' && { height: 50 }),
  },
  iosPicker: {
    height: 216, // iOS Picker标准高度
    width: '100%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    borderTopLeftRadius: Layout.borderRadius.lg,
    borderTopRightRadius: Layout.borderRadius.lg,
    paddingBottom: 34, // iOS底部安全区域
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalButton: {
    fontSize: Layout.fontSize.base,
    padding: Layout.spacing.xs,
  },
  modalButtonDone: {
    fontWeight: '600',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 50,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1.5,
    ...(Platform.OS === 'web' && { cursor: 'pointer' as any }),
  },
  selectorText: {
    fontSize: Layout.fontSize.base,
    flex: 1,
  },
  placeholderText: {
    opacity: 0.5,
  },
  icon: {
    marginLeft: Layout.spacing.xs,
  },
  backdrop: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1.5,
    maxHeight: 240,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    zIndex: 1001,
  },
  optionsList: {
    maxHeight: 240,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    minHeight: 44,
    ...(Platform.OS === 'web' && { cursor: 'pointer' as any }),
  },
  optionText: {
    fontSize: Layout.fontSize.base,
    flex: 1,
  },
});
