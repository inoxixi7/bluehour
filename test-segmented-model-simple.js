/**
 * 简单的JavaScript测试 - 验证Segmented Model倒易率计算
 */

// Segmented Damping Model 计算函数
function calculateSegmentedMultiplier(t, params) {
  const { T1, T2, p, logK, maxMultiplier } = params;
  let M;

  if (t <= T1) {
    // Segment 1: Toe - 无补偿
    M = 1;
  } else if (t <= T2) {
    // Segment 2: Mid - 非线性增长
    M = 1 + Math.pow((t - T1) / T1, p);
    M = Math.min(M, maxMultiplier);
  } else {
    // Segment 3: Shoulder - 对数阻尼
    const M_T2_raw = 1 + Math.pow((T2 - T1) / T1, p);
    const M_T2 = Math.min(M_T2_raw, maxMultiplier);
    const M_raw = M_T2 + Math.log(1 + (t - T2) / logK);
    M = Math.min(M_raw, maxMultiplier);
  }

  return M;
}

// 测试用例
const testFilms = [
  {
    name: 'Kodak Tri-X (Classic B&W)',
    params: { T1: 10, T2: 120, p: 0.79, logK: 37, maxMultiplier: 8 },
    color: '\x1b[33m' // 黄色
  },
  {
    name: 'Kodak T-Max 100 (Modern B&W)',
    params: { T1: 60, T2: 600, p: 0.44, logK: 10, maxMultiplier: 3 },
    color: '\x1b[36m' // 青色
  },
  {
    name: 'Kodak Portra 400 (C-41)',
    params: { T1: 30, T2: 300, p: 0.56, logK: 17, maxMultiplier: 4 },
    color: '\x1b[35m' // 品红
  },
  {
    name: 'Kodak Ektachrome E100 (Slide)',
    params: { T1: 4, T2: 90, p: 0.31, logK: 10, maxMultiplier: 3 },
    color: '\x1b[32m' // 绿色
  }
];

const testTimes = [1, 2, 4, 8, 15, 30, 60, 120, 240, 480, 900, 1800, 3600];

console.log('\n' + '═'.repeat(80));
console.log('🎞️  Segmented Damping Model - 倒易率计算验证');
console.log('═'.repeat(80));
console.log('\n测试时间点:', testTimes.join(', '), '秒\n');

let allTestsPassed = true;

for (const film of testFilms) {
  console.log(`${film.color}%s\x1b[0m`, `\n📷 ${film.name}`);
  console.log(`   参数: T1=${film.params.T1}s, T2=${film.params.T2}s, p=${film.params.p}, logK=${film.params.logK}, maxM=${film.params.maxMultiplier}`);
  console.log('\n   基础时间 | 倍率(M) | 校正时间 | 状态');
  console.log('   ' + '-'.repeat(50));

  let prevCorrected = 0;
  let monotonic = true;

  for (const t of testTimes) {
    const M = calculateSegmentedMultiplier(t, film.params);
    const corrected = Math.round(t * M);
    
    // 检查单调性
    let status = '✓';
    if (corrected < prevCorrected) {
      status = '✗ 非单调!';
      monotonic = false;
      allTestsPassed = false;
    }
    
    // 检查是否达到maxM上限
    if (Math.abs(M - film.params.maxMultiplier) < 0.01) {
      status += ' (达到上限)';
    }

    const baseStr = t.toString().padStart(10);
    const multStr = M.toFixed(3).padStart(7);
    const corrStr = corrected.toString().padStart(10);

    console.log(`   ${baseStr}s | ${multStr} | ${corrStr}s | ${status}`);
    
    prevCorrected = corrected;
  }

  if (monotonic) {
    console.log(`\n   ✅ 单调性检查: 通过`);
  } else {
    console.log(`\n   ❌ 单调性检查: 失败`);
  }
}

console.log('\n' + '═'.repeat(80));
console.log('关键特性验证:');
console.log('═'.repeat(80));

// 验证关键特性
const features = [];

// 1. 短曝光时无补偿 (M=1)
const shortExposure = calculateSegmentedMultiplier(1, testFilms[0].params);
features.push({
  name: '短曝光无补偿 (1s, M应该=1)',
  passed: Math.abs(shortExposure - 1.0) < 0.01,
  value: `M=${shortExposure.toFixed(3)}`
});

// 2. Classic vs Modern 差异
const classicM = calculateSegmentedMultiplier(120, testFilms[0].params);
const modernM = calculateSegmentedMultiplier(120, testFilms[1].params);
features.push({
  name: 'Classic B&W 倒易失效强于 Modern (120s)',
  passed: classicM > modernM * 1.5,
  value: `Classic M=${classicM.toFixed(2)}, Modern M=${modernM.toFixed(2)}`
});

// 3. maxM 限制有效
const longExposure = calculateSegmentedMultiplier(7200, testFilms[0].params);
features.push({
  name: 'maxM 限制有效 (2小时曝光)',
  passed: longExposure <= testFilms[0].params.maxMultiplier,
  value: `M=${longExposure.toFixed(2)}, maxM=${testFilms[0].params.maxMultiplier}`
});

// 4. 彩色负片适中补偿
const colorM = calculateSegmentedMultiplier(240, testFilms[2].params);
features.push({
  name: 'C-41彩色负片适中补偿 (240s)',
  passed: colorM >= 1.5 && colorM <= 4.5,
  value: `M=${colorM.toFixed(2)}`
});

// 5. 反转片最小补偿
const slideM = calculateSegmentedMultiplier(240, testFilms[3].params);
features.push({
  name: 'E-6反转片最小补偿 (240s)',
  passed: slideM >= 1.2 && slideM <= 3.5,
  value: `M=${slideM.toFixed(2)}`
});

console.log();
for (const feature of features) {
  const status = feature.passed ? '✅' : '❌';
  console.log(`${status} ${feature.name}`);
  console.log(`   ${feature.value}`);
}

console.log('\n' + '═'.repeat(80));
if (allTestsPassed && features.every(f => f.passed)) {
  console.log('✅ 所有测试通过! Segmented Model 计算准确。');
} else {
  console.log('⚠️  部分测试失败，需要调整参数。');
}
console.log('═'.repeat(80));
console.log();

process.exit(allTestsPassed && features.every(f => f.passed) ? 0 : 1);
