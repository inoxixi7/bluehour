#!/usr/bin/env node

/**
 * Segmented Damping Model - 参数重新调整 v2
 * 目标：确保 M(T2) ≤ 1.3 × maxM，满足约束
 * 策略：使用计算出的 p_max，取其 90% 作为安全值
 */

// 计算 M(T2) = 1 + ((T2 - T1) / T1)^p
function calculateMT2(T1, T2, p) {
  return 1 + Math.pow((T2 - T1) / T1, p);
}

// 计算最大允许的 p 值：p_max = log(1.3 × maxM - 1) / log((T2 - T1) / T1)
function calculateMaxP(T1, T2, maxM) {
  const ratio = (T2 - T1) / T1;
  const threshold = 1.3 * maxM;
  const p_max = Math.log(threshold - 1) / Math.log(ratio);
  return p_max;
}

// 原始胶片参数（从 adjust-parameters.js）
const originalFilms = {
  'C-41 彩色负片': [
    { name: 'Kodak Portra 160', T1: 30, T2: 300, p: 1.32, logK: 40, maxM: 4 },
    { name: 'Kodak Portra 400', T1: 30, T2: 300, p: 1.32, logK: 40, maxM: 4 },
    { name: 'Kodak Portra 800', T1: 30, T2: 300, p: 1.33, logK: 42, maxM: 4 },
    { name: 'Kodak Ektar 100', T1: 30, T2: 240, p: 1.35, logK: 45, maxM: 4 },
    { name: 'Kodak Gold 200', T1: 20, T2: 240, p: 1.38, logK: 50, maxM: 5 },
    { name: 'Kodak Vision3 50D', T1: 30, T2: 300, p: 1.28, logK: 32, maxM: 4 },
    { name: 'Kodak Vision3 250D', T1: 30, T2: 300, p: 1.30, logK: 35, maxM: 4 },
    { name: 'Kodak Vision3 500T', T1: 30, T2: 300, p: 1.32, logK: 38, maxM: 4 },
    { name: 'Fuji Superia 100', T1: 25, T2: 240, p: 1.30, logK: 38, maxM: 4 },
    { name: 'Fuji Superia 200', T1: 25, T2: 240, p: 1.32, logK: 40, maxM: 4 },
    { name: 'Fuji Superia 400', T1: 25, T2: 240, p: 1.35, logK: 42, maxM: 4 },
    { name: 'Fuji Superia 1600', T1: 20, T2: 240, p: 1.38, logK: 48, maxM: 5 },
    { name: 'Fuji C200', T1: 25, T2: 240, p: 1.32, logK: 40, maxM: 4 },
    { name: 'Fuji Pro 160C', T1: 25, T2: 240, p: 1.30, logK: 38, maxM: 4 },
    { name: 'Fuji Pro 160NS', T1: 25, T2: 240, p: 1.30, logK: 38, maxM: 4 },
    { name: 'Fuji Pro 400H', T1: 20, T2: 240, p: 1.33, logK: 42, maxM: 5 },
    { name: 'Fuji X-TRA 400', T1: 25, T2: 240, p: 1.35, logK: 42, maxM: 4 },
    { name: 'Fuji Nexia 400', T1: 25, T2: 240, p: 1.35, logK: 42, maxM: 4 },
    { name: 'Fuji 64T', T1: 20, T2: 180, p: 1.25, logK: 30, maxM: 3 },
    { name: 'Cinestill 800T', T1: 30, T2: 300, p: 1.30, logK: 35, maxM: 4 },
    { name: 'Holga 400', T1: 20, T2: 240, p: 1.38, logK: 50, maxM: 5 },
    { name: 'Lomo CN 800', T1: 15, T2: 200, p: 1.42, logK: 60, maxM: 6 },
  ],
  'BW-Modern 现代黑白': [
    { name: 'Kodak T-Max 100', T1: 60, T2: 600, p: 1.15, logK: 25, maxM: 2 },
    { name: 'Kodak T-Max 400', T1: 45, T2: 600, p: 1.18, logK: 28, maxM: 3 },
    { name: 'Kodak T-Max 3200', T1: 45, T2: 600, p: 1.22, logK: 32, maxM: 3 },
    { name: 'Ilford Delta 100', T1: 60, T2: 600, p: 1.16, logK: 26, maxM: 2 },
    { name: 'Ilford Delta 400', T1: 45, T2: 600, p: 1.20, logK: 30, maxM: 3 },
    { name: 'Ilford Delta 3200', T1: 45, T2: 600, p: 1.22, logK: 32, maxM: 3 },
    { name: 'Fuji Acros II', T1: 120, T2: 900, p: 1.10, logK: 18, maxM: 2 },
  ],
  'BW-Classic 传统黑白': [
    { name: 'Kodak Tri-X 320', T1: 10, T2: 120, p: 1.50, logK: 70, maxM: 8 },
    { name: 'Kodak Tri-X 400', T1: 10, T2: 120, p: 1.50, logK: 70, maxM: 8 },
    { name: 'Ilford HP5', T1: 12, T2: 180, p: 1.38, logK: 65, maxM: 8 },
    { name: 'Ilford FP4', T1: 10, T2: 120, p: 1.32, logK: 55, maxM: 6 },
    { name: 'Ilford Pan F', T1: 6, T2: 60, p: 1.50, logK: 70, maxM: 10 },
    { name: 'Ilford XP2 (C-41)', T1: 25, T2: 240, p: 1.32, logK: 45, maxM: 4 },
    { name: 'Ilford SFX', T1: 12, T2: 150, p: 1.40, logK: 68, maxM: 8 },
    { name: 'Ilford Kentmere 100', T1: 10, T2: 120, p: 1.32, logK: 55, maxM: 6 },
    { name: 'Ilford Kentmere 400', T1: 12, T2: 180, p: 1.36, logK: 62, maxM: 8 },
    { name: 'Fuji Neopan', T1: 12, T2: 180, p: 1.40, logK: 65, maxM: 8 },
    { name: 'Fomapan 100', T1: 8, T2: 90, p: 1.42, logK: 68, maxM: 8 },
    { name: 'Fomapan 200', T1: 8, T2: 90, p: 1.45, logK: 70, maxM: 8 },
    { name: 'Fomapan 400', T1: 8, T2: 90, p: 1.50, logK: 72, maxM: 8 },
    { name: 'Shanghai GP3', T1: 12, T2: 150, p: 1.38, logK: 62, maxM: 8 },
    { name: 'Lomo Potsdam 100', T1: 10, T2: 120, p: 1.40, logK: 65, maxM: 8 },
  ],
  'Slide 反转片': [
    { name: 'Kodak Ektachrome E100', T1: 4, T2: 90, p: 1.10, logK: 18, maxM: 2 },
    { name: 'Fuji Provia 400X', T1: 4, T2: 75, p: 1.25, logK: 28, maxM: 3 },
    { name: 'Fuji Sensia 200', T1: 4, T2: 80, p: 1.20, logK: 25, maxM: 3 },
    { name: 'Fuji T64', T1: 3, T2: 60, p: 1.25, logK: 30, maxM: 3 },
  ]
};

