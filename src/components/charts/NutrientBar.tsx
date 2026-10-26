import React from 'react';

export interface NutrientBarProps {
  value: number;
  max: number;
  color: 'green' | 'amber' | 'red';
  ariaLabel?: string;
  className?: string;
}

export const NutrientBar: React.FC<NutrientBarProps> = ({
  value,
  max,
  color,
  ariaLabel,
  className = '',
}) => {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;
  const clampedPercent = Math.min(100, Math.max(0, percent));

  let barBg = 'bg-red-500 dark:bg-red-600';
  if (color === 'green') {
    barBg = 'bg-emerald-500 dark:bg-emerald-600';
  } else if (color === 'amber') {
    barBg = 'bg-amber-500 dark:bg-amber-600';
  }

  return (
    <div
      className={`w-full bg-gray-100 dark:bg-gray-700/60 rounded-full h-2.5 overflow-hidden ${className}`}
      role="progressbar"
      aria-valuenow={clampedPercent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? `${clampedPercent}% of target`}
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${barBg}`}
        style={{ width: `${clampedPercent}%` }}
      />
    </div>
  );
};

export default NutrientBar;
