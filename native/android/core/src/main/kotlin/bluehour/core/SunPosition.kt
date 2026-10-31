package bluehour.core

import java.time.LocalDate
import java.time.ZoneOffset
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.asin
import kotlin.math.cos
import kotlin.math.max
import kotlin.math.sin
import kotlin.math.tan

/**
 * 太阳位置（NOAA Solar Calculator 算法，对应 src/utils/sunPosition.ts）
 *
 * 所有时刻都用 UTC 毫秒时间戳（epoch ms）表示。
 * 为了与 TypeScript 版本逐位一致：时间戳会像 JS 的 `new Date(x)` 一样截断为整毫秒，
 * 计算真太阳时只取到整秒。
 */
object SunPosition {
    private const val HOUR_MS = 60 * 60 * 1000L
    private const val DAY_MS = 24 * HOUR_MS

    private fun degToRad(deg: Double) = deg * PI / 180
    private fun radToDeg(rad: Double) = rad * 180 / PI

    private fun julianCentury(epochMs: Long): Double {
        val jd = epochMs / 86400000.0 + 2440587.5
        return (jd - 2451545.0) / 36525.0
    }

    private fun sunGeomMeanLong(t: Double): Double {
        var l0 = 280.46646 + t * (36000.76983 + t * 0.0003032)
        while (l0 > 360.0) l0 -= 360.0
        while (l0 < 0.0) l0 += 360.0
        return l0
    }

    private fun sunGeomMeanAnomaly(t: Double) = 357.52911 + t * (35999.05029 - 0.0001537 * t)

    private fun earthOrbitEccentricity(t: Double) = 0.016708634 - t * (0.000042037 + 0.0000001267 * t)

    private fun sunEqOfCenter(t: Double): Double {
        val mrad = degToRad(sunGeomMeanAnomaly(t))
        return sin(mrad) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
            sin(2 * mrad) * (0.019993 - 0.000101 * t) +
            sin(3 * mrad) * 0.000289
    }

    private fun sunApparentLong(t: Double): Double {
        val trueLong = sunGeomMeanLong(t) + sunEqOfCenter(t)
        val omega = 125.04 - 1934.136 * t
        return trueLong - 0.00569 - 0.00478 * sin(degToRad(omega))
    }

