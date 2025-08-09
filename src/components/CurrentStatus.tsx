import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { PhotographyPeriod, SunTimes } from '../types';

interface CurrentStatusProps {
  periodInfo: PhotographyPeriod;
  timeUntilNext: string | null;
  sunTimes: SunTimes;
}

// 根据阶段返回背景色
const getPhaseColor = (phase: string): string => {
  switch (phase) {
    case 'night':
      return '#0b132b';
    case 'first-light':
      return '#1c2541';
    case 'dawn':
      return '#3a506b';
    case 'sunrise':
      return '#f6ae2d';
    case 'day':
      return '#4dabf7';
    case 'golden-hour':
      return '#f4a261';
    case 'sunset':
      return '#e76f51';
    case 'blue-hour':
      return '#4361ee';
    default:
      return '#1a1a2e';
  }
};

// 阶段图标
const getPhaseIcon = (phase: string): string => {
  switch (phase) {
    case 'night':
      return '🌙';
    case 'first-light':
      return '🌄';
    case 'dawn':
      return '🌅';
    case 'sunrise':
      return '☀️';
    case 'day':
      return '🌤️';
    case 'golden-hour':
      return '✨';
    case 'sunset':
      return '🌇';
    case 'blue-hour':
      return '🌆';
    default:
      return '🕒';
  }
};

// 工具：字符串时间转分钟
const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(n => parseInt(n, 10));
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
};

// 日出后+60分钟
const calcGoldenEnd = (sunrise: string): string => {
  const total = timeToMinutes(sunrise) + 60;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`;
};

// 默认拍摄建议
const defaultTips: Record<string, string[]> = {
  night: ['尝试长曝光拍摄星空', '使用三脚架与快门线', '提高ISO注意降噪'],
  'first-light': ['拍摄山峦剪影', '注意光比，降低曝光', '提前到位取景'],
  dawn: ['光线柔和，适合风景与人像', '使用偏振镜增强天空层次', '尝试云层慢门'],
  sunrise: ['抓住光线变化的瞬间', '日出前后都值得拍摄', '逆光拍摄剪影'],
  day: ['利用阴影做构图', '尝试高快门凝固动态', '使用ND镜抑制过曝'],
  'golden-hour': ['暖色调人像与风景', '逆光拍摄剪影', '善用侧逆光'],
  sunset: ['注意天空色彩层次', '合理使用包围曝光', '寻找前景元素'],
  'blue-hour': ['城市灯光与蓝调天空结合', '小光圈制造星芒效果', '白平衡偏冷'],
};

export const CurrentStatus: React.FC<CurrentStatusProps> = ({ 
  periodInfo, 
  timeUntilNext, 
  sunTimes,
}) => {
  const [expandTips, setExpandTips] = useState(false);
  const bgColor = getPhaseColor(periodInfo.phase);
  const icon = getPhaseIcon(periodInfo.phase);
  const tips = defaultTips[periodInfo.phase] || [];
  const tipsToShow = expandTips ? tips : tips.slice(0, 3);

  // 计算当前阶段进度（0~1），夜间不显示
  const progress = useMemo(() => {
    const phase = periodInfo.phase;

    // 确定起止
    let start: string | null = null;
    let end: string | null = null;
    if (phase === 'first-light') {
      start = sunTimes.firstLight; end = sunTimes.dawn;
    } else if (phase === 'dawn') {
      start = sunTimes.dawn; end = sunTimes.sunrise;
    } else if (phase === 'sunrise') {
      start = sunTimes.sunrise; end = calcGoldenEnd(sunTimes.sunrise);
    } else if (phase === 'day') {
      start = calcGoldenEnd(sunTimes.sunrise); end = sunTimes.goldenHour;
    } else if (phase === 'golden-hour') {
      start = sunTimes.goldenHour; end = sunTimes.sunset;
    } else if (phase === 'sunset') {
      start = sunTimes.sunset; end = sunTimes.dusk;
    } else if (phase === 'blue-hour') {
      start = sunTimes.dusk; end = sunTimes.lastLight;
    } else {
      return null; // night 等不显示
    }

    if (!start || !end) return null;

    const now = new Date();
    const nowStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    let s = timeToMinutes(start);
    let e = timeToMinutes(end);
    let n = timeToMinutes(nowStr);

    // 处理跨天（一般用不到，此处仅兜底）
    if (e < s) e += 24 * 60;
    if (n < s) n += (n > e ? 0 : (e > 24*60 ? 24*60 : 0));

    const total = Math.max(1, e - s);
    const done = Math.max(0, Math.min(total, n - s));
    return done / total;
  }, [periodInfo.phase, sunTimes]);

  const formatHHMM = (t?: string) => (t ? t.slice(0,5) : '--:--');

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}> 
      {/* 顶部行：阶段图标徽章 + 下一阶段信息 */}
      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{icon} {periodInfo.phase}</Text>
        </View>
        {timeUntilNext && (
          <View style={styles.nextPill}>
            <Text style={styles.nextPillText}>下一阶段 · {periodInfo.nextPhase} · {timeUntilNext}</Text>
          </View>
        )}
      </View>

      {periodInfo.phase === 'day' && (
        <View style={styles.sunTripleRow}>
          <View style={styles.sunTripleItem}>
            <Text style={styles.sunTripleLabel}>日出</Text>
            <Text style={styles.sunTripleValue}>{formatHHMM(sunTimes.sunrise)}</Text>
          </View>
          <View style={styles.sunTripleItem}>
            <Text style={styles.sunTripleLabel}>正午</Text>
            <Text style={styles.sunTripleValue}>{formatHHMM(sunTimes.solarNoon)}</Text>
          </View>
          <View style={styles.sunTripleItem}>
            <Text style={styles.sunTripleLabel}>日落</Text>
            <Text style={styles.sunTripleValue}>{formatHHMM(sunTimes.sunset)}</Text>
          </View>
        </View>
      )}

      {/* 微型进度条 */}
      {progress !== null && (
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
        </View>
      )}

      <Text style={styles.periodName}>{periodInfo.name}</Text>
      <Text style={styles.description} numberOfLines={2}>{periodInfo.description}</Text>

      {/* 拍摄建议：紧凑标签样式，可展开 */}
      {tips.length > 0 && (
        <View style={styles.tipsWrap}>
          {tipsToShow.map((tip, index) => (
            <View key={index} style={styles.tipChip}>
              <Text style={styles.tipChipText}>{tip}</Text>
            </View>
          ))}

          {tips.length > 3 && (
            <TouchableOpacity onPress={() => setExpandTips(!expandTips)} style={styles.moreChip}>
              <Text style={styles.moreChipText}>{expandTips ? '收起' : `展开更多 (${tips.length - 3})`}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  nextPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 999,
  },
  nextPillText: {
    fontSize: 12,
    color: '#ffd43b',
  },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.25)',
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: 6,
    backgroundColor: '#ffd43b',
  },
  periodName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'left',
    marginTop: 6,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
    lineHeight: 20,
  },
  tipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tipChip: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 6,
  },
  tipChipText: {
    color: '#fff',
    fontSize: 12,
  },
  moreChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  moreChipText: {
    color: '#fff',
    fontSize: 12,
  },
  sunTripleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, marginTop: 4 },
  sunTripleItem: { flex:1, alignItems:'center' },
  sunTripleLabel: { fontSize:10, color:'rgba(255,255,255,0.65)', marginBottom:2 },
  sunTripleValue: { fontSize:16, fontWeight:'600', color:'#fff' },
});
