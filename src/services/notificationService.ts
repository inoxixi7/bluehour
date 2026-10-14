import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
      name: '拍摄提醒',
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
      await cancelAllNotifications();
    }
  } catch (error) {
    console.error('保存通知设置失败:', error);
  }
}

/**
 * 安排黄金时刻提醒
 * @param goldenHourStart 黄金时刻开始时间（Date对象）
 * @param type 'sunrise' | 'sunset'
 * @param language 当前语言
 */
export async function scheduleGoldenHourNotification(
  goldenHourStart: Date,
  type: 'sunrise' | 'sunset',
  language: string = 'zh'
): Promise<string | null> {
  try {
    const enabled = await isNotificationsEnabled();
    if (!enabled) {
      return null;
    }

    // 提前30分钟提醒
    const notificationTime = new Date(goldenHourStart.getTime() - 30 * 60 * 1000);

    // 检查通知时间是否已经过去
    if (notificationTime <= new Date()) {
      debugLog('通知时间已过，不安排通知');
      return null;
    }

    const titles = {
      zh: type === 'sunrise' ? '🌅 黄金时刻即将开始' : '🌇 黄金时刻即将开始',
      en: type === 'sunrise' ? '🌅 Golden Hour Starting Soon' : '🌇 Golden Hour Starting Soon',
      ja: type === 'sunrise' ? '🌅 ゴールデンアワー開始' : '🌇 ゴールデンアワー開始',
      de: type === 'sunrise' ? '🌅 Goldene Stunde beginnt' : '🌇 Goldene Stunde beginnt',
    };

    const bodies = {
      zh: `30分钟后进入黄金时刻\n${formatTime(goldenHourStart)}\n准备器材，前往拍摄地点`,
      en: `Golden hour starts in 30 minutes\n${formatTime(goldenHourStart)}\nPrepare your gear`,
      ja: `30分後にゴールデンアワーが始まります\n${formatTime(goldenHourStart)}\n機材を準備してください`,
      de: `Goldene Stunde in 30 Minuten\n${formatTime(goldenHourStart)}\nBereiten Sie Ihre Ausrüstung vor`,
    };

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: titles[language as keyof typeof titles] || titles.zh,
        body: bodies[language as keyof typeof bodies] || bodies.zh,
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
 * 格式化时间
 */
function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
