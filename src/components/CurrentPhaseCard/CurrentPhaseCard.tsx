import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';
import { getSunTimes } from '../../api/sunTimeService';
import { getTimezone, reverseGeocode } from '../../api/geocodingService';
import { getCurrentTimeInTimezone } from '../../utils/timezone';
import { getCurrentLocation } from '../../utils/location';
import { ProcessedSunTimes } from '../../types/api';

interface PhaseInfo {
  name: string;
  emoji: string;
  color: string;
  isActive: boolean;
  minutesUntil?: number;
  nextPhaseName?: string;
}

const CurrentPhaseCard: React.FC = () => {
  const { theme } = useTheme();
  const [phaseInfo, setPhaseInfo] = useState<PhaseInfo | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCurrentPhase = (sunTimes: ProcessedSunTimes, now: Date): PhaseInfo => {
    const currentTime = now.getTime();

    // 定义所有时段
    const phases = [
      {
        name: '早晨蓝调时刻',
        emoji: '🌌',
        start: sunTimes.morningBlueHourStart.getTime(),
        end: sunTimes.morningBlueHourEnd.getTime(),
        color: theme.colors.blueHour,
      },
      {
        name: '早晨黄金时刻',
        emoji: '🌅',
        start: sunTimes.morningGoldenHourStart.getTime(),
        end: sunTimes.morningGoldenHourEnd.getTime(),
        color: theme.colors.goldenHour,
      },
      {
        name: '白天',
        emoji: '☀️',
        start: sunTimes.morningGoldenHourEnd.getTime(),
        end: sunTimes.eveningGoldenHourStart.getTime(),
        color: theme.colors.primary,
      },
      {
        name: '傍晚黄金时刻',
        emoji: '🌄',
        start: sunTimes.eveningGoldenHourStart.getTime(),
        end: sunTimes.eveningGoldenHourEnd.getTime(),
        color: theme.colors.goldenHour,
      },
      {
        name: '傍晚蓝调时刻',
        emoji: '🌆',
        start: sunTimes.eveningBlueHourStart.getTime(),
        end: sunTimes.eveningBlueHourEnd.getTime(),
        color: theme.colors.blueHour,
      },
      {
        name: '夜晚',
        emoji: '🌙',
        start: sunTimes.eveningBlueHourEnd.getTime(),
        end: sunTimes.morningBlueHourStart.getTime() + 24 * 60 * 60 * 1000, // 下一天的蓝调时刻
        color: theme.colors.textTertiary,
      },
    ];

    // 检查当前是否在某个时段内
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      if (currentTime >= phase.start && currentTime < phase.end) {
        // 当前在此时段内,显示距离该时段结束的时间
        const minutesUntilEnd = Math.floor((phase.end - currentTime) / (1000 * 60));
        
        // 找到下一个时段
        const nextPhase = phases[(i + 1) % phases.length];
        const isLastPhase = i === phases.length - 1;
        
        return {
          name: phase.name,
          emoji: phase.emoji,
          color: phase.color,
          isActive: true,
          minutesUntil: minutesUntilEnd,
          nextPhaseName: isLastPhase ? '明天的' + nextPhase.name : nextPhase.name,
        };
      }
    }

    // 如果不在任何时段内,找到下一个时段
    const sortedPhases = [...phases].sort((a, b) => a.start - b.start);
    
    for (const phase of sortedPhases) {
      if (phase.start > currentTime) {
        const minutesUntil = Math.floor((phase.start - currentTime) / (1000 * 60));
        return {
          name: phase.name,
          emoji: phase.emoji,
          color: phase.color,
          isActive: false,
          minutesUntil,
        };
      }
    }

    // 如果所有时段都已过,显示明天的第一个时段(早晨蓝调时刻)
    const tomorrowBlueHour = phases[0];
    const minutesUntil = Math.floor(
      (tomorrowBlueHour.start + 24 * 60 * 60 * 1000 - currentTime) / (1000 * 60)
    );
    
    return {
      name: tomorrowBlueHour.name,
      emoji: tomorrowBlueHour.emoji,
      color: tomorrowBlueHour.color,
      isActive: false,
      minutesUntil,
    };
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} 分钟`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours} 小时`;
    }
    return `${hours} 小时 ${mins} 分钟`;
  };

  const loadPhaseInfo = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📍 CurrentPhaseCard: 开始获取位置...');
      
      // 使用跨平台位置获取（自动处理 Web 和移动端）
      const { latitude, longitude } = await getCurrentLocation();
      
      console.log('📍 位置获取成功:', latitude, longitude);

      // 获取地点名称
      console.log('🌍 获取地点名称...');
      const locationDisplayName = await reverseGeocode(latitude, longitude);
      console.log('✅ 地点名称:', locationDisplayName);
      
      // 提取市级和国家名称
      const parts = locationDisplayName.split(',').map(p => p.trim());
      const country = parts[parts.length - 1];
      let city = parts[0];
      for (let i = 0; i < Math.min(3, parts.length); i++) {
        if (parts[i].includes('市') || parts[i].includes('City') || 
            parts[i].includes('Borough') || parts[i].includes('County')) {
          city = parts[i];
          break;
        }
      }
      setLocationName(`${city}, ${country}`);

      // 获取时区信息
      console.log('🌍 获取时区信息...');
      const timezoneInfo = await getTimezone(latitude, longitude);
      console.log('✅ 时区:', timezoneInfo.timezone, '偏移:', timezoneInfo.offset);

      // 获取太阳时间数据（不做任何转换）
      console.log('☀️ 获取太阳时间数据...');
      const sunTimes = await getSunTimes(latitude, longitude);
      console.log('✅ 太阳时间获取成功');
      
      // 使用当前的 UTC 时间来比较（因为 sunTimes 里的时间是 UTC）
      const now = new Date();
      console.log('🕐 当前 UTC 时间:', now.toISOString());
      
      // 计算当前时段
      const phase = getCurrentPhase(sunTimes, now);
      console.log('✅ 当前时段:', phase.name);
      
      setPhaseInfo(phase);
      setLoading(false);
    } catch (err) {
      console.error('❌ Error loading phase info:', err);
      setError(err instanceof Error ? err.message : '加载失败');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhaseInfo();

    // 每分钟更新一次
    const interval = setInterval(() => {
      loadPhaseInfo();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const styles = createStyles(theme.colors);

  if (loading) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🌅</Text>
          <View style={styles.textContainer}>
            <Text style={[styles.phaseName, { color: theme.colors.primary }]}>
              正在加载...
            </Text>
            <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
              正在获取当前时段信息
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (error || !phaseInfo) {
    return (
      <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
        <Text style={[styles.errorEmoji]}>⚠️</Text>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          {error || '无法获取时间信息'}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={styles.content}>
        <Text style={styles.emoji}>{phaseInfo.emoji}</Text>
        
        <View style={styles.textContainer}>
          {phaseInfo.isActive ? (
            <>
              <Text style={[styles.phaseName, { color: phaseInfo.color }]}>
                {phaseInfo.name}
              </Text>
              {phaseInfo.nextPhaseName && (
                <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
                  距离{phaseInfo.nextPhaseName}还有 {formatTime(phaseInfo.minutesUntil!)}
                </Text>
              )}
            </>
          ) : (
            <>
              <Text style={[styles.phaseName, { color: phaseInfo.color }]}>
                {phaseInfo.name}
              </Text>
              <Text style={[styles.statusText, { color: theme.colors.textSecondary }]}>
                距离{phaseInfo.name}还有 {formatTime(phaseInfo.minutesUntil!)}
              </Text>
            </>
          )}
          {locationName && (
            <Text style={[styles.locationText, { color: theme.colors.textTertiary }]}>
              📍 {locationName}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    card: {
      borderRadius: Layout.borderRadius.lg,
      borderWidth: 1,
      padding: Layout.spacing.lg,
      marginBottom: Layout.spacing.md,
      minHeight: 100,
      justifyContent: 'center',
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    emoji: {
      fontSize: 48,
      marginRight: Layout.spacing.md,
    },
    textContainer: {
      flex: 1,
    },
    statusText: {
      fontSize: Layout.fontSize.sm,
      marginBottom: Layout.spacing.xs,
    },
    locationText: {
      fontSize: Layout.fontSize.xs,
      marginTop: Layout.spacing.xs,
    },
    phaseName: {
      fontSize: Layout.fontSize.xl,
      fontWeight: 'bold',
    },
    countdown: {
      fontSize: Layout.fontSize.lg,
      fontWeight: '600',
    },
    loadingText: {
      marginTop: Layout.spacing.md,
      fontSize: Layout.fontSize.md,
      textAlign: 'center',
    },
    errorEmoji: {
      fontSize: 48,
      textAlign: 'center',
      marginBottom: Layout.spacing.sm,
    },
    errorText: {
      fontSize: Layout.fontSize.md,
      textAlign: 'center',
    },
  });

export default CurrentPhaseCard;
