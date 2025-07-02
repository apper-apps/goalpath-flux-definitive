import React from 'react';

const Loading = ({ type = 'dashboard' }) => {
  if (type === 'dashboard') {
    return (
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-surface rounded-lg shimmer"></div>
            <div className="h-4 w-32 bg-surface rounded shimmer"></div>
          </div>
          <div className="h-10 w-32 bg-surface rounded-lg shimmer"></div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-surface rounded-xl p-6 space-y-3">
              <div className="h-4 w-20 bg-slate-600 rounded shimmer"></div>
              <div className="h-8 w-16 bg-slate-600 rounded shimmer"></div>
            </div>
          ))}
        </div>

        {/* Goals skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-surface rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="h-6 w-3/4 bg-slate-600 rounded shimmer"></div>
                  <div className="h-4 w-20 bg-slate-700 rounded-full shimmer"></div>
                </div>
                <div className="h-8 w-8 bg-slate-600 rounded-lg shimmer"></div>
              </div>
              <div className="space-y-2">
                <div className="h-2 w-full bg-slate-700 rounded-full shimmer"></div>
                <div className="h-4 w-16 bg-slate-600 rounded shimmer"></div>
              </div>
              <div className="h-4 w-24 bg-slate-600 rounded shimmer"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'goals') {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-surface rounded-xl p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="space-y-2 flex-1">
                <div className="h-6 w-2/3 bg-slate-600 rounded shimmer"></div>
                <div className="h-4 w-1/2 bg-slate-700 rounded shimmer"></div>
              </div>
              <div className="h-8 w-20 bg-slate-600 rounded-full shimmer"></div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-slate-700 rounded-full shimmer"></div>
              <div className="flex justify-between">
                <div className="h-4 w-16 bg-slate-600 rounded shimmer"></div>
                <div className="h-4 w-12 bg-slate-600 rounded shimmer"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
};

export default Loading;