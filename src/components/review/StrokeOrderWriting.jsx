import React, { useState, useEffect, useRef } from 'react';
import { PenTool, Eye, RefreshCw, Volume2 } from 'lucide-react';
import { createStrokeWriter } from '../../engine/strokeWriter';
import { mapMistakesToRating, Rating } from '../../engine/srs';
import { ToneColorPinyin } from '../ToneColorPinyin';
import { speakChinese } from '../../utils/audioUtils';

export function StrokeOrderWriting({ charSymbol, associatedWord, onSubmitRating }) {
  const [mistakes, setMistakes] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [recommendedRating, setRecommendedRating] = useState(null);

  const containerRef = useRef(null);
  const writerRef = useRef(null);

  const char = charSymbol || associatedWord?.word?.[0] || '愛';

  useEffect(() => {
    if (!containerRef.current || !char) return;

    setRevealed(false);
    setMistakes(0);
    setRecommendedRating(null);

    const writer = createStrokeWriter(containerRef.current, char, {
      width: 260,
      height: 260,
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
          const totalM = summary?.totalMistakes || 0;
          const rec = mapMistakesToRating(totalM);
          setRecommendedRating(rec);
          speakChinese(char);
        }
      });
    }

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [char]);

  const handleRestartQuiz = () => {
    setMistakes(0);
    setRevealed(false);
    setRecommendedRating(null);
    if (writerRef.current) {
      writerRef.current.quiz({
        onMistake: () => setMistakes(m => m + 1),
        onComplete: (summary) => {
          setRevealed(true);
          const totalM = summary?.totalMistakes || 0;
          setRecommendedRating(mapMistakesToRating(totalM));
          speakChinese(char);
        }
      });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center">
      <div className="w-full glass-panel rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl flex flex-col items-center relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between w-full mb-4">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
            <PenTool className="w-4 h-4" /> Stroke Order Practice
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-800 font-semibold">
            Mistakes: <span className={mistakes > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{mistakes}</span>
          </span>
        </div>

        {/* Word Info hint */}
        <div className="text-center mb-3">
          <ToneColorPinyin pinyin={associatedWord?.pinyin || ''} className="text-lg font-bold" />
          <div className="text-xs text-slate-400 mt-0.5">{associatedWord?.english || 'Draw character strokes'}</div>
        </div>

        {/* Tianzige Grid Canvas */}
        <div className="tianzige-grid w-[260px] h-[260px] flex items-center justify-center my-2 rounded-2xl shadow-inner border border-rose-900/40">
          <div ref={containerRef} className="w-[260px] h-[260px]" />
        </div>

        <div className="text-xs text-slate-400 mt-2 mb-4 text-center">
          Draw the character strokes in correct sequence inside the grid.
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={handleRestartQuiz}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Restart Grid
          </button>
          <button
            onClick={() => speakChinese(char)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs border border-rose-500/30 transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-rose-400" /> Listen
          </button>
        </div>

        {!revealed ? (
          <button
            onClick={() => {
              setRevealed(true);
              if (writerRef.current) writerRef.current.showCharacter();
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 shadow-md transition-colors"
          >
            <Eye className="w-4 h-4" /> Reveal Full Character
          </button>
        ) : (
          <div className="w-full space-y-4 pt-4 border-t border-slate-800/80 animate-fade-in text-center">
            <div className="text-xs font-semibold text-slate-400">
              Quiz Completed! Rate your stroke accuracy (FSRS):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => onSubmitRating(Rating.Again)}
                className={`p-3 rounded-2xl text-xs font-bold transition-all border ${
                  recommendedRating === Rating.Again
                    ? 'bg-rose-600 text-white ring-2 ring-rose-400 border-transparent shadow-lg'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20'
                }`}
              >
                🔴 Again
                <div className="text-[10px] font-normal opacity-80 mt-0.5">3+ Mistakes</div>
              </button>

              <button
                onClick={() => onSubmitRating(Rating.Hard)}
                className={`p-3 rounded-2xl text-xs font-bold transition-all border ${
                  recommendedRating === Rating.Hard
                    ? 'bg-amber-600 text-white ring-2 ring-amber-400 border-transparent shadow-lg'
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                }`}
              >
                🟠 Hard
                <div className="text-[10px] font-normal opacity-80 mt-0.5">1-2 Mistakes</div>
              </button>

              <button
                onClick={() => onSubmitRating(Rating.Good)}
                className={`p-3 rounded-2xl text-xs font-bold transition-all border ${
                  recommendedRating === Rating.Good
                    ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 border-transparent shadow-lg'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
                }`}
              >
                🟢 Good
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Perfect Strokes</div>
              </button>

              <button
                onClick={() => onSubmitRating(Rating.Easy)}
                className="p-3 rounded-2xl text-xs font-bold bg-sky-500/10 text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 transition-all"
              >
                🔵 Easy
                <div className="text-[10px] font-normal opacity-80 mt-0.5">Effortless</div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
