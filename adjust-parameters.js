// 重新调整参数以满足约束: M(T2) ≤ 1.3 × maxM

// M(T2) = 1 + ((T2 - T1) / T1)^p ≤ 1.3 × maxM
// 解出: p ≤ log(1.3 × maxM - 1) / log((T2 - T1) / T1)

function calculateMaxP(T1, T2, maxM) {
  const ratio = (T2 - T1) / T1;
  const targetM = 1.3 * maxM - 1;
  if (targetM <= 0) return 1.0;
  return Math.log(targetM) / Math.log(ratio);
}

function calculateMT2(T1, T2, p) {
  return 1 + Math.pow((T2 - T1) / T1, p);
}

// 调整后的参数
const adjustedFilms = {
  'C-41 彩色负片': [
    // Kodak C-41 系列 - 降低 p 到 1.25-1.28
    { name: 'Kodak Portra 160', type: 'c41', T1: 30, T2: 300, p: 1.25, logK: 35, maxM: 4 },
    { name: 'Kodak Portra 400', type: 'c41', T1: 30, T2: 300, p: 1.25, logK: 35, maxM: 4 },
    { name: 'Kodak Portra 800', type: 'c41', T1: 30, T2: 300, p: 1.26, logK: 36, maxM: 4 },
    { name: 'Kodak Ektar 100', type: 'c41', T1: 30, T2: 240, p: 1.28, logK: 38, maxM: 4 },
    { name: 'Kodak Gold 200', type: 'c41', T1: 20, T2: 240, p: 1.30, logK: 42, maxM: 5 },
    
    // Motion Picture - 保持较低 p
    { name: 'Kodak Vision3 50D', type: 'c41', T1: 30, T2: 300, p: 1.22, logK: 28, maxM: 4 },
    { name: 'Kodak Vision3 250D', type: 'c41', T1: 30, T2: 300, p: 1.23, logK: 29, maxM: 4 },
    { name: 'Kodak Vision3 500T', type: 'c41', T1: 30, T2: 300, p: 1.24, logK: 30, maxM: 4 },
    
    // Fuji C-41 系列
    { name: 'Fuji Superia 100', type: 'c41', T1: 25, T2: 240, p: 1.24, logK: 32, maxM: 4 },
    { name: 'Fuji Superia 200', type: 'c41', T1: 25, T2: 240, p: 1.26, logK: 34, maxM: 4 },
    { name: 'Fuji Superia 400', type: 'c41', T1: 25, T2: 240, p: 1.28, logK: 36, maxM: 4 },
    { name: 'Fuji Superia 1600', type: 'c41', T1: 20, T2: 240, p: 1.30, logK: 40, maxM: 5 },
    { name: 'Fuji C200', type: 'c41', T1: 25, T2: 240, p: 1.26, logK: 34, maxM: 4 },
    { name: 'Fuji Pro 160C', type: 'c41', T1: 25, T2: 240, p: 1.24, logK: 32, maxM: 4 },
    { name: 'Fuji Pro 160NS', type: 'c41', T1: 25, T2: 240, p: 1.24, logK: 32, maxM: 4 },
    { name: 'Fuji Pro 400H', type: 'c41', T1: 20, T2: 240, p: 1.26, logK: 36, maxM: 5 },
    { name: 'Fuji X-TRA 400', type: 'c41', T1: 25, T2: 240, p: 1.28, logK: 36, maxM: 4 },
    { name: 'Fuji Nexia 400', type: 'c41', T1: 25, T2: 240, p: 1.28, logK: 36, maxM: 4 },
    { name: 'Fuji 64T', type: 'c41', T1: 20, T2: 180, p: 1.18, logK: 24, maxM: 3 },
    
    { name: 'Cinestill 800T', type: 'c41', T1: 30, T2: 300, p: 1.23, logK: 29, maxM: 4 },
    { name: 'Holga 400', type: 'c41', T1: 20, T2: 240, p: 1.30, logK: 42, maxM: 5 },
    { name: 'Lomo CN 800', type: 'c41', T1: 15, T2: 200, p: 1.30, logK: 50, maxM: 6 },
  ],
  
  'BW-Modern 现代黑白': [
    // 严格限制 p ≤ 1.18, logK ≤ 25
    { name: 'Kodak T-Max 100', type: 'bw-modern', T1: 60, T2: 600, p: 1.10, logK: 20, maxM: 2 },
    { name: 'Kodak T-Max 400', type: 'bw-modern', T1: 45, T2: 600, p: 1.15, logK: 23, maxM: 3 },
    { name: 'Kodak T-Max 3200', type: 'bw-modern', T1: 45, T2: 600, p: 1.15, logK: 23, maxM: 3 },
    { name: 'Ilford Delta 100', type: 'bw-modern', T1: 60, T2: 600, p: 1.12, logK: 21, maxM: 2 },
    { name: 'Ilford Delta 400', type: 'bw-modern', T1: 45, T2: 600, p: 1.16, logK: 24, maxM: 3 },
    { name: 'Ilford Delta 3200', type: 'bw-modern', T1: 45, T2: 600, p: 1.16, logK: 24, maxM: 3 },
    { name: 'Fuji Acros II', type: 'bw-modern', T1: 120, T2: 900, p: 1.05, logK: 15, maxM: 2 },
  ],
  
  'BW-Classic 传统黑白': [
    // 可以保留高 p，但提高 maxM 确保不触 cap
    { name: 'Kodak Tri-X 320', type: 'bw-classic', T1: 10, T2: 120, p: 1.35, logK: 65, maxM: 10 },
    { name: 'Kodak Tri-X 400', type: 'bw-classic', T1: 10, T2: 120, p: 1.35, logK: 65, maxM: 10 },
    { name: 'Ilford HP5', type: 'bw-classic', T1: 12, T2: 180, p: 1.26, logK: 55, maxM: 8 },
    { name: 'Ilford FP4', type: 'bw-classic', T1: 10, T2: 120, p: 1.20, logK: 48, maxM: 6 },
    { name: 'Ilford Pan F', type: 'bw-classic', T1: 6, T2: 60, p: 1.35, logK: 65, maxM: 10 },
    { name: 'Ilford XP2 (C-41)', type: 'c41', T1: 25, T2: 240, p: 1.26, logK: 38, maxM: 4 },
    { name: 'Ilford SFX', type: 'bw-classic', T1: 12, T2: 150, p: 1.30, logK: 60, maxM: 8 },
    { name: 'Ilford Kentmere 100', type: 'bw-classic', T1: 10, T2: 120, p: 1.20, logK: 48, maxM: 6 },
    { name: 'Ilford Kentmere 400', type: 'bw-classic', T1: 12, T2: 180, p: 1.25, logK: 55, maxM: 8 },
    { name: 'Fuji Neopan', type: 'bw-classic', T1: 12, T2: 180, p: 1.28, logK: 58, maxM: 8 },
    { name: 'Fomapan 100', type: 'bw-classic', T1: 8, T2: 90, p: 1.30, logK: 60, maxM: 8 },
    { name: 'Fomapan 200', type: 'bw-classic', T1: 8, T2: 90, p: 1.32, logK: 62, maxM: 8 },
    { name: 'Fomapan 400', type: 'bw-classic', T1: 8, T2: 90, p: 1.35, logK: 65, maxM: 8 },
    { name: 'Shanghai GP3', type: 'bw-classic', T1: 12, T2: 150, p: 1.26, logK: 56, maxM: 8 },
    { name: 'Lomo Potsdam 100', type: 'bw-classic', T1: 10, T2: 120, p: 1.28, logK: 58, maxM: 8 },
  ],
  
  'Slide 反转片': [
    // 降低 p 避免触 cap
    { name: 'Kodak Ektachrome E100', type: 'slide', T1: 4, T2: 90, p: 1.08, logK: 15, maxM: 2 },
    { name: 'Fuji Provia 400X', type: 'slide', T1: 4, T2: 75, p: 1.12, logK: 22, maxM: 3 },
    { name: 'Fuji Sensia 200', type: 'slide', T1: 4, T2: 80, p: 1.10, logK: 20, maxM: 3 },
    { name: 'Fuji T64', type: 'slide', T1: 3, T2: 60, p: 1.15, logK: 24, maxM: 3 },
  ],
};

