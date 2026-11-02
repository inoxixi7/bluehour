package bluehour.app.ui.exposure

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.FilterChip
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.listSaver
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringArrayResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import bluehour.app.R
import bluehour.app.ui.common.LabeledSlider
import bluehour.app.ui.common.TitleWithHelp
import bluehour.app.ui.common.durationUnits
import bluehour.app.ui.reciprocity.ReciprocityInput
import bluehour.core.ExposureParam
import bluehour.core.ExposureValues
import bluehour.core.PhotographyData
import bluehour.core.calculateEV
import bluehour.core.calculateNDShutter
import bluehour.core.formatShutterSpeed
import bluehour.core.shutterValues
import bluehour.core.solveExposure
import java.util.Locale
import kotlin.math.abs
import kotlin.math.round

private val DEFAULT_VALUES = ExposureValues(aperture = 8.0, shutter = 1.0 / 4, iso = 100.0)
private const val EV_MIN = -6.0
private const val EV_MAX = 20.0

private val valuesSaver = listSaver<ExposureValues, Double>(
    save = { listOf(it.aperture, it.shutter, it.iso) },
    restore = { ExposureValues(it[0], it[1], it[2]) },
)

/**
 * 曝光计算：EV 是场景亮度，调参数时保持不变；光圈 / 快门 / ISO 中选一个自动计算
 * （相当于相机的光圈优先 / 快门优先 / 自动 ISO），另外两个手动调。并计算加 ND 滤镜后的快门
 */
