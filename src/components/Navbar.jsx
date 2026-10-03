import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BookOpen, Bookmark, Sparkles, Sun, Moon, Cloud, CloudOff } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { useTheme } from '../hooks/useTheme';
import { OfflineManagerModal } from './OfflineManagerModal';

export function Navbar() {
  const { totalBookmarks } = useBookmarks();
  const { isDark, toggleTheme } = useTheme();
  const [showOfflineModal, setShowOfflineModal] = useState(false);

  return (
    <>
      {/* Top Header Brand Bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/dictionary" className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg shadow-rose-500/20 text-white font-chinese font-bold text-xl border border-rose-400/30 group-hover:scale-105 transition-transform">
                筆
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                    BiHua
                  </span>
                  <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-300 font-bold border border-rose-500/20">
                    筆畫
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  HSK 1-6 Stroke Order Master & WordSnap
                </p>
              </div>
            </Link>

            {/* Right Controls: Stats & Offline & Theme Switcher */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Offline Cache & Mode Button */}
              <button
                onClick={() => setShowOfflineModal(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-rose-400/50 hover:text-rose-600 dark:hover:text-rose-400 shadow-sm transition-all"
                title="จัดการแคชและโหมดออฟไลน์ (Offline Mode)"
              >
                <Cloud className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">Offline</span>
              </button>

              {/* Quick Stats Pill */}
              <div className="flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>
                  Saved: <strong className="text-amber-600 dark:text-amber-400">{totalBookmarks}</strong> <span className="hidden sm:inline">words</span>
                </span>
              </div>

              {/* Theme Switcher Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-rose-500 dark:hover:text-rose-400 shadow-sm hover:scale-105 active:scale-95 transition-all"
                title={isDark ? 'Switch to Light/Pastel Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-500" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Offline Modal */}
      <OfflineManagerModal
        isOpen={showOfflineModal}
        onClose={() => setShowOfflineModal(false)}
      />

      {/* Mobile-First Bottom Navigation Bar / Floating Dock */}
      <nav className="fixed bottom-0 inset-x-0 z-50 px-3 py-2 sm:py-3 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/90 rounded-3xl shadow-2xl shadow-slate-900/10 dark:shadow-rose-950/30 p-1.5 flex items-center justify-around gap-1.5 sm:gap-2">
          
          {/* Dictionary Tab */}
          <NavLink
            to="/dictionary"
            className={({ isActive }) =>
              `flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-2.5 sm:px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`
            }
          >
            <BookOpen className="w-4 h-4" />
            <span>Dictionary</span>
          </NavLink>

          {/* Bookmarks Tab */}
          <NavLink
            to="/bookmark"
            className={({ isActive }) =>
              `relative flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-2.5 sm:px-3 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                isActive
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`
            }
          >
            <Bookmark className="w-4 h-4" />
            <span>Bookmarks</span>
            {totalBookmarks > 0 && (
              <span className="absolute -top-1 -right-1 sm:relative sm:top-auto sm:right-auto inline-flex items-center justify-center text-[10px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full shadow-sm">
                {totalBookmarks}
              </span>
            )}
          </NavLink>

        </div>
      </nav>
    </>
  );
}

export default Navbar;
