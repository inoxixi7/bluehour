#!/usr/bin/env node

/**
 * 最终验证：检查调整后的参数是否消除了非单调性问题
 */

const fs = require('fs');
const path = require('path');

// Segmented Damping Model 计算函数
function calculateSegmentedCurve(T1, T2, p, logK, maxM) {
  const BASE_SECONDS = [1, 2, 4, 8, 15, 30, 60, 120, 240, 480, 900, 1800, 3600];
  
  return BASE_SECONDS.map(t => {
    let M;
    if (t <= T1) {
      M = 1;
    } else if (t <= T2) {
      M = 1 + Math.pow((t - T1) / T1, p);
    } else {
      const M_T2 = 1 + Math.pow((T2 - T1) / T1, p);
      const M_raw = M_T2 + Math.log(1 + (t - T2) / logK);
      M = Math.min(M_raw, maxM);
    }
    return {
      baseSeconds: t,
      correctedSeconds: Math.round(t * M),
      M: M
    };
  });
}

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
console.log('单调性验证 - 检查是否存在 Corrected(t₂) < Corrected(t₁) 的情况');
console.log('════════════════════════════════════════════════════════════════════════════════\n');

// 测试几个代表性胶片
const testFilms = [
  'kodak_portra160',  // C-41
  'kodak_tmax100',    // BW-Modern
  'kodak_trix',       // BW-Classic
  'kodak_e100',       // Slide (如果在文件中)
];

let allPassed = true;

testFilms.forEach(filmId => {
  const film = films.find(f => f.id === filmId);
  if (!film) {
    console.log(`⚠️ 未找到胶片: ${filmId}`);
    return;
  }
  
  const curve = calculateSegmentedCurve(film.T1, film.T2, film.p, film.logK, film.maxM);
  
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`📷 ${film.id} (${film.type})`);
  console.log(`   Parameters: T1=${film.T1}s, T2=${film.T2}s, p=${film.p}, logK=${film.logK}, maxM=${film.maxM}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
  // 检查单调性
  let hasMonotonicIssue = false;
  for (let i = 1; i < curve.length; i++) {
    const prev = curve[i - 1];
    const curr = curve[i];
    
    const prevTime = prev.baseSeconds >= 60 ? 
      (prev.baseSeconds >= 3600 ? `${(prev.baseSeconds / 3600).toFixed(1)}h` : `${prev.baseSeconds / 60}m`) : 
      `${prev.baseSeconds}s`;
    
    const prevCorrected = prev.correctedSeconds >= 60 ? 
      (prev.correctedSeconds >= 3600 ? `${(prev.correctedSeconds / 3600).toFixed(1)}h` : `${Math.round(prev.correctedSeconds / 60)}m`) : 
      `${prev.correctedSeconds}s`;
    
    const currTime = curr.baseSeconds >= 60 ? 
      (curr.baseSeconds >= 3600 ? `${(curr.baseSeconds / 3600).toFixed(1)}h` : `${curr.baseSeconds / 60}m`) : 
      `${curr.baseSeconds}s`;
    
    const currCorrected = curr.correctedSeconds >= 60 ? 
      (curr.correctedSeconds >= 3600 ? `${(curr.correctedSeconds / 3600).toFixed(1)}h` : `${Math.round(curr.correctedSeconds / 60)}m`) : 
      `${curr.correctedSeconds}s`;
    
    const status = curr.correctedSeconds >= prev.correctedSeconds ? '✓' : '✗';
    
    if (curr.correctedSeconds < prev.correctedSeconds) {
      hasMonotonicIssue = true;
      allPassed = false;
      console.log(`   ${status} ${prevTime.padEnd(5)} → ${prevCorrected.padEnd(8)} | ${currTime.padEnd(5)} → ${currCorrected.padEnd(8)} [NON-MONOTONIC!]`);
    }
  }
  
  if (!hasMonotonicIssue) {
    console.log(`   ✓ 所有曲线点单调递增，无回落现象\n`);
  } else {
    console.log(`   ✗ 发现单调性违反！\n`);
  }
  
  // 显示完整曲线
  console.log(`   Base → Corrected (M multiplier)`);
  curve.forEach(point => {
    const baseTime = point.baseSeconds >= 60 ? 
      (point.baseSeconds >= 3600 ? `${(point.baseSeconds / 3600).toFixed(1)}h` : `${point.baseSeconds / 60}m`) : 
      `${point.baseSeconds}s`;
    
    const correctedTime = point.correctedSeconds >= 60 ? 
      (point.correctedSeconds >= 3600 ? `${(point.correctedSeconds / 3600).toFixed(1)}h` : `${Math.round(point.correctedSeconds / 60)}m`) : 
      `${point.correctedSeconds}s`;
    
    const capped = point.M === film.maxM && point.baseSeconds > film.T2 ? ' [AT_CAP]' : '';
    console.log(`   ${baseTime.padStart(7)} → ${correctedTime.padEnd(8)} (M=${point.M.toFixed(3)})${capped}`);
  });
  
  console.log();
});

console.log('════════════════════════════════════════════════════════════════════════════════');
if (allPassed) {
  console.log('✓ 所有测试胶片的曲线均单调递增！');
  console.log('✓ 参数调整成功，满足所有约束条件！');
} else {
  console.log('✗ 某些胶片仍存在单调性问题！');
}
console.log('════════════════════════════════════════════════════════════════════════════════');
