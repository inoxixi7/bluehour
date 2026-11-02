package bluehour.app.ui.light

import android.Manifest
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.StringRes
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import bluehour.app.AppSettings
import bluehour.app.R
import bluehour.app.reminder.GoldenHourReminders
import bluehour.app.ui.common.ScreenTitle
import bluehour.core.BlueHourWindowId
import bluehour.core.LightPhaseId
import bluehour.core.LightPhases
import bluehour.core.SunPosition
import kotlinx.coroutines.delay
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.time.format.FormatStyle
import java.util.Locale
import kotlin.math.abs

private const val TICK_MS = 30_000L

private enum class LocationStatus { NeedPermission, Denied, Locating, Unavailable, Ready }

/**
 * 蓝调时刻：用当前位置在本地计算日出日落、黄金与蓝调时刻
 */
@Composable
fun LightScreen(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    var lat by rememberSaveable { mutableStateOf<Double?>(null) }
    var lng by rememberSaveable { mutableStateOf<Double?>(null) }
    var denied by rememberSaveable { mutableStateOf(false) }
    var unavailable by remember { mutableStateOf(false) }
    // 每次加一触发一次定位
    var locateRequest by remember { mutableIntStateOf(0) }

    val permissionLauncher = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
        denied = !granted
        if (granted) locateRequest++
    }

    val permitted = hasLocationPermission(context)
    val status = when {
        lat != null && lng != null -> LocationStatus.Ready
        !permitted -> if (denied) LocationStatus.Denied else LocationStatus.NeedPermission
        unavailable -> LocationStatus.Unavailable
        else -> LocationStatus.Locating
    }

    LaunchedEffect(locateRequest, permitted) {
        if (!permitted) return@LaunchedEffect
        unavailable = false
        val location = currentLocation(context)
        if (location != null) {
            lat = location.latitude
            lng = location.longitude
            // 黄金时刻提醒在后台用上次定位计算
            AppSettings(context).lastLocation = location.latitude to location.longitude
            GoldenHourReminders.reschedule(context)
        } else if (lat == null) {
            unavailable = true
        }
    }

    val retry: () -> Unit = {
        if (hasLocationPermission(context)) {
            locateRequest++
        } else {
            permissionLauncher.launch(Manifest.permission.ACCESS_COARSE_LOCATION)
        }
    }

    Column(
        modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        ScreenTitle(stringResource(R.string.light_title))

        when (status) {
            LocationStatus.NeedPermission -> Message(R.string.location_rationale) {
                Button(onClick = retry) { Text(stringResource(R.string.location_allow)) }
            }
            LocationStatus.Denied -> Message(R.string.location_denied) {
                Button(onClick = {
                    context.startActivity(
                        Intent(
                            Settings.ACTION_APPLICATION_DETAILS_SETTINGS,
                            Uri.fromParts("package", context.packageName, null),
                        ),
                    )
                }) { Text(stringResource(R.string.open_settings)) }
                OutlinedButton(onClick = retry) { Text(stringResource(R.string.retry)) }
            }
            LocationStatus.Unavailable -> Message(R.string.location_unavailable) {
                Button(onClick = retry) { Text(stringResource(R.string.retry)) }
            }
            LocationStatus.Locating -> Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                CircularProgressIndicator(Modifier.padding(4.dp))
                Text(stringResource(R.string.locating), style = MaterialTheme.typography.bodyLarge)
            }
            LocationStatus.Ready -> SunSchedule(lat!!, lng!!, onRefresh = { locateRequest++ })
        }
    }
}

@Composable
private fun Message(@StringRes text: Int, actions: @Composable () -> Unit) {
    OutlinedCard(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Text(stringResource(text), style = MaterialTheme.typography.bodyLarge)
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { actions() }
        }
    }
}

