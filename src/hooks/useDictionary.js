import { useState, useEffect, useCallback, useMemo } from 'react';

// Singleton in-memory cache to store parsed dictionary data across all hook calls
let cachedWords = null;
let cachedChars = null;
let cachedCharsMap = null;
let loadPromise = null;

/**
 * Loads the dictionary data asynchronously.
 * Returns the cached promise if already loading or loaded.
 */
export function loadDictionaryData() {
  if (cachedWords && cachedChars) {
    return Promise.resolve({ words: cachedWords, chars: cachedChars, charsMap: cachedCharsMap });
  }

  if (!loadPromise) {
    loadPromise = Promise.all([
      import('../data/hsk-words.json'),
      import('../data/hsk-chars.json')
    ]).then(([wordsModule, charsModule]) => {
      cachedWords = wordsModule.default || wordsModule;
      cachedChars = charsModule.default || charsModule;
      cachedCharsMap = new Map(cachedChars.map(c => [c.char, c]));
      return { words: cachedWords, chars: cachedChars, charsMap: cachedCharsMap };
    }).catch(err => {
      console.error('Failed to load dictionary data:', err);
      loadPromise = null;
      throw err;
    });
  }

  return loadPromise;
}

/**
 * Prefetch dictionary data during browser idle time.
 */
export function prefetchDictionary() {
  if (typeof window !== 'undefined') {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        loadDictionaryData();
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        loadDictionaryData();
      }, 500);
    }
  }
}

export function useDictionary() {
  const [data, setData] = useState(() => ({
    words: cachedWords || [],
    chars: cachedChars || [],
    loading: !(cachedWords && cachedChars)
  }));

  useEffect(() => {
    if (!cachedWords || !cachedChars) {
      let isMounted = true;
      loadDictionaryData().then(({ words, chars }) => {
        if (isMounted) {
          setData({ words, chars, loading: false });
        }
      });
      return () => {
        isMounted = false;
      };
    }
  }, []);

  const charsMap = useMemo(() => {
    if (cachedCharsMap) return cachedCharsMap;
    return new Map(data.chars.map(c => [c.char, c]));
  }, [data.chars]);

  const getWordById = useCallback((id) => {
    return data.words.find(w => w.id === id) || null;
  }, [data.words]);

  const getWordsByChar = useCallback((char) => {
    const charData = charsMap.get(char);
    return charData ? charData.appearsIn : [];
  }, [charsMap]);

  const getCharDetails = useCallback((char) => {
    return charsMap.get(char) || null;
  }, [charsMap]);

  return {
    words: data.words,
    chars: data.chars,
    loading: data.loading,
    getWordById,
    getWordsByChar,
    getCharDetails,
    totalWords: data.words.length,
    totalChars: data.chars.length
  };
}

export default useDictionary;
