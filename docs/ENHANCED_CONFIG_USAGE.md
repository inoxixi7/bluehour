# 增强型胶片倒易律配置文件使用指南

## 📄 文件位置

`/film-reciprocity-config-enhanced.json`

## 🎯 文件用途

这是一份包含 **倒易律补偿参数** + **色彩偏移滤镜建议** 的综合配置文件，适用于：

1. **移动应用集成**：可直接导入到 React Native/Expo 应用中
2. **Web 应用**：可用于在线胶片计算器
3. **桌面工具**：Electron 或其他桌面应用
4. **API 服务**：作为后端计算服务的数据源
5. **教育用途**：学习胶片摄影和倒易律失效

---

## 📊 数据结构

### 1. 元数据 (Metadata)

```json
{
  "version": "1.0.0",
  "model": "Segmented Damping Model",
  "generatedDate": "2026-01-12",
  "totalFilmsIncluded": 44
}
```

### 2. 胶片数据 (Films)

每个胶片包含以下信息：

#### A. 基础信息
```json
{
  "id": "kodak_portra160",
  "name": "Kodak Portra 160",
  "iso": 160,
  "type": "c41",
  "category": "c41-color-negative",
  "subcategory": "professional"
}
```

#### B. 数学模型参数
```json
{
  "modelParams": {
    "T1": 30,          // Zone A/B 分界点（秒）
    "T2": 300,         // Zone B/C 分界点（秒）
    "p": 0.56,         // 幂函数指数
    "logK": 17,        // 对数阻尼系数
    "maxMultiplier": 4 // 最大补偿倍数
  }
}
```

#### C. 验证数据
```json
{
  "validation": {
    "M_T2": 4.423,           // T2 点的倍数
    "threshold": 5.200,      // 安全阈值（1.3 × maxM）
    "safetyMargin": "15.0%", // 安全余量
    "status": "✓"            // 验证状态
  }
}
```

#### D. 色彩偏移建议
```json
{
  "colorShiftAdvice": {
    "enabled": true,  // 是否启用（黑白片为 false）
    "severity": "critical",  // 严重程度（仅反转片）
    "timeRanges": [
      {
        "range": "30s - 2min",
        "shift": "轻微偏绿",
        "filter": "CC05M 或 CC10M",
        "filterDensity": "5-10 magenta",
        "description": "轻微绿色偏移，可使用弱洋红色滤镜补偿"
      }
    ],
    "notes": [
      "Portra 系列是现代彩色负片中色彩稳定性最好的之一",
      "宽容度高，后期调整空间大"
    ]
  }
}
```

---

## 💻 使用示例

### 示例 1: React Native/TypeScript 应用集成

```typescript
// types/film-config.ts
interface FilmConfig {
  id: string;
  name: string;
  iso: number;
  type: string;
  modelParams: {
    T1: number;
    T2: number;
    p: number;
    logK: number;
    maxMultiplier: number;
  };
  colorShiftAdvice?: {
    enabled: boolean;
    timeRanges: Array<{
      range: string;
      shift: string;
      filter: string | null;
      filterDensity?: string;
      description?: string;
    }>;
    notes?: string[];
  };
}

// utils/filmDatabase.ts
import filmConfigData from '../film-reciprocity-config-enhanced.json';

export class FilmDatabase {
  private films: Map<string, FilmConfig>;

  constructor() {
    this.films = new Map();
    filmConfigData.films.forEach(category => {
      category.films.forEach(film => {
        this.films.set(film.id, film);
      });
    });
  }

  getFilmById(id: string): FilmConfig | undefined {
    return this.films.get(id);
  }

  getColorAdvice(filmId: string, exposureSeconds: number): string | null {
    const film = this.getFilmById(filmId);
    if (!film?.colorShiftAdvice?.enabled) return null;

    // 查找匹配的时间范围
    for (const range of film.colorShiftAdvice.timeRanges) {
      if (this.isInRange(exposureSeconds, range.range)) {
        return range.filter;
      }
    }
    return null;
  }

  private isInRange(seconds: number, rangeStr: string): boolean {
    // 解析范围字符串，如 "30s - 2min"
    // 实现逻辑...
  }
}

// 使用示例
const filmDB = new FilmDatabase();
const portra160 = filmDB.getFilmById('kodak_portra160');
const filterAdvice = filmDB.getColorAdvice('kodak_portra160', 120); // 2分钟曝光
console.log(filterAdvice); // "CC05M 或 CC10M"
```

