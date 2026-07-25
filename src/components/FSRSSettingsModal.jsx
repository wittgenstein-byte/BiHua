import React, { useState, useEffect } from 'react';
import { Sliders, X, Sparkles, Target, Zap, ShieldCheck, HelpCircle } from 'lucide-react';
import { getSetting, setSetting } from '../engine/srs';

export function FSRSSettingsModal({ isOpen, onClose, onSettingsUpdated }) {
  const [retention, setRetention] = useState(0.85);
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getSetting('targetRetention', 0.85).then(val => setRetention(val));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (newVal) => {
    const val = parseFloat(newVal.toFixed(2));
    setRetention(val);
    await setSetting('targetRetention', val);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2000);
    if (onSettingsUpdated) onSettingsUpdated();
  };

  const applyPreset = (val) => {
    handleSave(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg glass-panel rounded-3xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">FSRS Algorithm Settings</h3>
            <p className="text-xs text-slate-400">Optimize spaced repetition recall targets</p>
          </div>
        </div>

        {/* Target Retention Slider Section */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-rose-400" /> Target Retention Rate
            </label>
            <span className="text-xl font-bold font-mono text-rose-400">
              {Math.round(retention * 100)}%
            </span>
          </div>

          <input
            type="range"
            min="0.75"
            max="0.95"
            step="0.01"
            value={retention}
            onChange={(e) => setRetention(parseFloat(e.target.value))}
            onMouseUp={() => handleSave(retention)}
            onTouchEnd={() => handleSave(retention)}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
          />

          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>75% (Fewer Reviews)</span>
            <span>85% (Balanced)</span>
            <span>95% (Maximum Recall)</span>
          </div>
        </div>

        {/* Presets Grid */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-400">Retention Mode Presets:</div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => applyPreset(0.90)}
              className={`p-4 rounded-2xl border transition-all text-left space-y-1 ${
                retention === 0.90
                  ? 'bg-rose-500/20 border-rose-500/60 ring-2 ring-rose-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <div className="text-xs font-bold text-rose-400 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" /> Exam Mode (90%)
              </div>
              <div className="text-[11px] text-slate-400">Higher recall accuracy for upcoming HSK exams.</div>
            </button>

            <button
              onClick={() => applyPreset(0.80)}
              className={`p-4 rounded-2xl border transition-all text-left space-y-1 ${
                retention === 0.80
                  ? 'bg-sky-500/20 border-sky-500/60 ring-2 ring-sky-500/30'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800'
              }`}
            >
              <div className="text-xs font-bold text-sky-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Casual Mode (80%)
              </div>
              <div className="text-[11px] text-slate-400">Reduces review workload by 30-40% for casual study.</div>
            </button>
          </div>
        </div>

        {/* FSRS Explanation Box */}
        <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/60 text-xs text-slate-400 space-y-1">
          <div className="font-semibold text-slate-300 flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-rose-400" /> How FSRS works:
          </div>
          <p>
            FSRS dynamically models your memory Stability ($S$), Retrievability ($R$), and Difficulty ($D$) based on your recall speed and mistake count.
          </p>
        </div>

        {savedMessage && (
          <div className="text-xs text-center font-bold text-emerald-400 animate-fade-in">
            ✓ Target Retention updated to {Math.round(retention * 100)}%!
          </div>
        )}
      </div>
    </div>
  );
}
