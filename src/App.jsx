import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { InstallPwaPrompt } from './components/InstallPwaPrompt';
import { PageSkeletonFallback } from './components/PageSkeletonFallback';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider, useTheme } from './hooks/useTheme';
import { AuthProvider } from './hooks/useAuth';
import { prefetchDictionary } from './hooks/useDictionary';

// Route-level code-splitting with React.lazy
const DictionaryPage = lazy(() => import('./pages/DictionaryPage'));
const BookmarkPage = lazy(() => import('./pages/BookmarkPage'));
const CharacterDetailPage = lazy(() => import('./pages/CharacterDetailPage'));
const ChallengePage = lazy(() => import('./pages/ChallengePage'));

function PracticeRedirect() {
  const { char } = useParams();
  return <Navigate to={`/character/${encodeURIComponent(char)}?mode=practice`} replace />;
}

function AppContent() {
  const { isDark } = useTheme();
  const location = useLocation();

  // Hide global Navbar when in full-screen Challenge mode
  const isChallengeRoute = location.pathname.endsWith('/challenge');

  // Idle prefetch dictionary data in the background after main app is loaded
  useEffect(() => {
    prefetchDictionary();
  }, []);

  return (
    <div className={`min-h-screen flex flex-col selection:bg-rose-500 selection:text-white transition-colors duration-300 ${
      isDark
        ? 'bg-slate-950 text-slate-100'
        : 'bg-[#f8fafc] text-slate-800'
    }`}>
      {/* Background ambient pastel decoration in light mode */}
      {!isDark && !isChallengeRoute && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-rose-200/40 blur-3xl" />
          <div className="absolute top-1/3 -left-40 w-96 h-96 rounded-full bg-amber-100/50 blur-3xl" />
          <div className="absolute -bottom-40 right-1/4 w-96 h-96 rounded-full bg-indigo-100/40 blur-3xl" />
        </div>
      )}

      {/* Top Header Navbar (Hidden in full-screen Challenge mode) */}
      {!isChallengeRoute && <Navbar />}

      {/* PWA Add to Home Screen Prompt */}
      {!isChallengeRoute && <InstallPwaPrompt />}

      {/* Main Content Container with Client-side Routes & Suspense */}
      <main className={`relative z-10 flex-1 w-full mx-auto ${
        isChallengeRoute
          ? 'p-0 max-w-none'
          : 'max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 pb-28 sm:pb-32'
      }`}>
        <Suspense fallback={<PageSkeletonFallback />}>
          <Routes>
            <Route path="/" element={<Navigate to="/dictionary" replace />} />
            <Route path="/dictionary" element={<DictionaryPage />} />
            <Route path="/bookmark" element={<BookmarkPage />} />
            <Route path="/bookmark/:folderId" element={<BookmarkPage />} />
            <Route path="/bookmark/:folderId/challenge" element={<ChallengePage />} />
            <Route path="/character/:word" element={<CharacterDetailPage />} />
            <Route path="/practice" element={<Navigate to="/dictionary" replace />} />
            <Route path="/practice/:char" element={<PracticeRedirect />} />
            <Route path="/flashcards" element={<Navigate to="/bookmark" replace />} />
            <Route path="*" element={<Navigate to="/dictionary" replace />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
