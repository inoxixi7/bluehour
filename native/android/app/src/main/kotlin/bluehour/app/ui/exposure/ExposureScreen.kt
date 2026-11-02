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
import androidx.compose.material3.Icon
import androidx.compose.material3.IconToggleButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.listSaver
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringArrayResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import bluehour.app.R
import bluehour.app.ui.common.LabeledSlider
import bluehour.app.ui.common.TitleWithHelp
import bluehour.app.ui.common.durationUnits
import bluehour.app.ui.reciprocity.ReciprocityInput
import bluehour.core.ExposureLocks
import bluehour.core.ExposureParam
import bluehour.core.ExposureValues
import bluehour.core.PhotographyData
import bluehour.core.calculateEV
import bluehour.core.calculateNDShutter
import bluehour.core.formatShutterSpeed
import bluehour.core.shutterValues
import java.util.Locale

private val DEFAULT_VALUES = ExposureValues(aperture = 8.0, shutter = 1.0 / 4, iso = 100.0)

private val valuesSaver = listSaver<ExposureValues, Double>(
    save = { listOf(it.aperture, it.shutter, it.iso) },
    restore = { ExposureValues(it[0], it[1], it[2]) },
)

/**
 * 曝光计算：光圈 / 快门 / ISO 可分别锁定，改动一个参数时由未锁定的参数补偿；
 * 可锁定当前 EV 或选择场景（目标 EV），并计算加 ND 滤镜后的快门
 */
@Composable
fun ExposureScreen(modifier: Modifier = Modifier, onOpenReciprocity: (ReciprocityInput) -> Unit = {}) {
    val data = PhotographyData.default
    val units = durationUnits()
    val sceneNames = stringArrayResource(R.array.ev_scenes)
    check(sceneNames.size == data.evScenes.size) { "ev_scenes 与 photography.json 的 evScenes 数量不一致" }

    var values by rememberSaveable(stateSaver = valuesSaver) { mutableStateOf(DEFAULT_VALUES) }
    // 默认只锁定 ISO（胶片模式友好）
    var locked by rememberSaveable { mutableStateOf<Set<ExposureParam>>(linkedSetOf(ExposureParam.Iso)) }
    // 锁定的目标 EV；null 表示未锁定
    var targetEV by rememberSaveable { mutableStateOf<Double?>(null) }
    // 0 表示未选场景，1..n 对应 evScenes
    var sceneIndex by rememberSaveable { mutableIntStateOf(0) }
    // 0 表示不用 ND，1..n 对应 ndFilters
    var ndIndex by rememberSaveable { mutableIntStateOf(0) }

    val evLocked = targetEV != null
    val currentEV = calculateEV(values)
    val nd = data.ndFilters.getOrNull(ndIndex - 1)
    val ndShutter = calculateNDShutter(values.shutter, (nd?.stops ?: 0).toDouble())

    fun unlockEV() {
        targetEV = null
        sceneIndex = 0
    }

    fun selectScene(index: Int) {
        if (index == 0 || index == sceneIndex) {
            unlockEV()
            return
        }
        val scene = data.evScenes[index - 1]
        sceneIndex = index
        targetEV = scene.ev
        values = ExposureLocks.applyTargetEV(values, scene.ev, locked, data)
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

        // EV 与锁定
        Card(Modifier.fillMaxWidth()) {
            Row(Modifier.padding(16.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("EV", style = MaterialTheme.typography.labelLarge)
                    Text(
                        String.format(Locale.ROOT, "%.1f", currentEV),
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.SemiBold,
                    )
                }
                if (evLocked) {
                    OutlinedButton(onClick = ::unlockEV) {
                        Icon(painterResource(R.drawable.ic_lock), contentDescription = null)
                        Text(stringResource(R.string.unlock_ev), Modifier.padding(start = 8.dp))
                    }
                } else {
                    OutlinedButton(onClick = { targetEV = currentEV }) {
                        Icon(painterResource(R.drawable.ic_lock_open), contentDescription = null)
                        Text(stringResource(R.string.lock_ev), Modifier.padding(start = 8.dp))
                    }
                }
            }
        }

        // 光圈 / 快门 / ISO
        ExposureParam.entries.forEach { param ->
            val options = when (param) {
                ExposureParam.Aperture -> data.apertures
                ExposureParam.Shutter -> data.shutterValues
                ExposureParam.Iso -> data.isos
            }
            val value = values[param]
            val isLocked = param in locked
            val isAuto = ExposureLocks.isAutoAdjusted(param, locked, evLocked)
            LabeledSlider(
                label = stringResource(paramLabel(param)) +
                    if (isAuto) " · ${stringResource(R.string.will_adjust)}" else "",
                valueText = when (param) {
                    ExposureParam.Aperture -> "f/${value.plain()}"
                    ExposureParam.Shutter -> formatShutterSpeed(value, units)
                    ExposureParam.Iso -> "ISO ${value.plain()}"
                },
                index = options.indexOf(value).coerceAtLeast(0),
                count = options.size,
                onChange = {
                    values = ExposureLocks.applyParamChange(values, param, options[it], locked, targetEV, data)
                },
                valueColor = when {
                    isAuto -> MaterialTheme.colorScheme.tertiary
                    isLocked -> MaterialTheme.colorScheme.primary
                    else -> Color.Unspecified
                },
                trailing = {
                    IconToggleButton(
                        checked = isLocked,
                        onCheckedChange = { locked = ExposureLocks.toggleParamLock(locked, param, evLocked) },
                    ) {
                        Icon(
                            painterResource(if (isLocked) R.drawable.ic_lock else R.drawable.ic_lock_open),
                            contentDescription = stringResource(if (isLocked) R.string.unlock_ev else R.string.lock_ev),
                            tint = if (isLocked) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurfaceVariant,
                        )
                    }
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
            onClick = { onOpenReciprocity(ReciprocityInput(values.shutter, nd?.stops ?: 0)) },
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
