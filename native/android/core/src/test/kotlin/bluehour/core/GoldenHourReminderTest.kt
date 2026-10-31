package bluehour.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZonedDateTime

class GoldenHourReminderTest {
    private val tokyo = ZoneId.of("Asia/Tokyo")
    private val lat = 35.6762
    private val lng = 139.6503
    private val lead = 30 * 60_000L

    private fun hours(date: LocalDate): SunPosition.GoldenAndBlueHours {
        val sun = SunPosition.sunTimes(lat, lng, date)
        return SunPosition.goldenAndBlueHours(sun.sunrise, sun.sunset, lat, lng)
    }

    private fun next(at: ZonedDateTime) =
        LightPhases.nextGoldenHourReminder(lat, lng, at.toInstant().toEpochMilli(), tokyo, lead)

    @Test
    fun picksMorningThenEveningThenTomorrow() {
        val date = LocalDate.of(2026, 3, 20)
        val today = hours(date)

        val night = next(date.atTime(1, 0).atZone(tokyo))
        assertEquals(GoldenHourReminder(true, today.morningGoldenHourStart), night)

        val noon = next(date.atTime(12, 0).atZone(tokyo))
        assertEquals(GoldenHourReminder(false, today.eveningGoldenHourStart), noon)

        val lateEvening = next(date.atTime(23, 0).atZone(tokyo))
        assertEquals(GoldenHourReminder(true, hours(date.plusDays(1)).morningGoldenHourStart), lateEvening)
    }

    @Test
    fun skipsWhenTooLateToRemind() {
        val date = LocalDate.of(2026, 3, 20)
        val evening = hours(date).eveningGoldenHourStart
        // 离傍晚黄金时刻不到 30 分钟：改为提醒明天早晨
        val result = LightPhases.nextGoldenHourReminder(lat, lng, evening - lead + 1, tokyo, lead)
        assertNotNull(result)
        assertEquals(hours(date.plusDays(1)).morningGoldenHourStart, result!!.goldenHourStart)
    }
}
