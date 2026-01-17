function c(t, p) {
  let M;
  const { T1, T2, p: pp, logK, maxM } = p;
  if (t <= T1) M = 1;
  else if (t <= T2) {
    M = 1 + Math.pow((t - T1) / T1, pp);
    M = Math.min(M, maxM);
  } else {
    const M2 = Math.min(1 + Math.pow((T2 - T1) / T1, pp), maxM);
    M = Math.min(M2 + Math.log(1 + (t - T2) / logK), maxM);
  }
  return M;
}

const params = [
  { T1: 20, T2: 100, p: 1.35, logK: 14, maxM: 24 },
  { T1: 18, T2: 95, p: 1.35, logK: 14, maxM: 24 },
  { T1: 20, T2: 105, p: 1.33, logK: 15, maxM: 24 },
  { T1: 19, T2: 98, p: 1.34, logK: 14.5, maxM: 24 },
  { T1: 20, T2: 100, p: 1.34, logK: 14.5, maxM: 23.5 },
];

const t = 1800;
const target = 22740;

console.log('目标: 1800秒 → 22740秒 (6.32小时)\n');

let best = null;
let bestErr = Infinity;

params.forEach(p => {
  const M = c(t, p);
  const r = Math.round(t * M);
  const err = Math.abs(r - target);
  const errMin = Math.round(err / 60);
  
  if (err < bestErr) {
    bestErr = err;
    best = { ...p, M, r };
  }
  
  const s = err < 600 ? '✓✓' : err < 1200 ? '✓ ' : '✗ ';
  console.log(`${s} T1=${p.T1},T2=${p.T2},p=${p.p},logK=${p.logK},maxM=${p.maxM} → ${M.toFixed(2)}x → ${(r/3600).toFixed(2)}h (误差${errMin}分)`);
});

console.log(`\n🏆 最佳: T1=${best.T1},T2=${best.T2},p=${best.p},logK=${best.logK},maxM=${best.maxM}`);
console.log(`   ${best.M.toFixed(2)}x → ${best.r}秒 (${(best.r/3600).toFixed(2)}小时)`);
console.log(`   误差: ${Math.round(bestErr/60)}分钟\n`);

console.log('时间点验证:');
[30, 60, 120, 240, 480, 900, 1800, 3600].forEach(time => {
  const M = c(time, best);
  const r = Math.round(time * M);
  const tStr = time < 60 ? `${time}秒` : `${time/60}分`;
  const rStr = r < 3600 ? `${Math.round(r/60)}分` : `${(r/3600).toFixed(1)}小时`;
  console.log(`${tStr.padEnd(6)} → ${M.toFixed(2)}x → ${rStr}`);
});
