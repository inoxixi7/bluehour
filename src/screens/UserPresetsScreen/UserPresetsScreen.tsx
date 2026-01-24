/**
 * 用户预设屏幕
 * 全屏显示UserPresetsManager组件
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { UserPresetsManager } from '../../components/Settings/UserPresetsManager';
import { Layout } from '../../constants/Layout';

const UserPresetsScreen: React.FC = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <UserPresetsManager />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.spacing.md,
  },
});

export default UserPresetsScreen;
