import React, { useState } from 'react';
import type { MealKey, MealEntry, FoodItem, Profile } from '../../types';
import { FOODS } from '../../data/foods';
import { aggregateIntake } from '../../engine/intake';
import FoodCombobox from './FoodCombobox';
import MealEntryItem from './MealEntryItem';
import QuantityModal from './QuantityModal';
import { PlusCircle, CheckCircle2 } from 'lucide-react';

interface MealSectionProps {
  mealKey: MealKey;
  title: string;
  emoji: string;
  entries: MealEntry[];
  userProfile: Profile | null;
  isSkipped?: boolean;
  onToggleSkip?: () => void;
  onAddEntry: (entry: MealEntry) => void;
  onUpdateEntry: (index: number, entry: MealEntry) => void;
  onRemoveEntry: (index: number) => void;
}

const foodMap = new Map<string, FoodItem>(FOODS.map((f) => [f.id, f]));

const QUICK_ADD_CONFIG: Record<MealKey, string[]> = {
  breakfast: ['poha', 'idli', 'oats', 'tea_with_milk', 'banana', 'egg_omelette'],
  lunch: ['rice', 'roti', 'dal', 'rajma', 'chicken_curry', 'salad'],
  dinner: ['rice', 'roti', 'dal', 'paneer_sabzi', 'fish_curry', 'curd'],
  snacks: ['sprouts', 'fruit_chaat', 'peanuts', 'tea_with_milk', 'samosa', 'biscuits'],
};

