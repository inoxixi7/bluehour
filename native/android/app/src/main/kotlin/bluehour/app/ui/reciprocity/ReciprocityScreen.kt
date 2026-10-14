package bluehour.app.ui.reciprocity

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import bluehour.app.R
import bluehour.core.DurationUnits
import bluehour.core.Film
import bluehour.core.FilmCatalog
import bluehour.core.PhotographyData
import bluehour.core.ReciprocitySource
import bluehour.core.calculateNDShutter
import bluehour.core.calculateReciprocity
import bluehour.core.formatExtraStops
import bluehour.core.formatShutterSpeed
import kotlin.math.roundToInt

private const val DEFAULT_FILM_ID = "kodak_trix"
private const val DEFAULT_SHUTTER_SECONDS = 1.0

/**
 * 倒易律计算：选择胶片、测光快门与 ND 滤镜，显示校正后的曝光时间
 */
@Composable
fun ReciprocityScreen(modifier: Modifier = Modifier) {
    val films = FilmCatalog.films
    val photography = PhotographyData.default
    val shutters = photography.shutterSpeeds
    val ndFilters = photography.ndFilters
    val units = durationUnits()

    var filmId by rememberSaveable { mutableStateOf(DEFAULT_FILM_ID) }
    var shutterIndex by rememberSaveable {
        mutableIntStateOf(shutters.indexOfFirst { it.value == DEFAULT_SHUTTER_SECONDS }.coerceAtLeast(0))
    }
    // 0 表示不用 ND，1..n 对应 ndFilters 中的滤镜
    var ndIndex by rememberSaveable { mutableIntStateOf(0) }
    var showFilmPicker by remember { mutableStateOf(false) }

    val film = films.firstOrNull { it.id == filmId } ?: films.first()
    val nd = ndFilters.getOrNull(ndIndex - 1)
    val baseShutter = shutters[shutterIndex].value
    val metered = calculateNDShutter(baseShutter, (nd?.stops ?: 0).toDouble())
    val result = calculateReciprocity(metered, film)

    Column(
        modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(stringResource(R.string.reciprocity_title), style = MaterialTheme.typography.headlineMedium)

        // 胶片
        OutlinedCard(Modifier.fillMaxWidth().clickable { showFilmPicker = true }) {
            Column(Modifier.padding(16.dp)) {
                Text(stringResource(R.string.film_profile), style = MaterialTheme.typography.labelLarge)
                Text(film.name, style = MaterialTheme.typography.titleLarge)
                Text(
                    "${stringResource(R.string.data_source)}: ${sourceLabel(film.source)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
        }

        // 测光快门
        LabeledSlider(
            label = stringResource(R.string.metered_shutter),
            valueText = formatShutterSpeed(baseShutter, units),
            index = shutterIndex,
            count = shutters.size,
            onChange = { shutterIndex = it },
        )

        // ND 滤镜
        LabeledSlider(
            label = stringResource(R.string.nd_filter),
            valueText = nd?.name ?: stringResource(R.string.nd_none),
            index = ndIndex,
            count = ndFilters.size + 1,
            onChange = { ndIndex = it },
        )

        ResultCard(
            metered = formatShutterSpeed(metered, units),
            corrected = formatShutterSpeed(result.correctedSeconds, units),
            extraStops = formatExtraStops(result.extraStops),
        )

        val maxReliable = film.maxReliableSeconds
        if (result.isExtrapolated && maxReliable != null) {
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = MaterialTheme.colorScheme.errorContainer,
                    contentColor = MaterialTheme.colorScheme.onErrorContainer,
                ),
            ) {
                Text(
                    stringResource(R.string.extrapolated_warning, formatShutterSpeed(maxReliable, units)),
                    modifier = Modifier.padding(16.dp),
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }
    }

    if (showFilmPicker) {
        FilmPickerDialog(
            films = films,
            selectedId = film.id,
            onSelect = {
                filmId = it.id
                showFilmPicker = false
            },
            onDismiss = { showFilmPicker = false },
        )
    }
}

@Composable
private fun LabeledSlider(label: String, valueText: String, index: Int, count: Int, onChange: (Int) -> Unit) {
    Column {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text(label, style = MaterialTheme.typography.labelLarge, modifier = Modifier.weight(1f))
            Text(valueText, style = MaterialTheme.typography.titleMedium)
        }
        Slider(
            value = index.toFloat(),
            onValueChange = { onChange(it.roundToInt().coerceIn(0, count - 1)) },
            valueRange = 0f..(count - 1).toFloat(),
            steps = (count - 2).coerceAtLeast(0),
        )
    }
}

@Composable
private fun ResultCard(metered: String, corrected: String, extraStops: String) {
    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            ResultRow(stringResource(R.string.result_base), metered)
            Text(stringResource(R.string.result_reciprocity), style = MaterialTheme.typography.labelLarge)
            Text(
                corrected,
                style = MaterialTheme.typography.displayMedium,
                fontWeight = FontWeight.SemiBold,
                color = MaterialTheme.colorScheme.primary,
            )
            ResultRow(stringResource(R.string.extra_stops), extraStops)
        }
    }
}

@Composable
private fun ResultRow(label: String, value: String) {
    Row(Modifier.fillMaxWidth()) {
        Text(label, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
        Text(value, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun FilmPickerDialog(
    films: List<Film>,
    selectedId: String,
    onSelect: (Film) -> Unit,
    onDismiss: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(R.string.select_film)) },
        text = {
            LazyColumn(Modifier.heightIn(max = 480.dp)) {
                items(films, key = { it.id }) { film ->
                    ListItem(
                        headlineContent = { Text(film.name) },
                        supportingContent = { Text("ISO ${film.iso} · ${sourceLabel(film.source)}") },
                        leadingContent = { RadioButton(selected = film.id == selectedId, onClick = null) },
                        modifier = Modifier.clickable { onSelect(film) },
                    )
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(onClick = onDismiss) { Text(stringResource(R.string.cancel)) }
        },
    )
}

@Composable
private fun sourceLabel(source: ReciprocitySource): String = stringResource(
    when (source) {
        ReciprocitySource.Manufacturer -> R.string.source_manufacturer
        ReciprocitySource.Community -> R.string.source_community
        ReciprocitySource.Estimate -> R.string.source_estimate
    },
)

@Composable
private fun durationUnits(): DurationUnits = DurationUnits(
    second = stringResource(R.string.unit_second),
    seconds = stringResource(R.string.unit_seconds),
    sec = stringResource(R.string.unit_sec),
    minutes = stringResource(R.string.unit_minutes),
    min = stringResource(R.string.unit_min),
    hours = stringResource(R.string.unit_hours),
)
