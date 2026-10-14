# 原生迁移进度

BlueHour 正在从 Expo / React Native 迁移到原生：Android 用 Kotlin + Jetpack Compose，iOS 之后用 SwiftUI。
迁移完成前，Expo 版本继续可用。

## 当前进度

| 部分                  | 状态      | 说明                                                                                             |
| --------------------- | --------- | ------------------------------------------------------------------------------------------------ |
| `shared/`             | ✅ 完成   | 由 TypeScript 代码生成的胶片数据与测试向量（`npm run shared:update`），见 `shared/README.md`     |
| `native/android/core` | ✅ 完成   | 纯 Kotlin 计算逻辑：倒易率、EV、参数锁定、太阳位置、光线阶段、景深、格式化；已用测试向量逐条验证 |
| `native/android/app`  | 🚧 进行中 | 「蓝调时刻」「倒易率」页面可用；「曝光」页面为占位                                               |
| CI                    | ✅ 完成   | `android` 任务：core 测试、构建调试 APK（Artifacts 中可下载 `bluehour-debug-apk`）、Android lint |
| iOS（SwiftUI）        | ⏳ 未开始 | 计划同样用 `shared/test-vectors` 验证计算结果                                                    |

### Android 待办

1. 曝光页面：EV、ND、参数锁定（`ExposureLocks`）、EV 场景
2. 倒易率计时器：结束时通知 + 震动；之后考虑常驻通知
3. 设置：语言、主题、黄金时刻提醒
4. 主屏幕小组件（今日黄金 / 蓝调时刻）
5. 胶片名称与描述的多语言（目前显示英文名）
6. 蓝调时刻：搜索地点（需要按坐标确定时区，目前假设设备时区即所在地时区）、地名显示、下拉刷新

## 约定

- 计算逻辑必须放在 `core`，并用 `shared/test-vectors` 验证；界面层不写计算
- 修改胶片数据或计算公式：先改 TypeScript，运行 `npm run shared:update`，再让 Kotlin 测试通过
- 文案需要中、英、日、德四种语言：`res/values`、`values-zh`、`values-ja`、`values-de`
- 应用 ID 暂为 `com.yourcompany.bluehour`（与 Expo 版本一致，便于覆盖安装），
  正式名称确定后修改 `native/android/gradle.properties` 中的 `bluehour.applicationId`

## 已知问题

- TypeScript 与 Kotlin 两版都会把 0.97 秒显示为 `1/1s`（`formatShutterSpeed`），以后两边一起修
- 两版的 `getCurrentPhaseState` 在当天第一个蓝调时刻之前（凌晨）会取到「明天早晨蓝调时刻」这一段，
  倒计时显示为到明天蓝调结束（约 24 小时以上），而不是「夜晚」；以后两边一起修
- `npm test` 的共享数据一致性检查是精确比较，macOS 上 `reciprocity.json`、`sun.json` 会有末位浮点差异而失败
  （文件在 Linux 上生成）；不要在 macOS 上提交这两个文件的重新生成结果

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
