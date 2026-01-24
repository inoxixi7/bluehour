import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import i18n from "../locales/i18n";
import { LocationData, TimezoneData } from "../hooks/useLocation";
import { ProcessedSunTimes } from "../types/api";
import * as Location from "expo-location";
import { reverseGeocode, getTimezone } from "../api/geocodingService";
import { getSunTimes } from "../api/sunTimeService";

interface LocationDataContextType {
  // Location data
  location: LocationData | null;
  locationName: string;
  timezoneInfo: TimezoneData;

  // Sun times data (cached by date)
  sunTimesCache: Map<string, ProcessedSunTimes>;
  getSunTimesForDate: (date: Date) => ProcessedSunTimes | null;

  // Loading states
  locationLoading: boolean;
  sunTimesLoading: boolean;

  // Errors
  locationError: string | null;
  sunTimesError: string | null;

  // Actions
  getCurrentLocation: () => Promise<void>;
  updateLocationData: (
    lat: number,
    lng: number,
    name?: string
  ) => Promise<void>;
  fetchSunTimes: (date: Date) => Promise<void>;
}

const LocationDataContext = createContext<LocationDataContextType | undefined>(
  undefined
);

export const LocationDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationName, setLocationName] = useState<string>("");
  const [timezoneInfo, setTimezoneInfo] = useState<TimezoneData>({
    timezone: "",
    offset: 0,
  });
  const [sunTimesCache, setSunTimesCache] = useState<
    Map<string, ProcessedSunTimes>
  >(new Map());

  const [locationLoading, setLocationLoading] = useState(false);
  const [sunTimesLoading, setSunTimesLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [sunTimesError, setSunTimesError] = useState<string | null>(null);

  // Helper to get date key for cache
  const getDateKey = useCallback((date: Date, timezone?: string): string => {
    if (timezone) {
      const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return formatter.format(date);
    }
    return date.toISOString().split("T")[0];
  }, []);

  // Get cached sun times for a date
  const getSunTimesForDate = useCallback(
    (date: Date): ProcessedSunTimes | null => {
      const key = getDateKey(date, timezoneInfo.timezone);
      return sunTimesCache.get(key) || null;
    },
    [sunTimesCache, timezoneInfo.timezone, getDateKey]
  );

  // Update location data
  const updateLocationData = useCallback(
    async (lat: number, lng: number, name?: string) => {
      try {
        setLocationLoading(true);
        setLocationError(null);

        setLocation({ latitude: lat, longitude: lng });

        // Get name if not provided
        let finalName = name;
        if (!finalName) {
          const currentLanguage = (i18n.language || "en").split("-")[0]; // 'zh-CN' -> 'zh'
          finalName = await reverseGeocode(lat, lng, currentLanguage);
        }
        setLocationName(finalName || "");

        // Get timezone
        const tz = await getTimezone(lat, lng);
        setTimezoneInfo({ timezone: tz.timezone, offset: tz.offset });

        // Clear cache when location changes
        setSunTimesCache(new Map());
      } catch (err: any) {
        setLocationError(err.message || "Failed to update location data");
        console.error("Error updating location:", err);
      } finally {
        setLocationLoading(false);
      }
    },
    [i18n.language]
  );

  // Get current GPS location
  const getCurrentLocation = useCallback(async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("Permission to access location was denied");
        setLocationLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      await updateLocationData(loc.coords.latitude, loc.coords.longitude);
    } catch (err: any) {
      setLocationError(err.message || "Failed to get current location");
      console.error("Error getting location:", err);
      setLocationLoading(false);
    }
  }, [updateLocationData]);

  // Fetch sun times for a specific date
  const fetchSunTimes = useCallback(
    async (date: Date) => {
      if (!location || !timezoneInfo.timezone) {
        console.warn(
          "Cannot fetch sun times: location or timezone not available"
        );
        return;
      }

      const dateKey = getDateKey(date, timezoneInfo.timezone);

      // Check cache first
      if (sunTimesCache.has(dateKey)) {
        console.log("📦 Using cached sun times for", dateKey);
        return;
      }

      try {
        setSunTimesLoading(true);
        setSunTimesError(null);

        console.log("📅 Fetching sun times for date:", dateKey);

        const data = await getSunTimes(
          location.latitude,
          location.longitude,
          dateKey
        );

        // Add to cache
        setSunTimesCache((prev) => {
          const newCache = new Map(prev);
          newCache.set(dateKey, data);
          return newCache;
        });
      } catch (err: any) {
        setSunTimesError(err.message || "Failed to fetch sun times");
        console.error("Error fetching sun times:", err);
      } finally {
        setSunTimesLoading(false);
      }
    },
    [location, timezoneInfo.timezone, sunTimesCache, getDateKey]
  );

  // Auto-load current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  // Auto-fetch today's sun times when location is available
  useEffect(() => {
    if (location && timezoneInfo.timezone) {
      fetchSunTimes(new Date());
    }
  }, [location, timezoneInfo.timezone, fetchSunTimes]);

  // 监听语言变化，自动更新位置名称（带防抖优化）
  useEffect(() => {
    if (location) {
      // 使用防抖避免频繁请求
      const timeoutId = setTimeout(async () => {
        try {
          const currentLanguage = (i18n.language || "en").split("-")[0];
          const name = await reverseGeocode(
            location.latitude,
            location.longitude,
            currentLanguage
          );
          setLocationName(name || "");
        } catch (error) {
          console.error(
            "Error updating location name on language change:",
            error
          );
        }
      }, 500); // 500ms 防抖

      return () => clearTimeout(timeoutId);
    }
  }, [i18n.language, location]);

  const value: LocationDataContextType = {
    location,
    locationName,
    timezoneInfo,
    sunTimesCache,
    getSunTimesForDate,
    locationLoading,
    sunTimesLoading,
    locationError,
    sunTimesError,
    getCurrentLocation,
    updateLocationData,
    fetchSunTimes,
  };

  return (
    <LocationDataContext.Provider value={value}>
      {children}
    </LocationDataContext.Provider>
  );
};

export const useLocationData = () => {
  const context = useContext(LocationDataContext);
  if (context === undefined) {
    throw new Error(
      "useLocationData must be used within a LocationDataProvider"
    );
  }
  return context;
};
