import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { PhotographyPeriod, SunTimes } from "../types";
import { I18nContext } from '../i18n/context';
import * as I18nHelpers from '../i18n';

interface CurrentStatusProps {
  periodInfo: PhotographyPeriod;
  timeUntilNext: string | null;
  sunTimes: SunTimes;
}

// 根据阶段返回背景色
const getPhaseColor = (phase: string): string => {
  switch (phase) {
    case "night":
      return "#0b132b";
    case "first-light":
      return "#1c2541";
    case "dawn":
      return "#3a506b";
    case "sunrise":
      return "#f6ae2d";
    case "day":
      return "#4dabf7";
    case "golden-hour":
      return "#f4a261";
    case "sunset":
      return "#e76f51";
    case "blue-hour":
      return "#4361ee";
    default:
      return "#1a1a2e";
  }
};

// 阶段图标
const getPhaseIcon = (phase: string): string => {
  switch (phase) {
    case "night":
      return "🌙";
    case "first-light":
      return "🌄";
    case "dawn":
      return "🌅";
    case "sunrise":
      return "☀️";
    case "day":
      return "🌤️";
    case "golden-hour":
      return "✨";
    case "sunset":
      return "🌇";
    case "blue-hour":
      return "🌆";
    default:
      return "🕒";
  }
};

// 工具：字符串时间转分钟
const timeToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(":").map((n) => parseInt(n, 10));
  return (isNaN(h) ? 0 : h) * 60 + (isNaN(m) ? 0 : m);
};

// 日出后+60分钟
const calcGoldenEnd = (sunrise: string): string => {
  const total = timeToMinutes(sunrise) + 60;
  const h = Math.floor(total / 60) % 24;
  const m = total % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
};

// 进度条配色（提高对比度）
const BAR_COLORS: Record<string, { fill: string; text: string }> = {
  night:        { fill: '#2e4a6b', text: '#ffffff' },
  'first-light':{ fill: '#35597a', text: '#ffffff' },
  dawn:         { fill: '#50749a', text: '#ffffff' },
  sunrise:      { fill: '#ffcf66', text: '#3a2500' },
  day:          { fill: '#90d0ff', text: '#0d2b45' }, // 亮一些与背景区分
  'golden-hour':{ fill: '#ffbe63', text: '#422100' },
  sunset:       { fill: '#ff8a6c', text: '#2e0f0b' },
  'blue-hour':  { fill: '#6b8dff', text: '#ffffff' },
};
const getBarColors = (phase: string) => BAR_COLORS[phase] || { fill: '#ffd43b', text: '#1a1a1a' };

