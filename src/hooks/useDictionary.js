import { useMemo, useCallback } from 'react';
import hskWords from '../data/hsk-words.json';
import hskChars from '../data/hsk-chars.json';

const charsMap = new Map(hskChars.map(c => [c.char, c]));

export function useDictionary() {
  const words = useMemo(() => hskWords, []);
  const chars = useMemo(() => hskChars, []);

  const getWordById = useCallback((id) => {
    return words.find(w => w.id === id) || null;
  }, [words]);

  const getWordsByChar = useCallback((char) => {
    const charData = charsMap.get(char);
    return charData ? charData.appearsIn : [];
  }, []);

  const getCharDetails = useCallback((char) => {
    return charsMap.get(char) || null;
  }, []);

  return {
    words,
    chars,
    loading: false,
    getWordById,
    getWordsByChar,
    getCharDetails,
    totalWords: words.length,
    totalChars: chars.length
  };
}

export function prefetchDictionary() {
  // Synchronous static bundle - prefetch not needed
}

export default useDictionary;
