# 胶片倒易律失效补偿参考

本文档说明应用中使用的倒易律失效补偿模型和胶片参数配置。

> **模型版本**: 2026.01_calibrated_v1  
> **配置文件**: `docs/allfilm.json`

## 倒易律失效模型

### 计算公式

```
M(t) = min(pow(max(1, t / T1), p), maxMultiplier)
t_corrected = t * M(t)
```

**参数说明:**
- **T1** (t1): 基准时间（秒），T1秒内倍率为1（无失效）
- **p**: 幂函数指数，控制失效增长速率  
- **maxMultiplier** (max_mult): 最大补偿倍率上限

### 模型特点

1. **T1秒内无补偿**: 测光时间  T1时，M=1，无需补偿
2. **幂函数增长**: 测光时间 > T1时，按幂函数计算补偿倍率
3. **倍率上限**: 补偿倍率不超过 maxMultiplier

## 胶片分组及参数

### 1. 专业彩色负片 (Professional Color Negative)

**ID**: `professional_color_neg`

**胶片列表:**
- Kodak Portra 160, 400, 800
- Kodak Ektar 100  
- Fuji Pro 400H, Pro 160NS

**参数:** `{ t1: 1.0, p: 0.35, max_mult: 4.0 }`

**说明:** 专业卷在1s内非常稳定，之后按幂函数补偿，400H已移至此处

---

### 2. Kodak Vision3 系列 (Motion Picture Film)

**ID**: `kodak_vision3_series`

**胶片列表:**
- Kodak Vision3 50D, 250D, 500T
- Cinestill 800T, 50D, 400D

**参数:** `{ t1: 1.0, p: 0.32, max_mult: 4.0 }`

**说明:** Vision3官方建议10s补1档(20s)，100s补2档(400s)，t1降至1s是关键

---

### 3. 消费级彩色负片 (Consumer Color Negative)

**ID**: `consumer_color_neg`

**胶片列表:**
- Kodak Gold 200, ColorPlus 200, UltraMax 400
- Fuji C200, X-TRA 400
- Lomo CN 100/400/800

**参数:** `{ t1: 1.0, p: 0.42, max_mult: 5.0 }`

**说明:** 民用卷涂层较薄，长曝下感光效率下降比专业卷快

---

### 4. Fuji Acros 系列 (Premium B&W)

**ID**: `fuji_acros_series`

**胶片列表:**
- Fuji Acros II
- Fuji Acros (Original)

**参数:** `{ t1: 120.0, p: 0.30, max_mult: 2.0 }`

**说明:** Acros II在120s内无需补偿，这是其核心优势 

---

### 5. 现代黑白 T-Grain (Modern B&W T-Grain)

**ID**: `modern_bw_t_grain`

**胶片列表:**
- Kodak T-Max 100, 400
- Ilford Delta 100, 400, 3200

**参数:** `{ t1: 1.0, p: 0.30, max_mult: 4.0 }`

**说明:** T-Grain扁平颗粒底片比传统颗粒略稳定

---

### 6. 传统黑白 (Traditional B&W)

**ID**: `traditional_bw_standard`

**胶片列表:**
- Kodak Tri-X 400
- Ilford HP5 Plus, FP4 Plus
- Kentmere 100/400

**参数:** `{ t1: 1.0, p: 0.40, max_mult: 6.0 }`

**说明:** 经典配方底片，1s后开始显著失效

---

### 7. Fomapan 系列 (Budget Film)

**ID**: `fomapan_disaster`

**胶片列表:**
- Fomapan 100, 200, 400
- Arista EDU Ultra

**参数:** `{ t1: 1.0, p: 0.75, max_mult: 10.0 }`

**说明:** Fomapan失效极快，10s测光通常需要补偿到50s以上 

---

### 8. Ilford Pan F 50 (Fine Grain B&W)

**ID**: `ilford_pan_f_50`

**胶片列表:**
- Ilford Pan F 50

**参数:** `{ t1: 1.0, p: 0.60, max_mult: 8.0 }`

**说明:** Pan F虽是低感卷，但倒易律表现很差

---

### 9. Provia 100F (Premium Slide)

**ID**: `modern_slide_provia`

**胶片列表:**
- Fujichrome Provia 100F

**参数:** `{ t1: 128.0, p: 0.40, max_mult: 2.0 }`

**说明:** Provia 100F非常强悍，官方称128s内无需补偿 

---

### 10. 经典反转片 (Classic Slide E-6)

**ID**: `classic_slide_e6`

**胶片列表:**
- Kodak Ektachrome E100
- Fujichrome Velvia 100
- Fujichrome Astia 100F

**参数:** `{ t1: 1.0, p: 0.35, max_mult: 3.0 }`

**说明:** E100表现稳健，Velvia 100在1分钟内表现尚可

---

### 11. Velvia 50 (Sensitive Slide)

**ID**: `sensitive_slide_velvia50`

**胶片列表:**
- Fujichrome Velvia 50

**参数:** `{ t1: 1.0, p: 0.55, max_mult: 4.0 }`

**说明:** Velvia 50对长曝非常敏感，且容易出现严重的色彩偏绿 

---

## 使用建议

### 长曝光推荐胶片

**最佳选择:**
1. **Fuji Acros II** - 120s内无补偿
2. **Provia 100F** - 128s内无补偿
3. **Portra 系列** - 宽容度极高

**谨慎使用:**
- Fomapan系列 - 失效极快
- Velvia 50 - 易偏色

### 注意事项

1. 倒易律失效受温度、批次影响，参数仅供参考
2. 关键拍摄建议包围曝光
3. 长曝光时注意色彩偏移
4. 不同显影条件可能影响结果

---

**最后更新**: 2026年1月  
**数据来源**: 官方技术文档 + 社区测试经验