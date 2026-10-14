package bluehour.core

/**
 * 曝光计算器的参数锁定逻辑（对应 src/utils/exposureLocks.ts）
 *
 * 光圈 / 快门 / ISO 可以分别锁定。用户改动一个参数时，
 * 由未锁定的参数自动补偿，以保持 EV 不变（或达到锁定的目标 EV）。
 */
object ExposureLocks {
    private val ALL = ExposureParam.entries

    /**
     * 用户把 param 改成 value 后，计算三个参数的新值
     *
     * - 其他两个参数都锁定：只改这个参数，EV 随之变化
     * - 目标 EV 已锁定：由未锁定的参数（优先快门）补偿到目标 EV；无法达到时保持原值
     * - 否则：由未锁定的参数（优先快门）补偿，保持当前 EV
     */
    fun applyParamChange(
        values: ExposureValues,
        param: ExposureParam,
        value: Double,
        locked: Set<ExposureParam>,
        targetEV: Double?,
        data: PhotographyData = PhotographyData.default,
    ): ExposureValues {
        val others = ALL.filter { it != param }
        val lockedOthers = others.filter { it in locked }
        val unlockedOthers = others.filter { it !in locked }

        // 优先用快门补偿；被锁定的参数（若有）保持不变
        val adjustParam =
            if (ExposureParam.Shutter in unlockedOthers) ExposureParam.Shutter else unlockedOthers.firstOrNull()
        val keepParam = lockedOthers.firstOrNull() ?: unlockedOthers.firstOrNull { it != adjustParam }

        if (unlockedOthers.isEmpty() || keepParam == null) {
            return values.with(param, value)
        }

        if (targetEV != null) {
            return calculateEquivalentExposureWithEV(targetEV, param, value, keepParam, values, data)?.values
                ?: values
        }
        return calculateEquivalentExposure(values, param, value, keepParam, data).values
    }

    /**
     * 选择场景（目标 EV）后，计算达到该 EV 的参数；无法达到时保持原值
     * - 锁定两个参数：计算第三个
     * - 锁定一个参数：保持光圈（或另一个未锁定参数），调整剩下的那个
     * - 都没锁定：保持光圈和 ISO，调整快门
     */
    fun applyTargetEV(
        values: ExposureValues,
        targetEV: Double,
        locked: Set<ExposureParam>,
        data: PhotographyData = PhotographyData.default,
    ): ExposureValues {
        val lockedList = ALL.filter { it in locked }
        val (changedParam, lockedParam) = when {
            lockedList.size >= 2 -> lockedList[0] to lockedList[1]
            lockedList.size == 1 -> {
                val free = ALL.filter { it !in locked }
                val changed = if (ExposureParam.Aperture in free) ExposureParam.Aperture else free[0]
                changed to lockedList[0]
            }
            else -> ExposureParam.Aperture to ExposureParam.Iso
        }

        return calculateEquivalentExposureWithEV(
            targetEV, changedParam, values[changedParam], lockedParam, values, data,
        )?.values ?: values
    }

    /** 该参数是否会被自动调整（界面上显示「会自动调整」） */
    fun isAutoAdjusted(param: ExposureParam, locked: Set<ExposureParam>, evLocked: Boolean): Boolean {
        if (param in locked) return false
        val lockedOthers = ALL.filter { it != param && it in locked }
        if (lockedOthers.size == 2) return true
        if (evLocked && lockedOthers.size == 1) {
            // 优先调整快门；快门被锁时才轮到这个参数
            return param == ExposureParam.Shutter || ExposureParam.Shutter in locked
        }
        return false
    }

    /**
     * 切换参数的锁定状态（结果保持插入顺序）
     * - 最多锁定两个参数（锁定第三个时，先解锁最早锁定的非 ISO 参数）
     * - EV 锁定时至少保留一个锁（默认 ISO），否则曝光组合无法确定
     */
    fun toggleParamLock(
        locked: Set<ExposureParam>,
        param: ExposureParam,
        evLocked: Boolean,
    ): LinkedHashSet<ExposureParam> {
        val next = LinkedHashSet(locked)
        if (param in next) {
            next.remove(param)
            if (evLocked && next.isEmpty()) {
                next.add(ExposureParam.Iso)
            }
        } else {
            if (next.size >= 2) {
                next.remove(next.firstOrNull { it != ExposureParam.Iso } ?: next.first())
            }
            next.add(param)
        }
        return next
    }
}
