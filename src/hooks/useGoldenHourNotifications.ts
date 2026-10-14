import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ProcessedSunTimes } from '../types/api';
import {
  cancelGoldenHourNotifications,
  isNotificationsEnabled,
  scheduleGoldenHourNotification,
} from '../services/notificationService';

/**
 * 黄金时刻、语言或时区变化时，重新安排黄金时刻提醒（提前 30 分钟）
 * @param timezone 拍摄地点的时区，通知里的时间按它显示
 */
export const useGoldenHourNotifications = (
  sunTimes: ProcessedSunTimes | null,
  timezone: string | undefined
) => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const schedule = async () => {
      const enabled = await isNotificationsEnabled();
      if (!enabled || !sunTimes) return;

      // 只取消黄金时刻提醒，不影响曝光计时器提醒
      await cancelGoldenHourNotifications();
      await scheduleGoldenHourNotification(sunTimes.morningGoldenHourStart, 'sunrise', timezone);
      await scheduleGoldenHourNotification(sunTimes.eveningGoldenHourStart, 'sunset', timezone);
    };

    schedule().catch(error => console.error('Failed to schedule notifications:', error));
  }, [sunTimes, i18n.language, timezone]);
};
