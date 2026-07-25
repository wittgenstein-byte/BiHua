import React, { useState, useEffect, useMemo } from 'react';
import { Headphones, Volume2, CheckCircle2, XCircle, Sparkles, HelpCircle } from 'lucide-react';
import { speakChinese } from '../../utils/audioUtils';
import { Rating } from '../../engine/srs';
import { ToneColorPinyin } from '../ToneColorPinyin';
import { parsePinyin, getToneName } from '../../utils/pinyinUtils';

export function ToneListenerQuiz({ targetWord, allWords, onSubmitRating }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const word = targetWord?.word || '蘋果';
  const correctPinyin = targetWord?.pinyin || 'píng guǒ';

  // Generate 4 distractor options (1 correct + 3 distractor pinyins)
  const options = useMemo(() => {
    const choices = new Set([correctPinyin]);
    
    // Pick distractors from allWords pool
    if (allWords && allWords.length > 0) {
      const candidates = [...allWords].sort(() => 0.5 - Math.random());
      for (const item of candidates) {
        if (item.pinyin && item.pinyin !== correctPinyin) {
          choices.add(item.pinyin);
        }
        if (choices.size >= 4) break;
      }
    }

    // Fallback choices if dictionary not filled
    const fallbackList = ['píng guǒ', 'pīng guó', 'pǐng guò', 'pìng guō'];
    fallbackList.forEach(f => choices.add(f));

    return Array.from(choices).slice(0, 4).sort(() => 0.5 - Math.random());
  }, [correctPinyin, allWords]);

  useEffect(() => {
    setSelectedOption(null);
    setSubmitted(false);
    // Auto-play pronunciation when card loads
    const timer = setTimeout(() => speakChinese(word), 300);
    return () => clearTimeout(timer);
  }, [word]);

  const handleAudio = () => {
    speakChinese(word);
  };

  const handleSelect = (option) => {
    if (submitted) return;
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (!selectedOption) return;
    setSubmitted(true);
  };

  const isCorrect = selectedOption === correctPinyin;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      <div className="w-full glass-panel rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-6 pb-3 border-b border-slate-800">
          <span className="text-xs font-bold text-sky-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Headphones className="w-4 h-4" /> Tone Listener Quiz
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-semibold">
            HSK {targetWord?.level || 1}
          </span>
        </div>

        {/* Audio Playback Box */}
        <div className="flex flex-col items-center justify-center my-4 space-y-4 text-center w-full">
          <button
            onClick={handleAudio}
            className="w-24 h-24 rounded-full bg-gradient-to-tr from-sky-600 to-sky-400 hover:from-sky-500 hover:to-sky-300 text-white flex items-center justify-center shadow-xl shadow-sky-950/50 transition-all transform hover:scale-105 active:scale-95 group"
            title="Listen to Chinese Audio"
          >
            <Volume2 className="w-10 h-10 group-hover:animate-pulse" />
          </button>
          <div className="text-xs text-sky-300/80 font-medium">
            Tap button to replay audio pronunciation
          </div>
        </div>

        {/* Question Prompt */}
        <div className="text-sm font-medium text-slate-300 mb-4 text-center">
          Which Pinyin and tone matches the spoken Chinese word?
        </div>

        {/* Options List */}
        <div className="w-full space-y-2.5 mb-6">
          {options.map((opt, idx) => {
            const isThisSelected = selectedOption === opt;
            const isThisCorrect = opt === correctPinyin;

            let buttonStyle = 'bg-slate-900/60 border-slate-800 text-slate-200 hover:bg-slate-800/80';
            if (submitted) {
              if (isThisCorrect) {
                buttonStyle = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 font-bold';
              } else if (isThisSelected && !isThisCorrect) {
                buttonStyle = 'bg-rose-500/20 border-rose-500/50 text-rose-300 font-bold';
              }
            } else if (isThisSelected) {
              buttonStyle = 'bg-sky-500/20 border-sky-500/60 text-sky-200 font-semibold ring-2 ring-sky-500/30';
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(opt)}
                disabled={submitted}
                className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between text-base ${buttonStyle}`}
              >
                <ToneColorPinyin pinyin={opt} className="text-lg font-bold" />
                {submitted && isThisCorrect && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {submitted && isThisSelected && !isThisCorrect && <XCircle className="w-5 h-5 text-rose-400" />}
              </button>
            );
          })}
        </div>

        {/* Submit & Feedback Panel */}
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedOption}
            className={`w-full py-3 rounded-2xl font-bold text-sm transition-all shadow-md ${
              selectedOption
                ? 'bg-sky-500 hover:bg-sky-400 text-white cursor-pointer'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            Submit Answer
          </button>
        ) : (
          <div className="w-full space-y-4 pt-4 border-t border-slate-800 animate-fade-in text-center">
            <div className="flex flex-col items-center justify-center space-y-1">
              <div className="text-3xl font-chinese font-bold text-white">{word}</div>
              <div className="text-sm text-slate-300">{targetWord?.english}</div>
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
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Tone Missed</div>
              </button>

              <button
                onClick={() => onSubmitRating(Rating.Hard)}
                className="p-3 rounded-2xl text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
              >
                🟠 Hard
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Hesitated</div>
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
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Correct Tone</div>
              </button>

              <button
                onClick={() => onSubmitRating(Rating.Easy)}
                className="p-3 rounded-2xl text-xs font-bold bg-sky-500/10 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 transition-all"
              >
                🔵 Easy
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Instant Match</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
