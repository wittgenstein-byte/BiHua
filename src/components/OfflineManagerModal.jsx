import React, { useState, useEffect } from 'react';
import { Download, CheckCircle2, Wifi, WifiOff, Smartphone, RefreshCw, HardDrive } from 'lucide-react';
import { useDictionary } from '../hooks/useDictionary';
import { getOfflineStrokeStats, cacheCharactersForOffline } from '../utils/offlineManager';

export function OfflineManagerModal({ isOpen, onClose }) {
  const { chars, totalChars } = useDictionary();
  const [cachedCount, setCachedCount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState({ loaded: 0, total: 0, percentage: 0 });
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const refreshStats = async () => {
    const stats = await getOfflineStrokeStats();
    setCachedCount(stats.cachedCount);
  };

  useEffect(() => {
    if (isOpen) {
      refreshStats();
      setDownloadSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDownloadAll = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      // Extract unique characters list
      const charList = chars.map(c => c.char);
      await cacheCharactersForOffline(charList, (prog) => {
        setProgress(prog);
      });
      await refreshStats();
      setDownloadSuccess(true);
    } catch (err) {
      console.error('Download strokes failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 text-slate-900 dark:text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center font-bold">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black">Offline Mode & Cache</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ดาวน์โหลดข้อมูลตัวอักษรและเส้นขีดไว้เล่นแบบออฟไลน์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Network Status Badge */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-sm">
          <div className="flex items-center gap-2.5">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-500" />
            )}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              สถานะเครือข่าย:
            </span>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            isOnline 
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
          }`}>
            {isOnline ? 'ออนไลน์ (Online)' : 'ออฟไลน์ (Offline)'}
          </span>
        </div>

        {/* Storage / Precache Status */}
        <div className="space-y-3">
          <div className="flex justify-between items-baseline text-sm">
            <span className="text-slate-500 dark:text-slate-400 font-medium">ความพร้อมของคลังเส้นขีดออฟไลน์:</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {cachedCount} / {totalChars} ตัว ({Math.min(100, Math.round((cachedCount / (totalChars || 1)) * 100))}%)
            </span>
          </div>

          <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-300"
              style={{ width: `${Math.min(100, (cachedCount / (totalChars || 1)) * 100)}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            คลังคำศัพท์ HSK 1-6 และระบบค้นหาถูกเก็บลง Service Worker อัตโนมัติแล้ว สามารถดาวน์โหลดไฟล์ภาพเคลื่อนไหวลำดับขีด (Stroke Animation) ทั้งหมดไว้เพื่อให้เล่นได้ 100% แม้ไม่มีสัญญาณเน็ต (~4.5 MB)
          </p>
        </div>

        {/* Progress Bar while downloading */}
        {isDownloading && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-rose-600 dark:text-rose-400">
              <span className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> กำลังดาวน์โหลดเส้นขีดออฟไลน์...
              </span>
              <span>{progress.loaded} / {progress.total} ({progress.percentage}%)</span>
            </div>
            <div className="w-full h-2 bg-rose-200 dark:bg-rose-900/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-rose-600 transition-all duration-150"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {downloadSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            ดาวน์โหลดและบันทึกลงเครื่องเรียบร้อยแล้ว! สามารถเปิดใช้งานแบบออฟไลน์ได้ทันที
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleDownloadAll}
            disabled={isDownloading || !isOnline}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-bold text-sm transition-all shadow-lg ${
              isDownloading || !isOnline
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/25 active:scale-98'
            }`}
          >
            <Download className="w-4 h-4" />
            {cachedCount >= totalChars ? 'ดาวน์โหลดซ้ำ / ตรวจสอบความสมบูรณ์' : 'ดาวน์โหลดเส้นขีดทั้งหมด (~4.5MB)'}
          </button>
        </div>
      </div>
    </div>
  );
}
export default OfflineManagerModal;
