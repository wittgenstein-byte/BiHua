import React from 'react';

export function PageSkeletonFallback() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      {/* Top Search & Filter Bar Skeleton */}
      <div className="w-full h-14 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center px-4 gap-3">
        <div className="w-5 h-5 rounded-full bg-slate-800 shrink-0" />
        <div className="h-4 w-48 bg-slate-800/80 rounded-md" />
        <div className="ml-auto hidden sm:flex gap-2">
          {[1, 2, 3, 4, 5, 6].map(lvl => (
            <div key={lvl} className="w-12 h-7 rounded-lg bg-slate-800/70" />
          ))}
        </div>
      </div>

      {/* Stats / Info Bar Skeleton */}
      <div className="flex items-center justify-between px-1">
        <div className="h-4 w-32 bg-slate-800/60 rounded-md" />
        <div className="h-4 w-24 bg-slate-800/60 rounded-md" />
      </div>

      {/* Grid of Skeleton Vocabulary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-48 rounded-2xl bg-slate-900/40 border border-slate-800/60 p-5 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden"
          >
            {/* Ambient Shimmer Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-800/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />

            <div className="flex items-center justify-between">
              <div className="w-14 h-5 rounded-full bg-slate-800/80" />
              <div className="w-6 h-6 rounded-full bg-slate-800/80" />
            </div>

            <div className="space-y-2 text-center py-2">
              <div className="h-10 w-20 bg-slate-800/90 rounded-lg mx-auto" />
              <div className="h-3 w-16 bg-slate-800/60 rounded mx-auto" />
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-800/50">
              <div className="h-3.5 w-full bg-slate-800/70 rounded" />
              <div className="h-3 w-3/4 bg-slate-800/50 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PageSkeletonFallback;
