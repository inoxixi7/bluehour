import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { createStyles } from './styles';
import { useTheme } from '../../contexts/ThemeContext';
import { Card } from '../../components/common/Card';
import { LoadingIndicator } from '../../components/common/LoadingIndicator';
import { formatTime, formatDate } from '../../utils/formatters';
import { getTimezoneDisplayName } from '../../utils/timezone';
import LocationSearch from '../../components/LocationSearch';
import { formatLocationName } from '../../utils/locationHelpers';
import { useLocationData } from '../../contexts/LocationDataContext';

const SunTimesScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);
  const navigation = useNavigation();
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Generate date range (today + next 6 days)
  const dateRange = useMemo(() => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, []);

  // Use shared location data context
  const { 
    location, 
    locationName, 
    timezoneInfo, 
    getSunTimesForDate,
    locationLoading, 
    sunTimesLoading,
    locationError,
    sunTimesError,
    getCurrentLocation, 
    updateLocationData,
    fetchSunTimes,
  } = useLocationData();
  
  // Get sun times for selected date from cache
  const sunTimes = getSunTimesForDate(selectedDate);

  // Effect: Update navigation title when location changes
  useEffect(() => {
    if (locationName) {
      navigation.setOptions({
        title: formatLocationName(locationName),
      });
    }
  }, [locationName, navigation]);

  // Effect: Fetch sun times when date changes
  useEffect(() => {
    if (location && timezoneInfo.timezone) {
      fetchSunTimes(selectedDate);
    }
  }, [selectedDate, location, timezoneInfo.timezone, fetchSunTimes]);

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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      <LocationSearch 
        onLocationSelect={handleLocationSelect}
        onRefreshLocation={getCurrentLocation}
      />

      {/* Date List */}
      <View style={styles.dateListContainer}>
        {dateRange.map((date, index) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          const isToday = date.toDateString() === new Date().toDateString();
          return (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedDate(date)}
              style={[
                styles.dateItem,
                { 
                  backgroundColor: isSelected ? theme.colors.primary : theme.colors.card,
                  borderColor: isToday && !isSelected ? theme.colors.primary : 'transparent',
                }
              ]}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.dateDay,
                { color: isSelected ? '#fff' : theme.colors.textSecondary }
              ]}>
                {date.toLocaleDateString(i18n.language, { weekday: 'short' })}
              </Text>
              <Text style={[
                styles.dateNumber,
                { color: isSelected ? '#fff' : theme.colors.text }
              ]}>
                {date.getDate()}
              </Text>
              <Text style={[
                styles.dateMonth,
                { color: isSelected ? '#fff' : theme.colors.textSecondary }
              ]}>
                {date.toLocaleDateString(i18n.language, { month: 'short' })}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {sunTimes && (
        <>
          <Card style={styles.timelineCard}>
            <Text style={styles.sectionTitle}>{t('sunTimes.morning')}</Text>
            {renderTimeItem(t('sunTimes.phases.astronomicalTwilightBegin'), sunTimes.astronomicalTwilightBegin, theme.colors.twilight)}
            {renderTimeItem(t('sunTimes.phases.nauticalTwilightBegin'), sunTimes.nauticalTwilightBegin, theme.colors.twilight)}
            {renderTimeItem(t('sunTimes.phases.morningBlueHourStart'), sunTimes.morningBlueHourStart, theme.colors.blueHour)}
            {renderTimeItem(t('sunTimes.phases.civilTwilightBegin'), sunTimes.civilTwilightBegin, theme.colors.twilight)}
            {renderTimeItem(t('sunTimes.phases.morningBlueHourEnd'), sunTimes.morningBlueHourEnd, theme.colors.blueHour)}
            {renderTimeItem(t('sunTimes.phases.sunrise'), sunTimes.sunrise, theme.colors.sunrise)}
            {renderTimeItem(t('sunTimes.phases.morningGoldenHourStart'), sunTimes.morningGoldenHourStart, theme.colors.goldenHour)}
            {renderTimeItem(t('sunTimes.phases.morningGoldenHourEnd'), sunTimes.morningGoldenHourEnd, theme.colors.goldenHour)}
          </Card>

          <Card style={styles.timelineCard}>
            <Text style={styles.sectionTitle}>{t('sunTimes.evening')}</Text>
            {renderTimeItem(t('sunTimes.phases.eveningGoldenHourStart'), sunTimes.eveningGoldenHourStart, theme.colors.goldenHour)}
            {renderTimeItem(t('sunTimes.phases.sunset'), sunTimes.sunset, theme.colors.sunset)}
            {renderTimeItem(t('sunTimes.phases.eveningGoldenHourEnd'), sunTimes.eveningGoldenHourEnd, theme.colors.goldenHour)}
            {renderTimeItem(t('sunTimes.phases.eveningBlueHourStart'), sunTimes.eveningBlueHourStart, theme.colors.blueHour)}
            {renderTimeItem(t('sunTimes.phases.civilTwilightEnd'), sunTimes.civilTwilightEnd, theme.colors.twilight)}
            {renderTimeItem(t('sunTimes.phases.eveningBlueHourEnd'), sunTimes.eveningBlueHourEnd, theme.colors.blueHour)}
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
