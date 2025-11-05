# BlueHour - 摄影助手 📷

一款专为摄影爱好者设计的 React Native + Expo 应用，帮助您规划完美的拍摄时间，轻松计算曝光参数。

## ✨ 功能特性

### 🌅 蓝调时刻规划器
- **智能定位**：通过 GPS 自动定位、搜索城市或地图钉选
- **时间规划**：选择日期（默认今天，可规划未来）
- **完整时间轴**：
  - 天文/航海/民用晨昏蒙影
  - 蓝色时刻（Blue Hour）
  - 日出/日落
  - 黄金时刻（Golden Hour）
  - 太阳正午

### 📷 摄影计算器套件

#### 1. EV 曝光等效计算器
- 保持总曝光量不变，自由换算光圈、快门、ISO
- 锁定一个参数，自动计算其他参数
- 实时显示 EV 值变化

#### 2. ND 滤镜计算器
- 支持 ND2 到 ND4000 全系列滤镜
- 自动计算使用滤镜后的快门速度
- 内置计时器，长曝光拍摄助手
- 进度条可视化倒计时

#### 3. 景深（DoF）& 超焦距计算器
- 支持多种传感器类型（全画幅、APS-C、M4/3 等）
- 精确计算清晰范围（近点/远点）
- 超焦距计算，助力风光摄影
- 显示对焦点前后景深分布

## 🌍 多语言支持

应用支持 4 种语言:
- 🇨🇳 中文 (默认)
- 🇺🇸 English
- 🇯🇵 日本語
- 🇩🇪 Deutsch

所有翻译都经过精心调整，使用专业的摄影术语。详见 [多语言文档](docs/I18N.md)。

## 🛠 技术栈

- **前端框架**：React Native + Expo
- **语言**：TypeScript
- **导航**：React Navigation (Bottom Tabs + Material Top Tabs)
- **定位**：Expo Location
- **国际化**：i18next + react-i18next
- **API**：sunrise-sunset.org（日出日落数据）

## 📁 项目结构

```
/my-photo-tool
├── assets/              # 资源文件
├── src/
│   ├── api/            # API 服务封装
│   ├── components/     # React 组件
│   │   ├── common/    # 通用组件
│   │   └── calculators/ # 计算器专用组件
│   ├── constants/      # 常量定义
│   ├── hooks/          # 自定义 Hooks
│   ├── navigation/     # 导航配置
│   ├── screens/        # 页面组件
│   │   ├── SunTimesScreen/
│   │   ├── CalculatorScreen/
│   │   │   └── tabs/
│   │   └── SettingsScreen/
│   ├── types/          # TypeScript 类型定义
│   └── utils/          # 工具函数
├── App.tsx             # 应用入口
├── app.json            # Expo 配置
├── package.json
└── tsconfig.json
```

## 🚀 开始使用

### 环境要求

- Node.js 18+ 
- npm 或 yarn
- Expo CLI

### 安装步骤

1. **克隆项目**
```bash
git clone <repository-url>
cd bluehournew
```

2. **安装依赖**
```bash
npm install
# 或
yarn install
```

3. **启动开发服务器**
```bash
npm start
# 或
expo start
```

4. **运行应用**
- **iOS**: 按 `i` 或在 Expo Go 应用中扫描二维码
- **Android**: 按 `a` 或在 Expo Go 应用中扫描二维码
- **Web**: 按 `w`

## 📱 屏幕截图

（待添加）

## 🎯 使用场景

### 风光摄影
- 使用蓝调时刻规划器找到最佳拍摄时间
- 使用景深计算器设置超焦距，确保前景到远景都清晰
- 使用 ND 滤镜计算器拍摄流水、云彩长曝光

### 人像摄影
- 使用黄金时刻规划器获得柔和的自然光
- 使用 EV 计算器调整光圈获得浅景深
- 使用景深计算器精确控制虚化范围

### 街拍
- 使用 EV 计算器快速调整曝光参数
- 平衡光圈、快门、ISO 三要素

## 🔧 核心算法

### EV 值计算
```typescript
EV = log2(aperture² / shutter) + log2(ISO / 100)
```

### ND 滤镜计算
```typescript
newShutter = baseShutter × 2^(ndStops)
```

### 景深计算
```typescript
// 超焦距
H = (f² / (N × c)) + f

// 近点
Dn = (s × (H - f)) / (H + s - 2f)

// 远点
Df = (s × (H - f)) / (H - s)
```

## 📝 待开发功能

- [ ] 地图选点功能
- [ ] 日期选择器
- [ ] 收藏地点
- [ ] 曝光历史记录
- [ ] 分享拍摄计划

## 📚 文档

- [快速开始指南](QUICK_START.md) - 环境配置和首次运行
- [项目结构说明](PROJECT_STRUCTURE.md) - 代码组织和文件说明
- [功能路线图](ROADMAP.md) - 已完成和计划中的功能
- [多语言文档](docs/I18N.md) - i18n 实现和使用指南
- [开发笔记](docs/DEVELOPMENT_NOTES.md) - 开发过程中的注意事项
- [位置搜索](docs/LOCATION_SEARCH.md) - 位置搜索功能文档
- [主题颜色](docs/THEME_COLORS.md) - 主题系统文档

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 🙏 致谢

- [sunrise-sunset.org](https://sunrise-sunset.org) - 提供日出日落 API
- Expo 团队
- React Native 社区

---

**用 ❤️ 为摄影爱好者打造**