export const CurrentStatus: React.FC<CurrentStatusProps> = ({
  periodInfo,
  timeUntilNext,
  sunTimes,
}) => {
  const { t, locale } = React.useContext(I18nContext);
  const [expandTips, setExpandTips] = useState(false);
  const bgColor = getPhaseColor(periodInfo.phase);
  // const icon = getPhaseIcon(periodInfo.phase); // 图标已移除
  const tips = (I18nHelpers.getPhaseTips ? I18nHelpers.getPhaseTips(locale, periodInfo.phase) : []);
  const tipsToShow = expandTips ? tips : tips.slice(0, 3);

  // 计算当前阶段进度（0~1），夜间不显示
  const progress = useMemo(() => {
    const phase = periodInfo.phase;

    // 确定起止
    let start: string | null = null;
    let end: string | null = null;
    if (phase === "first-light") {
      start = sunTimes.firstLight;
      end = sunTimes.dawn;
    } else if (phase === "dawn") {
      start = sunTimes.dawn;
      end = sunTimes.sunrise;
    } else if (phase === "sunrise") {
      start = sunTimes.sunrise;
      end = calcGoldenEnd(sunTimes.sunrise);
    } else if (phase === "day") {
      start = calcGoldenEnd(sunTimes.sunrise);
      end = sunTimes.goldenHour;
    } else if (phase === "golden-hour") {
      start = sunTimes.goldenHour;
      end = sunTimes.sunset;
    } else if (phase === "sunset") {
      start = sunTimes.sunset;
      end = sunTimes.dusk;
    } else if (phase === "blue-hour") {
      start = sunTimes.dusk;
      end = sunTimes.lastLight;
    } else {
      return null; // night 等不显示
    }

    if (!start || !end) return null;

    // 使用目标地点当地时间 (UTC + 偏移)，避免设备所在时区影响
    const nowUtc = new Date();
    const utcMinutes = nowUtc.getUTCHours() * 60 + nowUtc.getUTCMinutes();
    const localMinutes = utcMinutes + (sunTimes.utcOffset || 0); // 可能超出 0~1440
    let n = ((localMinutes % (24*60)) + 24*60) % (24*60); // 归一化到 0-1439

    let s = timeToMinutes(start);
    let e = timeToMinutes(end);

    // 若跨天，简单处理：结束时间小于开始则加 24h
    if (e < s) e += 24 * 60;
    // 若当前时间逻辑落在下一天区间，也平移
    if (n < s) n += (e > 24*60 ? 24*60 : 0);

    const total = Math.max(1, e - s);
    const done = Math.max(0, Math.min(total, n - s));
    return done / total;
  }, [periodInfo.phase, sunTimes.firstLight, sunTimes.dawn, sunTimes.sunrise, sunTimes.goldenHour, sunTimes.sunset, sunTimes.dusk, sunTimes.lastLight, sunTimes.utcOffset]);

  const formatHHMM = (t?: string) => (t ? t.slice(0, 5) : "--:--");

  return (
  <View style={[styles.container, { backgroundColor: bgColor }]}>      

      {/* 时区与本地时间 */}
      <View style={styles.timezoneRow}>
        {(() => {
          const nowUtc = new Date();
          const utcMinutes = nowUtc.getUTCHours() * 60 + nowUtc.getUTCMinutes();
          const localMinutes = utcMinutes + (sunTimes.utcOffset || 0);
          const h = Math.floor(
            (((localMinutes % (24 * 60)) + 24 * 60) % (24 * 60)) / 60
          );
          const m = ((localMinutes % 60) + 60) % 60;
          const hh = h.toString().padStart(2, "0");
          const mm = m.toString().padStart(2, "0");
          const offsetH = (sunTimes.utcOffset / 60).toFixed(1);
          return (
            <>
              <Text style={styles.localTimeText}>
                {hh}:{mm}
              </Text>
              <Text style={styles.tzText}>
                -{sunTimes.timezone} (UTC{sunTimes.utcOffset >= 0 ? "+" : ""}
                {offsetH})
              </Text>
            </>
          );
        })()}
      </View>

      <View style={styles.sunTripleRow}>
        <View style={styles.sunTripleItem}>
          <Text style={styles.sunTripleLabel}>{t('sunrise')}</Text>
          <Text style={styles.sunTripleValue}>{formatHHMM(sunTimes.sunrise)}</Text>
        </View>
        <View style={styles.sunTripleItem}>
          <Text style={styles.sunTripleLabel}>{t('solarNoon')}</Text>
          <Text style={styles.sunTripleValue}>{formatHHMM(sunTimes.solarNoon)}</Text>
        </View>
        <View style={styles.sunTripleItem}>
          <Text style={styles.sunTripleLabel}>{t('sunset')}</Text>
          <Text style={styles.sunTripleValue}>{formatHHMM(sunTimes.sunset)}</Text>
        </View>
      </View>

      {/* 加大进度条并整合下一阶段倒计时 */}
      {progress !== null && (
        <View style={styles.bigProgressWrapper}>
      {(() => { const c = getBarColors(periodInfo.phase); return (
      <View style={styles.bigProgressTrack}>
            <View
              style={[
                styles.bigProgressFill,
        { width: `${Math.round(progress * 100)}%`, backgroundColor: c.fill } ,
              ]}
            />
            {timeUntilNext && (
              <View style={styles.progressLabelOverlay} pointerEvents="none">
        <Text style={[styles.progressLabelText, { color: c.text }]} numberOfLines={1}>
                  {t('nextPhase')} · {(I18nHelpers.getPhaseLabel ? I18nHelpers.getPhaseLabel(periodInfo.nextPhase, t) : periodInfo.nextPhase)} · {timeUntilNext}
                </Text>
              </View>
            )}
          </View>
      )})()}
        </View>
      )}

      <Text style={styles.periodName}>{t(`period_${periodInfo.phase.replace('-','_')}_name`)}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {t(`period_${periodInfo.phase.replace('-','_')}_desc`)}
      </Text>

      {/* 拍摄建议：紧凑标签样式，可展开 */}
      {tips.length > 0 && (
        <View style={styles.tipsWrap}>
          {tipsToShow.map((tip, index) => (
            <View key={index} style={styles.tipChip}>
              <Text style={styles.tipChipText}>{tip}</Text>
            </View>
          ))}

          {tips.length > 3 && (
            <TouchableOpacity
              onPress={() => setExpandTips(!expandTips)}
              style={styles.moreChip}
            >
              <Text style={styles.moreChipText}>
                {expandTips ? t('tipsCollapse') : `${t('tipsExpand')} (${tips.length - 3})`}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
  },
  /* 新进度条样式 */
  bigProgressWrapper: { marginTop: 4, marginBottom: 8 },
  bigProgressTrack: {
    height: 20,
    borderRadius: 20,
  backgroundColor: 'rgba(0,0,0,0.35)',
    overflow: 'hidden',
    position: 'relative',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.35)',
  },
  bigProgressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  // backgroundColor 动态设置
  },
  progressLabelOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  progressLabelText: {
    fontSize: 12,
    fontWeight: '600',
  color: '#1a1a1a',
  textShadowColor: 'rgba(0,0,0,0.35)',
  textShadowOffset: { width: 0, height: 1 },
  textShadowRadius: 2,
  },
  periodName: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "left",
    marginTop: 6,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 10,
    lineHeight: 20,
  },
  tipsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tipChip: {
    backgroundColor: "rgba(255,255,255,0.12)",
    borderColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 6,
    marginBottom: 6,
  },
  tipChipText: {
    color: "#fff",
    fontSize: 12,
  },
  moreChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  moreChipText: {
    color: "#fff",
    fontSize: 12,
  },
  sunTripleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 4,
  },
  sunTripleItem: { flex: 1, alignItems: "center" },
  sunTripleLabel: {
    fontSize: 10,
    color: "rgba(255,255,255,0.65)",
    marginBottom: 2,
  },
  sunTripleValue: { fontSize: 16, fontWeight: "600", color: "#fff" },
  timezoneRow: {
    flexDirection: "row",
    // justifyContent: "space-between",
    // alignItems: "center",
    marginBottom: 6,
  },
  tzText: { fontSize: 14, fontWeight: "600", color: "#fff" },
  localTimeText: { fontSize: 14, fontWeight: "600", color: "#fff" },
});
