import React, { useState } from 'react';
import { Info, X, Flame } from 'lucide-react';

interface CalorieCardProps {
  target: number | null;
}

export const CalorieCard: React.FC<CalorieCardProps> = ({ target }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div
      role="status"
      aria-live="polite"
      className="relative p-4 rounded-2xl bg-orange-50/70 dark:bg-gray-800/80 border border-orange-200/80 dark:border-gray-700 shadow-xs transition-colors"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-primary-800 dark:text-primary-300 uppercase tracking-wider">
          <Flame className="w-3.5 h-3.5 text-primary-500" aria-hidden="true" />
          Estimated Daily Energy Target
        </span>
        <button
          type="button"
          onClick={() => setShowInfo((prev) => !prev)}
          className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-orange-100 dark:hover:bg-gray-700 focus:outline-hidden focus:ring-2 focus:ring-primary-500 min-h-[44px] min-w-[44px] inline-flex items-center justify-center -mr-2 -my-2"
          aria-label="How is this estimated?"
          aria-expanded={showInfo}
        >
          <Info className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <div className="flex items-baseline gap-2">
        {target !== null ? (
          <>
            <span className="text-2xl font-bold font-heading text-gray-900 dark:text-white">
              ~{Math.round(target).toLocaleString()}
            </span>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">kcal / day</span>
          </>
        ) : (
          <span className="text-sm text-gray-500 dark:text-gray-400 italic">
            Complete your profile to calculate
          </span>
        )}
      </div>

      <p className="mt-1.5 text-[11px] text-gray-600 dark:text-gray-400">
        Personalized baseline target aligned with your activity level and health goal.
      </p>

      {/* Popover explaining Mifflin-St Jeor calculation */}
      {showInfo && (
        <div className="mt-3 p-3 bg-white dark:bg-gray-750 rounded-xl border border-orange-200 dark:border-gray-600 text-xs text-gray-700 dark:text-gray-200 space-y-2 relative shadow-sm">
          <div className="flex items-center justify-between font-semibold text-primary-900 dark:text-primary-200">
            <span>How is this estimated?</span>
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
            Calculated via the <strong>Mifflin-St Jeor equation</strong> for Basal Metabolic Rate (BMR)
            multiplied by your chosen physical activity level factor (1.2× sedentary to 1.725× very active).
          </p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 italic">
            Note: This is an empirical estimate to guide nutritional adequacy, not a clinical prescription.
            Individual metabolic requirements vary based on muscle mass, genetics, and health conditions.
          </p>
        </div>
      )}
    </div>
  );
};

export default CalorieCard;
