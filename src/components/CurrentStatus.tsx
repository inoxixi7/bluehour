import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PhotographyPeriod } from '../types';

interface CurrentStatusProps {
  periodInfo: PhotographyPeriod;
  timeUntilNext: string | null;
}

export const CurrentStatus: React.FC<CurrentStatusProps> = ({ 
  periodInfo, 
  timeUntilNext 
}) => {
  return (
    <View style={[styles.container, { backgroundColor: periodInfo.color }]}>
      <Text style={styles.title}>当前时段</Text>
      <Text style={styles.periodName}>{periodInfo.name}</Text>
      <Text style={styles.description}>{periodInfo.description}</Text>
      
      {timeUntilNext && (
        <Text style={styles.nextTime}>
          下一时段: {timeUntilNext}
        </Text>
      )}
      
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>拍摄建议</Text>
        <ScrollView style={styles.tipsScroll} showsVerticalScrollIndicator={false}>
          {periodInfo.tips.map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 24,
    marginVertical: 10,
    minHeight: 250,
  },
  title: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  periodName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 22,
  },
  nextTime: {
    fontSize: 14,
    color: '#ffd43b',
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  tipsContainer: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  tipsScroll: {
    flex: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    fontSize: 16,
    color: '#ffd43b',
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
  },
});
