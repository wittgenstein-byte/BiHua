import { useState, useEffect, useCallback } from 'react';

const FOLDER_STORAGE_KEY = 'bihua_folders';

const DEFAULT_FOLDERS = [
  {
    id: 'f_hsk1',
    name: 'HSK 1 Basics',
    color: '#e11d48',
    words: ['你好', '谢谢', '学习', '苹果']
  },
  {
    id: 'f_daily',
    name: 'Daily Phrases',
    color: '#0284c7',
    words: ['快乐', '白天', '吃饭', '帮忙']
  }
];

function getSavedFolders() {
  try {
    const saved = localStorage.getItem(FOLDER_STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(DEFAULT_FOLDERS));
      return DEFAULT_FOLDERS;
    }
    return JSON.parse(saved);
  } catch (err) {
    console.error('Error reading folders from localStorage:', err);
    return DEFAULT_FOLDERS;
  }
}

export function useFolders() {
  const [folders, setFolders] = useState(getSavedFolders);

  useEffect(() => {
    const handleUpdate = () => {
      const latest = getSavedFolders();
      setFolders(prev => {
        if (JSON.stringify(prev) === JSON.stringify(latest)) return prev;
        return latest;
      });
    };

    window.addEventListener('bihua_folders_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('bihua_folders_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const saveFolders = (newFolders) => {
    try {
      localStorage.setItem(FOLDER_STORAGE_KEY, JSON.stringify(newFolders));
      setFolders(newFolders);
      window.dispatchEvent(new Event('bihua_folders_updated'));
    } catch (err) {
      console.error('Error saving folders:', err);
    }
  };

  const createFolder = useCallback(({ name, color = '#e11d48', words = [] }) => {
    const current = getSavedFolders();
    const newFolder = {
      id: `f_${Date.now()}`,
      name: name.trim() || 'New Folder',
      color,
      words: Array.from(new Set(words)),
      createdAt: new Date().toISOString()
    };
    saveFolders([...current, newFolder]);
    return newFolder;
  }, []);

  const updateFolder = useCallback((folderId, updates) => {
    const current = getSavedFolders();
    const updated = current.map(f => {
      if (f.id === folderId) {
        return {
          ...f,
          ...updates,
          words: updates.words ? Array.from(new Set(updates.words)) : f.words
        };
      }
      return f;
    });
    saveFolders(updated);
  }, []);

  const deleteFolder = useCallback((folderId) => {
    const current = getSavedFolders();
    const updated = current.filter(f => f.id !== folderId);
    saveFolders(updated);
  }, []);

  const toggleWordInFolder = useCallback((folderId, wordStr) => {
    const current = getSavedFolders();
    const updated = current.map(f => {
      if (f.id === folderId) {
        const hasWord = f.words.includes(wordStr);
        const newWords = hasWord
          ? f.words.filter(w => w !== wordStr)
          : [...f.words, wordStr];
        return { ...f, words: newWords };
      }
      return f;
    });
    saveFolders(updated);
  }, []);

  return {
    folders,
    createFolder,
    updateFolder,
    deleteFolder,
    toggleWordInFolder
  };
}

export default useFolders;
