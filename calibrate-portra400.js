/**
 * 根据实际数据反推 Kodak Portra 400 的正确参数
 */

function calculateSegmentedMultiplier(t, params) {
  const { T1, T2, p, logK, maxMultiplier } = params;
  let M;

  if (t <= T1) {
    M = 1;
  } else if (t <= T2) {
    M = 1 + Math.pow((t - T1) / T1, p);
    M = Math.min(M, maxMultiplier);
  } else {
    const M_T2_raw = 1 + Math.pow((T2 - T1) / T1, p);
    const M_T2 = Math.min(M_T2_raw, maxMultiplier);
    const M_raw = M_T2 + Math.log(1 + (t - T2) / logK);
    M = Math.min(M_raw, maxMultiplier);
  }

  return M;
}

console.log('═'.repeat(80));
console.log('🔍 Kodak Portra 400 参数调整 - 基于实际数据');
console.log('═'.repeat(80));
console.log();

// 已知数据点
const knownData = {
  baseTime: 1800,  // 30分钟
  correctedTime: 22740,  // 6h19m = 22740秒
  expectedMultiplier: 22740 / 1800  // 12.63x
};

console.log('📊 已知数据:');
console.log(`  基础曝光: ${knownData.baseTime}秒 (30分钟)`);
console.log(`  校正后: ${knownData.correctedTime}秒 (6小时19分钟)`);
console.log(`  需要的倍率: ${knownData.expectedMultiplier.toFixed(2)}x`);
console.log();

// 测试不同的参数组合
const testParams = [
  {
    name: '当前参数 (错误)',
    params: { T1: 30, T2: 300, p: 0.56, logK: 17, maxMultiplier: 4 }
  },
  {
    name: '调整1: 提高maxM到15',
    params: { T1: 30, T2: 300, p: 0.56, logK: 17, maxMultiplier: 15 }
  },
  {
    name: '调整2: 提高maxM+调整logK',
    params: { T1: 30, T2: 300, p: 0.56, logK: 50, maxMultiplier: 15 }
  },
  {
    name: '调整3: 提高maxM+调整T2和logK',
    params: { T1: 30, T2: 240, p: 0.65, logK: 60, maxMultiplier: 15 }
  },
  {
    name: '调整4: C-41典型参数',
    params: { T1: 30, T2: 240, p: 0.70, logK: 45, maxMultiplier: 15 }
  },
  {
    name: '调整5: 更激进的增长',
    params: { T1: 30, T2: 180, p: 0.85, logK: 35, maxMultiplier: 15 }
  }
];

console.log('测试不同参数组合:');
console.log('═'.repeat(80));

for (const test of testParams) {
  const M = calculateSegmentedMultiplier(knownData.baseTime, test.params);
  const corrected = Math.round(knownData.baseTime * M);
  const correctedHours = (corrected / 3600).toFixed(2);
  const error = Math.abs(corrected - knownData.correctedTime);
  const errorPercent = ((error / knownData.correctedTime) * 100).toFixed(1);
  
  const isGood = error < 1800; // 误差小于30分钟
  const status = isGood ? '✓' : '✗';
  
  console.log(`\n${status} ${test.name}`);
  console.log(`   参数: T1=${test.params.T1}, T2=${test.params.T2}, p=${test.params.p}, logK=${test.params.logK}, maxM=${test.params.maxMultiplier}`);
  console.log(`   倍率: ${M.toFixed(2)}x`);
  console.log(`   结果: ${corrected}秒 (${correctedHours}小时)`);
  console.log(`   误差: ${error}秒 (${errorPercent}%)`);
}

console.log('\n' + '═'.repeat(80));
console.log('推荐参数分析:');
console.log('═'.repeat(80));

// 详细测试推荐参数
const recommendedParams = { T1: 30, T2: 180, p: 0.85, logK: 35, maxMultiplier: 15 };

console.log('\n推荐参数: T1=30, T2=180, p=0.85, logK=35, maxM=15');
console.log('\n多个时间点验证:');
console.log('基础时间 | 倍率(M) | 校正时间');
console.log('-'.repeat(50));

const testTimes = [30, 60, 120, 240, 480, 900, 1800, 3600];
for (const t of testTimes) {
  const M = calculateSegmentedMultiplier(t, recommendedParams);
  const corr = Math.round(t * M);
  const tMin = (t / 60).toFixed(0);
  const corrMin = (corr / 60).toFixed(0);
  const corrHr = (corr / 3600).toFixed(1);
  
  let timeStr = corrMin < 60 ? `${corrMin}分` : `${corrHr}小时`;
  
  const highlight = t === 1800 ? ' ← 目标' : '';
  console.log(`${tMin.padStart(6)}分 | ${M.toFixed(2).padStart(5)} | ${timeStr.padEnd(10)}${highlight}`);
}

console.log('\n' + '═'.repeat(80));
