import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SunTimes } from '../types';

interface TimeDisplayProps {
  sunTimes: SunTimes;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ sunTimes }) => {
  // 计算黄金时刻结束时间（日出后1小时）
  const calculateGoldenHourEnd = (sunriseStr: string): string => {
    const [hours, minutes] = sunriseStr.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + 60; // 加1小时
    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  const goldenHourEnd = calculateGoldenHourEnd(sunTimes.sunrise);

  return (
    <View style={styles.container}>
      <View style={styles.timeCard}>
        <Text style={styles.label}>第一道光</Text>
        <Text style={styles.time}>{sunTimes.firstLight}</Text>
      </View>
      
      <View style={styles.timeCard}>
        <Text style={styles.label}>日出</Text>
        <Text style={styles.time}>{sunTimes.sunrise}</Text>
      </View>
      
      <View style={styles.timeCard}>
        <Text style={styles.label}>黄金时刻</Text>
        <Text style={styles.time}>{sunTimes.sunrise} - {goldenHourEnd}</Text>
      </View>
      
      <View style={styles.timeCard}>
        <Text style={styles.label}>正午</Text>
        <Text style={styles.time}>{sunTimes.solarNoon}</Text>
      </View>
      
      <View style={styles.timeCard}>
        <Text style={styles.label}>黄金时刻 (傍晚)</Text>
        <Text style={styles.time}>{sunTimes.goldenHour}</Text>
      </View>
      
      <View style={styles.timeCard}>
        <Text style={styles.label}>日落</Text>
        <Text style={styles.time}>{sunTimes.sunset}</Text>
      </View>
      
      <View style={styles.timeCard}>
        <Text style={styles.label}>蓝色时刻</Text>
        <Text style={styles.time}>{sunTimes.dusk}</Text>
      </View>
      
      <View style={styles.timeCard}>
        <Text style={styles.label}>最后的光</Text>
        <Text style={styles.time}>{sunTimes.lastLight}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  timeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  label: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});
