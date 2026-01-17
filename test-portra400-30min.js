/**
 * 测试 Kodak Portra 400 的 30 分钟（1800秒）倒易率计算
 */

function calculateSegmentedMultiplier(t, params) {
  const { T1, T2, p, logK, maxMultiplier } = params;
  let M;

  if (t <= T1) {
    M = 1;
  } else if (t <= T2) {
    M = 1 + Math.pow((t - T1) / T1, p);
    M = Math.min(M, maxMultiplier);
  } else {
    const M_T2_raw = 1 + Math.pow((T2 - T1) / T1, p);
    const M_T2 = Math.min(M_T2_raw, maxMultiplier);
    const M_raw = M_T2 + Math.log(1 + (t - T2) / logK);
    M = Math.min(M_raw, maxMultiplier);
  }

  return M;
}

// Kodak Portra 400 参数
const portra400 = {
  T1: 30,
  T2: 300,
  p: 0.56,
  logK: 17,
  maxMultiplier: 4
};

console.log('═'.repeat(80));
console.log('📷 Kodak Portra 400 - 30分钟曝光计算详解');
console.log('═'.repeat(80));
console.log();

const baseTime = 1800; // 30分钟 = 1800秒
console.log(`基础曝光时间: ${baseTime}秒 (${baseTime/60}分钟)`);
console.log();

console.log('胶片参数:');
console.log(`  T1 (无补偿区结束): ${portra400.T1}秒`);
console.log(`  T2 (幂函数区结束): ${portra400.T2}秒`);
console.log(`  p (幂函数指数): ${portra400.p}`);
console.log(`  logK (对数系数): ${portra400.logK}`);
console.log(`  maxMultiplier (最大倍率): ${portra400.maxMultiplier}`);
console.log();

// 判断使用哪个区间
let segment;
if (baseTime <= portra400.T1) {
  segment = 1;
} else if (baseTime <= portra400.T2) {
  segment = 2;
} else {
  segment = 3;
}

console.log(`判断: ${baseTime}秒 > T2(${portra400.T2}秒) → 使用第${segment}段 (Shoulder - 对数阻尼)`);
console.log();

// 详细计算过程
console.log('计算过程:');

// 先计算 M_T2
const M_T2_raw = 1 + Math.pow((portra400.T2 - portra400.T1) / portra400.T1, portra400.p);
console.log(`  步骤1: 计算T2处的倍率`);
console.log(`    M_T2_raw = 1 + ((T2 - T1) / T1)^p`);
console.log(`    M_T2_raw = 1 + ((${portra400.T2} - ${portra400.T1}) / ${portra400.T1})^${portra400.p}`);
console.log(`    M_T2_raw = 1 + (${portra400.T2 - portra400.T1} / ${portra400.T1})^${portra400.p}`);
console.log(`    M_T2_raw = 1 + ${((portra400.T2 - portra400.T1) / portra400.T1).toFixed(2)}^${portra400.p}`);
console.log(`    M_T2_raw = 1 + ${Math.pow((portra400.T2 - portra400.T1) / portra400.T1, portra400.p).toFixed(3)}`);
console.log(`    M_T2_raw = ${M_T2_raw.toFixed(3)}`);

const M_T2 = Math.min(M_T2_raw, portra400.maxMultiplier);
console.log(`    M_T2 = min(${M_T2_raw.toFixed(3)}, ${portra400.maxMultiplier}) = ${M_T2.toFixed(3)}`);
console.log();

// 计算对数部分
const logPart = 1 + (baseTime - portra400.T2) / portra400.logK;
const logValue = Math.log(logPart);
console.log(`  步骤2: 计算对数增长部分`);
console.log(`    对数参数 = 1 + (t - T2) / logK`);
console.log(`    对数参数 = 1 + (${baseTime} - ${portra400.T2}) / ${portra400.logK}`);
console.log(`    对数参数 = 1 + ${baseTime - portra400.T2} / ${portra400.logK}`);
console.log(`    对数参数 = 1 + ${((baseTime - portra400.T2) / portra400.logK).toFixed(2)}`);
console.log(`    对数参数 = ${logPart.toFixed(2)}`);
console.log(`    ln(${logPart.toFixed(2)}) = ${logValue.toFixed(3)}`);
console.log();

const M_raw = M_T2 + logValue;
console.log(`  步骤3: 计算原始倍率`);
console.log(`    M_raw = M_T2 + ln(对数参数)`);
console.log(`    M_raw = ${M_T2.toFixed(3)} + ${logValue.toFixed(3)}`);
console.log(`    M_raw = ${M_raw.toFixed(3)}`);
console.log();

const M = Math.min(M_raw, portra400.maxMultiplier);
console.log(`  步骤4: 应用最大倍率限制`);
console.log(`    M = min(M_raw, maxMultiplier)`);
console.log(`    M = min(${M_raw.toFixed(3)}, ${portra400.maxMultiplier})`);
console.log(`    M = ${M.toFixed(3)}`);
console.log();

// 使用函数验证
const M_function = calculateSegmentedMultiplier(baseTime, portra400);
console.log(`验证: 使用函数计算 M = ${M_function.toFixed(3)}`);
console.log();

// 最终结果
const correctedTime = Math.round(baseTime * M);
const correctedMinutes = correctedTime / 60;
const correctedHours = correctedTime / 3600;

console.log('═'.repeat(80));
console.log('📊 最终结果:');
console.log('═'.repeat(80));
console.log(`基础曝光时间:   ${baseTime}秒 (${baseTime/60}分钟)`);
console.log(`倒易率倍率:     ${M.toFixed(3)}x`);
console.log(`校正后时间:     ${correctedTime}秒`);
console.log(`               = ${correctedMinutes.toFixed(1)}分钟`);
console.log(`               = ${correctedHours.toFixed(2)}小时`);
console.log('═'.repeat(80));

// 对比一些其他时间点
console.log();
console.log('其他时间点对比:');
console.log('═'.repeat(80));
console.log('基础时间 | 倍率(M) | 校正时间      | 说明');
console.log('-'.repeat(80));

const testPoints = [
  { t: 30, desc: '30秒 (T1边界)' },
  { t: 60, desc: '1分钟' },
  { t: 120, desc: '2分钟' },
  { t: 300, desc: '5分钟 (T2边界)' },
  { t: 600, desc: '10分钟' },
  { t: 900, desc: '15分钟' },
  { t: 1800, desc: '30分钟' },
  { t: 3600, desc: '1小时' }
];

for (const point of testPoints) {
  const m = calculateSegmentedMultiplier(point.t, portra400);
  const corr = Math.round(point.t * m);
  const corrMin = (corr / 60).toFixed(1);
  const corrHr = (corr / 3600).toFixed(2);
  
  let timeStr;
  if (corr < 120) {
    timeStr = `${corr}秒`;
  } else if (corr < 3600) {
    timeStr = `${corrMin}分`;
  } else {
    timeStr = `${corrHr}小时`;
  }
  
  const highlight = point.t === baseTime ? ' ← 当前查询' : '';
  console.log(`${point.desc.padEnd(15)} | ${m.toFixed(3)} | ${timeStr.padEnd(12)} | ${highlight}`);
}

console.log('═'.repeat(80));
console.log();
