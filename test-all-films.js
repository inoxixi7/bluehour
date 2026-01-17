const fs = require('fs');
const path = require('path');
const allfilmConfig = require('./docs/allfilm.json');

const BASE_SECONDS = [1, 2, 4, 8, 15, 30, 60, 120, 240, 480, 900, 1800, 3600];

const formatTime = (seconds) => {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
  return `${(seconds / 3600).toFixed(2)}h`;
};

const calculateMultiplier = (t, params) => {
  const { T1, p, maxMultiplier } = params;
  const ratio = Math.max(1, t / Math.max(T1, 1));
  return Math.min(Math.pow(ratio, p), maxMultiplier);
};

console.log('='.repeat(100));
console.log('Reciprocity Model - All Films Test Output');
console.log('='.repeat(100));

const outputLines = [];

allfilmConfig.films.forEach(group => {
  const params = {
    T1: group.params.t1,
    p: group.params.p,
    maxMultiplier: group.params.max_mult,
  };

  group.names.forEach(name => {
    outputLines.push('');
    outputLines.push(`[${name}]`);
    outputLines.push(`T1=${params.T1}, p=${params.p}, maxM=${params.maxMultiplier}`);
    outputLines.push('Base -> Corrected (multiplier)');

    BASE_SECONDS.forEach((t) => {
      const M = calculateMultiplier(t, params);
      const corrected = Math.round(t * M);
      outputLines.push(`${t.toString().padStart(4)}s -> ${corrected.toString().padStart(6)}s (${M.toFixed(2)}x)  [${formatTime(corrected)}]`);
    });
  });
});

console.log(outputLines.join('\n'));

const outputPath = path.join(__dirname, 'docs', 'allfilm_results.txt');
fs.writeFileSync(outputPath, outputLines.join('\n') + '\n', 'utf-8');

console.log('\n' + '='.repeat(100));
console.log(`Done. Exported: ${outputPath}`);
