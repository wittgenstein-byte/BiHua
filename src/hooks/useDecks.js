import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

const DECK_STORAGE_KEY = 'bihua_decks';

function getSavedDecks() {
  try {
    const saved = localStorage.getItem(DECK_STORAGE_KEY);
    if (!saved) return [];
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
  const { user } = useAuth();
  const [decks, setDecks] = useState(getSavedDecks);
  const [isSyncing, setIsSyncing] = useState(false);
  const initialSyncDoneRef = useRef(false);

  // Sync decks with Cloudflare D1 when user logs in
  useEffect(() => {
    if (!user) {
      initialSyncDoneRef.current = false;
      return;
    }

    let isCancelled = false;

    async function syncDecksWithCloud() {
      setIsSyncing(true);
      try {
        const res = await fetch('/api/sync/decks', {
          credentials: 'include'
        });

        if (!res.ok) throw new Error('Failed to fetch decks from cloud');

        const data = await res.json();
        const remoteDecks = data.decks || [];
        const localDecks = getSavedDecks();

        // Merge remote and local by deck ID
        const deckMap = new Map();
        remoteDecks.forEach(d => deckMap.set(d.id, d));
        localDecks.forEach(d => {
          if (!deckMap.has(d.id)) {
            deckMap.set(d.id, d);
          }
        });

        const mergedDecks = Array.from(deckMap.values());

        if (!isCancelled) {
          localStorage.setItem(DECK_STORAGE_KEY, JSON.stringify(mergedDecks));
          setDecks(mergedDecks);
          window.dispatchEvent(new Event('bihua_decks_updated'));
        }

        // If local had decks not on remote, push them to D1
        const missingOnRemote = localDecks.filter(l => !remoteDecks.some(r => r.id === l.id));
        if (missingOnRemote.length > 0) {
          await fetch('/api/sync/decks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ decks: mergedDecks }),
            credentials: 'include'
          });
        }
      } catch (err) {
        console.warn('Decks cloud sync error:', err);
      } finally {
        if (!isCancelled) {
          setIsSyncing(false);
          initialSyncDoneRef.current = true;
        }
      }
    }

    syncDecksWithCloud();

    return () => {
      isCancelled = true;
    };
  }, [user]);

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
      console.error('Error saving decks to local storage:', err);
    }

    // Sync all decks to D1 if user is logged in
    if (user) {
      fetch('/api/sync/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decks: newDecks }),
        credentials: 'include'
      }).catch(err => console.warn('Cloud sync error on save decks:', err));
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
  }, [user]);

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
  }, [user]);

  const deleteDeck = useCallback((deckId) => {
    const current = getSavedDecks();
    const updated = current.filter(d => d.id !== deckId);
    saveDecks(updated);

    if (user) {
      fetch(`/api/sync/deck/${encodeURIComponent(deckId)}`, {
        method: 'DELETE',
        credentials: 'include'
      }).catch(err => console.warn('Cloud sync error on delete deck:', err));
    }
  }, [user]);

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
  }, [user]);

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
  }, [user]);

  return {
    decks,
    createDeck,
    updateDeck,
    deleteDeck,
    addWordsToDeck,
    removeWordFromDeck,
    isSyncing
  };
}

export default useDecks;
