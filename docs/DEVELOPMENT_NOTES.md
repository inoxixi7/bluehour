# 开发注意事项 ⚠️

## 当前状态

✅ **已完成**:

- 项目结构搭建
- 所有核心文件创建
- TypeScript 配置
- 导航架构
- 曝光计算器功能
- 倒易律计算器功能
- 日出日落/蓝调时刻计算
- 用户预设系统
- 多语言支持 (中文/英文/日文/德文)
- 位置搜索与时区支持
- 主题切换 (浅色/深色/自动)
- 基础 UI 组件

## 首次运行步骤

### 1. 安装依赖

```bash
npm install
```

这将安装所有必需的包，包括：

- React Native & Expo
- React Navigation
- TypeScript
- Expo Location
- 等等...

### 2. 资源文件

项目已包含所需的图片资源：

- `assets/images/` - 蓝调时刻相关图片
- `assets/fonts/` - 自定义字体（如需要）
- 应用图标和启动屏已配置在 `app.json` 中

### 3. 启动开发服务器

```bash
npm start
```

### 4. 在设备上测试

- 扫描二维码（Expo Go 应用）
- 或按 `i` (iOS) / `a` (Android)

### 5. 提交前检查

GitHub Actions（`.github/workflows/ci.yml`）会在每个 PR 和 main 上运行以下检查，提交前可在本地先跑一遍：

```bash
npm run type-check   # TypeScript 类型检查
npm run lint         # ESLint
npm run format:check # Prettier 格式检查（npm run format 自动修复）
npm test             # Jest 单元测试（src/**/__tests__）
```

修改了胶片数据或计算逻辑时，还需要重新生成原生版本共用的数据与测试向量（见 `shared/README.md`）：

```bash
npm run shared:update
```

原生 Android 版本在 `native/android/`（见该目录的 README），CI 会运行 `core` 测试并构建调试 APK。

## TypeScript 编译错误

当前显示的 TypeScript 错误（找不到模块）是**正常的**，因为：

1. 依赖还未安装
2. 运行 `npm install` 后会自动解决

不要担心这些错误！

## 已知限制和待解决问题

### 1. Picker 组件

使用了 `@react-native-picker/picker`，需要在安装依赖时确保包含。

如果遇到问题，可以运行：

```bash
npx expo install @react-native-picker/picker
```

### 2. 位置权限

在 iOS 和 Android 上需要用户授予位置权限。首次运行时会请求权限。

**iOS 模拟器测试位置**:

- Features → Location → Custom Location
- 输入纬度和经度

**Android 模拟器测试位置**:

- Extended Controls (⋯) → Location
- 输入坐标

### 3. API 请求

sunrise-sunset.org API 是免费的，但有速率限制。如果遇到错误，可能需要等待几分钟。

### 4. Babel Module Resolver

`babel.config.js` 中配置了 `@` 别名指向 `src` 目录。

如果遇到别名解析问题：

```bash
npm start -- --clear
```

## 推荐的开发顺序

### 阶段 1: 基础运行 ✅

1. ✅ 项目结构已创建
2. ✅ 依赖已安装
3. ✅ 资源文件已准备
4. ✅ 应用可正常运行

### 阶段 2: 核心功能 ✅

1. ✅ 曝光计算器（光圈/快门/ISO/ND滤镜）
2. ✅ 倒易律计算器（胶片补偿）
3. ✅ 日出日落时间计算
4. ✅ 蓝调时刻计算
5. ✅ 用户预设系统

### 阶段 3: 用户体验 ✅

1. ✅ 多语言支持
2. ✅ 主题切换
3. ✅ 位置搜索
4. ✅ 时区支持

### 阶段 4: 优化改进（进行中）

1. 性能优化
2. UI/UX 改进
3. 错误处理完善
4. 用户反馈收集

## 调试技巧

### 查看日志

```bash
# 在开发服务器运行时按
j  # 打开 Chrome DevTools
r  # 重新加载应用
```

### 清除缓存

```bash
npm start -- --clear
```

### 重置 Metro bundler

```bash
rm -rf node_modules
npm install
npm start -- --clear
```

### 检查端口占用

```bash
# 如果 19000 端口被占用
lsof -ti:19000 | xargs kill
```

## 性能注意事项

### 1. 图片优化

- 使用合适尺寸的图片
- 考虑使用 WebP 格式
- 启用图片缓存

### 2. 列表渲染

如果未来添加列表功能，使用 `FlatList` 而非 `ScrollView`：

```typescript
<FlatList
  data={items}
  renderItem={({ item }) => <Item {...item} />}
  keyExtractor={item => item.id}
/>
```

### 3. 状态管理

当应用复杂度增加时，考虑使用：

- Context API（轻量级状态）
- Redux Toolkit（复杂状态）
- Zustand（简单高效）

## 代码质量工具（可选）

### ESLint

```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

### Prettier

```bash
npm install --save-dev prettier eslint-config-prettier
```

### Husky (Git hooks)

```bash
npm install --save-dev husky lint-staged
```

## 部署前检查清单

- [x] 曝光计算器逻辑测试
- [x] 倒易律计算器测试
- [x] 位置权限正常工作
- [x] API 调用错误处理
- [x] 应用图标和启动屏
- [x] 多语言支持
- [x] 主题切换功能
- [ ] iOS 和 Android 平台完整测试
- [ ] 性能优化
- [ ] 错误追踪集成（可选）

## 常见错误及解决方案

### "Unable to resolve module"

```bash
npm install
npm start -- --clear
```

### "Metro bundler is not running"

```bash
# 完全重启
rm -rf node_modules
npm install
npm start
```

### "Expo Go version mismatch"

更新 Expo Go 应用到最新版本

### "Location permission denied"

检查 `app.json` 中的权限配置

## 获取帮助

如果遇到问题：

1. **查看日志**: 终端和 Expo DevTools
2. **搜索错误**: Google + Stack Overflow
3. **官方文档**:
   - [Expo 文档](https://docs.expo.dev/)
   - [React Navigation](https://reactnavigation.org/)
   - [React Native](https://reactnative.dev/)
4. **社区**:
   - [Expo Forums](https://forums.expo.dev/)
   - [React Native Discord](https://discord.com/invite/react-native)

## 下一个里程碑 🎯

1. **性能优化**: 提升应用响应速度和流畅度
2. **完善错误处理**: 更友好的错误提示
3. **用户反馈**: 收集并响应用户建议
4. **功能扩展**: 基于用户需求添加新功能
5. **平台优化**: 针对 iOS 和 Android 的特定优化

---

**当前版本**: Beta (生产就绪)
**最后更新**: 2026年1月

祝编码愉快！🚀
