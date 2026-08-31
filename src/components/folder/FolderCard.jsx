import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  Zap,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  Play
} from 'lucide-react';
import { Folder } from './Folder';

/**
 * FolderCard
 * Card combining the React Bits 3D animated Folder visual at the top
 * with 3 fanning vocabulary preview cards, clean metadata rows,
 * and responsive touch 2-tap interaction.
 */
export function FolderCard({
  folder,
  previewWords = [],
  wordsCount = 0,
  xpEarned = 0,
  lastPracticed = 'Never',
  isMaster = false,
  onClick,
  onEdit,
  onDelete,
  onPlay
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const menuRef = useRef(null);

  const folderColor = folder.color || '#e11d48';

  // Detect touch device capability
  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
  }, []);

  // Close 3-dots menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Click & Tap Navigation Logic:
  // Desktop: Hover opens preview, 1st click navigates into Folder Explorer.
  // Mobile / Touch: 1st tap opens preview papers, 2nd tap navigates into Folder Explorer.
  const handleCardInteraction = (e) => {
    if (menuRef.current && menuRef.current.contains(e.target)) {
      return;
    }

    if (isTouchDevice) {
      if (!isOpen) {
        setIsOpen(true);
      } else {
        onClick?.(e);
      }
    } else {
      onClick?.(e);
    }
  };

  // Format up to 3 vocabulary preview cards inside the folder papers
  const paperItems = previewWords
    .filter(Boolean)
    .slice(0, 3)
    .map((w, idx) => {
      return (
        <div key={idx} className="w-full h-full flex flex-col items-center justify-center p-1 select-none pointer-events-none">
          <span className="font-chinese font-bold text-xs sm:text-sm text-slate-800 leading-tight mb-0.5">
            {w.word || w}
          </span>
          {w.pinyin && (
            <span className="text-[9px] font-semibold text-rose-500 leading-tight">
              {w.pinyin}
            </span>
          )}
        </div>
      );
    });

  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => {
        if (!isTouchDevice) setIsOpen(true);
      }}
      onMouseLeave={() => {
        if (!isTouchDevice) setIsOpen(false);
      }}
      onClick={handleCardInteraction}
      className="group relative cursor-pointer select-none rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 shadow-[0_10px_30px_-8px_rgba(15,23,42,0.06)] dark:shadow-[0_14px_35px_-8px_rgba(0,0,0,0.5)] hover:border-rose-300 dark:hover:border-rose-500/40 hover:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.12)] transition-all flex flex-col justify-between"
    >
      {/* ── Top Visual: React Bits 3D Animated Folder ── */}
      <div className="w-full pt-10 pb-6 flex items-center justify-center relative overflow-visible">
        <Folder
          color={folderColor}
          size={1.15}
          items={paperItems}
          isOpen={isOpen}
          className="folder-wrapper"
        />

        {/* System / Custom Deck Pill Tag */}
        <div className="absolute top-0 left-0">
          <span
            className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-sm"
            style={{
              backgroundColor: `${folderColor}15`,
              color: folderColor,
              border: `1px solid ${folderColor}30`
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: folderColor }} />
            {isMaster ? 'System' : 'Deck'}
          </span>
        </div>

        {/* Top Right Quick WordSnap Play Trigger */}
        <div className="absolute top-0 right-0 flex items-center gap-1">
          {wordsCount > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay?.();
              }}
              className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200/70 dark:border-rose-500/20 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
              title="Start WordSnap Challenge"
            >
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            </button>
          )}

          {!isMaster && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(prev => !prev);
                }}
                className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition-colors"
                title="Folder Options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-10 w-36 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-30 animate-scale-in"
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit?.();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/50 flex items-center gap-2 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-400" /> Edit Folder
                  </button>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete?.();
                    }}
                    className="w-full px-3.5 py-2 text-left text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Lower Section: Folder Title & Description ── */}
      <div className="mt-2 space-y-1 mb-4">
        <h3 className="font-chinese font-extrabold text-base text-slate-900 dark:text-white truncate leading-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
          {folder.name}
        </h3>
        {folder.description ? (
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate font-medium">
            {folder.description}
          </p>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 truncate font-medium">
            Study deck with {wordsCount} saved words
          </p>
        )}
      </div>

      {/* ── 3 Clean Metadata Rows with Dotted Leader Dividers ── */}
      <div className="space-y-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        
        {/* Row 1: Words Count */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 font-medium">
            <FileText className="w-3.5 h-3.5" />
            <span>Words</span>
          </div>
          <div className="flex-1 mx-3 border-b border-dotted border-slate-200 dark:border-slate-700/80" />
          <span className="font-extrabold text-slate-900 dark:text-white">
            {wordsCount}
          </span>
        </div>

        {/* Row 2: XP Earned */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 font-medium">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
            <span>XP Earned</span>
          </div>
          <div className="flex-1 mx-3 border-b border-dotted border-slate-200 dark:border-slate-700/80" />
          <span className="font-extrabold text-amber-500 dark:text-amber-400">
            {xpEarned} XP
          </span>
        </div>

        {/* Row 3: Last Practiced */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-400 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>Last Practiced</span>
          </div>
          <div className="flex-1 mx-3 border-b border-dotted border-slate-200 dark:border-slate-700/80" />
          <span className="font-semibold text-slate-500 dark:text-slate-400">
            {lastPracticed}
          </span>
        </div>

      </div>

    </motion.div>
  );
}

export default FolderCard;