    private fun meanObliquityOfEcliptic(t: Double): Double {
        val seconds = 21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))
        return 23.0 + (26.0 + seconds / 60.0) / 60.0
    }

    private fun obliquityCorrection(t: Double): Double {
        val omega = 125.04 - 1934.136 * t
        return meanObliquityOfEcliptic(t) + 0.00256 * cos(degToRad(omega))
    }

    private fun sunDeclination(t: Double): Double {
        val sint = sin(degToRad(obliquityCorrection(t))) * sin(degToRad(sunApparentLong(t)))
        return radToDeg(asin(sint))
    }

    /** 时间方程（分钟） */
    private fun equationOfTime(t: Double): Double {
        val epsilon = obliquityCorrection(t)
        val l0 = sunGeomMeanLong(t)
        val e = earthOrbitEccentricity(t)
        val m = sunGeomMeanAnomaly(t)

        var y = tan(degToRad(epsilon) / 2.0)
        y *= y

        val sin2l0 = sin(2.0 * degToRad(l0))
        val sinm = sin(degToRad(m))
        val cos2l0 = cos(2.0 * degToRad(l0))
        val sin4l0 = sin(4.0 * degToRad(l0))
        val sin2m = sin(2.0 * degToRad(m))

        val etime = y * sin2l0 - 2.0 * e * sinm + 4.0 * e * y * sinm * cos2l0 -
            0.5 * y * y * sin4l0 - 1.25 * e * e * sin2m
        return radToDeg(etime) * 4.0
    }

    /**
     * 太阳高度角（度），正值表示在地平线上方
     */
    fun solarElevation(epochMs: Long, lat: Double, lng: Double): Double {
        val t = julianCentury(epochMs)
        val declination = sunDeclination(t)
        val eqTime = equationOfTime(t)

        // UTC 时间（分钟），只取到整秒
        val msOfDay = Math.floorMod(epochMs, DAY_MS)
        val hours = msOfDay / HOUR_MS
        val minutes = msOfDay / 60_000 % 60
        val seconds = msOfDay / 1000 % 60
        val utcTimeMinutes = hours * 60 + minutes + seconds / 60.0

        // 真太阳时：每度经度对应 4 分钟
        val tst = utcTimeMinutes + eqTime + 4.0 * lng

        var hourAngle = tst / 4.0 - 180.0
        if (hourAngle < -180) hourAngle += 360.0
        if (hourAngle > 180) hourAngle -= 360.0

        val latRad = degToRad(lat)
        val decRad = degToRad(declination)
        val haRad = degToRad(hourAngle)
        return radToDeg(asin(sin(latRad) * sin(decRad) + cos(latRad) * cos(decRad) * cos(haRad)))
    }

    /** 与 JS `new Date(x).getTime()` 相同：截断为整毫秒 */
    private fun clip(x: Double): Long = x.toLong()

    /**
     * 二分查找太阳高度角达到 targetElevation 的时刻
     * @param ascending 太阳在上升（true）还是下降（false）
     */
    fun findTimeForElevation(
        targetElevation: Double,
        startMs: Long,
        endMs: Long,
        lat: Double,
        lng: Double,
        ascending: Boolean,
    ): Long {
        var start = startMs.toDouble()
        var end = endMs.toDouble()

        repeat(50) {
            val mid = (start + end) / 2
            val midMs = clip(mid)
            val elevation = solarElevation(midMs, lat, lng)

            if (abs(elevation - targetElevation) < 0.01) {
                return midMs
            }

            val searchLater = if (ascending) elevation < targetElevation else elevation > targetElevation
            if (searchLater) start = mid else end = mid

            if (abs(end - start) < 1000) {
                return clip((start + end) / 2)
            }
        }
        return clip((start + end) / 2)
    }

    data class GoldenAndBlueHours(
        val morningBlueHourStart: Long,
        val morningBlueHourEnd: Long,
        val morningGoldenHourStart: Long,
        val morningGoldenHourEnd: Long,
        val eveningGoldenHourStart: Long,
        val eveningGoldenHourEnd: Long,
        val eveningBlueHourStart: Long,
        val eveningBlueHourEnd: Long,
    )

    /**
     * 黄金时刻与蓝调时刻（参考 PhotoPills、TPE 的定义）
     * - 蓝调：太阳高度角 −6° 到 −4°
     * - 黄金：−4° 到 +6°（从蓝调结束开始）
     *
     * @param sunrise 日出（太阳中心 −0.833°）
     * @param sunset 日落
     */
    fun goldenAndBlueHours(sunrise: Long, sunset: Long, lat: Double, lng: Double): GoldenAndBlueHours {
        val window = 2 * HOUR_MS

        val morningBlueStart = findTimeForElevation(-6.0, sunrise - window, sunrise, lat, lng, true)
        val morningBlueEnd = findTimeForElevation(-4.0, morningBlueStart, sunrise + window, lat, lng, true)
        val morningGoldenEnd = findTimeForElevation(6.0, morningBlueEnd, sunrise + window, lat, lng, true)

        val eveningGoldenStart = findTimeForElevation(6.0, sunset - window, sunset, lat, lng, false)
        val eveningGoldenEnd = findTimeForElevation(-4.0, sunset, sunset + window, lat, lng, false)
        val eveningBlueEnd = findTimeForElevation(-6.0, eveningGoldenEnd, sunset + window, lat, lng, false)

        return GoldenAndBlueHours(
            morningBlueHourStart = morningBlueStart,
            morningBlueHourEnd = morningBlueEnd,
            morningGoldenHourStart = morningBlueEnd,
            morningGoldenHourEnd = morningGoldenEnd,
            eveningGoldenHourStart = eveningGoldenStart,
            eveningGoldenHourEnd = eveningGoldenEnd,
            eveningBlueHourStart = eveningGoldenEnd,
            eveningBlueHourEnd = eveningBlueEnd,
        )
    }

    data class SunTimes(
        val sunrise: Long,
        val sunset: Long,
        val solarNoon: Long,
        val civilTwilightBegin: Long,
        val civilTwilightEnd: Long,
        val nauticalTwilightBegin: Long,
        val nauticalTwilightEnd: Long,
        val astronomicalTwilightBegin: Long,
        val astronomicalTwilightEnd: Long,
        /** 白昼长度（秒） */
        val dayLengthSeconds: Double,
    )

    /**
     * 本地计算某日的日出日落与晨昏蒙影（无需网络）
     *
     * @param date 地点的当地日期
     *
     * 日出/日落取太阳中心 −0.833°，民用/航海/天文晨昏蒙影为 −6° / −12° / −18°。
     * 极昼极夜时，无法到达的高度角退化为正午（从不升起）或子夜（从不落下）。
     */
    fun sunTimes(lat: Double, lng: Double, date: LocalDate): SunTimes {
        fun elevationAt(time: Double) = solarElevation(clip(time), lat, lng)

        // 太阳正午：先按经度估算，再用三分搜索找最高点
        val utcNoon = date.atTime(12, 0).toInstant(ZoneOffset.UTC).toEpochMilli()
        val approxNoon = utcNoon - lng * 4 * 60 * 1000
        var lo = approxNoon - HOUR_MS
        var hi = approxNoon + HOUR_MS
        repeat(60) {
            val m1 = lo + (hi - lo) / 3
            val m2 = hi - (hi - lo) / 3
            if (elevationAt(m1) < elevationAt(m2)) lo = m1 else hi = m2
        }
        val noon = (lo + hi) / 2
        val noonElevation = elevationAt(noon)

        fun crossing(target: Double, rising: Boolean): Long {
            val nadir = if (rising) noon - 12 * HOUR_MS else noon + 12 * HOUR_MS
            if (target >= noonElevation) return clip(noon) // 太阳全天都到不了这个高度
            if (target <= elevationAt(nadir)) return clip(nadir) // 太阳全天都在这个高度之上
            val (start, end) = if (rising) nadir to noon else noon to nadir
            return findTimeForElevation(target, clip(start), clip(end), lat, lng, rising)
        }

        val sunrise = crossing(-0.833, true)
        val sunset = crossing(-0.833, false)

        return SunTimes(
            sunrise = sunrise,
            sunset = sunset,
            solarNoon = clip(noon),
            civilTwilightBegin = crossing(-6.0, true),
            civilTwilightEnd = crossing(-6.0, false),
            nauticalTwilightBegin = crossing(-12.0, true),
            nauticalTwilightEnd = crossing(-12.0, false),
            astronomicalTwilightBegin = crossing(-18.0, true),
            astronomicalTwilightEnd = crossing(-18.0, false),
            dayLengthSeconds = max(0.0, (sunset - sunrise) / 1000.0),
        )
    }
}
