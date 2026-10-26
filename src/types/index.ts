export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
export type Goal = 'lose' | 'maintain' | 'gain' | 'analyze';
export type DietType = 'vegetarian' | 'eggetarian' | 'non_vegetarian' | 'vegan' | 'jain';
export type Region = 'north' | 'south' | 'east' | 'west' | 'central' | 'northeast' | 'pan_indian';
export type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks';
export type Allergen = 'milk' | 'egg' | 'peanut' | 'tree_nut' | 'gluten' | 'fish' | 'soy' | 'sesame';
export type DataQuality = 'ifct' | 'estimate' | 'unknown';
export type NutrientStatus = 'adequate' | 'likely_low' | 'very_low';
export type SafetyMode = 'full' | 'limited' | 'informational' | 'blocked';

export interface Profile {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
  // Optional advanced fields
  dietType?: DietType;
  region?: Region;
  occupation?: 'desk' | 'standing_light' | 'physical_labour' | 'shift_night' | 'student' | 'homemaker';
  sunExposure?: 'low' | 'moderate' | 'high';
  teaCoffeeCupsPerDay?: number;
  takesSupplements?: { iron?: boolean; b12?: boolean; vitD?: boolean; calcium?: boolean };
  allergies?: Allergen[];
  conditions?: Array<
    | 'diabetes'
    | 'hypertension'
    | 'thyroid'
    | 'kidney_disease'
    | 'celiac'
    | 'lactose_intolerance'
    | 'pcos'
    | 'diagnosed_anaemia'
  >;
  pregnancyStatus?: 'none' | 'pregnant' | 'breastfeeding';
}

export interface Nutrients {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron?: number;
  calcium?: number;
  vitC?: number;
  b12?: number;
  vitD?: number;
  sodium?: number;
  addedSugar?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  emoji: string;
  category: 'breakfast' | 'main' | 'snack' | 'drink' | 'fruit';
  servingLabel: string;
  gramsPerServing?: number;
  nutrients: Nutrients;
  dataQuality: Partial<Record<keyof Nutrients, DataQuality>>;
  dietTags: DietType[];
  allergens: Allergen[];
  containsGluten?: boolean;
  region: Region[];
  isFried?: boolean;
  hasTeaOrCoffee?: boolean;
  isRefinedCarb?: boolean;
  isWholeGrainOrLegume?: boolean;
  swapGroup?: string;
}

export interface CustomFood {
  name: string;
  servingLabel: string;
  nutrients: Nutrients;
  isCustom: true;
}

export interface MealEntry {
  foodId: string;
  quantity: number;
  source?: 'home' | 'restaurant';
  custom?: CustomFood;
}

export type DailyMeals = Record<MealKey, MealEntry[]>;

export interface NutrientTarget {
  kcalTarget: number;
  proteinRDA: number;
  proteinPractical: number;
  fiberTarget: number;
  iron: number;
  calcium: number;
  vitC: number;
  b12: number;
  vitD: number;
  sodiumUpperGuide: number;
  addedSugarUpperGuide: number;
}

export interface NutrientCoverage {
  coverage: number; // 0–1, fraction of logged items that have data for this nutrient
  isLimitedData: boolean; // true if coverage < 0.6
}

export interface DailyIntake extends Nutrients {
  coverages: Partial<Record<keyof Nutrients, NutrientCoverage>>;
  mealBreakdown: Record<MealKey, Nutrients>;
  friedItemCount: number;
}

export interface ScoreBreakdown {
  calorieAdequacy: number; // max 20
  macroBalance: number; // max 15
  proteinVsTarget: number; // max 15
  fibreVsTarget: number; // max 10
  micronutrients: number; // max 30
  moderation: number; // max 10
  total: number; // max 100
}

export interface SafetyResult {
  mode: SafetyMode;
  banners: string[];
  disabledFeatures: string[];
}

export interface SwapRule {
  fromFoodId: string;
  toFoodId: string;
  reason: string;
  condition?: (profile: Profile) => boolean;
}

export interface ComputedSwap {
  fromFood: FoodItem;
  toFood: FoodItem;
  reason: string;
  delta: Nutrients;
}

export interface TopFood {
  food: FoodItem;
  nutrientPerServing: number;
  nutrientPer100kcal: number;
}

export interface Insight {
  id: string;
  type: 'positive' | 'warning' | 'info';
  message: string;
}

export interface StructuredInsights extends Array<Insight> {
  ironTips: string[];
  b12Tips: string[];
  vitDTips: string[];
  calciumTips: string[];
  sodiumFlags: string[];
  supplementNotes: Record<string, string>;
  mealDistribution: string[];
  generalInsights: string[];
}

export interface AnalysisResult {
  profile: Profile;
  targets: NutrientTarget;
  intake: DailyIntake;
  score: ScoreBreakdown;
  safety: SafetyResult;
  insights: StructuredInsights;
  swaps: ComputedSwap[];
  topFoods: Partial<Record<keyof Nutrients, TopFood[]>>;
  mealDistributionInsights: string[];
}


// Backward compatibility helper types
export interface ScientificConstant<T = number> {
  value: T;
  unit: string;
  source: string;
  year: number;
  status: 'confirmed' | 'verify';
}
