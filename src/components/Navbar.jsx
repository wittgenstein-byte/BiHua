import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BookOpen, PenTool, Brain, Sparkles } from 'lucide-react';

export function Navbar({ srsStats }) {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dictionary" className="flex items-center gap-3 cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-700 flex items-center justify-center shadow-lg shadow-rose-950/40 text-white font-chinese font-bold text-xl border border-rose-400/30">
              筆
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-rose-200">
                  BiHua
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30">
                  筆畫
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">HSK 1-6 Stroke Order Master</p>
            </div>
          </Link>

          {/* Mode Switcher NavLinks */}
          <nav className="flex items-center gap-1 sm:gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
            <NavLink
              to="/dictionary"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Dictionary</span>
            </NavLink>

            <NavLink
              to="/practice"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <PenTool className="w-4 h-4" />
              <span className="hidden sm:inline">Stroke Practice</span>
            </NavLink>

            <NavLink
              to="/flashcards"
              className={({ isActive }) =>
                `relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-950/50'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">SRS Flashcards</span>
              {srsStats && srsStats.dueCount > 0 && (
                <span className="inline-flex items-center justify-center text-[10px] font-bold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-full animate-pulse">
                  {srsStats.dueCount}
                </span>
              )}
            </NavLink>
          </nav>

          {/* Quick Stats Pill */}
          <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Studied: <strong className="text-white">{srsStats?.totalStudied || 0}</strong> chars</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
