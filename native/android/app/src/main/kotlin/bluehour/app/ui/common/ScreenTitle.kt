package bluehour.app.ui.common

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.clipPath
import androidx.compose.ui.unit.dp
import bluehour.app.ui.theme.Twilight

// 图标的色带（logo.svg 的 100 单位坐标，圆心 50、半径 32）
private val BANDS = listOf(
    Triple(18f, 31f, Twilight.Dusk),
    Triple(33f, 43f, Twilight.Blue),
    Triple(45f, 53f, Twilight.BlueLight),
    Triple(55f, 61f, Twilight.Gold),
    Triple(63f, 67f, Twilight.Amber),
    Triple(69f, 71.5f, Twilight.Ember),
    Triple(73.5f, 75f, Twilight.Ember),
)

/** 小号图标：被圆裁切的暮光色带 */
@Composable
fun TwilightMark(modifier: Modifier = Modifier) {
    Canvas(modifier.size(28.dp)) {
        val unit = size.height / 64f
        val disc = Path().apply { addOval(Rect(Offset.Zero, size)) }
        clipPath(disc) {
            BANDS.forEach { (y1, y2, color) ->
                drawRect(color, Offset(0f, (y1 - 18f) * unit), Size(size.width, (y2 - y1) * unit))
            }
        }
    }
}

/** 页面标题：左侧图标，右侧可放操作按钮 */
@Composable
fun ScreenTitle(title: String, modifier: Modifier = Modifier, trailing: @Composable RowScope.() -> Unit = {}) {
    Row(
        modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        TwilightMark()
        Text(title, style = MaterialTheme.typography.headlineMedium, modifier = Modifier.weight(1f))
        trailing()
    }
}
