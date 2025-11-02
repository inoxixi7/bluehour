import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'accent';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();
  
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      ...styles.button,
      ...styles[`button_${size}`],
    };

    switch (variant) {
      case 'primary':
        return { ...baseStyle, backgroundColor: theme.colors.buttonPrimary };
      case 'secondary':
        return { ...baseStyle, backgroundColor: theme.colors.buttonSecondary };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'accent':
        return { ...baseStyle, backgroundColor: theme.colors.accent };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...styles.text,
      ...styles[`text_${size}`],
    };

    if (variant === 'outline') {
      return { ...baseStyle, color: theme.colors.primary };
    }
    
    if (variant === 'secondary') {
      return { ...baseStyle, color: theme.colors.buttonSecondaryText };
    }

    return { ...baseStyle, color: theme.colors.buttonPrimaryText };
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.colors.primary : theme.colors.buttonPrimaryText} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Layout.shadow.small,
  },
  button_small: {
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
  },
  button_medium: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
  },
  button_large: {
    paddingVertical: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.xl,
  },
  text: {
    fontWeight: '600',
  },
  text_small: {
    fontSize: Layout.fontSize.sm,
  },
  text_medium: {
    fontSize: Layout.fontSize.base,
  },
  text_large: {
    fontSize: Layout.fontSize.lg,
  },
  disabled: {
    opacity: 0.5,
  },
});
