# Assets 文件夹

此文件夹用于存放应用的资源文件。

## 目录结构

```
assets/
├── fonts/           # 字体文件
│   └── README.md   # 可以在这里放置自定义字体
│
└── images/         # 图片资源
    ├── icon.png            # 应用图标 (1024x1024)
    ├── splash.png          # 启动屏幕 (1242x2436)
    ├── adaptive-icon.png   # Android 自适应图标 (1024x1024)
    └── favicon.png         # Web 图标 (48x48)
```

## 所需图片资源

### 1. icon.png
- **尺寸**: 1024x1024 像素
- **用途**: iOS 和 Android 应用图标
- **建议**: 使用蓝色/金色渐变，体现蓝调时刻和黄金时刻

### 2. splash.png
- **尺寸**: 1242x2436 像素（iPhone 12 Pro Max）
- **用途**: 应用启动屏幕
- **建议**: 深色背景，应用名称和 Logo

### 3. adaptive-icon.png
- **尺寸**: 1024x1024 像素
- **用途**: Android 自适应图标前景
- **注意**: 保持安全区域，避免重要内容被裁剪

### 4. favicon.png
- **尺寸**: 48x48 像素
- **用途**: Web 版本图标

## 临时占位符

在正式设计图标之前，可以使用以下工具生成占位符：
- [Icon Kitchen](https://icon.kitchen/) - 在线图标生成器
- [Figma](https://figma.com) - 专业设计工具

## 字体

如需使用自定义字体，请：
1. 将字体文件（.ttf 或 .otf）放入 `fonts/` 文件夹
2. 在 `App.tsx` 中使用 `expo-font` 加载
3. 在 `constants/Layout.ts` 中定义字体常量
