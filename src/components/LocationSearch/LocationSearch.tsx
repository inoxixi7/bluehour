import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';
import { searchLocation, GeocodingResult } from '../../api/geocodingService';

interface LocationSearchProps {
  onLocationSelect: (latitude: number, longitude: number, name: string) => void;
  placeholder?: string;
  onRefreshLocation?: () => void;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder,
  onRefreshLocation,
}) => {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  // 防抖搜索
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      await performSearch(searchQuery);
    }, 500); // 500ms 防抖

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    try {
      setLoading(true);
      const searchResults = await searchLocation(query, 8);
      setResults(searchResults);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (result: GeocodingResult) => {
    setSelectedLocation(result.displayName);
    setSearchQuery('');
    setShowResults(false);
    setResults([]);
    Keyboard.dismiss();
    onLocationSelect(result.latitude, result.longitude, result.displayName);
  };

  const renderResultItem = ({ item }: { item: GeocodingResult }) => {
    // 根据类型显示不同的图标
    const getIconName = (type: string): string => {
      if (type.includes('city') || type.includes('town')) return 'business-outline';
      if (type.includes('village')) return 'home-outline';
      if (type.includes('country')) return 'globe-outline';
      if (type.includes('state')) return 'location-outline';
      return 'location-outline';
    };

    return (
      <TouchableOpacity
        style={[styles.resultItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        onPress={() => handleSelectLocation(item)}
        activeOpacity={0.7}
      >
        <Ionicons name={getIconName(item.type) as any} size={24} color={theme.colors.accent} style={{ marginRight: 12 }} />
        <View style={styles.resultTextContainer}>
          <Text style={[styles.resultName, { color: theme.colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.resultAddress, { color: theme.colors.textSecondary }]} numberOfLines={2}>
            {item.displayName}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = createStyles(theme.colors);

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
          <Ionicons name="search" size={20} color={theme.colors.textTertiary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder={placeholder || t('locationSearch.placeholder')}
            placeholderTextColor={theme.colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {loading && <ActivityIndicator size="small" color={theme.colors.primary} />}
          {searchQuery.length > 0 && !loading && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showResults && (
        <TouchableOpacity 
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => {
            setShowResults(false);
            setSearchQuery('');
            Keyboard.dismiss();
          }}
        />
      )}

      {showResults && results.length > 0 && (
        <View style={[styles.resultsContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <FlatList
            data={results}
            renderItem={renderResultItem}
            keyExtractor={(item, index) => `${item.latitude}-${item.longitude}-${index}`}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true}
          />
        </View>
      )}

      {showResults && results.length === 0 && !loading && searchQuery.length >= 2 && (
        <View style={[styles.noResultsContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.noResultsText, { color: theme.colors.textSecondary }]}>
            {t('locationSearch.noResults')}
          </Text>
        </View>
      )}
    </View>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      width: '100%',
      position: 'relative',
      zIndex: 1000,
    },
    backdrop: {
      position: 'absolute',
      top: 48,
      left: -9999,
      right: -9999,
      bottom: -9999,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      zIndex: 1,
    },
    searchRow: {
      flexDirection: 'row',
    },
    searchInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: Layout.borderRadius.md,
      paddingHorizontal: Layout.spacing.md,
      paddingVertical: Layout.spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: Layout.fontSize.md,
      paddingVertical: Layout.spacing.xs,
    },
    clearButton: {
      padding: Layout.spacing.xs,
    },
    resultsContainer: {
      position: 'absolute',
      top: 48,
      left: 0,
      right: 0,
      borderWidth: 1,
      borderRadius: Layout.borderRadius.md,
      maxHeight: 300,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 2,
    },
    resultsList: {
      maxHeight: 300,
    },
    resultItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: Layout.spacing.md,
      borderBottomWidth: 1,
    },
    resultIcon: {
      marginRight: Layout.spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    resultTextContainer: {
      flex: 1,
    },
    resultName: {
      fontSize: Layout.fontSize.md,
      fontWeight: '600',
      marginBottom: Layout.spacing.xs,
    },
    resultAddress: {
      fontSize: Layout.fontSize.sm,
      lineHeight: 18,
    },
    noResultsContainer: {
      position: 'absolute',
      top: 48,
      left: 0,
      right: 0,
      borderWidth: 1,
      borderRadius: Layout.borderRadius.md,
      padding: Layout.spacing.lg,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 2,
    },
    noResultsText: {
      fontSize: Layout.fontSize.md,
    },
  });

export default LocationSearch;