### 示例 2: 计算倒易律补偿

```typescript
// utils/reciprocityCalculator.ts
export function calculateCorrectedTime(
  baseSeconds: number,
  params: { T1: number; T2: number; p: number; logK: number; maxMultiplier: number }
): number {
  const { T1, T2, p, logK, maxMultiplier } = params;

  // Zone A: t ≤ T1
  if (baseSeconds <= T1) {
    return baseSeconds + Math.pow(baseSeconds, p);
  }

  // Zone B: T1 < t ≤ T2
  if (baseSeconds <= T2) {
    const M_T1 = 1 + Math.pow((T1 - T1) / T1, p); // = 1
    const correctedT1 = T1 * M_T1; // = T1
    const additional = logK * Math.log10(baseSeconds / T1 + 1);
    return correctedT1 + additional;
  }

  // Zone C: t > T2
  const M_T2 = 1 + Math.pow((T2 - T1) / T1, p);
  const correctedT2 = T2 * M_T2;
  const logTerm = logK * Math.log10(baseSeconds / T1 + 1);
  const extrapolated = correctedT2 + logK * Math.log((baseSeconds - T2) / logK + 1);
  
  return Math.min(extrapolated, baseSeconds * maxMultiplier);
}

// 使用示例
const filmParams = portra160.modelParams;
const baseTime = 120; // 2分钟
const correctedTime = calculateCorrectedTime(baseTime, filmParams);
console.log(`基准曝光: ${baseTime}s, 校正后: ${correctedTime}s`);
```

### 示例 3: 生成用户友好的建议

```typescript
// components/ExposureAdviceCard.tsx
import React from 'react';
import { View, Text } from 'react-native';

interface Props {
  filmId: string;
  baseExposure: number;
}

export const ExposureAdviceCard: React.FC<Props> = ({ filmId, baseExposure }) => {
  const filmDB = new FilmDatabase();
  const film = filmDB.getFilmById(filmId);
  
  if (!film) return null;

  const correctedTime = calculateCorrectedTime(baseExposure, film.modelParams);
  const colorAdvice = filmDB.getColorAdvice(filmId, correctedTime);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{film.name}</Text>
      
      <View style={styles.row}>
        <Text>基准曝光: {baseExposure}s</Text>
        <Text>校正曝光: {correctedTime.toFixed(1)}s</Text>
      </View>

      {colorAdvice && (
        <View style={styles.colorAdvice}>
          <Text style={styles.warning}>⚠️ 色彩偏移建议</Text>
          <Text>推荐滤镜: {colorAdvice}</Text>
          <Text style={styles.hint}>
            {film.colorShiftAdvice?.notes?.[0]}
          </Text>
        </View>
      )}
    </View>
  );
};
```

### 示例 4: Python/Flask API 服务

