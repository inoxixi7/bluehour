import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions, NativeScrollEvent, NativeSyntheticEvent, TouchableOpacity } from 'react-native';
import { Layout } from '../../constants/Layout';

interface HorizontalScrollPickerProps {
  label: string;
  options: { value: number; label: string }[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  disabled?: boolean;
  textColor: string;
  accentColor: string;
  disabledColor: string;
}

const ITEM_WIDTH = 80;
const VISIBLE_ITEMS = 5;
const CONTAINER_WIDTH = ITEM_WIDTH * VISIBLE_ITEMS;
const SIDE_PADDING = ITEM_WIDTH * 2; // 左右各留2个位置

export const HorizontalScrollPicker: React.FC<HorizontalScrollPickerProps> = ({
  label,
  options,
  selectedValue,
  onValueChange,
  disabled = false,
  textColor,
  accentColor,
  disabledColor,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const selectedIndex = options.findIndex(opt => opt.value === selectedValue);

  useEffect(() => {
    // 初始化滚动位置
    if (selectedIndex >= 0) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ 
          x: selectedIndex * ITEM_WIDTH, 
          animated: false 
        });
      }, 100);
    }
  }, [selectedIndex]);

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (disabled) return;
    
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / ITEM_WIDTH);
    
    if (index >= 0 && index < options.length && options[index].value !== selectedValue) {
      onValueChange(options[index].value);
    }
  };

  const handleItemPress = (value: number, index: number) => {
    if (disabled) return;
    onValueChange(value);
    scrollViewRef.current?.scrollTo({ 
      x: index * ITEM_WIDTH, 
      animated: true 
    });
  };



  return (
    <View style={[styles.container, { opacity: disabled ? 0.4 : 1 }]}>
      {label ? <Text style={[styles.label, { color: textColor }]}>{label}</Text> : null}
      
      <View style={styles.pickerWrapper}>
        <View style={[styles.pickerContainer, { width: CONTAINER_WIDTH }]}>
          {/* 中心指示器 */}
          <View style={[styles.centerIndicator, { borderColor: accentColor }]} pointerEvents="none" />
          
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={ITEM_WIDTH}
            decelerationRate="fast"
            scrollEnabled={!disabled}
            onMomentumScrollEnd={handleMomentumScrollEnd}
            contentContainerStyle={styles.scrollContent}
          >
            {/* 左侧占位 */}
            <View style={{ width: SIDE_PADDING }} />
            
            {options.map((option, index) => {
              const isSelected = option.value === selectedValue;
              return (
                <TouchableOpacity
                  key={`${option.value}-${index}`}
                  style={styles.item}
                  activeOpacity={0.7}
                  onPress={() => handleItemPress(option.value, index)}
                  disabled={disabled}
                >
                  <Text
                    style={[
                      styles.itemText,
                      {
                        color: isSelected ? accentColor : textColor,
                        fontSize: isSelected ? Layout.fontSize.xl : Layout.fontSize.base,
                        fontWeight: isSelected ? '700' : '500',
                        opacity: isSelected ? 1 : 0.4,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
            
            {/* 右侧占位 */}
            <View style={{ width: SIDE_PADDING }} />
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 0,
  },
  label: {
    fontSize: Layout.fontSize.base,
    fontWeight: '600',
    marginBottom: Layout.spacing.xs,
  },
  pickerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerContainer: {
    height: 50,
    position: 'relative',
    overflow: 'hidden',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 0,
  },
  item: {
    width: ITEM_WIDTH,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontVariant: ['tabular-nums'],
  },
  centerIndicator: {
    position: 'absolute',
    left: ITEM_WIDTH * 2,
    top: 0,
    height: 50,
    width: ITEM_WIDTH,
    borderWidth: 2,
    borderRadius: Layout.borderRadius.lg,
    zIndex: 1,
    pointerEvents: 'none',
  },
});
