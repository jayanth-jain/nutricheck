import React from 'react';
import type { ComputedSwap } from '../../types';
import { ArrowRight, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

interface SwapCardProps {
  swap: ComputedSwap;
}

export const SwapCard: React.FC<SwapCardProps> = ({ swap }) => {
  const { fromFood, toFood, reason, delta } = swap;

  const metrics = [
    {
      label: 'Calories',
      from: `${fromFood.nutrients.kcal} kcal`,
      to: `${toFood.nutrients.kcal} kcal`,
      diff: delta.kcal,
      unit: 'kcal',
      // For calories, less is usually preferred in smart swaps
      isBetter: delta.kcal < 0,
      isWorse: delta.kcal > 10,
    },
    {
      label: 'Protein',
      from: `${fromFood.nutrients.protein} g`,
      to: `${toFood.nutrients.protein} g`,
      diff: delta.protein,
      unit: 'g',
      isBetter: delta.protein > 0,
      isWorse: delta.protein < 0,
    },
    {
      label: 'Fibre',
      from: `${fromFood.nutrients.fiber} g`,
      to: `${toFood.nutrients.fiber} g`,
      diff: delta.fiber,
      unit: 'g',
      isBetter: delta.fiber > 0,
      isWorse: delta.fiber < 0,
    },
    {
      label: 'Fat',
      from: `${fromFood.nutrients.fat} g`,
      to: `${toFood.nutrients.fat} g`,
      diff: delta.fat,
      unit: 'g',
      isBetter: delta.fat < 0,
      isWorse: delta.fat > 5,
    },
  ];

  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-gray-800 border border-emerald-100 dark:border-emerald-900/40 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      <div>
        {/* Header: From -> To */}
        <div className="flex items-center gap-2 sm:gap-3 mb-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700/60 text-gray-700 dark:text-gray-300 text-xs sm:text-sm font-medium">
            <span role="img" aria-hidden="true">{fromFood.emoji}</span>
            <span className="truncate max-w-[110px] sm:max-w-none">{fromFood.name}</span>
          </div>

          <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-semibold">
            <span role="img" aria-hidden="true">{toFood.emoji}</span>
            <span className="truncate max-w-[110px] sm:max-w-none">{toFood.name}</span>
          </div>
        </div>

        {/* Reason */}
        <div className="flex items-start gap-1.5 text-xs text-gray-600 dark:text-gray-300 mb-4 bg-gray-50/70 dark:bg-gray-750 p-2.5 rounded-xl">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{reason}</p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <caption className="sr-only">Nutrient comparison between {fromFood.name} and {toFood.name}</caption>
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700 text-gray-400 font-medium">
                <th scope="col" className="pb-1.5 pr-2">Nutrient</th>
                <th scope="col" className="pb-1.5 px-2 text-right">Instead of</th>
                <th scope="col" className="pb-1.5 px-2 text-right">Try</th>
                <th scope="col" className="pb-1.5 pl-2 text-right">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {metrics.map((m) => {
                const isPositive = m.diff > 0;
                const isZero = m.diff === 0;

                return (
                  <tr key={m.label} className="text-[11px] sm:text-xs">
                    <td className="py-1.5 pr-2 font-medium text-gray-900 dark:text-white">
                      {m.label}
                    </td>
                    <td className="py-1.5 px-2 text-right text-gray-500">{m.from}</td>
                    <td className="py-1.5 px-2 text-right font-medium text-gray-900 dark:text-white">{m.to}</td>
                    <td className="py-1.5 pl-2 text-right font-semibold">
                      {isZero ? (
                        <span className="text-gray-400">0</span>
                      ) : (
                        <span
                          className={`inline-flex items-center gap-0.5 ${
                            m.isBetter
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : m.isWorse
                                ? 'text-red-500 dark:text-red-400'
                                : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {m.isBetter ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : m.isWorse ? (
                            <TrendingDown className="w-3 h-3" />
                          ) : null}
                          {isPositive ? `+${m.diff}` : m.diff} {m.unit}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SwapCard;
