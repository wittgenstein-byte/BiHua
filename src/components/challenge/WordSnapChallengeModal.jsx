import React, { useState, useEffect, useRef } from 'react';
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
  Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * DraggableCard
 * 100% stable, natural physics:
 * 1. Bottom-center pivot (50% 100%) for natural pendulum swing
 * 2. Non-linear rotation curve (deadzone at center, accelerated tilt near threshold)
 * 3. 1:1 finger tracking with velocity-aware swipe dismissal
 * 4. Stamp opacity deadzone (0-30px hidden, smooth progressive fade-in 30-110px)
 * 5. Isolated local motion values preventing stuck-state bugs
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

  // 2. Non-linear rotation curve: gentle near center (0-40px), accelerating towards 20°
  const rotate = useTransform(
    x,
    [-260, -140, -40, 0, 40, 140, 260],
    [-20, -11, -1.2, 0, 1.2, 11, 20]
  );

  // 4. Stamp Opacity Deadzone: 0-30px is 0, fading in from 30px to 110px
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
        transformOrigin: '50% 100%', // 1. Pivot from bottom-center
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9} // 1:1 direct responsive tracking
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

        // Velocity & Distance Thresholds:
        // Intentional swipe >= 105px OR energetic flick >= 25px with velocity >= 450px/s
        const isSwipeRight = offset >= 105 || (offset >= 25 && velocity >= 450);
        const isSwipeLeft = offset <= -105 || (offset <= -25 && velocity <= -450);

        if (isSwipeRight) {
          onAnswer(true);
        } else if (isSwipeLeft) {
          onAnswer(false);
        }
        // If not met, Framer Motion automatically springs back to center (x=0, rotate=0)
      }}
      onClick={onFlip}
      className="absolute w-full max-w-[320px] aspect-[4/5] rounded-3xl bg-gradient-to-b from-white to-slate-50/95 dark:from-slate-800 dark:to-slate-800/95 border-2 border-slate-200/90 dark:border-slate-700 shadow-[0_18px_40px_-5px_rgba(0,0,0,0.14)] dark:shadow-[0_20px_45px_-5px_rgba(0,0,0,0.65)] p-6 flex flex-col items-center justify-between cursor-grab active:cursor-grabbing hover:border-rose-300 dark:hover:border-rose-500/50 transition-colors select-none overflow-hidden touch-none"
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
          title="Pronounce Hanzi"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Card Center: Hanzi & Pinyin/Meaning Toggle */}
      <div className="flex flex-col items-center text-center my-auto z-10">
        <h1 className="font-chinese text-6xl sm:text-7xl font-extrabold text-slate-900 dark:text-white tracking-tight drop-shadow-sm mb-3">
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
              <div className="text-sm font-medium text-slate-700 dark:text-slate-300 max-w-[240px] leading-relaxed">
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
          ← ❌ Still Learning
        </span>
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
          ✅ Mastered →
        </span>
      </div>
    </motion.div>
  );
}

/**
 * BackgroundCardPreview
 * Underlying preview card giving visual deck depth
 */
function BackgroundCardPreview({ nextWord }) {
  if (!nextWord) return null;

  return (
    <div className="absolute w-full max-w-[320px] aspect-[4/5] rounded-3xl bg-slate-100/90 dark:bg-slate-800/60 border-2 border-slate-200/70 dark:border-slate-700/50 pointer-events-none flex flex-col items-center justify-center shadow-md select-none scale-[0.93] translate-y-3.5 opacity-60">
      <span className="font-chinese text-5xl font-extrabold text-slate-400 dark:text-slate-600 opacity-40">
        {nextWord.word}
      </span>
    </div>
  );
}

