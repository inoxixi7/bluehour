package bluehour.core

import kotlin.math.max

/**
 * 一天中的光线阶段（对应 src/utils/lightPhases.ts）
 *
 * 所有时刻都用 UTC 毫秒时间戳（epoch ms）表示。
 */
enum class LightPhaseId {
    MorningBlueHour,
    MorningGoldenHour,
    Daylight,
    EveningGoldenHour,
    EveningBlueHour,
    Night,
    NextMorningBlueHour,
}

data class LightPhaseSegment(val id: LightPhaseId, val start: Long, val end: Long)

data class PhaseState(
    val current: LightPhaseSegment,
    val next: LightPhaseSegment,
    val minutesUntilTransition: Long,
    /** 当前阶段已经过的比例，0..1 */
    val progress: Double,
)

enum class BlueHourWindowId { Morning, Evening, Tomorrow }

data class BlueHourWindow(val id: BlueHourWindowId, val start: Long, val end: Long, val isNextDay: Boolean)

object LightPhases {
    private const val DAY_MS = 24 * 60 * 60 * 1000L

    fun timeline(h: SunPosition.GoldenAndBlueHours): List<LightPhaseSegment> {
        val nextBlueStart = h.morningBlueHourStart + DAY_MS
        return listOf(
            LightPhaseSegment(LightPhaseId.MorningBlueHour, h.morningBlueHourStart, h.morningBlueHourEnd),
            LightPhaseSegment(LightPhaseId.MorningGoldenHour, h.morningGoldenHourStart, h.morningGoldenHourEnd),
            LightPhaseSegment(LightPhaseId.Daylight, h.morningGoldenHourEnd, h.eveningGoldenHourStart),
            LightPhaseSegment(LightPhaseId.EveningGoldenHour, h.eveningGoldenHourStart, h.eveningGoldenHourEnd),
            LightPhaseSegment(LightPhaseId.EveningBlueHour, h.eveningBlueHourStart, h.eveningBlueHourEnd),
            LightPhaseSegment(LightPhaseId.Night, h.eveningBlueHourEnd, nextBlueStart),
            LightPhaseSegment(LightPhaseId.NextMorningBlueHour, nextBlueStart, h.morningBlueHourEnd + DAY_MS),
        )
    }

    /**
     * 当前所处阶段；当天第一个阶段之前算作前一晚的夜晚，其余不在任何阶段内时取最后一个阶段
     */
    fun currentState(timeline: List<LightPhaseSegment>, nowMs: Long): PhaseState? {
        if (timeline.isEmpty()) return null

        // 与 TS 的 forEach 一致：多个阶段重叠时取最后一个
        val currentIndex = timeline.indexOfLast { nowMs >= it.start && nowMs < it.end }
            .takeIf { it >= 0 } ?: timeline.lastIndex
        var current = timeline[currentIndex]
        var next = timeline[(currentIndex + 1) % timeline.size]

        // 当天第一个阶段之前（凌晨）：仍处于前一晚的夜晚，下一个是今天早晨的蓝调时刻
        val night = timeline.firstOrNull { it.id == LightPhaseId.Night }
        if (night != null && nowMs < timeline.first().start) {
            current = night.copy(start = night.start - DAY_MS, end = night.end - DAY_MS)
            next = timeline.first()
        }
        val total = current.end - current.start
        val elapsed = nowMs - current.start

        val progress = if (total <= 0) 0.0 else (elapsed.toDouble() / total).coerceIn(0.0, 1.0)
        val minutes = max(0L, jsRound((current.end - nowMs) / 60_000.0).toLong())
        return PhaseState(current, next, minutes, progress)
    }

    /** 下一个蓝调时刻（今天早晨、今天傍晚或明天早晨） */
    fun nextBlueHour(h: SunPosition.GoldenAndBlueHours, nowMs: Long): BlueHourWindow {
        val windows = listOf(
            BlueHourWindow(BlueHourWindowId.Morning, h.morningBlueHourStart, h.morningBlueHourEnd, false),
            BlueHourWindow(BlueHourWindowId.Evening, h.eveningBlueHourStart, h.eveningBlueHourEnd, false),
            BlueHourWindow(
                BlueHourWindowId.Tomorrow,
                h.morningBlueHourStart + DAY_MS,
                h.morningBlueHourEnd + DAY_MS,
                true,
            ),
        )
        return windows.firstOrNull { it.start > nowMs } ?: windows.last()
    }
}
