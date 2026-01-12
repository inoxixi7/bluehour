#!/usr/bin/env node

/**
 * 从 Photography.ts 文件中提取参数并验证是否满足约束
 */

const fs = require('fs');
const path = require('path');

// 读取 Photography.ts 文件
const filePath = path.join(__dirname, 'src/constants/Photography.ts');
const content = fs.readFileSync(filePath, 'utf-8');

// 提取所有 createSegmentedCurve 调用
const regex = /id: '([^']+)',[\s\S]*?createSegmentedCurve\(\{ type: '([^']+)', T1: (\d+), T2: (\d+), p: ([\d.]+), logK: (\d+), maxMultiplier: (\d+) \}\)/g;

const films = [];
let match;
while ((match = regex.exec(content)) !== null) {
  const [, id, type, T1, T2, p, logK, maxM] = match;
  films.push({
    id,
    type,
    T1: parseInt(T1),
    T2: parseInt(T2),
    p: parseFloat(p),
    logK: parseInt(logK),
    maxM: parseInt(maxM)
  });
}

console.log('════════════════════════════════════════════════════════════════════════════════');
console.log(`从 Photography.ts 提取到 ${films.length} 个胶片参数`);
console.log('验证 M(T2) ≤ 1.3 × maxM 约束');
console.log('════════════════════════════════════════════════════════════════════════════════\n');

// 计算 M(T2)
function calculateMT2(T1, T2, p) {
  return 1 + Math.pow((T2 - T1) / T1, p);
}

let passedCount = 0;
let failedCount = 0;

films.forEach(film => {
  const M_T2 = calculateMT2(film.T1, film.T2, film.p);
  const threshold = 1.3 * film.maxM;
  const passed = M_T2 <= threshold;
  
  if (passed) {
    passedCount++;
  } else {
    failedCount++;
  }
  
  const status = passed ? '✓' : '✗';
  console.log(`${status} ${film.id.padEnd(30)} | M(T2)=${M_T2.toFixed(3)} | threshold=${threshold.toFixed(3)} | type=${film.type}`);
});

console.log('\n════════════════════════════════════════════════════════════════════════════════');
console.log(`验证结果: ${passedCount}/${films.length} 通过`);
if (passedCount === films.length) {
  console.log('✓ 所有参数满足约束！');
} else {
  console.log(`⚠️ 仍有 ${failedCount} 个胶片违反约束`);
}
console.log('════════════════════════════════════════════════════════════════════════════════');