```python
# app.py
from flask import Flask, jsonify, request
import json
import math

app = Flask(__name__)

# 加载配置文件
with open('film-reciprocity-config-enhanced.json', 'r', encoding='utf-8') as f:
    config_data = json.load(f)

# 构建胶片数据库
films_db = {}
for category in config_data['films']:
    for film in category['films']:
        films_db[film['id']] = film

def calculate_corrected_time(base_seconds, params):
    """计算倒易律补偿时间"""
    T1, T2, p, logK, maxM = (
        params['T1'], params['T2'], params['p'],
        params['logK'], params['maxMultiplier']
    )
    
    if base_seconds <= T1:
        return base_seconds + base_seconds ** p
    elif base_seconds <= T2:
        return T1 + logK * math.log10(base_seconds / T1 + 1)
    else:
        M_T2 = 1 + ((T2 - T1) / T1) ** p
        corrected_T2 = T2 * M_T2
        extrapolated = corrected_T2 + logK * math.log(
            (base_seconds - T2) / logK + 1
        )
        return min(extrapolated, base_seconds * maxM)

@app.route('/api/calculate', methods=['POST'])
def calculate():
    """
    POST /api/calculate
    Body: {
        "filmId": "kodak_portra160",
        "baseExposure": 120,
        "includeColorAdvice": true
    }
    """
    data = request.json
    film_id = data.get('filmId')
    base_exposure = data.get('baseExposure')
    
    film = films_db.get(film_id)
    if not film:
        return jsonify({'error': 'Film not found'}), 404
    
    corrected_time = calculate_corrected_time(
        base_exposure,
        film['modelParams']
    )
    
    response = {
        'filmName': film['name'],
        'baseExposure': base_exposure,
        'correctedExposure': round(corrected_time, 2),
        'multiplier': round(corrected_time / base_exposure, 2)
    }
    
    # 添加色彩建议
    if data.get('includeColorAdvice') and film.get('colorShiftAdvice', {}).get('enabled'):
        color_advice = get_color_advice(film, corrected_time)
        response['colorAdvice'] = color_advice
    
    return jsonify(response)

def get_color_advice(film, exposure_seconds):
    """获取色彩偏移建议"""
    if not film.get('colorShiftAdvice', {}).get('enabled'):
        return None
    
    for time_range in film['colorShiftAdvice']['timeRanges']:
        if is_in_range(exposure_seconds, time_range['range']):
            return {
                'shift': time_range['shift'],
                'filter': time_range.get('filter'),
                'description': time_range.get('description')
            }
    return None

def is_in_range(seconds, range_str):
    """检查曝光时间是否在范围内"""
    # 实现范围解析逻辑
    # 例如: "30s - 2min" -> (30, 120)
    pass

if __name__ == '__main__':
    app.run(debug=True)
```

### 示例 5: Node.js/Express API

```javascript
// server.js
const express = require('express');
const filmConfig = require('./film-reciprocity-config-enhanced.json');

const app = express();
app.use(express.json());

// 构建胶片索引
const filmsMap = new Map();
filmConfig.films.forEach(category => {
  category.films.forEach(film => {
    filmsMap.set(film.id, film);
  });
});

// 计算倒易律补偿
function calculateCorrectedTime(baseSeconds, params) {
  const { T1, T2, p, logK, maxMultiplier } = params;
  
  if (baseSeconds <= T1) {
    return baseSeconds + Math.pow(baseSeconds, p);
  } else if (baseSeconds <= T2) {
    return T1 + logK * Math.log10(baseSeconds / T1 + 1);
  } else {
    const M_T2 = 1 + Math.pow((T2 - T1) / T1, p);
    const correctedT2 = T2 * M_T2;
    const extrapolated = correctedT2 + logK * Math.log((baseSeconds - T2) / logK + 1);
    return Math.min(extrapolated, baseSeconds * maxMultiplier);
  }
}

// API 端点: 计算曝光补偿
app.post('/api/v1/reciprocity/calculate', (req, res) => {
  const { filmId, baseExposure } = req.body;
  
  const film = filmsMap.get(filmId);
  if (!film) {
    return res.status(404).json({ error: 'Film not found' });
  }
  
  const correctedTime = calculateCorrectedTime(baseExposure, film.modelParams);
  
  res.json({
    film: {
      id: film.id,
      name: film.name,
      iso: film.iso
    },
    exposure: {
      base: baseExposure,
      corrected: Math.round(correctedTime * 100) / 100,
      multiplier: Math.round((correctedTime / baseExposure) * 100) / 100
    },
    validation: film.validation
  });
});

// API 端点: 获取色彩建议
app.get('/api/v1/films/:filmId/color-advice', (req, res) => {
  const { filmId } = req.params;
  const { exposureTime } = req.query;
  
  const film = filmsMap.get(filmId);
  if (!film) {
    return res.status(404).json({ error: 'Film not found' });
  }
  
  if (!film.colorShiftAdvice?.enabled) {
    return res.json({ hasAdvice: false, reason: film.colorShiftAdvice?.reason });
  }
  
  const timeRanges = film.colorShiftAdvice.timeRanges;
  const matchedRange = timeRanges.find(range => 
    isInTimeRange(parseFloat(exposureTime), range.range)
  );
  
  res.json({
    hasAdvice: true,
    filmName: film.name,
    exposureTime: parseFloat(exposureTime),
    advice: matchedRange || null,
    notes: film.colorShiftAdvice.notes
  });
});

// API 端点: 列出所有胶片
app.get('/api/v1/films', (req, res) => {
  const { category, type } = req.query;
  
  let results = Array.from(filmsMap.values());
  
  if (category) {
    results = results.filter(f => f.category === category);
  }
  if (type) {
    results = results.filter(f => f.type === type);
  }
  
  res.json({
    total: results.length,
    films: results.map(f => ({
      id: f.id,
      name: f.name,
      iso: f.iso,
      type: f.type,
      category: f.category
    }))
  });
});

app.listen(3000, () => {
  console.log('Film Reciprocity API running on port 3000');
});
```

