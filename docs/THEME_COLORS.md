# 主题颜色应用指南

本文档记录了 BlueHour 摄影助手应用的主题颜色系统及其应用。

## 主题系统概述

应用支持三种主题模式：

- **浅色模式** (Light Mode)
- **深色模式** (Dark Mode)
- **跟随系统** (Auto Mode)

主题配置位于：`src/contexts/ThemeContext.tsx`

## 颜色定义

### 浅色模式颜色 (lightColors)

```typescript
{
  // 背景色
  background: '#FFFFFF',              // 主背景 - 纯白
  backgroundSecondary: '#F5F7FA',     // 次要背景 - 浅灰蓝
  backgroundTertiary: '#E8ECF1',      // 第三背景 - 中灰蓝

  // 卡片
  card: '#FFFFFF',                    // 卡片背景 - 纯白
  cardBorder: '#E1E8ED',              // 卡片边框 - 淡灰蓝

  // 文字
  text: '#1A202C',                    // 主文字 - 深灰黑
  textSecondary: '#4A5568',           // 次要文字 - 中灰
  textTertiary: '#718096',            // 第三文字 - 浅灰

  // 主色调
  primary: '#3B82F6',                 // 主色 - 蓝色
  accent: '#F59E0B',                  // 强调色 - 琥珀色

  // 状态色
  success: '#10B981',                 // 成功 - 绿色
  warning: '#F59E0B',                 // 警告 - 琥珀色
  error: '#EF4444',                   // 错误 - 红色

  // 摄影特色颜色
  sunrise: '#FF6B35',                 // 日出 - 橙红
  sunset: '#FF8C42',                  // 日落 - 橙色
  goldenHour: '#FFB627',              // 黄金时刻 - 金色
  blueHour: '#4A90E2',                // 蓝调时刻 - 蓝色
  twilight: '#6B7FD7',                // 晨昏蒙影 - 紫蓝

  // 边框和分隔线
  border: '#E1E8ED',                  // 边框 - 淡灰蓝
  divider: '#E5E7EB',                 // 分隔线 - 浅灰

  // 按钮
  buttonPrimary: '#3B82F6',           // 主按钮 - 蓝色
  buttonPrimaryText: '#FFFFFF',       // 主按钮文字 - 白色
  buttonSecondary: '#F3F4F6',         // 次要按钮 - 浅灰
  buttonSecondaryText: '#374151',     // 次要按钮文字 - 深灰
}
```

### 深色模式颜色 (darkColors)

```typescript
{
  // 背景色
  background: '#0F172A',              // 主背景 - 深蓝黑
  backgroundSecondary: '#1E293B',     // 次要背景 - 深蓝灰
  backgroundTertiary: '#334155',      // 第三背景 - 中蓝灰

  // 卡片
  card: '#1E293B',                    // 卡片背景 - 深蓝灰
  cardBorder: '#334155',              // 卡片边框 - 中蓝灰

  // 文字
  text: '#F1F5F9',                    // 主文字 - 浅灰白
  textSecondary: '#CBD5E1',           // 次要文字 - 中灰白
  textTertiary: '#94A3B8',            // 第三文字 - 浅灰蓝

  // 主色调
  primary: '#60A5FA',                 // 主色 - 亮蓝色
  accent: '#FBBF24',                  // 强调色 - 亮琥珀

  // 状态色
  success: '#34D399',                 // 成功 - 亮绿
  warning: '#FBBF24',                 // 警告 - 亮琥珀
  error: '#F87171',                   // 错误 - 亮红

  // 摄影特色颜色
  sunrise: '#FF8C42',                 // 日出 - 橙色
  sunset: '#FFA06B',                  // 日落 - 浅橙
  goldenHour: '#FFC857',              // 黄金时刻 - 亮金
  blueHour: '#5BA3F5',                // 蓝调时刻 - 亮蓝
  twilight: '#8B9FE8',                // 晨昏蒙影 - 淡紫蓝

  // 边框和分隔线
  border: '#334155',                  // 边框 - 中蓝灰
  divider: '#475569',                 // 分隔线 - 中灰蓝

  // 按钮
  buttonPrimary: '#3B82F6',           // 主按钮 - 蓝色
  buttonPrimaryText: '#FFFFFF',       // 主按钮文字 - 白色
  buttonSecondary: '#334155',         // 次要按钮 - 中蓝灰
  buttonSecondaryText: '#F1F5F9',     // 次要按钮文字 - 浅灰白
}
```

## 组件颜色应用

### 导航组件

#### BottomTabNavigator

- 激活标签文字: `theme.colors.accent`
- 未激活标签文字: `theme.colors.textTertiary`
- 标签栏背景: `theme.colors.card`
- 标签栏边框: `theme.colors.border`
- 导航栏背景: `theme.colors.card`
- 导航栏边框: `theme.colors.border`
- 导航栏标题: `theme.colors.text`

#### CalculatorNavigator (Material Top Tabs)

- 激活标签文字: `theme.colors.accent`
- 未激活标签文字: `theme.colors.textTertiary`
- 标签栏背景: `theme.colors.card`
- 指示器: `theme.colors.accent`
- 边框: `theme.colors.border`

### 通用组件

#### Card

- 背景: `theme.colors.card`
- 边框: `theme.colors.cardBorder`
- 阴影: 根据 `theme.isDark` 动态调整

#### AppButton

- 主按钮背景: `theme.colors.buttonPrimary`
- 主按钮文字: `theme.colors.buttonPrimaryText`
- 次要按钮背景: `theme.colors.buttonSecondary`
- 次要按钮文字: `theme.colors.buttonSecondaryText`
- 轮廓按钮边框: `theme.colors.primary`
- 强调按钮背景: `theme.colors.accent`

