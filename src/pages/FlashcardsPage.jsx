import React from 'react';
import { SRSFlashcardView } from '../components/SRSFlashcardView';
import { Brain } from 'lucide-react';

export function FlashcardsPage({ onSelectWord }) {
  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold border border-amber-500/20 mb-3">
            <Brain className="w-3.5 h-3.5" /> FSRS Spaced Repetition Engine
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-chinese">
            SRS Flashcards Review
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Review characters scheduled specifically for your memory retention curve using FSRS spaced repetition algorithms.
          </p>
        </div>
      </div>

      {/* Main SRS Flashcard Review Component */}
      <SRSFlashcardView onSelectWord={onSelectWord} />
    </div>
  );
}

export default FlashcardsPage;
