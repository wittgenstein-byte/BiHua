import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import {
  X,
  Volume2,
  Flame,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  Zap,
  Timer,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
  PenTool,
  Folder,
  Plus
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBookmarks } from '../hooks/useBookmarks';
import { useDictionary } from '../hooks/useDictionary';
import { useDecks } from '../hooks/useDecks';
import confetti from 'canvas-confetti';

/**
 * DraggableCard
 * Natural pendulum physics card with non-linear rotation and progressive stamp
 */
function DraggableCard({
  word,
  cardKey,
  exitDirection,
  isFlipped,
  onFlip,
  onAnswer,
  speakWord
}) {
  const x = useMotionValue(0);

  // Non-linear rotation curve
  const rotate = useTransform(
    x,
    [-260, -140, -40, 0, 40, 140, 260],
    [-20, -11, -1.2, 0, 1.2, 11, 20]
  );

  // Stamp Opacity Deadzone
  const rightStampOpacity = useTransform(x, [30, 110], [0, 1]);
  const leftStampOpacity = useTransform(x, [-110, -30], [1, 0]);
  const rightStampScale = useTransform(x, [30, 110], [0.85, 1.05]);
  const leftStampScale = useTransform(x, [-110, -30], [1.05, 0.85]);

  return (
    <motion.div
      key={cardKey}
      style={{
        x,
        rotate,
        transformOrigin: '50% 100%',
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{
        opacity: 1,
        scale: 1,
        y: 0,
        transition: { type: 'spring', stiffness: 450, damping: 30 }
      }}
      exit={{
        x: exitDirection >= 0 ? 520 : -520,
        rotate: exitDirection >= 0 ? 25 : -25,
        opacity: 0,
        scale: 0.85,
        transition: { duration: 0.22, ease: 'easeOut' }
      }}
      onDragEnd={(e, info) => {
        const offset = info.offset.x;
        const velocity = info.velocity.x;

        const isSwipeRight = offset >= 105 || (offset >= 25 && velocity >= 450);
        const isSwipeLeft = offset <= -105 || (offset <= -25 && velocity <= -450);

        if (isSwipeRight) {
          onAnswer(true);
        } else if (isSwipeLeft) {
          onAnswer(false);
        }
      }}
      onClick={onFlip}
      className="absolute w-full max-w-[340px] aspect-[4/5] rounded-3xl bg-white dark:bg-slate-800 bg-gradient-to-b from-white to-slate-50/95 dark:from-slate-800 dark:to-slate-900 border-2 border-slate-200/90 dark:border-slate-700 shadow-[0_20px_50px_-5px_rgba(0,0,0,0.14)] dark:shadow-[0_25px_60px_-5px_rgba(0,0,0,0.7)] p-6 sm:p-7 flex flex-col items-center justify-between cursor-grab active:cursor-grabbing hover:border-rose-300 dark:hover:border-rose-500/50 transition-colors select-none overflow-hidden touch-none"
    >
      {/* Real-time Progressive Stamp: GOT IT! (Right) */}
      <motion.div
        style={{
          opacity: rightStampOpacity,
          scale: rightStampScale
        }}
        className="absolute top-5 right-5 z-30 px-3.5 py-1.5 rounded-2xl bg-emerald-500 text-white font-black text-xs shadow-xl shadow-emerald-500/40 border-2 border-white/60 rotate-12 pointer-events-none uppercase tracking-wider"
      >
        Got It! ✅
      </motion.div>

      {/* Real-time Progressive Stamp: NEED PRACTICE (Left) */}
      <motion.div
        style={{
          opacity: leftStampOpacity,
          scale: leftStampScale
        }}
        className="absolute top-5 left-5 z-30 px-3.5 py-1.5 rounded-2xl bg-rose-500 text-white font-black text-xs shadow-xl shadow-rose-500/40 border-2 border-white/60 -rotate-12 pointer-events-none uppercase tracking-wider"
      >
        Practice ❌
      </motion.div>

      {/* Card Top: HSK Badge & Audio */}
      <div className="w-full flex items-center justify-between z-10">
        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
          HSK {word.level || 1}
        </span>
        
        <button
          onClick={(e) => {
            e.stopPropagation();
            speakWord(word.word);
          }}
          className="w-9 h-9 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-200 dark:border-rose-500/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
          title="Pronounce Hanzi (or press V)"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Card Center: Hanzi & Pinyin/Meaning Toggle */}
      <div className="flex flex-col items-center text-center my-auto z-10">
        <h1 className="font-chinese text-6xl sm:text-7xl font-medium sm:font-semibold text-slate-900 dark:text-white tracking-wide drop-shadow-sm mb-3">
          {word.word}
        </h1>

        {/* Flipped Reveal or Hidden Hint */}
        <AnimatePresence mode="wait">
          {isFlipped ? (
            <motion.div
              key="flipped"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-1.5"
            >
              <div className="text-lg font-bold text-rose-500 dark:text-rose-400">
                {word.pinyin}
              </div>
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[260px] leading-relaxed">
                {word.english}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700/50 px-3 py-1.5 rounded-full"
            >
              <Eye className="w-3.5 h-3.5" /> Tap card to reveal answer
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card Bottom: Swipe Indicators */}
      <div className="w-full flex items-center justify-between text-[11px] font-bold text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-700/60 z-10">
        <span className="flex items-center gap-1 text-rose-500/80">
          ← ❌ Need Practice
        </span>
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          Got It → ✅
        </span>
      </div>
    </motion.div>
  );
}

/**
 * BackgroundCardPreview
 */
function BackgroundCardPreview({ nextWord }) {
  if (!nextWord) return null;

  return (
    <div className="absolute w-full max-w-[340px] aspect-[4/5] rounded-3xl bg-slate-100/90 dark:bg-slate-800/60 border-2 border-slate-200/70 dark:border-slate-700/50 pointer-events-none flex flex-col items-center justify-center shadow-md select-none scale-[0.93] translate-y-3.5 opacity-60">
      <span className="font-chinese text-5xl font-extrabold text-slate-400 dark:text-slate-600 opacity-40">
        {nextWord.word}
      </span>
    </div>
  );
}

export function ChallengePage() {
  const { folderId } = useParams();
  const navigate = useNavigate();

  const { bookmarks } = useBookmarks();
  const { words } = useDictionary();
  const { decks } = useDecks();

  // Resolve target folder and words
  const isMaster = !folderId || folderId === 'all';

  const folder = useMemo(() => {
    if (isMaster) {
      return {
        id: 'all',
        name: 'คำศัพท์ทั้งหมด (All Saved Words)',
        color: '#e11d48',
        isMaster: true
      };
    }
    return decks.find(d => d.id === folderId) || null;
  }, [folderId, isMaster, decks]);

  // Resolve target words with intelligent fallback
  const targetWords = useMemo(() => {
    if (!words || words.length === 0) return [];

    if (isMaster) {
      // 1. Gather all bookmark words
      const bookmarkSet = new Set(bookmarks || []);
      
      // 2. Also gather words from all custom decks
      (decks || []).forEach(d => {
        (d.words || []).forEach(w => bookmarkSet.add(w));
      });

      const matched = words.filter(w => bookmarkSet.has(w.word));

      // 3. Fallback to top HSK 1 core starter words if user has 0 saved words
      if (matched.length === 0) {
        return words.filter(w => w.level === 1).slice(0, 10);
      }
      return matched;
    }

    if (!folder || !folder.words || folder.words.length === 0) return [];
    const folderWordSet = new Set(folder.words);
    return words.filter(w => folderWordSet.has(w.word));
  }, [isMaster, bookmarks, decks, words, folder]);

  // Game States
  const [deck, setDeck] = useState(() => {
    return targetWords.length > 0 ? [...targetWords].sort(() => Math.random() - 0.5) : [];
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [exitDirection, setExitDirection] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);

  // Stats & Gamification
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [masteredWords, setMasteredWords] = useState([]);
  const [missedWords, setMissedWords] = useState([]);

  // Timer Options (Zen vs 60s Blitz)
  const [timerMode, setTimerMode] = useState('zen'); // 'zen' | 'timed'
  const [timeLeft, setTimeLeft] = useState(60);
  const timerRef = useRef(null);

  // Re-sync deck if targetWords change and deck is empty
  useEffect(() => {
    if (targetWords.length > 0 && deck.length === 0) {
      const shuffled = [...targetWords].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
    }
  }, [targetWords, deck.length]);

  // Handle Blitz Timer
  useEffect(() => {
    if (isGameOver || timerMode !== 'timed') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGameOver, timerMode]);

  // Audio Speech Synthesis
  const speakWord = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const currentWord = deck[currentIndex];
  const nextWord = deck[currentIndex + 1];

  // Handle keyboard shortcuts (ArrowLeft = Practice, ArrowRight = Got it, Space = Flip, V/S = Speak)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isGameOver || !currentWord) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleAnswer(true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleAnswer(false);
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsFlipped(prev => !prev);
      } else if (e.key === 'v' || e.key === 'V' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        speakWord(currentWord.word);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWord, isGameOver, streak, maxStreak, currentIndex, deck]);

  // Handle Next Card logic
  const handleAnswer = (isCorrect) => {
    if (!currentWord) return;

    const dir = isCorrect ? 1 : -1;
    setExitDirection(dir);

    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) setMaxStreak(newStreak);

      const multiplier = newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1;
      setScore(prev => prev + (100 * multiplier));
      setMasteredWords(prev => [...prev, currentWord]);
    } else {
      setStreak(0);
      setMissedWords(prev => [...prev, currentWord]);
    }

    setIsFlipped(false);

    if (currentIndex + 1 < deck.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  // Restart Sprint
  const handleRestart = (onlyMissed = false) => {
    const nextDeck = onlyMissed && missedWords.length > 0 
      ? [...missedWords].sort(() => Math.random() - 0.5) 
      : [...targetWords].sort(() => Math.random() - 0.5);

    setDeck(nextDeck);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsGameOver(false);
    setExitDirection(1);
    setStreak(0);
    setScore(0);
    setMasteredWords([]);
    setMissedWords([]);
    setTimeLeft(60);
  };

  // Exit back to folder
  const handleExit = () => {
    if (isMaster) {
      navigate('/bookmark');
    } else {
      navigate(`/bookmark/${folderId}`);
    }
  };

  const isAllGotIt = isGameOver && deck.length > 0 && missedWords.length === 0 && masteredWords.length === deck.length;
  const progressPercent = deck.length > 0 ? Math.round(((currentIndex + (isGameOver ? 1 : 0)) / deck.length) * 100) : 0;

  // Direct Confetti Celebration Burst
  const fireCelebration = useCallback((isPerfect = false) => {
    try {
      if (isPerfect) {
        // Dual cannon celebration
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 65,
          origin: { x: 0.15, y: 0.7 },
          colors: ['#e11d48', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6']
        });
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 65,
          origin: { x: 0.85, y: 0.7 },
          colors: ['#e11d48', '#f59e0b', '#10b981', '#06b6d4', '#ec4899', '#8b5cf6']
        });
      } else {
        // Center celebration
        confetti({
          particleCount: 65,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#e11d48', '#f59e0b', '#10b981', '#06b6d4']
        });
      }
    } catch (e) {
      console.error('Confetti error:', e);
    }
  }, []);

  // Automatically trigger confetti when game finishes
  useEffect(() => {
    if (isGameOver && deck.length > 0) {
      const isPerfect = missedWords.length === 0 && masteredWords.length === deck.length;
      // Slight delay so results modal has rendered
      const timer = setTimeout(() => {
        fireCelebration(isPerfect);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isGameOver, deck.length, missedWords.length, masteredWords.length, fireCelebration]);

  // Handle manual confetti trigger on clicking trophy
  const handleManualConfettiTrigger = () => {
    const isPerfect = missedWords.length === 0 && masteredWords.length === deck.length;
    fireCelebration(isPerfect);
  };

  // Not Found / Empty Folder State (Only for custom folders that don't exist or have 0 words)
  if (!folder || targetWords.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f8fafc] dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none text-slate-800 dark:text-slate-100">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto mb-6 shadow-xl shadow-rose-950/20">
          <Folder className="w-10 h-10" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black font-chinese mb-2 text-slate-900 dark:text-white">
          {!folder ? 'Folder Not Found' : 'No Words in this Folder'}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 font-medium leading-relaxed">
          {!folder 
            ? 'The requested folder could not be found or may have been deleted.' 
            : 'Add some words to this folder first before launching the WordSnap Challenge.'}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/bookmark')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold transition-all shadow-md active:scale-95 border border-slate-200 dark:border-slate-700"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Folders
          </button>
          
          <button
            onClick={() => navigate(folder ? `/bookmark/${folder.id}` : '/dictionary')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Manage Words
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#f8fafc] dark:bg-slate-950 flex flex-col text-slate-800 dark:text-slate-100 select-none overflow-hidden transition-colors">
      
      {/* Background ambient glowing gradient decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-500/10 dark:bg-rose-500/15 blur-3xl" />
        <div className="absolute top-1/2 -right-32 w-96 h-96 rounded-full bg-amber-500/10 dark:bg-amber-500/15 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-indigo-500/10 dark:bg-indigo-500/15 blur-3xl" />
      </div>

      {/* ──── TOP IMMERSIVE GAME HEADER ──── */}
      <header className="px-4 sm:px-8 py-4 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/60 backdrop-blur-md flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs transition-colors shadow-sm"
            title="Exit Challenge"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>

          <div className="flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-md"
              style={{ backgroundColor: folder.color || '#e11d48' }}
            />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white font-chinese leading-tight truncate max-w-[200px] sm:max-w-[320px]">
                {folder.name}
              </h2>
              <p className="text-[11px] font-bold text-rose-500 dark:text-rose-400 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> WordSnap Challenge
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Blitz Timer Mode Toggle */}
          {!isGameOver && (
            <button
              onClick={() => setTimerMode(prev => prev === 'zen' ? 'timed' : 'zen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-extrabold transition-all ${
                timerMode === 'timed'
                  ? 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30 dark:border-amber-500/40 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Toggle Blitz Timer Mode"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>{timerMode === 'timed' ? `${timeLeft}s Blitz` : 'Zen Mode'}</span>
            </button>
          )}

          {/* Close Game Button */}
          <button
            onClick={handleExit}
            className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Close (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ──── PROGRESS & SCORE BAR ──── */}
      {!isGameOver && (
        <div className="px-4 sm:px-8 pt-3 pb-2 bg-white/50 dark:bg-slate-900/40 border-b border-slate-200/60 dark:border-slate-800/50 z-20 shrink-0">
          <div className="max-w-xl mx-auto space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500 dark:text-slate-400">
                Card <strong className="text-slate-900 dark:text-white font-extrabold">{Math.min(currentIndex + 1, deck.length)}</strong> of <strong className="text-slate-900 dark:text-white font-extrabold">{deck.length}</strong>
              </span>

              {/* Fire Streak & Score */}
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black transition-all ${
                    streak >= 3
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse'
                      : streak > 0
                      ? 'bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'fill-current' : ''}`} />
                  <span>{streak} Streak {streak >= 5 ? '🔥 x3' : streak >= 3 ? '⚡ x2' : ''}</span>
                </div>
                <span className="text-xs font-black text-rose-500 dark:text-rose-400">{score} XP</span>
              </div>
            </div>

            {/* Linear Progress Bar */}
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ──── MAIN GAME ARENA ──── */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto z-20">
        {!isGameOver && currentWord ? (
          <div className="w-full max-w-sm flex flex-col items-center gap-6 my-auto">
            
            {/* WordSnap Card Stack Arena with PopLayout */}
            <div className="relative w-full max-w-[340px] aspect-[4/5] flex items-center justify-center">
              <BackgroundCardPreview nextWord={nextWord} />

              <AnimatePresence mode="popLayout">
                <DraggableCard
                  key={`${currentWord.id || currentWord.word}-${currentIndex}`}
                  cardKey={`${currentWord.id || currentWord.word}-${currentIndex}`}
                  word={currentWord}
                  exitDirection={exitDirection}
                  isFlipped={isFlipped}
                  onFlip={() => setIsFlipped(prev => !prev)}
                  onAnswer={handleAnswer}
                  speakWord={speakWord}
                />
              </AnimatePresence>
            </div>

            {/* Action Buttons for Rapid Answering */}
            <div className="flex items-center justify-center gap-3 w-full max-w-[340px]">
              <button
                onClick={() => handleAnswer(false)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/15 dark:hover:bg-rose-500/25 text-rose-600 dark:text-rose-400 font-black text-sm border border-rose-200 dark:border-rose-500/30 shadow-md transition-all hover:scale-105 active:scale-95"
                title="Press Left Arrow Key"
              >
                <XCircle className="w-4 h-4" /> Need Practice
              </button>

              <button
                onClick={() => setIsFlipped(prev => !prev)}
                className="p-3.5 rounded-2xl bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-sm border border-slate-200 dark:border-slate-700 transition-all active:scale-95 shadow-md"
                title="Toggle Reveal (Spacebar)"
              >
                {isFlipped ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5 text-rose-500" />}
              </button>

              <button
                onClick={() => handleAnswer(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/15 dark:hover:bg-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-black text-sm border border-emerald-200 dark:border-emerald-500/30 shadow-md transition-all hover:scale-105 active:scale-95"
                title="Press Right Arrow Key"
              >
                <CheckCircle2 className="w-4 h-4" /> Got It!
              </button>
            </div>

            {/* Keyboard shortcut hints */}
            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 hidden sm:block text-center">
              Keyboard: <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">←</kbd> Practice &nbsp;•&nbsp; <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Space</kbd> Flip &nbsp;•&nbsp; <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">V</kbd> Audio &nbsp;•&nbsp; <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">→</kbd> Got It
            </p>
          </div>
        ) : (
          /* ──── GAME OVER & RESULTS SCREEN ──── */
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 text-center shadow-2xl backdrop-blur-md my-auto"
          >
            {/* Header Trophy & Badge */}
            <div className="space-y-3">
              <div
                onClick={handleManualConfettiTrigger}
                className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl transition-all ${
                  isAllGotIt
                    ? 'bg-gradient-to-tr from-amber-500 to-rose-500 text-white cursor-pointer hover:scale-110 active:scale-95 animate-bounce'
                    : masteredWords.length >= deck.length / 2
                    ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-pointer hover:scale-105'
                    : 'bg-rose-500/15 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 cursor-pointer hover:scale-105'
                }`}
                title="Click for celebratory confetti!"
              >
                {isAllGotIt ? (
                  <Trophy className="w-10 h-10 fill-current" />
                ) : masteredWords.length >= deck.length / 2 ? (
                  <Sparkles className="w-10 h-10" />
                ) : (
                  <Flame className="w-10 h-10" />
                )}
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-chinese">
                  {isAllGotIt
                    ? 'Perfect Mastery! 🏆'
                    : masteredWords.length >= deck.length / 2
                    ? 'Great Workout! ⚡'
                    : 'Keep Practicing! 💪'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                  You completed all {deck.length} flashcards in <strong className="text-slate-900 dark:text-white">{folder.name}</strong>
                </p>
              </div>
            </div>

            {/* Score & Streak Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</div>
                <div className="text-xl font-black text-rose-500 dark:text-rose-400 mt-0.5">{score} XP</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Streak</div>
                <div className="text-xl font-black text-amber-500 dark:text-amber-400 mt-0.5">🔥 {maxStreak}</div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</div>
                <div className="text-xl font-black text-emerald-500 dark:text-emerald-400 mt-0.5">
                  {deck.length > 0 ? Math.round((masteredWords.length / deck.length) * 100) : 0}%
                </div>
              </div>
            </div>

            {/* Review Cards breakdown */}
            <div className="space-y-2 text-left max-h-48 overflow-y-auto pr-1">
              {missedWords.length > 0 && (
                <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 space-y-2">
                  <div className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Words to Practice ({missedWords.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {missedWords.map((w, idx) => (
                      <span
                        key={idx}
                        onClick={() => navigate(`/character/${encodeURIComponent(w.word)}?mode=practice`)}
                        className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900/90 text-rose-600 dark:text-rose-300 text-xs font-extrabold border border-rose-200 dark:border-rose-500/20 flex items-center gap-1 cursor-pointer hover:bg-rose-500 hover:text-white transition-colors"
                        title="Practice writing"
                      >
                        {w.word} <PenTool className="w-3 h-3" />
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {masteredWords.length > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 space-y-2">
                  <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mastered Words ({masteredWords.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {masteredWords.map((w, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900/80 text-emerald-600 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-500/20"
                      >
                        {w.word}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              {missedWords.length > 0 && (
                <button
                  onClick={() => handleRestart(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" /> Practice Missed Words Only ({missedWords.length})
                </button>
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRestart(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
                >
                  <RotateCcw className="w-4 h-4" /> Replay All
                </button>

                <button
                  onClick={handleExit}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Folder
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default ChallengePage;
