const fs = require('fs');
const path = require('path');

const allfilmPath = path.join(__dirname, 'docs', 'allfilm.json');
const allfilm = JSON.parse(fs.readFileSync(allfilmPath, 'utf-8'));

const baseTimes = [60, 900, 1800, 2700, 3600, 5400, 7200, 10800, 14400];

const parseTime = (value) => {
  if (typeof value === 'number') return value;
  const v = value.trim().toLowerCase();
  if (v.endsWith('h')) {
    return parseFloat(v.slice(0, -1)) * 3600;
  }
  if (v.endsWith('m')) {
    return parseFloat(v.slice(0, -1)) * 60;
  }
  if (v.endsWith('s')) {
    return parseFloat(v.slice(0, -1));
  }
  if (v === '1:1') {
    return 60; // 1s-1m 视为 1m 保持线性
  }
  throw new Error(`Unknown time format: ${value}`);
};

const calcAdjusted = (t, params) => {
  const ratio = Math.max(1, t / Math.max(params.t1, 1));
  const multiplier = Math.min(Math.pow(ratio, params.p), params.max_mult);
  return t * multiplier;
};

const calcError = (params, targets) => {
  let error = 0;
  baseTimes.forEach((t, idx) => {
    const target = targets[idx];
    const predicted = calcAdjusted(t, params);
    const diff = predicted - target;
    error += diff * diff;
  });
  return error;
};

const fitParams = (targets, constraints) => {
  const maxRatio = Math.max(...targets.map((t, idx) => t / baseTimes[idx]));
  const t1Range = constraints.t1 ? [constraints.t1] : [5, 800];
  const pRange = constraints.p ? [constraints.p] : [0.2, 1.6];
  const maxRange = constraints.max_mult ? [constraints.max_mult] : [Math.min(maxRatio, 10), Math.max(maxRatio, 10)];

  let best = { t1: t1Range[0], p: pRange[0], max_mult: maxRange[0] };
  let bestError = Number.POSITIVE_INFINITY;

  const iterations = 20000;
  for (let i = 0; i < iterations; i++) {
    const t1 = constraints.t1 ?? (t1Range[0] + Math.random() * (t1Range[1] - t1Range[0]));
    const p = constraints.p ?? (pRange[0] + Math.random() * (pRange[1] - pRange[0]));
    const max_mult = constraints.max_mult ?? maxRatio;

    const params = { t1, p, max_mult };
    const error = calcError(params, targets);

    if (error < bestError) {
      bestError = error;
      best = params;
    }
  }

  return best;
};

const targetsByGroup = {
  kodak_vision3_series: ['1:1', '17m', '37m', '59m', '1.3h', '2.0h', '2.8h', '4.2h', '5.6h'],
  kodak_portra_series: ['1:1', '22m', '45m', '1.1h', '1.5h', '2.2h', '3.0h', '4.5h', '6.0h'],
  kodak_ektar_100: ['1.3m', '32m', '1.1h', '1.6h', '2.2h', '3.3h', '4.5h', '6.7h', '9.0h'],
  consumer_color_neg: ['1.4m', '38m', '1.3h', '1.9h', '2.5h', '3.7h', '5.0h', '7.5h', '10.0h'],
  modern_bw_t_grain: ['1.3m', '30m', '1.1h', '1.6h', '2.2h', '3.4h', '4.5h', '6.7h', '9.0h'],
  fuji_acros_series: ['1:1', '17m', '36m', '57m', '1.3h', '2.0h', '2.8h', '4.2h', '5.6h'],
  traditional_bw_standard: ['2.5m', '1.2h', '2.5h', '3.7h', '5.0h', '7.5h', '10h', '15h', '20h'],
  traditional_bw_mild: ['1.6m', '1.2h', '2.5h', '3.7h', '5.0h', '7.5h', '10h', '15h', '20h'],
  ilford_pan_f_50: ['6.0m', '4.5h', '10h', '15h', '20h', '30h', '40h', '60h', '80h'],
  modern_slide_e6: ['1.1m', '25m', '55m', '1.4h', '2.0h', '3.0h', '4.2h', '6.3h', '8.4h'],
  classic_slide_e6: ['1.5m', '28m', '1.1h', '1.6h', '2.2h', '3.3h', '4.5h', '6.7h', '9.0h'],
  sensitive_slide_e6: ['3.5m', '1.0h', '2.2h', '3.3h', '4.4h', '6.6h', '8.8h', '13.2h', '17.6h'],
  lomo_cn_holga: ['2.8m', '1.3h', '2.8h', '4.2h', '5.5h', '8.2h', '11h', '16.5h', '22h'],
};

const constraintsByGroup = {
  kodak_vision3_series: { t1: 480 },
  fuji_acros_series: { t1: 480, p: 0.35 },
  kodak_portra_series: { t1: 60 },
  modern_slide_e6: { t1: 10 },
  classic_slide_e6: { t1: 8 },
  sensitive_slide_e6: { t1: 4, max_mult: 4.0 },
  modern_bw_t_grain: { t1: 60 },
  traditional_bw_standard: { p: 1.31, max_mult: 6.0 },
  traditional_bw_mild: { max_mult: 5.0 },
  ilford_pan_f_50: { max_mult: 10.0 },
  kodak_ektar_100: {},
  consumer_color_neg: {},
  lomo_cn_holga: {},
};

const targetsSeconds = Object.fromEntries(
  Object.entries(targetsByGroup).map(([groupId, values]) => [
    groupId,
    values.map(parseTime),
  ])
);

const updates = {};

allfilm.films.forEach(group => {
  if (!targetsSeconds[group.id]) return;
  const targets = targetsSeconds[group.id];
  const constraints = constraintsByGroup[group.id] || {};
  const params = fitParams(targets, constraints);
  updates[group.id] = params;
  group.params = {
    t1: Math.round(params.t1),
    p: Math.round(params.p * 100) / 100,
    max_mult: Math.round(params.max_mult * 100) / 100,
  };
});

// 将 Lomo CN 800 / Holga 400 拆分到新分组
const lomoGroup = allfilm.films.find(g => g.id === 'lomo_cn_holga');
if (!lomoGroup) {
  allfilm.films.push({
    id: 'lomo_cn_holga',
    names: ['Lomo CN 800', 'Holga 400'],
    params: updates.lomo_cn_holga || { t1: 45, p: 0.45, max_mult: 2.5 },
  });
}

// 从 consumer_color_neg 和 sensitive_slide_e6 中移除 Lomo CN 800 / Holga 400
allfilm.films.forEach(group => {
  if (group.id === 'consumer_color_neg') {
    group.names = group.names.filter(name => name !== 'Lomo CN 800');
  }
  if (group.id === 'sensitive_slide_e6') {
    group.names = group.names.filter(name => name !== 'Holga 400');
  }
});

fs.writeFileSync(allfilmPath, JSON.stringify(allfilm, null, 2) + '\n', 'utf-8');

console.log('Updated params:');
Object.entries(updates).forEach(([id, params]) => {
  console.log(`${id}: t1=${params.t1.toFixed(1)}, p=${params.p.toFixed(3)}, max_mult=${params.max_mult.toFixed(2)}`);
});
