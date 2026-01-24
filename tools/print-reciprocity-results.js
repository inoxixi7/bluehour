const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const photographyPath = path.join(rootDir, 'src', 'constants', 'Photography.ts');
const allfilmPath = path.join(rootDir, 'docs', 'allfilm.json');
const enhancedPath = path.join(rootDir, 'film-reciprocity-config-enhanced.json');

const BASE_SECONDS = [1, 2, 4, 8, 15, 30, 60, 120, 240, 480, 900, 1800, 3600];

const normalizeName = (value) => value.trim().toLowerCase();

const createSegmentedCurve = ({ T1, p, maxMultiplier }) => {
  return BASE_SECONDS.map((t) => {
    const ratio = Math.max(1, t / Math.max(T1, 1));
    const multiplier = Math.min(Math.pow(ratio, p), maxMultiplier);
    const correctedSeconds = Math.round(t * multiplier);
    return { baseSeconds: t, correctedSeconds };
  });
};

const loadJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

const photographySource = fs.readFileSync(photographyPath, 'utf8');
const allfilmConfig = loadJson(allfilmPath);
const enhancedConfig = loadJson(enhancedPath);

const explicitNameToIdMatch = photographySource.match(/const explicitNameToId = new Map<[^>]*>\(\[([\s\S]*?)\]\);/);
const explicitPairsSource = explicitNameToIdMatch ? explicitNameToIdMatch[1] : '';
const explicitPairs = [];
const pairRegex = /\['([^']+)'\s*,\s*'([^']+)'\]/g;
let pairMatch;
while ((pairMatch = pairRegex.exec(explicitPairsSource))) {
  explicitPairs.push([pairMatch[1], pairMatch[2]]);
}

const nameToId = new Map();
const idToType = new Map();

(enhancedConfig.films || []).forEach((category) => {
  (category.films || []).forEach((film) => {
    if (film?.id && film?.type) {
      idToType.set(film.id, film.type);
    }
    if (film?.name && film?.id) {
      nameToId.set(normalizeName(film.name), film.id);
    }
  });
});

explicitPairs.forEach(([name, id]) => {
  nameToId.set(normalizeName(name), id);
});

const reciprocityParamsById = new Map();
(allfilmConfig.films || []).forEach((group) => {
  const { t1, p, max_mult } = group.params || {};
  (group.names || []).forEach((name) => {
    const id = nameToId.get(normalizeName(name));
    if (!id) return;
    const type = idToType.get(id) ?? 'c41';
    reciprocityParamsById.set(id, {
      type,
      T1: t1,
      p,
      maxMultiplier: max_mult,
    });
  });
});

const defaultParamsById = new Map();
const profileRegex = /createReciprocityProfile\(\s*'([^']+)'[\s\S]*?,\s*\{([\s\S]*?)\}\s*\)/g;
let profileMatch;
while ((profileMatch = profileRegex.exec(photographySource))) {
  const id = profileMatch[1];
  const paramsBlock = profileMatch[2];
  const typeMatch = paramsBlock.match(/type:\s*'([^']+)'/);
  const t1Match = paramsBlock.match(/\bT1:\s*([\d.]+)/);
  const t2Match = paramsBlock.match(/\bT2:\s*([\d.]+)/);
  const pMatch = paramsBlock.match(/\bp:\s*([\d.]+)/);
  const logKMatch = paramsBlock.match(/\blogK:\s*([\d.]+)/);
  const maxMultMatch = paramsBlock.match(/\bmaxMultiplier:\s*([\d.]+)/);

  if (!typeMatch || !t1Match || !pMatch || !maxMultMatch) {
    continue;
  }

  defaultParamsById.set(id, {
    type: typeMatch[1],
    T1: Number(t1Match[1]),
    T2: t2Match ? Number(t2Match[1]) : undefined,
    p: Number(pMatch[1]),
    logK: logKMatch ? Number(logKMatch[1]) : undefined,
    maxMultiplier: Number(maxMultMatch[1]),
  });
}

const results = [];
results.push({
  id: 'digital',
  type: 'digital',
  params: null,
  curve: [],
});

Array.from(defaultParamsById.entries()).forEach(([id, fallbackParams]) => {
  const resolvedParams = reciprocityParamsById.get(id) ?? fallbackParams;
  const curve = createSegmentedCurve(resolvedParams);
  results.push({
    id,
    type: resolvedParams.type,
    params: resolvedParams,
    curve,
  });
});

results.sort((a, b) => a.id.localeCompare(b.id));

const output = {
  generatedAt: new Date().toISOString(),
  baseSeconds: BASE_SECONDS,
  totalProfiles: results.length,
  profiles: results,
};

console.log(JSON.stringify(output, null, 2));
