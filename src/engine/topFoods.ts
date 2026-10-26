import type { FoodItem, Profile, Nutrients, TopFood } from '../types';
import { FOODS } from '../data/foods';

export function getTopFoodsForNutrient(
  nutrientKey: keyof Nutrients,
  profile: Profile,
  limit = 5,
  foodDatabase: FoodItem[] = FOODS
): TopFood[] {
  const eligible = foodDatabase.filter((food) => {
    const val = food.nutrients[nutrientKey];
    if (val === undefined || val === null || val <= 0) return false;

    // Diet type filter
    if (profile.dietType && !food.dietTags.includes(profile.dietType)) {
      return false;
    }

    // Allergens filter
    if (profile.allergies && profile.allergies.length > 0) {
      const hasAllergen = food.allergens.some((a) =>
        profile.allergies!.includes(a)
      );
      if (hasAllergen) return false;

      if (profile.allergies.includes('gluten') && food.containsGluten) {
        return false;
      }
    }

    // Conditions filter
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
  });

  const mapped: TopFood[] = eligible.map((food) => {
    const nutrientPerServing = food.nutrients[nutrientKey] ?? 0;
    const nutrientPer100kcal =
      food.nutrients.kcal > 0
        ? (nutrientPerServing / food.nutrients.kcal) * 100
        : 0;

    return {
      food,
      nutrientPerServing: Math.round(nutrientPerServing * 10) / 10,
      nutrientPer100kcal: Math.round(nutrientPer100kcal * 10) / 10,
    };
  });

  mapped.sort((a, b) => {
    if (b.nutrientPerServing !== a.nutrientPerServing) {
      return b.nutrientPerServing - a.nutrientPerServing;
    }
    return b.nutrientPer100kcal - a.nutrientPer100kcal;
  });

  return mapped.slice(0, limit);
}
