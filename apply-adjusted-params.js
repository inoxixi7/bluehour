#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 调整后的参数（从 adjust-parameters-v2.js 的输出）
const adjustedParams = {
  // C-41 彩色负片
  'kodak_50d': { T1: 30, T2: 300, p: 0.56, logK: 14, maxM: 4 },
  'kodak_250d': { T1: 30, T2: 300, p: 0.56, logK: 15, maxM: 4 },
  'kodak_500t': { T1: 30, T2: 300, p: 0.56, logK: 16, maxM: 4 },
  'kodak_portra160': { T1: 30, T2: 300, p: 0.56, logK: 17, maxM: 4 },
  'kodak_portra400': { T1: 30, T2: 300, p: 0.56, logK: 17, maxM: 4 },
  'kodak_portra800': { T1: 30, T2: 300, p: 0.56, logK: 18, maxM: 4 },
  'kodak_ektar100': { T1: 30, T2: 240, p: 0.63, logK: 21, maxM: 4 },
  'kodak_gold200': { T1: 20, T2: 240, p: 0.6, logK: 22, maxM: 5 },
  'fuji_superia100': { T1: 25, T2: 240, p: 0.57, logK: 17, maxM: 4 },
  'fuji_superia200': { T1: 25, T2: 240, p: 0.57, logK: 17, maxM: 4 },
  'fuji_superia400': { T1: 25, T2: 240, p: 0.57, logK: 18, maxM: 4 },
  'fuji_superia1600': { T1: 20, T2: 240, p: 0.6, logK: 21, maxM: 5 },
  'fuji_c200': { T1: 25, T2: 240, p: 0.57, logK: 17, maxM: 4 },
  'fuji_pro160c': { T1: 25, T2: 240, p: 0.57, logK: 17, maxM: 4 },
  'fuji_pro160ns': { T1: 25, T2: 240, p: 0.57, logK: 17, maxM: 4 },
  'fuji_pro400h': { T1: 20, T2: 240, p: 0.6, logK: 19, maxM: 5 },
  'fuji_xtra400': { T1: 25, T2: 240, p: 0.57, logK: 18, maxM: 4 },
  'fuji_nexia400': { T1: 25, T2: 240, p: 0.57, logK: 18, maxM: 4 },
  'fuji_64t': { T1: 20, T2: 180, p: 0.44, logK: 11, maxM: 3 },
  'cinestill_800t': { T1: 30, T2: 300, p: 0.56, logK: 15, maxM: 4 },
  'holga_400': { T1: 20, T2: 240, p: 0.6, logK: 22, maxM: 5 },
  'lomo_cn800': { T1: 15, T2: 200, p: 0.65, logK: 27, maxM: 6 },
  
  // BW-Modern 现代黑白
  'kodak_tmax100': { T1: 60, T2: 600, p: 0.44, logK: 10, maxM: 3 },
  'kodak_tmax400': { T1: 45, T2: 600, p: 0.51, logK: 12, maxM: 4 },
  'kodak_tmax3200': { T1: 45, T2: 600, p: 0.51, logK: 13, maxM: 4 },
  'ilford_delta100': { T1: 60, T2: 600, p: 0.44, logK: 10, maxM: 3 },
  'ilford_delta400': { T1: 45, T2: 600, p: 0.51, logK: 13, maxM: 4 },
  'ilford_delta3200': { T1: 45, T2: 600, p: 0.51, logK: 13, maxM: 4 },
  'fuji_acros2': { T1: 120, T2: 900, p: 0.51, logK: 10, maxM: 3 },
  
  // BW-Classic 传统黑白
  'kodak_trix320': { T1: 10, T2: 120, p: 0.79, logK: 37, maxM: 8 },
  'kodak_trix400': { T1: 10, T2: 120, p: 0.79, logK: 37, maxM: 8 },
  'ilford_hp5': { T1: 12, T2: 180, p: 0.72, logK: 34, maxM: 8 },
  'ilford_fp4': { T1: 10, T2: 120, p: 0.68, logK: 28, maxM: 6 },
  'ilford_panf': { T1: 6, T2: 60, p: 1.02, logK: 48, maxM: 10 },
  'ilford_xp2': { T1: 25, T2: 240, p: 0.57, logK: 19, maxM: 4 },
  'ilford_sfx': { T1: 12, T2: 150, p: 0.78, logK: 38, maxM: 8 },
  'ilford_kentmere100': { T1: 10, T2: 120, p: 0.68, logK: 28, maxM: 6 },
  'ilford_kentmere400': { T1: 12, T2: 180, p: 0.72, logK: 33, maxM: 8 },
  'fuji_neopan': { T1: 12, T2: 180, p: 0.72, logK: 33, maxM: 8 },
  
  // Slide 反转片
  'kodak_ektachrome_e100': { T1: 4, T2: 90, p: 0.31, logK: 10, maxM: 3 },
  'fuji_provia400x': { T1: 4, T2: 75, p: 0.45, logK: 10, maxM: 4 },
  'fuji_sensia200': { T1: 4, T2: 80, p: 0.44, logK: 10, maxM: 4 },
  'fuji_t64': { T1: 3, T2: 60, p: 0.44, logK: 11, maxM: 4 },
};

const filePath = path.join(__dirname, 'src/constants/Photography.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// 替换所有 createSegmentedCurve 调用
Object.entries(adjustedParams).forEach(([id, params]) => {
  // 匹配模式：createSegmentedCurve({ type: 'xxx', T1: X, T2: Y, p: Z, logK: K, maxMultiplier: M })
  // 需要找到对应的 id 然后替换其后的参数行
  
  // 构造正则表达式，匹配 id 后面的 createSegmentedCurve 调用
  const regex = new RegExp(
    `(id: '${id}',[\\s\\S]*?curve: createSegmentedCurve\\(\\{ type: '[^']+', )T1: \\d+, T2: \\d+, p: [\\d.]+, logK: \\d+, maxMultiplier: \\d+`,
    'g'
  );
  
  const replacement = `$1T1: ${params.T1}, T2: ${params.T2}, p: ${params.p}, logK: ${params.logK}, maxMultiplier: ${params.maxM}`;
  
  content = content.replace(regex, replacement);
});

fs.writeFileSync(filePath, content, 'utf-8');
console.log('✓ 参数更新完成！');
console.log(`✓ 共更新 ${Object.keys(adjustedParams).length} 个胶片参数`);
