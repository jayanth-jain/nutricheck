import React from 'react';
import type { TopFood, NutrientStatus } from '../../types';
import NutrientBar from '../charts/NutrientBar';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Pill } from 'lucide-react';

export interface NutrientCardProps {
  name: string;
  emoji: string;
  intake: number | undefined;
  target: number;
  unit: string;
  isLimitedData: boolean;
  isEstimate: boolean;
  status: NutrientStatus;
  isLimit?: boolean; // For sodium and added sugar
  whyItMatters: string;
  absorptionTip?: string;
  topFoods?: TopFood[];
  hasSupplement?: boolean;
}

export const NutrientCard: React.FC<NutrientCardProps> = ({
  name,
  emoji,
  intake,
  target,
  unit,
  isLimitedData,
  isEstimate,
  status,
  isLimit = false,
  whyItMatters,
  absorptionTip,
  topFoods = [],
  hasSupplement = false,
}) => {
  const intakeVal = intake ?? 0;
  const percent = target > 0 ? Math.round((intakeVal / target) * 100) : 0;

  // Status configuration with icon and label
  let statusBadge: {
    label: string;
    icon: React.ReactNode;
    badgeClass: string;
    barColor: 'green' | 'amber' | 'red';
  };

  if (isLimit) {
    if (intakeVal <= target) {
      statusBadge = {
        label: 'Within upper guide',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        barColor: 'green',
      };
    } else {
      statusBadge = {
        label: 'Above upper guide',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
        badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        barColor: 'amber',
      };
    }
  } else {
    if (status === 'adequate') {
      statusBadge = {
        label: 'Looks adequate',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />,
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        barColor: 'green',
      };
    } else if (status === 'likely_low') {
      statusBadge = {
        label: 'Likely low intake today',
        icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />,
        badgeClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        barColor: 'amber',
      };
    } else {
      statusBadge = {
        label: 'Very low intake today',
        icon: <AlertCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />,
        badgeClass: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
        barColor: 'red',
      };
    }
  }

  const formattedIntake =
    intake !== undefined
      ? `${isEstimate ? '~' : ''}${Number.isInteger(intakeVal) ? intakeVal : intakeVal.toFixed(1)} ${unit}`
      : 'No data';

  const formattedTarget = `${isLimit ? '≤ ' : ''}${Number.isInteger(target) ? target : target.toFixed(1)} ${unit}`;

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700/80 shadow-sm flex flex-col justify-between transition-shadow hover:shadow-md">
      {/* Header: Name, Emoji & Status */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl" role="img" aria-hidden="true">
              {emoji}
            </span>
            <div>
              <h3 className="font-heading font-semibold text-gray-900 dark:text-white text-base">
                {name}
              </h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                {isLimitedData ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                    Limited data
                  </span>
                ) : isEstimate ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300">
                    Approximate
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Status Chip with Both Icon & Text */}
          <div
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${statusBadge.badgeClass}`}
            role="status"
          >
            {statusBadge.icon}
            <span>{statusBadge.label}</span>
          </div>
        </div>

        {/* Numbers & Progress Bar */}
        <div className="my-3">
          <div className="flex justify-between items-baseline mb-1.5 text-xs">
            <span className="font-semibold text-gray-900 dark:text-white text-sm">
              {formattedIntake}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {isLimit ? 'Upper guide: ' : 'Target: '}
              <strong className="text-gray-700 dark:text-gray-300">{formattedTarget}</strong>
              {!isLimit && ` (${percent}%)`}
            </span>
          </div>

          <NutrientBar
            value={intakeVal}
            max={target}
            color={statusBadge.barColor}
            ariaLabel={`${name} intake: ${formattedIntake} out of ${formattedTarget}`}
          />
        </div>

        {/* Why this matters */}
        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-2.5">
          {whyItMatters}
        </p>

        {/* Supplement notification if user reported taking a supplement */}
        {hasSupplement && (
          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 text-xs mb-2.5">
            <Pill className="w-3.5 h-3.5 mt-0.5 shrink-0 text-blue-600 dark:text-blue-400" />
            <span>You take a supplement for this; this analysis counts food only.</span>
          </div>
        )}

        {/* Absorption Tip if relevant */}
        {absorptionTip && (
          <div className="flex items-start gap-1.5 p-2 rounded-lg bg-amber-50/80 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 text-xs mb-2.5">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <span>{absorptionTip}</span>
          </div>
        )}
      </div>

      {/* Top Boost Foods */}
      {!isLimit && topFoods.length > 0 && status !== 'adequate' && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/60">
          <span className="block text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
            Top foods to boost {name.toLowerCase()} (based on your diet preferences):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {topFoods.slice(0, 5).map((tf) => (
              <span
                key={tf.food.id}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200/60 dark:border-gray-600 text-[11px] text-gray-700 dark:text-gray-200"
                title={`${tf.food.name}: +${tf.nutrientPerServing} ${unit} per ${tf.food.servingLabel}`}
              >
                <span>{tf.food.emoji}</span>
                <span className="font-medium truncate max-w-[100px]">{tf.food.name}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  +{tf.nutrientPerServing}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NutrientCard;
