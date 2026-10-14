package bluehour.core

import kotlinx.serialization.Serializable

/**
 * 摄影常量（光圈、快门、ISO、ND 滤镜、EV 场景）
 * 来自 shared/data/photography.json（由 src/constants/Photography.ts 生成）
 */

@Serializable
data class ShutterSpeed(val value: Double, val label: String)

@Serializable
data class NdFilter(val name: String, val stops: Int, val factor: Int)

@Serializable
data class EvScene(
    val ev: Double,
    /** 翻译键，如 calculator.ev.scenes.ev15 */
    val descriptionKey: String,
    val icon: String,
    val params: ExposureValues,
)

@Serializable
data class PhotographyData(
    val version: Int,
    val apertures: List<Double>,
    val shutterSpeeds: List<ShutterSpeed>,
    val isos: List<Double>,
    val ndFilters: List<NdFilter>,
    val evScenes: List<EvScene>,
) {
    companion object {
        val default: PhotographyData by lazy {
            FilmCatalog.json.decodeFromString(serializer(), readResource("photography.json"))
        }
    }
}
