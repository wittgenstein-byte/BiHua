import { useState, useEffect, useCallback } from 'react';

const BOOKMARK_STORAGE_KEY = 'bihua_bookmarks';

function getSavedBookmarks() {
  try {
    const saved = localStorage.getItem(BOOKMARK_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (err) {
    console.error('Error reading bookmarks from localStorage:', err);
    return [];
  }
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(getSavedBookmarks);

  // Listen for bookmark updates across components/tabs
  useEffect(() => {
    const handleUpdate = () => {
      const latest = getSavedBookmarks();
      setBookmarks(prev => {
        // Prevent infinite re-render loop if data has not changed
        if (JSON.stringify(prev) === JSON.stringify(latest)) {
          return prev;
        }
        return latest;
      });
    };

    window.addEventListener('bihua_bookmarks_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('bihua_bookmarks_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isBookmarked = useCallback((wordStr) => {
    if (!wordStr) return false;
    return bookmarks.includes(wordStr);
  }, [bookmarks]);

  const toggleBookmark = useCallback((wordStr) => {
    if (!wordStr) return;
    const current = getSavedBookmarks();
    let updated;
    if (current.includes(wordStr)) {
      updated = current.filter(b => b !== wordStr);
    } else {
      updated = [...current, wordStr];
    }
    try {
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(updated));
      setBookmarks(updated);
      window.dispatchEvent(new Event('bihua_bookmarks_updated'));
    } catch (err) {
      console.error('Error saving bookmark:', err);
    }
  }, []);

  const clearBookmarks = useCallback(() => {
    try {
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify([]));
      setBookmarks([]);
      window.dispatchEvent(new Event('bihua_bookmarks_updated'));
    } catch (err) {
      console.error('Error clearing bookmarks:', err);
    }
  }, []);

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    clearBookmarks,
    totalBookmarks: bookmarks.length
  };
}

export default useBookmarks;
