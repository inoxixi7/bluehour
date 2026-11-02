# 原生迁移进度

BlueHour 正在从 Expo / React Native 迁移到原生：Android 用 Kotlin + Jetpack Compose，iOS 之后用 SwiftUI。
迁移完成前，Expo 版本继续可用。

## 当前进度

| 部分                  | 状态      | 说明                                                                                             |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| `shared/`             | ✅ 完成   | 由 TypeScript 代码生成的胶片数据与测试向量（`npm run shared:update`），见 `shared/README.md`     |
| `native/android/core` | ✅ 完成   | 纯 Kotlin 计算逻辑：倒易率、EV、参数锁定、太阳位置、光线阶段、景深、格式化；已用测试向量逐条验证 |
| `native/android/app`  | 🚧 进行中 | 蓝调时刻、曝光、倒易率（含 B 门计时器）、设置（主题、语言、黄金时刻提醒）均可用                  |
| CI                    | ✅ 完成   | `android` 任务：core 测试、构建调试 APK（Artifacts 中可下载 `bluehour-debug-apk`）、Android lint |
| iOS（SwiftUI）        | ⏳ 未开始 | 计划同样用 `shared/test-vectors` 验证计算结果                                                    |

### Android 待办

1. 主屏幕小组件（今日黄金 / 蓝调时刻）
2. 胶片名称与描述的多语言（目前显示英文名）
3. 计时器：常驻通知（前台服务）显示剩余时间。目前用闹钟提醒，用户没有允许「闹钟和提醒」时系统可能推迟提醒
4. 蓝调时刻：搜索地点（需要按坐标确定时区，目前假设设备时区即所在地时区）、地名显示、下拉刷新
5. 设置：Android 12 及以下不能在应用内切换语言（跟随系统）；Expo 版的反馈与 GitHub 链接、关于页面

## 约定

- 计算逻辑必须放在 `core`，并用 `shared/test-vectors` 验证；界面层不写计算
- 修改胶片数据或计算公式：先改 TypeScript，运行 `npm run shared:update`，再让 Kotlin 测试通过
- 文案需要中、英、日、德四种语言：`res/values`、`values-zh`、`values-ja`、`values-de`；
  Expo 版已有的文案从 `src/locales/*.ts` 复制，保持用词一致
- 语言：Android 13+ 用系统的「应用语言」设置（`generateLocaleConfig`），不引入 AppCompat
- 黄金时刻提醒：每次只安排下一个闹钟，用上次定位计算；开机、更新应用、改时区或时间后重新安排
- 应用 ID 暂为 `com.yourcompany.bluehour`（与 Expo 版本一致，便于覆盖安装），
  正式名称确定后修改 `native/android/gradle.properties` 中的 `bluehour.applicationId`

## 已知问题

- `shared/` 的一致性检查按 12 位有效数字比较（macOS 与 Linux 的浮点末位不同）；
  在 macOS 上运行 `npm run shared:update` 后，若 `reciprocity.json`、`sun.json` 只有末位差异，不要提交这两个文件

## 本地开发

需要 Android Studio（自带 Android SDK 与 JDK），用它打开 `native/android` 目录。详见 `native/android/README.md`。

```bash
cd native/android
./gradlew :core:test :app:assembleDebug
```

## 继续开发时给 Claude Code 的提示

```
这个项目（BlueHour 摄影助手）正在迁移到原生 Android（Kotlin + Jetpack Compose），
进度和约定见 docs/NATIVE_MIGRATION.md，请先阅读。
先在 native/android 运行 ./gradlew :core:test :app:assembleDebug 确认能构建，
然后继续「Android 待办」中的下一项。
```
