import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const inputPath = path.join(rootDir, 'public', 'data', 'hsk_master_dictionary.json');
const outputDir = path.join(rootDir, 'src', 'data');
const wordsOutputPath = path.join(outputDir, 'hsk-words.json');
const charsOutputPath = path.join(outputDir, 'hsk-chars.json');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// If both output files exist and are non-empty, skip regeneration if up-to-date
if (fs.existsSync(wordsOutputPath) && fs.existsSync(charsOutputPath)) {
  try {
    const inputStat = fs.statSync(inputPath);
    const wordsStat = fs.statSync(wordsOutputPath);
    if (wordsStat.mtimeMs >= inputStat.mtimeMs && wordsStat.size > 10000) {
      console.log('Dictionary data is already up-to-date. Skipping rebuild.');
      process.exit(0);
    }
  } catch (e) {
    // Continue with rebuild
  }
}

console.log('Reading master dictionary from:', inputPath);
const rawData = fs.readFileSync(inputPath, 'utf8');
const wordsData = JSON.parse(rawData);

console.log(`Processing ${wordsData.length} dictionary entries...`);

const wordsList = [];
const charMap = new Map();

wordsData.forEach((entry, index) => {
  const wordObj = {
    id: `w_${index + 1}`,
    word: entry.word,
    variants: entry.variants || [],
    pinyin: entry.pinyin || '',
    pinyin_search: entry.pinyin_search || '',
    english: entry.english || '',
    level: entry.level || 1,
    chars: entry.chars || Array.from(entry.word),
    stroke_files: entry.stroke_files || (entry.chars ? entry.chars.map(c => `${c}.json`) : []),
    is_ready: entry.is_ready !== false
  };

  wordsList.push(wordObj);

  // Cross-reference characters
  const chars = wordObj.chars;
  chars.forEach((ch) => {
    if (!ch) return;
    if (!charMap.has(ch)) {
      charMap.set(ch, {
        char: ch,
        strokeFile: `${ch}.json`,
        appearsIn: []
      });
    }
    const charEntry = charMap.get(ch);
    if (!charEntry.appearsIn.some(w => w.word === wordObj.word)) {
      charEntry.appearsIn.push({
        word: wordObj.word,
        pinyin: wordObj.pinyin,
        english: wordObj.english,
        level: wordObj.level
      });
    }
  });
});

const charsList = Array.from(charMap.values());

function safeWrite(filePath, data) {
  try {
    fs.writeFileSync(filePath, data, 'utf8');
  } catch (err) {
    console.warn(`Write retry for ${filePath}:`, err.message);
    // Write via temporary file
    const tmpPath = `${filePath}.tmp`;
    fs.writeFileSync(tmpPath, data, 'utf8');
    fs.renameSync(tmpPath, filePath);
  }
}

safeWrite(wordsOutputPath, JSON.stringify(wordsList, null, 2));
safeWrite(charsOutputPath, JSON.stringify(charsList, null, 2));

console.log(`Successfully generated:`);
console.log(` - ${wordsOutputPath} (${wordsList.length} words)`);
console.log(` - ${charsOutputPath} (${charsList.length} unique characters)`);
