# BlueHour Photography - 摄影黄金时刻应用

这是一个专为摄影师设计的移动应用，帮助你捕捉最佳的摄影时机。

## 功能特点

- 🌅 **自动位置检测**: 使用Expo Location自动获取当前位置
- ⏰ **精确时间计算**: 使用suncalc库计算日出、日落、黄金时刻和蓝调时刻
- 📸 **智能拍摄建议**: 根据当前时段提供专业的摄影建议
- 🎨 **动态主题**: 界面颜色随当前摄影时段变化
- 📱 **原生体验**: 基于Expo + React Native + TypeScript构建

## 摄影时段说明

### 🌙 夜晚 (Night)
- 适合拍摄星空、夜景、光轨
- 建议使用三脚架和长曝光

### 🌌 蓝调时刻 (Blue Hour)
- 日出前/日落后的蓝色天空
- 适合建筑剪影、城市夜景
- 晨间: 日出前30-40分钟
- 黄昏: 日落后20-30分钟

### 🌅 黄金时刻 (Golden Hour)
- 最佳人像和风景摄影时间
- 光线柔和温暖
- 晨间: 日出后1小时
- 黄昏: 日落前1小时

### ☀️ 白天 (Day)
- 正常日光拍摄
- 建议使用偏振镜
- 注意高对比度场景

## 安装和运行

1. 安装依赖:
\`\`\`bash
npm install
\`\`\`

2. 启动开发服务器:
\`\`\`bash
npm start
\`\`\`

3. 在手机上安装Expo Go应用，扫描二维码运行

## 主要依赖

- **Expo**: React Native开发平台
- **expo-location**: 位置服务
- **suncalc**: 太阳位置和时间计算
- **expo-linear-gradient**: 渐变背景
- **TypeScript**: 类型安全

## 权限说明

应用需要以下权限：
- **位置权限**: 用于获取当前经纬度，计算本地日出日落时间

## 项目结构

\`\`\`
src/
├── components/          # 可复用组件
│   ├── CurrentStatus.tsx    # 当前时段状态显示
│   └── TimeDisplay.tsx      # 时间列表显示
├── hooks/              # 自定义Hooks
│   ├── useLocation.ts      # 位置获取Hook
│   └── useSunTimes.ts      # 太阳时间计算Hook
├── screens/            # 屏幕组件
│   └── PhotographyTimerScreen.tsx
├── types/              # TypeScript类型定义
│   └── index.ts
└── utils/              # 工具函数
    └── sunCalculations.ts   # 太阳时间计算工具
\`\`\`

## 开发说明

这个应用使用了以下技术栈：
- **Expo 49**: 跨平台开发框架
- **React Native 0.72**: 移动应用开发框架  
- **TypeScript**: 提供类型安全
- **suncalc**: 天文计算库

## 贡献

欢迎提交Issue和Pull Request来改进这个应用！

## 许可证

MIT License
