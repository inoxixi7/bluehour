# BlueHour Android（Kotlin + Jetpack Compose）

原生 Android 版本，目前处于早期阶段：倒易率计算页面可用，其余页面待移植。

## 结构

| 模块    | 说明                                                                                   |
| ------- | -------------------------------------------------------------------------------------- |
| `core/` | 纯 Kotlin（JVM）计算逻辑：倒易率、EV、参数锁定、太阳位置、景深、格式化；不依赖 Android |
| `app/`  | Jetpack Compose 界面，Material 3，Android 12+ 使用系统动态取色                         |

`core` 打包了仓库根目录的 `shared/data/*.json`（胶片数据、摄影常量），
测试用 `shared/test-vectors/*.json` 验证与 TypeScript 版本的结果一致。

## 构建

需要 JDK 17+ 与 Android SDK（Android Studio 自带）。

```bash
cd native/android
./gradlew :core:test           # 计算逻辑测试
./gradlew :app:assembleDebug   # 构建调试 APK
./gradlew :app:installDebug    # 安装到已连接的设备
```

没有 Android SDK 的环境只能构建 `core`：

```bash
./gradlew -Pbluehour.coreOnly=true :core:test
```

GitHub Actions 每次都会构建调试 APK，可在运行记录的 Artifacts 中下载 `bluehour-debug-apk` 直接安装到手机。

## 应用标识

`gradle.properties` 中的 `bluehour.applicationId` 目前与 Expo 版本相同（`com.yourcompany.bluehour`），
正式名称确定后只需修改这一处。
