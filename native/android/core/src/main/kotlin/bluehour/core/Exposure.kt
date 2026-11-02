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

/** 加 ND 滤镜后的快门时间 */
fun calculateNDShutter(baseShutter: Double, ndStops: Double): Double = baseShutter * 2.0.pow(ndStops)

/**
 * @property outOfRangeStops 超出标准值范围时剩余的曝光偏差（档），正数为过曝、负数为欠曝；在范围内为 0
 */
data class SolvedExposure(val values: ExposureValues, val outOfRangeStops: Double)

/**
 * 按场景亮度 ev 计算自动参数 auto，另外两个参数保持 values 中的值（对应相机的光圈优先 / 快门优先 / 自动 ISO）
 * 超出标准值范围时取最接近的极值，并在 outOfRangeStops 中给出偏差
 */
fun solveExposure(
    ev: Double,
    auto: ExposureParam,
    values: ExposureValues,
    data: PhotographyData = PhotographyData.default,
): SolvedExposure {
    val (aperture, shutter, iso) = values
    // EV = log2(N² / t) − log2(ISO / 100)
    val evAtIso = ev + log2(iso / 100)
    val (range, raw) = when (auto) {
        ExposureParam.Aperture -> data.apertures to sqrt(shutter * 2.0.pow(evAtIso))
        ExposureParam.Shutter -> data.shutterValues to aperture * aperture / 2.0.pow(evAtIso)
        ExposureParam.Iso -> data.isos to 100 * 2.0.pow(log2(aperture * aperture / shutter) - ev)
    }
    val result = values.with(auto, findClosest(range, raw))
    val inRange = raw >= range.min() && raw <= range.max()
    val actualEV = log2(result.aperture * result.aperture / result.shutter) - log2(result.iso / 100)
    // + 0.0 去掉 -0.0
    val outOfRangeStops = if (inRange) 0.0 else jsRound((ev - actualEV) * 10) / 10 + 0.0
    return SolvedExposure(result, outOfRangeStops)
}

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
