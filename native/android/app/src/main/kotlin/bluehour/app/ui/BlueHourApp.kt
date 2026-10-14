package bluehour.app.ui

import androidx.annotation.DrawableRes
import androidx.annotation.StringRes
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import bluehour.app.R
import bluehour.app.ui.light.LightScreen
import bluehour.app.ui.reciprocity.ReciprocityScreen

private enum class Tab(@StringRes val label: Int, @DrawableRes val icon: Int) {
    Light(R.string.tab_light, R.drawable.ic_tab_light),
    Exposure(R.string.tab_exposure, R.drawable.ic_tab_exposure),
    Reciprocity(R.string.tab_reciprocity, R.drawable.ic_tab_reciprocity),
}

@Composable
fun BlueHourApp() {
    var selected by rememberSaveable { mutableStateOf(Tab.Light) }

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
        when (selected) {
            Tab.Light -> LightScreen(modifier)
            Tab.Reciprocity -> ReciprocityScreen(modifier)
            Tab.Exposure -> ComingSoon(modifier)
        }
    }
}

@Composable
private fun ComingSoon(modifier: Modifier = Modifier) {
    Box(modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
        Text(
            stringResource(R.string.coming_soon),
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}