---

## 🎨 UI 集成建议

### 1. 胶片选择界面

```typescript
// FilmPicker.tsx
<ScrollView>
  {Object.entries(groupedFilms).map(([category, films]) => (
    <View key={category}>
      <Text style={styles.categoryHeader}>
        {getCategoryName(category)}
      </Text>
      {films.map(film => (
        <TouchableOpacity
          key={film.id}
          onPress={() => selectFilm(film)}
        >
          <View style={styles.filmItem}>
            <Text>{film.name}</Text>
            <Text style={styles.iso}>ISO {film.iso}</Text>
            {film.colorShiftAdvice?.enabled && (
              <Icon name="palette" color="orange" />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  ))}
</ScrollView>
```

### 2. 曝光计算结果显示

```typescript
// ExposureResult.tsx
<Card>
  <View style={styles.result}>
    <Text style={styles.label}>基准曝光</Text>
    <Text style={styles.value}>{formatTime(baseExposure)}</Text>
  </View>
  
  <Icon name="arrow-down" />
  
  <View style={styles.result}>
    <Text style={styles.label}>校正曝光</Text>
    <Text style={styles.value}>{formatTime(correctedExposure)}</Text>
  </View>
  
  <View style={styles.multiplier}>
    <Text>补偿倍数: {multiplier.toFixed(2)}×</Text>
  </View>
  
  {colorAdvice && (
    <Alert severity="warning" style={styles.colorAlert}>
      <Text style={styles.alertTitle}>色彩偏移警告</Text>
      <Text>预期偏移: {colorAdvice.shift}</Text>
      <Text>推荐滤镜: {colorAdvice.filter}</Text>
    </Alert>
  )}
</Card>
```

### 3. 滤镜建议面板

```typescript
// FilterAdvicePanel.tsx
{film.colorShiftAdvice?.enabled && (
  <View style={styles.panel}>
    <Text style={styles.panelTitle}>色彩偏移指南</Text>
    
    {film.colorShiftAdvice.timeRanges.map((range, idx) => (
      <View 
        key={idx}
        style={[
          styles.rangeItem,
          isCurrentRange(range) && styles.rangeActive
        ]}
      >
        <View style={styles.rangeHeader}>
          <Text style={styles.rangeTime}>{range.range}</Text>
          <Badge color={getShiftColor(range.shift)}>
            {range.shift}
          </Badge>
        </View>
        
        {range.filter && (
          <View style={styles.filterTag}>
            <Icon name="filter" />
            <Text>{range.filter}</Text>
          </View>
        )}
        
        <Text style={styles.rangeDesc}>{range.description}</Text>
      </View>
    ))}
    
    {film.colorShiftAdvice.notes && (
      <View style={styles.notes}>
        {film.colorShiftAdvice.notes.map((note, idx) => (
          <Text key={idx} style={styles.note}>
            • {note}
          </Text>
        ))}
      </View>
    )}
  </View>
)}
```

---

## 📚 滤镜系统说明

### CC 滤镜标准

**格式**: `CC[密度][颜色]`

**示例**: `CC10M` = 10单位洋红色滤镜

### 颜色代码

| 代码 | 颜色 | 用途 |
|-----|------|------|
| **M** | Magenta 洋红 | 补偿绿色偏移（Kodak 胶片常用） |
| **G** | Green 绿色 | 补偿洋红色偏移（Fuji 胶片常用） |
| **Y** | Yellow 黄色 | 补偿蓝色偏移 |
| **C** | Cyan 青色 | 补偿红色偏移 |
| **R** | Red 红色 | 补偿青色偏移 |
| **B** | Blue 蓝色 | 补偿黄色偏移 |

