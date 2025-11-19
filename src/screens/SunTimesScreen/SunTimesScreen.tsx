import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { createStyles } from './styles';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { formatTime, formatDate } from '../../utils/formatters';
import { getTimezoneDisplayName } from '../../utils/timezone';
import LocationSearch from '../../components/LocationSearch';

// Custom Hooks & Utils
import { useLocation } from '../../hooks/useLocation';
import { useSunTimes } from '../../hooks/useSunTimes';
import { formatLocationName } from '../../utils/locationHelpers';

const SunTimesScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Use Custom Hooks
  const { 
    location, 
    locationName, 
    timezoneInfo, 
    loading: locationLoading, 
    error: locationError,
    getCurrentLocation, 
    updateLocationData 
  } = useLocation();

  const { 
    sunTimes, 
    loading: sunTimesLoading, 
    error: sunTimesError,
    fetchSunTimes 
  } = useSunTimes();

  // Effect: Fetch sun times when location or date changes
  useEffect(() => {
    if (location && timezoneInfo.timezone) {
      fetchSunTimes(location.latitude, location.longitude, selectedDate, timezoneInfo.timezone);
    }
  }, [location, timezoneInfo.timezone, selectedDate, fetchSunTimes]);

  // Effect: Error handling
  useEffect(() => {
    if (locationError) {
       Alert.alert(t('common.error'), locationError);
    }
    if (sunTimesError) {
       Alert.alert(t('sunTimes.errorTitle'), sunTimesError);
    }
  }, [locationError, sunTimesError, t]);

  // Handle location selection
  const handleLocationSelect = async (latitude: number, longitude: number, name: string) => {
    await updateLocationData(latitude, longitude, name);
  };

  // Date Navigation
  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Render helper
  const renderTimeItem = (label: string, time: Date, color: string) => {
    return (
      <View style={styles.timeItem}>
        <View style={[styles.colorIndicator, { backgroundColor: color }]} />
        <View style={styles.timeContent}>
          <Text style={styles.timeLabel}>{label}</Text>
          <Text style={styles.timeValue}>{formatTime(time, timezoneInfo.timezone)}</Text>
        </View>
      </View>
    );
  };

  const isLoading = locationLoading || sunTimesLoading;

  // Show loading only if we don't have data yet (initial load)
  if (isLoading && !sunTimes) {
    return <LoadingIndicator message={t('common.loading')} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      <Card style={styles.locationCard}>
        {location && locationName ? (
          <View style={styles.locationHeader}>
            <Text style={styles.locationTitle}>
              {formatLocationName(locationName)}
            </Text>
            {timezoneInfo.timezone && (
              <Text style={styles.locationSubtitle}>
                {getTimezoneDisplayName(timezoneInfo.timezone, timezoneInfo.offset)} · {location.latitude.toFixed(4)}°, {location.longitude.toFixed(4)}°
              </Text>
            )}
            <Text style={[styles.locationSubtitle, { marginTop: 4 }]}>
              {t('sunTimes.currentLocalTime') || '当地时间'}: {(() => {
                  const now = new Date();
                  try {
                    const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
                      timeZone: timezoneInfo.timezone,
                      month: 'numeric',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    });
                    return dateFormatter.format(now);
                  } catch (e) {
                    return '';
                  }
                })()}
            </Text>
          </View>
        ) : null}

        <LocationSearch 
          onLocationSelect={handleLocationSelect}
          onRefreshLocation={getCurrentLocation}
        />
      </Card>

      {/* Date Navigator */}
      <View style={styles.dateNavContainer}>
        <TouchableOpacity onPress={handlePrevDay} style={styles.navButton}>
          <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>←</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleToday}>
          <Text style={[styles.dateText, { color: theme.colors.text }]}>
            {formatDate(selectedDate)}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handleNextDay} style={styles.navButton}>
          <Text style={[styles.navButtonText, { color: theme.colors.primary }]}>→</Text>
        </TouchableOpacity>
      </View>

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
              <Text style={styles.infoValue}>{formatTime(sunTimes.solarNoon, timezoneInfo.timezone)}</Text>
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
