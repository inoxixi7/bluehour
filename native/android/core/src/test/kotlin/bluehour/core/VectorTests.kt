package bluehour.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import kotlinx.serialization.json.jsonObject
import java.time.LocalDate
import kotlin.math.abs

/**
 * 用 TypeScript 版本生成的测试向量验证 Kotlin 实现
 * （向量由 `npm run shared:update` 生成，见 src/sharedData/buildSharedData.ts）
 */

private fun valuesMismatch(actual: ExposureValues, expected: ExposureValues): String? =
    if (close(actual.aperture, expected.aperture) && close(actual.shutter, expected.shutter) &&
        close(actual.iso, expected.iso)
    ) {
        null
    } else {
        "期望 $expected，实际 $actual"
    }

class ReciprocityVectorsTest {
    @Test
    fun `胶片数据与向量中的胶片一致`() {
        val vectorFilmIds = TestVectors.cases("reciprocity.json").map { it.s("filmId") }.distinct()
        assertEquals(vectorFilmIds, FilmCatalog.films.map { it.id })
    }

    @Test
    fun `倒易律校正`() = verifyAll("calculateReciprocity", TestVectors.cases("reciprocity.json")) { case ->
        val film = FilmCatalog.byId(case.s("filmId")) ?: return@verifyAll "找不到胶片"
        val result = calculateReciprocity(case.d("meteredSeconds"), film)
        when {
            !close(result.correctedSeconds, case.d("correctedSeconds")) ->
                "correctedSeconds 期望 ${case.d("correctedSeconds")}，实际 ${result.correctedSeconds}"
            !close(result.extraStops, case.d("extraStops")) ->
                "extraStops 期望 ${case.d("extraStops")}，实际 ${result.extraStops}"
            result.isExtrapolated != case.b("isExtrapolated") -> "isExtrapolated 不一致"
            else -> null
        }
    }
}

class ExposureVectorsTest {
    private val file = TestVectors.load("exposure.json")
    private fun cases(key: String) = file.arr(key).map { it.jsonObject }

    @Test
    fun `EV`() = verifyAll("calculateEV", cases("ev")) { case ->
        val ev = calculateEV(case.d("aperture"), case.d("shutter"), case.d("iso"))
        if (close(ev, case.d("ev"))) null else "期望 ${case.d("ev")}，实际 $ev"
    }

    @Test
    fun `ND 快门`() = verifyAll("calculateNDShutter", cases("ndShutter")) { case ->
        val shutter = calculateNDShutter(case.d("baseShutter"), case.d("ndStops"))
        if (close(shutter, case.d("shutter"))) null else "期望 ${case.d("shutter")}，实际 $shutter"
    }

    @Test
    fun `等效曝光`() = verifyAll("calculateEquivalentExposure", cases("equivalent")) { case ->
        val result = calculateEquivalentExposure(
            case.exposure("base"), case.param("changedParam"), case.d("newValue"), case.param("lockedParam"),
        )
        val expected = case.o("result")
        valuesMismatch(result.values, case.exposure("result"))
            ?: if (close(result.ev, expected.d("ev"))) null else "ev 期望 ${expected.d("ev")}，实际 ${result.ev}"
    }

    @Test
    fun `锁定 EV 的等效曝光`() = verifyAll("calculateEquivalentExposureWithEV", cases("equivalentWithEV")) { case ->
        val result = calculateEquivalentExposureWithEV(
            case.d("targetEV"), case.param("changedParam"), case.d("newValue"), case.param("lockedParam"),
            case.exposure("current"),
        )
        when {
            case.isNull("result") -> if (result == null) null else "期望 null，实际 $result"
            result == null -> "期望 ${case.o("result")}，实际 null"
            else -> valuesMismatch(result.values, case.exposure("result"))
        }
    }
}

class ExposureLocksVectorsTest {
    private val file = TestVectors.load("exposure-locks.json")
    private fun cases(key: String) = file.arr(key).map { it.jsonObject }

    @Test
    fun applyParamChange() = verifyAll("applyParamChange", cases("applyParamChange")) { case ->
        val result = ExposureLocks.applyParamChange(
            case.exposure("values"), case.param("param"), case.d("value"), case.params("locked"),
            case.dOrNull("targetEV"),
        )
        valuesMismatch(result, case.exposure("result"))
    }

    @Test
    fun applyTargetEV() = verifyAll("applyTargetEV", cases("applyTargetEV")) { case ->
        val result = ExposureLocks.applyTargetEV(case.exposure("values"), case.d("targetEV"), case.params("locked"))
        valuesMismatch(result, case.exposure("result"))
    }

    @Test
    fun isAutoAdjusted() = verifyAll("isAutoAdjusted", cases("isAutoAdjusted")) { case ->
        val result = ExposureLocks.isAutoAdjusted(case.param("param"), case.params("locked"), case.b("evLocked"))
        if (result == case.b("result")) null else "期望 ${case.b("result")}，实际 $result"
    }

    @Test
    fun toggleParamLock() = verifyAll("toggleParamLock", cases("toggleParamLock")) { case ->
        val result = ExposureLocks.toggleParamLock(case.params("locked"), case.param("param"), case.b("evLocked"))
        val expected = case.params("result")
        // 比较顺序：后续的 toggle 依赖插入顺序
        if (result.toList() == expected.toList()) null else "期望 $expected，实际 $result"
    }
}

class SunVectorsTest {
    private val file = TestVectors.load("sun.json")
    private fun cases(key: String) = file.arr(key).map { it.jsonObject }

    /** 二分查找的终止条件是 1 秒，浮点运算的微小差异可能让结果相差不到 1 秒 */
    private val timeToleranceMs = 1500L

