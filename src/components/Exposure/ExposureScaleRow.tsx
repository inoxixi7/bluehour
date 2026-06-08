import React, { useEffect, useRef } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Layout } from '../../constants/Layout';
import { Touchable } from '../common/Touchable';

const SCALE_ITEM_WIDTH = 74;
const SCALE_SIDE_PADDING = SCALE_ITEM_WIDTH * 2;

export interface ScaleOption {
  label: string;
  value: number;
}

interface ExposureScaleRowProps {
  label: string;
  value: number;
  options: ScaleOption[];
  onValueChange: (value: number) => void;
  textColor: string;
  mutedColor: string;
  accentColor: string;
  compact?: boolean;
}

export const ExposureScaleRow: React.FC<ExposureScaleRowProps> = ({
  label,
  value,
  options,
  onValueChange,
  textColor,
  mutedColor,
  accentColor,
  compact = false,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(0, options.findIndex(option => option.value === value));
  const selectedOption = options[selectedIndex];

  useEffect(() => {
    scrollViewRef.current?.scrollTo({
      x: selectedIndex * SCALE_ITEM_WIDTH,
      animated: false,
    });
  }, [selectedIndex]);

  const commitNearestValue = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCALE_ITEM_WIDTH);
    const option = options[Math.max(0, Math.min(options.length - 1, index))];
    if (option && option.value !== value) {
      onValueChange(option.value);
    }
  };

  return (
    <View style={[styles.scaleRow, compact && styles.scaleRowCompact]}>
      <View style={styles.scaleHeader}>
        <Text style={[styles.scaleLabel, { color: mutedColor }]}>{label}</Text>
        <Text style={[styles.scaleValue, { color: textColor }]}>{selectedOption?.label}</Text>
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SCALE_ITEM_WIDTH}
        decelerationRate="fast"
        onMomentumScrollEnd={commitNearestValue}
        onScrollEndDrag={commitNearestValue}
        contentContainerStyle={styles.scaleScrollContent}
      >
        <View style={{ width: SCALE_SIDE_PADDING }} />
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const isMajor = index % 2 === 0 || isSelected;
          return (
            <Touchable
              key={`${option.value}-${index}`}
              style={styles.scaleItem}
              activeOpacity={0.8}
              onPress={() => onValueChange(option.value)}
            >
              <View
                style={[
                  styles.scaleTick,
                  isMajor && styles.scaleTickMajor,
                  { backgroundColor: isSelected ? accentColor : mutedColor },
                ]}
              />
              <Text
                style={[
                  styles.scaleItemText,
                  {
                    color: isSelected ? accentColor : textColor,
                    opacity: isSelected ? 1 : 0.48,
                    fontWeight: isSelected ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {option.label}
              </Text>
            </Touchable>
          );
        })}
        <View style={{ width: SCALE_SIDE_PADDING }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scaleRow: {
    height: 96,
    marginBottom: Layout.spacing.xs,
  },
  scaleRowCompact: {
    height: 82,
  },
  scaleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: Layout.spacing.xs,
    marginBottom: 2,
  },
  scaleLabel: {
    fontSize: Layout.fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scaleValue: {
    fontSize: Layout.fontSize.lg,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  scaleScrollContent: {
    alignItems: 'flex-start',
    paddingTop: 4,
  },
  scaleItem: {
    width: SCALE_ITEM_WIDTH,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 62,
  },
  scaleTick: {
    width: 2,
    height: 18,
    borderRadius: 1,
    marginBottom: 8,
    opacity: 0.55,
  },
  scaleTickMajor: {
    height: 30,
    opacity: 0.9,
  },
  scaleItemText: {
    fontSize: Layout.fontSize.sm,
    fontVariant: ['tabular-nums'],
    letterSpacing: 0,
  },
});
