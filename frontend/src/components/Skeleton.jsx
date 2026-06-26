import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-panel p-6 w-full animate-pulse-slow">
    <div className="h-4 bg-slate-800 rounded-md w-1/3 mb-4"></div>
    <div className="h-8 bg-slate-800 rounded-md w-1/2 mb-2"></div>
    <div className="h-4 bg-slate-800 rounded-md w-2/3"></div>
  </div>
);

export const ListSkeleton = ({ rows = 5 }) => (
  <div className="w-full space-y-3 animate-pulse-slow">
    {[...Array(rows)].map((_, idx) => (
      <div key={idx} className="h-14 bg-slate-900/60 border border-slate-800/40 rounded-xl flex items-center px-4 justify-between">
        <div className="flex items-center gap-3 w-1/2">
          <div className="w-10 h-10 bg-slate-800 rounded-full"></div>
          <div className="w-2/3 space-y-2">
            <div className="h-4 bg-slate-800 rounded w-full"></div>
            <div className="h-3 bg-slate-800 rounded w-1/2"></div>
          </div>
        </div>
        <div className="w-1/4 h-4 bg-slate-800 rounded"></div>
      </div>
    ))}
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-panel p-6 h-96 animate-pulse-slow">
        <div className="h-6 bg-slate-800 rounded w-1/4 mb-6"></div>
        <div className="h-64 bg-slate-850 rounded w-full"></div>
      </div>
      <div className="glass-panel p-6 h-96 animate-pulse-slow">
        <div className="h-6 bg-slate-800 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-10 bg-slate-800 rounded"></div>
          <div className="h-10 bg-slate-800 rounded"></div>
          <div className="h-10 bg-slate-800 rounded"></div>
          <div className="h-10 bg-slate-800 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);
