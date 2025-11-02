# 项目结构说明 📂

## 目录树

```
bluehournew/
├── assets/                          # 静态资源
│   ├── fonts/                      # 字体文件
│   │   └── README.md
│   ├── images/                     # 图片资源
│   │   └── README.md
│   └── README.md
│
├── src/                            # 源代码
│   │
│   ├── api/                        # API 服务层
│   │   └── sunTimeService.ts      # 日出日落 API 封装
│   │
│   ├── components/                 # React 组件
│   │   ├── common/                # 通用组件
│   │   │   ├── AppButton.tsx      # 自定义按钮组件
│   │   │   ├── AppTextInput.tsx   # 自定义输入框组件
│   │   │   ├── Card.tsx           # 卡片容器组件
│   │   │   └── LoadingIndicator.tsx # 加载指示器
│   │   └── calculators/           # 计算器专用组件（待扩展）
│   │
│   ├── constants/                  # 常量定义
│   │   ├── Colors.ts              # 颜色主题常量
│   │   ├── Layout.ts              # 布局和尺寸常量
│   │   └── Photography.ts         # 摄影相关数据常量
│   │
│   ├── hooks/                      # 自定义 React Hooks（待实现）
│   │   ├── useLocation.ts         # GPS 定位 Hook
│   │   └── useSunTimes.ts         # 日出日落数据 Hook
│   │
│   ├── navigation/                 # 导航配置
│   │   ├── BottomTabNavigator.tsx # 底部标签导航
│   │   ├── CalculatorNavigator.tsx # 计算器顶部标签导航
│   │   └── types.ts               # 导航类型定义
│   │
│   ├── screens/                    # 页面组件
│   │   │
│   │   ├── SunTimesScreen/        # 日出日落屏幕
│   │   │   ├── SunTimesScreen.tsx
│   │   │   └── styles.ts
│   │   │
│   │   ├── CalculatorScreen/       # 计算器主屏幕
│   │   │   ├── CalculatorScreen.tsx
│   │   │   ├── styles.ts
│   │   │   └── tabs/              # 计算器子页面
│   │   │       ├── EVCalculator.tsx    # EV 等效曝光计算器
│   │   │       ├── NDCalculator.tsx    # ND 滤镜计算器
│   │   │       └── DoFCalculator.tsx   # 景深计算器
│   │   │
│   │   └── SettingsScreen/        # 设置屏幕
│   │       ├── SettingsScreen.tsx
│   │       └── styles.ts
│   │
│   ├── types/                      # TypeScript 类型定义
│   │   ├── index.ts               # 全局类型
│   │   └── api.ts                 # API 响应类型
│   │
│   └── utils/                      # 工具函数
│       ├── photographyCalculations.ts # 摄影计算核心逻辑
│       └── formatters.ts           # 格式化函数
│
├── .gitignore                      # Git 忽略文件配置
├── App.tsx                         # 应用入口文件
├── app.json                        # Expo 配置
├── babel.config.js                 # Babel 配置
├── package.json                    # 项目依赖
├── tsconfig.json                   # TypeScript 配置
├── README.md                       # 项目说明
└── QUICK_START.md                  # 快速开始指南
```

## 核心文件说明

### 📱 应用入口

#### `App.tsx`
- 应用的根组件
- 包装 `NavigationContainer`
- 配置全局状态（如需要）

#### `app.json`
- Expo 项目配置
- 应用名称、图标、启动屏幕
- 权限声明（位置、相机等）

### 🎨 常量配置

#### `src/constants/Colors.ts`
- 主题色定义
- 支持暗色和亮色主题
- 包含蓝调时刻、黄金时刻专用颜色

#### `src/constants/Layout.ts`
- 间距、字体大小、圆角等布局常量
- 阴影样式
- 响应式尺寸

#### `src/constants/Photography.ts`
- 光圈值列表 (F1.0 - F32)
- 快门速度列表 (1/8000s - 30min)
- ISO 值列表 (50 - 25600)
- ND 滤镜数据
- 传感器类型和模糊圈常量

### 🧮 核心计算逻辑

#### `src/utils/photographyCalculations.ts`
包含所有摄影计算函数：

- `calculateEV()` - 计算曝光值
- `calculateEquivalentExposure()` - EV 等效曝光
- `calculateNDShutter()` - ND 滤镜快门计算
- `calculateDepthOfField()` - 景深计算
- `calculateHyperFocalDistance()` - 超焦距计算