export function WordSnapChallengeModal({
  isOpen,
  onClose,
  deckTitle = 'Challenge Deck',
  deckColor = '#e11d48',
  words = []
}) {
  const navigate = useNavigate();

  // Game States
  const [deck, setDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [exitDirection, setExitDirection] = useState(1); // 1 = right, -1 = left
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

  // Initialize and shuffle deck on open
  useEffect(() => {
    if (isOpen && words.length > 0) {
      const shuffled = [...words].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setCurrentIndex(0);
      setIsFlipped(false);
      setIsGameOver(false);
      setExitDirection(1);
      setStreak(0);
      setMaxStreak(0);
      setScore(0);
      setMasteredWords([]);
      setMissedWords([]);
      setTimeLeft(60);
    }
  }, [isOpen, words]);

  // Handle Blitz Timer
  useEffect(() => {
    if (!isOpen || isGameOver || timerMode !== 'timed') {
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
  }, [isOpen, isGameOver, timerMode]);

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

  // Auto-speak on new card
  useEffect(() => {
    if (currentWord && !isGameOver) {
      speakWord(currentWord.word);
    }
  }, [currentIndex, isGameOver]);

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

    // Pop smoothly to next card
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
      : [...words].sort(() => Math.random() - 0.5);

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

  if (!isOpen) return null;

  const totalAnswered = masteredWords.length + missedWords.length;
  const accuracyRate = totalAnswered > 0 ? Math.round((masteredWords.length / totalAnswered) * 100) : 0;
  const progressPercent = deck.length > 0 ? Math.round(((currentIndex + (isGameOver ? 1 : 0)) / deck.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: deckColor }}
            />
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white font-chinese leading-tight">
                {deckTitle}
              </h3>
              <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-rose-500" /> WordSnap Challenge Mode
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Timer Toggle */}
            {!isGameOver && (
              <button
                onClick={() => setTimerMode(prev => prev === 'zen' ? 'timed' : 'zen')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                  timerMode === 'timed'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
                title="Toggle Blitz Timer Mode"
              >
                <Timer className="w-3.5 h-3.5" />
                <span>{timerMode === 'timed' ? `${timeLeft}s` : 'Zen'}</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar & Streak Indicator */}
        {!isGameOver && (
          <div className="px-5 pt-3 pb-1 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-400">
                Card <strong className="text-slate-800 dark:text-slate-200">{currentIndex + 1}</strong> of <strong className="text-slate-800 dark:text-slate-200">{deck.length}</strong>
              </span>

              {/* Fire Streak Counter */}
              <div className="flex items-center gap-1.5">
                <div
                  className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-extrabold transition-all ${
                    streak >= 3
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-rose-500/30 animate-pulse'
                      : streak > 0
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Flame className={`w-3.5 h-3.5 ${streak > 0 ? 'fill-current' : ''}`} />
                  <span>{streak} Streak {streak >= 5 ? '🔥 x3' : streak >= 3 ? '⚡ x2' : ''}</span>
                </div>
                <span className="text-xs font-bold text-rose-500 dark:text-rose-400">{score} XP</span>
              </div>
            </div>

            {/* Linear Progress Indicator */}
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-5 flex-1 flex flex-col items-center justify-center min-h-[380px] overflow-y-auto">
          {!isGameOver && currentWord ? (
            /* Active Card Arena */
            <div className="w-full flex flex-col items-center gap-5">
              
              {/* WordSnap Card Stack Arena with PopLayout Lifecycle */}
              <div className="relative w-full max-w-[320px] aspect-[4/5] flex items-center justify-center">
                {/* Visual Stack Depth: Next Card Behind */}
                <BackgroundCardPreview nextWord={nextWord} />

                {/* Top Active Interactive Card with AnimatePresence PopLayout */}
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
              <div className="flex items-center justify-center gap-4 w-full max-w-[320px]">
                {/* Still Learning (Left / Red) */}
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 font-extrabold text-sm border border-rose-200 dark:border-rose-500/20 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <XCircle className="w-4 h-4" /> Need Practice
                </button>

                {/* Reveal Answer Toggle */}
                <button
                  onClick={() => setIsFlipped(prev => !prev)}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-sm border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
                  title="Toggle Reveal"
                >
                  {isFlipped ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5 text-rose-500" />}
                </button>

                {/* Mastered (Right / Green) */}
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-sm border border-emerald-200 dark:border-emerald-500/20 shadow-sm transition-all hover:scale-105 active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" /> Got It!
                </button>
              </div>
            </div>
          ) : (
            /* WordSnap Recap / Game Over Screen */
            <div className="w-full flex flex-col items-center text-center space-y-6 py-2">
              
              {/* Trophy & Badge */}
              <div className="relative">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/20 animate-bounce">
                  <Trophy className="w-10 h-10" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-slate-900 text-amber-400 text-xs font-black px-2 py-0.5 rounded-full border border-amber-400">
                  {score} XP
                </div>
              </div>

              {/* Title & Accuracy Score */}
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                  Sprint Completed! 🎉
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {accuracyRate >= 80 ? 'Incredible memory! You mastered this deck.' : 'Good job! Keep reviewing to lock in your memory.'}
                </p>
              </div>

              {/* Key Metrics Bento */}
              <div className="grid grid-cols-3 gap-2.5 w-full">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy</span>
                  <span className={`text-xl font-black ${accuracyRate >= 75 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-500'}`}>
                    {accuracyRate}%
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Max Streak</span>
                  <span className="text-xl font-black text-rose-500 dark:text-rose-400 flex items-center gap-0.5">
                    <Flame className="w-4 h-4 fill-rose-500" /> {maxStreak}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex flex-col items-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reviewed</span>
                  <span className="text-xl font-black text-slate-800 dark:text-white">
                    {totalAnswered}
                  </span>
                </div>
              </div>

              {/* Mastered vs Need Practice Breakdown */}
              <div className="w-full space-y-3 text-left">
                {missedWords.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-500">
                      <span>Words to Review ({missedWords.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-rose-50/50 dark:bg-rose-500/10 border border-rose-200/60 dark:border-rose-500/20">
                      {missedWords.map((w, idx) => (
                        <span
                          key={idx}
                          onClick={() => speakWord(w.word)}
                          className="px-2 py-1 rounded-lg bg-white dark:bg-slate-800 text-xs font-chinese font-bold text-slate-800 dark:text-slate-200 border border-rose-200 dark:border-rose-500/30 flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                          title="Click to pronounce"
                        >
                          {w.word}
                          <span className="text-[10px] text-rose-500 font-normal">({w.pinyin})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {masteredWords.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Mastered Cards ({masteredWords.length})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20">
                      {masteredWords.map((w, idx) => (
                        <span
                          key={idx}
                          onClick={() => speakWord(w.word)}
                          className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-xs font-chinese font-bold text-slate-800 dark:text-slate-200 border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1 cursor-pointer"
                        >
                          {w.word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full pt-2">
                {missedWords.length > 0 && (
                  <button
                    onClick={() => handleRestart(true)}
                    className="w-full flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all hover:scale-105 active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" /> Practice Missed ({missedWords.length})
                  </button>
                )}

                <button
                  onClick={() => handleRestart(false)}
                  className="w-full flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
                >
                  <Play className="w-4 h-4 fill-white" /> Play Again
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default WordSnapChallengeModal;
