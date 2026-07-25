import React, { useState, useEffect } from 'react';
import { Volume2, Eye, Brain, Sparkles, Layers, BookOpen, Clock, ShieldCheck } from 'lucide-react';
import { ToneColorPinyin } from '../ToneColorPinyin';
import { speakChinese } from '../../utils/audioUtils';
import { Rating } from '../../engine/srs';
import { computeRetrievability } from '../../engine/srs';

export function CoreFlashcard({ reviewCard, associatedWord, onSubmitRating }) {
  const [revealed, setRevealed] = useState(false);

  const wordText = associatedWord?.word || reviewCard?.char || '愛';
  const pinyinText = associatedWord?.pinyin || '';
  const englishText = associatedWord?.english || 'Chinese vocabulary item';
  const hskLevel = associatedWord?.level || reviewCard?.hskLevel || 1;

  // Extract memory state info if existing card record
  const cardData = reviewCard?.card;
  const stability = cardData?.stability ? Math.round(cardData.stability * 10) / 10 : null;
  const difficulty = cardData?.difficulty ? Math.round(cardData.difficulty * 10) / 10 : null;
  const elapsedDays = reviewCard?.lastReviewed
    ? Math.max(0, Math.floor((new Date() - new Date(reviewCard.lastReviewed)) / (1000 * 60 * 60 * 24)))
    : 0;
  const retrievability = stability ? computeRetrievability(stability, elapsedDays) : null;

  useEffect(() => {
    setRevealed(false);
  }, [wordText]);

  const handleAudio = (e) => {
    e?.stopPropagation();
    speakChinese(wordText);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Flashcard Box */}
      <div className="w-full glass-panel rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl transition-all duration-300 relative overflow-hidden">
        {/* Background glow gradient */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Card Header Info */}
        <div className="flex items-center justify-between w-full mb-6 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <Brain className="w-4 h-4" /> Core Recall
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-semibold">
              HSK {hskLevel}
            </span>
          </div>

          {/* Memory State Badge ($S, R, D$) */}
          {stability !== null && (
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800" title="Stability (Days)">
                <Clock className="w-3 h-3 text-sky-400" /> S: {stability}d
              </span>
              <span className="flex items-center gap-1 bg-slate-900/90 px-2 py-0.5 rounded-lg border border-slate-800" title="Retrievability (%)">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> R: {retrievability}%
              </span>
            </div>
          )}
        </div>

        {/* Front of Card: Main Hanzi Display */}
        <div className="flex flex-col items-center justify-center my-6 space-y-4 text-center">
          <div className="text-6xl sm:text-7xl font-chinese font-bold text-white tracking-widest drop-shadow-md selection:bg-rose-500/40">
            {wordText}
          </div>

          {/* Audio TTS Button */}
          <button
            onClick={handleAudio}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium border border-rose-500/30 transition-all hover:scale-105 active:scale-95"
            title="Listen to pronunciation"
          >
            <Volume2 className="w-4 h-4 text-rose-400" /> Pronounce Audio
          </button>
        </div>

        {/* Answer Reveal Button vs Revealed Answer Details */}
        {!revealed ? (
          <div className="w-full pt-4 flex justify-center">
            <button
              onClick={() => {
                setRevealed(true);
                speakChinese(wordText);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold text-sm shadow-lg shadow-rose-950/50 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Eye className="w-4 h-4" /> Reveal Answer & Pinyin
            </button>
          </div>
        ) : (
          <div className="w-full space-y-5 pt-4 border-t border-slate-800/80 animate-fade-in">
            {/* Tone Color-Coded Pinyin */}
            <div className="text-center space-y-1">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Pinyin</div>
              <ToneColorPinyin pinyin={pinyinText} className="text-2xl font-bold justify-center" />
            </div>

            {/* Meaning & Definition */}
            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80 text-center space-y-1">
              <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Meaning</div>
              <div className="text-base font-semibold text-slate-100">{englishText}</div>
            </div>

            {/* Radical Breakdown / Components if multi-character */}
            {wordText.length > 1 && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-900/40 py-2 px-3 rounded-xl border border-slate-800/50">
                <Layers className="w-3.5 h-3.5 text-rose-400" />
                <span>Components: {wordText.split('').join(' + ')}</span>
              </div>
            )}

            {/* FSRS Rating Buttons */}
            <div className="pt-2">
              <div className="text-xs font-semibold text-slate-400 mb-3 text-center">
                Rate your recall quality (FSRS):
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => onSubmitRating(Rating.Again)}
                  className="p-3 rounded-2xl text-xs font-bold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition-all text-center flex flex-col items-center hover:scale-105 active:scale-95 shadow-sm"
                >
                  <span className="text-sm">🔴 Again</span>
                  <span className="text-[10px] font-normal text-rose-400/80 mt-0.5">&lt; 1 min</span>
                </button>

                <button
                  onClick={() => onSubmitRating(Rating.Hard)}
                  className="p-3 rounded-2xl text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all text-center flex flex-col items-center hover:scale-105 active:scale-95 shadow-sm"
                >
                  <span className="text-sm">🟠 Hard</span>
                  <span className="text-[10px] font-normal text-amber-400/80 mt-0.5">1 day</span>
                </button>

                <button
                  onClick={() => onSubmitRating(Rating.Good)}
                  className="p-3 rounded-2xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all text-center flex flex-col items-center hover:scale-105 active:scale-95 shadow-sm"
                >
                  <span className="text-sm">🟢 Good</span>
                  <span className="text-[10px] font-normal text-emerald-400/80 mt-0.5">3 days</span>
                </button>

                <button
                  onClick={() => onSubmitRating(Rating.Easy)}
                  className="p-3 rounded-2xl text-xs font-bold bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 transition-all text-center flex flex-col items-center hover:scale-105 active:scale-95 shadow-sm"
                >
                  <span className="text-sm">🔵 Easy</span>
                  <span className="text-[10px] font-normal text-sky-400/80 mt-0.5">7 days</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
