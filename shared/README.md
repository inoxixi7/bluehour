# 共享数据与测试向量

iOS / Android 原生版本与 TypeScript 版本共用的数据。**不要手动编辑 JSON**，它们由
`src/sharedData/buildSharedData.ts` 生成：

```bash
npm run shared:update
```

`npm test` 会检查这些文件是否与代码一致；修改胶片数据或计算逻辑后忘记重新生成，测试会失败。

| 文件                               | 内容                                                                  |
| ---------------------------------- | --------------------------------------------------------------------- |
| `data/films.json`                  | 胶片倒易率数据（模型、来源、可靠范围），原生 App 直接读取             |
| `data/photography.json`            | 光圈、快门、ISO、ND 滤镜、EV 场景                                     |
| `test-vectors/reciprocity.json`    | 每款胶片在不同测光时间下的校正结果                                    |
| `test-vectors/exposure.json`       | EV、ND 快门、等效曝光（含锁定目标 EV）                                |
| `test-vectors/exposure-locks.json` | 曝光计算器的参数锁定逻辑                                              |
| `test-vectors/sun.json`            | 太阳高度角、本地计算的日出日落 / 晨昏蒙影、黄金与蓝调时刻（UTC 毫秒） |
| `test-vectors/optics.json`         | 景深与超焦距                                                          |
| `test-vectors/formatters.json`     | 补偿档数与快门时间的格式化                                            |

原生实现必须在容差内复现这些结果：数值为相对误差 1e-9；
日出日落等时刻为 ±1.5 秒（二分查找以 1 秒为终止条件）。
