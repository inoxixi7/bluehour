# 计算器专用组件 📷

这个文件夹包含专门为摄影计算器功能设计的可复用组件。

## 组件列表

### 1. ExposureValueInput
**曝光三要素联动输入组件**

用于同时调整光圈、快门和 ISO 的场景，特别适合 EV 计算器。

**特性**:
- 三个参数的选择器（光圈、快门、ISO）
- 支持单独锁定任意参数
- 显示当前值和格式化标签
- 视觉提示锁定状态

**使用示例**:
```typescript
import { ExposureValueInput } from '@/components/calculators';

<ExposureValueInput
  aperture={5.6}
  shutter={1/125}
  iso={100}
  onApertureChange={setAperture}
  onShutterChange={setShutter}
  onISOChange={setISO}
  lockISO={true}  // 锁定 ISO
  showLabels={true}
/>
```

---

### 2. ValuePicker
**优化的数值选择器组件**

使用模态框和列表视图提供更好的用户体验，支持泛型。

**特性**:
- 模态框底部弹出动画
- 大型可滚动列表
- 当前选中项高亮
- 支持自定义格式化
- 支持禁用状态

**使用示例**:
```typescript
import { ValuePicker } from '@/components/calculators';

const apertureOptions = APERTURE_VALUES.map(val => ({
  label: `f/${val}`,
  value: val,
}));

<ValuePicker
  label="光圈"
  value={aperture}
  options={apertureOptions}
  onValueChange={setAperture}
  formatValue={(val) => `f/${val}`}
/>
```

---

### 3. EVDisplay
**EV 值显示组件**

显示当前曝光设置的 EV 值，带有环境判断和可选的详细信息。

**特性**:
- 自动计算 EV 值
- 根据 EV 值判断拍摄环境（极暗到极亮）
- 颜色编码（不同 EV 值不同颜色）
- 可选显示详细参数网格
- 美观的卡片样式

**使用示例**:
```typescript
import { EVDisplay } from '@/components/calculators';

<EVDisplay
  aperture={5.6}
  shutter={1/125}
  iso={100}
  showDetails={true}  // 显示详细信息
/>
```

**EV 值环境对照**:
- EV < -2: 极暗环境（星空、月光）
- EV -2 ~ 3: 低光环境（室内、夜晚）
- EV 3 ~ 7: 室内光线
- EV 7 ~ 11: 阴天户外
- EV 11 ~ 14: 晴天阴影
- EV 14 ~ 16: 晴天直射
- EV > 16: 极亮环境（雪地、沙滩）

---

## 设计原则

### 1. 可复用性
所有组件都设计为高度可复用，可在不同的计算器页面中使用。

### 2. 类型安全
使用 TypeScript 泛型和接口，确保类型安全。

### 3. 一致的样式
遵循全局的颜色和布局常量，保持视觉一致性。

### 4. 用户友好
- 清晰的视觉反馈
- 直观的交互方式
- 适当的状态提示

---

## 使用场景

### ExposureValueInput
适用于需要同时调整多个曝光参数的场景：
- ✅ EV 等效曝光计算器
- ✅ 手动曝光设置界面
- ✅ 曝光包围拍摄设置

### ValuePicker
适用于需要从大量选项中选择的场景：
- ✅ 焦距选择（14mm - 600mm）
- ✅ ND 滤镜选择
- ✅ 传感器类型选择
- ✅ 任何需要下拉选择的场景

### EVDisplay
适用于需要显示当前曝光状态的场景：
- ✅ 实时 EV 监控
- ✅ 曝光设置预览
- ✅ 仪表盘显示
- ✅ 拍摄参数记录

---

## 扩展建议

未来可以考虑添加的组件：

1. **ShutterTimer** - 长曝光计时器组件
   - 倒计时显示
   - 进度条
   - 声音/振动提醒

2. **DoFVisualizer** - 景深可视化组件
   - 图形化显示清晰范围
   - 对焦点位置标记
   - 超焦距指示

3. **HistogramDisplay** - 直方图显示组件
   - 模拟曝光直方图
   - 高光/阴影警告

4. **LensCalculator** - 镜头计算组件
   - 视角计算
   - 等效焦距换算
   - 放大倍率

---

## 维护说明

- 保持组件独立性，避免相互依赖
- 遵循单一职责原则
- 及时更新文档
- 添加新组件时更新 `index.ts` 导出

---

**最后更新**: 2025-01-02
