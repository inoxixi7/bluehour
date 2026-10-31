package bluehour.app.ui.light

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.location.Location
import android.location.LocationManager
import android.os.CancellationSignal
import androidx.core.content.ContextCompat
import androidx.core.location.LocationManagerCompat
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlin.coroutines.resume

/** 半小时内的缓存位置足够计算日出日落 */
private const val MAX_CACHED_AGE_MS = 30 * 60 * 1000L

fun hasLocationPermission(context: Context): Boolean =
    ContextCompat.checkSelfPermission(context, Manifest.permission.ACCESS_COARSE_LOCATION) ==
        PackageManager.PERMISSION_GRANTED

/**
 * 获取当前位置（只需城市级精度）；定位服务关闭或超时返回 null
 */
@SuppressLint("MissingPermission") // 调用前已用 hasLocationPermission 检查
suspend fun currentLocation(context: Context): Location? {
    val manager = context.getSystemService(LocationManager::class.java) ?: return null
    val enabled = manager.getProviders(true)
    // "fused" 即 LocationManager.FUSED_PROVIDER（API 31+）
    val provider = listOf("fused", LocationManager.NETWORK_PROVIDER, LocationManager.GPS_PROVIDER)
        .firstOrNull { it in enabled } ?: return null

    manager.getLastKnownLocation(provider)
        ?.takeIf { System.currentTimeMillis() - it.time < MAX_CACHED_AGE_MS }
        ?.let { return it }

    return suspendCancellableCoroutine { cont ->
        val signal = CancellationSignal()
        cont.invokeOnCancellation { signal.cancel() }
        LocationManagerCompat.getCurrentLocation(
            manager,
            provider,
            signal,
            ContextCompat.getMainExecutor(context),
        ) { cont.resume(it) }
    }
}
