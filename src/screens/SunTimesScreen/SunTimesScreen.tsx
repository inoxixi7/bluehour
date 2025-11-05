import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Location from 'expo-location';
import { createStyles } from './styles';
import { useTheme } from '../../contexts/ThemeContext';
import { AppButton } from '../../components/common/AppButton';
import { Card } from '../../components/common/Card';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { getSunTimes } from '../../api/sunTimeService';
import { reverseGeocode, getTimezone } from '../../api/geocodingService';
import { ProcessedSunTimes } from '../../types/api';
import { formatTime, formatDate } from '../../utils/formatters';
import { getTimezoneDisplayName, getCurrentTimeInTimezone } from '../../utils/timezone';
import LocationSearch from '../../components/LocationSearch';

const SunTimesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  
  const [loading, setLoading] = useState(false);
  const [sunTimes, setSunTimes] = useState<ProcessedSunTimes | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationName, setLocationName] = useState<string>('');
  const [timezone, setTimezone] = useState<string>('');
  const [timezoneOffset, setTimezoneOffset] = useState<number>(0);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 组件加载时自动获取当前位置
  useEffect(() => {
    getLocation();
  }, []);

  // 获取用户位置
  const getLocation = async () => {
    try {
      setLoading(true);
      console.log('🌍 Requesting location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('⚠️ Location permission denied');
        setLoading(false);
        return;
      }

      console.log('📍 Getting current position...');
      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      
      console.log('✅ Location obtained:', coords);
      setLocation(coords);
      
      // 反向地理编码获取地址名称
      const name = await reverseGeocode(coords.latitude, coords.longitude);
      setLocationName(name);
      
      // 获取时区信息（使用离线库或按需远程查询）
      const timezoneInfo = await getTimezone(coords.latitude, coords.longitude);
      setTimezone(timezoneInfo.timezone);
      setTimezoneOffset(timezoneInfo.offset);

      await fetchSunTimesData(coords.latitude, coords.longitude);
    } catch (error: any) {
      console.error('❌ Error getting location:', error);
      setLoading(false);
    }
  };

  // 处理地点搜索选择
  const handleLocationSelect = async (latitude: number, longitude: number, name: string) => {
    console.log('📍 选择地点:', name, latitude, longitude);
    setLocation({ latitude, longitude });
    setLocationName(name);
    
    // 获取时区信息（使用离线库或按需远程查询）
    console.log('🌍 获取时区信息...');
    const timezoneInfo = await getTimezone(latitude, longitude);
    console.log('✅ 时区信息:', timezoneInfo);
    setTimezone(timezoneInfo.timezone);
    setTimezoneOffset(timezoneInfo.offset);

    await fetchSunTimesData(latitude, longitude);
  };

  // 获取太阳时间数据
  const fetchSunTimesData = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      
      // 获取目标地点的当地日期（而不是浏览器时区的日期）
      let dateStr: string;
      if (timezone) {
        // 使用目标时区获取当地日期
        const formatter = new Intl.DateTimeFormat('en-CA', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        dateStr = formatter.format(selectedDate); // 格式: YYYY-MM-DD
      } else {
        // 回退到浏览器时区
        dateStr = selectedDate.toISOString().split('T')[0];
      }
      
      console.log('📅 Fetching sun times for date:', dateStr);
      console.log('🌍 时区:', timezone);
      
      // 直接获取 API 数据，不做任何转换
      const data = await getSunTimes(lat, lng, dateStr);
      console.log('✅ Sun times data received:', data);
      
      setSunTimes(data);
    } catch (error: any) {
      console.error('❌ Error fetching sun times:', error);
      Alert.alert(
        t('sunTimes.errorTitle'), 
        `${t('sunTimes.errorMessage')}: ${error.message || t('sunTimes.unknownError')}`
      );
    } finally {
      setLoading(false);
    }
  };

  // 渲染时间项
  const renderTimeItem = (label: string, time: Date, color: string) => {
    return (
      <View style={styles.timeItem}>
        <View style={[styles.colorIndicator, { backgroundColor: color }]} />
        <View style={styles.timeContent}>
          <Text style={styles.timeLabel}>{label}</Text>
          <Text style={styles.timeValue}>{formatTime(time, timezone)}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return <LoadingIndicator message={t('common.loading')} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      <Card style={styles.locationCard}>
        {location && locationName && (
          <View style={styles.locationHeader}>
            <Text style={styles.locationTitle}>
              {(() => {
                // 从完整地址中提取市级和国家名称
                const parts = locationName.split(',').map(p => p.trim());
                const country = parts[parts.length - 1]; // 最后一部分是国家
                
                // 查找市级名称（通常包含"市"、"City"或在倒数第2-3个位置）
                let city = parts[0]; // 默认使用第一部分
                for (let i = 0; i < Math.min(3, parts.length); i++) {
                  if (parts[i].includes('市') || parts[i].includes('City') || 
                      parts[i].includes('Borough') || parts[i].includes('County')) {
                    city = parts[i];
                    break;
                  }
                }
                
                return `${city}, ${country}`;
              })()}
            </Text>
            {timezone && (
              <Text style={styles.locationSubtitle}>
                {getTimezoneDisplayName(timezone, timezoneOffset)} · {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}° · {(() => {
                  const now = new Date();
                  const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
                    timeZone: timezone,
                    month: 'numeric',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  });
                  return dateFormatter.format(now);
                })()}
              </Text>
            )}
          </View>
        )}

        <LocationSearch 
          onLocationSelect={handleLocationSelect}
          onRefreshLocation={getLocation}
        />
      </Card>

      {sunTimes && (
        <>
          <Card style={styles.timelineCard}>
            <Text style={styles.sectionTitle}>{t('sunTimes.morning')}</Text>
            {renderTimeItem(t('sunTimes.phases.astronomicalTwilightBegin'), sunTimes.astronomicalTwilightBegin, theme.colors.twilight)}
            {renderTimeItem(t('sunTimes.phases.nauticalTwilightBegin'), sunTimes.nauticalTwilightBegin, theme.colors.twilight)}
            {renderTimeItem('🔵 ' + t('sunTimes.phases.morningBlueHourStart'), sunTimes.morningBlueHourStart, theme.colors.blueHour)}
            {renderTimeItem(t('sunTimes.phases.civilTwilightBegin'), sunTimes.civilTwilightBegin, theme.colors.twilight)}
            {renderTimeItem('🔵 ' + t('sunTimes.phases.morningBlueHourEnd'), sunTimes.morningBlueHourEnd, theme.colors.blueHour)}
            {renderTimeItem('🌅 ' + t('sunTimes.phases.sunrise'), sunTimes.sunrise, theme.colors.sunrise)}
            {renderTimeItem('✨ ' + t('sunTimes.phases.morningGoldenHourStart'), sunTimes.morningGoldenHourStart, theme.colors.goldenHour)}
            {renderTimeItem('✨ ' + t('sunTimes.phases.morningGoldenHourEnd'), sunTimes.morningGoldenHourEnd, theme.colors.goldenHour)}
          </Card>

          <Card style={styles.timelineCard}>
            <Text style={styles.sectionTitle}>{t('sunTimes.evening')}</Text>
            {renderTimeItem('✨ ' + t('sunTimes.phases.eveningGoldenHourStart'), sunTimes.eveningGoldenHourStart, theme.colors.goldenHour)}
            {renderTimeItem('🌇 ' + t('sunTimes.phases.sunset'), sunTimes.sunset, theme.colors.sunset)}
            {renderTimeItem('✨ ' + t('sunTimes.phases.eveningGoldenHourEnd'), sunTimes.eveningGoldenHourEnd, theme.colors.goldenHour)}
            {renderTimeItem('🔵 ' + t('sunTimes.phases.eveningBlueHourStart'), sunTimes.eveningBlueHourStart, theme.colors.blueHour)}
            {renderTimeItem(t('sunTimes.phases.civilTwilightEnd'), sunTimes.civilTwilightEnd, theme.colors.twilight)}
            {renderTimeItem('🔵 ' + t('sunTimes.phases.eveningBlueHourEnd'), sunTimes.eveningBlueHourEnd, theme.colors.blueHour)}
            {renderTimeItem(t('sunTimes.phases.nauticalTwilightEnd'), sunTimes.nauticalTwilightEnd, theme.colors.twilight)}
            {renderTimeItem(t('sunTimes.phases.astronomicalTwilightEnd'), sunTimes.astronomicalTwilightEnd, theme.colors.twilight)}
          </Card>

          <Card style={styles.infoCard}>
            <Text style={styles.sectionTitle}>{t('sunTimes.otherInfo')}</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('sunTimes.solarNoonLabel')}:</Text>
              <Text style={styles.infoValue}>{formatTime(sunTimes.solarNoon)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t('sunTimes.dayLengthLabel')}:</Text>
              <Text style={styles.infoValue}>
                {t('sunTimes.timeFormat.hoursMinutes', {
                  hours: Math.floor(sunTimes.dayLength / 60),
                  minutes: Math.round(sunTimes.dayLength % 60)
                })}
              </Text>
            </View>
          </Card>
        </>
      )}
    </ScrollView>
  );
};

export default SunTimesScreen;
