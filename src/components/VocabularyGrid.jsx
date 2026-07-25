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

  const getLevelColor = (level) => {
    switch (level) {
      case 1: return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 2: return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 3: return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 4: return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 5: return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 6: return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  if (words.length === 0) {
    return (
      <div className="w-full py-16 text-center glass-card rounded-2xl border border-slate-800">
        <Sparkles className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-300">No Vocabulary Found</h3>
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
              key={item.id}
              onClick={() => onSelectWord && onSelectWord(item)}
              className="group glass-card rounded-2xl p-5 cursor-pointer relative overflow-hidden flex flex-col justify-between"
            >
              {/* Top Bar: Character & Level Badge / Bookmark Button */}
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="font-chinese text-4xl font-bold tracking-tight text-white group-hover:text-rose-300 transition-colors">
                    {item.word}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${getLevelColor(item.level)}`}>
                      HSK {item.level}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleBookmark(item.word);
                      }}
                      className={`p-1.5 rounded-xl border transition-all ${
                        bookmarked
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-slate-900/60 text-slate-400 hover:text-white border-slate-800'
                      }`}
                      title={bookmarked ? 'Remove Bookmark' : 'Save Bookmark'}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-300' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Pinyin */}
                <div className="text-sm font-semibold text-rose-400 mb-1">
                  {item.pinyin}
                </div>

                {/* English Definition */}
                <div className="text-xs text-slate-300 line-clamp-2 font-normal leading-relaxed">
                  {item.english}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectWord && onSelectWord(item);
                  }}
                  className="flex items-center gap-1 hover:text-rose-400 transition-colors font-medium"
                >
                  <Play className="w-3.5 h-3.5" /> Details & Animate
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    (onPracticeWord ?? onSelectWord)?.(item);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-medium transition-colors border border-rose-500/20"
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
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Showing <strong className="text-white">{startIndex + 1}</strong> - <strong className="text-white">{Math.min(startIndex + itemsPerPage, words.length)}</strong> of <strong className="text-white">{words.length}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-semibold text-slate-300 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
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
