import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Folder, Check, Sparkles } from 'lucide-react';

const PRESET_COLORS = [
  '#e11d48', // Rose Red
  '#f97316', // Orange
  '#eab308', // Amber
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#8b5cf6', // Violet
  '#ec4899', // Pink
];

export function FolderModal({
  isOpen,
  onClose,
  onSave,
  initialFolder = null
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (initialFolder) {
        setName(initialFolder.name || '');
        setDescription(initialFolder.description || '');
        setColor(initialFolder.color || PRESET_COLORS[0]);
      } else {
        setName('');
        setDescription('');
        setColor(PRESET_COLORS[0]);
      }
      setError('');
    }
  }, [isOpen, initialFolder]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a folder name');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      color: color,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 dark:bg-slate-950/90 backdrop-blur-md animate-fade-in select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{
                backgroundColor: `${color}18`,
                color: color,
                border: `1px solid ${color}35`
              }}
            >
              <Folder className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {initialFolder ? 'Edit Folder Deck' : 'Create New Folder'}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Organize vocabulary words into study groups
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Folder Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Folder Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. HSK 3 Exam Sprint, Business Chinese..."
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-slate-400"
            />
            {error && <p className="text-xs font-bold text-rose-500 mt-1">{error}</p>}
          </div>

          {/* Description (Optional) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Description / Notes <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Daily review, Exam prep..."
              className="w-full px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-medium focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Color Palette */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              Color Tag
            </label>
            <div className="flex items-center gap-2.5 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 active:scale-95 shadow-sm ${
                    color === c ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : ''
                  }`}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {initialFolder ? 'Save Changes' : 'Create Folder'}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
}

export default FolderModal;
