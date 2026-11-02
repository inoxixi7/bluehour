package bluehour.app.timer

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LocalLifecycleOwner
import bluehour.app.R
import bluehour.core.formatCountdown
import kotlinx.coroutines.delay
import kotlin.math.ceil

/**
 * B 门计时器：以结束时间戳计时（切到后台、旋转屏幕都不会停表），
 * 结束时应用内震动；应用不在前台时由系统通知提醒
 */
@Composable
fun BulbTimerCard(targetSeconds: Long, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val lifecycle = LocalLifecycleOwner.current.lifecycle
    // 结束时间（epoch ms）；null 表示未开始
    var endAt by rememberSaveable { mutableStateOf<Long?>(null) }
    var done by rememberSaveable { mutableStateOf(false) }
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    val running = endAt != null && !done

    val requestNotifications = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) {}

    LaunchedEffect(endAt, done) {
        val end = endAt ?: return@LaunchedEffect
        if (done) return@LaunchedEffect
        while (true) {
            now = System.currentTimeMillis()
            if (now >= end) break
            delay(250)
        }
        done = true
        // 在前台时由应用提醒，避免和系统通知重复；不在前台（或回到页面时早已结束）交给系统通知
        val justEnded = System.currentTimeMillis() - end < 2000
        if (justEnded && lifecycle.currentState.isAtLeast(Lifecycle.State.RESUMED)) {
            ExposureTimerAlarm.cancel(context)
            context.getSystemService(Vibrator::class.java)
                ?.vibrate(VibrationEffect.createWaveform(TIMER_VIBRATION, -1))
        }
    }

    // 计时中保持屏幕常亮
    val view = LocalView.current
    DisposableEffect(running) {
        view.keepScreenOn = running
        onDispose { view.keepScreenOn = false }
    }

    val remaining = when {
        done -> 0L
        endAt != null -> ceil((endAt!! - now).coerceAtLeast(0) / 1000.0).toLong()
        else -> targetSeconds
    }

    fun start() {
        if (targetSeconds <= 0) return
        val end = System.currentTimeMillis() + targetSeconds * 1000
        now = System.currentTimeMillis()
        endAt = end
        ExposureTimerAlarm.schedule(context, end)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
        ) {
            requestNotifications.launch(Manifest.permission.POST_NOTIFICATIONS)
        }
    }

    fun reset() {
        endAt = null
        done = false
        ExposureTimerAlarm.cancel(context)
    }

    Card(modifier.fillMaxWidth()) {
        Column(
            Modifier.padding(16.dp).fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text(stringResource(R.string.timer_title), style = MaterialTheme.typography.titleMedium)
            Text(
                formatCountdown(remaining),
                style = MaterialTheme.typography.displayLarge,
                fontWeight = FontWeight.SemiBold,
                color = if (running) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface,
            )
            if (done) {
                Text(
                    stringResource(R.string.timer_done),
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.tertiary,
                )
            }
            when {
                running -> OutlinedButton(onClick = ::reset, Modifier.fillMaxWidth()) {
                    Text(stringResource(R.string.timer_stop))
                }
                done -> Button(onClick = ::reset, Modifier.fillMaxWidth()) {
                    Text(stringResource(R.string.timer_reset))
                }
                else -> Button(onClick = ::start, Modifier.fillMaxWidth(), enabled = targetSeconds > 0) {
                    Text(stringResource(R.string.timer_start))
                }
            }
        }
    }
}
