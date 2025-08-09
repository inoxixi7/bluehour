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
import AppInfoModal from '../components/AppInfoModal';
import { I18nContext } from '../i18n/context';
import { AppLocale } from '../i18n';

export default function PhotographyTimerScreen() {
  const { location, loading: locationLoading, error: locationError, refreshLocation, placeName } = useLocation();
  const [manualLocation, setManualLocation] = React.useState<LocationCoords | null>(null); // 手动选定位置
  const { sunTimes, currentPeriodInfo, timeUntilNextPhase, loading: sunTimesLoading, error: sunTimesError, refreshSunTimes } = useSunTimes(location, manualLocation);
  const [searchVisible, setSearchVisible] = React.useState(false);
  const [infoVisible, setInfoVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedCityName, setSelectedCityName] = React.useState<string | null>(null);
  const { t, locale, setLocale } = React.useContext(I18nContext);

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
      t('errorLocationTitle'),
      locationError || t('errorLocationMessage'),
      [
        { text: t('retry'), onPress: refreshLocation },
        { text: t('cancel'), style: 'cancel' },
      ]
    );
  };

  const getGradientColors = (): readonly [string, string] => {
    if (!currentPeriodInfo) {
      return ['#1a1a2e', '#16213e'] as const;
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
  return [baseColor, '#0f0f1e'] as const;
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
            {locationLoading ? t('loadingLocation') : t('loadingSun')}
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
            {locationError ? t('errorLocationTitle') : t('errorSunTitle')}
          </Text>
          <Text style={styles.errorSubtext}>{locationError || sunTimesError}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={locationError ? handleLocationError : onRefresh}>
            <Text style={styles.retryButtonText}>{t('retry')}</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    );
  }

  if (!location || !sunTimes || !currentPeriodInfo) {
    return (
      <LinearGradient colors={['#1a1a2e', '#16213e']} style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>{t('loadingSun')}</Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={getGradientColors()} style={styles.container}>
      <View style={styles.headerBar}>
        <TouchableOpacity style={styles.iconBtnLeft} onPress={() => setSearchVisible(true)}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
        <View style={styles.locationCenterWrapper} pointerEvents="none">
          <Text style={styles.locationBadgeText} numberOfLines={1}>
            {selectedCityName ? selectedCityName : (placeName || (location ? `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}` : t('loadingLocation')))}
          </Text>
        </View>
        <TouchableOpacity style={styles.iconBtnRight} onPress={() => setInfoVisible(true)}>
          <Ionicons name="settings-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* 临时语言切换示例，可后续移入真正的设置面板 */}
      {false && (
        <View style={{ position: 'absolute', top: 90, right: 10, flexDirection: 'row', gap: 8 }}>
          {(['zh','en','ja','de'] as AppLocale[]).map(l => (
            <TouchableOpacity key={l} onPress={()=>setLocale(l)} style={{ padding:4, borderWidth:1, borderColor: l===locale? '#ffd43b':'rgba(255,255,255,0.3)', borderRadius:6 }}>
              <Text style={{ color:'#fff', fontSize:12 }}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
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
          sunTimes={sunTimes}
        />

        <TimeDisplay sunTimes={sunTimes} currentPhase={currentPeriodInfo.phase} />
      </ScrollView>
      <CitySearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSelect={(item) => handleCitySelect(item)}
      />
      <AppInfoModal visible={infoVisible} onClose={() => setInfoVisible(false)} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    zIndex: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  iconBtnLeft: { position: 'absolute', left: 16, paddingHorizontal: 6, paddingVertical: 12 },
  iconBtnRight: { position: 'absolute', right: 16, paddingHorizontal: 6, paddingVertical: 12 },
  locationCenterWrapper: { paddingHorizontal: 60, maxWidth: '80%' },
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
  locationBadgeCentered: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  locationBadgeText: { 
    color: 'rgba(255,255,255,0.85)', 
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center'
  },
});
