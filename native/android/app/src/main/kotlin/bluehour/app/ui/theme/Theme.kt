package bluehour.app.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

// 品牌色：蓝调时刻的深蓝与黄金时刻的暖橙
private val BlueHour = Color(0xFF3D5A98)
private val BlueHourLight = Color(0xFFAFC6FF)
private val GoldenHour = Color(0xFFB4651E)
private val GoldenHourLight = Color(0xFFFFB77C)

private val LightColors = lightColorScheme(
    primary = BlueHour,
    secondary = GoldenHour,
)

private val DarkColors = darkColorScheme(
    primary = BlueHourLight,
    secondary = GoldenHourLight,
    background = Color(0xFF12131A),
    surface = Color(0xFF12131A),
)

/**
 * Android 12+ 使用系统动态取色（Material You），更早的系统使用品牌色
 */
@Composable
fun BlueHourTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = true,
    content: @Composable () -> Unit,
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColors
        else -> LightColors
    }

    MaterialTheme(colorScheme = colorScheme, content = content)
}
