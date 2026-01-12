// 测试 maxMultiplier 问题
const BASE_SECONDS = [1, 5, 10, 30, 60, 120, 300, 600, 900];
const T1 = 60, T2 = 600, p = 0.44, logK = 10, maxM = 3;

console.log("kodak_tmax100 参数: T1=60, T2=600, p=0.44, logK=10, maxM=3\n");
console.log("当前 Photography.ts 实现 (Zone B 不截断):");
console.log("=".repeat(70));

BASE_SECONDS.forEach(t => {
  let M;
  if (t <= T1) M = 1;
  else if (t <= T2) M = 1 + Math.pow((t-T1)/T1, p);
  else {
    const M_T2 = 1 + Math.pow((T2-T1)/T1, p);
    M = Math.min(M_T2 + Math.log(1+(t-T2)/logK), maxM);
  }
  const corr = Math.round(t * M);
  const exceedsMax = M > maxM;
  console.log(`t=${t.toString().padStart(3)}s: M=${M.toFixed(4)} → ${corr.toString().padStart(4)}s ${exceedsMax ? '⚠️ EXCEEDS maxM!' : ''}`);
});

console.log("\n" + "=".repeat(70));
console.log("\n如果修复为 Zone B 也应用 maxMultiplier:");
console.log("=".repeat(70));

BASE_SECONDS.forEach(t => {
  let M;
  if (t <= T1) M = 1;
  else if (t <= T2) {
    M = 1 + Math.pow((t-T1)/T1, p);
    M = Math.min(M, maxM);  // 添加截断
  }
  else {
    const M_T2 = Math.min(1 + Math.pow((T2-T1)/T1, p), maxM);
    M = Math.min(M_T2 + Math.log(1+(t-T2)/logK), maxM);
  }
  const corr = Math.round(t * M);
  console.log(`t=${t.toString().padStart(3)}s: M=${M.toFixed(4)} → ${corr.toString().padStart(4)}s`);
});
