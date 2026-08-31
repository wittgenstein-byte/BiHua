import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, FastForward, PenTool, CheckCircle, AlertCircle, Sparkles, BookOpen } from 'lucide-react';
import { createStrokeWriter } from '../engine/strokeWriter';
import { StrokeAnimatorController } from '../engine/strokeAnimator';
import { useDictionary } from '../hooks/useDictionary';

export function CharacterDetailModal({ wordObj, initialMode = 'animate', onClose, onSelectWord }) {
  const [selectedCharIndex, setSelectedCharIndex] = useState(0);
  const [mode, setMode] = useState(initialMode); // 'animate' | 'practice'
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [highlightRadicals, setHighlightRadicals] = useState(true);

  // Practice Mode state
  const [mistakes, setMistakes] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(null);

  const containerRef = useRef(null);
  const writerRef = useRef(null);
  const animatorRef = useRef(null);

  const { getWordsByChar } = useDictionary();

  const chars = wordObj?.chars || [wordObj?.word || ''];
  const currentChar = chars[selectedCharIndex] || chars[0];

  // Fetch cross-referenced words containing the current character
  const relatedWords = getWordsByChar(currentChar).filter(w => w.word !== wordObj.word);

  // Initialize HanziWriter when modal mounts or mode/character changes
  useEffect(() => {
    if (!containerRef.current || !currentChar) return;

    let writer = null;
    let cancelled = false;

    setMistakes(0);
    setIsCompleted(false);
    setScore(null);
    setIsPlaying(false);

    if (mode === 'animate') {
      writer = createStrokeWriter(containerRef.current, currentChar, {
        width: 280,
        height: 280,
        showOutline: true,
        showCharacter: true,
        strokeAnimationSpeed: speed,
        radicalColor: highlightRadicals ? '#f43f5e' : '#0f172a'
      });

      if (writer) {
        writerRef.current = writer;
        animatorRef.current = new StrokeAnimatorController(writer);
      }
    } else if (mode === 'practice') {
      writer = createStrokeWriter(containerRef.current, currentChar, {
        width: 280,
        height: 280,
        showOutline: true,
        showCharacter: false,
        highlightColor: '#22c55e'
      });

      if (writer) {
        writerRef.current = writer;
        // Start HanziWriter quiz mode
        writer.quiz({
          onMistake: (strokeData) => {
            if (cancelled) return;
            setMistakes(prev => prev + 1);
          },
          onCorrectStroke: (strokeData) => {
            // Optional stroke haptic/audio cue
          },
          onComplete: (summary) => {
            if (cancelled) return;
            setIsCompleted(true);
            const totalM = summary.totalMistakes || 0;
            const computedScore = Math.max(0, 100 - (totalM * 15));
            setScore(computedScore);
          }
        });
      }
    }

    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [currentChar, mode, selectedCharIndex]);

  // Handle Play / Pause animation
  const handleTogglePlay = async () => {
    if (!animatorRef.current) return;
    if (isPlaying) {
      animatorRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      await animatorRef.current.animateCharacter(() => setIsPlaying(false));
    }
  };

  // Handle Restart animation
  const handleRestart = () => {
    if (animatorRef.current) {
      animatorRef.current.reset();
      setIsPlaying(false);
    }
  };

  // Handle Step Forward
  const handleStepForward = () => {
    if (animatorRef.current) {
      animatorRef.current.stepForward();
    }
  };

  // Handle Speed Change
  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    if (animatorRef.current) {
      animatorRef.current.setSpeed(newSpeed);
    }
  };

  // Handle Radical Highlight Toggle
  const handleToggleRadicals = () => {
    const nextVal = !highlightRadicals;
    setHighlightRadicals(nextVal);
    if (animatorRef.current) {
      animatorRef.current.toggleRadicalHighlight(nextVal);
    }
  };

  if (!wordObj) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-slate-700/80 shadow-2xl p-6 sm:p-8 my-8 text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <h2 className="font-chinese text-4xl font-extrabold text-white tracking-tight">
              {wordObj.word}
            </h2>
            <span className="text-sm font-semibold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              HSK {wordObj.level}
            </span>
          </div>
          <div className="text-lg font-semibold text-rose-400 mt-1">{wordObj.pinyin}</div>
          <div className="text-sm text-slate-300 mt-0.5">{wordObj.english}</div>
        </div>

        {/* Multi-Character Selector Tabs */}
        {chars.length > 1 && (
          <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold text-slate-400 mr-1">Characters:</span>
            {chars.map((c, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCharIndex(idx)}
                className={`font-chinese text-lg px-4 py-1.5 rounded-xl font-bold transition-all ${
                  selectedCharIndex === idx
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Mode Switcher inside Modal */}
        <div className="w-full max-w-sm mx-auto flex items-center justify-center gap-1.5 mb-6 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setMode('animate')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              mode === 'animate'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Play className="w-4 h-4 shrink-0" />
            <span className="truncate">Stroke Order</span>
          </button>
          <button
            onClick={() => setMode('practice')}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              mode === 'practice'
                ? 'bg-rose-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-4 h-4 shrink-0" />
            <span className="truncate">Practice Mode</span>
          </button>
        </div>

        {/* Display Box with Tianzige Grid Background */}
        <div className="flex flex-col items-center justify-center my-2">
          <div className="tianzige-grid w-[260px] h-[260px] sm:w-[280px] sm:h-[280px] flex items-center justify-center relative rounded-2xl shadow-inner overflow-hidden">
            <div ref={containerRef} className="w-[260px] h-[260px] sm:w-[280px] sm:h-[280px]" />
          </div>
        </div>

        {/* Animation Controls Bar */}
        {mode === 'animate' && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
            <button
              onClick={handleTogglePlay}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm shadow-md transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play Order'}
            </button>

            <button
              onClick={handleRestart}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleStepForward}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Step Forward"
            >
              <FastForward className="w-4 h-4" />
            </button>

            {/* Speed Control */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300">
              {[0.5, 1.0, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    speed === s ? 'bg-rose-500 text-white' : 'hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {/* Radical Toggle */}
            <button
              onClick={handleToggleRadicals}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold border transition-all ${
                highlightRadicals
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              Highlight Radicals
            </button>
          </div>
        )}

        {/* Practice Mode Feedback Panel */}
        {mode === 'practice' && (
          <div className="mt-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
            {!isCompleted ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Draw strokes inside the Tianzige grid:</span>
                <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Mistakes: {mistakes}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-lg">
                  <CheckCircle className="w-6 h-6" /> Character Completed!
                </div>
                <div className="text-sm text-slate-300">
                  Score: <strong className="text-white text-base">{score}/100</strong> ({mistakes} mistakes)
                </div>
                <button
                  onClick={() => {
                    setIsCompleted(false);
                    setMistakes(0);
                    setScore(null);
                    if (writerRef.current) {
                      writerRef.current.quiz();
                    }
                  }}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-md transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Vocabulary Cross-Referencing Section */}
        {relatedWords.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-800">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-rose-400" />
              Other HSK Vocabulary Containing "{currentChar}":
            </h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
              {relatedWords.map((rw, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectWord(rw, mode)}
                  className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
                >
                  <span className="font-chinese font-bold text-sm text-white">{rw.word}</span>
                  <span className="text-slate-400 font-normal">({rw.pinyin})</span>
                  <span className="text-[10px] text-rose-400 font-semibold">HSK {rw.level}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
