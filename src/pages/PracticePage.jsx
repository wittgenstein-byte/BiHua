import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PenTool, CheckCircle, AlertCircle, RotateCcw, ArrowLeft } from 'lucide-react';
import { createStrokeWriter } from '../engine/strokeWriter';
import { useDictionary } from '../hooks/useDictionary';
import { SearchBar } from '../components/SearchBar';
import { VocabularyGrid } from '../components/VocabularyGrid';
import { useSearch } from '../hooks/useSearch';

export function PracticePage() {
  const { char: charParam } = useParams();
  const navigate = useNavigate();
  const { words, chars } = useDictionary();
  const { query, setQuery, selectedLevel, setSelectedLevel, filteredWords, totalResults } = useSearch();

  const selectedChar = charParam ? decodeURIComponent(charParam) : null;

  // Find word object matching selected character or word
  const wordObj = selectedChar
    ? words.find(w => w.word === selectedChar || w.word.includes(selectedChar)) || {
        word: selectedChar,
        pinyin: '',
        english: 'Chinese Character Practice',
        level: 1,
        chars: [selectedChar]
      }
    : null;

  const targetChar = selectedChar ? (selectedChar[0] || selectedChar) : null;

  // Practice state
  const [mistakes, setMistakes] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(null);

  const containerRef = useRef(null);
  const writerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !targetChar) return;

    let cancelled = false;
    setMistakes(0);
    setIsCompleted(false);
    setScore(null);

    const writer = createStrokeWriter(containerRef.current, targetChar, {
      width: 320,
      height: 320,
      showOutline: true,
      showCharacter: false,
      highlightColor: '#22c55e'
    });

    if (writer) {
      writerRef.current = writer;
      writer.quiz({
        onMistake: () => {
          if (!cancelled) setMistakes(prev => prev + 1);
        },
        onComplete: (summary) => {
          if (!cancelled) {
            setIsCompleted(true);
            const totalM = summary.totalMistakes || 0;
            const computedScore = Math.max(0, 100 - (totalM * 15));
            setScore(computedScore);
          }
        }
      });
    }

    return () => {
      cancelled = true;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [targetChar]);

  const handleSelectPracticeWord = (word) => {
    navigate(`/practice/${encodeURIComponent(word.word)}`);
  };

  // If a character is selected via URL route (/practice/:char)
  if (targetChar) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        {/* Top Breadcrumb & Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/practice')}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Practice Selector
          </button>

        </div>

        {/* Interactive Practice Workspace */}
        <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-slate-700/80 shadow-2xl flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-chinese text-4xl font-extrabold text-white">{wordObj.word}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                  HSK {wordObj.level}
                </span>
              </div>
              {wordObj.pinyin && (
                <p className="text-lg font-semibold text-rose-400 mt-1">{wordObj.pinyin} — {wordObj.english}</p>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
              <PenTool className="w-4 h-4 text-rose-400" /> Stroke Order Test
            </div>
          </div>

          {/* Tianzige Canvas Container */}
          <div className="tianzige-grid w-[320px] h-[320px] flex items-center justify-center my-4 rounded-2xl shadow-2xl relative">
            <div ref={containerRef} className="w-[320px] h-[320px]" />
          </div>

          {/* Feedback & Controls */}
          <div className="w-full max-w-md mt-6">
            {!isCompleted ? (
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <span className="text-xs sm:text-sm text-slate-300">
                  Draw strokes in correct order inside grid
                </span>
                <span className="text-sm font-semibold text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Mistakes: {mistakes}
                </span>
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-slate-900/90 border border-emerald-500/40 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-emerald-400 font-bold text-xl">
                  <CheckCircle className="w-6 h-6" /> Perfect Execution!
                </div>
                <div className="text-sm text-slate-300">
                  Accuracy Score: <strong className="text-white text-base">{score}/100</strong> ({mistakes} mistakes)
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsCompleted(false);
                      setMistakes(0);
                      setScore(null);
                      if (writerRef.current) {
                        writerRef.current.quiz();
                      }
                    }}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-md transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" /> Practice Again
                  </button>
                  <button
                    onClick={() => navigate('/practice')}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors"
                  >
                    Pick Another Character
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Selection View (/practice without :char param)
  return (
    <div className="space-y-8">
      {/* Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel p-6 sm:p-8 border border-slate-800 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-semibold border border-rose-500/20 mb-3">
            <PenTool className="w-3.5 h-3.5" /> Interactive Tianzige Stroke Practice
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 font-chinese">
            Select a Character to Practice Writing
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Choose any HSK character below to launch interactive stroke-by-stroke writing evaluation over Tianzige grid.
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

      {/* Vocabulary Selection Grid */}
      <VocabularyGrid
        words={filteredWords}
        onSelectWord={handleSelectPracticeWord}
      />
    </div>
  );
}

export default PracticePage;
