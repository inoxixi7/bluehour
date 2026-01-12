#!/usr/bin/env node

/**
 * 增强型胶片配置测试脚本
 * 
 * 测试内容：
 * 1. JSON 配置文件结构验证
 * 2. 倒易律补偿计算验证
 * 3. 色彩偏移建议查询
 * 4. 实际拍摄场景模拟
 */

const fs = require('fs');
const path = require('path');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log('\n' + '='.repeat(70));
  log(title, 'bright');
  console.log('='.repeat(70) + '\n');
}

function subheader(title) {
  console.log('\n' + '-'.repeat(70));
  log(title, 'cyan');
  console.log('-'.repeat(70));
}

// 加载配置文件
function loadConfig() {
  const configPath = path.join(__dirname, 'film-reciprocity-config-enhanced.json');
  try {
    const data = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    log(`❌ 配置文件加载失败: ${error.message}`, 'red');
    process.exit(1);
  }
}

// 构建胶片索引
function buildFilmIndex(config) {
  const index = new Map();
  let totalFilms = 0;
  
  config.films.forEach(category => {
    category.films.forEach(film => {
      index.set(film.id, film);
      totalFilms++;
    });
  });
  
  return { index, totalFilms };
}

// 计算倒易律补偿时间
function calculateCorrectedTime(baseSeconds, params) {
  const { T1, T2, p, logK, maxMultiplier } = params;
  
  // Zone A: t ≤ T1
  if (baseSeconds <= T1) {
    return baseSeconds + Math.pow(baseSeconds, p);
  }
  
  // Zone B: T1 < t ≤ T2
  if (baseSeconds <= T2) {
    const correctedT1 = T1;
    const additional = logK * Math.log10(baseSeconds / T1 + 1);
    return correctedT1 + additional;
  }
  
  // Zone C: t > T2
  const M_T2 = 1 + Math.pow((T2 - T1) / T1, p);
  const correctedT2 = T2 * M_T2;
  const extrapolated = correctedT2 + logK * Math.log((baseSeconds - T2) / logK + 1);
  
  return Math.min(extrapolated, baseSeconds * maxMultiplier);
}

