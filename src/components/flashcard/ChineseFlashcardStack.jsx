import React, { useState, useMemo, useEffect } from 'react';
import { Volume2, PenTool, Shuffle, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Stack from './Stack';
import { useTheme } from '../../hooks/useTheme';
import './WordCard.css';

export function ChineseFlashcardStack({ words = [] }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [deck, setDeck] = useState(words);
  const [revealMeaning, setRevealMeaning] = useState(true);

  // Sync deck when input words prop changes
  useEffect(() => {
    setDeck(words);
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
  };

  const handlePractice = (e, wordText) => {
    e.stopPropagation();
    navigate(`/character/${encodeURIComponent(wordText)}?mode=practice`);
  };

  // Convert dictionary words into React card elements matching global theme
  const cards = useMemo(() => {
    return deck.map((word, idx) => (
      <div
        key={`${word.id || word.word}-${idx}`}
        className={`vocab-card ${isDark ? 'dark-theme' : 'light-theme'}`}
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
  }, [deck, isDark, revealMeaning]);

  if (deck.length === 0) {
    return (
      <div className="w-full py-16 text-center glass-card rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
        <p className="text-slate-500 dark:text-slate-400 font-medium">No bookmarked words available to display in stack.</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center gap-4">
      {/* Top Stack Control Bar */}
      <div className="w-full max-w-xs flex items-center justify-between px-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Deck: <strong className="text-rose-600 dark:text-rose-400">{deck.length}</strong> words
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Hide/Show Meaning Toggle */}
          <button
            onClick={() => setRevealMeaning(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold transition-all shadow-sm"
            title={revealMeaning ? 'Hide Definitions' : 'Show Definitions'}
          >
            {revealMeaning ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-amber-500" />}
            <span>{revealMeaning ? 'Hide Meaning' : 'Show Meaning'}</span>
          </button>

          {/* Shuffle Button */}
          <button
            onClick={handleShuffle}
            className="p-1.5 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 transition-all shadow-sm"
            title="Shuffle Deck"
          >
            <Shuffle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D Stack Container */}
      <div style={{ width: '100%', maxWidth: 340, height: 440 }} className="relative mx-auto my-1">
        <Stack
          randomRotation={true}
          sensitivity={140}
          sendToBackOnClick={true}
          cards={cards}
        />
      </div>
    </div>
  );
}

export default ChineseFlashcardStack;
