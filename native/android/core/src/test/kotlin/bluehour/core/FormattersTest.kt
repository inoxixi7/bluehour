package bluehour.core

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class FormattersTest {
    @Test
    fun formatCountdown() {
        assertEquals("0:00", formatCountdown(0))
        assertEquals("0:38", formatCountdown(38))
        assertEquals("59:59", formatCountdown(3599))
        assertEquals("1:00:05", formatCountdown(3605))
    }
}
