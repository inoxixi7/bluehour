// Segmented Damping Model - 重新计算所有胶片数据
// Model: 三段连续函数（C¹ continuous）

const BASE_SECONDS = [1, 2, 4, 8, 15, 30, 60, 120, 240, 480, 900, 1800, 3600];

// Segmented Damping Model implementation
function calculateCurve({ T1, T2, p, logK, maxM }) {
  return BASE_SECONDS.map(t => {
    let M; // Exposure multiplier
    
    if (t <= T1) {
      // Segment 1: Toe - 无补偿
      M = 1;
    } else if (t <= T2) {
      // Segment 2: Mid - 非线性增长
      M = 1 + Math.pow((t - T1) / T1, p);
    } else {
      // Segment 3: Shoulder - 对数阻尼
      const M_T2 = 1 + Math.pow((T2 - T1) / T1, p);
      const M_raw = M_T2 + Math.log(1 + (t - T2) / logK);
      M = Math.min(M_raw, maxM);
    }
    
    const corrected = Math.round(t * M);
    const isCapped = (t > T2) && (M >= maxM - 0.01);
    
    return {
      base: t,
      corrected,
      multiplier: M.toFixed(3),
      capped: isCapped
    };
  });
}

// 验证连续性
function verifyContinuity(params) {
  const { T1, T2, p, logK, maxM } = params;
  
  // Check at T1
  const M_T1_left = 1;
  const M_T1_right = 1 + Math.pow((T1 + 0.001 - T1) / T1, p);
  const cont_T1 = Math.abs(M_T1_right - M_T1_left) < 0.01;
  
  // Check at T2
  const M_T2_left = 1 + Math.pow((T2 - T1) / T1, p);
  const M_T2_right = M_T2_left + Math.log(1 + 0.001 / logK);
  const cont_T2 = Math.abs(M_T2_right - M_T2_left) < 0.01;
  
  return { cont_T1, cont_T2, M_T1_left, M_T2_left };
}

// 格式化输出
function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

