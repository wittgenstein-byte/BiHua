import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BookOpen, Bookmark, Sparkles } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';

export function Navbar() {
  const { totalBookmarks } = useBookmarks();

  return (
    <>
      {/* Top Header Brand Bar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link to="/dictionary" className="flex items-center gap-3 cursor-pointer group">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center shadow-lg shadow-rose-950/40 text-white font-chinese font-bold text-xl border border-rose-400/30 group-hover:scale-105 transition-transform">
                筆
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-rose-200">
                    BiHua
                  </span>
                  <span className="text-[10px] sm:text-xs px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                    筆畫
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-slate-400 font-medium hidden sm:block">
                  HSK 1-6 Stroke Order Master
                </p>
              </div>
            </Link>

            {/* Quick Stats Pill */}
            <div className="flex items-center gap-2 sm:gap-3 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                Saved: <strong className="text-amber-400">{totalBookmarks}</strong> <span className="hidden sm:inline">words</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-First Bottom Navigation Bar / Floating Dock */}
      <nav className="fixed bottom-0 inset-x-0 z-50 px-3 py-2 sm:py-3 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800/90 rounded-2xl shadow-2xl shadow-rose-950/30 p-1.5 flex items-center justify-around gap-1.5 sm:gap-2">
          
          {/* Dictionary Tab */}
          <NavLink
            to="/dictionary"
            className={({ isActive }) =>
              `flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
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
              `relative flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-2 px-2.5 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                isActive
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-950/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`
            }
          >
            <Bookmark className="w-4 h-4" />
            <span>Bookmarks</span>
            {totalBookmarks > 0 && (
              <span className="absolute -top-1 -right-1 sm:relative sm:top-auto sm:right-auto inline-flex items-center justify-center text-[10px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full">
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
