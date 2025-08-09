import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocation } from '../hooks/useLocation';
import { useSunTimes } from '../hooks/useSunTimes';
import { CurrentStatus } from '../components/CurrentStatus';
import { TimeDisplay } from '../components/TimeDisplay';
import { CitySearchModal } from '../components/CitySearchModal';
import { LocationCoords } from '../types';

export default function PhotographyTimerScreen() {
  const { location, loading: locationLoading, error: locationError, refreshLocation } = useLocation();
  const [manualLocation, setManualLocation] = React.useState<LocationCoords | null>(null); // 手动选定位置
  const { sunTimes, currentPeriodInfo, timeUntilNextPhase, loading: sunTimesLoading, error: sunTimesError, refreshSunTimes } = useSunTimes(location, manualLocation);
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedCityName, setSelectedCityName] = React.useState<string | null>(null);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshLocation();
    if (location) {
      await refreshSunTimes();
    }
    setRefreshing(false);
  }, [refreshLocation, refreshSunTimes, location]);

  const handleLocationError = () => {
    Alert.alert(
      '位置获取失败',
      locationError || '无法获取您的位置信息，请检查位置权限设置。',
      [
        { text: '重试', onPress: refreshLocation },
        { text: '取消', style: 'cancel' },
      ]
    );
  };

  const getGradientColors = () => {
    if (!currentPeriodInfo) {
      return ['#1a1a2e', '#16213e'];
    }

    const phase = currentPeriodInfo.phase;
    const colorMap: Record<string, string> = {
      night: '#0b132b',
      'first-light': '#1c2541',
      dawn: '#3a506b',
      sunrise: '#f6ae2d',
      day: '#4dabf7',
      'golden-hour': '#f4a261',
      sunset: '#e76f51',
      'blue-hour': '#4361ee',
    };

    const baseColor = colorMap[phase] || '#1a1a2e';
    return [baseColor, '#0f0f1e'];
  };

  // 当用户选择城市后，记录并触发刷新
  const handleCitySelect = (res: { latitude: number; longitude: number; displayName: string }) => {
    // 先设置手动位置（自动触发 useSunTimes 的 effect 按新坐标获取数据）
    setManualLocation({ latitude: res.latitude, longitude: res.longitude });
    setSelectedCityName(res.displayName);
    // 删除原先 setTimeout + refreshSunTimes 的手动刷新，避免在 state 尚未提交时用旧的有效坐标生成请求，造成随后新请求被标记为过期。
  };

  if (locationLoading || sunTimesLoading) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {locationLoading ? '获取位置信息中...' : '计算摄影时间中...'}
          </Text>
        </View>
      </LinearGradient>
    );
  }

  if (locationError || sunTimesError) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {locationError ? '无法获取位置信息' : '无法获取太阳时间'}
          </Text>
          <Text style={styles.errorSubtext}>{locationError || sunTimesError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={locationError ? handleLocationError : onRefresh}>
            <Text style={styles.retryButtonText}>重试</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (!location || !sunTimes || !currentPeriodInfo) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>计算摄影时间中...</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={getGradientColors()} style={styles.container}>
      {/* 顶部栏：左侧地点，右侧搜索 */}
      <View style={styles.headerBar}>
        <View style={styles.locationBadge}>
          <Text style={styles.locationBadgeText} numberOfLines={1}>
            {selectedCityName ? `${selectedCityName}` : (location ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}` : '获取位置中')}
          </Text>
        </View>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.searchBtn} onPress={() => setSearchVisible(true)}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#ffffff" />
        }
        showsVerticalScrollIndicator={false}
      >
        <CurrentStatus 
          periodInfo={currentPeriodInfo} 
          timeUntilNext={timeUntilNextPhase} 
          sunTimes={sunTimes} // 传递 sunTimes 以避免 undefined
        />

        <TimeDisplay sunTimes={sunTimes} currentPhase={currentPeriodInfo.phase} />

        {/* 移除原底部位置信息显示 */}
      </ScrollView>
      <CitySearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSelect={(item) => handleCitySelect(item)}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    position: 'absolute',
    top: 40,
    right: 16,
    left: 0,
    zIndex: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
  },
  searchBtn: {
    paddingHorizontal: 1,
    paddingVertical: 12,
  },
  searchIcon: {
    fontSize: 18,
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#ffffff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorSubtext: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#4dabf7',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationBadge: { 
    maxWidth: '55%', 
    paddingHorizontal: 12, 
    paddingVertical: 12, 
  },
  locationBadgeText: { 
    color: 'rgba(255,255,255,0.85)', 
    fontSize: 16 ,
    fontWeight: '600',
  },
});