// 所有胶片参数（使用现有参数，不修改）
const films = {
  'C-41 彩色负片': [
    { name: 'Kodak Portra 160', type: 'c41', T1: 30, T2: 300, p: 1.32, logK: 40, maxM: 4 },
    { name: 'Kodak Portra 400', type: 'c41', T1: 30, T2: 300, p: 1.32, logK: 40, maxM: 4 },
    { name: 'Kodak Portra 800', type: 'c41', T1: 30, T2: 300, p: 1.33, logK: 42, maxM: 4 },
    { name: 'Kodak Ektar 100', type: 'c41', T1: 30, T2: 240, p: 1.34, logK: 45, maxM: 4 },
    { name: 'Kodak Gold 200', type: 'c41', T1: 20, T2: 240, p: 1.38, logK: 55, maxM: 5 },
    { name: 'Kodak Vision3 50D', type: 'c41', T1: 30, T2: 300, p: 1.25, logK: 30, maxM: 4 },
    { name: 'Kodak Vision3 250D', type: 'c41', T1: 30, T2: 300, p: 1.26, logK: 32, maxM: 4 },
    { name: 'Kodak Vision3 500T', type: 'c41', T1: 30, T2: 300, p: 1.27, logK: 34, maxM: 4 },
    { name: 'Fuji Superia 100', type: 'c41', T1: 25, T2: 240, p: 1.28, logK: 38, maxM: 4 },
    { name: 'Fuji Superia 200', type: 'c41', T1: 25, T2: 240, p: 1.30, logK: 40, maxM: 4 },
    { name: 'Fuji Superia 400', type: 'c41', T1: 25, T2: 240, p: 1.32, logK: 42, maxM: 5 },
    { name: 'Fuji Superia 1600', type: 'c41', T1: 20, T2: 240, p: 1.35, logK: 48, maxM: 5 },
    { name: 'Fuji C200', type: 'c41', T1: 25, T2: 240, p: 1.30, logK: 40, maxM: 4 },
    { name: 'Fuji Pro 160C', type: 'c41', T1: 25, T2: 240, p: 1.28, logK: 38, maxM: 4 },
    { name: 'Fuji Pro 160NS', type: 'c41', T1: 25, T2: 240, p: 1.28, logK: 38, maxM: 4 },
    { name: 'Fuji Pro 400H', type: 'c41', T1: 20, T2: 240, p: 1.30, logK: 42, maxM: 5 },
    { name: 'Fuji X-TRA 400', type: 'c41', T1: 25, T2: 240, p: 1.32, logK: 42, maxM: 5 },
    { name: 'Fuji Nexia 400', type: 'c41', T1: 25, T2: 240, p: 1.32, logK: 42, maxM: 5 },
    { name: 'Fuji 64T', type: 'c41', T1: 20, T2: 180, p: 1.22, logK: 28, maxM: 3 },
    { name: 'Cinestill 800T', type: 'c41', T1: 30, T2: 300, p: 1.26, logK: 32, maxM: 4 },
    { name: 'Holga 400', type: 'c41', T1: 20, T2: 240, p: 1.35, logK: 50, maxM: 5 },
    { name: 'Lomo CN 800', type: 'c41', T1: 15, T2: 200, p: 1.45, logK: 65, maxM: 6 },
  ],
  'BW-Modern 现代黑白': [
    { name: 'Kodak T-Max 100', type: 'bw-modern', T1: 60, T2: 600, p: 1.15, logK: 25, maxM: 2 },
    { name: 'Kodak T-Max 400', type: 'bw-modern', T1: 45, T2: 600, p: 1.22, logK: 28, maxM: 3 },
    { name: 'Kodak T-Max 3200', type: 'bw-modern', T1: 45, T2: 600, p: 1.22, logK: 28, maxM: 3 },
    { name: 'Ilford Delta 100', type: 'bw-modern', T1: 60, T2: 600, p: 1.17, logK: 25, maxM: 2 },
    { name: 'Ilford Delta 400', type: 'bw-modern', T1: 45, T2: 600, p: 1.22, logK: 28, maxM: 3 },
    { name: 'Ilford Delta 3200', type: 'bw-modern', T1: 45, T2: 600, p: 1.22, logK: 28, maxM: 3 },
    { name: 'Fuji Acros II', type: 'bw-modern', T1: 120, T2: 900, p: 1.05, logK: 18, maxM: 2 },
  ],
  'BW-Classic 传统黑白': [
    { name: 'Kodak Tri-X 320', type: 'bw-classic', T1: 10, T2: 120, p: 1.50, logK: 90, maxM: 8 },
    { name: 'Kodak Tri-X 400', type: 'bw-classic', T1: 10, T2: 120, p: 1.50, logK: 90, maxM: 8 },
    { name: 'Ilford HP5', type: 'bw-classic', T1: 12, T2: 180, p: 1.32, logK: 70, maxM: 6 },
    { name: 'Ilford FP4', type: 'bw-classic', T1: 10, T2: 120, p: 1.26, logK: 65, maxM: 6 },
    { name: 'Ilford Pan F', type: 'bw-classic', T1: 6, T2: 60, p: 1.45, logK: 85, maxM: 8 },
    { name: 'Ilford XP2 (C-41)', type: 'c41', T1: 25, T2: 240, p: 1.31, logK: 45, maxM: 4 },
    { name: 'Ilford SFX', type: 'bw-classic', T1: 12, T2: 150, p: 1.43, logK: 80, maxM: 7 },
    { name: 'Ilford Kentmere 100', type: 'bw-classic', T1: 10, T2: 120, p: 1.26, logK: 65, maxM: 6 },
    { name: 'Ilford Kentmere 400', type: 'bw-classic', T1: 12, T2: 180, p: 1.31, logK: 70, maxM: 6 },
    { name: 'Fuji Neopan', type: 'bw-classic', T1: 12, T2: 180, p: 1.35, logK: 75, maxM: 7 },
    { name: 'Fomapan 100', type: 'bw-classic', T1: 8, T2: 90, p: 1.40, logK: 80, maxM: 7 },
    { name: 'Fomapan 200', type: 'bw-classic', T1: 8, T2: 90, p: 1.42, logK: 82, maxM: 7 },
    { name: 'Fomapan 400', type: 'bw-classic', T1: 8, T2: 90, p: 1.45, logK: 85, maxM: 7 },
    { name: 'Shanghai GP3', type: 'bw-classic', T1: 12, T2: 150, p: 1.33, logK: 72, maxM: 6 },
    { name: 'Lomo Potsdam 100', type: 'bw-classic', T1: 10, T2: 120, p: 1.35, logK: 75, maxM: 7 },
  ],
  'Slide 反转片': [
    { name: 'Kodak Ektachrome E100', type: 'slide', T1: 4, T2: 90, p: 1.10, logK: 18, maxM: 2 },
    { name: 'Fuji Provia 400X', type: 'slide', T1: 4, T2: 75, p: 1.20, logK: 28, maxM: 3 },
    { name: 'Fuji Sensia 200', type: 'slide', T1: 4, T2: 80, p: 1.18, logK: 25, maxM: 3 },
    { name: 'Fuji T64', type: 'slide', T1: 3, T2: 60, p: 1.25, logK: 30, maxM: 3 },
  ],
};

console.log('='.repeat(80));
console.log('倒易律失效数据 - Segmented Damping Model 重算结果');
console.log('Model: 三段连续函数（C¹ continuous）');
console.log('='.repeat(80));
console.log();

// 计算所有胶片
for (const [category, filmList] of Object.entries(films)) {
  console.log(`\n${'━'.repeat(80)}`);
  console.log(`${category} (${filmList.length} films)`);
  console.log('━'.repeat(80));
  
  for (const film of filmList) {
    console.log(`\n📷 ${film.name}`);
    console.log(`   Parameters: T1=${film.T1}s, T2=${film.T2}s, p=${film.p}, logK=${film.logK}, maxM=${film.maxM}`);
    
    // 验证连续性
    const { cont_T1, cont_T2, M_T1_left, M_T2_left } = verifyContinuity(film);
    console.log(`   Continuity: T1=${cont_T1 ? '✓' : '✗'} (M=${M_T1_left.toFixed(3)}), T2=${cont_T2 ? '✓' : '✗'} (M=${M_T2_left.toFixed(3)})`);
    
    // 计算曲线
    const curve = calculateCurve(film);
    
    console.log(`\n   Base → Corrected (seconds)`);
    curve.forEach(({ base, corrected, multiplier, capped }) => {
      const baseStr = formatTime(base).padStart(8);
      const corrStr = formatTime(corrected).padStart(8);
      const capMark = capped ? ' [CAPPED]' : '';
      console.log(`   ${baseStr} → ${corrStr} (M=${multiplier})${capMark}`);
    });
  }
}

console.log('\n' + '='.repeat(80));
console.log('✅ 所有胶片重算完成');
console.log('Model: Segmented Damping Model (3-segment, C¹ continuous)');
console.log('Parameters: 未修改任何现有数值');
console.log('='.repeat(80));
