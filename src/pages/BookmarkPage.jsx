import React, { useState, useMemo } from 'react';
import { Bookmark, Sparkles, Trash2, LayoutGrid, Layers } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { useDictionary } from '../hooks/useDictionary';
import { SearchBar } from '../components/SearchBar';
import { VocabularyGrid } from '../components/VocabularyGrid';
import { ChineseFlashcardStack } from '../components/flashcard/ChineseFlashcardStack';
import { useNavigate } from 'react-router-dom';

export function BookmarkPage() {
  const { bookmarks, clearBookmarks, totalBookmarks } = useBookmarks();
  const { words } = useDictionary();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(0); // 0 = All Levels
  const [viewMode, setViewMode] = useState('stack'); // 'stack' | 'grid'

  // Filter dictionary words to only bookmarked words
  const bookmarkedWords = useMemo(() => {
    const bookmarkSet = new Set(bookmarks);
    return words.filter(w => bookmarkSet.has(w.word));
  }, [words, bookmarks]);

  // Apply search query and HSK level filter
  const filteredWords = useMemo(() => {
    const lvlNum = Number(selectedLevel);
    const q = query.trim().toLowerCase();
    const cleanQ = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return bookmarkedWords.filter(item => {
      // level 0 or 'all' or isNaN means show All Levels
      const matchesLevel = lvlNum === 0 || isNaN(lvlNum) || item.level === lvlNum;
      if (!matchesLevel) return false;

      if (!q) return true;

      const wordMatch = item.word.includes(q);
      const pinyinSearchMatch = item.pinyin_search?.toLowerCase().includes(cleanQ);
      const pinyinMatch = item.pinyin?.toLowerCase().includes(q);
      const englishMatch = item.english?.toLowerCase().includes(q);
      const charMatch = item.chars?.some(c => c.includes(q));

      return wordMatch || pinyinSearchMatch || pinyinMatch || englishMatch || charMatch;
    });
  }, [bookmarkedWords, query, selectedLevel]);

  const handleCardClick = (word) => {
    navigate(`/character/${encodeURIComponent(word.word)}`);
  };

  const handlePracticeClick = (word) => {
    navigate(`/character/${encodeURIComponent(word.word)}?mode=practice`);
  };

  return (
    <div className="space-y-8">
      {/* Clean Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Bookmark className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-chinese">
              Saved Words ({totalBookmarks})
            </h1>
            <p className="text-xs text-slate-400 font-medium">Bookmarked Chinese Vocabulary</p>
          </div>
        </div>

        {totalBookmarks > 0 && (
          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800">
              <button
                onClick={() => setViewMode('stack')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'stack'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Flashcard Stack
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" /> Grid View
              </button>
            </div>

            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to remove all bookmarked characters?')) {
                  clearBookmarks();
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition-colors shrink-0"
              title="Clear All Bookmarks"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {totalBookmarks === 0 ? (
        /* Empty State */
        <div className="w-full py-16 text-center glass-card rounded-3xl border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto px-4">
            <h3 className="text-xl font-bold text-white">No Bookmarks Saved Yet</h3>
            <p className="text-sm text-slate-400">
              Click the bookmark icon on any vocabulary card or character page to save items for quick access here.
            </p>
          </div>
          <button
            onClick={() => navigate('/dictionary')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-950/50 transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Explore Dictionary
          </button>
        </div>
      ) : (
        <>
          {/* Search and Filters */}
          <SearchBar
            query={query}
            setQuery={setQuery}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            totalResults={filteredWords.length}
          />

          {/* Main View Mode Content */}
          {viewMode === 'stack' ? (
            <ChineseFlashcardStack words={filteredWords} />
          ) : (
            <VocabularyGrid
              words={filteredWords}
              onSelectWord={handleCardClick}
              onPracticeWord={handlePracticeClick}
            />
          )}
        </>
      )}
    </div>
  );
}

export default BookmarkPage;
