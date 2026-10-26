// src/constants/thresholds.ts
import { CALORIE_FLOOR, BMI_CUTOFFS } from './rda';

export type NutrientStatus = 'adequate' | 'likely_low' | 'very_low';

export const NUTRIENT_STATUS_THRESHOLDS = {
  adequate: { minPercent: 80, label: 'Looks adequate', color: 'green' },
  likely_low: { minPercent: 50, maxPercent: 79, label: 'Likely low', color: 'amber' },
  very_low: { maxPercent: 49, label: 'Very low', color: 'red' },
} as const;

export function getNutrientStatus(intakePercent: number): NutrientStatus {
  if (intakePercent >= 80) return 'adequate';
  if (intakePercent >= 50) return 'likely_low';
  return 'very_low';
}

// Score labels
export const SCORE_LABELS = {
  good: { min: 80, label: 'Good', color: 'green' },
  needs_attention: { min: 50, max: 79, label: 'Needs attention', color: 'amber' },
  needs_a_lot: { max: 49, label: 'Needs a lot of attention', color: 'red' },
} as const;

export function getScoreLabel(score: number): typeof SCORE_LABELS[keyof typeof SCORE_LABELS] {
  if (score >= 80) return SCORE_LABELS.good;
  if (score >= 50) return SCORE_LABELS.needs_attention;
  return SCORE_LABELS.needs_a_lot;
}

// Backward-compatible exports
export const CALORIE_FLOOR_FEMALE = CALORIE_FLOOR.female;
export const CALORIE_FLOOR_MALE = CALORIE_FLOOR.male;
export const ASIAN_BMI_CUTOFFS = {
  underweight: BMI_CUTOFFS.underweight.max,
  normalMax: BMI_CUTOFFS.healthy.max,
  overweightMax: BMI_CUTOFFS.overweight.max,
  obeseMin: BMI_CUTOFFS.obese.min,
} as const;
