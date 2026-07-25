import React, { useState } from 'react';
import { Brain, Sliders, BarChart3, Sparkles, Headphones, BookOpen } from 'lucide-react';
import { useSRS } from '../hooks/useSRS';
import { useDictionary } from '../hooks/useDictionary';
import { CoreFlashcard } from '../components/review/CoreFlashcard';
import { ToneListenerQuiz } from '../components/review/ToneListenerQuiz';
import { ContextMatchingQuiz } from '../components/review/ContextMatchingQuiz';
import { FSRSSettingsModal } from '../components/FSRSSettingsModal';
import { FSRSAnalyticsDashboard } from '../components/FSRSAnalyticsDashboard';

export function FlashcardsPage() {
  const { stats, dueCards, submitRating, loading, refreshSRSData } = useSRS();
  const { words, chars } = useDictionary();

  const [activeTab, setActiveTab] = useState('smart_mix'); // 'smart_mix', 'core', 'tone', 'context', 'analytics'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Active review object fallback pool
  const currentReview = dueCards[currentIndex];
  const charSymbol = currentReview ? currentReview.char : (chars[currentIndex % Math.max(1, chars.length)]?.char || '愛');

  const associatedWord = words.find(w => w.word.includes(charSymbol)) || {
    word: charSymbol,
    pinyin: '',
    english: 'Chinese character item',
    level: currentReview?.hskLevel || 1
  };

  const handleRatingSubmit = async (ratingVal) => {
    await submitRating(charSymbol, ratingVal, associatedWord.level || 1);
    setCurrentIndex(prev => prev + 1);
  };

  // Determine current active mode for 'smart_mix'
  const getSmartMixMode = () => {
    if (activeTab !== 'smart_mix') return activeTab;
    const modes = ['core', 'tone', 'context'];
    return modes[currentIndex % modes.length];
  };

  const currentMode = getSmartMixMode();

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-semibold border border-rose-500/20 mb-3">
            <Brain className="w-3.5 h-3.5" /> FSRS Multi-Sensory Spaced Repetition
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-1 font-chinese">
            Adaptive Review Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Multi-sensory recall powered by Free Spaced Repetition Scheduler (FSRS) and Tone Color-coding.
          </p>
        </div>

        {/* Action Button: Settings Modal Trigger */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className="relative z-10 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-bold border border-slate-700/80 transition-all shadow-md hover:scale-105 active:scale-95"
        >
          <Sliders className="w-4 h-4 text-rose-400" /> FSRS Settings ({Math.round((stats?.targetRetention || 0.85) * 100)}%)
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800/80 scrollbar-none">
        <button
          onClick={() => setActiveTab('smart_mix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
            activeTab === 'smart_mix'
              ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white border-transparent shadow-lg shadow-rose-950/50'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 border-slate-800/80'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-300" /> Smart Mixed Practice
        </button>

        <button
          onClick={() => setActiveTab('core')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
            activeTab === 'core'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 border-slate-800/80'
          }`}
        >
          <Brain className="w-4 h-4 text-rose-400" /> Core Flashcard
        </button>

        <button
          onClick={() => setActiveTab('tone')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
            activeTab === 'tone'
              ? 'bg-sky-500/20 text-sky-300 border-sky-500/50'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 border-slate-800/80'
          }`}
        >
          <Headphones className="w-4 h-4 text-sky-400" /> Tone Listener
        </button>

        <button
          onClick={() => setActiveTab('context')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
            activeTab === 'context'
              ? 'bg-purple-500/20 text-purple-300 border-purple-500/50'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 border-slate-800/80'
          }`}
        >
          <BookOpen className="w-4 h-4 text-purple-400" /> Context Matching
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ml-auto ${
            activeTab === 'analytics'
              ? 'bg-slate-800 text-white border-slate-700 ring-2 ring-rose-500/30'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 border-slate-800/80'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-amber-400" /> Visual Analytics
        </button>
      </div>

      {/* Main Content Render Area */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <Sparkles className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-2" />
          Loading FSRS Review Session...
        </div>
      ) : activeTab === 'analytics' ? (
        <FSRSAnalyticsDashboard stats={stats} />
      ) : (
        <div className="space-y-6">
          {/* Active Review Queue Info bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-medium">
            <span>
              Queue Item #{currentIndex + 1} of {Math.max(dueCards.length, 1)}
              {currentReview ? ' (Scheduled Due)' : ' (Practice Deck)'}
            </span>
            <span className="capitalize font-bold text-slate-300">
              Current Mode: <span className="text-rose-400">{currentMode.replace('_', ' ')}</span>
            </span>
          </div>

          {/* Mode Switch Renderer */}
          {currentMode === 'tone' ? (
            <ToneListenerQuiz
              targetWord={associatedWord}
              allWords={words}
              onSubmitRating={handleRatingSubmit}
            />
          ) : currentMode === 'context' ? (
            <ContextMatchingQuiz
              targetWord={associatedWord}
              allWords={words}
              onSubmitRating={handleRatingSubmit}
            />
          ) : (
            <CoreFlashcard
              reviewCard={currentReview}
              associatedWord={associatedWord}
              onSubmitRating={handleRatingSubmit}
            />
          )}
        </div>
      )}

      {/* FSRS Settings Modal */}
      <FSRSSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSettingsUpdated={refreshSRSData}
      />
    </div>
  );
}

export default FlashcardsPage;
