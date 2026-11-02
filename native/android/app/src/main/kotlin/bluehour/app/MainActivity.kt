package bluehour.app

import android.graphics.Color
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.SystemBarStyle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import bluehour.app.ui.BlueHourApp
import bluehour.app.ui.theme.BlueHourTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val settings = AppSettings(this)
        setContent {
            var themeMode by remember { mutableStateOf(settings.themeMode) }
            val dark = when (themeMode) {
                ThemeMode.System -> isSystemInDarkTheme()
                ThemeMode.Light -> false
                ThemeMode.Dark -> true
            }
            // 全面屏：状态栏和导航栏透明，内容由 Scaffold 处理边距；图标颜色跟随应用主题而不是系统主题
            DisposableEffect(dark) {
                val style = SystemBarStyle.auto(Color.TRANSPARENT, Color.TRANSPARENT) { dark }
                enableEdgeToEdge(statusBarStyle = style, navigationBarStyle = style)
                onDispose {}
            }
            BlueHourTheme(darkTheme = dark) {
                BlueHourApp(themeMode = themeMode, onThemeChange = {
                    themeMode = it
                    settings.themeMode = it
                })
            }
        }
    }
}