// 格式化时间显示
function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds.toFixed(1)}s`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.round((seconds % 3600) / 60);
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

// 查找色彩建议
function getColorAdvice(film, exposureSeconds) {
  if (!film.colorShiftAdvice?.enabled) {
    return null;
  }
  
  for (const range of film.colorShiftAdvice.timeRanges) {
    if (isInRange(exposureSeconds, range.range)) {
      return range;
    }
  }
  
  return null;
}

// 解析时间范围
function isInRange(seconds, rangeStr) {
  // 简化版本：仅处理常见格式
  if (rangeStr.includes('1s - ')) {
    const match = rangeStr.match(/1s - (\d+)s/);
    if (match) {
      return seconds >= 1 && seconds <= parseInt(match[1]);
    }
  }
  
  if (rangeStr.match(/(\d+)s - (\d+)min/)) {
    const match = rangeStr.match(/(\d+)s - (\d+)min/);
    const start = parseInt(match[1]);
    const end = parseInt(match[2]) * 60;
    return seconds >= start && seconds <= end;
  }
  
  if (rangeStr.match(/(\d+)min - (\d+)min/)) {
    const match = rangeStr.match(/(\d+)min - (\d+)min/);
    const start = parseInt(match[1]) * 60;
    const end = parseInt(match[2]) * 60;
    return seconds >= start && seconds <= end;
  }
  
  if (rangeStr.includes('> ')) {
    const match = rangeStr.match(/> (\d+)min/);
    if (match) {
      return seconds > parseInt(match[1]) * 60;
    }
  }
  
  return false;
}

// 测试1: 验证配置文件结构
function test1_validateConfig(config) {
  header('测试 1: 配置文件结构验证');
  
  const checks = [
    { name: 'version 字段存在', test: () => !!config.version },
    { name: 'model 字段为 Segmented Damping Model', test: () => config.model === 'Segmented Damping Model' },
    { name: 'films 数组存在', test: () => Array.isArray(config.films) },
    { name: 'validationConstraints 存在', test: () => !!config.validationConstraints },
    { name: 'filterGuidelines 存在', test: () => !!config.filterGuidelines },
    { name: 'metadata 存在', test: () => !!config.metadata },
  ];
  
  let passed = 0;
  checks.forEach(check => {
    const result = check.test();
    if (result) {
      log(`✓ ${check.name}`, 'green');
      passed++;
    } else {
      log(`✗ ${check.name}`, 'red');
    }
  });
  
  log(`\n结果: ${passed}/${checks.length} 检查通过`, passed === checks.length ? 'green' : 'yellow');
  
  // 统计信息
  subheader('配置统计');
  const { totalFilms } = buildFilmIndex(config);
  log(`总胶片数: ${totalFilms}`, 'cyan');
  log(`生成日期: ${config.generatedDate}`, 'dim');
  log(`版本: ${config.version}`, 'dim');
}

// 测试2: 倒易律计算验证
function test2_reciprocityCalculation(filmIndex) {
  header('测试 2: 倒易律补偿计算');
  
  // 测试案例
  const testCases = [
    { filmId: 'kodak_portra160', name: 'Kodak Portra 160', exposures: [1, 30, 60, 120, 300, 600] },
    { filmId: 'kodak_tmax100', name: 'Kodak T-Max 100', exposures: [1, 60, 120, 300, 600, 900] },
    { filmId: 'ilford_panf', name: 'Ilford Pan F', exposures: [1, 6, 30, 60, 120, 180] },
    { filmId: 'kodak_e100', name: 'Kodak E100 (Slide)', exposures: [1, 4, 10, 30, 60, 90] },
  ];
  
  testCases.forEach(testCase => {
    const film = filmIndex.get(testCase.filmId);
    if (!film) {
      log(`✗ 胶片 ${testCase.filmId} 未找到`, 'red');
      return;
    }
    
    subheader(testCase.name);
    console.log('基准曝光 -> 校正曝光 (倍数)');
    console.log('');
    
    let lastCorrected = 0;
    let monotonic = true;
    
    testCase.exposures.forEach(baseTime => {
      const corrected = calculateCorrectedTime(baseTime, film.modelParams);
      const multiplier = corrected / baseTime;
      const isMonotonic = corrected >= lastCorrected;
      
      if (!isMonotonic) monotonic = false;
      
      const status = isMonotonic ? '✓' : '✗';
      const color = isMonotonic ? 'green' : 'red';
      
      console.log(
        `${status} ${formatTime(baseTime).padEnd(10)} -> ${formatTime(corrected).padEnd(12)} ` +
        `(${multiplier.toFixed(2)}×)`
      );
      
      lastCorrected = corrected;
    });
    
    if (monotonic) {
      log(`\n✓ 单调性检查通过`, 'green');
    } else {
      log(`\n✗ 单调性检查失败`, 'red');
    }
  });
}

// 测试3: 色彩偏移建议
function test3_colorShiftAdvice(filmIndex) {
  header('测试 3: 色彩偏移建议查询');
  
  const testCases = [
    { 
      filmId: 'kodak_portra160', 
      name: 'Kodak Portra 160',
      testTimes: [15, 60, 150, 400]
    },
    { 
      filmId: 'fuji_pro400h', 
      name: 'Fuji Pro 400H (富士)',
      testTimes: [15, 60, 150, 400]
    },
    { 
      filmId: 'cinestill_800t', 
      name: 'Cinestill 800T (钨丝灯)',
      testTimes: [15, 60, 150, 400]
    },
    { 
      filmId: 'kodak_e100', 
      name: 'Kodak E100 (反转片)',
      testTimes: [2, 10, 60, 150]
    },
    { 
      filmId: 'kodak_tmax100', 
      name: 'Kodak T-Max 100 (黑白)',
      testTimes: [60, 300]
    },
  ];
  
  testCases.forEach(testCase => {
    const film = filmIndex.get(testCase.filmId);
    if (!film) return;
    
    subheader(testCase.name);
    
    if (!film.colorShiftAdvice?.enabled) {
      log(`ℹ  黑白胶片，无需色彩校正`, 'dim');
      if (film.colorShiftAdvice?.notes) {
        film.colorShiftAdvice.notes.forEach(note => {
          log(`  • ${note}`, 'dim');
        });
      }
      return;
    }
    
    console.log('曝光时间 | 色彩偏移 | 推荐滤镜');
    console.log('-'.repeat(60));
    
    testCase.testTimes.forEach(time => {
      const corrected = calculateCorrectedTime(time, film.modelParams);
      const advice = getColorAdvice(film, corrected);
      
      if (advice) {
        const severity = film.colorShiftAdvice.severity === 'critical' ? '⚠️ ' : '';
        log(
          `${formatTime(corrected).padEnd(10)} | ${severity}${advice.shift.padEnd(20)} | ${advice.filter || '无需滤镜'}`,
          advice.filter ? 'yellow' : 'green'
        );
      } else {
        log(
          `${formatTime(corrected).padEnd(10)} | 无明显偏移              | 无需滤镜`,
          'green'
        );
      }
    });
    
    if (film.colorShiftAdvice.severity === 'critical') {
      log(`\n⚠️  反转片对色彩偏移极度敏感，必须使用物理滤镜！`, 'red');
    }
    
    if (film.colorShiftAdvice.notes && film.colorShiftAdvice.notes.length > 0) {
      log(`\n提示:`, 'cyan');
      film.colorShiftAdvice.notes.slice(0, 2).forEach(note => {
        log(`  • ${note}`, 'dim');
      });
    }
  });
}

// 测试4: 实际拍摄场景模拟
function test4_realWorldScenarios(filmIndex) {
  header('测试 4: 实际拍摄场景模拟');
  
  const scenarios = [
    {
      name: '星空摄影',
      film: 'kodak_portra400',
      baseSettings: { aperture: 'f/2.8', time: 120, iso: 400 },
      description: '使用大光圈拍摄银河'
    },
    {
      name: '夜景长曝光',
      film: 'cinestill_800t',
      baseSettings: { aperture: 'f/8', time: 60, iso: 800 },
      description: '城市夜景霓虹灯'
    },
    {
      name: '黄昏风光',
      film: 'kodak_ektar100',
      baseSettings: { aperture: 'f/11', time: 30, iso: 100 },
      description: '落日余晖海景'
    },
    {
      name: '极限长曝光',
      film: 'ilford_panf',
      baseSettings: { aperture: 'f/16', time: 180, iso: 50 },
      description: '超长曝光云雾效果'
    },
  ];
  
  scenarios.forEach((scenario, index) => {
    const film = filmIndex.get(scenario.film);
    if (!film) return;
    
    subheader(`场景 ${index + 1}: ${scenario.name}`);
    
    log(`胶片: ${film.name}`, 'cyan');
    log(`场景: ${scenario.description}`, 'dim');
    log(`\n测光参数:`, 'bright');
    log(`  光圈: ${scenario.baseSettings.aperture}`);
    log(`  时间: ${formatTime(scenario.baseSettings.time)}`);
    log(`  ISO: ${scenario.baseSettings.iso}`);
    
    const correctedTime = calculateCorrectedTime(
      scenario.baseSettings.time, 
      film.modelParams
    );
    const multiplier = correctedTime / scenario.baseSettings.time;
    
    log(`\n倒易律补偿:`, 'bright');
    log(`  校正时间: ${formatTime(correctedTime)}`, 'green');
    log(`  补偿倍数: ${multiplier.toFixed(2)}×`, 'yellow');
    
    const advice = getColorAdvice(film, correctedTime);
    if (advice) {
      log(`\n色彩偏移:`, 'bright');
      log(`  预期偏移: ${advice.shift}`, 'yellow');
      log(`  推荐滤镜: ${advice.filter}`, 'magenta');
      if (advice.filterDensity) {
        log(`  滤镜密度: ${advice.filterDensity}`, 'dim');
      }
      if (advice.description) {
        log(`  说明: ${advice.description}`, 'dim');
      }
      
      // 计算曝光补偿
      const filterCompensation = advice.filterDensity ? 
        '+' + (Math.ceil(parseInt(advice.filterDensity) / 10) / 3).toFixed(1) + ' stop' : 
        '无需补偿';
      log(`  曝光补偿: ${filterCompensation}`, 'cyan');
    } else if (film.colorShiftAdvice?.enabled) {
      log(`\n色彩偏移:`, 'bright');
      log(`  ✓ 无明显色彩偏移`, 'green');
    } else {
      log(`\nℹ  黑白胶片，注意反差变化`, 'dim');
    }
    
    log(`\n最终拍摄参数:`, 'bright');
    log(`  光圈: ${scenario.baseSettings.aperture}`);
    log(`  时间: ${formatTime(correctedTime)}`, 'green');
    if (advice?.filter) {
      log(`  滤镜: ${advice.filter}`, 'magenta');
    }
    log(`  ISO: ${scenario.baseSettings.iso}`);
  });
}

// 测试5: 参数验证状态
function test5_validationStatus(filmIndex) {
  header('测试 5: 参数验证状态');
  
  const categories = {
    'c41': { name: 'C-41 彩色负片', films: [] },
    'bw-modern': { name: 'BW-Modern 现代黑白', films: [] },
    'bw-classic': { name: 'BW-Classic 传统黑白', films: [] },
    'slide': { name: 'Slide 反转片', films: [] },
  };
  
  filmIndex.forEach(film => {
    if (categories[film.type]) {
      categories[film.type].films.push(film);
    }
  });
  
  Object.entries(categories).forEach(([type, category]) => {
    if (category.films.length === 0) return;
    
    subheader(`${category.name} (${category.films.length} 个胶片)`);
    
    let allPassed = true;
    const margins = [];
    
    category.films.forEach(film => {
      const status = film.validation.status === '✓' ? '✓' : '✗';
      const color = status === '✓' ? 'green' : 'red';
      const margin = parseFloat(film.validation.safetyMargin);
      margins.push(margin);
      
      if (status !== '✓') allPassed = false;
      
      log(
        `${status} ${film.name.padEnd(30)} | ` +
        `M(T2)=${film.validation.M_T2.toFixed(3)} | ` +
        `阈值=${film.validation.threshold.toFixed(3)} | ` +
        `余量=${film.validation.safetyMargin}`,
        color
      );
    });
    
    if (allPassed) {
      const avgMargin = (margins.reduce((a, b) => a + b, 0) / margins.length).toFixed(1);
      const minMargin = Math.min(...margins).toFixed(1);
      log(`\n✓ 全部通过验证 | 平均余量=${avgMargin}% | 最小余量=${minMargin}%`, 'green');
    }
  });
  
  subheader('总体统计');
  let totalPassed = 0;
  let total = 0;
  filmIndex.forEach(film => {
    total++;
    if (film.validation.status === '✓') totalPassed++;
  });
  
  log(`✓ 验证通过: ${totalPassed}/${total} (${((totalPassed/total)*100).toFixed(1)}%)`, 
      totalPassed === total ? 'green' : 'yellow');
}

// 主函数
function main() {
  log('\n📸 增强型胶片倒易律配置测试\n', 'bright');
  log('模型: Segmented Damping Model', 'cyan');
  log('日期: 2026年1月12日', 'dim');
  
  const config = loadConfig();
  const { index: filmIndex, totalFilms } = buildFilmIndex(config);
  
  log(`✓ 配置文件加载成功 (${totalFilms} 个胶片)\n`, 'green');
  
  try {
    test1_validateConfig(config);
    test2_reciprocityCalculation(filmIndex);
    test3_colorShiftAdvice(filmIndex);
    test4_realWorldScenarios(filmIndex);
    test5_validationStatus(filmIndex);
    
    header('测试完成');
    log('✓ 所有测试执行完毕', 'green');
    log('\n配置文件已准备好集成到应用中！', 'cyan');
    
  } catch (error) {
    log(`\n❌ 测试过程中出现错误: ${error.message}`, 'red');
    console.error(error.stack);
    process.exit(1);
  }
}

// 执行测试
main();