console.log('════════════════════════════════════════════════════════════════════════════════');
console.log('参数调整 v2 - 使用 p_max × 0.9 策略');
console.log('════════════════════════════════════════════════════════════════════════════════\n');

const adjustedFilms = {};
let totalFilms = 0;
let passedFilms = 0;

Object.keys(originalFilms).forEach(category => {
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(category);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  adjustedFilms[category] = [];

  originalFilms[category].forEach(film => {
    totalFilms++;
    const { name, T1, T2, p: originalP, logK: originalLogK, maxM } = film;

    // 计算 p_max
    const p_max = calculateMaxP(T1, T2, maxM);
    
    // 策略：
    // 1. 如果 p_max >= 1.0，使用 p_max × 0.9（留 10% 余量）
    // 2. 如果 p_max < 1.0 且 > 0.5，使用 p_max × 0.85（留 15% 余量）
    // 3. 如果 p_max <= 0.5，考虑提高 maxM
    let newP, newLogK, newMaxM = maxM;

    if (p_max >= 1.0) {
      newP = Math.round(p_max * 0.90 * 100) / 100; // 保留 2 位小数
    } else if (p_max >= 0.5) {
      newP = Math.round(p_max * 0.85 * 100) / 100;
    } else {
      // p_max 太小，尝试提高 maxM
      if (category === 'BW-Classic 传统黑白' && maxM < 12) {
        newMaxM = maxM + 2; // 提高 maxM
        const newPMax = calculateMaxP(T1, T2, newMaxM);
        newP = Math.round(newPMax * 0.90 * 100) / 100;
      } else if (category === 'C-41 彩色负片' && maxM < 6) {
        newMaxM = maxM + 1;
        const newPMax = calculateMaxP(T1, T2, newMaxM);
        newP = Math.round(newPMax * 0.90 * 100) / 100;
      } else if (category === 'BW-Modern 现代黑白' && maxM < 4) {
        newMaxM = maxM + 1;
        const newPMax = calculateMaxP(T1, T2, newMaxM);
        newP = Math.round(newPMax * 0.90 * 100) / 100;
      } else if (category === 'Slide 反转片' && maxM < 4) {
        newMaxM = maxM + 1;
        const newPMax = calculateMaxP(T1, T2, newMaxM);
        newP = Math.round(newPMax * 0.90 * 100) / 100;
      } else {
        newP = Math.round(p_max * 0.80 * 100) / 100; // 更保守
      }
    }

    // 按比例调整 logK（保持曲线形状）
    const pRatio = newP / originalP;
    newLogK = Math.round(originalLogK * pRatio);

    // 确保 logK 不太小
    if (newLogK < 10) newLogK = 10;

    // 验证调整后的参数
    const M_T2 = calculateMT2(T1, T2, newP);
    const threshold = 1.3 * newMaxM;
    const passed = M_T2 <= threshold;

    if (passed) {
      passedFilms++;
      console.log(`✓ ${name}`);
    } else {
      console.log(`✗ ${name}`);
    }
    console.log(`   原始参数: T1=${T1}, T2=${T2}, p=${originalP}, logK=${originalLogK}, maxM=${maxM}`);
    console.log(`   调整参数: T1=${T1}, T2=${T2}, p=${newP}, logK=${newLogK}, maxM=${newMaxM}`);
    console.log(`   p_max = ${p_max.toFixed(3)}, M(T2) = ${M_T2.toFixed(3)}, 阈值 = ${threshold.toFixed(3)}`);
    if (!passed) {
      console.log(`   [仍需调整: M(T2) 超出阈值 ${((M_T2 / threshold - 1) * 100).toFixed(1)}%]`);
    }
    console.log();

    adjustedFilms[category].push({
      name,
      T1,
      T2,
      p: newP,
      logK: newLogK,
      maxM: newMaxM
    });
  });
});

