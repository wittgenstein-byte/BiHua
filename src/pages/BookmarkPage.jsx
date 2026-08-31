import React, { useState, useMemo, useEffect } from 'react';
import {
  Bookmark,
  Folder,
  ChevronRight,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Zap,
  Flame,
  Volume2,
  PenTool,
  Search,
  Sparkles,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useBookmarks } from '../hooks/useBookmarks';
import { useDictionary } from '../hooks/useDictionary';
import { useDecks } from '../hooks/useDecks';
import { FolderCard } from '../components/folder/FolderCard';
import { NewFolderCard } from '../components/folder/NewFolderCard';
import { FolderModal } from '../components/folder/FolderModal';
import { AddWordsToFolderModal } from '../components/folder/AddWordsToFolderModal';
import { SearchBar } from '../components/SearchBar';

export function BookmarkPage() {
  const { bookmarks, clearBookmarks, totalBookmarks, toggleBookmark, isBookmarked } = useBookmarks();
  const { words } = useDictionary();
  const { decks, createDeck, updateDeck, deleteDeck, removeWordFromDeck, addWordsToDeck } = useDecks();
  const navigate = useNavigate();

  // URL-driven activeFolderId: /bookmark/:folderId or /bookmark?folder=:id
  const { folderId: routeFolderId } = useParams();
  const [searchParams] = useSearchParams();
  const queryFolderId = searchParams.get('folder');
  const activeFolderId = routeFolderId || queryFolderId || null;

  // Modals
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);

  const [isAddWordsModalOpen, setIsAddWordsModalOpen] = useState(false);
  const [targetFolderForWords, setTargetFolderForWords] = useState(null);

  // Search & Filter inside Explorer
  const [query, setQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState(0);

  // All bookmarked dictionary words
  const allBookmarkedWords = useMemo(() => {
    const bookmarkSet = new Set(bookmarks);
    return words.filter(w => bookmarkSet.has(w.word));
  }, [words, bookmarks]);

  // Master system folder
  const masterFolder = useMemo(() => ({
    id: 'all',
    name: 'คำศัพท์ทั้งหมด (All Saved)',
    description: 'System master folder containing all saved bookmarks',
    color: '#e11d48',
    isMaster: true,
    words: allBookmarkedWords.map(w => w.word)
  }), [allBookmarkedWords]);

  // Combined list of folders
  const allFolders = useMemo(() => {
    return [masterFolder, ...decks];
  }, [masterFolder, decks]);

  // Fallback check: If URL points to a non-existent folder, automatically redirect back to /bookmark root
  useEffect(() => {
    if (!activeFolderId) return;
    const folderExists = allFolders.some(f => f.id === activeFolderId);
    if (!folderExists) {
      // Automatic fallback for deleted or non-existent custom folders
      navigate('/bookmark', { replace: true });
    }
  }, [activeFolderId, allFolders, navigate]);

  // Currently opened folder (if any)
  const currentFolder = useMemo(() => {
    if (!activeFolderId) return null;
    return allFolders.find(f => f.id === activeFolderId) || null;
  }, [activeFolderId, allFolders]);

  // Words inside currently opened folder
  const currentFolderWords = useMemo(() => {
    if (!currentFolder) return [];
    if (currentFolder.id === 'all') return allBookmarkedWords;
    const wordSet = new Set(currentFolder.words || []);
    return allBookmarkedWords.filter(w => wordSet.has(w.word));
  }, [currentFolder, allBookmarkedWords]);

  // Filtered words for search inside folder explorer
  const filteredFolderWords = useMemo(() => {
    const lvlNum = Number(selectedLevel);
    const q = query.trim().toLowerCase();
    const cleanQ = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return currentFolderWords.filter(item => {
      const matchesLevel = lvlNum === 0 || isNaN(lvlNum) || item.level === lvlNum;
      if (!matchesLevel) return false;
      if (!q) return true;

      const wordMatch = item.word.includes(q);
      const pinyinSearchMatch = item.pinyin_search?.toLowerCase().includes(cleanQ);
      const pinyinMatch = item.pinyin?.toLowerCase().includes(q);
      const englishMatch = item.english?.toLowerCase().includes(q);
      const charMatch = item.chars?.some(c => c.includes(q));

      return wordMatch || pinyinSearchMatch || pinyinMatch || englishMatch || charMatch;
    });
  }, [currentFolderWords, query, selectedLevel]);

  // Speech Pronunciation
  const speakWord = (e, text) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  // Folder Navigation Helper
  const handleOpenFolder = (folderId) => {
    if (!folderId) {
      navigate('/bookmark');
    } else {
      navigate(`/bookmark/${encodeURIComponent(folderId)}`);
    }
  };

  // Folder CRUD Handlers
  const handleOpenCreateFolder = () => {
    setEditingFolder(null);
    setIsFolderModalOpen(true);
  };

  const handleOpenEditFolder = (folderObj) => {
    setEditingFolder(folderObj);
    setIsFolderModalOpen(true);
  };

  const handleSaveFolder = (folderData) => {
    if (editingFolder) {
      updateDeck(editingFolder.id, folderData);
    } else {
      const created = createDeck(folderData);
      if (created) {
        navigate(`/bookmark/${encodeURIComponent(created.id)}`);
      }
    }
  };

  const handleDeleteFolder = (folderObj) => {
    if (window.confirm(`Are you sure you want to delete folder "${folderObj.name}"? (Your saved words will remain safely in Bookmarks)`)) {
      deleteDeck(folderObj.id);
      if (activeFolderId === folderObj.id) {
        navigate('/bookmark', { replace: true });
      }
    }
  };

  // Launch WordSnap challenge for a specific folder
  const handleLaunchChallenge = (folderObj) => {
    navigate(`/bookmark/${folderObj.id}/challenge`);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      
      {/* ──── TOP NAVIGATION & BREADCRUMBS ──── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/20 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-sm shrink-0">
            <Folder className="w-5 h-5 fill-rose-500/30" />
          </div>

          <div className="min-w-0">
            {/* Breadcrumb path */}
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400 mb-0.5">
              <button
                onClick={() => handleOpenFolder(null)}
                className={`hover:text-rose-500 transition-colors flex items-center gap-1 ${
                  !activeFolderId ? 'text-slate-900 dark:text-white font-extrabold' : ''
                }`}
              >
                Folders
              </button>

              {currentFolder && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-slate-900 dark:text-white font-extrabold truncate max-w-[200px]">
                    {currentFolder.name}
                  </span>
                </>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white font-chinese leading-tight">
              {currentFolder ? currentFolder.name : `Vocabulary Folders (${allFolders.length})`}
            </h1>
          </div>
        </div>

        {/* Global Header Actions */}
        <div className="flex items-center gap-2">
          {!activeFolderId ? (
            <>
              <button
                onClick={handleOpenCreateFolder}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" /> New Folder
              </button>

              {totalBookmarks > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to remove all bookmarked words?')) {
                      clearBookmarks();
                    }
                  }}
                  className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200/80 dark:border-slate-800 text-xs font-bold transition-colors shadow-sm"
                  title="Clear All Bookmarks"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => handleOpenFolder(null)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Back to All Folders
            </button>
          )}
        </div>
      </div>

      {totalBookmarks === 0 ? (
        /* ──── EMPTY STATE: NO SAVED WORDS ──── */
        <div className="w-full py-16 text-center glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto text-rose-500">
            <Bookmark className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto px-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No Bookmarks Saved Yet</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Click the bookmark icon on any vocabulary card or character page to save items into your study folders.
            </p>
          </div>
          <button
            onClick={() => navigate('/dictionary')}
            className="px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold shadow-lg shadow-rose-600/30 transition-colors inline-flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Explore Dictionary
          </button>
        </div>
      ) : !activeFolderId ? (
        /* ──── VIEW 1: FOLDER DECK GALLERY (ROOT FILE SYSTEM) ──── */
        <div className="space-y-6">
          {/* Folder Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
            
            {/* Master All Bookmarks Folder */}
            <FolderCard
              folder={masterFolder}
              previewWords={allBookmarkedWords.slice(0, 3)}
              wordsCount={allBookmarkedWords.length}
              xpEarned={allBookmarkedWords.length * 60}
              lastPracticed="Today"
              isMaster={true}
              onClick={() => handleOpenFolder('all')}
              onPlay={() => handleLaunchChallenge(masterFolder)}
            />

            {/* Custom Folders */}
            {decks.map((folder) => {
              const folderWords = allBookmarkedWords.filter(w => (folder.words || []).includes(w.word));
              const count = folderWords.length;
              return (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  previewWords={folderWords.slice(0, 3)}
                  wordsCount={count}
                  xpEarned={count * 50}
                  lastPracticed="Recently"
                  isMaster={false}
                  onClick={() => handleOpenFolder(folder.id)}
                  onEdit={() => handleOpenEditFolder(folder)}
                  onDelete={() => handleDeleteFolder(folder)}
                  onPlay={() => handleLaunchChallenge(folder)}
                />
              );
            })}

            {/* + New Folder Card */}
            <NewFolderCard onClick={handleOpenCreateFolder} />

          </div>
        </div>
      ) : (
        /* ──── VIEW 2: FOLDER EXPLORER (INSIDE OPENED FOLDER) ──── */
        <div className="space-y-6 animate-fade-in">
          
          {/* Folder Hero Header Banner */}
          <div
            className="relative overflow-hidden rounded-3xl p-6 sm:p-7 border transition-all"
            style={{
              backgroundColor: `${currentFolder.color}0a`,
              borderColor: `${currentFolder.color}35`,
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              
              {/* Folder Details */}
              <div className="flex items-start gap-3.5">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-md"
                  style={{
                    backgroundColor: `${currentFolder.color}20`,
                    color: currentFolder.color,
                    border: `1px solid ${currentFolder.color}40`
                  }}
                >
                  <Folder className="w-7 h-7 fill-current" />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white font-chinese">
                      {currentFolder.name}
                    </h2>
                    <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm">
                      {currentFolderWords.length} Words
                    </span>
                  </div>

                  {currentFolder.description && (
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                      {currentFolder.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Folder Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                
                {/* Start WordSnap Challenge */}
                <button
                  onClick={() => handleLaunchChallenge(currentFolder)}
                  disabled={currentFolderWords.length === 0}
                  title={currentFolderWords.length === 0 ? "กรุณาบันทึกคำศัพท์อย่างน้อย 1 คำเพื่อเริ่มโหมดนี้" : "Start WordSnap Challenge"}
                  className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black text-xs transition-all ${
                    currentFolderWords.length === 0
                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none opacity-60'
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95'
                  }`}
                >
                  <Zap className={`w-4 h-4 ${currentFolderWords.length > 0 ? 'fill-white' : 'text-slate-400'}`} />
                  <span>Start Challenge ({currentFolderWords.length})</span>
                </button>

                {/* Manage Words in Folder (for custom folders) */}
                {!currentFolder.isMaster && (
                  <>
                    <button
                      onClick={() => {
                        setTargetFolderForWords(currentFolder);
                        setIsAddWordsModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95"
                    >
                      <Plus className="w-4 h-4 text-rose-500" /> Manage Words
                    </button>

                    <button
                      onClick={() => handleOpenEditFolder(currentFolder)}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                      title="Edit Folder"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteFolder(currentFolder)}
                      className="p-3 rounded-2xl bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700 transition-colors shadow-sm"
                      title="Delete Folder"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

            </div>
          </div>

          {/* Search & HSK Level Filter */}
          <SearchBar
            query={query}
            setQuery={setQuery}
            selectedLevel={selectedLevel}
            setSelectedLevel={setSelectedLevel}
            totalResults={filteredFolderWords.length}
          />

          {/* Words Grid inside Folder */}
          {filteredFolderWords.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFolderWords.map((w) => (
                <div
                  key={w.word}
                  className="group relative rounded-3xl bg-white dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 p-5 shadow-sm hover:shadow-md hover:border-rose-300 dark:hover:border-rose-500/40 transition-all flex flex-col justify-between"
                >
                  {/* Top Bar: HSK Tag + Audio + Remove from folder */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-500/20">
                      HSK {w.level || 1}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => speakWord(e, w.word)}
                        className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-rose-50 dark:hover:bg-rose-500/20 text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 flex items-center justify-center transition-colors shadow-sm"
                        title="Listen Pronunciation"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Body: Hanzi + Pinyin + Meaning */}
                  <div
                    onClick={() => navigate(`/character/${encodeURIComponent(w.word)}`)}
                    className="cursor-pointer space-y-1 mb-4"
                  >
                    <h3 className="font-chinese text-3xl font-semibold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {w.word}
                    </h3>
                    <p className="text-sm font-bold text-rose-500 dark:text-rose-400">
                      {w.pinyin}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 leading-relaxed">
                      {w.english}
                    </p>
                  </div>

                  {/* Footer: Stroke Practice Link */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                    <button
                      onClick={() => navigate(`/character/${encodeURIComponent(w.word)}?mode=practice`)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                    >
                      <PenTool className="w-3.5 h-3.5" /> Practice Stroke
                    </button>

                    <button
                      onClick={() => navigate(`/character/${encodeURIComponent(w.word)}`)}
                      className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      View Details →
                    </button>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            /* Empty folder content */
            <div className="w-full py-16 text-center glass-card rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
                No words in this folder match your search or filter.
              </p>
              {!currentFolder.isMaster && (
                <button
                  onClick={() => {
                    setTargetFolderForWords(currentFolder);
                    setIsAddWordsModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 transition-all inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Bookmarked Words
                </button>
              )}
            </div>
          )}

        </div>
      )}

      {/* ──── MODALS ──── */}

      {/* 1. Create / Edit Folder Modal */}
      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={() => setIsFolderModalOpen(false)}
        onSave={handleSaveFolder}
        initialFolder={editingFolder}
      />

      {/* 2. Add / Manage Words in Folder Modal */}
      <AddWordsToFolderModal
        isOpen={isAddWordsModalOpen}
        onClose={() => setIsAddWordsModalOpen(false)}
        folder={targetFolderForWords}
        allBookmarkedWords={allBookmarkedWords}
        onSaveWords={(wordsArray) => {
          if (targetFolderForWords) {
            updateDeck(targetFolderForWords.id, { words: wordsArray });
          }
        }}
      />

    </div>
  );
}

export default BookmarkPage;
