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
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import bluehour.app.timer.BulbTimerCard
import bluehour.app.ui.common.LabeledSlider
import bluehour.app.ui.common.TitleWithHelp
import bluehour.app.ui.common.durationUnits
import bluehour.core.Film
import bluehour.core.FilmCatalog
import bluehour.core.PhotographyData
import bluehour.core.ReciprocitySource
import bluehour.core.calculateNDShutter
import bluehour.core.calculateReciprocity
import bluehour.core.formatExtraStops
import bluehour.core.formatShutterSpeed
import kotlin.math.ceil

private const val DEFAULT_FILM_ID = "kodak_trix"
private const val DEFAULT_SHUTTER_SECONDS = 1.0

/** 从曝光页带过来的测光快门（标准快门值）与 ND 档数 */
data class ReciprocityInput(val shutter: Double, val ndStops: Int)

/**
 * 倒易律计算：选择胶片、测光快门与 ND 滤镜，显示校正后的曝光时间
 */
@Composable
fun ReciprocityScreen(
    modifier: Modifier = Modifier,
    input: ReciprocityInput? = null,
    onInputConsumed: () -> Unit = {},
) {
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

    LaunchedEffect(input) {
        if (input == null) return@LaunchedEffect
        shutters.indexOfFirst { it.value == input.shutter }.takeIf { it >= 0 }?.let { shutterIndex = it }
        ndIndex = ndFilters.indexOfFirst { it.stops == input.ndStops } + 1
        onInputConsumed()
    }

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
        TitleWithHelp(
            title = stringResource(R.string.reciprocity_title),
            helpTitle = R.string.help_reciprocity_title,
            helpDescription = R.string.help_reciprocity_description,
            helpSections = listOf(
                R.array.help_reciprocity_section1,
                R.array.help_reciprocity_section2,
                R.array.help_reciprocity_section3,
            ),
        )

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

        // 向上取整，宁可略多曝光也不欠曝
        BulbTimerCard(targetSeconds = ceil(result.correctedSeconds - 0.05).toLong().coerceAtLeast(0))

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
