import React from 'react';
import { View } from 'react-native';
import CalculatorNavigator from '../../navigation/CalculatorNavigator';
import { styles } from './styles';

const CalculatorScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <CalculatorNavigator />
    </View>
  );
};

export default CalculatorScreen;
