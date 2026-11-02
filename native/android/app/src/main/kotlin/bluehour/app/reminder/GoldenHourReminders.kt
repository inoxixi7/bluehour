package bluehour.app.reminder

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import bluehour.app.AppSettings
import bluehour.app.MainActivity
import bluehour.app.R
import bluehour.app.cancelAlarm
import bluehour.app.scheduleAlarm
import bluehour.core.LightPhases
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle

private const val CHANNEL_ID = "golden_hour"
private const val NOTIFICATION_ID = 1002
private const val LEAD_MS = 30 * 60_000L
private const val EXTRA_START = "golden_hour_start"
private const val EXTRA_MORNING = "is_morning"

/**
 * 黄金时刻提醒（提前 30 分钟）：每次只安排下一个，提醒发出后再安排下一个。
 * 用上次定位计算，并假设所在地时区与设备时区相同（与「蓝调时刻」页一致）
 */
object GoldenHourReminders {
    /** 按当前设置与上次定位重新安排；关闭或没有定位时只取消 */
    fun reschedule(context: Context, nowMs: Long = System.currentTimeMillis()) {
        val settings = AppSettings(context)
        val location = settings.lastLocation
        cancelAlarm(context, pendingIntent(context, null, null))
        if (!settings.goldenHourReminder || location == null) return

        val next = LightPhases.nextGoldenHourReminder(
            location.first, location.second, nowMs, ZoneId.systemDefault(), LEAD_MS,
        ) ?: return
        scheduleAlarm(
            context,
            next.goldenHourStart - LEAD_MS,
            pendingIntent(context, next.goldenHourStart, next.isMorning),
        )
    }

    private fun pendingIntent(context: Context, start: Long?, isMorning: Boolean?): PendingIntent {
        val intent = Intent(context, GoldenHourReceiver::class.java)
        if (start != null && isMorning != null) {
            intent.putExtra(EXTRA_START, start).putExtra(EXTRA_MORNING, isMorning)
        }
        return PendingIntent.getBroadcast(
            context,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
        )
    }

    internal fun notify(context: Context, start: Long, isMorning: Boolean) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            return
        }
        val manager = context.getSystemService(NotificationManager::class.java)
        manager.createNotificationChannel(
            NotificationChannel(
                CHANNEL_ID,
                context.getString(R.string.golden_reminder_title),
                NotificationManager.IMPORTANCE_HIGH,
            ),
        )
        val time = DateTimeFormatter.ofLocalizedTime(FormatStyle.SHORT)
            .withZone(ZoneId.systemDefault())
            .format(Instant.ofEpochMilli(start))
        val openApp = PendingIntent.getActivity(
            context,
            0,
            Intent(context, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP),
            PendingIntent.FLAG_IMMUTABLE,
        )
        val notification = NotificationCompat.Builder(context, CHANNEL_ID)
            .setSmallIcon(R.drawable.ic_tab_light)
            .setContentTitle("${if (isMorning) "🌅" else "🌇"} ${context.getString(R.string.golden_notification_title)}")
            .setContentText(context.getString(R.string.golden_notification_body, time))
            .setContentIntent(openApp)
            .setAutoCancel(true)
            .build()
        manager.notify(NOTIFICATION_ID, notification)
    }
}

/** 提醒时间到 */
class GoldenHourReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.hasExtra(EXTRA_START)) {
            val start = intent.getLongExtra(EXTRA_START, 0)
            // 闹钟被系统推迟到黄金时刻开始之后就不再提醒
            if (start > System.currentTimeMillis() && AppSettings(context).goldenHourReminder) {
                GoldenHourReminders.notify(context, start, intent.getBooleanExtra(EXTRA_MORNING, true))
            }
        }
        GoldenHourReminders.reschedule(context)
    }
}

/** 开机、更新应用、改时区或时间后，闹钟会失效或不准，需要重新安排 */
class RescheduleReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action in RESCHEDULE_ACTIONS) GoldenHourReminders.reschedule(context)
    }

    private companion object {
        val RESCHEDULE_ACTIONS = setOf(
            Intent.ACTION_BOOT_COMPLETED,
            Intent.ACTION_MY_PACKAGE_REPLACED,
            Intent.ACTION_TIMEZONE_CHANGED,
            Intent.ACTION_TIME_CHANGED,
        )
    }
}
