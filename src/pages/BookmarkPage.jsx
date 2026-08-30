import React, { useState, useMemo, useEffect } from 'react';
import { Bookmark, Sparkles, Trash2, Layers, LayoutGrid, Plus, Edit3, Zap, Flame, Trophy } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { useDictionary } from '../hooks/useDictionary';
import { useDecks } from '../hooks/useDecks';
import { SearchBar } from '../components/SearchBar';
import { VocabularyGrid } from '../components/VocabularyGrid';
import { StackDeckModal } from '../components/deck/StackDeckModal';
import AntigravityStackGallery from '../components/deck/AntigravityStackGallery';
import { WordSnapChallengeModal } from '../components/challenge/WordSnapChallengeModal';
import { useNavigate } from 'react-router-dom';

export function BookmarkPage() {
  const { bookmarks, clearBookmarks, totalBookmarks } = useBookmarks();
  const { words } = useDictionary();
  const { decks, createDeck, updateDeck, deleteDeck } = useDecks();
  const navigate = useNavigate();

  const [activeDeckIndex, setActiveDeckIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(0);
  const [viewMode, setViewMode] = useState('stack');

  // Bookmarked dictionary words
  const bookmarkedWords = useMemo(() => {
    const bookmarkSet = new Set(bookmarks);
    return words.filter(w => bookmarkSet.has(w.word));
  }, [words, bookmarks]);

  // Combine master deck + custom user decks
  const allDecks = useMemo(() => {
    const masterDeck = {
      id: 'all',
      name: 'คำศัพท์ทั้งหมด (All Saved)',
      color: '#e11d48',
      words: bookmarkedWords.map(w => w.word)
    };
    return [masterDeck, ...decks];
  }, [bookmarkedWords, decks]);

  // Ensure activeDeckIndex remains within bounds
  useEffect(() => {
    if (activeDeckIndex >= allDecks.length) {
      setActiveDeckIndex(Math.max(0, allDecks.length - 1));
    }
  }, [allDecks.length, activeDeckIndex]);

  const activeDeck = allDecks[activeDeckIndex] || allDecks[0];

  // Words inside active deck
  const activeDeckWords = useMemo(() => {
    if (!activeDeck) return bookmarkedWords;
    if (activeDeck.id === 'all') return bookmarkedWords;
    const wordSet = new Set(activeDeck.words);
    return bookmarkedWords.filter(w => wordSet.has(w.word));
  }, [activeDeck, bookmarkedWords]);

  // Filter active deck words by search & HSK level filter
  const filteredWords = useMemo(() => {
    const lvlNum = Number(selectedLevel);
    const q = query.trim().toLowerCase();
    const cleanQ = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return activeDeckWords.filter(item => {
      const matchesLevel = lvlNum === 0 || isNaN(lvlNum) || item.level === lvlNum;
      if (!matchesLevel) return false;
      if (!q) return true;

      const wordMatch = item.word.includes(q);
      const pinyinSearchMatch = item.pinyin_search?.toLowerCase().includes(cleanQ);
      const pinyinMatch = item.pinyin?.toLowerCase().includes(q);
      const englishMatch = item.english?.toLowerCase().includes(q);
      const charMatch = item.chars?.some(c => c.includes(q));

      return wordMatch || pinyinSearchMatch || pinyinMatch || englishMatch || charMatch;
    });
  }, [activeDeckWords, query, selectedLevel]);

  const handleOpenCreateModal = () => {
    setEditingDeck(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (deckObj) => {
    setEditingDeck(deckObj);
    setIsModalOpen(true);
  };

  const handleDeleteDeck = (deckObj) => {
    if (window.confirm(`Are you sure you want to delete deck "${deckObj.name}"? (Saved words will remain in bookmarks)`)) {
      deleteDeck(deckObj.id);
      setActiveDeckIndex(0);
    }
  };

  const handleSaveModalDeck = (deckData) => {
    if (editingDeck) {
      updateDeck(editingDeck.id, deckData);
    } else {
      const created = createDeck(deckData);
      if (created) {
        setActiveDeckIndex(allDecks.length);
      }
    }
  };

  const handleCardClick = (word) => {
    navigate(`/character/${encodeURIComponent(word.word)}`);
  };

  const handlePracticeClick = (word) => {
    navigate(`/character/${encodeURIComponent(word.word)}?mode=practice`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-sm">
            <Bookmark className="w-5 h-5 fill-amber-500" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-chinese">
              Saved 3D Flashcard Decks ({totalBookmarks})
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              3D Circular Stack Gallery, Practice & WordSnap Challenge Sprint
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Stack Deck
          </button>

          {totalBookmarks > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to remove all bookmarked characters?')) {
                  clearBookmarks();
                }
              }}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-300 border border-slate-200/80 dark:border-slate-800 text-xs font-bold transition-colors shadow-sm"
              title="Clear All Bookmarks"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {totalBookmarks === 0 ? (
        /* Empty State */
        <div className="w-full py-16 text-center glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-500">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto px-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Bookmarks Saved Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Click the bookmark icon on any vocabulary card or character page to save items and review them in 3D Flashcards & WordSnap Challenge.
            </p>
          </div>
          <button
            onClick={() => navigate('/dictionary')}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-600/30 transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Explore Dictionary
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* WORDSNAP CHALLENGE MODE HERO BANNER */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 p-6 sm:p-7 text-white shadow-xl shadow-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative z-10 space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-black tracking-wider uppercase border border-white/30 shadow-sm">
                <Flame className="w-3.5 h-3.5 fill-current animate-bounce" /> WordSnap Challenge Sprint
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-chinese">
                {activeDeck.name} Challenge
              </h2>
              <p className="text-xs sm:text-sm text-rose-100 font-medium max-w-lg">
                Swipe cards to test your memory, build combo streaks 🔥, beat the sprint clock, and track your accuracy stats!
              </p>
            </div>

            <div className="relative z-10 flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsChallengeOpen(true)}
                disabled={activeDeckWords.length === 0}
                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-slate-900 hover:bg-slate-100 font-black text-sm shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>Start Challenge ({activeDeckWords.length})</span>
              </button>
            </div>
          </div>

          {/* ACTIVE DECK BAR & CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900/80 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-md">
            <div className="flex items-center gap-2.5">
              <span
                className="w-4 h-4 rounded-full shrink-0 shadow-md"
                style={{ backgroundColor: activeDeck.color }}
              />
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white font-chinese leading-snug">
                  {activeDeck.name}
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {filteredWords.length} cards in this deck • Tap center deck to view
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle: 3D Stack vs Grid */}
              <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setViewMode('stack')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === 'stack'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> 3D Stage
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Grid View
                </button>
              </div>

              {/* Edit/Delete Buttons for Custom Deck */}
              {activeDeck.id !== 'all' && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(activeDeck)}
                    className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-rose-500" /> Edit Deck
                  </button>
                  <button
                    onClick={() => handleDeleteDeck(activeDeck)}
                    className="p-2 rounded-2xl bg-slate-100 dark:bg-slate-950 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 transition-colors"
                    title="Delete Deck"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search & Level Filter Bar */}
          <SearchBar
            query={query}
            setQuery={setQuery}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            totalResults={filteredWords.length}
          />

          {/* ANTIGRAVITY STACK GALLERY / GRID VIEW */}
          {viewMode === 'stack' ? (
            <AntigravityStackGallery
              allDecks={allDecks}
              activeDeckIndex={activeDeckIndex}
              onActiveIndexChange={(idx) => setActiveDeckIndex(idx)}
              bookmarkedWords={bookmarkedWords}
            />
          ) : filteredWords.length === 0 ? (
            <div className="w-full py-16 text-center glass-card rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
              <p className="text-slate-500 dark:text-slate-400 font-medium">No words in this deck match your search or level filter.</p>
            </div>
          ) : (
            <VocabularyGrid
              words={filteredWords}
              onSelectWord={handleCardClick}
              onPracticeWord={handlePracticeClick}
            />
          )}

        </div>
      )}

      {/* WordSnap Challenge Mode Modal */}
      <WordSnapChallengeModal
        isOpen={isChallengeOpen}
        onClose={() => setIsChallengeOpen(false)}
        deckTitle={activeDeck.name}
        deckColor={activeDeck.color}
        words={activeDeckWords}
      />

      {/* Create / Edit Stack Deck Modal */}
      <StackDeckModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveModalDeck}
        editingDeck={editingDeck}
        allBookmarkedWords={bookmarkedWords}
      />
    </div>
  );
}

export default BookmarkPage;
