import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

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
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState(getSavedBookmarks);
  const [isSyncing, setIsSyncing] = useState(false);
  const initialSyncDoneRef = useRef(false);

  // Sync with Cloudflare D1 when user logs in
  useEffect(() => {
    if (!user) {
      initialSyncDoneRef.current = false;
      return;
    }

    let isCancelled = false;

    async function syncWithCloud() {
      setIsSyncing(true);
      try {
        // 1. Fetch remote bookmarks from D1
        const res = await fetch('/api/sync/bookmarks', {
          credentials: 'include'
        });

        if (!res.ok) {
          throw new Error('Failed to fetch bookmarks from cloud');
        }

        const data = await res.json();
        const remoteBookmarks = data.bookmarks || [];
        const localBookmarks = getSavedBookmarks();

        // 2. Merge local + remote (union)
        const mergedSet = new Set([...localBookmarks, ...remoteBookmarks]);
        const mergedList = Array.from(mergedSet);

        if (!isCancelled) {
          localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(mergedList));
          setBookmarks(mergedList);
          window.dispatchEvent(new Event('bihua_bookmarks_updated'));
        }

        // 3. If local had bookmarks not in D1, upload the difference
        const missingOnServer = localBookmarks.filter(b => !remoteBookmarks.includes(b));
        if (missingOnServer.length > 0) {
          await fetch('/api/sync/bookmarks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookmarks: missingOnServer }),
            credentials: 'include'
          });
        }
      } catch (err) {
        console.warn('Bookmarks cloud sync error:', err);
      } finally {
        if (!isCancelled) {
          setIsSyncing(false);
          initialSyncDoneRef.current = true;
        }
      }
    }

    syncWithCloud();

    return () => {
      isCancelled = true;
    };
  }, [user]);

  // Listen for bookmark updates across components/tabs
  useEffect(() => {
    const handleUpdate = () => {
      const latest = getSavedBookmarks();
      setBookmarks(prev => {
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
    const willAdd = !current.includes(wordStr);
    
    let updated;
    if (willAdd) {
      updated = [...current, wordStr];
    } else {
      updated = current.filter(b => b !== wordStr);
    }

    try {
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(updated));
      setBookmarks(updated);
      window.dispatchEvent(new Event('bihua_bookmarks_updated'));
    } catch (err) {
      console.error('Error saving bookmark to local storage:', err);
    }

    // Sync change directly to Cloudflare D1 if user is logged in
    if (user) {
      if (willAdd) {
        fetch('/api/sync/bookmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ word: wordStr }),
          credentials: 'include'
        }).catch(err => console.warn('Cloud sync error on bookmark add:', err));
      } else {
        fetch(`/api/sync/bookmark/${encodeURIComponent(wordStr)}`, {
          method: 'DELETE',
          credentials: 'include'
        }).catch(err => console.warn('Cloud sync error on bookmark delete:', err));
      }
    }
  }, [user]);

  const clearBookmarks = useCallback(() => {
    try {
      localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify([]));
      setBookmarks([]);
      window.dispatchEvent(new Event('bihua_bookmarks_updated'));
    } catch (err) {
      console.error('Error clearing bookmarks:', err);
    }

    if (user) {
      fetch('/api/sync/bookmarks/all', {
        method: 'DELETE',
        credentials: 'include'
      }).catch(err => console.warn('Cloud sync error on clear bookmarks:', err));
    }
  }, [user]);

  return {
    bookmarks,
    isBookmarked,
    toggleBookmark,
    clearBookmarks,
    totalBookmarks: bookmarks.length,
    isSyncing
  };
}

export default useBookmarks;
