/* eslint-disable no-console */
const { execSync } = require('child_process');

const BASE = [1, 2, 4, 8, 15, 30, 60, 120, 240, 480, 900, 1800, 3600];
const IDS = [
  'foma100',
  'foma200',
  'foma400',
  'fuji_acros',
  'fuji_astia100f',
  'fuji_provia100f',
  'fuji_velvia50',
  'fuji_velvia100',
  'fuji_velvia100f',
];

function applyReciprocityCorrection(baseSeconds, curve) {
  if (!curve || curve.length === 0 || baseSeconds <= 0) {
    return baseSeconds;
  }

  const sorted = [...curve].sort((a, b) => a.baseSeconds - b.baseSeconds);

  if (baseSeconds <= sorted[0].baseSeconds) {
    return sorted[0].correctedSeconds;
  }

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];

    if (baseSeconds === current.baseSeconds) {
      return current.correctedSeconds;
    }

    if (baseSeconds < next.baseSeconds) {
      const ratio =
        (baseSeconds - current.baseSeconds) /
        (next.baseSeconds - current.baseSeconds);
      return current.correctedSeconds + ratio * (next.correctedSeconds - current.correctedSeconds);
    }
  }

  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2] || last;
  const gradient =
    prev === last
      ? last.correctedSeconds / Math.max(last.baseSeconds, 1)
      : (last.correctedSeconds - prev.correctedSeconds) /
        (last.baseSeconds - prev.baseSeconds);

  return last.correctedSeconds + gradient * (baseSeconds - last.baseSeconds);
}

function getOldHardcodedCurve(sourceText, id) {
  // Strictly match one film object block by id, then extract its curve array.
  const filmRegex = new RegExp(
    String.raw`\{\s*id:\s*'${id}'[\s\S]*?\bcurve\s*:\s*\[([\s\S]*?)\]\s*,?[\s\S]*?\}`,
    'm'
  );
  const m = filmRegex.exec(sourceText);
  if (!m) return null;

  const curveText = m[1];
  const pts = [];
  const ptRegex = /baseSeconds\s*:\s*(\d+)[\s\S]*?correctedSeconds\s*:\s*(\d+)/g;
  let mm;
  while ((mm = ptRegex.exec(curveText)) !== null) {
    pts.push({ baseSeconds: Number(mm[1]), correctedSeconds: Number(mm[2]) });
  }
  return pts.length >= 2 ? pts : null;
}

function fitSegmentedParams(targetCurve) {
  // targetCurve is defined at BASE points (t -> correctedSeconds)
  const byT = new Map(targetCurve.map((p) => [p.t, p.c]));
  const targetM = BASE.map((t) => byT.get(t) / t);
  const maxMultiplier = Math.max(...targetM);

  // Grid-search a small candidate set. This is intentionally simple and deterministic.
  const pCandidates = [];
  for (let p = 0.15; p <= 2.0 + 1e-9; p += 0.05) {
    pCandidates.push(Number(p.toFixed(2)));
  }

  const logKCandidates = [
    5, 8, 12, 18, 25, 35, 50, 70, 90, 120, 160, 220, 300, 420, 600, 850, 1200, 1700, 2400,
  ];

  function predictCorrected(t, params) {
    const { T1, T2, p, logK, maxMultiplier: maxM } = params;

    let M;
    if (t <= T1) {
      M = 1;
    } else if (t <= T2) {
      M = 1 + Math.pow((t - T1) / T1, p);
      M = Math.min(M, maxM);
    } else {
      const M_T2_raw = 1 + Math.pow((T2 - T1) / T1, p);
      const M_T2 = Math.min(M_T2_raw, maxM);
      const M_raw = M_T2 + Math.log(1 + (t - T2) / logK);
      M = Math.min(M_raw, maxM);
    }
    return Math.round(t * M);
  }

  let best = null;
  for (let i = 0; i < BASE.length - 2; i++) {
    for (let j = i + 1; j < BASE.length - 1; j++) {
      const T1 = BASE[i];
      const T2 = BASE[j];
      if (!(T2 > T1)) continue;

      for (const p of pCandidates) {
        for (const logK of logKCandidates) {
          const params = {
            T1,
            T2,
            p,
            logK,
            maxMultiplier: Number(maxMultiplier.toFixed(2)),
          };

          let err = 0;
          for (const t of BASE) {
            const target = byT.get(t);
            const pred = predictCorrected(t, params);
            err += Math.abs(pred - target);
          }

          if (!best || err < best.err) {
            best = { params, err };
          }
        }
      }
    }
  }

  return best;
}

function main() {
  const commit = process.argv[2] || 'e3fc153';
  const oldText = execSync(`git show ${commit}:src/constants/Photography.ts`, { encoding: 'utf8' });

  const out = {};

  for (const id of IDS) {
    const curve = getOldHardcodedCurve(oldText, id);
    if (!curve) {
      console.log(`${id}: not found (or not hardcoded curve)`);
      continue;
    }

    const reconstructed = BASE.map((t) => ({
      t,
      c: Math.round(applyReciprocityCorrection(t, curve)),
    }));

    const best = fitSegmentedParams(reconstructed);
    if (!best) {
      console.log(`${id}: fit failed`);
      continue;
    }

    out[id] = best.params;
    console.log(`${id.padEnd(16)} err=${String(best.err).padStart(6)}  ` +
      `T1=${best.params.T1} T2=${best.params.T2} p=${best.params.p} logK=${best.params.logK} max=${best.params.maxMultiplier}`);
  }

  console.log('\nJSON:');
  console.log(JSON.stringify(out, null, 2));
}

main();
