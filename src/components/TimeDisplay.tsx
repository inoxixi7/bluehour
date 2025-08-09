import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SunTimes, PhotographyPhase } from '../types';

interface TimeDisplayProps {
  sunTimes: SunTimes;
  currentPhase?: PhotographyPhase | null;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ sunTimes, currentPhase }) => {
  // 计算黄金时刻结束时间（日出后1小时）
  const calculateGoldenHourEnd = (sunriseStr: string): string => {
    const parts = sunriseStr.split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    const totalMinutes = hours * 60 + minutes + 60; // +1小时
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMinutes = totalMinutes % 60;
    return `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
  };

  const goldenHourEnd = calculateGoldenHourEnd(sunTimes.sunrise);

  // 基础项（更常用）
  const baseItems = [
    { key: 'firstLight', label: '第一道光', icon: '🌄', value: sunTimes.firstLight },
    { key: 'dawn', label: '黎明', icon: '🌅', value: sunTimes.dawn },
    { key: 'sunrise', label: '日出', icon: '☀️', value: sunTimes.sunrise },
    { key: 'goldenMorning', label: '黄金时刻（早）', icon: '✨', value: `${sunTimes.sunrise} - ${goldenHourEnd}` },
    { key: 'solarNoon', label: '正午', icon: '🕛', value: sunTimes.solarNoon },
    { key: 'goldenHour', label: '黄金时刻（晚）', icon: '🌇', value: `${sunTimes.goldenHour} - 日落` },
    { key: 'sunset', label: '日落', icon: '🌇', value: sunTimes.sunset },
  ] as const;

  // 额外项（默认展示）
  const extraItems = [
    { key: 'dusk', label: '蓝色时刻', icon: '🌆', value: sunTimes.dusk },
    { key: 'lastLight', label: '最后的光', icon: '🌃', value: sunTimes.lastLight },
  ] as const;

  // 直接展示全部
  const items = [...baseItems, ...extraItems];

  // 将摄影阶段映射到时间轴 key
  const phaseToKey: Record<Exclude<PhotographyPhase, 'night' | 'day'>, string> = {
    'first-light': 'firstLight',
    'dawn': 'dawn',
    'sunrise': 'sunrise',
    'golden-hour': 'goldenHour',
    'sunset': 'sunset',
    'blue-hour': 'dusk',
  };
  const activeKey = currentPhase && (currentPhase === 'night' || currentPhase === 'day') ? null : (currentPhase ? phaseToKey[currentPhase as Exclude<PhotographyPhase, 'night' | 'day'>] : null);

  return (
    <View style={styles.container}>
      <Text style={styles.blockTitle}>今日时刻表</Text>

      <View style={styles.timeline}>
        <View style={styles.line} />
        {items.map((it, idx) => {
          const isActive = it.key === activeKey;
          return (
            <View key={it.key} style={styles.itemRow}>
              <View style={[styles.dot, idx === 0 && styles.dotStart, isActive && styles.dotActive]} />
              <View style={[styles.itemContent, isActive && styles.itemActive]}>
                <View style={styles.itemHeader}>
                  <View style={styles.titleWrap}>
                    <Text style={styles.itemTitle}>{it.icon} {it.label}</Text>
                    {isActive && (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>当前</Text>
                      </View>
                    )}
                  </View>
                  <Text numberOfLines={1} style={styles.itemTime}>{it.value}</Text>
                </View>
                {/* ...existing code... */}
              </View>
            </View>
          );
        })}
      </View>

      {/* 去掉展开/收起按钮 */}
    </View>
  );
};

const styles = StyleSheet.create({
  blockTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.85)',
    marginLeft: 16,
    marginBottom: 10,
  },
  timeline: {
    position: 'relative',
    paddingLeft: 22,
  },
  line: {
    position: 'absolute',
    left: 10,
    top: 6,
    bottom: 6,
    width: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffd43b',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.25)',
    position: 'absolute',
    left: 6,
    top: 14,
  },
  dotStart: {
    backgroundColor: '#4dabf7',
  },
  dotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22d3ee',
    borderColor: 'rgba(34,211,238,0.4)',
  },
  itemContent: {
    marginLeft: 14,
    flex: 1,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  itemActive: {
    backgroundColor: 'rgba(34,211,238,0.12)',
    borderColor: 'rgba(34,211,238,0.4)',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemTitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  activePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: 'rgba(34,211,238,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(34,211,238,0.5)',
    marginLeft: 8,
  },
  activePillText: {
    color: '#a5f3fc',
    fontSize: 11,
    fontWeight: '600',
  },
  itemTime: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'right',
    marginLeft: 8,
    flexShrink: 0,
  },
});
