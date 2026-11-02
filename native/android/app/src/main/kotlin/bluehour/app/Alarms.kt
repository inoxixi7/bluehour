package bluehour.app

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.os.Build

/**
 * 在 atMs 唤醒设备并触发 operation；有「闹钟和提醒」权限时准时，
 * 否则系统可能推迟几分钟
 */
fun scheduleAlarm(context: Context, atMs: Long, operation: PendingIntent) {
    val alarms = context.getSystemService(AlarmManager::class.java)
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S || alarms.canScheduleExactAlarms()) {
        alarms.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, atMs, operation)
    } else {
        alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, atMs, operation)
    }
}

fun cancelAlarm(context: Context, operation: PendingIntent) {
    context.getSystemService(AlarmManager::class.java).cancel(operation)
}
