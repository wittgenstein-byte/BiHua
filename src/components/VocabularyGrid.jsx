import React, { useState } from 'react';
import { Play, PenTool, Sparkles, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';

export function VocabularyGrid({ words, onSelectWord, onPracticeWord }) {
  const [currentPage, setCurrentPage] = useState(1);
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const itemsPerPage = 24;

  const totalPages = Math.ceil(words.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentWords = words.slice(startIndex, startIndex + itemsPerPage);

  const getLevelBadgeClass = (level) => {
    switch (level) {
      case 1: return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30';
      case 2: return 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/20 dark:text-sky-300 dark:border-sky-500/30';
      case 3: return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30';
      case 4: return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30';
      case 5: return 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30';
      case 6: return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-500/20 dark:text-slate-300 dark:border-slate-500/30';
    }
  };

  if (words.length === 0) {
    return (
      <div className="w-full py-16 text-center glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800">
        <Sparkles className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-300">No Vocabulary Found</h3>
        <p className="text-sm text-slate-500 mt-1">Try adjusting your search query or HSK filter.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {currentWords.map((item) => {
          const bookmarked = isBookmarked(item.word);
          return (
            <div
              key={item.id || item.word}
              onClick={() => onSelectWord && onSelectWord(item)}
              className="group glass-card rounded-3xl p-5 cursor-pointer relative overflow-hidden flex flex-col justify-between"
            >
              {/* Top Bar: Character & Level Badge / Bookmark Button */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-chinese text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-300 transition-colors">
                    {item.word}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700">
                      {item.word.length} {item.word.length > 1 ? 'Chars' : 'Char'}
                    </span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${getLevelBadgeClass(item.level)}`}>
                      HSK {item.level}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(item.word);
                      }}
                      className={`p-1.5 rounded-xl border transition-all ${
                        bookmarked
                          ? 'bg-amber-500/20 text-amber-500 dark:text-amber-300 border-amber-500/40 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-900/60 text-slate-400 hover:text-slate-700 dark:hover:text-white border-slate-200/80 dark:border-slate-800'
                      }`}
                      title={bookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-500 dark:fill-amber-300' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Pinyin */}
                <div className="text-sm font-bold text-rose-600 dark:text-rose-400 mb-1">
                  {item.pinyin}
                </div>

                {/* English Definition */}
                <div className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 font-medium leading-relaxed">
                  {item.english}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectWord && onSelectWord(item);
                  }}
                  className="flex items-center gap-1 hover:text-rose-600 dark:hover:text-rose-400 transition-colors font-bold"
                >
                  <Play className="w-3.5 h-3.5" /> Details & Animate
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    (onPracticeWord ?? onSelectWord)?.(item);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 font-bold transition-colors border border-rose-200 dark:border-rose-500/20 shadow-sm"
                >
                  <PenTool className="w-3.5 h-3.5" /> Practice
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing <strong className="text-slate-900 dark:text-white font-bold">{startIndex + 1}</strong> - <strong className="text-slate-900 dark:text-white font-bold">{Math.min(startIndex + itemsPerPage, words.length)}</strong> of <strong className="text-slate-900 dark:text-white font-bold">{words.length}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VocabularyGrid;