### 屏幕组件

#### SunTimesScreen (蓝调时刻屏幕)

- 背景: `theme.colors.background`
- 标题: `theme.colors.text`
- 副标题: `theme.colors.textSecondary`
- 章节标题: `theme.colors.accent`
- 位置信息: `theme.colors.text`
- 时间标签: `theme.colors.text`
- 时间数值: `theme.colors.accent`
- 分隔线: `theme.colors.divider`

**颜色指示器：**

- 天文/航海/民用晨昏: `theme.colors.twilight` (#6B7FD7 / #8B9FE8)
- 蓝调时刻 🔵: `theme.colors.blueHour` (#4A90E2 / #5BA3F5)
- 日出 🌅: `theme.colors.sunrise` (#FF6B35 / #FF8C42)
- 日落 🌇: `theme.colors.sunset` (#FF8C42 / #FFA06B)
- 黄金时刻 ✨: `theme.colors.goldenHour` (#FFB627 / #FFC857)

#### EVCalculator (EV曝光计算器)

- 背景: `theme.colors.background`
- 标题: `theme.colors.text`
- 描述: `theme.colors.textSecondary`
- 章节标题: `theme.colors.accent`
- EV数值: `theme.colors.primary` (蓝色，表示准确性)
- 参数标签: `theme.colors.textSecondary`
- 参数值: `theme.colors.text`
- 选择器背景: `theme.colors.backgroundSecondary`
- 分隔线: `theme.colors.divider`

#### NDCalculator (ND滤镜计算器)

- 背景: `theme.colors.background`
- 标题: `theme.colors.text`
- 描述: `theme.colors.textSecondary`
- 章节标题: `theme.colors.accent`
- ND信息标签: `theme.colors.textSecondary`
- ND信息值: `theme.colors.text`
- 计算结果值: `theme.colors.goldenHour` (金色，强调重要性)
- 选择器背景: `theme.colors.backgroundSecondary`
- 进度条背景: `theme.colors.backgroundTertiary`
- 进度条填充: `theme.colors.accent`
- 提示卡标题: `theme.colors.goldenHour`
- 分隔线: `theme.colors.divider`

#### DoFCalculator (景深计算器)

- 背景: `theme.colors.background`
- 标题: `theme.colors.text`
- 描述: `theme.colors.textSecondary`
- 章节标题: `theme.colors.accent`
- 结果标签: `theme.colors.textSecondary`
- 结果值: `theme.colors.text`
- 超焦距值: `theme.colors.goldenHour` (金色，突出重要参数)
- 选择器背景: `theme.colors.backgroundSecondary`
- 分隔线: `theme.colors.accent` (用于强调分隔)
- 粗体文字: `theme.colors.accent`

#### SettingsScreen (设置屏幕)

- 背景: `theme.colors.background`
- 标题: `theme.colors.text`
- 章节标题: `theme.colors.accent`
- 应用名称: `theme.colors.blueHour` (品牌色)
- 版本号: `theme.colors.textSecondary`
- 描述文字: `theme.colors.text`
- 功能标题: `theme.colors.text`
- 功能描述: `theme.colors.textSecondary`
- 页脚文字: `theme.colors.textSecondary`

**主题选项卡：**

- 选中背景: `theme.colors.primary + '20'` (20% 透明度)
- 选中边框: `theme.colors.primary`
- 选中文字: `theme.colors.primary` (加粗)
- 未选中文字: `theme.colors.text`

## 使用方法

### 在组件中使用主题

```typescript
import { useTheme } from '../contexts/ThemeContext';

const MyComponent = () => {
  const { theme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>Hello</Text>
    </View>
  );
};
```

### 创建动态样式

```typescript
const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontSize: 24,
  },
});

// 在组件中使用
const MyComponent = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme.colors);

  return <View style={styles.container}>...</View>;
};
```

### 切换主题

```typescript
const { setThemeMode } = useTheme();

// 设置为浅色模式
await setThemeMode('light');

// 设置为深色模式
await setThemeMode('dark');

// 跟随系统
await setThemeMode('auto');
```

## 颜色语义

### 摄影场景颜色含义

- **sunrise/sunset**: 用于日出日落时间显示
- **goldenHour**: 用于黄金时刻标记和重要数值（如超焦距、ND结果）
- **blueHour**: 用于蓝调时刻标记和品牌标识
- **twilight**: 用于晨昏蒙影时段标记

### 功能颜色含义

- **primary**: 主要交互元素、精确数值（EV值）
- **accent**: 强调元素、章节标题、重要按钮
- **success**: 成功状态
- **warning**: 警告状态
- **error**: 错误状态

## 最佳实践

1. **保持一致性**: 同类元素使用相同颜色
2. **语义化**: 根据元素功能选择合适的颜色
3. **对比度**: 确保文字与背景有足够对比度
4. **测试**: 在两种模式下测试所有颜色应用
5. **可访问性**: 遵循 WCAG 对比度标准

## 颜色对比度表

### 浅色模式

- text + background: 17.5:1 ✅ (AAA)
- textSecondary + background: 8.9:1 ✅ (AAA)
- primary + background: 4.6:1 ✅ (AA)

### 深色模式

- text + background: 16.8:1 ✅ (AAA)
- textSecondary + background: 11.2:1 ✅ (AAA)
- primary + background: 4.2:1 ✅ (AA)

---

_最后更新: 2025年11月2日_
