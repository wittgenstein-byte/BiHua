/**
 * Pinyin Tone Utility Functions
 * Supports:
 * 1. Unicode NFD Decomposition for Tone Marks
 * 2. Numbered Pinyin (ni3, hao3, hao3,) with trailing punctuation extraction
 * 3. San Sheng Bian Dao (三声变调 - Tone 3 Sandhi rule: 3+3 -> 2+3)
 * 4. Bàn Sān Shēng (半三声 - Half-Third Tone: Tone 3 before non-Tone 3 non-clause-final syllables)
 * 5. Phrase & Clause boundary splitting by punctuation (, . ! ? ， 。 ！？)
 */

export const TONE_COLORS = {
  1: 'text-rose-400 font-semibold',          // Tone 1: High Flat (Red / Rose)
  2: 'text-emerald-400 font-semibold',       // Tone 2: Rising (Green / Emerald)
  3: 'text-sky-400 font-semibold',           // Tone 3: Full Falling-Rising (Blue / Sky)
  4: 'text-purple-400 font-semibold',        // Tone 4: Falling (Purple)
  0: 'text-slate-300 font-normal',           // Neutral Tone
  5: 'text-slate-300 font-normal'            // Neutral Tone alias
};

/**
 * Extract Tone Mark from Syllable using Unicode NFD or Numbered Pinyin
 */
export function extractToneFromSyllable(rawToken) {
  if (!rawToken) return { cleanText: '', baseText: '', tone: 0, trailingPunct: '' };

  // Separate trailing punctuation if attached
  const punctMatch = rawToken.match(/^([^\wāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙǕǗǙǛvÜüVv]*)(.*?)([,\.!\?:;，。！？；：]*)$/);

  let leadingPunct = '';
  let coreText = rawToken;
  let trailingPunct = '';

  if (punctMatch) {
    leadingPunct = punctMatch[1] || '';
    coreText = punctMatch[2] || '';
    trailingPunct = punctMatch[3] || '';
  }

  // 1. Numbered Pinyin (e.g. hao3, ni3, nv3)
  const numberMatch = coreText.match(/^([a-zA-ZvÜüVv]+)([1-5])$/i);
  if (numberMatch) {
    const t = parseInt(numberMatch[2], 10) % 5;
    return {
      cleanText: leadingPunct + numberMatch[1],
      baseText: numberMatch[1],
      tone: t,
      trailingPunct
    };
  }

  // 2. Unicode NFD Decomposition to separate Base Letter from Combining Diacritics
  const normalized = coreText.normalize('NFD');
  let tone = 0;

  if (/\u0304/.test(normalized)) tone = 1;      //  ̄ (Macron - Tone 1)
  else if (/\u0301/.test(normalized)) tone = 2; //  ́ (Acute - Tone 2)
  else if (/\u030C/.test(normalized)) tone = 3; //  ̌ (Caron - Tone 3)
  else if (/\u0300/.test(normalized)) tone = 4; //  ̀ (Grave - Tone 4)

  return {
    cleanText: leadingPunct + coreText,
    baseText: coreText,
    tone,
    trailingPunct
  };
}

/**
 * Parse Pinyin string into Syllable objects with Tone Sandhi (三声变调) and Half-Third (半三声) rules applied within clause boundaries.
 * @param {string} pinyinStr - e.g. "nǐ hǎo" or "nǐ hǎo, wǒ hěn máng" or "ni3 hao3"
 * @param {boolean} applySandhi - Whether to apply sandhi & half-third rules (default: true)
 */
export function parsePinyinWithTones(pinyinStr = '', applySandhi = true) {
  if (!pinyinStr) return [];

  const rawTokens = pinyinStr.trim().split(/\s+/);
  const parsed = rawTokens.map(token => extractToneFromSyllable(token));

  // Partition into clauses delimited by trailing punctuation
  const clauses = [];
  let currentClause = [];

  parsed.forEach(item => {
    currentClause.push(item);
    if (item.trailingPunct) {
      clauses.push(currentClause);
      currentClause = [];
    }
  });
  if (currentClause.length > 0) {
    clauses.push(currentClause);
  }

  const result = [];

  clauses.forEach(clause => {
    // 1. Apply Tone 3 Sandhi (3+3 -> 2+3) within clause
    if (applySandhi && clause.length > 1) {
      for (let i = 0; i < clause.length - 1; i++) {
        if (clause[i].tone === 3 && clause[i + 1].tone === 3) {
          clause[i].displayTone = 2;
          clause[i].isSandhi = true;
        }
      }
    }

    // 2. Apply Half-Third Tone (半三声) for remaining Tone 3 syllables that are NOT clause-final
    for (let i = 0; i < clause.length; i++) {
      const item = clause[i];
      const effectiveTone = item.displayTone || item.tone;

      if (effectiveTone === 3 && !item.isSandhi && i < clause.length - 1) {
        item.isHalfThird = true;
      }
    }

    clause.forEach(item => {
      const finalTone = item.displayTone || item.tone;
      let colorClass = TONE_COLORS[finalTone] || TONE_COLORS[0];

      // Half-Third Tone visual styling (lighter weight & opacity)
      if (item.isHalfThird) {
        colorClass = 'text-sky-300/80 font-normal';
      }

      result.push({
        syllable: item.cleanText,
        text: item.cleanText,
        originalTone: item.tone,
        tone: finalTone,
        colorClass,
        isSandhi: item.isSandhi || false,
        isHalfThird: item.isHalfThird || false,
        trailingPunct: item.trailingPunct || ''
      });
    });
  });

  return result;
}

// Backward compatibility alias
export function parsePinyin(pinyinStr) {
  return parsePinyinWithTones(pinyinStr, true);
}
