# ExposureLab 双锁定模式实施指南

## 已完成的更改

### 1. 状态管理更新 ✅

```typescript
// 原来（单锁定）
const [lockedParam, setLockedParam] = useState<'aperture' | 'shutter' | 'iso'>('iso');

// 现在（双锁定）
const [lockedParams, setLockedParams] = useState<Set<'aperture' | 'shutter' | 'iso'>>(
  new Set(['aperture', 'iso']) // 默认锁定光圈和ISO，调整快门
);
```

### 2. handleParamChange 函数已重写 ✅

新逻辑支持：

- ✅ 双锁定模式
- ✅ 自动切换锁定状态
- ✅ EV 锁定模式
- ✅ 智能参数调整

## 仍需完成的更改

### 3. 更新 `renderParamPicker` 函数

**位置**: 第 242-278 行

**需要替换的部分**:

```typescript
const renderParamPicker = (
  label: string,
  param: 'aperture' | 'shutter' | 'iso',
  value: number,
  options: { value: number; label: string }[]
) => {
  const isLocked = lockedParams.has(param);  // 改这里
  const unlockedCount = 3 - lockedParams.size;

  const handleLockToggle = () => {  // 新增这个函数
    const newLockedParams = new Set(lockedParams);

    if (isLocked) {
      // 解锁：至少保持一个参数解锁
      if (lockedParams.size < 3) {
        newLockedParams.delete(param);
      }
    } else {
      // 锁定：最多锁定两个参数
      if (lockedParams.size < 2) {
        newLockedParams.add(param);
      }
    }

    setLockedParams(newLockedParams);
  };

  return (
    <View style={styles.paramBlock}>
      <View style={styles.paramLabelRow}>
        <Text style={[styles.paramLabel, { color: theme.colors.text }]}>{label}</Text>
        {/* 显示参数将被调整的提示 */}
        {!isLocked && unlockedCount === 1 && (
          <Text style={[styles.autoAdjustHint, { color: theme.colors.textSecondary }]}>
            📊 {t('calculator.exposureLab.willAdjust')}
          </Text>
        )}
        <Touchable
          onPress={handleLockToggle}  // 改这里
          style={[styles.lockButton, isLocked && styles.lockButtonActive]}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isLocked ? 'lock-closed' : 'lock-open'}
            size={16}
            color={isLocked ? theme.colors.primary : theme.colors.textSecondary}
          />
        </Touchable>
      </View>
      <HorizontalScrollPicker
        label=""
        options={options}
        selectedValue={value}
        onValueChange={(newValue) => handleParamChange(param, newValue)}
        disabled={false}  // 双锁定模式下不禁用，可以自动切换
        textColor={theme.colors.text}
        accentColor={theme.colors.primary}
        disabledColor={theme.colors.textSecondary}
      />
    </View>
  );
};
```

### 4. 添加新的样式

**位置**: 在 `createStyles` 函数中添加

```typescript
autoAdjustHint: {
  fontSize: 11,
  marginLeft: 8,
  fontStyle: 'italic',
},
```

### 5. 更新多语言文件

**文件**: `src/locales/zh.ts` (以及 en.ts, ja.ts, de.ts)

```typescript
calculator: {
  exposureLab: {
    willAdjust: '会自动调整',
    // ... 其他翻译
  }
}
```

## 使用说明

### 普通模式（等效曝光）

1. **默认状态**：光圈和ISO锁定，调整快门
2. **切换锁定**：
   - 点击任意锁图标可以锁定/解锁该参数
   - 最多2个参数被锁定
   - 至少1个参数解锁

3. **调整参数**：
   - 调整任意参数时，未锁定的参数自动变化
   - 保持曝光等效

### EV 锁定模式（场景预设）

1. **选择场景**：
   - 点击场景卡片（如"阳光16法则"）
   - 自动设置参数并锁定EV值

2. **调整参数**：
   - 可以调整任意参数
   - 其他参数自动调整以保持 EV 不变
   - 允许在相同曝光下尝试不同参数组合

3. **解锁EV**：
   - 点击右上角的锁图标解锁EV
   - 返回普通双锁定模式

## 示例场景

### 场景1：风光摄影

```
初始：f/16, 1/125s, ISO 100 (EV 15)
锁定：光圈 f/16, ISO 100
调整：快门

希望增加快门速度捕捉动态水流：
- 调整快门：1/125s → 1/1000s
- 系统提示：需要增加曝光
- 由于光圈和ISO都锁定，无法保持EV
```

**解决**：解锁ISO，让系统调整

```
锁定：光圈 f/16，快门 1/1000s
结果：ISO 自动调整为 800
```

### 场景2：阳光16法则

```
选择："阳光16法则" 场景
设置：f/16, 1/125s, ISO 100 (EV 15锁定)

想用浅景深：
- 调整光圈：f/16 → f/2.8 (增加5档光量)
- EV 锁定，快门自动调整为 1/4000s
- 保持正确曝光，获得浅景深效果
```

## 优势

### vs 单锁定模式

✅ **更灵活** - 可以锁定任意两个参数组合
✅ **更直观** - 清楚知道哪个参数会被调整
✅ **更专业** - 符合摄影师实际使用习惯

### vs 无锁定模式

✅ **保持曝光等效** - 自动计算等效参数
✅ **避免错误** - 防止曝光不正确
✅ **提高效率** - 不需要手动计算

### EV 锁定的优势

✅ **场景化** - 适用于已知场景EV的情况
✅ **探索性** - 在同一曝光下尝试不同参数组合
✅ **教育性** - 理解等效曝光和参数关系

## 技术细节

### 锁定逻辑

- 使用 `Set<'aperture' | 'shutter' | 'iso'>` 存储锁定状态
- 最多锁定 2 个参数（确保至少有 1 个可调整）
- 调整锁定参数时自动切换锁定状态

### EV 锁定优先级

1. 如果 `evLocked === true`，优先使用 EV 锁定模式
2. 否则使用普通双锁定模式
3. EV 锁定和参数锁定可以共存

### 边界处理

- 如果计算结果超出参数范围（如 ISO < 50 或 > 25600）
- 显示警告但仍更新参数值
- 用户可以看到实际可达到的参数

## 测试建议

1. **基本功能**
   - ✅ 锁定/解锁切换
   - ✅ 参数调整后等效曝光
   - ✅ 边界值处理

2. **EV 锁定**
   - ✅ 场景选择后 EV 锁定
   - ✅ 参数调整保持 EV
   - ✅ 解锁 EV 功能

3. **用户体验**
   - ✅ 锁定状态清晰可见
   - ✅ 自动调整参数有提示
   - ✅ 超出范围有警告

## 下一步

完成以上更改后，ExposureLab 将支持：

- ✅ 专业的双锁定模式
- ✅ 灵活的 EV 锁定
- ✅ 直观的视觉反馈
- ✅ 智能的参数调整

这将使 BlueHour 成为一个真正专业级的摄影工具！📷✨
