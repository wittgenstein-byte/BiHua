import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, CheckCircle2, XCircle, Volume2 } from 'lucide-react';
import { speakChinese } from '../../utils/audioUtils';
import { Rating } from '../../engine/srs';
import { ToneColorPinyin } from '../ToneColorPinyin';

export function ContextMatchingQuiz({ targetWord, allWords, onSubmitRating }) {
  const [selectedWord, setSelectedWord] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const word = targetWord?.word || '蘋果';
  const englishMeaning = targetWord?.english || 'apple';

  // Generate choices
  const choices = useMemo(() => {
    const list = new Set([word]);
    if (allWords && allWords.length > 0) {
      const candidates = [...allWords].sort(() => 0.5 - Math.random());
      for (const item of candidates) {
        if (item.word && item.word !== word) {
          list.add(item.word);
        }
        if (list.size >= 4) break;
      }
    }
    const fallbacks = ['蘋果', '爸爸', '謝謝', '再見'];
    fallbacks.forEach(f => list.add(f));
    return Array.from(list).slice(0, 4).sort(() => 0.5 - Math.random());
  }, [word, allWords]);

  useEffect(() => {
    setSelectedWord(null);
    setSubmitted(false);
  }, [word]);

  const handleSelect = (w) => {
    if (submitted) return;
    setSelectedWord(w);
  };

  const handleSubmit = () => {
    if (!selectedWord) return;
    setSubmitted(true);
    speakChinese(word);
  };

  const isCorrect = selectedWord === word;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      <div className="w-full glass-panel rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-6 pb-3 border-b border-slate-800">
          <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5 uppercase tracking-wider">
            <BookOpen className="w-4 h-4" /> Context Fill-in-the-Blank
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-semibold">
            HSK {targetWord?.level || 1}
          </span>
        </div>

        {/* Sentence Prompt Box */}
        <div className="w-full bg-slate-900/80 p-6 rounded-2xl border border-slate-800 text-center mb-6 space-y-2">
          <div className="text-xs uppercase tracking-wider text-purple-400 font-medium">Context Sentence</div>
          <div className="text-xl sm:text-2xl font-chinese font-bold text-slate-100 tracking-wide">
            {`我想吃 `}
            <span className="inline-block border-b-2 border-dashed border-purple-400 px-3 py-0.5 text-purple-300 min-w-[80px]">
              {submitted ? word : selectedWord ? selectedWord : '____'}
            </span>
            {` 。`}
          </div>
          <div className="text-xs text-slate-400">
            {`"I would like to eat `}
            <span className="font-semibold text-slate-200">[{englishMeaning}]</span>
            {`."`}
          </div>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mb-6">
          {choices.map((itemWord, idx) => {
            const isThisSelected = selectedWord === itemWord;
            const isThisCorrect = itemWord === word;

            let cardStyle = 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800';
            if (submitted) {
              if (isThisCorrect) {
                cardStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
              } else if (isThisSelected && !isThisCorrect) {
                cardStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold';
              }
            } else if (isThisSelected) {
              cardStyle = 'bg-purple-500/20 border-purple-500/60 text-purple-200 font-bold ring-2 ring-purple-500/30';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(itemWord)}
                disabled={submitted}
                className={`p-4 rounded-2xl border transition-all text-center flex flex-col items-center justify-center space-y-1 ${cardStyle}`}
              >
                <div className="text-2xl font-chinese font-bold">{itemWord}</div>
                {submitted && isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-1" />}
                {submitted && isThisSelected && !isThisCorrect && <XCircle className="w-4 h-4 text-rose-400 mt-1" />}
              </button>
            );
          })}
        </div>

        {/* Submit & Rating */}
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedWord}
            className={`w-full py-3 rounded-2xl font-bold text-sm transition-all shadow-md ${
              selectedWord
                ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            Check Context Match
          </button>
        ) : (
          <div className="w-full space-y-4 pt-4 border-t border-slate-800 animate-fade-in text-center">
            <div className="flex justify-center">
              <button
                onClick={() => speakChinese(word)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs border border-purple-500/30 transition-all"
              >
                <Volume2 className="w-3.5 h-3.5 text-purple-400" /> Listen Sentence Audio
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => onSubmitRating(Rating.Again)}
                className={`p-3 rounded-2xl text-xs font-bold transition-all border ${
                  !isCorrect
                    ? 'bg-rose-600 text-white ring-2 ring-rose-400 border-transparent shadow-lg'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}
              >
                🔴 Again
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Incorrect</div>
              </button>

              <button
                onClick={() => onSubmitRating(Rating.Hard)}
                className="p-3 rounded-2xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              >
                🟠 Hard
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Guessed</div>
              </button>

              <button
                onClick={() => onSubmitRating(Rating.Good)}
                className={`p-3 rounded-2xl text-xs font-bold transition-all border ${
                  isCorrect
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 border-transparent shadow-lg'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                }`}
              >
                🟢 Good
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Correct Match</div>
              </button>

              <button
                onClick={() => onSubmitRating(Rating.Easy)}
                className="p-3 rounded-2xl text-xs font-bold bg-sky-500/10 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 transition-all"
              >
                🔵 Easy
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Fluent</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
