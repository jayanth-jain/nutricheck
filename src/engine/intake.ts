import type { DailyMeals, DailyIntake, FoodItem, MealKey, Nutrients, NutrientCoverage } from '../types';
import { FOODS } from '../data/foods';

const NUTRIENT_KEYS: Array<keyof Nutrients> = [
  'kcal',
  'protein',
  'carbs',
  'fat',
  'fiber',
  'iron',
  'calcium',
  'vitC',
  'b12',
  'vitD',
  'sodium',
  'addedSugar',
];

function createEmptyNutrients(): Nutrients {
  return {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    iron: 0,
    calcium: 0,
    vitC: 0,
    b12: 0,
    vitD: 0,
    sodium: 0,
    addedSugar: 0,
  };
}

export function aggregateIntake(
  meals: DailyMeals,
  foodDatabase: FoodItem[] = FOODS
): DailyIntake {
  const foodMap = new Map<string, FoodItem>(foodDatabase.map((f) => [f.id, f]));

  const totals = createEmptyNutrients();
  const mealBreakdown: Record<MealKey, Nutrients> = {
    breakfast: createEmptyNutrients(),
    lunch: createEmptyNutrients(),
    dinner: createEmptyNutrients(),
    snacks: createEmptyNutrients(),
  };

  let friedItemCount = 0;
  let totalLoggedItems = 0;
  const itemsWithDataCount: Record<keyof Nutrients, number> = {
    kcal: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    iron: 0,
    calcium: 0,
    vitC: 0,
    b12: 0,
    vitD: 0,
    sodium: 0,
    addedSugar: 0,
  };

  const mealKeys: MealKey[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

  for (const mealKey of mealKeys) {
    const entries = meals[mealKey] || [];
    for (const entry of entries) {
      if (!entry || entry.quantity <= 0) continue;

      let nutrients: Nutrients | undefined;
      let isFried = false;

      if (entry.custom) {
        nutrients = entry.custom.nutrients;
      } else {
        const found = foodMap.get(entry.foodId);
        if (found) {
          nutrients = found.nutrients;
          isFried = !!found.isFried;
        }
      }

      if (!nutrients) continue;

      totalLoggedItems += 1;
      if (isFried) {
        friedItemCount += entry.quantity;
      }

      // Restaurant multiplier if applicable
      const isRestaurant = entry.source === 'restaurant';
      const fatMult = isRestaurant ? 1.2 : 1.0;
      const sodiumMult = isRestaurant ? 1.3 : 1.0;

      for (const k of NUTRIENT_KEYS) {
        const val = nutrients[k];
        if (val !== undefined && val !== null && !isNaN(val)) {
          itemsWithDataCount[k] += 1;
          let effectiveVal = val;
          if (k === 'fat') effectiveVal *= fatMult;
          if (k === 'sodium') effectiveVal *= sodiumMult;

          const amount = effectiveVal * entry.quantity;
          totals[k] = (totals[k] ?? 0) + amount;
          mealBreakdown[mealKey][k] = (mealBreakdown[mealKey][k] ?? 0) + amount;
        }
      }
    }
  }

  // Calculate coverages
  const coverages: Partial<Record<keyof Nutrients, NutrientCoverage>> = {};
  for (const k of NUTRIENT_KEYS) {
    if (totalLoggedItems === 0) {
      coverages[k] = { coverage: 1, isLimitedData: false };
    } else {
      const cov = itemsWithDataCount[k] / totalLoggedItems;
      coverages[k] = {
        coverage: Math.round(cov * 100) / 100,
        isLimitedData: cov < 0.6,
      };
    }
  }

  // Round values
  for (const k of NUTRIENT_KEYS) {
    totals[k] = Math.round((totals[k] ?? 0) * 10) / 10;
    for (const mealKey of mealKeys) {
      mealBreakdown[mealKey][k] =
        Math.round((mealBreakdown[mealKey][k] ?? 0) * 10) / 10;
    }
  }

  return {
    ...totals,
    coverages,
    mealBreakdown,
    friedItemCount: Math.round(friedItemCount * 10) / 10,
  };
}

// Backward compatibility alias
export function aggregateDailyIntake(
  meals: DailyMeals,
  foodDatabase?: FoodItem[]
): DailyIntake {
  return aggregateIntake(meals, foodDatabase);
}
