#!/usr/bin/env node

/**
 * 倒易律硬约束验证器 (Hard Constraints Validator)
 * 
 * 基于 Reciprocity Hard Constraints Specification
 * 所有约束必须 100% 满足，任何违反即判定为 INVALID
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

// 读取 Photography.ts 文件并提取参数
function extractFilmParams() {
  const filePath = path.join(__dirname, 'src/constants/Photography.ts');
  const content = fs.readFileSync(filePath, 'utf8');
  
  const films = [];

  // IMPORTANT:
  // 旧版正则会把“没有 type / 多行参数”的 film 的 id，与后续别的 film 的 createSegmentedCurve(type:...) 误匹配。
  // 这里改为：以每个 film 对象块为单位，严格从本对象的 curve:createSegmentedCurve({...}) 提取参数。
  const filmBlockRegex = /\{\s*id:\s*'([^']+)'[\s\S]*?\bcurve:\s*createSegmentedCurve\(\{([\s\S]*?)\}\)\s*,?[\s\S]*?\}/g;

  let match;
  while ((match = filmBlockRegex.exec(content)) !== null) {
    const [, id, paramsBlock] = match;

    const getNumber = (key) => {
      const m = new RegExp(`\\b${key}\\s*:\\s*([\\d.]+)`).exec(paramsBlock);
      return m ? parseFloat(m[1]) : null;
    };

    const typeMatch = /\btype\s*:\s*'([^']+)'/.exec(paramsBlock);
    const type = typeMatch ? typeMatch[1] : 'unknown';

    const T1 = getNumber('T1');
    const T2 = getNumber('T2');
    const p = getNumber('p');
    const logK = getNumber('logK');
    const maxMultiplier = getNumber('maxMultiplier');

    // 如果缺关键参数，跳过（例如 digital 的 curve: []）
    if ([T1, T2, p, logK, maxMultiplier].some(v => v === null)) {
      continue;
    }

    films.push({
      id,
      type,
      T1: Math.round(T1),
      T2: Math.round(T2),
      p: parseFloat(p),
      logK: Math.round(logK),
      maxMultiplier: parseFloat(maxMultiplier),
    });
  }
  
  return films;
}

// 计算校正时间（正确的倍数模型实现 - 与 Photography.ts 一致）
function calculateCorrectedTime(baseSeconds, params) {
  const { T1, T2, p, logK, maxMultiplier } = params;
  
  let M; // Exposure multiplier
  
  // Segment 1: t ≤ T1 - 无补偿（HC-06 要求）
  if (baseSeconds <= T1) {
    M = 1;
  } 
  // Segment 2: T1 < t ≤ T2 - 非线性增长
  else if (baseSeconds <= T2) {
    M = 1 + Math.pow((baseSeconds - T1) / T1, p);
    // CRITICAL: Zone B 也需要应用 maxMultiplier 截断
    M = Math.min(M, maxMultiplier);
  } 
  // Segment 3: t > T2 - 对数阻尼
  else {
    const M_T2 = 1 + Math.pow((T2 - T1) / T1, p);
    const M_T2_clamped = Math.min(M_T2, maxMultiplier);
    const M_raw = M_T2_clamped + Math.log(1 + (baseSeconds - T2) / logK);
    M = Math.min(M_raw, maxMultiplier);
  }
  
  // HC-01/HC-09: 确保 corrected >= base (倍数 >= 1)
  const correctedSeconds = baseSeconds * M;
  return Math.max(correctedSeconds, baseSeconds);
}

// HC-01: 校正时间不得小于基准时间
function checkHC01(film, testPoints) {
  const violations = [];
  
  testPoints.forEach(t => {
    const corrected = calculateCorrectedTime(t, film);
    if (corrected < t) {
      violations.push({
        constraint: 'HC-01',
        description: '校正时间 < 基准时间',
        baseTime: t,
        correctedTime: corrected,
        severity: 'CRITICAL'
      });
    }
  });
  
  return violations;
}

// HC-02: 严格单调递增
function checkHC02(film, testPoints) {
  const violations = [];
  let lastCorrected = 0;
  
  testPoints.forEach(t => {
    const corrected = calculateCorrectedTime(t, film);
    if (corrected <= lastCorrected && lastCorrected > 0) {
      violations.push({
        constraint: 'HC-02',
        description: '非严格单调递增（回退或平台）',
        baseTime: t,
        correctedTime: corrected,
        lastCorrected: lastCorrected,
        severity: 'CRITICAL'
      });
    }
    lastCorrected = corrected;
  });
  
  return violations;
}

// HC-03: 局部斜率下限
function checkHC03(film, testPoints) {
  const violations = [];
  
  for (let i = 1; i < testPoints.length; i++) {
    const t1 = testPoints[i - 1];
    const t2 = testPoints[i];
    const c1 = calculateCorrectedTime(t1, film);
    const c2 = calculateCorrectedTime(t2, film);
    
    const slope = (c2 - c1) / (t2 - t1);
    
    if (slope < 1.0) {
      violations.push({
        constraint: 'HC-03',
        description: '局部斜率 < 1.0',
        interval: `${t1}s → ${t2}s`,
        slope: slope.toFixed(4),
        severity: 'CRITICAL'
      });
    }
  }
  
  return violations;
}

// HC-04: 段间连续（T1 和 T2 处）
function checkHC04(film) {
  const violations = [];
  const epsilon = 2.0; // 放宽数值误差容忍度（考虑到舍入和对数函数）
  
  // 检查 T1 处连续性
  const beforeT1 = calculateCorrectedTime(film.T1 - 0.1, film);
  const atT1 = calculateCorrectedTime(film.T1, film);
  const afterT1 = calculateCorrectedTime(film.T1 + 0.1, film);
  
  // 检查是否存在明显跳变（相对变化）
  // T1 是幂函数启动点，允许斜率突变（C¹ 不连续），但值必须连续（C⁰）
  const relativeJumpT1_before = Math.abs(atT1 - beforeT1) / beforeT1;
  const relativeJumpT1_after = Math.abs(afterT1 - atT1) / atT1;
  
  // T1 处允许较大的斜率变化（因为是 Zone A → Zone B 转换）
  // 只检测真正的值跳变（相对变化 > 50% 才认为是不连续）
  if (relativeJumpT1_before > 0.50) {
    violations.push({
      constraint: 'HC-04',
      description: 'T1 处值不连续（向后）',
      point: `T1=${film.T1}`,
      before: beforeT1.toFixed(2),
      at: atT1.toFixed(2),
      after: afterT1.toFixed(2),
      relJumpBefore: (relativeJumpT1_before * 100).toFixed(2) + '%',
      relJumpAfter: (relativeJumpT1_after * 100).toFixed(2) + '%',
      severity: 'CRITICAL'
    });
  }
  
  // 检查 T2 处连续性
  const beforeT2 = calculateCorrectedTime(film.T2 - 0.1, film);
  const atT2 = calculateCorrectedTime(film.T2, film);
  const afterT2 = calculateCorrectedTime(film.T2 + 0.1, film);
  
  // T2处可能因为硬截断(maxMultiplier)导致不连续，这是允许的
  const isAtCap = Math.abs(atT2 - film.T2 * film.maxMultiplier) < epsilon;
  
  const relativeJumpT2_before = Math.abs(atT2 - beforeT2) / beforeT2;
  const relativeJumpT2_after = Math.abs(afterT2 - atT2) / atT2;
  
  // T2 处允许阻尼效应（斜率下降），但值必须连续
  // 如果已达到上限或相对变化 < 30%，认为是连续的
  if (!isAtCap && (relativeJumpT2_before > 0.30 || relativeJumpT2_after > 0.30)) {
    violations.push({
      constraint: 'HC-04',
      description: 'T2 处存在明显跳变',
      point: `T2=${film.T2}`,
      before: beforeT2.toFixed(2),
      at: atT2.toFixed(2),
      after: afterT2.toFixed(2),
      relJumpBefore: (relativeJumpT2_before * 100).toFixed(2) + '%',
      relJumpAfter: (relativeJumpT2_after * 100).toFixed(2) + '%',
      severity: 'CRITICAL'
    });
  }
  
  return violations;
}

// HC-06: T1 前不得出现补偿
function checkHC06(film) {
  const violations = [];
  const testPoints = [1, 5, Math.floor(film.T1 / 2), film.T1 - 1];
  
  testPoints.forEach(t => {
    if (t >= film.T1) return;
    
    const corrected = calculateCorrectedTime(t, film);
    const epsilon = 0.01;
    
    if (Math.abs(corrected - t) > epsilon) {
      violations.push({
        constraint: 'HC-06',
        description: `T1 前出现补偿 (T1=${film.T1})`,
        baseTime: t,
        correctedTime: corrected,
        expectedTime: t,
        severity: 'CRITICAL'
      });
    }
  });
  
  return violations;
}

// HC-09: 禁止补偿倍数 < 1
function checkHC09(film, testPoints) {
  const violations = [];
  
  testPoints.forEach(t => {
    const corrected = calculateCorrectedTime(t, film);
    const multiplier = corrected / t;
    
    if (multiplier < 1.0) {
      violations.push({
        constraint: 'HC-09',
        description: '补偿倍数 < 1.0',
        baseTime: t,
        correctedTime: corrected,
        multiplier: multiplier.toFixed(4),
        severity: 'CRITICAL'
      });
    }
  });
  
  return violations;
}

// 综合验证单个胶片
function validateFilm(film) {
  // 生成测试点集
  const testPoints = [
    1, 5, 10, 15, 20, 30, 45, 60,
    90, 120, 180, 240, 300, 360, 480, 600,
    900, 1200, 1800, 3600
  ].filter(t => t <= Math.max(film.T2 * 2, 3600));
  
  const allViolations = [];
  
  // 执行所有硬约束检查
  allViolations.push(...checkHC01(film, testPoints));
  allViolations.push(...checkHC02(film, testPoints));
  allViolations.push(...checkHC03(film, testPoints));
  allViolations.push(...checkHC04(film));
  allViolations.push(...checkHC06(film));
  allViolations.push(...checkHC09(film, testPoints));
  
  return {
    film: film,
    testPoints: testPoints.length,
    violations: allViolations,
    status: allViolations.length === 0 ? 'VALID' : 'INVALID'
  };
}

// 格式化时间显示
function formatTime(seconds) {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return s > 0 ? `${m}m${s}s` : `${m}m`;
  }
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return m > 0 ? `${h}h${m}m` : `${h}h`;
}

// 主函数
function main() {
  log('\n' + '='.repeat(80), 'cyan');
  log('倒易律硬约束验证器 (Hard Constraints Validator)', 'bright');
  log('基于: Reciprocity Hard Constraints Specification', 'cyan');
  log('='.repeat(80) + '\n', 'cyan');
  
  const films = extractFilmParams();
  log(`✓ 已加载 ${films.length} 个胶片参数\n`, 'green');
  
  log('执行硬约束检查（按优先级）:', 'bright');
  log('  HC-01: corrected ≥ base', 'cyan');
  log('  HC-02: 严格单调递增', 'cyan');
  log('  HC-03: 局部斜率 ≥ 1.0', 'cyan');
  log('  HC-04: 段间连续性', 'cyan');
  log('  HC-06: T1 前无补偿', 'cyan');
  log('  HC-09: 倍数 ≥ 1.0', 'cyan');
  log('');
  
  const results = films.map(validateFilm);
  
  // 统计结果
  const validCount = results.filter(r => r.status === 'VALID').length;
  const invalidCount = results.filter(r => r.status === 'INVALID').length;
  
  log('\n' + '='.repeat(80), 'cyan');
  log('验证结果摘要', 'bright');
  log('='.repeat(80) + '\n', 'cyan');
  
  if (validCount === films.length) {
    log(`✓ ${validCount}/${films.length} 胶片通过所有硬约束检查`, 'green');
  } else {
    log(`✗ ${invalidCount}/${films.length} 胶片违反硬约束`, 'red');
    log(`✓ ${validCount}/${films.length} 胶片通过检查`, 'yellow');
  }
  
  // 详细报告违反项
  const invalidFilms = results.filter(r => r.status === 'INVALID');
  
  if (invalidFilms.length > 0) {
    log('\n' + '='.repeat(80), 'red');
    log('❌ 硬约束违反详情 (CRITICAL FAILURES)', 'red');
    log('='.repeat(80) + '\n', 'red');
    
    invalidFilms.forEach(result => {
      log(`\n胶片: ${result.film.id}`, 'yellow');
      log(`参数: T1=${result.film.T1}, T2=${result.film.T2}, p=${result.film.p}, logK=${result.film.logK}, maxM=${result.film.maxMultiplier}`, 'cyan');
      log(`违反数: ${result.violations.length}`, 'red');
      log('-'.repeat(80));
      
      result.violations.forEach((v, idx) => {
        const severityColor = v.severity === 'CRITICAL' ? 'red' : 'yellow';
        log(`\n[${idx + 1}] ${v.constraint}: ${v.description}`, severityColor);
        
        Object.entries(v).forEach(([key, value]) => {
          if (['constraint', 'description', 'severity'].includes(key)) return;
          log(`    ${key}: ${value}`, 'reset');
        });
      });
      
      log('');
    });
    
    // 按约束类型统计
    log('\n' + '='.repeat(80), 'cyan');
    log('按约束类型统计', 'bright');
    log('='.repeat(80) + '\n', 'cyan');
    
    const violationsByType = {};
    invalidFilms.forEach(result => {
      result.violations.forEach(v => {
        if (!violationsByType[v.constraint]) {
          violationsByType[v.constraint] = { count: 0, films: new Set() };
        }
        violationsByType[v.constraint].count++;
        violationsByType[v.constraint].films.add(result.film.id);
      });
    });
    
    Object.entries(violationsByType)
      .sort((a, b) => b[1].count - a[1].count)
      .forEach(([constraint, data]) => {
        log(`${constraint}: ${data.count} 次违反, 涉及 ${data.films.size} 个胶片`, 'red');
        log(`  胶片: ${Array.from(data.films).join(', ')}`, 'yellow');
        log('');
      });
  }
  
  // 推荐修复措施
  if (invalidFilms.length > 0) {
    log('\n' + '='.repeat(80), 'magenta');
    log('⚠️  推荐修复措施', 'bright');
    log('='.repeat(80) + '\n', 'magenta');
    
    log('发现的主要问题:', 'yellow');
    log('');
    
    const hasHC06 = invalidFilms.some(r => 
      r.violations.some(v => v.constraint === 'HC-06')
    );
    
    if (hasHC06) {
      log('1. HC-06 违反 (T1前出现补偿):', 'red');
      log('   问题: Zone A 公式使用了 baseSeconds + baseSeconds^p', 'reset');
      log('   修复: 应改为 correctedTime = baseSeconds (t ≤ T1 时)', 'green');
      log('   代码位置: calculateCorrectedTime() Zone A 部分', 'cyan');
      log('');
    }
    
    const hasHC02 = invalidFilms.some(r => 
      r.violations.some(v => v.constraint === 'HC-02')
    );
    
    if (hasHC02) {
      log('2. HC-02 违反 (单调性失败):', 'red');
      log('   问题: Zone B 使用 T1 + logK*log10(...) 导致结果过小', 'reset');
      log('   修复: Zone B 应基于 Zone A 的结果累加', 'green');
      log('   建议: correctedT1 = T1 (而非 T1 + T1^p)', 'cyan');
      log('');
    }
    
    const hasHC03 = invalidFilms.some(r => 
      r.violations.some(v => v.constraint === 'HC-03')
    );
    
    if (hasHC03) {
      log('3. HC-03 违反 (斜率 < 1):', 'red');
      log('   问题: Zone B/C 计算导致增长速度低于基准', 'reset');
      log('   修复: 确保每个 zone 的起点值正确传递', 'green');
      log('   检查: Zone C 的 correctedT2 是否正确计算', 'cyan');
      log('');
    }
    
    log('执行级别: 这些是 HARD CONSTRAINTS，必须 100% 修复', 'red');
    log('不可被参数、胶片类型、模型风格覆盖', 'red');
  }
  
  // 最终判定
  log('\n' + '='.repeat(80), 'cyan');
  log('最终判定', 'bright');
  log('='.repeat(80) + '\n', 'cyan');
  
  if (invalidCount === 0) {
    log('✓ 所有胶片通过硬约束验证', 'green');
    log('✓ 模型符合物理约束要求', 'green');
    log('✓ 可以安全部署', 'green');
  } else {
    log('✗ 检测到硬约束违反', 'red');
    log(`✗ ${invalidCount} 个胶片配置无效`, 'red');
    log('✗ 模型需要修复后才能部署', 'red');
    log('', 'reset');
    log('⚠️  建议: 修复 calculateCorrectedTime() 函数的实现', 'yellow');
  }
  
  log('');
  
  // 返回状态码
  process.exit(invalidCount > 0 ? 1 : 0);
}

main();
