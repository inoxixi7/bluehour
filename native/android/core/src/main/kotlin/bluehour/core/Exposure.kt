package bluehour.core

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlin.math.abs
import kotlin.math.ln
import kotlin.math.log2
import kotlin.math.pow
import kotlin.math.sqrt

/**
 * 曝光计算（对应 src/utils/photographyCalculations.ts）
 */

@Serializable
enum class ExposureParam {
    @SerialName("aperture") Aperture,
    @SerialName("shutter") Shutter,
    @SerialName("iso") Iso,
}

/** 光圈（F 值）、快门（秒）、ISO */
@Serializable
data class ExposureValues(val aperture: Double, val shutter: Double, val iso: Double) {
    operator fun get(param: ExposureParam): Double = when (param) {
        ExposureParam.Aperture -> aperture
        ExposureParam.Shutter -> shutter
        ExposureParam.Iso -> iso
    }

    fun with(param: ExposureParam, value: Double): ExposureValues = when (param) {
        ExposureParam.Aperture -> copy(aperture = value)
        ExposureParam.Shutter -> copy(shutter = value)
        ExposureParam.Iso -> copy(iso = value)
    }
}

data class EquivalentExposure(val values: ExposureValues, val ev: Double)

/**
 * 曝光值（以 ISO 100 为基准的场景亮度），保留一位小数
 * EV = log2(N² / t) − log2(ISO / 100)
 */
fun calculateEV(aperture: Double, shutter: Double, iso: Double): Double {
    val ev = log2(aperture * aperture / shutter) - log2(iso / 100)
    return jsRound(ev * 10) / 10
}

fun calculateEV(values: ExposureValues): Double =
    calculateEV(values.aperture, values.shutter, values.iso)

/** 档位差 log2(value2 / value1) */
fun calculateStops(value1: Double, value2: Double): Double = log2(value2 / value1)

/** 加 ND 滤镜后的快门时间 */
fun calculateNDShutter(baseShutter: Double, ndStops: Double): Double = baseShutter * 2.0.pow(ndStops)

/**
 * 改变一个参数后，调整第三个参数（既不是 changed 也不是 locked）以保持 EV
 * 结果中的 ev 为原设置的 EV
 */
fun calculateEquivalentExposure(
    base: ExposureValues,
    changedParam: ExposureParam,
    newValue: Double,
    lockedParam: ExposureParam,
    data: PhotographyData = PhotographyData.default,
): EquivalentExposure {
    val baseEV = calculateEV(base)
    var result = base.with(changedParam, newValue)

    // stops > 0 表示变暗了，需要增加曝光
    val stops = when (changedParam) {
        ExposureParam.Aperture -> calculateStops(base.aperture * base.aperture, newValue * newValue)
        ExposureParam.Shutter -> calculateStops(newValue, base.shutter)
        ExposureParam.Iso -> calculateStops(newValue, base.iso)
    }

    result = when (adjustParamFor(changedParam, lockedParam)) {
        ExposureParam.Aperture ->
            result.copy(aperture = findClosest(data.apertures, base.aperture * 2.0.pow(-stops / 2)))
        ExposureParam.Shutter ->
            result.copy(shutter = findClosest(data.shutterValues, base.shutter * 2.0.pow(stops)))
        ExposureParam.Iso ->
            result.copy(iso = findClosest(data.isos, base.iso * 2.0.pow(stops)))
    }
    return EquivalentExposure(result, baseEV)
}

/**
 * 在锁定目标 EV 的情况下，改变一个参数后计算第三个参数
 * 计算值超出标准值范围半档以上时返回 null（无法达到目标 EV）
 */
fun calculateEquivalentExposureWithEV(
    targetEV: Double,
    changedParam: ExposureParam,
    newValue: Double,
    lockedParam: ExposureParam,
    current: ExposureValues,
    data: PhotographyData = PhotographyData.default,
): EquivalentExposure? {
    var values = current.with(changedParam, newValue)
    val (aperture, shutter, iso) = values

    // stopScale：光圈每档对应 F 值 √2 倍，因此档数 = 2·log2
    fun exceedsRange(range: List<Double>, raw: Double, stopScale: Double = 1.0) =
        stopScale * log2(range.first() / raw) > 0.5 || stopScale * log2(raw / range.last()) > 0.5

    values = when (adjustParamFor(changedParam, lockedParam)) {
        ExposureParam.Aperture -> {
            val raw = sqrt(shutter * 2.0.pow(targetEV + log2(iso / 100)))
            if (exceedsRange(data.apertures, raw, 2.0)) return null
            values.copy(aperture = findClosest(data.apertures, raw))
        }
        ExposureParam.Shutter -> {
            val raw = aperture * aperture / 2.0.pow(targetEV + log2(iso / 100))
            if (exceedsRange(data.shutterValues, raw)) return null
            values.copy(shutter = findClosest(data.shutterValues, raw))
        }
        ExposureParam.Iso -> {
            val raw = 100 * 2.0.pow(log2(aperture * aperture / shutter) - targetEV)
            if (exceedsRange(data.isos, raw)) return null
            values.copy(iso = findClosest(data.isos, raw))
        }
    }
    return EquivalentExposure(values, targetEV)
}

/** 既不是 changed 也不是 locked 的那个参数 */
private fun adjustParamFor(changed: ExposureParam, locked: ExposureParam): ExposureParam =
    ExposureParam.entries.first { it != changed && it != locked }

/** 标准快门值（秒） */
val PhotographyData.shutterValues: List<Double>
    get() = shutterSpeeds.map { it.value }

/**
 * 在对数空间中寻找最接近的标准值（按「档」的距离）；距离相同时取靠前的值
 */
fun findClosest(values: List<Double>, target: Double): Double {
    var best = values.first()
    for (value in values) {
        if (abs(ln(value / target)) < abs(ln(best / target))) {
            best = value
        }
    }
    return best
}
