function calc(t, {T1, T2, p, logK, maxM}) {
  let M;
  if (t <= T1) M = 1;
  else if (t <= T2) {
    M = 1 + Math.pow((t - T1) / T1, p);
    M = Math.min(M, maxM);
  } else {
    const M_T2_raw = 1 + Math.pow((T2 - T1) / T1, p);
    const M_T2 = Math.min(M_T2_raw, maxM);
    M = Math.min(M_T2 + Math.log(1 + (t - T2) / logK), maxM);
  }
  return M;
}

const tests = [
  [10, 70, 1.6, 10, 25],
  [10, 80, 1.5, 12, 25],
  [15, 90, 1.4, 14, 24],
  [15, 100, 1.35, 16, 23],
  [20, 100, 1.3, 18, 22],
  [15, 85, 1.45, 12, 25],
  [12, 75, 1.55, 11, 26],
];

const t = 1800;
const target = 22740;

console.log('目标: 1800秒 → 22740秒 (12.63x)\n');

let best = null;
let bestErr = Infinity;

tests.forEach(([T1, T2, p, logK, maxM]) => {
  const M = calc(t, {T1, T2, p, logK, maxM});
  const r = Math.round(t * M);
  const e = Math.abs(r - target);
  const pct = ((e/target)*100).toFixed(1);
  
  if (e < bestErr) {
    bestErr = e;
    best = {T1, T2, p, logK, maxM, M, r};
  }
  
  const s = e < 900 ? '✓✓' : e < 1800 ? '✓ ' : '✗ ';
  console.log(`${s} T1=${T1},T2=${T2},p=${p},logK=${logK},maxM=${maxM} → ${M.toFixed(2)}x → ${r}s (${(r/3600).toFixed(2)}h) 误差${e}s (${pct}%)`);
});

console.log(`\n🏆 最佳: T1=${best.T1},T2=${best.T2},p=${best.p},logK=${best.logK},maxM=${best.maxM}`);
console.log(`   结果: ${best.M.toFixed(2)}x → ${best.r}s (${(best.r/3600).toFixed(2)}h) 误差${bestErr}s\n`);

// 验证该参数
console.log('时间点验证:');
[30,60,120,240,480,900,1800,3600].forEach(time => {
  const M = calc(time, best);
  const r = Math.round(time * M);
  console.log(`${(time/60).toString().padStart(4)}分 → ${M.toFixed(2)}x → ${(r/60).toFixed(0).padStart(4)}分 (${(r/3600).toFixed(1)}h)`);
});
