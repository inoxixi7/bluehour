/* eslint-disable no-console */
const { execSync } = require('child_process');

const BASE = [1, 2, 4, 8, 15, 30, 60, 120, 240, 480, 900, 1800, 3600];

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

function getFileAt(commit, filePath) {
  return execSync(`git show ${commit}:${filePath}`, { encoding: 'utf8' });
}

function extractCurvesFromOldPhotographyTs(sourceText) {
  // Extract objects that have id: '...' and curve: [ ... ] (hardcoded curve)
  const blockRegex = /\{[\s\S]*?\bid\s*:\s*'([^']+)'[\s\S]*?\bcurve\s*:\s*\[([\s\S]*?)\][\s\S]*?\}/g;
  const curves = new Map();

  let match;
  while ((match = blockRegex.exec(sourceText)) !== null) {
    const id = match[1];
    const curveBlock = match[2];

    const pts = [];
    const ptRegex = /baseSeconds\s*:\s*(\d+)[\s\S]*?correctedSeconds\s*:\s*(\d+)/g;
    let m;
    while ((m = ptRegex.exec(curveBlock)) !== null) {
      pts.push({ t: Number(m[1]), c: Number(m[2]) });
    }

    // Old curves often only include a few points (e.g., up to 60s).
    // To fit the new model while keeping app behavior, we reconstruct the implied values
    // at BASE using the same interpolation/extrapolation as applyReciprocityCorrection().
    if (pts.length >= 2) {
      const curve = pts.map((p) => ({ baseSeconds: p.t, correctedSeconds: p.c }));
      const reconstructed = BASE.map((t) => ({ t, c: Math.round(applyReciprocityCorrection(t, curve)) }));
      curves.set(id, reconstructed);
    }
  }

  return curves;
}

function fitSegmentedParams(points) {
  const byT = new Map(points.map((p) => [p.t, p.c]));
  const targetM = BASE.map((t) => byT.get(t) / t);
  const maxMultiplier = Math.max(...targetM);

  let best = null;

  for (let i = 0; i < BASE.length - 2; i++) {
    for (let j = i + 2; j < BASE.length - 1; j++) {
      const T1 = BASE[i];
      const T2 = BASE[j];
      const M_T2 = targetM[j];
      if (!(M_T2 > 1.0001)) continue;

      const x = (T2 - T1) / T1;
      if (!(x > 0)) continue;

      const p = Math.log(M_T2 - 1) / Math.log(x);
      if (!Number.isFinite(p) || p <= 0 || p > 5) continue;

      // Derive logK from points beyond T2 (closed-form), take median for robustness.
      const logKs = [];
      for (let k = j + 1; k < BASE.length; k++) {
        const t = BASE[k];
        const M_t = targetM[k];
        const lnTerm = M_t - M_T2;
        if (!(lnTerm > 0)) continue;

        const denom = Math.exp(lnTerm) - 1;
        if (!(denom > 0)) continue;

        const logK = (t - T2) / denom;
        if (Number.isFinite(logK) && logK > 0 && logK < 5000) {
          logKs.push(logK);
        }
      }

      if (logKs.length === 0) continue;
      logKs.sort((a, b) => a - b);
      const logK = logKs[Math.floor(logKs.length / 2)];

      const params = {
        T1,
        T2,
        p: Number(p.toFixed(2)),
        logK: Math.round(logK),
        maxMultiplier: Number(maxMultiplier.toFixed(2)),
      };

      // Score by absolute error on correctedSeconds (rounded like app)
      let err = 0;
      for (let idx = 0; idx < BASE.length; idx++) {
        const t = BASE[idx];
        const target = byT.get(t);

        let M;
        if (t <= T1) {
          M = 1;
        } else if (t <= T2) {
          M = 1 + Math.pow((t - T1) / T1, p);
        } else {
          M = M_T2 + Math.log(1 + (t - T2) / logK);
        }

        const capped = Math.min(M, params.maxMultiplier);
        const pred = Math.round(t * capped);
        err += Math.abs(pred - target);
      }

      if (!best || err < best.err) {
        best = { params, err };
      }
    }
  }

  return best;
}

function main() {
  const commit = process.argv[2] || 'e3fc153';
  const oldText = getFileAt(commit, 'src/constants/Photography.ts');
  const curves = extractCurvesFromOldPhotographyTs(oldText);

  console.log(`Loaded ${curves.size} hardcoded curves from ${commit}`);

  const results = [];
  for (const [id, pts] of curves.entries()) {
    const best = fitSegmentedParams(pts);
    if (best) {
      results.push({ id, ...best });
    }
  }

  results.sort((a, b) => b.err - a.err);

  console.log('\nTop 20 worst fits (higher err = less representable by current 3-seg model):');
  for (const r of results.slice(0, 20)) {
    console.log(`${r.id.padEnd(18)} err=${String(r.err).padStart(6)}  ` +
      `T1=${r.params.T1} T2=${r.params.T2} p=${r.params.p} logK=${r.params.logK} max=${r.params.maxMultiplier}`);
  }

  console.log('\nJSON (all fitted params):');
  const out = Object.fromEntries(results.map((r) => [r.id, r.params]));
  console.log(JSON.stringify(out, null, 2));
}

main();
