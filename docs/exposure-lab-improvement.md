# ExposureLab 参数锁定逻辑改进方案

## 问题描述

当前的参数锁定逻辑存在以下问题：

1. **单一锁定模式不够灵活**
   - 只允许锁定一个参数
   - 改变一个参数时，只能调整第三个参数
   - 如果第三个参数达到边界值，无法保持曝光等效

2. **用户认知不清晰**
   - 用户不知道改变某个参数时，哪个参数会被调整
   - 没有明确的视觉反馈

3. **缺少智能调整**
   - 不能自动选择最佳的调整策略
   - 无法处理边界情况

## 改进方案

### 方案 A：双锁定模式（推荐）⭐

**概念**：

- 用户可以锁定**任意两个参数**
- 改变其中一个锁定的参数时，**只调整未锁定的参数**
- 清晰明确的交互逻辑

**UI 设计**：

```
光圈 f/8    [🔒锁定]
快门 1/125s [🔓解锁] ← 会被自动调整
ISO 100     [🔒锁定]
```

**逻辑**：

- 默认：锁定光圈和ISO（最常见）
- 用户可以切换任意两个参数的锁定状态
- 调整任一参数时，未锁定的参数自动变化

**代码示例**：

```typescript
const [lockedParams, setLockedParams] = useState<Set<'aperture' | 'shutter' | 'iso'>>(
  new Set(['aperture', 'iso'])
);

const handleParamChange = (param, value) => {
  if (lockedParams.has(param)) {
    return; // 锁定的参数不能改变
  }

  // 找到其他两个参数
  const otherParams = ['aperture', 'shutter', 'iso'].filter(p => p !== param);
  const lockedOther = otherParams.find(p => lockedParams.has(p));
  const adjustParam = otherParams.find(p => !lockedParams.has(p));

  // 使用等效曝光计算
  const result = calculateEquivalentExposure({ aperture, shutter, iso }, param, value, lockedOther);

  // 应用结果
  setAperture(result.aperture);
  setShutter(result.shutter);
  setISO(result.iso);
};
```

**优点**：
✅ 逻辑清晰，用户容易理解
✅ 符合摄影师的思维习惯
✅ 可以处理各种场景

**缺点**：
⚠️ 需要确保至少有一个参数是解锁的
⚠️ UI 需要重新设计

---

### 方案 B：智能优先级模式

**概念**：

- 只锁定一个参数（当前）
- 但系统会智能选择调整哪个参数
- 优先级：ISO > 快门 > 光圈

**逻辑**：

1. 如果可以通过调整 ISO 达到目标，优先调整 ISO
2. 如果 ISO 达到边界，则调整快门
3. 如果快门也达到边界，则提示用户

**代码示例**：

```typescript
const handleParamChangeSmart = (param, value) => {
  const priority = ['iso', 'shutter', 'aperture'].filter(p => p !== param && p !== lockedParam);

  for (const adjustParam of priority) {
    const result = calculateEquivalentExposure(
      { aperture, shutter, iso },
      param,
      value,
      adjustParam
    );

    // 检查是否在有效范围内
    if (isValidRange(result)) {
      applyResult(result);
      return;
    }
  }

  // 无法达到等效曝光
  showWarning();
};
```

**优点**：
✅ 用户不需要过多思考
✅ 大多数情况下都能工作

**缺点**：
⚠️ 不够灵活
⚠️ 用户可能不理解为什么某个参数被调整

---

### 方案 C：视觉反馈增强（快速改进）

**概念**：

- 保持当前的单锁定逻辑
- 但增加清晰的视觉反馈

**改进点**：

1. 显示哪个参数会被调整
2. 实时显示调整后的值（预览）
3. 如果超出范围，显示警告

**UI 设计**：

```
光圈 f/8    [🔓]
快门 1/125s [🔒] 锁定
ISO 100     [🔓] ← 📊会自动调整

提示：改变光圈或 ISO 时，系统将自动调整快门速度
```

**优点**：
✅ 改动最小
✅ 提升用户体验
✅ 快速实现

---

## 推荐实施

### 短期（立即）：

✅ **方案 C** - 增加视觉反馈

- 在每个参数旁边显示 "会自动调整" 的提示
- 超出范围时显示警告

### 中期（2周）：

✅ **方案 A** - 实现双锁定模式

- 重新设计 UI
- 实现新的逻辑
- 添加使用教程

### 长期：

✅ 添加"场景预设"
✅ 添加"智能建议"（根据拍摄场景推荐参数）

---

## 用户教育

无论选择哪个方案，都需要：

1. 在帮助文档中解释锁定逻辑
2. 首次使用时显示引导
3. 提供典型使用场景示例

---

## 竞品分析

### Camera+ (iOS)

- 使用**双锁定**模式
- 最多可以锁定两个参数

### Manual Camera (Android)

- 使用**视觉反馈**
- 清楚显示哪个参数会被调整

### Halide

- 使用**智能优先级**
- 优先调整 ISO，其次是快门
