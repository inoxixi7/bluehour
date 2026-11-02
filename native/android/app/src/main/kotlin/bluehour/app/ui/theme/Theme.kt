package bluehour.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

/** 图标上的暮光色带，从夜空到黄金时刻（与 assets/images/logo.svg 一致） */
object Twilight {
    val Night = Color(0xFF1A1A2E)
    val Dusk = Color(0xFF263A6E)
    val Blue = Color(0xFF3D5A98)
    val BlueLight = Color(0xFFAFC6FF)
    val Gold = Color(0xFFFFB77C)
    val Amber = Color(0xFFE8955A)
    val Ember = Color(0xFFB4651E)
}

private val LightColors = lightColorScheme(
    primary = Twilight.Blue,
    onPrimary = Color.White,
    primaryContainer = Color(0xFFDCE4FF),
    onPrimaryContainer = Twilight.Dusk,
    secondary = Twilight.Ember,
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFFFE2CC),
    onSecondaryContainer = Color(0xFF5A2E06),
    tertiary = Color(0xFF9A4F1A),
    background = Color(0xFFF7F7FC),
    onBackground = Twilight.Night,
    surface = Color(0xFFF7F7FC),
    onSurface = Twilight.Night,
    surfaceVariant = Color(0xFFE3E5F2),
    onSurfaceVariant = Color(0xFF4A4D63),
    surfaceContainerLowest = Color.White,
    surfaceContainerLow = Color(0xFFF1F2F9),
    surfaceContainer = Color(0xFFEBEDF6),
    surfaceContainerHigh = Color(0xFFE5E7F2),
    surfaceContainerHighest = Color(0xFFDFE2EF),
    outline = Color(0xFF777A93),
    outlineVariant = Color(0xFFC8CBDC),
)

private val DarkColors = darkColorScheme(
    primary = Twilight.BlueLight,
    onPrimary = Color(0xFF0E2A63),
    primaryContainer = Twilight.Dusk,
    onPrimaryContainer = Color(0xFFDCE4FF),
    secondary = Twilight.Gold,
    onSecondary = Color(0xFF4A2504),
    secondaryContainer = Color(0xFF6A3A12),
    onSecondaryContainer = Color(0xFFFFE2CC),
    tertiary = Twilight.Amber,
    background = Twilight.Night,
    onBackground = Color(0xFFE4E5F2),
    surface = Twilight.Night,
    onSurface = Color(0xFFE4E5F2),
    surfaceVariant = Color(0xFF2C2F4A),
    onSurfaceVariant = Color(0xFFB9BCD3),
    surfaceContainerLowest = Color(0xFF141424),
    surfaceContainerLow = Color(0xFF1F2036),
    surfaceContainer = Color(0xFF23253D),
    surfaceContainerHigh = Color(0xFF2A2C46),
    surfaceContainerHighest = Color(0xFF32354F),
    outline = Color(0xFF8A8DA6),
    outlineVariant = Color(0xFF3A3D58),
)

/** 固定使用图标的品牌色（不用 Material You 动态取色，否则会被壁纸颜色覆盖） */
@Composable
fun BlueHourTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit,
) {
    MaterialTheme(colorScheme = if (darkTheme) DarkColors else LightColors, content = content)
}
