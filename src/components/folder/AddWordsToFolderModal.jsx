import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Search, Check, Plus, CheckSquare, Square } from 'lucide-react';

export function AddWordsToFolderModal({
  isOpen,
  onClose,
  folder,
  allBookmarkedWords = [],
  onSaveWords
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWords, setSelectedWords] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState(0);

  // Initialize selected words from folder on open
  React.useEffect(() => {
    if (isOpen && folder) {
      setSelectedWords(folder.words || []);
      setSearchQuery('');
      setSelectedLevel(0);
    }
  }, [isOpen, folder]);

  // Filtered bookmarks list
  const filteredWords = useMemo(() => {
    return allBookmarkedWords.filter(w => {
      // Level filter
      if (selectedLevel > 0 && w.level !== selectedLevel) return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const wordMatch = w.word.includes(q);
        const pinyinMatch = (w.pinyin || '').toLowerCase().includes(q);
        const englishMatch = (w.english || '').toLowerCase().includes(q);
        return wordMatch || pinyinMatch || englishMatch;
      }
      return true;
    });
  }, [allBookmarkedWords, selectedLevel, searchQuery]);

  // Optimized Set for constant time O(1) membership lookups
  const selectedWordsSet = useMemo(() => new Set(selectedWords), [selectedWords]);

  if (!isOpen || !folder) return null;

  const toggleWord = (wordText) => {
    setSelectedWords(prev => {
      if (prev.includes(wordText)) {
        return prev.filter(w => w !== wordText);
      } else {
        return [...prev, wordText];
      }
    });
  };

  const handleSelectAllFiltered = () => {
    const filteredWordTexts = filteredWords.map(w => w.word);
    const allSelected = filteredWordTexts.every(w => selectedWordsSet.has(w));

    if (allSelected) {
      const filteredSet = new Set(filteredWordTexts);
      setSelectedWords(prev => prev.filter(w => !filteredSet.has(w)));
    } else {
      setSelectedWords(prev => Array.from(new Set([...prev, ...filteredWordTexts])));
    }
  };

  const handleSave = () => {
    onSaveWords(selectedWords);
    onClose();
  };

  const isAllFilteredSelected = filteredWords.length > 0 && filteredWords.every(w => selectedWordsSet.has(w.word));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] my-auto"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: folder.color || '#e11d48' }}
              />
              Manage Words in "{folder.name}"
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Selected: <strong className="text-rose-500">{selectedWords.length}</strong> of {allBookmarkedWords.length} bookmarked words
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 space-y-3 bg-white dark:bg-slate-900">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Hanzi, Pinyin or English..."
              aria-label="Search words"
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-rose-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* Level Pills & Select All */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1">
            <div className="flex items-center gap-1.5 shrink-0">
              {[0, 1, 2, 3, 4, 5, 6].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    selectedLevel === lvl
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {lvl === 0 ? 'All' : `HSK ${lvl}`}
                </button>
              ))}
            </div>

            <button
              onClick={handleSelectAllFiltered}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline shrink-0 flex items-center gap-1 focus:outline-none"
            >
              {isAllFilteredSelected ? (
                <>
                  <CheckSquare className="w-3.5 h-3.5" /> Deselect All
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5" /> Select All
                </>
              )}
            </button>
          </div>
        </div>

        {/* Words Checklist */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredWords.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredWords.map((w) => {
                const isSelected = selectedWordsSet.has(w.word);
                return (
                  <div
                    key={w.word}
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleWord(w.word)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleWord(w.word);
                      }
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-2.5 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                      isSelected
                        ? 'bg-rose-50/80 dark:bg-rose-500/10 border-rose-300 dark:border-rose-500/30 shadow-sm'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="min-w-0 flex items-center gap-2.5">
                      {/* Checkbox indicator */}
                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                          isSelected
                            ? 'bg-rose-600 border-rose-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-chinese font-bold text-sm text-slate-900 dark:text-white">
                            {w.word}
                          </span>
                          <span className="text-xs text-rose-500 font-semibold">
                            {w.pinyin}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px]">
                          {w.english}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 shrink-0">
                      HSK {w.level || 1}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 text-xs font-medium">
              No matching bookmarked words found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/50">
          <span className="text-xs font-semibold text-slate-500">
            {selectedWords.length} words in folder
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5" /> Save Folder Words
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

export default AddWordsToFolderModal;
