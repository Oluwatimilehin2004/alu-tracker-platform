import fs from 'fs';
import path from 'path';

const SEEDS_ROOT = path.join(__dirname, '../../seeds/cars');

interface MissingEntry {
  file: string;
  brand: string;
  model: string;
}

const results = {
  total: 0,
  hasKey: 0,
  missingKey: [] as MissingEntry[],
};

// Build a set of all brand+model combos that already have a converted car.json
function buildConvertedSet(): Set<string> {
  const converted = new Set<string>();

  function walk(dir: string): void {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && entry.name === 'car.json') {
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          if (data.brand && data.model) {
            converted.add(`${data.brand}::${data.model}`);
          }
        } catch {
          // skip
        }
      }
    }
  }

  walk(SEEDS_ROOT);
  return converted;
}

function isCarJson(filePath: string): boolean {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return (
      typeof data.id !== 'undefined' &&
      typeof data.class !== 'undefined' &&
      typeof data.brand !== 'undefined' &&
      typeof data.model !== 'undefined'
    );
  } catch {
    return false;
  }
}

function walk(currentDir: string, convertedSet: Set<string>): void {
  let entries;
  try {
    entries = fs.readdirSync(currentDir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(currentDir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath, convertedSet);
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      const isNewFormat = entry.name === 'car.json';
      const isOldFormat = !isNewFormat && isCarJson(fullPath);

      if (isOldFormat) {
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          const key = `${data.brand}::${data.model}`;
          // Skip old flat .json if a converted car.json already exists for this brand+model
          if (convertedSet.has(key)) continue;
        } catch {
          continue;
        }
      }

      if (isNewFormat || isOldFormat) {
        try {
          const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          results.total++;

          if (!data.normalizedKey) {
            results.missingKey.push({
              file: path.relative(SEEDS_ROOT, fullPath),
              brand: data.brand ?? '(unknown)',
              model: data.model ?? '(unknown)',
            });
          } else {
            results.hasKey++;
          }
        } catch (err: any) {
          console.warn(`  ⚠ Could not parse: ${fullPath} — ${err.message}`);
        }
      }
    }
  }
}

if (!fs.existsSync(SEEDS_ROOT)) {
  console.error(`❌  Could not find: ${SEEDS_ROOT}`);
  process.exit(1);
}

console.log(`\nScanning: ${SEEDS_ROOT}\n`);

const convertedSet = buildConvertedSet();
walk(SEEDS_ROOT, convertedSet);

if (results.missingKey.length === 0) {
  console.log('✅  All car files have a normalizedKey!');
} else {
  console.log(`📋  Cars missing normalizedKey (${results.missingKey.length}):\n`);
  for (const car of results.missingKey) {
    console.log(`  ✗  ${car.brand} — ${car.model}`);
    console.log(`     ${car.file}\n`);
  }
}

console.log('─'.repeat(50));
console.log(`  Total car files found : ${results.total}`);
console.log(`  Have normalizedKey    : ${results.hasKey}`);
console.log(`  Missing normalizedKey : ${results.missingKey.length}`);
console.log('─'.repeat(50) + '\n');