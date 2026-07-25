import React, { useState, useEffect, useRef } from 'react';
import { Brain, Eye, CheckCircle, RotateCcw, Sparkles, Award } from 'lucide-react';
import { useSRS } from '../hooks/useSRS';
import { useDictionary } from '../hooks/useDictionary';
import { createStrokeWriter } from '../engine/strokeWriter';
import { mapMistakesToRating, Rating } from '../engine/srs';

export function SRSFlashcardView({ onSelectWord }) {
  const { stats, dueCards, submitRating, loading } = useSRS();
  const { words, chars } = useDictionary();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [recommendedRating, setRecommendedRating] = useState(null);

  const containerRef = useRef(null);
  const writerRef = useRef(null);

  // Active flashcard character object
  const currentReview = dueCards[currentIndex];
  const charSymbol = currentReview ? currentReview.char : (chars[currentIndex % chars.length]?.char || '愛');

  // Find associated word definition
  const associatedWord = words.find(w => w.word.includes(charSymbol)) || {
    word: charSymbol,
    pinyin: '',
    english: 'Chinese Character',
    level: 1
  };

  useEffect(() => {
    if (!containerRef.current || !charSymbol) return;

    setRevealed(false);
    setMistakes(0);
    setRecommendedRating(null);

    const writer = createStrokeWriter(containerRef.current, charSymbol, {
      width: 280,
      height: 280,
      showOutline: true,
      showCharacter: false,
      highlightColor: '#22c55e'
    });

    if (writer) {
      writerRef.current = writer;
      writer.quiz({
        onMistake: () => setMistakes(m => m + 1),
        onComplete: (summary) => {
          setRevealed(true);
          const totalM = summary.totalMistakes || 0;
          const rec = mapMistakesToRating(totalM);
          setRecommendedRating(rec);
        }
      });
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [charSymbol, currentIndex]);

  const handleGradeSubmission = async (ratingVal) => {
    await submitRating(charSymbol, ratingVal, associatedWord.level);
    setCurrentIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="w-full py-20 text-center text-slate-400">
        <Sparkles className="w-8 h-8 animate-spin text-rose-500 mx-auto mb-2" />
        Loading SRS Flashcard Deck...
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Due for Review</div>
          <div className="text-2xl font-bold text-amber-400 mt-0.5">{stats.dueCount}</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Total Studied</div>
          <div className="text-2xl font-bold text-rose-400 mt-0.5">{stats.totalStudied}</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Learning</div>
          <div className="text-2xl font-bold text-sky-400 mt-0.5">{stats.learningCount}</div>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-slate-800 text-center">
          <div className="text-xs text-slate-400 font-medium">Mastered</div>
          <div className="text-2xl font-bold text-emerald-400 mt-0.5">{stats.masteredCount}</div>
        </div>
      </div>

      {/* Main Flashcard Interface */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col items-center">
        <div className="flex items-center justify-between w-full mb-4">
          <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Brain className="w-4 h-4" /> Spaced Repetition Review
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-semibold">
            HSK {associatedWord.level}
          </span>
        </div>

        {/* Tianzige Grid Drawing Canvas */}
        <div className="tianzige-grid w-[280px] h-[280px] flex items-center justify-center my-2">
          <div ref={containerRef} className="w-[280px] h-[280px]" />
        </div>

        <div className="text-xs text-slate-400 mt-2 mb-4">
          Draw the character stroke order inside the grid or click to reveal answer.
        </div>

        {/* Answer Reveal Panel */}
        {!revealed ? (
          <button
            onClick={() => {
              setRevealed(true);
              if (writerRef.current) {
                writerRef.current.showCharacter();
              }
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-colors border border-slate-700 shadow-md"
          >
            <Eye className="w-4 h-4" /> Reveal Pinyin & Meaning
          </button>
        ) : (
          <div className="w-full text-center space-y-4 pt-2 border-t border-slate-800/80 animate-fade-in">
            <div>
              <div className="text-2xl font-bold text-white font-chinese">{associatedWord.word}</div>
              <div className="text-lg font-semibold text-rose-400 mt-1">{associatedWord.pinyin}</div>
              <div className="text-sm text-slate-300">{associatedWord.english}</div>
            </div>

            {/* FSRS Rating Buttons */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-400 mb-3">Rate your recall quality (FSRS):</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  onClick={() => handleGradeSubmission(Rating.Again)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                    recommendedRating === Rating.Again
                      ? 'bg-rose-600 text-white ring-2 ring-rose-400 border-transparent shadow-lg'
                      : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                  }`}
                >
                  🔴 Again
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">&lt; 1 min</div>
                </button>

                <button
                  onClick={() => handleGradeSubmission(Rating.Hard)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                    recommendedRating === Rating.Hard
                      ? 'bg-amber-600 text-white ring-2 ring-amber-400 border-transparent shadow-lg'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                  }`}
                >
                  🟠 Hard
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">1 day</div>
                </button>

                <button
                  onClick={() => handleGradeSubmission(Rating.Good)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                    recommendedRating === Rating.Good
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 border-transparent shadow-lg'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                  }`}
                >
                  🟢 Good
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">3 days</div>
                </button>

                <button
                  onClick={() => handleGradeSubmission(Rating.Easy)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border ${
                    recommendedRating === Rating.Easy
                      ? 'bg-sky-600 text-white ring-2 ring-sky-400 border-transparent shadow-lg'
                      : 'bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500/20'
                  }`}
                >
                  🔵 Easy
                  <div className="text-[10px] font-normal opacity-80 mt-0.5">7 days</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
