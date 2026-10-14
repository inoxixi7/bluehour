import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../locales/i18n';
import { debugLog } from '../utils/logger';

const NOTIFICATION_ENABLED_KEY = '@notifications_enabled';

// 配置通知处理器
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

/**
 * 请求通知权限
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Device.isDevice) {
    debugLog('通知功能仅在真机上可用');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    debugLog('通知权限未授予');
    return false;
  }

  // Android 需要创建通知频道
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('golden-hour', {
      name: i18n.t('settings.notifications.title'),
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF9500',
    });
  }

  return true;
}

/**
 * 检查通知是否已启用
 */
export async function isNotificationsEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(NOTIFICATION_ENABLED_KEY);
    return enabled === 'true';
  } catch (error) {
    console.error('读取通知设置失败:', error);
    return false;
  }
}

/**
 * 设置通知开关状态
 */
export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(NOTIFICATION_ENABLED_KEY, enabled.toString());
    if (!enabled) {
      await cancelGoldenHourNotifications();
    }
  } catch (error) {
    console.error('保存通知设置失败:', error);
  }
}

const GOLDEN_HOUR_IDS = {
  sunrise: 'golden-hour-sunrise',
  sunset: 'golden-hour-sunset',
} as const;
const EXPOSURE_TIMER_ID = 'exposure-timer';

/**
 * 安排黄金时刻提醒（提前 30 分钟）
 * @param goldenHourStart 黄金时刻开始时间
 * @param type 'sunrise' | 'sunset'
 * @param timezone 拍摄地点的 IANA 时区，通知里的时间按该时区显示
 */
export async function scheduleGoldenHourNotification(
  goldenHourStart: Date,
  type: 'sunrise' | 'sunset',
  timezone?: string
): Promise<string | null> {
  try {
    const enabled = await isNotificationsEnabled();
    if (!enabled) {
      return null;
    }

    const notificationTime = new Date(goldenHourStart.getTime() - 30 * 60 * 1000);
    if (notificationTime <= new Date()) {
      debugLog('通知时间已过，不安排通知');
      return null;
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: GOLDEN_HOUR_IDS[type],
      content: {
        title: `${type === 'sunrise' ? '🌅' : '🌇'} ${i18n.t('settings.notifications.goldenHourTitle')}`,
        body: i18n.t('settings.notifications.goldenHourBody', {
          time: formatTime(goldenHourStart, timezone),
        }),
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === 'android' && { channelId: 'golden-hour' }),
      },
      trigger: {
        date: notificationTime,
      },
    });

    debugLog(`✅ 已安排${type === 'sunrise' ? '日出' : '日落'}黄金时刻提醒: ${notificationId}`);
    return notificationId;
  } catch (error) {
    console.error('安排通知失败:', error);
    return null;
  }
}

/**
 * 取消黄金时刻提醒（不影响曝光计时器等其他通知）
 */
export async function cancelGoldenHourNotifications(): Promise<void> {
  try {
    await Promise.all(
      Object.values(GOLDEN_HOUR_IDS).map(id => Notifications.cancelScheduledNotificationAsync(id))
    );
  } catch (error) {
    console.error('取消黄金时刻提醒失败:', error);
  }
}

/**
 * 安排曝光计时结束提醒（应用在后台或锁屏时也能收到）
 * 不受「黄金时刻提醒」开关影响，但需要系统通知权限
 * @param endTime 曝光结束时间
 */
export async function scheduleExposureTimerNotification(endTime: Date): Promise<void> {
  try {
    if (Platform.OS === 'web' || endTime <= new Date()) {
      return;
    }
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      return;
    }

    await Notifications.scheduleNotificationAsync({
      identifier: EXPOSURE_TIMER_ID,
      content: {
        title: i18n.t('reciprocity.timerNotificationTitle'),
        body: i18n.t('reciprocity.timerNotificationBody'),
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        ...(Platform.OS === 'android' && { channelId: 'golden-hour' }),
      },
      trigger: { date: endTime },
    });
  } catch (error) {
    console.error('安排曝光计时提醒失败:', error);
  }
}

/**
 * 取消曝光计时结束提醒
 */
export async function cancelExposureTimerNotification(): Promise<void> {
  try {
    if (Platform.OS === 'web') return;
    await Notifications.cancelScheduledNotificationAsync(EXPOSURE_TIMER_ID);
  } catch (error) {
    console.error('取消曝光计时提醒失败:', error);
  }
}

/**
 * 取消所有通知
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    debugLog('✅ 已取消所有通知');
  } catch (error) {
    console.error('取消通知失败:', error);
  }
}

/**
 * 获取所有已安排的通知
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('获取通知列表失败:', error);
    return [];
  }
}

/**
 * 格式化时间（HH:MM）
 * @param timezone 指定时区；不传时使用设备本地时区
 */
function formatTime(date: Date, timezone?: string): string {
  if (timezone) {
    try {
      return new Intl.DateTimeFormat('en-GB', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(date);
    } catch (error) {
      console.warn('Invalid timezone, using device time:', timezone, error);
    }
  }
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
