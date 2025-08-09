import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SunTimes, PhotographyPhase } from '../types';
import { deriveDynamicPeriods } from '../utils/sunCalculations';
import { I18nContext } from '../i18n/context';

interface TimeDisplayProps {
  sunTimes: SunTimes;
  currentPhase?: PhotographyPhase | null;
}

export const TimeDisplay: React.FC<TimeDisplayProps> = ({ sunTimes, currentPhase }) => {
  const { t } = React.useContext(I18nContext);
  // 使用动态推导的光照区间
  const dynamic = deriveDynamicPeriods(sunTimes);

  const formatHHMM = (t?: string) => (t ? t.slice(0,5) : '--:--');

  // 合并后的全部时刻条目（保持原先顺序）
  const items = [
    { key: 'firstLight', label: t('firstLight'), value: formatHHMM(sunTimes.firstLight) },
    { key: 'morningBlue', label: t('morningBlue'), value: `${formatHHMM(dynamic.morningBlue.start)} - ${formatHHMM(dynamic.morningBlue.end)}` },
    { key: 'civilTwilightMorning', label: t('dawnInterval'), value: `${formatHHMM(sunTimes.dawn)} - ${formatHHMM(sunTimes.sunrise)}` },
    { key: 'goldenMorning', label: t('morningGolden'), value: `${formatHHMM(dynamic.morningGolden.start)} - ${formatHHMM(dynamic.morningGolden.end)}` },
    { key: 'solarNoon', label: t('dayInterval'), value: `${formatHHMM(sunTimes.sunrise)} - ${formatHHMM(sunTimes.sunset)}` },
    { key: 'goldenHour', label: t('eveningGolden'), value: `${formatHHMM(dynamic.eveningGolden.start)} - ${formatHHMM(dynamic.eveningGolden.end)}` },
    { key: 'civilTwilightEvening', label: t('duskInterval'), value: `${formatHHMM(sunTimes.sunset)} - ${formatHHMM(sunTimes.dusk)}` },
    { key: 'eveningBlue', label: t('eveningBlue'), value: `${formatHHMM(dynamic.eveningBlue.start)} - ${formatHHMM(dynamic.eveningBlue.end)}` },
    { key: 'lastLight', label: t('lastLight'), value: formatHHMM(sunTimes.lastLight) },
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
      <Text style={styles.blockTitle}>{t('todayTimeline')}</Text>

      <View style={styles.timeline}>
        <View style={styles.line} />
        {items.map((it, idx) => {
          const isActive = it.key === activeKey;
          // 如果标题过长则换行显示时间
          const shouldWrap = it.label.length > 16; // 简单阈值，可根据需要调整
          return (
            <View key={it.key} style={styles.itemRow}>
              <View style={[styles.dot, idx === 0 && styles.dotStart, isActive && styles.dotActive]} />
              <View style={[styles.itemContent, isActive && styles.itemActive]}>
                <View style={shouldWrap ? styles.itemHeaderColumn : styles.itemHeader}>
                  <View style={styles.titleWrap}>
                    <Text style={styles.itemTitle}>{it.label}</Text>
                    {isActive && (
                      <View style={styles.activePill}>
                        <Text style={styles.activePillText}>{t('current')}</Text>
                      </View>
                    )}
                  </View>
                  {shouldWrap ? (
                    <Text style={[styles.itemTime, styles.itemTimeWrapped]}>{it.value}</Text>
                  ) : (
                    <Text numberOfLines={1} style={styles.itemTime}>{it.value}</Text>
                  )}
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
  itemHeaderColumn: {
    flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'flex-start',
  alignSelf: 'stretch',
  width: '100%',
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
    color: '#fff',
    fontSize: 10,
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
  itemTimeWrapped: {
  textAlign: 'right',
  marginLeft: 0,
  marginTop: 4,
  alignSelf: 'stretch',
  },
});
