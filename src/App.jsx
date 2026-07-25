import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { DictionaryPage } from './pages/DictionaryPage';
import { FlashcardsPage } from './pages/FlashcardsPage';
import { CharacterDetailPage } from './pages/CharacterDetailPage';
import { useSRS } from './hooks/useSRS';

function PracticeRedirect() {
  const { char } = useParams();
  return <Navigate to={`/character/${encodeURIComponent(char)}?mode=practice`} replace />;
}

function AppContent() {
  const { stats: srsStats } = useSRS();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-500 selection:text-white">
      {/* Top Header Navbar */}
      <Navbar srsStats={srsStats} />

      {/* Main Content Container with Client-side Routes */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dictionary" replace />} />
          <Route path="/dictionary" element={<DictionaryPage />} />
          <Route path="/character/:word" element={<CharacterDetailPage />} />
          <Route path="/practice" element={<Navigate to="/dictionary" replace />} />
          <Route path="/practice/:char" element={<PracticeRedirect />} />
          <Route path="/flashcards" element={<FlashcardsPage />} />
          <Route path="*" element={<Navigate to="/dictionary" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 py-6 text-center text-xs text-slate-500 glass-panel mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-chinese font-bold text-slate-300">BiHua (筆畫)</span> — HSK 1-6 Chinese Character Learning
          </div>
          <div>
            1,800 Characters • 5,456 Vocabulary Entries • FSRS Spaced Repetition
          </div>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
