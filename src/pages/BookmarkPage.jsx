import React, { useState, useMemo, useEffect } from 'react';
import { Bookmark, Sparkles, Trash2, Layers, LayoutGrid, Plus, Edit3 } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { useDictionary } from '../hooks/useDictionary';
import { useDecks } from '../hooks/useDecks';
import { SearchBar } from '../components/SearchBar';
import { VocabularyGrid } from '../components/VocabularyGrid';
import { StackDeckModal } from '../components/deck/StackDeckModal';
import AntigravityStackGallery from '../components/deck/AntigravityStackGallery';
import { useNavigate } from 'react-router-dom';

export function BookmarkPage() {
  const { bookmarks, clearBookmarks, totalBookmarks } = useBookmarks();
  const { words } = useDictionary();
  const { decks, createDeck, updateDeck, deleteDeck } = useDecks();
  const navigate = useNavigate();

  const [activeDeckIndex, setActiveDeckIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState(null);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Bookmark className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-chinese">
              Saved 3D Flashcard Decks ({totalBookmarks})
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              3D Circular Stack Gallery & Practice Center
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-950/50 transition-all hover:scale-105 active:scale-95"
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
              className="p-2.5 rounded-2xl bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/30 text-xs font-semibold transition-colors"
              title="Clear All Bookmarks"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {totalBookmarks === 0 ? (
        /* Empty State */
        <div className="w-full py-16 text-center glass-card rounded-3xl border border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto text-amber-400">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto px-4">
            <h3 className="text-xl font-bold text-white">No Bookmarks Saved Yet</h3>
            <p className="text-sm text-slate-400">
              Click the bookmark icon on any vocabulary card or character page to save items and review them in 3D Flashcards.
            </p>
          </div>
          <button
            onClick={() => navigate('/dictionary')}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-950/50 transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Explore Dictionary
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* ACTIVE DECK BAR & CONTROLS */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-4 rounded-2xl border border-slate-800 shadow-lg">
            <div className="flex items-center gap-2.5">
              <span
                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-md"
                style={{ backgroundColor: activeDeck.color }}
              />
              <div>
                <h2 className="text-lg font-extrabold text-white font-chinese leading-snug">
                  {activeDeck.name}
                </h2>
                <span className="text-xs text-slate-400 font-medium">
                  {filteredWords.length} cards in this stack deck • Tap center deck to play
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle: 3D Stack vs Grid */}
              <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
                <button
                  onClick={() => setViewMode('stack')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'stack'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" /> 3D Stage
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-950/40'
                      : 'text-slate-400 hover:text-white'
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
                    className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-semibold transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-rose-400" /> Edit Deck
                  </button>
                  <button
                    onClick={() => handleDeleteDeck(activeDeck)}
                    className="p-2 rounded-xl bg-slate-950 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors"
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
            <div className="w-full py-16 text-center glass-card rounded-3xl border border-slate-800 space-y-2">
              <p className="text-slate-400 font-medium">No words in this deck match your search or level filter.</p>
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

