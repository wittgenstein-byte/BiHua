import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const strokeDir = path.join(rootDir, 'public', 'stroke');
const charsPath = path.join(rootDir, 'src', 'data', 'hsk-chars.json');
const outputPath = path.join(rootDir, 'src', 'data', 'missing-chars.json');

if (!fs.existsSync(charsPath)) {
  console.error(`Error: ${charsPath} does not exist. Please run build-dictionary.mjs first.`);
  process.exit(1);
}

const charsList = JSON.parse(fs.readFileSync(charsPath, 'utf8'));

let availableStrokes = new Set();
if (fs.existsSync(strokeDir)) {
  const files = fs.readdirSync(strokeDir);
  files.forEach(file => {
    if (file.endsWith('.json')) {
      const char = path.basename(file, '.json');
      availableStrokes.add(char);
    }
  });
}

console.log(`Total stroke JSON files in public/stroke/: ${availableStrokes.size}`);
console.log(`Total unique HSK characters: ${charsList.length}`);

const missingChars = [];
let coveredCount = 0;

charsList.forEach(item => {
  if (availableStrokes.has(item.char)) {
    coveredCount++;
  } else {
    missingChars.push({
      char: item.char,
      appearsIn: item.appearsIn
    });
  }
});

const coveragePercent = ((coveredCount / charsList.length) * 100).toFixed(2);

fs.writeFileSync(outputPath, JSON.stringify(missingChars, null, 2));

console.log(`\n================ STROKE COVERAGE REPORT ================`);
console.log(`Covered Characters: ${coveredCount} / ${charsList.length}`);
console.log(`Missing Characters: ${missingChars.length}`);
console.log(`Coverage Percentage: ${coveragePercent}%`);
console.log(`Missing characters saved to: ${outputPath}`);
console.log(`========================================================\n`);

if (missingChars.length > 0) {
  console.log(`Sample missing characters: ${missingChars.slice(0, 10).map(m => m.char).join(', ')}`);
}
