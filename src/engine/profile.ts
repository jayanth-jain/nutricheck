import type { Profile, NutrientTarget, Sex } from '../types';
import {
  RDA,
  ACTIVITY_MULTIPLIERS,
  CALORIE_FLOOR,
  GOAL_ADJUSTMENTS,
  BMI_CUTOFFS,
} from '../constants/rda';

export function calculateBMI(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return 0;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export type BMICategory = 'underweight' | 'healthy' | 'overweight' | 'obese';

export function getBMICategory(bmi: number): BMICategory {
  if (bmi < BMI_CUTOFFS.underweight.max) return 'underweight';
  if (bmi < BMI_CUTOFFS.overweight.min) return 'healthy';
  if (bmi < BMI_CUTOFFS.obese.min) return 'overweight';
  return 'obese';
}

export function getBMICategoryLabel(category: BMICategory): string {
  return BMI_CUTOFFS[category].label;
}

/** Mifflin-St Jeor BMR formula */
export function calculateBMR(sex: Sex, weightKg: number, heightCm: number, age: number): number;
export function calculateBMR(profile: Profile): number;
export function calculateBMR(
  sexOrProfile: Sex | Profile,
  weightKg?: number,
  heightCm?: number,
  age?: number
): number {
  if (typeof sexOrProfile === 'object') {
    const { sex, weightKg: w, heightCm: h, age: a } = sexOrProfile;
    const base = 10 * w + 6.25 * h - 5 * a;
    return sex === 'male' ? base + 5 : base - 161;
  }
  const base = 10 * (weightKg ?? 0) + 6.25 * (heightCm ?? 0) - 5 * (age ?? 0);
  return sexOrProfile === 'male' ? base + 5 : base - 161;
}

export function calculateTDEE(bmr: number, activity: Profile['activity']): number {
  return bmr * ACTIVITY_MULTIPLIERS[activity];
}

/** Weight to use for protein target: if BMI >= 25, use BMI-25 weight */
export function getProteinReferenceWeight(weightKg: number, heightCm: number): number {
  if (heightCm <= 0) return weightKg;
  const heightM = heightCm / 100;
  const bmi = weightKg / (heightM * heightM);
  if (bmi >= 25) {
    // Cap at BMI 25
    return 25 * heightM * heightM;
  }
  return weightKg;
}

export function calculateCalorieTarget(tdee: number, goal: Profile['goal'], sex: Sex): number {
  let target: number;
  switch (goal) {
    case 'lose':
      target = tdee + GOAL_ADJUSTMENTS.deficitLose.value; // negative (-500)
      break;
    case 'gain':
      target = tdee + GOAL_ADJUSTMENTS.surplusGain.value; // +300
      break;
    default:
      target = tdee;
  }
  const floor = CALORIE_FLOOR[sex].value;
  return Math.max(target, floor);
}

export function calculateNutrientTargets(profile: Profile): NutrientTarget {
  const bmr = calculateBMR(profile.sex, profile.weightKg, profile.heightCm, profile.age);
  const tdee = calculateTDEE(bmr, profile.activity);
  const kcalTarget = calculateCalorieTarget(tdee, profile.goal, profile.sex);

  const refWeight = getProteinReferenceWeight(profile.weightKg, profile.heightCm);
  const proteinRDA = RDA.proteinPerKg[profile.sex].value * refWeight;
  const proteinPractical = RDA.proteinPracticalPerKg[profile.sex].value * refWeight;

  // Fibre: 40g per 2000 kcal, min 25g
  const fiberTarget = Math.max(25, (40 * kcalTarget) / 2000);

  return {
    kcalTarget: Math.round(kcalTarget),
    proteinRDA: Math.round(proteinRDA * 10) / 10,
    proteinPractical: Math.round(proteinPractical * 10) / 10,
    fiberTarget: Math.round(fiberTarget * 10) / 10,
    iron: RDA.iron[profile.sex].value,
    calcium: RDA.calcium[profile.sex].value,
    vitC: RDA.vitaminC[profile.sex].value,
    b12: RDA.vitaminB12[profile.sex].value,
    vitD: RDA.vitaminD[profile.sex].value,
    sodiumUpperGuide: RDA.sodiumUpperGuide[profile.sex].value,
    addedSugarUpperGuide: RDA.addedSugarUpperGuide[profile.sex].value,
  };
}
