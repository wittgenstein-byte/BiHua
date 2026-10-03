import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { BookOpen, Bookmark, Sparkles, Sun, Moon, Cloud, User, LogOut, LogIn } from 'lucide-react';
import { useBookmarks } from '../hooks/useBookmarks';
import { useDecks } from '../hooks/useDecks';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { OfflineManagerModal } from './OfflineManagerModal';
import { AuthModal } from './AuthModal';

export function Navbar() {
  const { totalBookmarks, isSyncing: isBookmarkSyncing } = useBookmarks();
  const { isSyncing: isDecksSyncing } = useDecks();
  const { isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const isSyncing = isBookmarkSyncing || isDecksSyncing;

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

            {/* Right Controls: Auth & Stats & Offline & Theme Switcher */}
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
              <div className="hidden md:flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>
                  Saved: <strong className="text-amber-600 dark:text-amber-400">{totalBookmarks}</strong>
                </span>
              </div>

              {/* User Authentication Chip / Login Button */}
              {user ? (
                <div className="flex items-center gap-1.5">
                  <div 
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                    title={isSyncing ? "กำลังซิงก์ข้อมูลกับ Cloudflare D1..." : "ข้อมูลซิงก์กับ Cloudflare D1 เรียบร้อย"}
                  >
                    <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'text-amber-500 animate-pulse' : 'text-emerald-500'}`} />
                    <span className="text-[10px]">{isSyncing ? 'Syncing...' : 'D1 Synced'}</span>
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-700 dark:text-rose-300">
                    <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] uppercase">
                      {user.username ? user.username.charAt(0) : 'U'}
                    </div>
                    <span className="hidden sm:inline max-w-[100px] truncate">{user.username}</span>
                    <button
                      onClick={logout}
                      className="p-1 rounded-lg hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 transition-colors ml-0.5"
                      title="ออกจากระบบ (Sign Out)"
                    >
                      <LogOut className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 transition-all active:scale-95"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>เข้าสู่ระบบ</span>
                </button>
              )}

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

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

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
