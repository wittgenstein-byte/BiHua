import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { SearchBar } from './components/SearchBar';
import { VocabularyGrid } from './components/VocabularyGrid';
import { CharacterDetailModal } from './components/CharacterDetailModal';
import { SRSFlashcardView } from './components/SRSFlashcardView';
import { useSearch } from './hooks/useSearch';
import { useSRS } from './hooks/useSRS';
import { Sparkles, PenTool, BookOpen, Layers } from 'lucide-react';

export function App() {
  const [activeMode, setActiveMode] = useState('explorer'); // 'explorer' | 'practice' | 'flashcards'
  const [selectedWord, setSelectedWord] = useState(null);
  const [modalInitialMode, setModalInitialMode] = useState('animate'); // 'animate' | 'practice'

  const { query, setQuery, selectedLevel, setSelectedLevel, filteredWords, totalResults } = useSearch();
  const { stats: srsStats } = useSRS();

  const handleSelectWord = (word, mode = 'animate') => {
    setSelectedWord(word);
    setModalInitialMode(mode);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar activeMode={activeMode} setActiveMode={setActiveMode} srsStats={srsStats} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Explorer & Practice Modes */}
        {activeMode !== 'flashcards' ? (
          <>
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
                  Practice interactive stroke order writing with real-time feedback over traditional Tianzige (田字格) grids, explore 5,456 HSK vocabulary entries, and animate stroke paths step-by-step.
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
              onSelectWord={handleSelectWord}
            />
          </>
        ) : (
          /* SRS Flashcard View */
          <SRSFlashcardView onSelectWord={handleSelectWord} />
        )}
      </main>

      {/* Character Modal Popup */}
      {selectedWord && (
        <CharacterDetailModal
          wordObj={selectedWord}
          initialMode={modalInitialMode}
          onClose={() => setSelectedWord(null)}
          onSelectWord={handleSelectWord}
        />
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 py-6 text-center text-xs text-slate-500 glass-panel mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-chinese font-bold text-slate-300">BiHua (筆畫)</span> — HSK 1-6 Chinese Character Learning
          </div>
          <div>
            1,800 Characters • 5,456 Vocabulary Entries • FSRS Spaced Repetition
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
