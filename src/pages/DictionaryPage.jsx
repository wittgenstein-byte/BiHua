import React from 'react';
import { SearchBar } from '../components/SearchBar';
import { VocabularyGrid } from '../components/VocabularyGrid';
import { PageSkeletonFallback } from '../components/PageSkeletonFallback';
import { useSearch } from '../hooks/useSearch';
import { useDictionary } from '../hooks/useDictionary';
import { Sparkles, BookOpen, PenTool } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DictionaryPage() {
  const { query, setQuery, selectedLevel, setSelectedLevel, filteredWords, totalResults, loading: searchLoading } = useSearch();
  const { totalWords, totalChars, loading: dictLoading } = useDictionary();
  const navigate = useNavigate();

  const isLoading = searchLoading || dictLoading;

  // Card click → Full Details & Animation page
  const handleCardClick = (word) => {
    navigate(`/character/${encodeURIComponent(word.word)}`);
  };

  // Practice button → Direct practice mode on character page
  const handlePracticeClick = (word) => {
    navigate(`/character/${encodeURIComponent(word.word)}?mode=practice`);
  };

  return (
    <div className="space-y-8">
      {/* Banner Header with Stats Counter */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-500/10 dark:bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-300 text-xs font-bold border border-rose-500/20 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-current" /> HSK 1-6 Master Dictionary & Stroke Order Engine
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-chinese">
              Master Chinese Character Stroke Orders
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Click any character to view animated stroke order, or practice writing directly with real-time stroke feedback.
            </p>
          </div>

          {/* Stats: Total Words & Total Strokes/Characters */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
            <div className="flex-1 sm:flex-initial min-w-[140px] px-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Words</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {isLoading ? '...' : totalWords.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="flex-1 sm:flex-initial min-w-[140px] px-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                <PenTool className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Strokes & Chars</div>
                <div className="text-lg font-black text-slate-900 dark:text-white">
                  {isLoading ? '...' : totalChars.toLocaleString()} 
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <SearchBar
        query={query}
        setQuery={setQuery}
        selectedLevel={selectedLevel}
        setSelectedLevel={setSelectedLevel}
        totalResults={totalResults}
      />

      {/* Vocabulary Grid or Skeleton Loading */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-5 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-5 rounded-full bg-slate-800/80" />
                <div className="w-6 h-6 rounded-full bg-slate-800/80" />
              </div>
              <div className="space-y-2 text-center py-2">
                <div className="h-10 w-20 bg-slate-800/90 rounded-lg mx-auto" />
                <div className="h-3 w-16 bg-slate-800/60 rounded mx-auto" />
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-800/50">
                <div className="h-3.5 w-full bg-slate-800/70 rounded" />
                <div className="h-3 w-3/4 bg-slate-800/50 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <VocabularyGrid
          words={filteredWords}
          onSelectWord={handleCardClick}
          onPracticeWord={handlePracticeClick}
        />
      )}
    </div>
  );
}

export default DictionaryPage;
