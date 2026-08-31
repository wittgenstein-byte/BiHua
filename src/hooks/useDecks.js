import { useState, useEffect, useCallback } from 'react';

const DECK_STORAGE_KEY = 'bihua_decks';

function getSavedDecks() {
  try {
    const saved = localStorage.getItem(DECK_STORAGE_KEY);
    if (!saved) {
      return [];
    }
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    
    // Automatically filter out legacy default mock decks if they were stored previously
    const cleaned = parsed.filter(d => d && d.id !== 'deck_hsk1' && d.id !== 'deck_daily');
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch (err) {
    console.error('Error reading decks from localStorage:', err);
    return [];
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