    @Test
    fun `太阳高度角`() = verifyAll("solarElevation", cases("elevation")) { case ->
        val elevation = SunPosition.solarElevation(case.l("epochMs"), case.d("lat"), case.d("lng"))
        if (close(elevation, case.d("elevation"), 1e-8)) null else "期望 ${case.d("elevation")}，实际 $elevation"
    }

    @Test
    fun `日出日落与晨昏蒙影`() = verifyAll("sunTimes", cases("sunTimes")) { case ->
        val actual = SunPosition.sunTimes(case.d("lat"), case.d("lng"), LocalDate.parse(case.s("date")))
        val expected = case.o("result")
        val times = mapOf(
            "sunrise" to actual.sunrise,
            "sunset" to actual.sunset,
            "solarNoon" to actual.solarNoon,
            "civilTwilightBegin" to actual.civilTwilightBegin,
            "civilTwilightEnd" to actual.civilTwilightEnd,
            "nauticalTwilightBegin" to actual.nauticalTwilightBegin,
            "nauticalTwilightEnd" to actual.nauticalTwilightEnd,
            "astronomicalTwilightBegin" to actual.astronomicalTwilightBegin,
            "astronomicalTwilightEnd" to actual.astronomicalTwilightEnd,
        )
        times.entries.firstNotNullOfOrNull { (key, value) ->
            val diff = value - expected.l(key)
            if (abs(diff) <= timeToleranceMs) null else "$key 相差 ${diff}ms"
        } ?: run {
            val diff = actual.dayLengthSeconds - expected.d("dayLengthSeconds")
            if (abs(diff) <= 2 * timeToleranceMs / 1000.0) null else "dayLengthSeconds 相差 ${diff}s"
        }
    }

    @Test
    fun `黄金时刻与蓝调时刻`() = verifyAll("goldenAndBlueHours", cases("sunTimes")) { case ->
        val sunTimes = case.o("result")
        val actual = SunPosition.goldenAndBlueHours(sunTimes.l("sunrise"), sunTimes.l("sunset"), case.d("lat"), case.d("lng"))
        val expected = case.o("goldenAndBlueHours")
        val times = mapOf(
            "morningBlueHourStart" to actual.morningBlueHourStart,
            "morningBlueHourEnd" to actual.morningBlueHourEnd,
            "morningGoldenHourStart" to actual.morningGoldenHourStart,
            "morningGoldenHourEnd" to actual.morningGoldenHourEnd,
            "eveningGoldenHourStart" to actual.eveningGoldenHourStart,
            "eveningGoldenHourEnd" to actual.eveningGoldenHourEnd,
            "eveningBlueHourStart" to actual.eveningBlueHourStart,
            "eveningBlueHourEnd" to actual.eveningBlueHourEnd,
        )
        times.entries.firstNotNullOfOrNull { (key, value) ->
            val diff = value - expected.l(key)
            if (abs(diff) <= timeToleranceMs) null else "$key 相差 ${diff}ms"
        }
    }
}

class OpticsVectorsTest {
    private val file = TestVectors.load("optics.json")
    private fun cases(key: String) = file.arr(key).map { it.jsonObject }

    @Test
    fun `景深`() = verifyAll("calculateDepthOfField", cases("depthOfField")) { case ->
        val actual = calculateDepthOfField(case.d("aperture"), case.d("focalLength"), case.d("distance"), case.d("coc"))
        val expected = case.o("result")
        mapOf(
            "nearLimit" to actual.nearLimit,
            "farLimit" to actual.farLimit,
            "totalDoF" to actual.totalDoF,
            "hyperFocalDistance" to actual.hyperFocalDistance,
            "inFrontOfSubject" to actual.inFrontOfSubject,
            "behindSubject" to actual.behindSubject,
        ).entries.firstNotNullOfOrNull { (key, value) ->
            val want = expected.dOrNull(key) ?: Double.POSITIVE_INFINITY
            if (close(value, want)) null else "$key 期望 $want，实际 $value"
        }
    }

    @Test
    fun `超焦距`() = verifyAll("calculateHyperFocalDistance", cases("hyperFocal")) { case ->
        val actual = calculateHyperFocalDistance(case.d("aperture"), case.d("focalLength"), case.d("coc"))
        if (close(actual, case.d("result"))) null else "期望 ${case.d("result")}，实际 $actual"
    }
}

class FormatterVectorsTest {
    @Test
    fun formatExtraStops() = verifyAll(
        "formatExtraStops",
        TestVectors.cases("formatters.json", "formatExtraStops"),
    ) { case ->
        val actual = formatExtraStops(case.d("stops"))
        if (actual == case.s("result")) null else "期望 ${case.s("result")}，实际 $actual"
    }
}

class ShutterFormatVectorsTest {
    @Test
    fun formatShutterSpeed() {
        val file = TestVectors.load("formatters.json")
        val u = file.o("shutterUnits")
        val units = DurationUnits(u.s("second"), u.s("seconds"), u.s("sec"), u.s("minutes"), u.s("min"), u.s("hours"))
        verifyAll("formatShutterSpeed", file.arr("formatShutterSpeed").map { it.jsonObject }) { case ->
            val actual = formatShutterSpeed(case.d("seconds"), units)
            if (actual == case.s("result")) null else "期望 ${case.s("result")}，实际 $actual"
        }
    }
}

class PhotographyDataTest {
    @Test
    fun `常量可以读取`() {
        val data = PhotographyData.default
        assertEquals(1.0, data.apertures.first())
        assertEquals(1.0 / 8000, data.shutterValues.first())
        assertEquals(12, data.ndFilters.size)
        assertTrue(data.evScenes.isNotEmpty())
    }
}
