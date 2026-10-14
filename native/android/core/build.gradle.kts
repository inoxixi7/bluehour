import org.jetbrains.kotlin.gradle.dsl.JvmTarget

plugins {
    id("org.jetbrains.kotlin.jvm")
    id("org.jetbrains.kotlin.plugin.serialization")
}

// 仓库根目录下的 shared/（胶片数据与测试向量，由 TypeScript 版本生成）
val sharedDir = rootDir.resolve("../../shared")

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
    compilerOptions {
        jvmTarget.set(JvmTarget.JVM_17)
    }
}

sourceSets {
    main {
        // films.json / photography.json 打包进 jar，运行时从类路径读取
        resources.srcDir(sharedDir.resolve("data"))
    }
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.11.0")

    testImplementation(platform("org.junit:junit-bom:6.1.3"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

tasks.test {
    useJUnitPlatform()
    systemProperty("bluehour.testVectorsDir", sharedDir.resolve("test-vectors").absolutePath)
    inputs.dir(sharedDir.resolve("test-vectors"))
}
