package bluehour.core

import java.util.Locale
import kotlin.math.abs

/**
 * 格式化补偿档数，如 +1.3 EV、−0.7 EV、±0.0 EV（负号为 U+2212）
 */
fun formatExtraStops(stops: Double): String {
    val rounded = jsRound(stops * 10) / 10
    val sign = when {
        rounded > 0 -> "+"
        rounded < 0 -> "−"
        else -> "±"
    }
    return "$sign${String.format(Locale.ROOT, "%.1f", abs(rounded))} EV"
}

/**
 * 时间单位文字（由界面层按语言提供）
 * 对应 TypeScript 版本的 common.units.second / seconds / sec / minutes / min / hours
 */
data class DurationUnits(
    val second: String,
    val seconds: String,
    val sec: String,
    val minutes: String,
    val min: String,
    val hours: String,
)

/**
 * 格式化快门 / 曝光时间（对应 src/utils/formatters.ts 的 formatShutterSpeed）
 * - 1 秒以内：标准快门显示为 1/n，其余显示一位小数
 * - 10 秒以内：保留一位小数（如倒易律校正后的 1.3s）
 * - 更长：秒 / 分 / 小时组合
 */
fun formatShutterSpeed(seconds: Double, units: DurationUnits): String {
    if (!seconds.isFinite() || seconds <= 0) {
        return "0${units.sec}"
    }

    if (seconds < 1) {
        val denominator = 1 / seconds
        val rounded = jsRound(denominator).toLong()
        return if (abs(denominator - rounded) / denominator < 0.05 || seconds < 0.3) {
            "1/$rounded${units.sec}"
        } else {
            "${String.format(Locale.ROOT, "%.1f", seconds)}${units.sec}"
        }
    }

    if (seconds < 10) {
        val rounded = jsRound(seconds * 10) / 10
        if (rounded == 1.0) return "1${units.second}"
        val text = if (rounded % 1.0 == 0.0) rounded.toLong().toString() else String.format(Locale.ROOT, "%.1f", rounded)
        return "$text${units.seconds}"
    }

    val total = jsRound(seconds).toLong()
    if (total < 60) return "$total${units.seconds}"

    val hours = total / 3600
    val minutes = total % 3600 / 60
    val secs = total % 60
    return when {
        hours > 0 && minutes == 0L -> "$hours${units.hours}"
        hours > 0 -> "$hours${units.hours}$minutes${units.min}"
        secs == 0L -> "$minutes${units.minutes}"
        else -> "$minutes${units.min}$secs${units.sec}"
    }
}
