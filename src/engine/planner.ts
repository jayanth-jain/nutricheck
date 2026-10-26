import type { Profile, DailyMeals, FoodItem, NutrientTarget } from '../types';
import { FOODS } from '../data/foods';

export interface PlannedMeal {
  name: string;
  items: Array<{ food: FoodItem; quantity: number }>;
  kcal: number;
  protein: number;
  note: string; // e.g. "Rich in iron and fibre"
}

export interface DayPlan {
  breakfast: PlannedMeal;
  midMorning: PlannedMeal;
  lunch: PlannedMeal;
  eveningSnack: PlannedMeal;
  dinner: PlannedMeal;
  totalKcal: number;
  totalProtein: number;
  disclaimer: string;
}

// Calorie splits: Breakfast 22%, Mid-morning 8%, Lunch 33%, Evening 10%, Dinner 27%
export const MEAL_SPLITS = {
  breakfast: 0.22,
  midMorning: 0.08,
  lunch: 0.33,
  eveningSnack: 0.1,
  dinner: 0.27,
};

function getFoodById(id: string): FoodItem | undefined {
  return FOODS.find((f) => f.id === id);
}

function isFoodAllowed(food: FoodItem, profile: Profile): boolean {
  if (profile.dietType && !food.dietTags.includes(profile.dietType)) return false;
  if (profile.allergies) {
    for (const allergen of profile.allergies) {
      if (food.allergens.includes(allergen)) return false;
    }
  }
  if (profile.conditions?.includes('celiac') && food.containsGluten) return false;
  if (profile.conditions?.includes('lactose_intolerance') && food.allergens.includes('milk'))
    return false;
  return true;
}

export function generateDayPlan(
  profile: Profile,
  _targets?: NutrientTarget,
  _lowNutrients?: string[]
): DayPlan | null {
  // Vegetarian templates
  const vegBreakfastOptions = [
    { ids: ['oats', 'glass_of_milk'], note: 'High in protein and fibre' },
    { ids: ['idli', 'sambar'], note: 'Traditional South Indian, good protein' },
    { ids: ['poha', 'tea_with_milk'], note: 'Light and easy to digest' },
  ];
  const nonVegBreakfastOptions = [
    { ids: ['egg_omelette', 'bread_toast'], note: 'High in protein and B12' },
    { ids: ['oats', 'glass_of_milk'], note: 'High in protein and fibre' },
  ];

  const vegLunchOptions = [
    {
      ids: ['roti', 'dal', 'mixed_veg', 'curd'],
      note: 'Balanced Indian thali with protein and calcium',
    },
    { ids: ['brown_rice', 'rajma', 'salad'], note: 'Rich in fibre, iron and protein' },
    { ids: ['roti', 'palak_paneer', 'raita'], note: 'Iron-rich with calcium' },
  ];
  const nonVegLunchOptions = [
    {
      ids: ['brown_rice', 'chicken_curry', 'salad'],
      note: 'High protein with vitamin C from salad',
    },
    { ids: ['roti', 'dal', 'fish_curry'], note: 'Rich in protein, omega-3 and fibre' },
  ];

  const snackOptions = [
    { ids: ['sprouts'], note: 'High in protein and iron' },
    { ids: ['fruit_chaat'], note: 'Rich in vitamin C and fibre' },
    { ids: ['peanuts'], note: 'Good source of protein and healthy fats' },
  ];

  const vegDinnerOptions = [
    { ids: ['roti', 'dal', 'mixed_veg'], note: 'Light and balanced' },
    { ids: ['brown_rice', 'chole', 'raita'], note: 'Rich in plant protein and fibre' },
    { ids: ['roti', 'paneer_sabzi', 'salad'], note: 'Good protein with calcium' },
  ];
  const nonVegDinnerOptions = [
    { ids: ['roti', 'chicken_curry', 'salad'], note: 'Protein-rich with vegetables' },
    { ids: ['brown_rice', 'fish_curry', 'dal'], note: 'Rich in protein and omega-3' },
  ];

  const isVeg =
    profile.dietType === 'vegetarian' ||
    profile.dietType === 'vegan' ||
    profile.dietType === 'jain';
  const breakfastOpts = isVeg ? vegBreakfastOptions : nonVegBreakfastOptions;
  const lunchOpts = isVeg ? vegLunchOptions : nonVegLunchOptions;
  const dinnerOpts = isVeg ? vegDinnerOptions : nonVegDinnerOptions;

  function buildMeal(opts: Array<{ ids: string[]; note: string }>, mealName: string): PlannedMeal {
    // Find first option where all foods are allowed
    for (const opt of opts) {
      const foods = opt.ids.map((id) => getFoodById(id)).filter(Boolean) as FoodItem[];
      const allowed = foods.every((f) => isFoodAllowed(f, profile));
      if (allowed && foods.length > 0) {
        const items = foods.map((f) => ({ food: f, quantity: 1 }));
        const kcal = items.reduce((s, i) => s + i.food.nutrients.kcal * i.quantity, 0);
        const protein = items.reduce((s, i) => s + i.food.nutrients.protein * i.quantity, 0);
        return { name: mealName, items, kcal, protein, note: opt.note };
      }
    }
    // Fallback: first allowed food
    const fallback = FOODS.find((f) => isFoodAllowed(f, profile));
    if (fallback) {
      return {
        name: mealName,
        items: [{ food: fallback, quantity: 1 }],
        kcal: fallback.nutrients.kcal,
        protein: fallback.nutrients.protein,
        note: 'Based on your preferences',
      };
    }
    return { name: mealName, items: [], kcal: 0, protein: 0, note: '' };
  }

  const breakfast = buildMeal(breakfastOpts, 'Breakfast');
  const midMorning = buildMeal(snackOptions, 'Mid-morning snack');
  const lunch = buildMeal(lunchOpts, 'Lunch');
  const eveningSnack = buildMeal(snackOptions.slice(1), 'Evening snack');
  const dinner = buildMeal(dinnerOpts, 'Dinner');

  const totalKcal =
    breakfast.kcal + midMorning.kcal + lunch.kcal + eveningSnack.kcal + dinner.kcal;
  const totalProtein =
    breakfast.protein +
    midMorning.protein +
    lunch.protein +
    eveningSnack.protein +
    dinner.protein;

  return {
    breakfast,
    midMorning,
    lunch,
    eveningSnack,
    dinner,
    totalKcal,
    totalProtein,
    disclaimer:
      'A sample day based on your profile and preferences — not a prescription. Portion sizes should be adjusted to meet your calorie target.',
  };
}

export function generateDietPlan(
  _profile: Profile,
  _lowNutrients: string[]
): DailyMeals | null {
  return null;
}
