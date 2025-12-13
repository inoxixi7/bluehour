# BlueHour - 摄影助手 📷

[![Expo](https://img.shields.io/badge/Expo-Go-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-v0.73-61dafb.svg)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.3-3178c6.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**BlueHour** 是一款专为摄影爱好者设计的全能助手应用。它不仅能帮助您精确规划拍摄的"黄金时刻"和"蓝调时刻"，还提供了一套专业的摄影计算器，助您轻松应对各种复杂的拍摄场景。

[English](README.md) | [日本語](README_ja.md) | [中文](README_zh.md)

---

## ✨ 核心功能

### 🌅 蓝调时刻规划器 (Blue Hour Planner)
不再错过最佳光线。
- **智能定位**：支持 GPS 自动定位、城市搜索及地图选点。
- **精准时间轴**：
  - 🔵 **蓝调时刻 (Blue Hour)**：天空呈现深蓝色的迷人时刻。
  - 🟡 **黄金时刻 (Golden Hour)**：日出日落时的柔和金光。
  - 🌑 **晨昏蒙影**：天文、航海、民用三个阶段的详细数据。
  - ☀️ **日出/日落 & 正午**：关键太阳位置时间点。
- **未来规划**：可自由选择日期，提前规划行程。
- **可视化展示**：直观的太阳轨迹和光线阶段图表。

### 🧮 摄影计算器套件 (Calculator Suite)

#### 1. 曝光计算器 (EV Calculator)
- **互易律计算**：在保持曝光量不变的前提下，自由换算光圈、快门和 ISO。
- **参数锁定**：锁定任一参数，自动计算其他数值。
- **ND 滤镜支持**：内置 ND 滤镜档位换算。

#### 2. 倒易率失效计算器 (Reciprocity Failure)
- **胶片摄影必备**：针对长曝光下的胶片感光度下降进行补偿。
- **多胶卷预设**：内置 Kodak Portra, Fujifilm Acros, Ilford HP5 等主流胶卷数据。
- **计时器**：内置带进度条的倒计时功能。

#### 3. 景深与超焦距 (DoF & Hyperfocal)
- **清晰范围**：计算前景深、后景深及总景深。
- **超焦距**：风光摄影利器，助您获得最大清晰范围。
- **多画幅支持**：支持全画幅、APS-C、M4/3 及中画幅系统。

---

## 🚀 快速开始

### 环境准备
确保您的开发环境已安装：
- **Node.js** (v18+)
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go App**: 在您的 iOS 或 Android 手机上下载。

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/inoxixi7/bluehournew.git
   cd bluehournew
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动项目**
   ```bash
   npx expo start
   ```

4. **运行应用**
   - 使用手机上的 Expo Go 扫描终端显示的二维码。
   - 或按 `a` 在 Android 模拟器运行，按 `i` 在 iOS 模拟器运行。

---

## 📂 项目结构

```
bluehournew/
├── assets/             # 静态资源 (图片, 字体)
├── src/
│   ├── api/            # API 服务 (Geocoding, SunTimes)
│   ├── components/     # UI 组件 (Common, Screens specific)
│   ├── constants/      # 全局常量 (Colors, Layout)
│   ├── contexts/       # React Context (Theme, Location)
│   ├── hooks/          # 自定义 Hooks
│   ├── locales/        # i18n 国际化文件
│   ├── navigation/     # 路由导航配置
│   ├── screens/        # 页面组件
│   └── utils/          # 工具函数 (Calculations, Formatters)
└── docs/               # 详细文档
```

---

## 🗺️ 开发路线图 (Roadmap)

- [x] **v1.0 基础版**
  - [x] 太阳时刻表 & 蓝调时刻计算
  - [x] 基础曝光计算器
  - [x] 多语言支持 (中/英/日/德)
  - [x] 深色模式主题
- [ ] **v1.1 进阶版**
  - [ ] 月相与银河拍摄规划
  - [ ] 延时摄影计算器
  - [ ] 本地天气集成
- [ ] **v2.0 社区版**
  - [ ] 用户作品分享
  - [ ] 拍摄点推荐

---

## 🛠 技术栈

- **框架**: [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/)
- **语言**: [TypeScript](https://www.typescriptlang.org/)
- **导航**: [React Navigation](https://reactnavigation.org/)
- **地图**: [react-native-maps](https://github.com/react-native-maps/react-native-maps)
- **国际化**: [i18next](https://www.i18next.com/)

## 📄 许可证

本项目采用 [MIT 许可证](LICENSE) 开源。
