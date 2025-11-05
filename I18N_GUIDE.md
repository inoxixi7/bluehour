# 多语言国际化系统 (i18n)

## 概述

本应用支持以下语言:
- 🇨🇳 中文 (zh)
- 🇺🇸 English (en) 
- 🇯🇵 日本語 (ja)
- 🇩🇪 Deutsch (de)

系统会自动根据设备语言选择对应的界面语言,如果设备语言不在支持列表中,默认使用英语。

## 架构设计

### 文件结构
```
src/
├── locales/
│   ├── i18n.ts           # i18n 配置和初始化
│   ├── zh.ts             # 中文翻译
│   ├── en.ts             # 英文翻译
│   ├── ja.ts             # 日文翻译
│   └── de.ts             # 德文翻译
└── utils/
    └── i18nHelpers.ts    # i18n 辅助函数
```

### 核心功能

#### 1. 自动语言检测
- 使用 `expo-localization` 检测设备系统语言
- 自动匹配支持的语言
- 不支持的语言降级到英语

#### 2. 语言持久化
- 使用 `AsyncStorage` 保存用户选择的语言
- 下次打开应用时自动加载保存的语言

#### 3. 动态切换
- 支持在设置页面实时切换语言
- 无需重启应用

## 使用方法

### 1. 在组件中使用翻译

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <Text>{t('common.loading')}</Text>
  );
};
```

### 2. 带参数的翻译

```typescript
// 翻译文件中:
// distanceTo: '距离{{phase}}还有 {{time}}'

const text = t('sunTimes.currentPhase.distanceTo', { 
  phase: '黄金时刻',
  time: '30 分钟'
});
// 输出: "距离黄金时刻还有 30 分钟"
```

### 3. 复数形式 (英语/德语)

```typescript
// 英文翻译:
// hours: '{{count}} hour'
// hours_plural: '{{count}} hours'

t('sunTimes.timeFormat.hours', { count: 1 });  // "1 hour"
t('sunTimes.timeFormat.hours', { count: 2 });  // "2 hours"
```

### 4. 切换语言

```typescript
import { changeLanguage, SupportedLanguage } from '../locales/i18n';

// 切换到日语
await changeLanguage('ja');
```

## 添加新翻译

### 1. 在翻译文件中添加键值对

**src/locales/zh.ts:**
```typescript
export default {
  // 现有内容...
  myFeature: {
    title: '我的功能',
    description: '这是一个新功能',
  },
};
```

### 2. 在所有语言文件中同步

确保在 `en.ts`, `ja.ts`, `de.ts` 中添加相同的键:

**src/locales/en.ts:**
```typescript
export default {
  // ...
  myFeature: {
    title: 'My Feature',
    description: 'This is a new feature',
  },
};
```

### 3. 在组件中使用

```typescript
const { t } = useTranslation();
<Text>{t('myFeature.title')}</Text>
```

## 添加新语言

### 1. 创建翻译文件

创建 `src/locales/fr.ts`:
```typescript
export default {
  common: {
    loading: 'Chargement...',
    // ... 其他翻译
  },
  // ...
};
```

### 2. 更新 i18n 配置

**src/locales/i18n.ts:**
```typescript
import fr from './fr';

export const SUPPORTED_LANGUAGES = ['zh', 'en', 'ja', 'de', 'fr'] as const;

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
  de: 'Deutsch',
  fr: 'Français',  // 新增
};

// 在 initI18n 函数中添加:
resources: {
  // ...
  fr: { translation: fr },  // 新增
}
```

## 最佳实践

### 1. 翻译键命名规范
- 使用小驼峰命名法
- 按功能模块分组
- 使用有意义的名称

```typescript
// ✅ 好的命名
sunTimes.phases.morningBlueHour
settings.theme.themeLight

// ❌ 不好的命名
t1
text123
```

### 2. 保持翻译简洁
- 避免在翻译中硬编码样式
- 使用参数插值而不是字符串拼接

```typescript
// ✅ 推荐
distanceTo: '距离{{phase}}还有 {{time}}'

// ❌ 不推荐  
distanceText: '距离早晨蓝调时刻还有 30 分钟'
```

### 3. 专业术语一致性
- 为摄影专业术语建立术语表
- 在所有语言中保持术语一致
- 咨询母语者确保翻译自然

### 4. 测试所有语言
- 在切换语言后测试主要功能
- 检查文本是否会导致布局问题
- 确认所有翻译键都有对应的值

## 辅助工具

### formatTimeCountdown
格式化时间倒计时的辅助函数:

```typescript
import { formatTimeCountdown } from '../utils/i18nHelpers';

const timeText = formatTimeCountdown(minutes, t);
// 自动根据当前语言格式化时间
```

## 调试技巧

### 1. 查看当前语言
```typescript
const { i18n } = useTranslation();
console.log('当前语言:', i18n.language);
```

### 2. 查看所有翻译键
```typescript
console.log('所有翻译:', i18n.store.data);
```

### 3. 检测缺失的翻译
i18n 会自动降级到 fallbackLng (英语),如果看到英文文本出现在其他语言中,说明翻译缺失。

## 性能考虑

- ✅ 翻译在应用启动时一次性加载
- ✅ 切换语言无需重载整个应用
- ✅ 翻译文件使用 TypeScript,有类型检查
- ✅ 支持代码分割(如需要可按模块拆分翻译文件)

## 常见问题

**Q: 为什么我的翻译没有生效?**
- 检查键名是否正确
- 确保所有语言文件都已更新
- 清除应用缓存重试

**Q: 如何处理长文本?**
- 使用换行符 `\n` 
- 或者拆分成多个翻译键

**Q: 复数形式如何处理?**
- 中文/日文:使用相同的翻译(无复数变化)
- 英文/德文:使用 `_plural` 后缀

## 扩展阅读

- [react-i18next 文档](https://react.i18next.com/)
- [i18next 文档](https://www.i18next.com/)
- [expo-localization 文档](https://docs.expo.dev/versions/latest/sdk/localization/)