@Composable
private fun SunSchedule(lat: Double, lng: Double, onRefresh: () -> Unit) {
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(Unit) {
        while (true) {
            delay(TICK_MS)
            now = System.currentTimeMillis()
        }
    }

    // shortcut: 假设设备时区就是所在地时区（只用当前定位时成立），以后支持搜索地点时改为按坐标查时区
    val zone = ZoneId.systemDefault()
    val date = Instant.ofEpochMilli(now).atZone(zone).toLocalDate()
    val sun = remember(lat, lng, date) { SunPosition.sunTimes(lat, lng, date) }
    val hours = remember(sun) { SunPosition.goldenAndBlueHours(sun.sunrise, sun.sunset, lat, lng) }
    val timeline = remember(hours) { LightPhases.timeline(hours) }
    val state = LightPhases.currentState(timeline, now)
    val nextBlue = LightPhases.nextBlueHour(hours, now)
    val formatter = remember(zone) { DateTimeFormatter.ofLocalizedTime(FormatStyle.SHORT).withZone(zone) }
    fun time(ms: Long) = formatter.format(Instant.ofEpochMilli(ms))
    fun range(start: Long, end: Long) = "${time(start)} – ${time(end)}"

    Row(verticalAlignment = Alignment.CenterVertically) {
        Text(
            formatCoordinates(lat, lng),
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.weight(1f),
        )
        TextButton(onClick = onRefresh) { Text(stringResource(R.string.refresh_location)) }
    }

    if (state != null) {
        val golden = state.current.id == LightPhaseId.MorningGoldenHour || state.current.id == LightPhaseId.EveningGoldenHour
        val colors = MaterialTheme.colorScheme
        Card(
            Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = if (golden) colors.secondaryContainer else colors.primaryContainer,
                contentColor = if (golden) colors.onSecondaryContainer else colors.onPrimaryContainer,
            ),
        ) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(stringResource(R.string.current_phase), style = MaterialTheme.typography.labelLarge)
                Text(
                    stringResource(phaseLabel(state.current.id)),
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.SemiBold,
                )
                LinearProgressIndicator(
                    progress = { state.progress.toFloat() },
                    modifier = Modifier.fillMaxWidth(),
                    color = if (golden) colors.secondary else colors.primary,
                    trackColor = colors.surface.copy(alpha = 0.5f),
                )
                Text(
                    stringResource(
                        R.string.phase_ends_in,
                        duration(state.minutesUntilTransition),
                        stringResource(phaseLabel(state.next.id)),
                    ),
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }
    }

    Card(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(stringResource(R.string.next_blue_hour), style = MaterialTheme.typography.labelLarge)
            val label = when (nextBlue.id) {
                BlueHourWindowId.Morning -> stringResource(R.string.phase_morning_blue)
                BlueHourWindowId.Evening -> stringResource(R.string.phase_evening_blue)
                BlueHourWindowId.Tomorrow ->
                    "${stringResource(R.string.tomorrow)} · ${stringResource(R.string.phase_morning_blue)}"
            }
            Text(label, style = MaterialTheme.typography.titleMedium)
            Text(
                range(nextBlue.start, nextBlue.end),
                style = MaterialTheme.typography.headlineSmall,
                color = MaterialTheme.colorScheme.primary,
            )
        }
    }

    Column {
        Text(
            stringResource(R.string.today_schedule),
            style = MaterialTheme.typography.titleMedium,
            modifier = Modifier.padding(bottom = 8.dp),
        )
        ScheduleRow(R.string.phase_morning_blue, range(hours.morningBlueHourStart, hours.morningBlueHourEnd), accent = MaterialTheme.colorScheme.primary)
        ScheduleRow(R.string.sunrise, time(sun.sunrise))
        ScheduleRow(R.string.phase_morning_golden, range(hours.morningGoldenHourStart, hours.morningGoldenHourEnd), accent = MaterialTheme.colorScheme.secondary)
        ScheduleRow(R.string.solar_noon, time(sun.solarNoon))
        ScheduleRow(R.string.phase_evening_golden, range(hours.eveningGoldenHourStart, hours.eveningGoldenHourEnd), accent = MaterialTheme.colorScheme.secondary)
        ScheduleRow(R.string.sunset, time(sun.sunset))
        ScheduleRow(R.string.phase_evening_blue, range(hours.eveningBlueHourStart, hours.eveningBlueHourEnd), accent = MaterialTheme.colorScheme.primary)
        ScheduleRow(R.string.day_length, duration((sun.dayLengthSeconds / 60).toLong()), divider = false)
    }
}

@Composable
private fun ScheduleRow(@StringRes label: Int, value: String, divider: Boolean = true, accent: Color = Color.Transparent) {
    Row(
        Modifier.fillMaxWidth().padding(vertical = 12.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        // 蓝调 / 黄金时刻的色条，与图标色带对应
        Box(Modifier.size(width = 4.dp, height = 20.dp).background(accent, RoundedCornerShape(2.dp)))
        Text(stringResource(label), style = MaterialTheme.typography.bodyLarge, modifier = Modifier.weight(1f))
        Text(value, style = MaterialTheme.typography.bodyLarge, fontWeight = FontWeight.Medium)
    }
    if (divider) HorizontalDivider()
}

@StringRes
private fun phaseLabel(id: LightPhaseId): Int = when (id) {
    LightPhaseId.MorningBlueHour, LightPhaseId.NextMorningBlueHour -> R.string.phase_morning_blue
    LightPhaseId.MorningGoldenHour -> R.string.phase_morning_golden
    LightPhaseId.Daylight -> R.string.phase_daylight
    LightPhaseId.EveningGoldenHour -> R.string.phase_evening_golden
    LightPhaseId.EveningBlueHour -> R.string.phase_evening_blue
    LightPhaseId.Night -> R.string.phase_night
}

@Composable
private fun duration(minutes: Long): String =
    if (minutes >= 60) {
        stringResource(R.string.duration_hm, minutes / 60, minutes % 60)
    } else {
        stringResource(R.string.duration_m, minutes)
    }

private fun formatCoordinates(lat: Double, lng: Double): String =
    String.format(
        Locale.ROOT,
        "%.2f°%s, %.2f°%s",
        abs(lat), if (lat >= 0) "N" else "S",
        abs(lng), if (lng >= 0) "E" else "W",
    )