#### `src/utils/formatters.ts`
格式化显示函数：

- `formatShutterSpeed()` - 快门速度格式化
- `formatAperture()` - 光圈格式化
- `formatISO()` - ISO 格式化
- `formatTime()` - 时间格式化
- `formatDistance()` - 距离格式化

### 🌐 API 服务

#### `src/api/sunTimeService.ts`
- 封装 sunrise-sunset.org API 调用
- `fetchSunTimes()` - 获取原始数据
- `processSunTimes()` - 处理并计算黄金/蓝色时刻
- `getSunTimes()` - 一站式获取处理后的数据

### 🧩 组件架构

#### 通用组件 (`src/components/common/`)
- **AppButton**: 统一风格按钮，支持多种变体
- **AppTextInput**: 带标签和错误提示的输入框
- **Card**: 卡片容器，统一样式
- **LoadingIndicator**: 加载指示器

#### 页面组件 (`src/screens/`)

**SunTimesScreen** - 日出日落时刻规划器
- 位置获取（GPS）
- 日期选择
- 时间轴展示
- 蓝调时刻、黄金时刻高亮

**CalculatorScreen** - 计算器容器
- 包含三个子标签页
- 使用 Material Top Tabs 导航

**EVCalculator** - EV 曝光计算器
- 基准曝光设置
- 参数调整
- 等效曝光计算

**NDCalculator** - ND 滤镜计算器
- 基础快门选择
- ND 滤镜选择
- 新快门速度计算
- 内置计时器（长曝光辅助）

**DoFCalculator** - 景深计算器
- 传感器类型选择
- 焦距、光圈、对焦距离输入
- 清晰范围计算
- 超焦距显示

**SettingsScreen** - 设置和关于
- 应用信息
- 功能说明
- 反馈入口

### 🧭 导航结构

```
NavigationContainer
└── BottomTabNavigator
    ├── SunTimesScreen (蓝调时刻)
    ├── CalculatorScreen (计算器)
    │   └── MaterialTopTabs
    │       ├── EVCalculator
    │       ├── NDCalculator
    │       └── DoFCalculator
    └── SettingsScreen (设置)
```

## 数据流

### 1. 日出日落功能
```
用户点击获取位置
    ↓
expo-location 获取 GPS 坐标
    ↓
sunTimeService.getSunTimes(lat, lng, date)
    ↓
sunrise-sunset.org API
    ↓
processSunTimes() 计算黄金/蓝色时刻
    ↓
显示时间轴
```

### 2. EV 计算器功能
```
用户输入基准曝光参数
    ↓
用户调整某个参数（如光圈）
    ↓
用户选择锁定参数（如 ISO）
    ↓
calculateEquivalentExposure()
    ↓
显示新的等效曝光值
```

### 3. ND 滤镜计算器
```
用户选择基础快门速度
    ↓
用户选择 ND 滤镜型号
    ↓
calculateNDShutter(baseShutter, ndStops)
    ↓
显示新快门速度
    ↓
（可选）启动计时器倒计时
```

## 扩展建议

### 即将实现的功能

1. **自定义 Hooks**
   - `useLocation`: 封装位置获取逻辑
   - `useSunTimes`: 封装日出日落数据获取

2. **计算器专用组件**
   - `ExposureValueInput`: 曝光三要素联动输入
   - `ValuePicker`: 优化的数值选择器

3. **Firebase 集成**
   - 用户收藏地点
   - 拍摄计划历史
   - 云同步

4. **地图功能**
   - 地图选点
   - 城市搜索
   - 地点标记

5. **增强功能**
   - 日期选择器
   - 通知提醒（黄金时刻前提醒）
   - 分享功能
   - 暗色/亮色主题切换

## 代码规范

- **命名规范**: 使用 camelCase 和 PascalCase
- **文件组织**: 一个组件一个文件
- **类型安全**: 严格使用 TypeScript
- **样式管理**: 使用 StyleSheet.create
- **注释**: 复杂逻辑添加注释

## 性能优化

- 使用 `React.memo` 避免不必要的重渲染
- 使用 `useMemo` 和 `useCallback` 缓存计算结果
- 图片使用合适的尺寸和格式
- 列表使用 `FlatList` 而非 `ScrollView`

---

**提示**: 这是一个活跃开发中的项目结构，会随着功能迭代不断完善。
