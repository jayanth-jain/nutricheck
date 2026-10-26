import type { Profile, DailyMeals, AnalysisResult, Nutrients, TopFood } from '../types';
import { calculateNutrientTargets } from './profile';
import { aggregateIntake } from './intake';
import { calculateScore } from './score';
import { checkSafety } from './safety';
import { generateInsights, getMealDistributionInsights } from './insights';
import { getTopFoodsForNutrient } from './topFoods';
import { getSwaps } from './swaps';
import { FOODS } from '../data/foods';

export function runAnalysis(profile: Profile, meals: DailyMeals): AnalysisResult {
  const targets = calculateNutrientTargets(profile);
  const intake = aggregateIntake(meals, FOODS);
  const score = calculateScore(intake, targets);
  const safety = checkSafety(profile);
  const insights = generateInsights(meals, profile, targets, intake, FOODS);
  const swaps = getSwaps(meals, profile, FOODS);

  // Top foods for low/key nutrients
  const topFoods: Partial<Record<keyof Nutrients, TopFood[]>> = {
    iron: getTopFoodsForNutrient('iron', profile, 5, FOODS),
    calcium: getTopFoodsForNutrient('calcium', profile, 5, FOODS),
    vitC: getTopFoodsForNutrient('vitC', profile, 5, FOODS),
    b12: getTopFoodsForNutrient('b12', profile, 5, FOODS),
    vitD: getTopFoodsForNutrient('vitD', profile, 5, FOODS),
    protein: getTopFoodsForNutrient('protein', profile, 5, FOODS),
    fiber: getTopFoodsForNutrient('fiber', profile, 5, FOODS),
  };

  const mealDistributionInsights = getMealDistributionInsights(intake);

  return {
    profile,
    targets,
    intake,
    score,
    safety,
    insights,
    swaps,
    topFoods,
    mealDistributionInsights,
  };
}