console.log('════════════════════════════════════════════════════════════════════════════════');
console.log(`验证结果: ${passedFilms}/${totalFilms} 通过`);
if (passedFilms === totalFilms) {
  console.log('✓ 所有参数满足约束！');
} else {
  console.log(`⚠️ 仍有 ${totalFilms - passedFilms} 个胶片需要进一步调整`);
}
console.log('════════════════════════════════════════════════════════════════════════════════\n');

// 输出 TypeScript 格式
console.log('\n// TypeScript 格式的调整后参数：\n');

Object.keys(adjustedFilms).forEach(category => {
  console.log(`  // ${category}`);
  adjustedFilms[category].forEach(film => {
    const typeMap = {
      'C-41 彩色负片': 'c41',
      'BW-Modern 现代黑白': 'bw-modern',
      'BW-Classic 传统黑白': 'bw-classic',
      'Slide 反转片': 'slide'
    };
    const type = typeMap[category];
    if (film.name === 'Ilford XP2 (C-41)') {
      console.log(`  { name: '${film.name}', type: 'c41', T1: ${film.T1}, T2: ${film.T2}, p: ${film.p}, logK: ${film.logK}, maxM: ${film.maxM} },`);
    } else {
      console.log(`  { name: '${film.name}', type: '${type}', T1: ${film.T1}, T2: ${film.T2}, p: ${film.p}, logK: ${film.logK}, maxM: ${film.maxM} },`);
    }
  });
  console.log();
});
