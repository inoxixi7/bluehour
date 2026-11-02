package bluehour.app.ui

import androidx.annotation.DrawableRes
import androidx.annotation.StringRes
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.saveable.rememberSaveableStateHolder
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import bluehour.app.R
import bluehour.app.ThemeMode
import bluehour.app.ui.exposure.ExposureScreen
import bluehour.app.ui.light.LightScreen
import bluehour.app.ui.reciprocity.ReciprocityInput
import bluehour.app.ui.reciprocity.ReciprocityScreen
import bluehour.app.ui.settings.SettingsScreen

private enum class Tab(@StringRes val label: Int, @DrawableRes val icon: Int) {
    Light(R.string.tab_light, R.drawable.ic_tab_light),
    Exposure(R.string.tab_exposure, R.drawable.ic_tab_exposure),
    Reciprocity(R.string.tab_reciprocity, R.drawable.ic_tab_reciprocity),
    Settings(R.string.tab_settings, R.drawable.ic_tab_settings),
}

@Composable
fun BlueHourApp(themeMode: ThemeMode, onThemeChange: (ThemeMode) -> Unit) {
    var selected by rememberSaveable { mutableStateOf(Tab.Light) }
    // 切换标签时保留各页面的状态
    val stateHolder = rememberSaveableStateHolder()
    var reciprocityInput by remember { mutableStateOf<ReciprocityInput?>(null) }

    Scaffold(
        bottomBar = {
            NavigationBar {
                Tab.entries.forEach { tab ->
                    NavigationBarItem(
                        selected = tab == selected,
                        onClick = { selected = tab },
                        icon = { Icon(painterResource(tab.icon), contentDescription = null) },
                        label = { Text(stringResource(tab.label)) },
                    )
                }
            }
        },
    ) { innerPadding ->
        val modifier = Modifier.padding(innerPadding)
        stateHolder.SaveableStateProvider(selected) {
            when (selected) {
                Tab.Light -> LightScreen(modifier)
                Tab.Exposure -> ExposureScreen(modifier, onOpenReciprocity = {
                    reciprocityInput = it
                    selected = Tab.Reciprocity
                })
                Tab.Reciprocity -> ReciprocityScreen(modifier, reciprocityInput, onInputConsumed = { reciprocityInput = null })
                Tab.Settings -> SettingsScreen(themeMode, onThemeChange, modifier)
            }
        }
    }
}
