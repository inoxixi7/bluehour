package bluehour.app

import android.content.Context
import androidx.core.content.edit

enum class ThemeMode { System, Light, Dark }

/** 用户设置与上次定位（黄金时刻提醒在后台用它计算） */
class AppSettings(context: Context) {
    private val prefs = context.getSharedPreferences("settings", Context.MODE_PRIVATE)

    var themeMode: ThemeMode
        get() = ThemeMode.entries.firstOrNull { it.name == prefs.getString(KEY_THEME, null) } ?: ThemeMode.System
        set(value) = prefs.edit { putString(KEY_THEME, value.name) }

    var goldenHourReminder: Boolean
        get() = prefs.getBoolean(KEY_GOLDEN_REMINDER, false)
        set(value) = prefs.edit { putBoolean(KEY_GOLDEN_REMINDER, value) }

    /** 上次定位（纬度, 经度）；没有定位过为 null */
    var lastLocation: Pair<Double, Double>?
        get() = if (prefs.contains(KEY_LAT) && prefs.contains(KEY_LNG)) {
            Double.fromBits(prefs.getLong(KEY_LAT, 0)) to Double.fromBits(prefs.getLong(KEY_LNG, 0))
        } else {
            null
        }
        set(value) = prefs.edit {
            if (value == null) {
                remove(KEY_LAT).remove(KEY_LNG)
            } else {
                putLong(KEY_LAT, value.first.toRawBits()).putLong(KEY_LNG, value.second.toRawBits())
            }
        }

    private companion object {
        const val KEY_THEME = "theme"
        const val KEY_GOLDEN_REMINDER = "golden_reminder"
        const val KEY_LAT = "last_lat"
        const val KEY_LNG = "last_lng"
    }
}
