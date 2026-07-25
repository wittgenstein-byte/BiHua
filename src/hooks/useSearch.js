import { useState, useMemo } from 'react';
import { useDictionary } from './useDictionary';

export function useSearch() {
  const { words } = useDictionary();
  const [query, setQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(0); // 0 = All

  const filteredWords = useMemo(() => {
    let result = words;

    // Filter by HSK Level
    if (selectedLevel > 0) {
      result = result.filter(w => w.level === selectedLevel);
    }

    // Filter by Search Query
    if (query.trim() !== '') {
      const q = query.trim().toLowerCase();
      // Remove tones for clean searching
      const cleanQ = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      result = result.filter(item => {
        const wordMatch = item.word.includes(q);
        const pinyinSearchMatch = item.pinyin_search.toLowerCase().includes(cleanQ);
        const pinyinMatch = item.pinyin.toLowerCase().includes(q);
        const englishMatch = item.english.toLowerCase().includes(q);
        const charMatch = item.chars.some(c => c.includes(q));

        return wordMatch || pinyinSearchMatch || pinyinMatch || englishMatch || charMatch;
      });
    }

    return result;
  }, [words, query, selectedLevel]);

  return {
    query,
    setQuery,
    selectedLevel,
    setSelectedLevel,
    filteredWords,
    totalResults: filteredWords.length
  };
}
