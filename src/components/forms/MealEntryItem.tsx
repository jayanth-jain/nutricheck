import React from 'react';
import type { MealEntry, MealKey, Allergen, FoodItem } from '../../types';
import { FOODS } from '../../data/foods';
import { Trash2, Edit3, AlertTriangle } from 'lucide-react';

interface MealEntryItemProps {
  entry: MealEntry;
  index: number;
  mealKey: MealKey;
  userAllergies?: Allergen[];
  onEdit: (entry: MealEntry, index: number) => void;
  onRemove: (index: number) => void;
}

const foodMap = new Map<string, FoodItem>(FOODS.map((f) => [f.id, f]));

export const MealEntryItem: React.FC<MealEntryItemProps> = ({
  entry,
  index,
  userAllergies = [],
  onEdit,
  onRemove,
}) => {
  const food = foodMap.get(entry.foodId);
  const name = entry.custom ? entry.custom.name : food?.name || entry.foodId;
  const emoji = food?.emoji || '🍽️';
  const servingLabel = entry.custom ? entry.custom.servingLabel : food?.servingLabel || 'serving';

  const baseKcal = entry.custom ? entry.custom.nutrients.kcal : food?.nutrients.kcal || 0;
  const totalKcal = Math.round(baseKcal * entry.quantity);

  // Check matching allergens
  const foodAllergens = food?.allergens || [];
  const conflictingAllergens = foodAllergens.filter((a) => userAllergies.includes(a));

  return (
    <div className="flex items-center justify-between p-3 sm:p-3.5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xs hover:border-orange-200 dark:hover:border-gray-600 transition-colors gap-2">
      {/* Food Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <span className="text-2xl shrink-0" aria-hidden="true">
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">
              {name}
            </span>
            {entry.source === 'restaurant' && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                Restaurant
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            <span>
              {entry.quantity} × {servingLabel}
            </span>
            <span>•</span>
            <span className="font-medium text-primary-700 dark:text-primary-300">
              ~{totalKcal} kcal
            </span>
          </div>

          {/* Allergen warning */}
          {conflictingAllergens.length > 0 && (
            <div
              className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-950/40 text-[11px] font-medium text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900"
              role="alert"
            >
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>Contains {conflictingAllergens.join(', ')}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons with touch target >= 44px */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(entry, index)}
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500"
          aria-label={`Edit quantity for ${name}`}
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700 transition-colors focus:outline-hidden focus:ring-2 focus:ring-red-500"
          aria-label={`Remove ${name}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default MealEntryItem;