@Composable
fun ExposureScreen(modifier: Modifier = Modifier, onOpenReciprocity: (ReciprocityInput) -> Unit = {}) {
    val data = PhotographyData.default
    val units = durationUnits()
    val sceneNames = stringArrayResource(R.array.ev_scenes)
    check(sceneNames.size == data.evScenes.size) { "ev_scenes 与 photography.json 的 evScenes 数量不一致" }

    // 手动参数的值；自动参数的值由 solveExposure 算出
    var values by rememberSaveable(stateSaver = valuesSaver) { mutableStateOf(DEFAULT_VALUES) }
    // 场景亮度，调参数时保持不变
    var ev by rememberSaveable { mutableDoubleStateOf(calculateEV(DEFAULT_VALUES)) }
    // 自动计算的参数，默认快门（相当于光圈优先）
    var autoParam by rememberSaveable { mutableStateOf(ExposureParam.Shutter) }
    // 0 表示未选场景，1..n 对应 evScenes
    var sceneIndex by rememberSaveable { mutableIntStateOf(0) }
    // 0 表示不用 ND，1..n 对应 ndFilters
    var ndIndex by rememberSaveable { mutableIntStateOf(0) }

    val solved = solveExposure(ev, autoParam, values, data)
    val shown = solved.values
    val nd = data.ndFilters.getOrNull(ndIndex - 1)
    val ndShutter = calculateNDShutter(shown.shutter, (nd?.stops ?: 0).toDouble())

    fun selectScene(index: Int) {
        sceneIndex = index
        if (index > 0) ev = data.evScenes[index - 1].ev
    }

    fun stepEv(delta: Int) {
        ev = (round(ev) + delta).coerceIn(EV_MIN, EV_MAX)
        sceneIndex = 0
    }

    Column(
        modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        TitleWithHelp(
            title = stringResource(R.string.exposure_title),
            helpTitle = R.string.help_exposure_title,
            helpDescription = R.string.help_exposure_description,
            helpSections = listOf(
                R.array.help_exposure_section1,
                R.array.help_exposure_section2,
                R.array.help_exposure_section3,
                R.array.help_exposure_section4,
                R.array.help_exposure_section5,
            ),
        )

        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            DropdownField(
                label = stringResource(R.string.scene_preset),
                options = listOf(stringResource(R.string.no_scene)) +
                    data.evScenes.mapIndexed { i, scene -> "${scene.icon} ${sceneNames[i]}" },
                selected = sceneIndex,
                onSelect = ::selectScene,
                modifier = Modifier.weight(1f),
            )
            DropdownField(
                label = stringResource(R.string.nd_filter),
                options = listOf(stringResource(R.string.nd_none)) + data.ndFilters.map { it.name },
                selected = ndIndex,
                onSelect = { ndIndex = it },
                modifier = Modifier.weight(1f),
            )
        }

        // 场景亮度
        Card(Modifier.fillMaxWidth()) {
            Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("EV", style = MaterialTheme.typography.labelLarge)
                    Text(
                        String.format(Locale.ROOT, "%.1f", ev),
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.SemiBold,
                    )
                }
                listOf(-1 to R.string.ev_decrease, 1 to R.string.ev_increase).forEach { (delta, label) ->
                    val description = stringResource(label)
                    IconButton(
                        onClick = { stepEv(delta) },
                        modifier = Modifier.semantics { contentDescription = description },
                    ) {
                        Text(if (delta < 0) "−" else "+", style = MaterialTheme.typography.headlineSmall)
                    }
                }
            }
        }

        if (solved.outOfRangeStops != 0.0) {
            Text(
                stringResource(
                    if (solved.outOfRangeStops > 0) R.string.exposure_overexposed else R.string.exposure_underexposed,
                    abs(solved.outOfRangeStops).plain(),
                ),
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodyMedium,
            )
        }

        // 光圈 / 快门 / ISO
        ExposureParam.entries.forEach { param ->
            val options = when (param) {
                ExposureParam.Aperture -> data.apertures
                ExposureParam.Shutter -> data.shutterValues
                ExposureParam.Iso -> data.isos
            }
            val value = shown[param]
            val isAuto = param == autoParam
            LabeledSlider(
                label = stringResource(paramLabel(param)),
                valueText = when (param) {
                    ExposureParam.Aperture -> "f/${value.plain()}"
                    ExposureParam.Shutter -> formatShutterSpeed(value, units)
                    ExposureParam.Iso -> "ISO ${value.plain()}"
                },
                index = options.indexOf(value).coerceAtLeast(0),
                count = options.size,
                onChange = { values = shown.with(param, options[it]) },
                valueColor = if (isAuto) MaterialTheme.colorScheme.tertiary else Color.Unspecified,
                // 自动参数只显示结果，不能拖动
                enabled = !isAuto,
                trailing = {
                    FilterChip(
                        selected = isAuto,
                        onClick = {
                            values = shown
                            autoParam = param
                        },
                        label = { Text(stringResource(R.string.exposure_auto)) },
                        modifier = Modifier.padding(start = 8.dp),
                    )
                },
            )
        }

        if (nd != null) {
            Card(Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp).fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(stringResource(R.string.result_nd), style = MaterialTheme.typography.labelLarge)
                    Text(
                        formatShutterSpeed(ndShutter, units),
                        style = MaterialTheme.typography.displayMedium,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary,
                    )
                }
            }
        }

        Button(
            onClick = { onOpenReciprocity(ReciprocityInput(shown.shutter, nd?.stops ?: 0)) },
            modifier = Modifier.fillMaxWidth(),
        ) {
            Text(stringResource(R.string.to_reciprocity))
        }
    }
}

@Composable
private fun DropdownField(
    label: String,
    options: List<String>,
    selected: Int,
    onSelect: (Int) -> Unit,
    modifier: Modifier = Modifier,
) {
    var expanded by remember { mutableStateOf(false) }
    Box(modifier) {
        OutlinedCard(Modifier.fillMaxWidth().clickable { expanded = true }) {
            Column(Modifier.padding(12.dp)) {
                Text(
                    label,
                    style = MaterialTheme.typography.labelMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Text(
                    options[selected],
                    style = MaterialTheme.typography.bodyLarge,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
            }
        }
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            options.forEachIndexed { index, option ->
                DropdownMenuItem(
                    text = { Text(option) },
                    onClick = {
                        expanded = false
                        onSelect(index)
                    },
                )
            }
        }
    }
}

private fun paramLabel(param: ExposureParam): Int = when (param) {
    ExposureParam.Aperture -> R.string.param_aperture
    ExposureParam.Shutter -> R.string.param_shutter
    ExposureParam.Iso -> R.string.param_iso
}

/** 8.0 → "8"，5.6 → "5.6" */
private fun Double.plain(): String = if (this % 1.0 == 0.0) toLong().toString() else toString()
