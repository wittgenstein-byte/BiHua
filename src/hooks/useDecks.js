import { useState, useEffect, useCallback } from 'react';

const DECK_STORAGE_KEY = 'bihua_decks';

const DEFAULT_DECKS = [
  {
    id: 'deck_hsk1',
    name: 'HSK 1 Basics',
    description: 'Foundational vocabulary for daily conversation',
    color: '#e11d48',
    words: ['你好', '谢谢', '学习', '苹果']
  },
  {
    id: 'deck_daily',
    name: 'Daily Phrases',
    description: 'Useful everyday phrases and expressions',
    color: '#0284c7',
    words: ['快乐', '白天', '吃饭', '帮忙']
  }
];

function getSavedDecks() {
  try {
    const saved = localStorage.getItem(DECK_STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(DEFAULT_DECKS));
      return DEFAULT_DECKS;
    }
    return JSON.parse(saved);
  } catch (err) {
    console.error('Error reading decks from localStorage:', err);
    return DEFAULT_DECKS;
  }
}

export function useDecks() {
  const [decks, setDecks] = useState(getSavedDecks);

  useEffect(() => {
    const handleUpdate = () => {
      const latest = getSavedDecks();
      setDecks(prev => {
        if (JSON.stringify(prev) === JSON.stringify(latest)) return prev;
        return latest;
      });
    };

    window.addEventListener('bihua_decks_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('bihua_decks_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const saveDecks = (newDecks) => {
    try {
      localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(newDecks));
      setDecks(newDecks);
      window.dispatchEvent(new Event('bihua_decks_updated'));
    } catch (err) {
      console.error('Error saving decks:', err);
    }
  };

  const createDeck = useCallback(({ name, description = '', color = '#e11d48', words = [] }) => {
    const current = getSavedDecks();
    const newDeck = {
      id: `deck_${Date.now()}`,
      name: name.trim() || 'New Folder Deck',
      description: description.trim(),
      color,
      words: Array.from(new Set(words)),
      createdAt: new Date().toISOString()
    };
    saveDecks([...current, newDeck]);
    return newDeck;
  }, []);

  const updateDeck = useCallback((deckId, updates) => {
    const current = getSavedDecks();
    const updated = current.map(d => {
      if (d.id === deckId) {
        return {
          ...d,
          ...updates,
          words: updates.words ? Array.from(new Set(updates.words)) : d.words
        };
      }
      return d;
    });
    saveDecks(updated);
  }, []);

  const deleteDeck = useCallback((deckId) => {
    const current = getSavedDecks();
    const updated = current.filter(d => d.id !== deckId);
    saveDecks(updated);
  }, []);

  const addWordsToDeck = useCallback((deckId, wordsToAdd) => {
    const current = getSavedDecks();
    const updated = current.map(d => {
      if (d.id === deckId) {
        return {
          ...d,
          words: Array.from(new Set([...d.words, ...wordsToAdd]))
        };
      }
      return d;
    });
    saveDecks(updated);
  }, []);

  const removeWordFromDeck = useCallback((deckId, wordToRemove) => {
    const current = getSavedDecks();
    const updated = current.map(d => {
      if (d.id === deckId) {
        return {
          ...d,
          words: d.words.filter(w => w !== wordToRemove)
        };
      }
      return d;
    });
    saveDecks(updated);
  }, []);

  return {
    decks,
    createDeck,
    updateDeck,
    deleteDeck,
    addWordsToDeck,
    removeWordFromDeck
  };
}

export default useDecks;
