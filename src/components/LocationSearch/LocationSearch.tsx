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
import { useTheme } from '../../contexts/ThemeContext';
import { Layout } from '../../constants/Layout';
import { searchLocation, GeocodingResult } from '../../api/geocodingService';

interface LocationSearchProps {
  onLocationSelect: (latitude: number, longitude: number, name: string) => void;
  placeholder?: string;
}

const LocationSearch: React.FC<LocationSearchProps> = ({
  onLocationSelect,
  placeholder = '搜索地点（支持多语言）',
}) => {
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
    const getIcon = (type: string) => {
      if (type.includes('city') || type.includes('town')) return '🏙️';
      if (type.includes('village')) return '🏘️';
      if (type.includes('country')) return '🌍';
      if (type.includes('state')) return '📍';
      return '📌';
    };

    return (
      <TouchableOpacity
        style={[styles.resultItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
        onPress={() => handleSelectLocation(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.resultIcon}>{getIcon(item.type)}</Text>
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
      <View style={[styles.searchInputContainer, { backgroundColor: theme.colors.background, borderColor: theme.colors.border }]}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, { color: theme.colors.text }]}
          placeholder={placeholder}
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
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {selectedLocation ? (
        <View style={[styles.selectedLocationContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.primary }]}>
          <Text style={styles.selectedLocationIcon}>📍</Text>
          <Text style={[styles.selectedLocationText, { color: theme.colors.text }]} numberOfLines={2}>
            {selectedLocation}
          </Text>
        </View>
      ) : null}

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
            未找到匹配的地点
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
      zIndex: 1000,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: Layout.borderRadius.md,
      paddingHorizontal: Layout.spacing.md,
      paddingVertical: Layout.spacing.sm,
      marginBottom: Layout.spacing.sm,
    },
    searchIcon: {
      fontSize: 18,
      marginRight: Layout.spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: Layout.fontSize.md,
      paddingVertical: Layout.spacing.xs,
    },
    clearButton: {
      padding: Layout.spacing.xs,
    },
    clearIcon: {
      fontSize: 18,
      color: colors.textSecondary,
    },
    selectedLocationContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 2,
      borderRadius: Layout.borderRadius.md,
      padding: Layout.spacing.md,
      marginBottom: Layout.spacing.md,
    },
    selectedLocationIcon: {
      fontSize: 24,
      marginRight: Layout.spacing.sm,
    },
    selectedLocationText: {
      flex: 1,
      fontSize: Layout.fontSize.md,
      lineHeight: 20,
    },
    resultsContainer: {
      borderWidth: 1,
      borderRadius: Layout.borderRadius.md,
      maxHeight: 300,
      marginBottom: Layout.spacing.md,
      overflow: 'hidden',
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
      fontSize: 24,
      marginRight: Layout.spacing.md,
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
      borderWidth: 1,
      borderRadius: Layout.borderRadius.md,
      padding: Layout.spacing.lg,
      alignItems: 'center',
      marginBottom: Layout.spacing.md,
    },
    noResultsText: {
      fontSize: Layout.fontSize.md,
    },
  });

export default LocationSearch;
