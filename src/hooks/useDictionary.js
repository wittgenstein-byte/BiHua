import { useMemo } from 'react';
import hskWords from '../data/hsk-words.json';
import hskChars from '../data/hsk-chars.json';

const charsMap = new Map(hskChars.map(c => [c.char, c]));

export function useDictionary() {
  const words = useMemo(() => hskWords, []);
  const chars = useMemo(() => hskChars, []);

  const getWordById = (id) => {
    return words.find(w => w.id === id) || null;
  };

  const getWordsByChar = (char) => {
    const charData = charsMap.get(char);
    return charData ? charData.appearsIn : [];
  };

  const getCharDetails = (char) => {
    return charsMap.get(char) || null;
  };

  return {
    words,
    chars,
    getWordById,
    getWordsByChar,
    getCharDetails,
    totalWords: words.length,
    totalChars: chars.length
  };
}