export const MealSection: React.FC<MealSectionProps> = ({
  mealKey,
  title,
  emoji,
  entries,
  userProfile,
  isSkipped = false,
  onToggleSkip,
  onAddEntry,
  onUpdateEntry,
  onRemoveEntry,
}) => {
  // Modal state for quantity selector
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingEntry, setEditingEntry] = useState<MealEntry | null>(null);

  // Calculate meal totals using aggregateIntake
  const mealIntake = React.useMemo(() => {
    const singleMeal = {
      breakfast: mealKey === 'breakfast' ? entries : [],
      lunch: mealKey === 'lunch' ? entries : [],
      dinner: mealKey === 'dinner' ? entries : [],
      snacks: mealKey === 'snacks' ? entries : [],
    };
    const aggregated = aggregateIntake(singleMeal);
    return aggregated.mealBreakdown[mealKey];
  }, [entries, mealKey]);

  // Quick add chips filtered by user diet
  const quickAddFoods = React.useMemo(() => {
    const ids = QUICK_ADD_CONFIG[mealKey] || [];
    return ids
      .map((id) => foodMap.get(id))
      .filter((food): food is FoodItem => {
        if (!food) return false;
        if (userProfile?.dietType && !food.dietTags.includes(userProfile.dietType)) {
          return false;
        }
        return true;
      });
  }, [mealKey, userProfile?.dietType]);

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setEditingIndex(null);
    setEditingEntry(null);
    setModalOpen(true);
  };

  const handleStartEdit = (entry: MealEntry, index: number) => {
    const food = foodMap.get(entry.foodId);
    if (food) {
      setSelectedFood(food);
      setEditingIndex(index);
      setEditingEntry(entry);
      setModalOpen(true);
    }
  };

  const handleConfirmQuantity = (quantity: number, source: 'home' | 'restaurant') => {
    if (!selectedFood) return;

    const entry: MealEntry = {
      foodId: selectedFood.id,
      quantity,
      source,
    };

    if (editingIndex !== null) {
      onUpdateEntry(editingIndex, entry);
    } else {
      onAddEntry(entry);
    }

    setModalOpen(false);
    setSelectedFood(null);
    setEditingIndex(null);
    setEditingEntry(null);
  };

  return (
    <section
      aria-labelledby={`meal-section-${mealKey}`}
      className="p-4 sm:p-6 bg-white dark:bg-gray-800 rounded-3xl border border-orange-100 dark:border-gray-700 shadow-sm space-y-4"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl" aria-hidden="true">
            {emoji}
          </span>
          <h2
            id={`meal-section-${mealKey}`}
            className="text-lg font-heading font-bold text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          {isSkipped && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              Skipped
            </span>
          )}
        </div>

        {/* Skip button toggle */}
        {onToggleSkip && (
          <button
            type="button"
            onClick={onToggleSkip}
            className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
              isSkipped
                ? 'border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-750 text-gray-700 dark:text-gray-300'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            {isSkipped ? '✓ Marked as skipped' : 'Skip this meal'}
          </button>
        )}
      </div>

      {!isSkipped && (
        <>
          {/* Quick Add Chips */}
          {quickAddFoods.length > 0 && (
            <div>
              <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
                Quick Add:
              </span>
              <div
                className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar"
                role="group"
                aria-label={`Quick add options for ${title}`}
              >
                {quickAddFoods.map((food) => (
                  <button
                    type="button"
                    key={food.id}
                    onClick={() => handleSelectFood(food)}
                    className="min-h-[44px] px-3 py-1.5 rounded-xl border border-orange-200/80 dark:border-gray-700 bg-orange-50/50 dark:bg-gray-750 text-xs font-medium text-gray-800 dark:text-gray-200 hover:bg-orange-100/70 dark:hover:bg-gray-700 shrink-0 inline-flex items-center gap-1.5 transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  >
                    <span>{food.emoji}</span>
                    <span>{food.name}</span>
                    <PlusCircle className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400 ml-0.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search Combobox */}
          <div>
            <FoodCombobox
              mealKey={mealKey}
              userProfile={userProfile}
              onSelectFood={handleSelectFood}
              placeholder={`Search ${title.toLowerCase()} foods...`}
            />
          </div>

          {/* Logged Meal Entries */}
          {entries.length > 0 ? (
            <div className="space-y-2 pt-1" role="list" aria-label={`Logged ${title} items`}>
              {entries.map((entry, idx) => (
                <MealEntryItem
                  key={`${entry.foodId}-${idx}`}
                  entry={entry}
                  index={idx}
                  mealKey={mealKey}
                  userAllergies={userProfile?.allergies}
                  onEdit={handleStartEdit}
                  onRemove={onRemoveEntry}
                />
              ))}
            </div>
          ) : (
            <div className="p-4 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 text-center text-xs text-gray-400 dark:text-gray-500">
              No items added to {title.toLowerCase()} yet.
            </div>
          )}

          {/* Per-Meal Running Totals */}
          {entries.length > 0 && (
            <div
              className="mt-3 p-3 rounded-2xl bg-gray-50 dark:bg-gray-750/70 border border-gray-100 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2 text-xs"
              aria-label={`${title} running nutritional totals`}
            >
              <div className="flex items-center gap-1 font-bold text-primary-700 dark:text-primary-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{Math.round(mealIntake.kcal)} kcal</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                <span>
                  <strong>{mealIntake.protein}g</strong> Protein
                </span>
                <span>
                  <strong>{mealIntake.carbs}g</strong> Carbs
                </span>
                <span>
                  <strong>{mealIntake.fat}g</strong> Fat
                </span>
                <span>
                  <strong>{mealIntake.fiber}g</strong> Fibre
                </span>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal for adding/editing quantity */}
      <QuantityModal
        isOpen={modalOpen}
        mealKey={mealKey}
        food={selectedFood}
        initialQuantity={editingEntry ? editingEntry.quantity : 1}
        initialSource={editingEntry ? editingEntry.source || 'home' : 'home'}
        isEditing={editingIndex !== null}
        onConfirm={handleConfirmQuantity}
        onClose={() => {
          setModalOpen(false);
          setSelectedFood(null);
          setEditingIndex(null);
          setEditingEntry(null);
        }}
      />
    </section>
  );
};

export default MealSection;
