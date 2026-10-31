// 所有插件放在根项目的 buildscript 类路径上，保证各模块使用同一个 Kotlin 版本
buildscript {
    val kotlinVersion = "2.4.21"
    val androidGradlePluginVersion = "9.3.3"

    repositories {
        google {
            content {
                includeGroupByRegex("androidx\\..*")
                includeGroupByRegex("com\\.android(\\..*)?")
                includeGroupByRegex("com\\.google\\.android\\..*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
    dependencies {
        classpath("org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlinVersion")
        classpath("org.jetbrains.kotlin:kotlin-serialization:$kotlinVersion")
        classpath("org.jetbrains.kotlin:compose-compiler-gradle-plugin:$kotlinVersion")
        if (project.findProperty("bluehour.coreOnly") != "true") {
            classpath("com.android.tools.build:gradle:$androidGradlePluginVersion")
        }
    }
}
