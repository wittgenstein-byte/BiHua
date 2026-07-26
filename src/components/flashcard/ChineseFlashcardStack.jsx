import React, { useState, useMemo } from 'react';
import { Volume2, PenTool, Shuffle, Play, Pause, RotateCw, Moon, Sun, ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Stack from './Stack';
import './WordCard.css';

export function ChineseFlashcardStack({ words = [] }) {
  const navigate = useNavigate();
  const [deck, setDeck] = useState(words);
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [autoplay, setAutoplay] = useState(false);
  const [revealMeaning, setRevealMeaning] = useState(true);
  const [topCardIndex, setTopCardIndex] = useState(0);

  // Sync deck when input words prop changes
  React.useEffect(() => {
    setDeck(words);
    setTopCardIndex(0);
  }, [words]);

  const speakWord = (e, text) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setTopCardIndex(0);
  };

  const handlePractice = (e, wordText) => {
    e.stopPropagation();
    navigate(`/character/${encodeURIComponent(wordText)}?mode=practice`);
  };

  // Convert dictionary words into React card elements
  const cards = useMemo(() => {
    return deck.map((word, idx) => (
      <div
        key={`${word.id || word.word}-${idx}`}
        className={`vocab-card ${theme === 'dark' ? 'dark-theme' : 'light-theme'}`}
      >
        {/* Header: HSK Badge & Audio Button */}
        <div className="word-card-header">
          <span className={`word-tag hsk-${word.level || 1}`}>
            HSK {word.level || 1}
          </span>
          <button
            onClick={(e) => speakWord(e, word.word)}
            className="word-audio-btn"
            title="Listen Pronunciation"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Center: Hanzi & Pinyin */}
        <div className="word-body">
          <h1 className="word-hanzi">{word.word}</h1>
          <p className="word-pinyin">{word.pinyin}</p>
          <div className="word-divider" />
          {revealMeaning ? (
            <p className="word-meaning">{word.english}</p>
          ) : (
            <p className="word-meaning opacity-40 italic text-xs">Tap to reveal meaning</p>
          )}
        </div>

        {/* Footer: Stroke Practice & Drag Hint */}
        <div className="word-card-footer">
          <button
            onClick={(e) => handlePractice(e, word.word)}
            className="word-practice-btn"
          >
            <PenTool className="w-3.5 h-3.5" /> Practice Writing
          </button>
          <span className="word-flip-hint">Drag or tap to swipe</span>
        </div>
      </div>
    ));
  }, [deck, theme, revealMeaning]);

  if (deck.length === 0) {
    return (
      <div className="w-full py-16 text-center glass-card rounded-3xl border border-slate-800 space-y-2">
        <p className="text-slate-400 font-medium">No bookmarked words available to display in stack.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-6">
      {/* Top Stack Control Header */}
      <div className="w-full max-w-md flex items-center justify-between px-2 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-300">
            Deck: <strong className="text-rose-400">{deck.length}</strong> words
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Hide/Show Meaning Toggle */}
          <button
            onClick={() => setRevealMeaning(prev => !prev)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title={revealMeaning ? 'Hide Definitions' : 'Show Definitions'}
          >
            {revealMeaning ? <EyeOff className="w-3.5 h-3.5 text-rose-400" /> : <Eye className="w-3.5 h-3.5 text-amber-400" />}
            <span>{revealMeaning ? 'Hide Meaning' : 'Show Meaning'}</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Toggle Card Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
        </div>
      </div>

      {/* 3D Stack Container */}
      <div style={{ width: '100%', maxWidth: 340, height: 440 }} className="relative mx-auto my-2">
        <Stack
          randomRotation={true}
          sensitivity={140}
          sendToBackOnClick={true}
          cards={cards}
          autoplay={autoplay}
          autoplayDelay={3500}
          pauseOnHover={true}
        />
      </div>

      {/* Bottom Stack Action Toolbar */}
      <div className="flex items-center gap-2 p-2 rounded-2xl bg-slate-900/90 border border-slate-800/90 shadow-xl backdrop-blur-md">
        {/* Shuffle Button */}
        <button
          onClick={handleShuffle}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700/60 transition-all active:scale-95"
          title="Shuffle Deck"
        >
          <Shuffle className="w-3.5 h-3.5 text-rose-400" /> Shuffle
        </button>

        {/* Autoplay Toggle */}
        <button
          onClick={() => setAutoplay(prev => !prev)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 ${
            autoplay
              ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-950/50'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700 border-slate-700/60'
          }`}
          title={autoplay ? 'Pause Auto-cycle' : 'Start Auto-cycle'}
        >
          {autoplay ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
          {autoplay ? 'Autoplay On' : 'Autoplay'}
        </button>
      </div>
    </div>
  );
}

export default ChineseFlashcardStack;
