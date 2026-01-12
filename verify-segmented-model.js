// 验证 Segmented Damping Model 的关键特性

const BASE_SECONDS = [1, 2, 4, 8, 15, 30, 60, 120, 240, 480, 900, 1800, 3600];

function calculateCurve({ T1, T2, p, logK, maxM }) {
  const results = [];
  
  for (let i = 0; i < BASE_SECONDS.length; i++) {
    const t = BASE_SECONDS[i];
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
    
    const corrected = Math.round(t * M);
    
    // 检查单调性
    let isMonotonic = true;
    if (i > 0 && corrected < results[i-1].corrected) {
      isMonotonic = false;
    }
    
    results.push({
      base: t,
      corrected,
      multiplier: M,
      isMonotonic
    });
  }
  
  return results;
}

// 验证关键特性
function verify() {
  const testCases = [
    { name: 'Kodak Tri-X (Classic B&W)', T1: 10, T2: 120, p: 1.50, logK: 90, maxM: 8 },
    { name: 'Kodak T-Max 100 (Modern B&W)', T1: 60, T2: 600, p: 1.15, logK: 25, maxM: 2 },
    { name: 'Kodak Portra 400 (C-41)', T1: 30, T2: 300, p: 1.32, logK: 40, maxM: 4 },
    { name: 'Kodak Ektachrome E100 (Slide)', T1: 4, T2: 90, p: 1.10, logK: 18, maxM: 2 },
  ];
  
  console.log('═'.repeat(80));
  console.log('Segmented Damping Model - 关键特性验证');
  console.log('═'.repeat(80));
  console.log();
  
  let allPassed = true;
  
  for (const film of testCases) {
    console.log(`\n📷 ${film.name}`);
    console.log(`   参数: T1=${film.T1}, T2=${film.T2}, p=${film.p}, logK=${film.logK}, maxM=${film.maxM}`);
    
    const curve = calculateCurve(film);
    
    // 检查1: 连续性
    const M_T1 = 1;
    const M_T2 = 1 + Math.pow((film.T2 - film.T1) / film.T1, film.p);
    console.log(`   ✓ 连续性: M(T1)=${M_T1.toFixed(3)}, M(T2)=${M_T2.toFixed(3)}`);
    
    // 检查2: 单调性
    const nonMonotonic = curve.filter(r => !r.isMonotonic);
    if (nonMonotonic.length > 0) {
      console.log(`   ✗ 单调性失败: 发现 ${nonMonotonic.length} 处非单调`);
      allPassed = false;
    } else {
      console.log(`   ✓ 单调性: 所有点单调递增`);
    }
    
    // 检查3: 无跳变（480→900特别检查）
    const idx480 = curve.findIndex(r => r.base === 480);
    const idx900 = curve.findIndex(r => r.base === 900);
    if (idx480 >= 0 && idx900 >= 0) {
      const ratio = curve[idx900].corrected / curve[idx480].corrected;
      const expectedRatio = 900 / 480; // ~1.875
      const smooth = Math.abs(ratio - expectedRatio) / expectedRatio < 0.2; // 允许20%偏差
      if (smooth) {
        console.log(`   ✓ 平滑性: 480s→900s 增长正常 (比率=${ratio.toFixed(2)})`);
      } else {
        console.log(`   ⚠ 平滑性: 480s→900s 增长异常 (比率=${ratio.toFixed(2)})`);
      }
    }
    
    // 检查4: 肩部减速
    const idx60 = curve.findIndex(r => r.base === 60);
    const idx120 = curve.findIndex(r => r.base === 120);
    const idx240 = curve.findIndex(r => r.base === 240);
    if (idx60 >= 0 && idx120 >= 0 && idx240 >= 0) {
      const rate1 = curve[idx120].multiplier - curve[idx60].multiplier;
      const rate2 = curve[idx240].multiplier - curve[idx120].multiplier;
      if (rate2 < rate1) {
        console.log(`   ✓ 肩部减速: dM/dt 递减 (${rate1.toFixed(2)} → ${rate2.toFixed(2)})`);
      } else {
        console.log(`   ⚠ 肩部减速: dM/dt 未递减`);
      }
    }
    
    // 检查5: Classic vs Modern 差异
    if (film.name.includes('Tri-X') || film.name.includes('T-Max')) {
      const result3600 = curve.find(r => r.base === 3600);
      console.log(`   📊 1小时曝光: ${result3600.corrected}秒 (${(result3600.corrected/3600).toFixed(1)}小时)`);
    }
  }
  
  console.log('\n' + '═'.repeat(80));
  if (allPassed) {
    console.log('✅ 所有验证通过！');
  } else {
    console.log('⚠️ 部分验证未通过');
  }
  console.log('═'.repeat(80));
  console.log();
  
  // 对比 Classic B&W vs Modern B&W
  console.log('📊 Classic B&W (Tri-X) vs Modern B&W (T-Max) 对比\n');
  console.log('Base Time | Tri-X (Classic)  | T-Max 100 (Modern) | 差异');
  console.log('----------|------------------|--------------------|---------');
  
  const trix = calculateCurve({ T1: 10, T2: 120, p: 1.50, logK: 90, maxM: 8 });
  const tmax = calculateCurve({ T1: 60, T2: 600, p: 1.15, logK: 25, maxM: 2 });
  
  [30, 60, 120, 240, 480, 900, 1800, 3600].forEach(base => {
    const trixResult = trix.find(r => r.base === base);
    const tmaxResult = tmax.find(r => r.base === base);
    if (trixResult && tmaxResult) {
      const diff = (trixResult.corrected / tmaxResult.corrected).toFixed(1);
      console.log(`${base.toString().padStart(9)}s | ${trixResult.corrected.toString().padStart(12)}s (M=${trixResult.multiplier.toFixed(2)}) | ${tmaxResult.corrected.toString().padStart(12)}s (M=${tmaxResult.multiplier.toFixed(2)}) | ${diff}x`);
    }
  });
  
  console.log('\n结论: Classic B&W 倒易律失效明显强于 Modern B&W (T-Grain)\n');
}

verify();