### 密度等级

常用: `05, 10, 15, 20, 25, 30, 40, 50`

**曝光补偿**: 每 10 单位约需 **+1/3 档**曝光

### 转换滤镜

- **85B**: 钨丝灯 (3200K) → 日光 (5500K)
  - 用于: Cinestill 800T 在日光下使用
  
- **80A**: 日光 (5500K) → 钨丝灯 (3200K)
  - 用于: 日光胶片在钨丝灯下使用

---

## ⚠️ 重要注意事项

### 1. 反转片特别警告

```json
{
  "colorShiftAdvice": {
    "severity": "critical"
  }
}
```

- ⚠️ 反转片对色彩偏移**极度敏感**
- 宽容度仅 **±0.5 档**
- 色彩偏移**无法后期校正**
- **不建议**超过 2 分钟的曝光
- **必须**在拍摄时使用滤镜校正

### 2. 黑白胶片

```json
{
  "colorShiftAdvice": {
    "enabled": false,
    "reason": "黑白胶片无需色彩校正"
  }
}
```

- 无色彩偏移问题
- 注意**反差变化**
- 长曝光需调整**显影时间**

### 3. Lomo/玩具胶片

```json
{
  "colorShiftAdvice": {
    "timeRanges": [{
      "shift": "完全不可预测",
      "filter": "不建议使用"
    }]
  }
}
```

- 色偏是**艺术特色**，不是缺陷
- 不要尝试校正
- 结果完全随机

---

## 🔧 开发工具

### 验证脚本

```bash
# 验证所有参数满足约束
node verify-params-from-ts.js

# 验证单调性
node verify-monotonicity.js
```

### 类型定义生成

```bash
# 从 JSON 生成 TypeScript 类型
npx quicktype film-reciprocity-config-enhanced.json \
  -o types/film-config.ts \
  --lang typescript
```

---

## 📖 参考资料

1. **核心文档**
   - [docs/all-films-verification.md](./all-films-verification.md) - 完整验证报告
   - [docs/parameter-adjustment-report.md](./parameter-adjustment-report.md) - 参数调整过程

2. **源代码**
   - [src/constants/Photography.ts](../src/constants/Photography.ts) - 实际实现
   - [adjust-parameters-v2.js](../adjust-parameters-v2.js) - 参数计算工具

3. **技术规范**
   - Segmented Damping Model 数学模型
   - M(T2) ≤ 1.3 × maxM 约束
   - C¹ 连续性要求

---

## 🆘 常见问题

### Q1: 为什么 Kodak 偏绿，Fuji 偏品红？

**A**: 这是两家公司不同的乳剂配方造成的：
- **Kodak**: 青色层在长曝光时衰减慢 → 偏绿/青
- **Fuji**: 洋红色层在长曝光时衰减慢 → 偏品红

### Q2: 数字校正 vs 物理滤镜，哪个更好？

**A**: 取决于胶片类型：
- **彩色负片**: 推荐**后期数字校正**（宽容度高）
- **反转片**: **必须使用物理滤镜**（无后期调整空间）
- **黑白片**: 无需色彩校正

### Q3: 能否用这个配置进行反向查询？

**A**: 可以！
```typescript
// 反向查询：给定目标曝光时间，计算所需的基准时间
function reverseCalculate(targetSeconds: number, params: ModelParams): number {
  // 使用二分查找或牛顿迭代法
  // ...
}
```

### Q4: 滤镜叠加会影响画质吗？

**A**: 会的：
- 每增加一片滤镜，**锐度降低约 5-10%**
- 建议最多叠加 **2-3 片**
- 使用高质量多层镀膜滤镜（如 B+W, Hoya）

### Q5: 这个模型适用于数字相机吗？

**A**: **不适用**。数字传感器：
- 无倒易律失效问题
- 长曝光主要问题是**热噪点**
- 使用**暗电流抑制**和**长曝光降噪**

---

## 📮 反馈与贡献

如果您发现任何错误或有改进建议，欢迎：

1. 提交 Issue
2. 创建 Pull Request
3. 提供实际拍摄数据验证

---

**生成日期**: 2026年1月12日  
**版本**: 1.0.0  
**作者**: GitHub Copilot  
**许可**: MIT
