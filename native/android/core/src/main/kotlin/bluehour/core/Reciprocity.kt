package bluehour.core

import kotlin.math.exp
import kotlin.math.ln
import kotlin.math.log2
import kotlin.math.pow

/**
 * 倒易律失效补偿（对应 src/utils/photographyCalculations.ts）
 */

data class ReciprocityResult(
    /** 校正后的曝光时间（秒） */
    val correctedSeconds: Double,
    /** 额外补偿的档数 log2(Tc / Tm) */
    val extraStops: Double,
    /** 测光时间超出了胶片数据的可靠范围（结果为外推值） */
    val isExtrapolated: Boolean,
)

/**
 * 根据倒易律模型计算校正后的曝光时间
 *
 * - Power：Tm ≤ T0 时 Tc = Tm；否则 Tc = T0 · (Tm / T0)^P
 * - Table：在 log-log 坐标下对数据点分段线性插值，超出最后一个点时沿最后一段外推
 *
 * @param meteredSeconds 测光时间（已含 ND），秒
 */
fun applyReciprocityCorrection(meteredSeconds: Double, model: ReciprocityModel): Double {
    if (!(meteredSeconds > 0) || !meteredSeconds.isFinite()) {
        return meteredSeconds
    }

    return when (model) {
        ReciprocityModel.None -> meteredSeconds

        is ReciprocityModel.Power ->
            if (meteredSeconds <= model.threshold) {
                meteredSeconds
            } else {
                model.threshold * (meteredSeconds / model.threshold).pow(model.exponent)
            }

        is ReciprocityModel.Table -> {
            val points = model.points
            if (points.size < 2 || meteredSeconds <= points[0][0]) {
                return meteredSeconds
            }
            // 找到所在区间；超出末端时使用最后一段外推
            var i = 0
            while (i < points.size - 2 && meteredSeconds > points[i + 1][0]) {
                i++
            }
            val (x0, y0) = points[i]
            val (x1, y1) = points[i + 1]
            val slope = (ln(y1) - ln(y0)) / (ln(x1) - ln(x0))
            exp(ln(y0) + slope * (ln(meteredSeconds) - ln(x0)))
        }
    }
}

/** 胶片的倒易律校正结果（含补偿档数与可靠性标记） */
fun calculateReciprocity(meteredSeconds: Double, film: Film): ReciprocityResult {
    val corrected = applyReciprocityCorrection(meteredSeconds, film.model)
    val extraStops =
        if (meteredSeconds > 0 && corrected > 0) log2(corrected / meteredSeconds) else 0.0
    val maxReliable = film.maxReliableSeconds
    return ReciprocityResult(
        correctedSeconds = corrected,
        extraStops = extraStops,
        isExtrapolated = maxReliable != null && meteredSeconds > maxReliable,
    )
}
