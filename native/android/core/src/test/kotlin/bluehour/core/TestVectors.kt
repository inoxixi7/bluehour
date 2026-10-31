package bluehour.core

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.boolean
import kotlinx.serialization.json.double
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import kotlinx.serialization.json.long
import org.junit.jupiter.api.Assertions.fail
import java.io.File
import kotlin.math.abs
import kotlin.math.max

/**
 * 读取 shared/test-vectors/ 下由 TypeScript 版本生成的测试向量
 */
object TestVectors {
    private val dir: File by lazy {
        val path = System.getProperty("bluehour.testVectorsDir")
            ?: error("缺少系统属性 bluehour.testVectorsDir（应由 Gradle 设置）")
        File(path)
    }

    fun load(name: String): JsonObject =
        Json.parseToJsonElement(dir.resolve(name).readText()).jsonObject

    fun cases(name: String, key: String = "cases"): List<JsonObject> =
        load(name).getValue(key).jsonArray.map { it.jsonObject }
}

fun JsonObject.d(key: String): Double = getValue(key).jsonPrimitive.double
fun JsonObject.dOrNull(key: String): Double? = get(key).takeUnless { it == null || it is JsonNull }?.jsonPrimitive?.double
fun JsonObject.l(key: String): Long = getValue(key).jsonPrimitive.long
fun JsonObject.b(key: String): Boolean = getValue(key).jsonPrimitive.boolean
fun JsonObject.s(key: String): String = getValue(key).jsonPrimitive.content
fun JsonObject.o(key: String): JsonObject = getValue(key).jsonObject
fun JsonObject.isNull(key: String): Boolean = get(key) is JsonNull
fun JsonObject.arr(key: String): JsonArray = getValue(key).jsonArray

fun JsonElement.toParam(): ExposureParam =
    ExposureParam.entries.first { it.name.equals(jsonPrimitive.content, ignoreCase = true) }

fun JsonObject.param(key: String): ExposureParam = getValue(key).toParam()
fun JsonObject.params(key: String): LinkedHashSet<ExposureParam> = arr(key).mapTo(LinkedHashSet()) { it.toParam() }
fun JsonObject.exposure(key: String): ExposureValues = o(key).let { ExposureValues(it.d("aperture"), it.d("shutter"), it.d("iso")) }

/** 相对误差（数值接近 0 时用绝对误差） */
fun close(actual: Double, expected: Double, tolerance: Double = 1e-9): Boolean =
    if (expected.isInfinite() || actual.isInfinite()) {
        actual == expected
    } else {
        abs(actual - expected) <= tolerance * max(1.0, abs(expected))
    }

/**
 * 逐个检查用例，收集所有失败后一并报告
 */
fun <T> verifyAll(label: String, cases: List<T>, check: (T) -> String?) {
    require(cases.isNotEmpty()) { "$label: 没有测试用例" }
    val failures = cases.mapNotNull { case -> check(case)?.let { "$it\n    用例: $case" } }
    if (failures.isNotEmpty()) {
        fail<Unit>(
            "$label: ${failures.size}/${cases.size} 个用例不一致\n" +
                failures.take(15).joinToString("\n") { "  - $it" },
        )
    }
}
