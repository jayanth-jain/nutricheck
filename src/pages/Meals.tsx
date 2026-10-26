import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAnalysis, useTotalMealCount } from '../state/AnalysisContext';
import type { MealKey, DailyMeals } from '../types';
import { PERSONAS } from '../data/personas';
import { aggregateIntake } from '../engine/intake';
import { calculateNutrientTargets } from '../engine/profile';
import ProgressStepper from '../components/ui/ProgressStepper';
import MealSection from '../components/forms/MealSection';
import { Sparkles, Trash2, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

const MEAL_CONFIG: { key: MealKey; title: string; emoji: string }[] = [
  { key: 'breakfast', title: 'Breakfast', emoji: '☕' },
  { key: 'lunch', title: 'Lunch', emoji: '🍛' },
  { key: 'dinner', title: 'Dinner', emoji: '🍲' },
  { key: 'snacks', title: 'Snacks', emoji: '🥪' },
];

export default function MealsPage() {
  const navigate = useNavigate();
  const { state, dispatch } = useAnalysis();
  const totalItems = useTotalMealCount(state.meals);

  // Active tab on mobile (breakfast, lunch, dinner, snacks)
  const [activeTab, setActiveTab] = useState<MealKey>('breakfast');
  const [skippedMeals, setSkippedMeals] = useState<Record<MealKey, boolean>>({
    breakfast: false,
    lunch: false,
    dinner: false,
    snacks: false,
  });
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Calculate day intake
  const dayIntake = useMemo(() => {
    return aggregateIntake(state.meals);
  }, [state.meals]);

  // Nutrient target from profile
  const targetKcal = useMemo(() => {
    if (!state.profile) return 2000;
    try {
      const targets = calculateNutrientTargets(state.profile);
      return targets.kcalTarget;
    } catch {
      return 2000;
    }
  }, [state.profile]);

  // Progress percentage
  const caloriePercent = Math.min(100, Math.round((dayIntake.kcal / targetKcal) * 100));

  // Toggle meal skip
  const handleToggleSkip = (mealKey: MealKey) => {
    setSkippedMeals((prev) => ({ ...prev, [mealKey]: !prev[mealKey] }));
  };

  // Add meal entry
  const handleAddEntry = (mealKey: MealKey, entry: import('../types').MealEntry) => {
    dispatch({ type: 'ADD_MEAL_ENTRY', meal: mealKey, entry });
  };

  // Update meal entry
  const handleUpdateEntry = (
    mealKey: MealKey,
    index: number,
    entry: import('../types').MealEntry
  ) => {
    dispatch({ type: 'UPDATE_MEAL_ENTRY', meal: mealKey, index, entry });
  };

  // Remove meal entry
  const handleRemoveEntry = (mealKey: MealKey, index: number) => {
    dispatch({ type: 'REMOVE_MEAL_ENTRY', meal: mealKey, index });
  };

  // Quick fill sample persona
  const handleFillSample = () => {
    let persona = PERSONAS[0]; // Priya by default
    if (state.profile) {
      if (
        state.profile.sex === 'male' ||
        state.profile.dietType === 'non_vegetarian' ||
        state.profile.dietType === 'eggetarian'
      ) {
        persona = PERSONAS[1] || PERSONAS[0]; // Rahul
      }
    }
    if (persona && persona.meals) {
      const clonedMeals: DailyMeals = JSON.parse(JSON.stringify(persona.meals));
      dispatch({ type: 'SET_MEALS', meals: clonedMeals });
    }
  };

  // Clear all meals
  const handleClearAll = () => {
    const empty: DailyMeals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    dispatch({ type: 'SET_MEALS', meals: empty });
    setShowClearConfirm(false);
  };

  const handleProceed = () => {
    if (totalItems < 2) return;
    dispatch({ type: 'SET_STEP', step: 3 });
    navigate('/analyze/results');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 pb-36 md:pb-16">
      <ProgressStepper currentStep={2} steps={['Profile', 'Meals', 'Results']} />

      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white">
            Daily Meals Intake
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Log everything you consumed throughout a typical day.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleFillSample}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-primary-200 dark:border-primary-800 bg-primary-50/80 dark:bg-primary-950/40 text-primary-800 dark:text-primary-200 text-xs font-semibold hover:bg-primary-100 dark:hover:bg-primary-900/60 inline-flex items-center gap-1.5 transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary-600 dark:text-primary-400" />
            <span>Fill sample day</span>
          </button>

          {totalItems > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="min-h-[44px] px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-xs font-medium hover:bg-red-50 hover:text-red-600 dark:hover:bg-gray-750 dark:hover:text-red-400 inline-flex items-center gap-1.5 transition-colors focus:outline-hidden focus:ring-2 focus:ring-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {showClearConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl max-w-sm w-full space-y-4 border border-gray-100 dark:border-gray-700 shadow-xl">
            <h3 className="font-heading font-bold text-lg text-gray-900 dark:text-white">
              Clear All Logged Meals?
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-300">
              This will remove all items added for Breakfast, Lunch, Dinner, and Snacks.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleClearAll}
                className="min-h-[44px] px-4 py-2 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-700 text-white"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Tab Navigation (< 768px) */}
      <div className="md:hidden mb-4">
        <div
          role="tablist"
          aria-label="Meal categories"
          className="grid grid-cols-4 gap-1 p-1 rounded-2xl bg-orange-100/60 dark:bg-gray-800 border border-orange-200/50 dark:border-gray-700"
        >
          {MEAL_CONFIG.map((tab) => {
            const count = state.meals[tab.key].length;
            const isSelected = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                role="tab"
                id={`tab-${tab.key}`}
                aria-selected={isSelected}
                aria-controls={`panel-${tab.key}`}
                onClick={() => setActiveTab(tab.key)}
                className={`min-h-[44px] py-2 px-1 rounded-xl text-xs font-medium flex flex-col items-center justify-center transition-all focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
                  isSelected
                    ? 'bg-white dark:bg-gray-700 text-primary-700 dark:text-primary-300 font-bold shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1">
                  <span>{tab.emoji}</span>
                  <span className="hidden sm:inline">{tab.title}</span>
                </span>
                <span className="text-[10px] opacity-80">
                  {count > 0 ? `${count} items` : 'Empty'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Meals Layout */}
      {/* Mobile: Active tab only */}
      <div className="md:hidden">
        {MEAL_CONFIG.filter((m) => m.key === activeTab).map((meal) => (
          <div
            key={meal.key}
            role="tabpanel"
            id={`panel-${meal.key}`}
            aria-labelledby={`tab-${meal.key}`}
          >
            <MealSection
              mealKey={meal.key}
              title={meal.title}
              emoji={meal.emoji}
              entries={state.meals[meal.key]}
              userProfile={state.profile}
              isSkipped={skippedMeals[meal.key]}
              onToggleSkip={() => handleToggleSkip(meal.key)}
              onAddEntry={(entry) => handleAddEntry(meal.key, entry)}
              onUpdateEntry={(idx, entry) => handleUpdateEntry(meal.key, idx, entry)}
              onRemoveEntry={(idx) => handleRemoveEntry(meal.key, idx)}
            />
          </div>
        ))}
      </div>

      {/* Desktop (>= 768px): All 4 sections in stacked or 2-column layout */}
      <div className="hidden md:grid md:grid-cols-2 gap-6">
        {MEAL_CONFIG.map((meal) => (
          <MealSection
            key={meal.key}
            mealKey={meal.key}
            title={meal.title}
            emoji={meal.emoji}
            entries={state.meals[meal.key]}
            userProfile={state.profile}
            isSkipped={skippedMeals[meal.key]}
            onToggleSkip={() => handleToggleSkip(meal.key)}
            onAddEntry={(entry) => handleAddEntry(meal.key, entry)}
            onUpdateEntry={(idx, entry) => handleUpdateEntry(meal.key, idx, entry)}
            onRemoveEntry={(idx) => handleRemoveEntry(meal.key, idx)}
          />
        ))}
      </div>

      {/* Desktop Day Totals Summary Card */}
      <div className="hidden md:block mt-8 p-6 bg-white dark:bg-gray-800 rounded-3xl border border-orange-100 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold font-heading text-gray-900 dark:text-white">
              Daily Nutrition Summary
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Target based on your profile: ~{targetKcal} kcal
            </p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold font-heading text-primary-600 dark:text-primary-400">
              {Math.round(dayIntake.kcal)}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400"> / {targetKcal} kcal</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              caloriePercent > 115
                ? 'bg-amber-500'
                : caloriePercent < 70
                ? 'bg-primary-400'
                : 'bg-secondary-500'
            }`}
            style={{ width: `${caloriePercent}%` }}
          />
        </div>

        {/* Macronutrient breakdown */}
        <div className="grid grid-cols-4 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700 text-center">
          <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-750">
            <span className="block text-xs text-gray-500 dark:text-gray-400">Protein</span>
            <span className="block text-base font-bold text-gray-900 dark:text-white">
              {dayIntake.protein}g
            </span>
          </div>
          <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-750">
            <span className="block text-xs text-gray-500 dark:text-gray-400">Carbs</span>
            <span className="block text-base font-bold text-gray-900 dark:text-white">
              {dayIntake.carbs}g
            </span>
          </div>
          <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-750">
            <span className="block text-xs text-gray-500 dark:text-gray-400">Fat</span>
            <span className="block text-base font-bold text-gray-900 dark:text-white">
              {dayIntake.fat}g
            </span>
          </div>
          <div className="p-2 rounded-xl bg-gray-50 dark:bg-gray-750">
            <span className="block text-xs text-gray-500 dark:text-gray-400">Fibre</span>
            <span className="block text-base font-bold text-gray-900 dark:text-white">
              {dayIntake.fiber}g
            </span>
          </div>
        </div>
      </div>

      {/* Notice & Navigation Controls */}
      <div className="mt-8 pt-4 border-t border-orange-100 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          to="/analyze/profile"
          className="min-h-[48px] px-5 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-sm inline-flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Edit Profile</span>
        </Link>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center sm:text-right max-w-sm">
          Results are based on your entries above. For accurate results, try to include all major
          meals.
        </p>

        <button
          type="button"
          onClick={handleProceed}
          disabled={totalItems < 2}
          className={`min-h-[48px] px-8 py-3 rounded-2xl font-semibold text-sm inline-flex items-center gap-2 transition-all focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
            totalItems >= 2
              ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg active:scale-98'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>Analyze My Diet</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Sticky Day Total Bar (Mobile Fixed Bottom) */}
      <aside
        aria-label="Daily Nutrition Live Summary"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-orange-100 dark:border-gray-800 px-4 py-3 shadow-2xl transition-colors"
      >
        <div className="max-w-md mx-auto space-y-2">
          {/* Quick macro bar */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
              <span>{Math.round(dayIntake.kcal)} kcal</span>
              <span className="text-[11px] font-normal text-gray-500 dark:text-gray-400">
                / {targetKcal}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-gray-300">
              <span>
                <strong>{dayIntake.protein}g</strong> P
              </span>
              <span>
                <strong>{dayIntake.carbs}g</strong> C
              </span>
              <span>
                <strong>{dayIntake.fat}g</strong> F
              </span>
              <span>
                <strong>{dayIntake.fiber}g</strong> Fib
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                caloriePercent > 115
                  ? 'bg-amber-500'
                  : caloriePercent < 70
                  ? 'bg-primary-400'
                  : 'bg-secondary-500'
              }`}
              style={{ width: `${caloriePercent}%` }}
            />
          </div>

          {/* Warning chip if only 2 items */}
          {totalItems === 2 && (
            <div className="flex items-center gap-1.5 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Only 2 items logged — results may be less reliable.</span>
            </div>
          )}

          {/* Action button */}
          <button
            type="button"
            onClick={handleProceed}
            disabled={totalItems < 2}
            className={`w-full min-h-[44px] py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
              totalItems >= 2
                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md active:scale-98'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            <span>
              {totalItems < 2 ? 'Add at least 2 items to analyze' : `Analyze Diet (${totalItems} items)`}
            </span>
            {totalItems >= 2 && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </aside>
    </div>
  );
}
