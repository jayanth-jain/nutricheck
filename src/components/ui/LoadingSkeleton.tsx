import React from 'react';
import { Loader2, Sparkles } from 'lucide-react';

interface LoadingSkeletonProps {
  onSkip: () => void;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ onSkip }) => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6" role="status" aria-live="polite">
      {/* Header animation */}
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-primary-600 dark:text-primary-400 flex items-center justify-center mb-4 shadow-sm">
          <Loader2 className="w-7 h-7 animate-spin" />
        </div>
        <h2 className="text-xl sm:text-2xl font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span>Analyzing your meals using ICMR-NIN reference values…</span>
          <Sparkles className="w-5 h-5 text-amber-500 hidden sm:inline" />
        </h2>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md">
          Comparing calorie adequacy, macronutrient distribution, and micronutrients against the 2020 RDA &amp; 2024 Dietary Guidelines.
        </p>

        {/* Skip button */}
        <button
          type="button"
          onClick={onSkip}
          className="mt-5 min-h-[44px] px-5 py-2 rounded-xl text-xs sm:text-sm font-medium border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
        >
          Skip animation and view results →
        </button>
      </div>

      {/* Skeleton Pulse Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
        {/* Score gauge skeleton */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col items-center justify-center min-h-[220px]">
          <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-4" />
          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded-md" />
        </div>

        {/* Macros donut skeleton */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col items-center justify-center min-h-[220px]">
          <div className="w-32 h-32 rounded-full border-8 border-gray-200 dark:border-gray-700 mb-4" />
          <div className="w-36 h-4 bg-gray-200 dark:bg-gray-700 rounded-md" />
        </div>

        {/* Calories skeleton */}
        <div className="p-6 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm flex flex-col justify-center min-h-[220px] space-y-3">
          <div className="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded-md" />
          <div className="w-36 h-7 bg-gray-200 dark:bg-gray-700 rounded-md" />
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full" />
          <div className="w-48 h-3 bg-gray-200 dark:bg-gray-700 rounded-md" />
        </div>
      </div>

      {/* Secondary skeleton cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6 animate-pulse">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/60 shadow-sm space-y-2.5"
          >
            <div className="flex justify-between items-center">
              <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded-full" />
            </div>
            <div className="w-full h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="w-3/4 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
