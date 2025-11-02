import React from 'react';
import { View } from 'react-native';
import CalculatorNavigator from '../../navigation/CalculatorNavigator';
import { useTheme } from '../../contexts/ThemeContext';

const CalculatorScreen: React.FC = () => {
  const { theme } = useTheme();
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <CalculatorNavigator />
    </View>
  );
};

export default CalculatorScreen;