console.log('═'.repeat(80));
console.log('参数调整验证 - 确保 M(T2) ≤ 1.3 × maxM');
console.log('═'.repeat(80));
console.log();

let violations = 0;
let total = 0;

for (const [category, films] of Object.entries(adjustedFilms)) {
  console.log(`\n${'━'.repeat(80)}`);
  console.log(`${category}`);
  console.log('━'.repeat(80));
  
  for (const film of films) {
    total++;
    const maxPAllowed = calculateMaxP(film.T1, film.T2, film.maxM);
    const MT2 = calculateMT2(film.T1, film.T2, film.p);
    const threshold = 1.3 * film.maxM;
    const ok = MT2 <= threshold;
    
    const status = ok ? '✓' : '✗';
    const mark = ok ? '' : ' [VIOLATION]';
    
    console.log(`\n${status} ${film.name}`);
    console.log(`   参数: T1=${film.T1}, T2=${film.T2}, p=${film.p}, logK=${film.logK}, maxM=${film.maxM}`);
    console.log(`   M(T2) = ${MT2.toFixed(3)}, 阈值 = ${threshold.toFixed(3)} (1.3 × maxM)`);
    console.log(`   p_max = ${maxPAllowed.toFixed(3)} (当前 p=${film.p})${mark}`);
    
    if (!ok) violations++;
  }
}

console.log('\n' + '═'.repeat(80));
console.log(`验证结果: ${total - violations}/${total} 通过`);
if (violations > 0) {
  console.log(`⚠️ 发现 ${violations} 个参数违反约束，需要进一步调整`);
} else {
  console.log('✅ 所有参数满足约束！');
}
console.log('═'.repeat(80));

// 输出 TypeScript 格式的参数
console.log('\n\n// TypeScript 格式的调整后参数：\n');

for (const [category, films] of Object.entries(adjustedFilms)) {
  console.log(`\n  // ${category}`);
  for (const film of films) {
    console.log(`  { name: '${film.name}', type: '${film.type}', T1: ${film.T1}, T2: ${film.T2}, p: ${film.p}, logK: ${film.logK}, maxM: ${film.maxM} },`);
  }
}
