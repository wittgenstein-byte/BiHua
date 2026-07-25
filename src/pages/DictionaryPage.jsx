import React from 'react';
import { SearchBar } from '../components/SearchBar';
import { VocabularyGrid } from '../components/VocabularyGrid';
import { useSearch } from '../hooks/useSearch';
import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DictionaryPage() {
  const { query, setQuery, selectedLevel, setSelectedLevel, filteredWords, totalResults } = useSearch();
  const navigate = useNavigate();

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
      {/* Banner Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-semibold border border-rose-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> HSK 1-6 Master Dictionary & Stroke Order Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-chinese">
            Master Chinese Character Stroke Orders
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Click any character to view full details & animation, or hit Practice to jump straight into stroke writing.
          </p>
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

      {/* Vocabulary Grid */}
      <VocabularyGrid
        words={filteredWords}
        onSelectWord={handleCardClick}
        onPracticeWord={handlePracticeClick}
      />
    </div>
  );
}

export default DictionaryPage;
