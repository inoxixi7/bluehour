package bluehour.app.ui.common

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Slider
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import bluehour.app.R
import bluehour.core.DurationUnits
import kotlin.math.roundToInt

/** 在一组离散值中选择（index 为 0..count-1），标题行可附加 trailing 内容 */
@Composable
fun LabeledSlider(
    label: String,
    valueText: String,
    index: Int,
    count: Int,
    onChange: (Int) -> Unit,
    valueColor: Color = Color.Unspecified,
    trailing: @Composable () -> Unit = {},
) {
    Column {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text(label, style = MaterialTheme.typography.labelLarge, modifier = Modifier.weight(1f))
            Text(valueText, style = MaterialTheme.typography.titleMedium, color = valueColor)
            trailing()
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
fun durationUnits(): DurationUnits = DurationUnits(
    second = stringResource(R.string.unit_second),
    seconds = stringResource(R.string.unit_seconds),
    sec = stringResource(R.string.unit_sec),
    minutes = stringResource(R.string.unit_minutes),
    min = stringResource(R.string.unit_min),
    hours = stringResource(R.string.unit_hours),
)
