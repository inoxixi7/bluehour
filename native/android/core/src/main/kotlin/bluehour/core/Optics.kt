package bluehour.core

/**
 * 景深与超焦距（对应 src/utils/photographyCalculations.ts）
 * 距离单位为米，焦距与模糊圈为毫米；无穷远为 Double.POSITIVE_INFINITY
 */

data class DepthOfField(
    val nearLimit: Double,
    val farLimit: Double,
    val totalDoF: Double,
    val hyperFocalDistance: Double,
    val inFrontOfSubject: Double,
    val behindSubject: Double,
)

fun calculateDepthOfField(aperture: Double, focalLength: Double, distance: Double, coc: Double): DepthOfField {
    val distanceMm = distance * 1000
    val hyperFocal = focalLength * focalLength / (aperture * coc) + focalLength

    val nearLimit = distanceMm * (hyperFocal - focalLength) / (hyperFocal + distanceMm - 2 * focalLength)
    val farLimit = if (distanceMm < hyperFocal - focalLength) {
        distanceMm * (hyperFocal - focalLength) / (hyperFocal - distanceMm)
    } else {
        Double.POSITIVE_INFINITY
    }

    return DepthOfField(
        nearLimit = nearLimit / 1000,
        farLimit = farLimit / 1000,
        totalDoF = (farLimit - nearLimit) / 1000,
        hyperFocalDistance = hyperFocal / 1000,
        inFrontOfSubject = (distanceMm - nearLimit) / 1000,
        behindSubject = (farLimit - distanceMm) / 1000,
    )
}

/** 超焦距（米） */
fun calculateHyperFocalDistance(aperture: Double, focalLength: Double, coc: Double): Double =
    (focalLength * focalLength / (aperture * coc) + focalLength) / 1000
