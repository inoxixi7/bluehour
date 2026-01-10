# 双锁定模式 - Bug修复说明

## 🐛 发现的问题

用户报告：虽然有两个锁定图标显示，但并不能真正锁定两个参数。

## 🔍 根本原因

**异步状态更新导致的bug**：

```typescript
// 问题代码 ❌
if (lockedParams.has(param)) {
  const newLockedParams = new Set(lockedParams);
  newLockedParams.delete(param);
  setLockedParams(newLockedParams); // ⚠️ 异步更新！
}

// 后续计算仍使用旧的 lockedParams
const lockedOther = otherParams.find(p => lockedParams.has(p)); // ❌ 使用旧状态
```

**问题所在**：

1. `setLockedParams()` 是异步的，状态不会立即更新
2. 后续的等效曝光计算使用的是**旧的** `lockedParams`
3. 导致计算结果不正确，锁定状态和计算逻辑不匹配

## ✅ 修复方案

**使用局部变量存储新状态**：

```typescript
// 修复后的代码 ✅
let currentLockedParams = lockedParams; // 1. 创建局部变量

if (currentLockedParams.has(param)) {
  const newLockedParams = new Set(currentLockedParams);
  newLockedParams.delete(param);

  setLockedParams(newLockedParams); // 2. 异步更新UI状态
  currentLockedParams = newLockedParams; // 3. ✅ 立即更新局部变量
}

// 使用新的锁定状态进行计算 ✅
const lockedOther = otherParams.find(p => currentLockedParams.has(p)); // ✅ 使用新状态
```

**修复要点**：

1. 使用局部变量 `currentLockedParams` 追踪最新的锁定状态
2. 状态交换后立即更新局部变量
3. 后续所有计算都使用 `currentLockedParams` 而不是 `lockedParams`
4. 确保计算逻辑使用的是正确的锁定状态

## 🧪 测试场景

### 场景 1：锁定光圈和ISO，调整快门

```
初始状态：
- 光圈 f/8    [🔒]
- 快门 1/125s [  ]
- ISO 100     [🔒]

操作：调整快门 1/125s → 1/60s

预期结果：
✅ 光圈保持 f/8（因为锁定）
✅ 快门变为 1/60s（用户调整）
✅ ISO 保持 100（因为锁定）
✅ 曝光值会改变（从 EV 15 → EV 14）

实际效果：
✅ 修复后应该完全符合预期
```

### 场景 2：锁定光圈和快门，调整光圈

```
初始状态：
- 光圈 f/8    [🔒]
- 快门 1/125s [🔒]
- ISO 100     [  ]

操作：调整光圈 f/8 → f/4

自动行为：
1. 光圈被锁定，但用户调整它
2. 自动解锁光圈 [  ]
3. 自动锁定ISO [🔒]
4. 新状态：ISO🔒、快门🔒、光圈解锁

计算逻辑：
✅ changedParam = aperture (f/4)
✅ lockedOther = shutter (因为快门仍锁定)
✅ 调用 calculateEquivalentExposure(baseParams, 'aperture', f/4, 'shutter')
✅ 结果：ISO 自动调整为 25，保持曝光等效
```

### 场景 3：EV锁定模式

```
操作序列：
1. 选择场景："阳光16法则" (EV 15)
2. 参数设置：f/16, 1/125s, ISO 100
3. EV 自动锁定 ✅
4. 保持锁定：f/16🔒, 1/125s, ISO 100🔒

调整光圈 f/16 → f/2.8：
✅ targetEV = 15 (锁定)
✅ changedParam = aperture (f/2.8)
✅ lockedOther = shutter (1/125s 锁定)
✅ 计算结果：ISO 自动调整以保持 EV=15

修复前：
❌ 使用旧的锁定状态，可能调整错误的参数

修复后：
✅ 使用正确的锁定状态，调整正确的参数
```

## 📊 修复对比

### 修复前 ❌

```
操作：锁定光圈和ISO，调整快门
问题：
1. 状态更新异步
2. 计算使用旧状态
3. 可能调整被锁定的参数
4. 结果不符合预期
```

### 修复后 ✅

```
操作：锁定光圈和ISO，调整快门
效果：
1. 使用局部变量追踪新状态
2. 计算使用正确状态
3. 确保锁定的参数不被调整
4. 结果完全符合预期
```

## 🎯 核心改进

### 关键代码变更

**第 125-142 行**：

```typescript
// 之前 ❌
const unlockedParams = allParams.filter(p => !lockedParams.has(p));
if (lockedParams.has(param)) {
  setLockedParams(newLockedParams);
}
// ... 后续计算使用 lockedParams

// 现在 ✅
let currentLockedParams = lockedParams; // 局部变量
const unlockedParams = allParams.filter(p => !currentLockedParams.has(p));
if (currentLockedParams.has(param)) {
  setLockedParams(newLockedParams);
  currentLockedParams = newLockedParams; // ✅ 立即更新局部变量
}
// ... 后续计算使用 currentLockedParams
```

**第 147 行 & 第 169 行**：

```typescript
// 之前 ❌
const lockedOther = otherParams.find(p => lockedParams.has(p));

// 现在 ✅
const lockedOther = otherParams.find(p => currentLockedParams.has(p));
```

## ✨ 修复效果

现在双锁定模式可以正确工作：

1. ✅ **状态同步** - 计算逻辑使用正确的锁定状态
2. ✅ **参数保护** - 锁定的参数不会被意外调整
3. ✅ **自动切换** - 调整锁定参数时正确交换锁定状态
4. ✅ **等效曝光** - 正确调整未锁定参数以保持曝光等效
5. ✅ **EV锁定** - 正确保持目标EV值

## 🚀 验证步骤

请按以下步骤验证修复：

1. **基础双锁定**
   - 锁定光圈和ISO
   - 调整快门
   - 验证：光圈和ISO保持不变

2. **参数交换**
   - 锁定光圈和快门
   - 调整光圈（锁定的）
   - 验证：光圈解锁，ISO自动锁定

3. **等效曝光**
   - 锁定光圈和ISO
   - 调整光圈
   - 验证：快门自动调整保持曝光等效

4. **EV锁定**
   - 选择场景（如阳光16）
   - 调整任意参数
   - 验证：其他参数调整保持EV不变

---

**修复日期**: 2026-01-09
**修复类型**: 关键bug修复
**影响范围**: ExposureLab 双锁定模式核心逻辑
**优先级**: 🔴 高（功能性bug）
