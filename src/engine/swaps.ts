import type { DailyMeals, Profile, FoodItem, ComputedSwap, Nutrients, SwapRule } from '../types';
import { FOODS } from '../data/foods';
import { SWAP_RULES } from '../data/swaps';

function isFoodEligible(food: FoodItem, profile: Profile): boolean {
  // Diet filter
  if (profile.dietType && !food.dietTags.includes(profile.dietType)) {
    return false;
  }

  // Allergies
  if (profile.allergies && profile.allergies.length > 0) {
    if (food.allergens.some((a) => profile.allergies!.includes(a))) {
      return false;
    }
    if (profile.allergies.includes('gluten') && food.containsGluten) {
      return false;
    }
  }

  // Conditions
  if (profile.conditions) {
    if (profile.conditions.includes('celiac')) {
      if (food.containsGluten || food.allergens.includes('gluten')) {
        return false;
      }
    }
    if (profile.conditions.includes('lactose_intolerance')) {
      if (food.allergens.includes('milk')) {
        return false;
      }
    }
  }

  return true;
}

function calculateDelta(toFood: FoodItem, fromFood: FoodItem): Nutrients {
  return {
    kcal: Math.round((toFood.nutrients.kcal - fromFood.nutrients.kcal) * 10) / 10,
    protein: Math.round((toFood.nutrients.protein - fromFood.nutrients.protein) * 10) / 10,
    carbs: Math.round((toFood.nutrients.carbs - fromFood.nutrients.carbs) * 10) / 10,
    fat: Math.round((toFood.nutrients.fat - fromFood.nutrients.fat) * 10) / 10,
    fiber: Math.round((toFood.nutrients.fiber - fromFood.nutrients.fiber) * 10) / 10,
    iron: Math.round(((toFood.nutrients.iron ?? 0) - (fromFood.nutrients.iron ?? 0)) * 10) / 10,
    calcium: Math.round(((toFood.nutrients.calcium ?? 0) - (fromFood.nutrients.calcium ?? 0)) * 10) / 10,
    vitC: Math.round(((toFood.nutrients.vitC ?? 0) - (fromFood.nutrients.vitC ?? 0)) * 10) / 10,
    b12: Math.round(((toFood.nutrients.b12 ?? 0) - (fromFood.nutrients.b12 ?? 0)) * 10) / 10,
    vitD: Math.round(((toFood.nutrients.vitD ?? 0) - (fromFood.nutrients.vitD ?? 0)) * 10) / 10,
    sodium: Math.round(((toFood.nutrients.sodium ?? 0) - (fromFood.nutrients.sodium ?? 0)) * 10) / 10,
    addedSugar: Math.round(((toFood.nutrients.addedSugar ?? 0) - (fromFood.nutrients.addedSugar ?? 0)) * 10) / 10,
  };
}

export function getSwaps(
  meals: DailyMeals,
  profile: Profile,
  foodDatabase: FoodItem[] = FOODS,
  rules: SwapRule[] = SWAP_RULES
): ComputedSwap[] {
  const foodMap = new Map<string, FoodItem>(foodDatabase.map((f) => [f.id, f]));

  // Find all foods actually logged in meals with quantity > 0
  const loggedFoodIds = new Set<string>();
  const mealKeys: Array<keyof DailyMeals> = ['breakfast', 'lunch', 'dinner', 'snacks'];
  for (const mealKey of mealKeys) {
    for (const entry of meals[mealKey] || []) {
      if (entry && entry.quantity > 0 && entry.foodId) {
        loggedFoodIds.add(entry.foodId);
      }
    }
  }

  const computedSwaps: ComputedSwap[] = [];
  const handledFromFoods = new Set<string>();

  for (const rule of rules) {
    // 1. Only show swaps if from-food was actually logged
    if (!loggedFoodIds.has(rule.fromFoodId)) {
      continue;
    }

    const fromFood = foodMap.get(rule.fromFoodId);
    const toFood = foodMap.get(rule.toFoodId);
    if (!fromFood || !toFood) {
      continue;
    }

    // 2. Custom rule condition
    if (rule.condition && !rule.condition(profile)) {
      continue;
    }

    // 3. Diet, allergy, and condition filters on to-food
    if (!isFoodEligible(toFood, profile)) {
      continue;
    }

    // 4. Goal constraints (e.g. if losing weight, do not drastically increase calories)
    if (profile.goal === 'lose' && toFood.nutrients.kcal > fromFood.nutrients.kcal + 20) {
      continue;
    }

    // Avoid duplicate swaps for the same from-food if already added
    const swapKey = `${fromFood.id}->${toFood.id}`;
    if (handledFromFoods.has(swapKey)) {
      continue;
    }
    handledFromFoods.add(swapKey);

    computedSwaps.push({
      fromFood,
      toFood,
      reason: rule.reason,
      delta: calculateDelta(toFood, fromFood),
    });
  }

  return computedSwaps;
}

// Backward compatibility alias
export function computeSmartSwaps(
  meals: DailyMeals,
  profile: Profile,
  foodDatabase?: FoodItem[]
): ComputedSwap[] {
  return getSwaps(meals, profile, foodDatabase);
}
