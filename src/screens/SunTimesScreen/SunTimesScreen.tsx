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
import { ProcessedSunTimes } from '../../types/api';
import { formatTime, formatDate } from '../../utils/formatters';

const SunTimesScreen: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  
  const [loading, setLoading] = useState(false);
  const [sunTimes, setSunTimes] = useState<ProcessedSunTimes | null>(null);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // 获取用户位置
  const getLocation = async () => {
    try {
      setLoading(true);
      console.log('🌍 Requesting location permission...');
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('权限被拒绝', '需要位置权限才能获取日出日落时间');
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
      await fetchSunTimesData(coords.latitude, coords.longitude);
    } catch (error: any) {
      console.error('❌ Error getting location:', error);
      Alert.alert('错误', `获取位置失败: ${error.message || '未知错误'}`);
      setLoading(false);
    }
  };

  // 使用测试位置（北京）
  const useTestLocation = async () => {
    const testCoords = {
      latitude: 39.9042,
      longitude: 116.4074,
    };
    console.log('🧪 Using test location (Beijing):', testCoords);
    setLocation(testCoords);
    await fetchSunTimesData(testCoords.latitude, testCoords.longitude);
  };

  // 获取太阳时间数据
  const fetchSunTimesData = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const dateStr = selectedDate.toISOString().split('T')[0];
      console.log('📅 Fetching sun times for date:', dateStr);
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
          <Text style={styles.timeValue}>{formatTime(time)}</Text>
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
        {location ? (
          <View>
            <Text style={styles.locationText}>
              纬度: {location.latitude.toFixed(4)}°
            </Text>
            <Text style={styles.locationText}>
              经度: {location.longitude.toFixed(4)}°
            </Text>
          </View>
        ) : (
          <Text style={styles.locationText}>未选择位置</Text>
        )}
        <AppButton
          title="获取当前位置"
          onPress={getLocation}
          variant="accent"
          style={styles.locationButton}
        />
        <AppButton
          title="使用测试位置（北京）"
          onPress={useTestLocation}
          variant="outline"
          style={styles.locationButton}
        />
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
