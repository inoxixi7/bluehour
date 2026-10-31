package bluehour.core

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

/**
 * 胶片倒易律数据
 *
 * 数据来自仓库根目录的 shared/data/films.json（由 TypeScript 版本的
 * src/constants/FilmReciprocity.ts 生成），说明见 docs/RECIPROCITY_DATA.md。
 */

@Serializable
enum class FilmType {
    @SerialName("bw") BlackAndWhite,
    @SerialName("color-negative") ColorNegative,
    @SerialName("slide") Slide,
    @SerialName("digital") Digital,
}

/** 数据来源：厂商手册 / 社区经验值 / 估算 */
@Serializable
enum class ReciprocitySource {
    @SerialName("manufacturer") Manufacturer,
    @SerialName("community") Community,
    @SerialName("estimate") Estimate,
}

/** 倒易律模型，JSON 中以 "kind" 区分 */
@Serializable
sealed interface ReciprocityModel {
    /** 无需补偿（数码） */
    @Serializable
    @SerialName("none")
    data object None : ReciprocityModel

    /** 幂函数：Tm ≤ T0 时 Tc = Tm；否则 Tc = T0 · (Tm / T0)^P */
    @Serializable
    @SerialName("power")
    data class Power(val exponent: Double, val threshold: Double = 1.0) : ReciprocityModel

    /** 厂商数据表：点为 [Tm, Tc]（秒），在 log-log 坐标下分段线性插值 */
    @Serializable
    @SerialName("table")
    data class Table(val points: List<List<Double>>) : ReciprocityModel
}

@Serializable
data class Film(
    val id: String,
    /** 显示名称（缺少翻译时使用） */
    val name: String,
    val iso: Int,
    val type: FilmType,
    val source: ReciprocitySource,
    /** 数据可靠的最长测光时间（秒），超出后结果为外推值 */
    val maxReliableSeconds: Double? = null,
    val model: ReciprocityModel,
)

@Serializable
private data class FilmsFile(val version: Int, val films: List<Film>)

object FilmCatalog {
    internal val json = Json {
        classDiscriminator = "kind"
        ignoreUnknownKeys = true
    }

    /** 解析 films.json 的内容 */
    fun parse(text: String): List<Film> = json.decodeFromString<FilmsFile>(text).films

    /** 打包在 core 中的胶片列表（第一项为数码） */
    val films: List<Film> by lazy { parse(readResource("films.json")) }

    fun byId(id: String): Film? = films.firstOrNull { it.id == id }
}

internal fun readResource(name: String): String {
    val stream = FilmCatalog::class.java.classLoader.getResourceAsStream(name)
        ?: error("缺少资源文件 $name（应由 shared/data 打包）")
    return stream.bufferedReader(Charsets.UTF_8).use { it.readText() }
}
