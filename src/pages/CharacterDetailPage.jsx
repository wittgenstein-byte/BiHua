import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Play, Pause, RotateCcw, FastForward, PenTool, CheckCircle, AlertCircle, BookOpen, ArrowLeft, Bookmark } from 'lucide-react';
import { createStrokeWriter } from '../engine/strokeWriter';
import { StrokeAnimatorController } from '../engine/strokeAnimator';
import { useDictionary } from '../hooks/useDictionary';
import { useBookmarks } from '../hooks/useBookmarks';

export function CharacterDetailPage() {
  const { word: wordParam } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { words, getWordsByChar } = useDictionary();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const decodedWord = wordParam ? decodeURIComponent(wordParam) : '';
  const wordObj = words.find(w => w.word === decodedWord) || {
    word: decodedWord,
    pinyin: '',
    english: 'Chinese Character',
    level: 1,
    chars: [decodedWord]
  };

  const bookmarked = isBookmarked(wordObj.word);
  const chars = wordObj?.chars || [wordObj?.word || ''];

  const [selectedCharIndex, setSelectedCharIndex] = useState(0);
  const initialMode = searchParams.get('mode') === 'practice' ? 'practice' : 'animate';
  const [mode, setMode] = useState(initialMode); // 'animate' | 'practice'

  useEffect(() => {
    setMode(searchParams.get('mode') === 'practice' ? 'practice' : 'animate');
  }, [searchParams]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [highlightRadicals, setHighlightRadicals] = useState(true);
  const [mistakes, setMistakes] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [score, setScore] = useState(null);

  const containerRef = useRef(null);
  const writerRef = useRef(null);
  const animatorRef = useRef(null);

  const currentChar = chars[selectedCharIndex] || chars[0];
  const relatedWords = getWordsByChar ? getWordsByChar(currentChar).filter(w => w.word !== wordObj.word) : [];

  useEffect(() => {
    if (!containerRef.current || !currentChar) return;

    let cancelled = false;
    setMistakes(0);
    setIsCompleted(false);
    setScore(null);
    setIsPlaying(false);

    if (mode === 'animate') {
      const writer = createStrokeWriter(containerRef.current, currentChar, {
        width: 300,
        height: 300,
        showOutline: true,
        showCharacter: true,
        strokeAnimationSpeed: speed,
        radicalColor: highlightRadicals ? '#e11d48' : '#0f172a'
      });
      if (writer) {
        writerRef.current = writer;
        animatorRef.current = new StrokeAnimatorController(writer);
      }
    } else if (mode === 'practice') {
      const writer = createStrokeWriter(containerRef.current, currentChar, {
        width: 300,
        height: 300,
        showOutline: true,
        showCharacter: false,
        highlightColor: '#22c55e'
      });
      if (writer) {
        writerRef.current = writer;
        writer.quiz({
          onMistake: () => { if (!cancelled) setMistakes(prev => prev + 1); },
          onComplete: (summary) => {
            if (!cancelled) {
              setIsCompleted(true);
              setScore(Math.max(0, 100 - ((summary.totalMistakes || 0) * 15)));
            }
          }
        });
      }
    }

    return () => {
      cancelled = true;
      if (containerRef.current) containerRef.current.innerHTML = '';
    };
  }, [currentChar, mode, selectedCharIndex]);

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

  const handleSpeedChange = (newSpeed) => {
    setSpeed(newSpeed);
    if (animatorRef.current) animatorRef.current.setSpeed(newSpeed);
  };

  const handleToggleRadicals = () => {
    const next = !highlightRadicals;
    setHighlightRadicals(next);
    if (animatorRef.current) animatorRef.current.toggleRadicalHighlight(next);
  };

  if (!decodedWord) return null;

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-all"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Search
      </button>

      {/* Main Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-chinese text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                {wordObj.word}
              </h1>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30">
                HSK {wordObj.level}
              </span>
            </div>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">{wordObj.pinyin}</div>
            <div className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-0.5">{wordObj.english}</div>
          </div>

          <button
            onClick={() => toggleBookmark(wordObj.word)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all ${
              bookmarked
                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-white dark:bg-slate-900/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border-slate-200/80 dark:border-slate-800'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${bookmarked ? 'fill-amber-500 dark:fill-amber-300' : ''}`} />
            <span>{bookmarked ? 'Bookmarked' : 'Bookmark'}</span>
          </button>
        </div>

        {/* Multi-Character Tabs */}
        {chars.length > 1 && (
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1">Characters:</span>
            {chars.map((c, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCharIndex(idx)}
                className={`font-chinese text-lg px-4 py-1.5 rounded-2xl font-bold transition-all ${
                  selectedCharIndex === idx
                    ? 'bg-rose-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* Mode Switcher */}
        <div className="flex items-center justify-center gap-2 mb-6 bg-slate-100/80 dark:bg-slate-900/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-max mx-auto">
          <button
            onClick={() => setMode('animate')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              mode === 'animate' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Play className="w-4 h-4" /> Animated Stroke Visualizer
          </button>
          <button
            onClick={() => setMode('practice')}
            className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              mode === 'practice' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PenTool className="w-4 h-4" /> Practice Mode
          </button>
        </div>

        {/* Tianzige Canvas */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="tianzige-grid w-[300px] h-[300px] flex items-center justify-center relative rounded-3xl shadow-inner">
            <div ref={containerRef} className="w-[300px] h-[300px]" />
          </div>
        </div>

        {/* Animation Controls */}
        {mode === 'animate' && (
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6 p-4 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 shadow-sm">
            <button
              onClick={handleTogglePlay}
              className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-md transition-colors"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              {isPlaying ? 'Pause' : 'Play Order'}
            </button>

            <button
              onClick={() => { animatorRef.current?.reset(); setIsPlaying(false); }}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Restart"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={() => animatorRef.current?.stepForward()}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Step Forward"
            >
              <FastForward className="w-4 h-4" />
            </button>

            {/* Speed Control */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
              {[0.5, 1.0, 1.5, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => handleSpeedChange(s)}
                  className={`px-2.5 py-1 rounded-xl transition-colors ${speed === s ? 'bg-rose-600 text-white shadow-sm' : 'hover:text-slate-900 dark:hover:text-white'}`}
                >
                  {s}x
                </button>
              ))}
            </div>

            <button
              onClick={handleToggleRadicals}
              className={`text-xs px-3.5 py-2 rounded-2xl font-bold border transition-all ${
                highlightRadicals
                  ? 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}
            >
              Highlight Radicals
            </button>
          </div>
        )}

        {/* Practice Feedback */}
        {mode === 'practice' && (
          <div className="mt-6 p-5 rounded-3xl bg-white/70 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 text-center shadow-sm">
            {!isCompleted ? (
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Draw strokes inside the Tianzige grid:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" /> Mistakes: {mistakes}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-black text-lg">
                  <CheckCircle className="w-6 h-6" /> Character Completed!
                </div>
                <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Accuracy Score: <strong className="text-slate-900 dark:text-white text-base font-black">{score}/100</strong> ({mistakes} mistakes)
                </div>
                <button
                  onClick={() => { setIsCompleted(false); setMistakes(0); setScore(null); writerRef.current?.quiz(); }}
                  className="px-5 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-md transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Related Vocabulary */}
        {relatedWords.length > 0 && (
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              Other HSK Vocabulary Containing "{currentChar}":
            </h4>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-1">
              {relatedWords.map((rw, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(`/character/${encodeURIComponent(rw.word)}`)}
                  className="px-3.5 py-1.5 rounded-2xl bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 hover:text-rose-600 dark:hover:text-rose-300 flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <span className="font-chinese font-bold text-sm text-slate-900 dark:text-white">{rw.word}</span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">({rw.pinyin})</span>
                  <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">HSK {rw.level}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CharacterDetailPage;
