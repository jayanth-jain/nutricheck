import type { FoodItem } from '../types';

export const FOOD_ALIASES: Record<string, string[]> = {
  'roti': ['chapati', 'chapathi', 'roti', 'phulka', 'fulka'],
  'curd': ['dahi', 'curd', 'yogurt', 'yoghurt'],
  'buttermilk': ['chaas', 'chhas', 'buttermilk', 'mattha', 'moru'],
  'dal': ['dhal', 'lentils', 'dal', 'daal', 'tadka'],
  'poha': ['pohe', 'beaten rice', 'aval', 'flattened rice'],
  'biryani': ['biriyani'],
  'paratha': ['parantha', 'parotta'],
  'rajma': ['kidney beans', 'rajma'],
  'chole': ['chana', 'chickpea', 'chhole', 'kabuli chana'],
  'sambar': ['sambhar'],
  'rasam': ['rasam', 'pepper water', 'charu'],
  'idli': ['idly'],
  'dosa': ['dosai', 'dose'],
  'paneer': ['cottage cheese'],
  'chai': ['tea', 'chai'],
  'egg': ['anda', 'omelet', 'omelette'],
  'rice': ['chawal', 'bhat', 'rice'],
};

/**
 * Checks if a food item matches a search query using direct name/id matching or alias matching.
 */
export function matchesFoodQuery(food: FoodItem, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;

  const foodName = food.name.toLowerCase();
  const foodId = food.id.toLowerCase();

  // Direct match in name or id
  if (foodName.includes(query) || foodId.includes(query)) {
    return true;
  }

  // Check aliases
  for (const [key, aliases] of Object.entries(FOOD_ALIASES)) {
    // If the food matches this key (or id matches key or name matches key)
    const foodMatchesKey = foodId === key || foodName.includes(key);

    if (foodMatchesKey) {
      if (aliases.some((alias) => alias.toLowerCase().includes(query) || query.includes(alias.toLowerCase()))) {
        return true;
      }
    }

    // Also check if user typed an alias that maps to this food
    if (aliases.some((alias) => alias.toLowerCase().includes(query) || query.includes(alias.toLowerCase()))) {
      if (foodMatchesKey) {
        return true;
      }
    }
  }

  return false;
}
