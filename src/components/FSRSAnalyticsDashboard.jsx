import React from 'react';
import { BarChart3, Activity, Clock, Award, ShieldCheck, Flame } from 'lucide-react';

export function FSRSAnalyticsDashboard({ stats }) {
  const heatmapData = stats?.heatmapData || {};

  // Build last 16 weeks (112 days) grid
  const daysGrid = [];
  const today = new Date();
  for (let i = 111; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const isoDate = d.toISOString().split('T')[0];
    const count = heatmapData[isoDate] || 0;
    daysGrid.push({ date: isoDate, count });
  }

  // Calculate total streak
  let currentStreak = 0;
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const isoDate = d.toISOString().split('T')[0];
    if (heatmapData[isoDate] > 0) {
      currentStreak++;
    } else if (i > 0) {
      break;
    }
  }

  const getHeatmapColor = (count) => {
    if (count === 0) return 'bg-slate-900 border-slate-800/80';
    if (count <= 5) return 'bg-rose-950/80 border-rose-800/50 text-rose-300';
    if (count <= 15) return 'bg-rose-800 border-rose-600/60 text-white';
    if (count <= 30) return 'bg-rose-600 border-rose-500 text-white';
    return 'bg-rose-400 border-rose-300 text-slate-950 font-bold';
  };

  // Generate Ebbinghaus Forgetting Curve SVG Path (decay from 100% to 50% over 30 days)
  const curvePoints = [];
  const sSample = 14; // sample stability 14 days
  for (let day = 0; day <= 30; day++) {
    const r = Math.pow(1 + day / (9 * sSample), -1) * 100;
    const x = (day / 30) * 300;
    const y = 120 - (r / 100) * 100;
    curvePoints.push(`${x},${y}`);
  }
  const svgPath = `M ${curvePoints.join(' L ')}`;

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Top Memory Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-card p-4 rounded-2xl border border-slate-800/90 text-center relative overflow-hidden">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" /> Active Streak
          </div>
          <div className="text-2xl font-bold text-amber-400 mt-1">{currentStreak} <span className="text-xs font-normal text-slate-400">days</span></div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800/90 text-center">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
            <Award className="w-3.5 h-3.5 text-emerald-400" /> Long-Term Memory
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">{stats?.longTermCount || 0} <span className="text-xs font-normal text-slate-400">words</span></div>
          <div className="text-[10px] text-slate-500 mt-0.5">Stability &gt; 30 days</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800/90 text-center">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
            <Clock className="w-3.5 h-3.5 text-sky-400" /> Due For Review
          </div>
          <div className="text-2xl font-bold text-sky-400 mt-1">{stats?.dueCount || 0}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800/90 text-center">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" /> Target Retention
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1">
            {Math.round((stats?.targetRetention || 0.85) * 100)}%
          </div>
        </div>
      </div>

      {/* GitHub-Style Smart Review Heatmap */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
            <Activity className="w-4 h-4" /> Daily Review Activity Heatmap
          </div>
          <div className="text-xs text-slate-400">Last 16 Weeks</div>
        </div>

        <div className="overflow-x-auto pb-2">
          <div className="grid grid-rows-7 grid-flow-col gap-1.5 min-w-[500px]">
            {daysGrid.map((item, idx) => (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-sm border ${getHeatmapColor(item.count)} transition-transform hover:scale-125 cursor-pointer`}
                title={`${item.date}: ${item.count} reviews`}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-slate-900 border border-slate-800" />
            <span className="w-3 h-3 rounded-sm bg-rose-950 border border-rose-800" />
            <span className="w-3 h-3 rounded-sm bg-rose-800 border border-rose-600" />
            <span className="w-3 h-3 rounded-sm bg-rose-600 border border-rose-500" />
            <span className="w-3 h-3 rounded-sm bg-rose-400 border border-rose-300" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Ebbinghaus Forgetting Curve Visualizer */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400">
            <BarChart3 className="w-4 h-4" /> Ebbinghaus Memory Decay Curve ($R$)
          </div>
          <div className="text-xs text-slate-400">Theoretical $R(t)$ over 30 Days</div>
        </div>

        <div className="relative w-full h-36 bg-slate-900/80 rounded-2xl border border-slate-800 p-4 flex items-center justify-center">
          <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
            {/* Grid lines */}
            <line x1="0" y1="20" x2="300" y2="20" stroke="#334155" strokeDasharray="3,3" />
            <line x1="0" y1="70" x2="300" y2="70" stroke="#334155" strokeDasharray="3,3" />
            <line x1="0" y1="120" x2="300" y2="120" stroke="#334155" />

            {/* Target Retention Threshold Line */}
            <line
              x1="0"
              y1={120 - (stats?.targetRetention || 0.85) * 100}
              x2="300"
              y2={120 - (stats?.targetRetention || 0.85) * 100}
              stroke="#f43f5e"
              strokeWidth="1.5"
              strokeDasharray="4,4"
            />

            {/* Curve Path */}
            <path d={svgPath} fill="none" stroke="#38bdf8" strokeWidth="3" />
          </svg>

          <div className="absolute top-2 right-4 text-[10px] font-mono text-rose-400 bg-slate-900/90 px-2 py-0.5 rounded border border-rose-900/50">
            Target Retention Threshold ({Math.round((stats?.targetRetention || 0.85) * 100)}%)
          </div>
        </div>

        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>Day 0 (100% Recall)</span>
          <span>Day 15</span>
          <span>Day 30 (Scheduled Review Interval)</span>
        </div>
      </div>
    </div>
  );
}
