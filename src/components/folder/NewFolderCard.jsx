import React from 'react';
import { motion } from 'motion/react';
import { FolderPlus, Plus } from 'lucide-react';

export function NewFolderCard({ onClick }) {
  return (
    <motion.div
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative cursor-pointer select-none rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-rose-400/80 dark:hover:border-rose-500/70 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-rose-500/5 dark:hover:bg-rose-500/10 p-6 flex flex-col items-center justify-center text-center min-h-[340px] shadow-sm transition-all"
    >
      <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-rose-500 group-hover:border-rose-300 dark:group-hover:border-rose-500/40 group-hover:scale-110 shadow-sm transition-all mb-4">
        <FolderPlus className="w-8 h-8" />
      </div>

      <div className="space-y-1">
        <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors flex items-center justify-center gap-1.5">
          <Plus className="w-4 h-4" /> Create New Folder
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[200px] font-medium leading-relaxed">
          Group words into custom study decks for focused WordSnap practice
        </p>
      </div>
    </motion.div>
  );
}

export default NewFolderCard;
