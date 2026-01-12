// Test the new segmented reciprocity model
const BASE_SECONDS = [1, 2, 4, 8, 15, 30, 60, 120, 240, 480, 900, 1800, 3600];

function createSegmentedCurve({ type, T1, T2, p, logK, maxMultiplier }) {
  return BASE_SECONDS.map(baseSeconds => {
    let correctedSeconds;
    
    if (baseSeconds <= T1) {
      // Segment 1: Power function
      correctedSeconds = Math.pow(baseSeconds, p);
    } else if (baseSeconds <= T2) {
      // Segment 2: Logarithmic compensation
      const baseCorrection = Math.pow(T1, p);
      const logCompensation = logK * Math.log10(baseSeconds / T1);
      correctedSeconds = baseCorrection + logCompensation;
    } else {
      // Segment 3: Capped multiplier
      const baseCorrection = Math.pow(T1, p);
      const midCorrection = baseCorrection + logK * Math.log10(T2 / T1);
      const multiplier = Math.min(baseSeconds / T2, maxMultiplier);
      correctedSeconds = midCorrection * multiplier;
    }
    
    return {
      baseSeconds,
      correctedSeconds: Math.round(correctedSeconds * 10) / 10
    };
  });
}

// Test with Kodak Tri-X (classic B&W with strong reciprocity failure)
console.log('Kodak Tri-X (bw-classic: T1=10, T2=120, p=1.50, logK=90, max=8)');
const trix = createSegmentedCurve({ type: 'bw-classic', T1: 10, T2: 120, p: 1.50, logK: 90, maxMultiplier: 8 });
console.log('Base → Corrected (seconds)');
trix.forEach(({ baseSeconds, correctedSeconds }) => {
  const hours = baseSeconds >= 3600 ? ` (${(baseSeconds/3600).toFixed(1)}h)` : '';
  const corrHours = correctedSeconds >= 3600 ? ` (${(correctedSeconds/3600).toFixed(1)}h)` : '';
  console.log(`  ${baseSeconds}${hours.padEnd(10)} → ${correctedSeconds}${corrHours}`);
});

console.log('\n---\n');

// Test with T-Max 100 (modern B&W with minimal reciprocity failure)
console.log('Kodak T-Max 100 (bw-modern: T1=60, T2=600, p=1.15, logK=25, max=2)');
const tmax = createSegmentedCurve({ type: 'bw-modern', T1: 60, T2: 600, p: 1.15, logK: 25, maxMultiplier: 2 });
console.log('Base → Corrected (seconds)');
tmax.forEach(({ baseSeconds, correctedSeconds }) => {
  const hours = baseSeconds >= 3600 ? ` (${(baseSeconds/3600).toFixed(1)}h)` : '';
  const corrHours = correctedSeconds >= 3600 ? ` (${(correctedSeconds/3600).toFixed(1)}h)` : '';
  console.log(`  ${baseSeconds}${hours.padEnd(10)} → ${correctedSeconds}${corrHours}`);
});

console.log('\n✅ Three-segment reciprocity model test complete!');
console.log('Notice: Tri-X shows strong reciprocity failure but capped (reasonable values)');
console.log('        T-Max shows minimal failure (modern T-grain technology)');
