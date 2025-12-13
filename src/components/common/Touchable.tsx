import React from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp, Platform } from 'react-native';

interface TouchableProps extends PressableProps {
  style?: StyleProp<ViewStyle>;
  activeOpacity?: number;
  hoverOpacity?: number;
  children: React.ReactNode;
}

export const Touchable: React.FC<TouchableProps> = ({
  style,
  activeOpacity = 0.7,
  hoverOpacity = 0.8,
  children,
  ...props
}) => {
  return (
    <Pressable
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        style as ViewStyle,
        pressed && { opacity: activeOpacity },
        Platform.OS === 'web' && hovered && !pressed && { opacity: hoverOpacity, cursor: 'pointer' } as any,
      ]}
      {...props}
    >
      {children}
    </Pressable>
  );
};
