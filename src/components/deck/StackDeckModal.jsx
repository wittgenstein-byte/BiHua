import React, { useState, useEffect } from 'react';
import { X, Check, Search, Layers, Palette, CheckSquare, Square } from 'lucide-react';

const DECK_COLORS = [
  { hex: '#e11d48', name: 'Rose Red' },
  { hex: '#f59e0b', name: 'Amber Gold' },
  { hex: '#10b981', name: 'Emerald Green' },
  { hex: '#0284c7', name: 'Sky Blue' },
  { hex: '#6366f1', name: 'Indigo' },
  { hex: '#a855f7', name: 'Purple' },
  { hex: '#ec4899', name: 'Pink' },
  { hex: '#475569', name: 'Slate' }
];

export function StackDeckModal({
  isOpen,
  onClose,
  onSave,
  editingDeck = null,
  allBookmarkedWords = []
}) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#e11d48');
  const [selectedWords, setSelectedWords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (editingDeck) {
      setName(editingDeck.name || '');
      setColor(editingDeck.color || '#e11d48');
      setSelectedWords(editingDeck.words || []);
    } else {
      setName('');
      setColor('#e11d48');
      setSelectedWords([]);
    }
    setSearchQuery('');
  }, [editingDeck, isOpen]);

  if (!isOpen) return null;

  const filteredWords = allBookmarkedWords.filter(w => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return w.word.includes(q) || w.pinyin.toLowerCase().includes(q) || w.english.toLowerCase().includes(q);
  });

  const toggleWord = (wordStr) => {
    setSelectedWords(prev =>
      prev.includes(wordStr) ? prev.filter(w => w !== wordStr) : [...prev, wordStr]
    );
  };

  const handleSelectAll = () => {
    if (selectedWords.length === filteredWords.length) {
      setSelectedWords([]);
    } else {
      setSelectedWords(filteredWords.map(w => w.word));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      color,
      words: selectedWords
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-2xl space-y-5 text-slate-800 dark:text-slate-100 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md"
              style={{ backgroundColor: color }}
            >
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              {editingDeck ? 'Edit Stack Deck' : 'Create New Stack Deck'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Deck Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Stack Deck Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. HSK 1 Verbs, Food & Drinks..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-colors"
            />
          </div>

          {/* Color Palette Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-rose-500" /> Accent Color Theme
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {DECK_COLORS.map(c => (
                <button
                  key={c.hex}
                  type="button"
                  onClick={() => setColor(c.hex)}
                  className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                    color === c.hex ? 'scale-125 ring-2 ring-slate-900 dark:ring-white shadow-lg' : 'hover:scale-110 opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                >
                  {color === c.hex && <Check className="w-3.5 h-3.5 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Multi-Select Word Picker */}
          <div className="flex-1 flex flex-col min-h-0 space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                Select Cards ({selectedWords.length} chosen)
              </span>
              {filteredWords.length > 0 && (
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-rose-600 dark:text-rose-400 hover:text-rose-500 font-bold"
                >
                  {selectedWords.length === filteredWords.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Filter saved words..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Checkbox List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 min-h-[140px] max-h-[200px] border border-slate-200/90 dark:border-slate-800/80 rounded-2xl p-2 bg-slate-50/50 dark:bg-slate-950/60">
              {filteredWords.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No bookmarked words available to select.
                </div>
              ) : (
                filteredWords.map(w => {
                  const isChecked = selectedWords.includes(w.word);
                  return (
                    <div
                      key={w.word}
                      onClick={() => toggleWord(w.word)}
                      className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-colors text-xs ${
                        isChecked
                          ? 'bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-slate-900 dark:text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                        )}
                        <span className="font-chinese font-bold text-sm text-slate-900 dark:text-white">{w.word}</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold">{w.pinyin}</span>
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[140px] font-medium">{w.english}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition-colors"
            >
              {editingDeck ? 'Save Changes' : 'Create Deck'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default StackDeckModal;
