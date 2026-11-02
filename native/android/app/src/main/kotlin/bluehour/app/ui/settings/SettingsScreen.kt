package bluehour.app.ui.settings

import android.Manifest
import android.app.AlarmManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.StringRes
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.ListItem
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.RadioButton
import androidx.compose.material3.Switch
import androidx.compose.material3.TextButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLocale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import bluehour.app.AppSettings
import bluehour.app.R
import bluehour.app.ThemeMode
import bluehour.app.reminder.GoldenHourReminders
import bluehour.app.ui.common.ScreenTitle

/**
 * 设置：语言（Android 13+ 交给系统的应用语言设置）、主题、黄金时刻提醒
 */
@Composable
fun SettingsScreen(themeMode: ThemeMode, onThemeChange: (ThemeMode) -> Unit, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val settings = remember { AppSettings(context) }
    var exactAlarms by remember { mutableStateOf(canScheduleExactAlarms(context)) }
    // 从系统设置返回时刷新，并按新权限重新安排提醒
    LifecycleEventEffect(Lifecycle.Event.ON_RESUME) {
        val now = canScheduleExactAlarms(context)
        if (now != exactAlarms) {
            exactAlarms = now
            GoldenHourReminders.reschedule(context)
        }
    }
    var reminder by remember { mutableStateOf(settings.goldenHourReminder) }
    var permissionDenied by remember { mutableStateOf(false) }

    fun setReminder(enabled: Boolean) {
        reminder = enabled
        settings.goldenHourReminder = enabled
        GoldenHourReminders.reschedule(context)
    }

    val requestNotifications = rememberLauncherForActivityResult(ActivityResultContracts.RequestPermission()) {
        permissionDenied = !it
        setReminder(it)
    }

    Column(
        modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        ScreenTitle(stringResource(R.string.tab_settings), Modifier.padding(horizontal = 16.dp))

        SectionTitle(R.string.settings_preferences)
        // 应用内切换语言需要 AppCompat；Android 13 起系统提供每个应用的语言设置
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            ListItem(
                headlineContent = { Text(stringResource(R.string.settings_language)) },
                supportingContent = { Text(LocalLocale.current.platformLocale.let { it.getDisplayLanguage(it) }) },
                modifier = Modifier.clickable {
                    context.startActivity(
                        Intent(Settings.ACTION_APP_LOCALE_SETTINGS, Uri.fromParts("package", context.packageName, null)),
                    )
                },
            )
        }

        Text(
            stringResource(R.string.settings_theme),
            style = MaterialTheme.typography.titleSmall,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
        )
        ThemeMode.entries.forEach { mode ->
            ListItem(
                headlineContent = { Text(stringResource(themeLabel(mode))) },
                leadingContent = { RadioButton(selected = mode == themeMode, onClick = null) },
                modifier = Modifier.selectable(
                    selected = mode == themeMode,
                    role = Role.RadioButton,
                    onClick = { onThemeChange(mode) },
                ),
            )
        }

        HorizontalDivider(Modifier.padding(vertical = 8.dp))
        SectionTitle(R.string.settings_reminders)
        ListItem(
            headlineContent = { Text(stringResource(R.string.golden_reminder_title)) },
            supportingContent = {
                Text(
                    stringResource(
                        if (permissionDenied) R.string.notification_permission_message else R.string.golden_reminder_description,
                    ),
                )
            },
            trailingContent = { Switch(checked = reminder, onCheckedChange = null) },
            modifier = Modifier.toggleable(value = reminder, role = Role.Switch) { enabled ->
                val needsPermission = enabled &&
                    Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
                    context.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
                if (needsPermission) {
                    requestNotifications.launch(Manifest.permission.POST_NOTIFICATIONS)
                } else {
                    permissionDenied = false
                    setReminder(enabled)
                }
            },
        )

        if (reminder && !exactAlarms && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            ListItem(
                headlineContent = { Text(stringResource(R.string.exact_alarm_hint)) },
                trailingContent = {
                    TextButton(onClick = {
                        context.startActivity(
                            Intent(
                                Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM,
                                Uri.fromParts("package", context.packageName, null),
                            ),
                        )
                    }) { Text(stringResource(R.string.open_settings)) }
                },
            )
        }

        HorizontalDivider(Modifier.padding(vertical = 8.dp))
        ListItem(
            headlineContent = { Text(stringResource(R.string.settings_version)) },
            supportingContent = {
                Text(context.packageManager.getPackageInfo(context.packageName, 0).versionName.orEmpty())
            },
        )
    }
}

@Composable
private fun SectionTitle(@StringRes text: Int) {
    Text(
        stringResource(text),
        style = MaterialTheme.typography.labelLarge,
        color = MaterialTheme.colorScheme.primary,
        modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
    )
}

private fun themeLabel(mode: ThemeMode): Int = when (mode) {
    ThemeMode.System -> R.string.theme_system
    ThemeMode.Light -> R.string.theme_light
    ThemeMode.Dark -> R.string.theme_dark
}

private fun canScheduleExactAlarms(context: Context): Boolean =
    Build.VERSION.SDK_INT < Build.VERSION_CODES.S ||
        context.getSystemService(AlarmManager::class.java).canScheduleExactAlarms()
