/**
 * 进一步调整参数以匹配 6h19m 的目标
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

const target = 22740; // 6h19m
const baseTime = 1800; // 30min

console.log('═'.repeat(80));
console.log('🎯 精确校准 Kodak Portra 400 参数');
console.log('═'.repeat(80));
console.log(`目标: ${baseTime}秒 (30分) → ${target}秒 (6h19m) = ${(target/baseTime).toFixed(2)}x`);
console.log('═'.repeat(80));
console.log();

// 测试更多参数组合
const tests = [
  { T1: 30, T2: 120, p: 1.05, logK: 25, maxMultiplier: 18 },
  { T1: 30, T2: 120, p: 1.10, logK: 20, maxMultiplier: 18 },
  { T1: 30, T2: 120, p: 1.15, logK: 18, maxMultiplier: 18 },
  { T1: 20, T2: 120, p: 1.00, logK: 22, maxMultiplier: 16 },
  { T1: 25, T2: 150, p: 0.95, logK: 28, maxMultiplier: 16 },
  { T1: 30, T2: 180, p: 0.90, logK: 30, maxMultiplier: 16 },
  { T1: 30, T2: 150, p: 1.00, logK: 25, maxMultiplier: 16 },
  { T1: 30, T2: 120, p: 1.20, logK: 15, maxMultiplier: 20 },
];

let bestParams = null;
let bestError = Infinity;

for (const params of tests) {
  const M = calculateSegmentedMultiplier(baseTime, params);
  const result = Math.round(baseTime * M);
  const error = Math.abs(result - target);
  const errorPercent = ((error / target) * 100).toFixed(1);
  
  if (error < bestError) {
    bestError = error;
    bestParams = params;
  }
  
  const status = error < 1200 ? '✓✓' : error < 2400 ? '✓ ' : '✗ ';
  
  console.log(`${status} T1=${params.T1}, T2=${params.T2}, p=${params.p}, logK=${params.logK}, maxM=${params.maxMultiplier}`);
  console.log(`   倍率=${M.toFixed(2)}x → ${result}秒 (${(result/3600).toFixed(2)}h) | 误差: ${error}秒 (${errorPercent}%)`);
}

console.log('\n' + '═'.repeat(80));
console.log(`🏆 最佳匹配参数: T1=${bestParams.T1}, T2=${bestParams.T2}, p=${bestParams.p}, logK=${bestParams.logK}, maxM=${bestParams.maxMultiplier}`);
console.log('═'.repeat(80));

// 验证最佳参数在多个时间点
console.log('\n多时间点验证:');
console.log('基础时间 | 倍率(M) | 校正时间        | 说明');
console.log('-'.repeat(70));

const testTimes = [
  { t: 30, name: '30秒' },
  { t: 60, name: '1分钟' },
  { t: 120, name: '2分钟' },
  { t: 240, name: '4分钟' },
  { t: 480, name: '8分钟' },
  { t: 900, name: '15分钟' },
  { t: 1800, name: '30分钟' },
  { t: 3600, name: '1小时' }
];

for (const { t, name } of testTimes) {
  const M = calculateSegmentedMultiplier(t, bestParams);
  const corr = Math.round(t * M);
  const corrStr = corr < 60 ? `${corr}秒` : 
                  corr < 3600 ? `${(corr/60).toFixed(0)}分` : 
                  `${(corr/3600).toFixed(1)}小时`;
  
  const highlight = t === 1800 ? '← 目标匹配点' : '';
  console.log(`${name.padEnd(8)} | ${M.toFixed(2).padStart(6)} | ${corrStr.padEnd(14)} | ${highlight}`);
}

console.log('═'.repeat(80));
