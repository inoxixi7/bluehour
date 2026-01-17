/**
 * 测试 Segmented Model 的倒易率计算
 * 验证新的计算方法是否准确
 */

import { calculateSegmentedMultiplier } from './src/utils/photographyCalculations';
import { RECIPROCITY_PROFILES } from './src/constants/Photography';

// 测试用例 - 关键胶片的关键曝光时间
const testCases = [
  {
    filmName: 'Kodak Tri-X (Classic B&W)',
    filmId: 'kodak_trix',
    testPoints: [
      { base: 1, expectedMultiplier: 1.0 },
      { base: 10, expectedMultiplier: 1.0 },  // T1 边界
      { base: 30, expectedRange: [1.5, 2.5] },
      { base: 60, expectedRange: [2.0, 3.5] },
      { base: 120, expectedRange: [2.5, 4.5] },  // T2 边界
      { base: 480, expectedRange: [4.0, 7.0] },
      { base: 1800, expectedRange: [5.0, 8.0] },
      { base: 3600, expectedRange: [5.5, 8.0] },  // maxM 限制
    ]
  },
  {
    filmName: 'Kodak T-Max 100 (Modern B&W)',
    filmId: 'kodak_tmax100',
    testPoints: [
      { base: 1, expectedMultiplier: 1.0 },
      { base: 60, expectedMultiplier: 1.0 },  // T1 边界
      { base: 120, expectedRange: [1.1, 1.5] },
      { base: 480, expectedRange: [1.5, 2.5] },
      { base: 1800, expectedRange: [2.0, 3.0] },
      { base: 3600, expectedRange: [2.2, 3.0] },  // maxM 限制
    ]
  },
  {
    filmName: 'Kodak Portra 400 (C-41)',
    filmId: 'kodak_portra400',
    testPoints: [
      { base: 1, expectedMultiplier: 1.0 },
      { base: 30, expectedMultiplier: 1.0 },  // T1 边界
      { base: 60, expectedRange: [1.1, 1.6] },
      { base: 120, expectedRange: [1.3, 2.0] },
      { base: 480, expectedRange: [2.0, 3.5] },
      { base: 1800, expectedRange: [2.5, 4.0] },
      { base: 3600, expectedRange: [3.0, 4.0] },  // maxM 限制
    ]
  },
  {
    filmName: 'Kodak Ektachrome E100 (Slide)',
    filmId: 'kodak_e100',
    testPoints: [
      { base: 1, expectedMultiplier: 1.0 },
      { base: 4, expectedMultiplier: 1.0 },  // T1 边界
      { base: 15, expectedRange: [1.05, 1.3] },
      { base: 60, expectedRange: [1.2, 1.8] },
      { base: 120, expectedRange: [1.4, 2.2] },
      { base: 480, expectedRange: [1.8, 2.8] },
      { base: 1800, expectedRange: [2.2, 3.0] },
      { base: 3600, expectedRange: [2.4, 3.0] },  // maxM 限制
    ]
  }
];

console.log('═'.repeat(80));
console.log('Segmented Damping Model - 倒易律计算测试');
console.log('═'.repeat(80));
console.log();

let totalTests = 0;
let passedTests = 0;

for (const testCase of testCases) {
  console.log(`\n📷 ${testCase.filmName}`);
  console.log('-'.repeat(80));
  
  // 查找胶片配置
  const filmProfile = RECIPROCITY_PROFILES.find(p => p.id === testCase.filmId);
  
  if (!filmProfile || !filmProfile.segmentParams) {
    console.log(`  ❌ 找不到胶片配置或参数: ${testCase.filmId}`);
    continue;
  }
  
  const params = filmProfile.segmentParams;
  console.log(`  参数: T1=${params.T1}s, T2=${params.T2}s, p=${params.p}, logK=${params.logK}, maxM=${params.maxMultiplier}`);
  console.log();
  
  console.log('  基础时间 | 计算倍率 | 校正时间 | 预期范围   | 状态');
  console.log('  ' + '-'.repeat(72));
  
  for (const point of testCase.testPoints) {
    totalTests++;
    const multiplier = calculateSegmentedMultiplier(point.base, params);
    const corrected = Math.round(point.base * multiplier);
    
    let passed = false;
    let expectedStr = '';
    
    if ('expectedMultiplier' in point && point.expectedMultiplier !== undefined) {
      // 精确匹配
      passed = Math.abs(multiplier - point.expectedMultiplier) < 0.01;
      expectedStr = `M=${point.expectedMultiplier.toFixed(2)}`;
    } else if ('expectedRange' in point && point.expectedRange !== undefined) {
      // 范围匹配
      const [min, max] = point.expectedRange;
      passed = multiplier >= min && multiplier <= max;
      expectedStr = `M=${min.toFixed(1)}-${max.toFixed(1)}`;
    }
    
    if (passed) passedTests++;
    
    const status = passed ? '✓' : '✗';
    const baseStr = point.base.toString().padStart(9);
    const multStr = multiplier.toFixed(3).padStart(8);
    const corrStr = corrected.toString().padStart(8);
    const expStr = expectedStr.padEnd(10);
    
    console.log(`  ${baseStr}s | ${multStr} | ${corrStr}s | ${expStr} | ${status}`);
  }
}

console.log('\n' + '═'.repeat(80));
console.log(`测试结果: ${passedTests}/${totalTests} 通过 (${((passedTests/totalTests)*100).toFixed(1)}%)`);
console.log('═'.repeat(80));

// 对比测试 - 验证单调性和平滑性
console.log('\n\n对比测试 - 单调性和平滑性验证');
console.log('═'.repeat(80));

const monotonicityTestFilms = ['kodak_trix', 'kodak_portra400', 'kodak_e100'];
const testTimes = [1, 2, 4, 8, 15, 30, 60, 120, 240, 480, 900, 1800, 3600];

for (const filmId of monotonicityTestFilms) {
  const profile = RECIPROCITY_PROFILES.find(p => p.id === filmId);
  if (!profile || !profile.segmentParams) continue;
  
  console.log(`\n📷 ${profile.id}:`);
  
  let prevCorrected = 0;
  let monotonic = true;
  let maxJump = 0;
  
  for (const t of testTimes) {
    const M = calculateSegmentedMultiplier(t, profile.segmentParams);
    const corrected = Math.round(t * M);
    
    if (corrected < prevCorrected) {
      monotonic = false;
      console.log(`  ❌ 单调性失败: ${prevCorrected}s → ${corrected}s`);
    }
    
    if (prevCorrected > 0) {
      const jump = corrected / prevCorrected;
      maxJump = Math.max(maxJump, jump);
    }
    
    prevCorrected = corrected;
  }
  
  if (monotonic) {
    console.log(`  ✓ 单调性: 通过`);
  }
  console.log(`  ✓ 最大跳变比: ${maxJump.toFixed(2)}x`);
}

console.log('\n' + '═'.repeat(80));
console.log('✅ 测试完成！');
console.log('═'.repeat(80));

process.exit(passedTests === totalTests ? 0 : 1);
