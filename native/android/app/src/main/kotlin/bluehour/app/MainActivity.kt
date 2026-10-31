package bluehour.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import bluehour.app.ui.BlueHourApp
import bluehour.app.ui.theme.BlueHourTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // 全面屏：状态栏和导航栏透明，内容由 Scaffold 处理边距
        enableEdgeToEdge()
        setContent {
            BlueHourTheme {
                BlueHourApp()
            }
        }
    }
}
