import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SunTimes, PhotographyPhase } from '../types';
import { deriveDynamicPeriods } from '../utils/sunCalculations';

interface TimeDisplayProps {
  sunTimes: SunTimes;
  currentPhase?: PhotographyPhase | null;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ sunTimes, currentPhase }) => {
  // 使用动态推导的光照区间
  const dynamic = deriveDynamicPeriods(sunTimes);

  const formatHHMM = (t?: string) => (t ? t.slice(0,5) : '--:--');

  // 合并后的全部时刻条目（保持原先顺序）
  const items = [
    { key: 'firstLight', label: '第一道光', value: formatHHMM(sunTimes.firstLight) },
    { key: 'morningBlue', label: '蓝色时刻（早）', value: `${formatHHMM(dynamic.morningBlue.start)} - ${formatHHMM(dynamic.morningBlue.end)}` },
    { key: 'civilTwilightMorning', label: '曙光', value: `${formatHHMM(sunTimes.dawn)} - ${formatHHMM(sunTimes.sunrise)}` },
    { key: 'goldenMorning', label: '黄金时刻（早）', value: `${formatHHMM(dynamic.morningGolden.start)} - ${formatHHMM(dynamic.morningGolden.end)}` },
    { key: 'solarNoon', label: '白天', value: `${formatHHMM(sunTimes.sunrise)} - ${formatHHMM(sunTimes.sunset)}` },
    { key: 'goldenHour', label: '黄金时刻（晚）', value: `${formatHHMM(dynamic.eveningGolden.start)} - ${formatHHMM(dynamic.eveningGolden.end)}` },
    { key: 'civilTwilightEvening', label: '暮光', value: `${formatHHMM(sunTimes.sunset)} - ${formatHHMM(sunTimes.dusk)}` },
    { key: 'eveningBlue', label: '蓝色时刻（晚）', value: `${formatHHMM(dynamic.eveningBlue.start)} - ${formatHHMM(dynamic.eveningBlue.end)}` },
    { key: 'lastLight', label: '最后的光', value: formatHHMM(sunTimes.lastLight) },
  ] as const;

  // 将摄影阶段映射到时间轴 key（匹配现有 items）
  let activeKey: string | null = null;
  if (currentPhase) {
    switch (currentPhase) {
      case 'first-light':
        activeKey = 'firstLight'; break;
      case 'dawn':
        activeKey = 'civilTwilightMorning'; break;
      case 'sunrise':
        activeKey = 'goldenMorning'; break; // 早黄金区间
      case 'day':
        activeKey = 'solarNoon'; break; // 白天区间整体高亮
      case 'golden-hour':
        activeKey = 'goldenHour'; break;
      case 'sunset':
        activeKey = 'civilTwilightEvening'; break; // 暮光区间
      case 'blue-hour':
        activeKey = 'eveningBlue'; break;
      default:
        activeKey = null; // night 不高亮
    }
  }

  return (
    <View style={styles.wrapper}>
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
                    <Text style={styles.itemTitle}>{it.label}</Text>
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
  wrapper: { },
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
    backgroundColor: '#4dabf7',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.25)',
    position: 'absolute',
    left: 0,
    top: 14,
  },
  dotStart: {
    backgroundColor: '#4dabf7',
  },
  dotActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ffd43b',
    borderColor: 'rgba(255,255,255,0.35)',
    position: 'absolute',
    left: -2,
    top: 14,
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
    backgroundColor: 'rgba(255,212,59,0.18)',
    borderColor: 'rgba(255,212,59,0.55)',
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
