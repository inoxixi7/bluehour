package bluehour.core

import kotlin.math.floor

/**
 * 与 JavaScript Math.round 一致的取整：.5 一律向正无穷取整
 * （kotlin.math.round 是四舍六入五成双，结果会不同）
 */
internal fun jsRound(x: Double): Double = floor(x + 0.5)
