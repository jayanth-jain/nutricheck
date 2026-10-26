import React, { useState } from 'react';
import type { BMICategory } from '../../engine/profile';
import { getBMICategoryLabel } from '../../engine/profile';
import { Info, X } from 'lucide-react';

interface BMICardProps {
  bmi: number;
  category: BMICategory | null;
  age?: number;
}

export const BMICard: React.FC<BMICardProps> = ({ bmi, category, age }) => {
  const [showInfo, setShowInfo] = useState(false);

  if (bmi <= 0 || isNaN(bmi)) {
    return null;
  }

  const isUnder18 = age !== undefined && age < 18;

  // Category color coding
  const categoryStyles: Record<BMICategory, { badge: string; border: string }> = {
    underweight: {
      badge: 'bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200',
      border: 'border-amber-200 dark:border-amber-800',
    },
    healthy: {
      badge: 'bg-secondary-100 dark:bg-secondary-900/60 text-secondary-800 dark:text-secondary-200',
      border: 'border-secondary-200 dark:border-secondary-800',
    },
    overweight: {
      badge: 'bg-orange-100 dark:bg-orange-900/60 text-orange-800 dark:text-orange-200',
      border: 'border-orange-200 dark:border-orange-800',
    },
    obese: {
      badge: 'bg-red-100 dark:bg-red-900/60 text-red-800 dark:text-red-200',
      border: 'border-red-200 dark:border-red-800',
    },
  };

  const style = category
    ? categoryStyles[category]
    : {
        badge: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
        border: 'border-gray-200 dark:border-gray-700',
      };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`relative p-4 rounded-2xl bg-white dark:bg-gray-800/80 border ${style.border} shadow-xs transition-colors`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Body Mass Index (BMI)
        </span>
        <button
          type="button"
          onClick={() => setShowInfo((prev) => !prev)}
          className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-hidden focus:ring-2 focus:ring-primary-500 min-h-[44px] min-w-[44px] inline-flex items-center justify-center -mr-2 -my-2"
          aria-label="Why Asian Indian cutoffs differ"
          aria-expanded={showInfo}
        >
          <Info className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
          {bmi.toFixed(1)}
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">kg/m²</span>

        {category && !isUnder18 ? (
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${style.badge}`}>
            {getBMICategoryLabel(category)}
          </span>
        ) : isUnder18 ? (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300">
            Adolescent (13–17y)
          </span>
        ) : null}
      </div>

      <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400 leading-normal">
        {isUnder18
          ? 'Adult BMI categories do not apply to ages 13–17. Growing teens require age-and-sex growth percentiles evaluated by a paediatrician.'
          : 'Based on consensus cutoffs for Asian Indian populations (Overweight ≥23, Obese ≥25).'}
      </p>

      {/* Explanatory Popover */}
      {showInfo && (
        <div className="mt-3 p-3 bg-orange-50 dark:bg-gray-700/80 rounded-xl border border-orange-200 dark:border-gray-600 text-xs text-gray-700 dark:text-gray-200 space-y-2 relative">
          <div className="flex items-center justify-between font-semibold text-primary-900 dark:text-primary-200">
            <span>Why Asian Indian BMI cutoffs?</span>
            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
              aria-label="Close information"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="leading-relaxed">
            Clinical studies (WHO 2004, Misra et al. 2009) demonstrate that Asian Indians exhibit higher
            percentages of body fat, visceral adiposity, and metabolic risk at lower BMI levels compared to
            Western standards.
          </p>
          <div className="text-[11px] text-gray-600 dark:text-gray-300 border-t border-orange-200/60 dark:border-gray-600 pt-1.5 space-y-0.5">
            <div>• Underweight: &lt; 18.5</div>
            <div>• Healthy weight: 18.5 – 22.9</div>
            <div>• Overweight: 23.0 – 24.9</div>
            <div>• Obese: &ge; 25.0</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BMICard;
