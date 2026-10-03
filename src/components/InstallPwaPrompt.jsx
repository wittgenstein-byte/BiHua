import React, { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

export function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already in standalone / installed PWA mode
    const isApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isApp) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    if (isIosDevice) {
      setIsIOS(true);
    }

    // Listen for beforeinstallprompt event on Android / Chrome / Edge
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if dismissed before
      const dismissed = localStorage.getItem('pwa_install_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_install_dismissed', 'true');
  };

  // Do not render anything if already installed
  if (isStandalone || !showPrompt) return null;

  return (
    <div className="fixed top-16 sm:top-20 inset-x-0 z-40 px-4 pointer-events-none animate-slide-down">
      <div className="max-w-md mx-auto pointer-events-auto bg-slate-900/95 dark:bg-slate-900/95 backdrop-blur-xl border border-rose-500/30 rounded-2xl p-4 shadow-2xl text-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center font-bold text-white text-lg shrink-0 shadow-md">
            筆
          </div>
          <div>
            <h4 className="text-sm font-bold flex items-center gap-1.5">
              ติดตั้ง BiHua 筆畫
            </h4>
            <p className="text-[11px] text-slate-300">
              {isIOS 
                ? 'กดปุ่มแชร์และเลือก "Add to Home Screen"' 
                : 'เล่นแบบเต็มจอเสมือน Native App ใช้งานได้แม้ออฟไลน์'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isIOS && deferredPrompt && (
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              ติดตั้ง
            </button>
          )}

          {isIOS && (
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 text-amber-300 text-xs font-semibold">
              <Share className="w-3.5 h-3.5" />
              <span>แชร์</span>
            </div>
          )}

          <button
            onClick={handleDismiss}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
export default InstallPwaPrompt;
