package bluehour.app.ui.common

import androidx.annotation.ArrayRes
import androidx.annotation.StringRes
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringArrayResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import bluehour.app.R

/** 页面标题，右侧是打开帮助说明的按钮 */
@Composable
fun TitleWithHelp(
    title: String,
    @StringRes helpTitle: Int,
    @StringRes helpDescription: Int,
    @ArrayRes helpSections: List<Int>,
) {
    var showHelp by remember { mutableStateOf(false) }
    ScreenTitle(title) {
        IconButton(onClick = { showHelp = true }) {
            Icon(painterResource(R.drawable.ic_info), contentDescription = stringResource(helpTitle))
        }
    }
    if (showHelp) {
        HelpDialog(helpTitle, helpDescription, helpSections, onDismiss = { showHelp = false })
    }
}

/** 帮助说明：一段说明 + 若干带标题的要点（每个数组第一项为标题） */
@Composable
private fun HelpDialog(
    @StringRes title: Int,
    @StringRes description: Int,
    @ArrayRes sections: List<Int>,
    onDismiss: () -> Unit,
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(stringResource(title)) },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Text(stringResource(description), style = MaterialTheme.typography.bodyMedium)
                sections.forEach { res ->
                    val lines = stringArrayResource(res)
                    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text(
                            lines.first(),
                            style = MaterialTheme.typography.titleSmall,
                            color = MaterialTheme.colorScheme.primary,
                        )
                        lines.drop(1).forEach {
                            Text(
                                "• $it",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) { Text(stringResource(R.string.ok)) }
        },
    )
}
