import React from 'react';
import { Search, X, Filter } from 'lucide-react';

export function SearchBar({ query, setQuery, selectedLevel, setSelectedLevel, totalResults }) {
  const levels = [
    { id: 0, label: 'All Levels' },
    { id: 1, label: 'HSK 1' },
    { id: 2, label: 'HSK 2' },
    { id: 3, label: 'HSK 3' },
    { id: 4, label: 'HSK 4' },
    { id: 5, label: 'HSK 5' },
    { id: 6, label: 'HSK 6' },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Search Input Box */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
          <Search className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by Chinese character (爸), Pinyin (baba / bàba), or English (dad)..."
          className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 transition-all text-sm sm:text-base shadow-inner"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* HSK Level Filter Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {levels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setSelectedLevel(lvl.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedLevel === lvl.id
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-950/40'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400 font-medium whitespace-nowrap pl-2">
          Found <span className="text-rose-400 font-bold">{totalResults}</span> entries
        </div>
      </div>
    </div>
  );
}
