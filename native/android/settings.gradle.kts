rootProject.name = "BlueHour"

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google {
            content {
                includeGroupByRegex("androidx\\..*")
                includeGroupByRegex("com\\.android(\\..*)?")
                includeGroupByRegex("com\\.google\\.android\\..*")
            }
        }
        mavenCentral()
    }
}

// 只构建纯 Kotlin 的 core 模块（没有 Android SDK 的环境，例如部分 CI / 云端容器）：
//   ./gradlew -Pbluehour.coreOnly=true :core:test
val coreOnly = providers.gradleProperty("bluehour.coreOnly").orNull == "true"

include(":core")
if (!coreOnly) {
    include(":app")
}
