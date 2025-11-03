import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
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
      Alert.alert('错误', `获取日出日落时间失败: ${error.message || '未知错误'}`);
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
    return <LoadingIndicator message="加载中..." />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>蓝调时刻 & 黄金时刻</Text>
        <Text style={styles.subtitle}>计划您的完美拍摄时间</Text>
      </View>

      <Card style={styles.locationCard}>
        <Text style={styles.sectionTitle}>位置</Text>
        
        <LocationSearch onLocationSelect={handleLocationSelect} />

        {location && locationName && (
          <View style={styles.currentLocationInfo}>
            <Text style={styles.locationInfoLabel}>当前位置:</Text>
            <Text style={styles.locationInfoText}>{locationName}</Text>
            <Text style={styles.locationCoords}>
              {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
            </Text>
            {timezone && (
              <>
                <Text style={[styles.locationCoords, { marginTop: 4 }]}>
                  🌍 {getTimezoneDisplayName(timezone, timezoneOffset)}
                </Text>
                <Text style={[styles.locationCoords, { marginTop: 4 }]}>
                  🕐 当地时间: {(() => {
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
              </>
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.refreshButton, { backgroundColor: theme.colors.primary }]}
          onPress={getLocation}
          activeOpacity={0.7}
        >
          <Text style={styles.refreshButtonText}>🔄 刷新当前位置</Text>
        </TouchableOpacity>
      </Card>

      <Card style={styles.dateCard}>
        <Text style={styles.sectionTitle}>日期</Text>
        <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
      </Card>

      {sunTimes && (
        <>
          <Card style={styles.timelineCard}>
            <Text style={styles.sectionTitle}>早晨</Text>
            {renderTimeItem('天文晨昏蒙影开始', sunTimes.astronomicalTwilightBegin, theme.colors.twilight)}
            {renderTimeItem('航海晨昏蒙影开始', sunTimes.nauticalTwilightBegin, theme.colors.twilight)}
            {renderTimeItem('🔵 蓝色时刻开始', sunTimes.morningBlueHourStart, theme.colors.blueHour)}
            {renderTimeItem('民用晨昏蒙影开始', sunTimes.civilTwilightBegin, theme.colors.twilight)}
            {renderTimeItem('🔵 蓝色时刻结束', sunTimes.morningBlueHourEnd, theme.colors.blueHour)}
            {renderTimeItem('🌅 日出', sunTimes.sunrise, theme.colors.sunrise)}
            {renderTimeItem('✨ 黄金时刻开始', sunTimes.morningGoldenHourStart, theme.colors.goldenHour)}
            {renderTimeItem('✨ 黄金时刻结束', sunTimes.morningGoldenHourEnd, theme.colors.goldenHour)}
          </Card>

          <Card style={styles.timelineCard}>
            <Text style={styles.sectionTitle}>傍晚</Text>
            {renderTimeItem('✨ 黄金时刻开始', sunTimes.eveningGoldenHourStart, theme.colors.goldenHour)}
            {renderTimeItem('🌇 日落', sunTimes.sunset, theme.colors.sunset)}
            {renderTimeItem('✨ 黄金时刻结束', sunTimes.eveningGoldenHourEnd, theme.colors.goldenHour)}
            {renderTimeItem('🔵 蓝色时刻开始', sunTimes.eveningBlueHourStart, theme.colors.blueHour)}
            {renderTimeItem('民用晨昏蒙影结束', sunTimes.civilTwilightEnd, theme.colors.twilight)}
            {renderTimeItem('🔵 蓝色时刻结束', sunTimes.eveningBlueHourEnd, theme.colors.blueHour)}
            {renderTimeItem('航海晨昏蒙影结束', sunTimes.nauticalTwilightEnd, theme.colors.twilight)}
            {renderTimeItem('天文晨昏蒙影结束', sunTimes.astronomicalTwilightEnd, theme.colors.twilight)}
          </Card>

          <Card style={styles.infoCard}>
            <Text style={styles.sectionTitle}>其他信息</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>太阳正午:</Text>
              <Text style={styles.infoValue}>{formatTime(sunTimes.solarNoon)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>白昼长度:</Text>
              <Text style={styles.infoValue}>{Math.floor(sunTimes.dayLength / 60)}小时{Math.round(sunTimes.dayLength % 60)}分钟</Text>
            </View>
          </Card>
        </>
      )}
    </ScrollView>
  );
};

export default SunTimesScreen;
