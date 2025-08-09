import React from 'react';
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
    setManualLocation({ latitude: res.latitude, longitude: res.longitude });
    setSelectedCityName(res.displayName);
    setTimeout(() => {
      refreshSunTimes();
    }, 10);
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
      {/* 顶部右上角搜索按钮 */}
      <View style={styles.headerBar}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity style={styles.searchBtn} onPress={() => setSearchVisible(true)}>
          <Text style={styles.searchIcon}>🔍</Text>
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

        <TimeDisplay sunTimes={sunTimes} />

        <View style={styles.locationInfo}>
          <Text style={styles.locationText}>
            {selectedCityName ? `📍 ${selectedCityName}` : `📍 位置: ${location?.latitude.toFixed(4)}, ${location?.longitude.toFixed(4)}`}
          </Text>
        </View>
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
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
  locationInfo: {
    marginTop: 20,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
  timezoneText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});
