import type { DailyIntake, NutrientTarget, ScoreBreakdown, Profile } from '../types';
import { calculateNutrientTargets } from './profile';

export function calculateScore(
  intake: DailyIntake,
  targets: NutrientTarget
): ScoreBreakdown {
  // 1. Calorie adequacy (max 20)
  // Full (20) if 0.9 <= r <= 1.1; linear to 0 at r <= 0.5 or r >= 1.5
  let calorieAdequacy = 0;
  if (targets.kcalTarget > 0) {
    const r = intake.kcal / targets.kcalTarget;
    if (r >= 0.9 && r <= 1.1) {
      calorieAdequacy = 20;
    } else if (r > 0.5 && r < 0.9) {
      calorieAdequacy = 20 * ((r - 0.5) / (0.9 - 0.5));
    } else if (r > 1.1 && r < 1.5) {
      calorieAdequacy = 20 * ((1.5 - r) / (1.5 - 1.1));
    } else {
      calorieAdequacy = 0;
    }
  }

  // 2. Macro balance (max 15: 5 pts carbs, 5 pts protein, 5 pts fat)
  // Linear to 0 at 10pp outside recommended range
  let macroBalance = 0;
  const cEnergy = intake.carbs * 4;
  const pEnergy = intake.protein * 4;
  const fEnergy = intake.fat * 9;
  const totalEnergy = cEnergy + pEnergy + fEnergy;

  if (totalEnergy > 0) {
    const carbsPct = (cEnergy / totalEnergy) * 100;
    const proteinPct = (pEnergy / totalEnergy) * 100;
    const fatPct = (fEnergy / totalEnergy) * 100;

    const scoreMacroPct = (pct: number, min: number, max: number): number => {
      if (pct >= min && pct <= max) return 5;
      if (pct < min) {
        const diff = min - pct;
        if (diff >= 10) return 0;
        return 5 * (1 - diff / 10);
      } else {
        const diff = pct - max;
        if (diff >= 10) return 0;
        return 5 * (1 - diff / 10);
      }
    };

    macroBalance =
      scoreMacroPct(carbsPct, 45, 60) +
      scoreMacroPct(proteinPct, 10, 15) +
      scoreMacroPct(fatPct, 20, 30);
  }

  // 3. Protein vs target (max 15)
  // min(intake/practical_target, 1) * 15
  let proteinVsTarget = 0;
  if (targets.proteinPractical > 0) {
    proteinVsTarget = Math.min(intake.protein / targets.proteinPractical, 1) * 15;
  }

  // 4. Fibre vs target (max 10)
  // min(intake/target, 1) * 10
  let fibreVsTarget = 0;
  if (targets.fiberTarget > 0) {
    fibreVsTarget = Math.min(intake.fiber / targets.fiberTarget, 1) * 10;
  }

  // 5. Micronutrients (max 30)
  // Iron, Ca, vitC, B12, vitD: 6pts each; exclude limited-data nutrients, rescale to 30
  const microList: Array<{ key: 'iron' | 'calcium' | 'vitC' | 'b12' | 'vitD'; targetKey: keyof NutrientTarget }> = [
    { key: 'iron', targetKey: 'iron' },
    { key: 'calcium', targetKey: 'calcium' },
    { key: 'vitC', targetKey: 'vitC' },
    { key: 'b12', targetKey: 'b12' },
    { key: 'vitD', targetKey: 'vitD' },
  ];

  let evaluatedCount = 0;
  let evaluatedScoreSum = 0;

  for (const { key, targetKey } of microList) {
    const coverage = intake.coverages?.[key];
    if (coverage && coverage.isLimitedData) {
      // Exclude limited-data nutrients from scoring
      continue;
    }
    evaluatedCount += 1;
    const targetVal = Number(targets[targetKey]) || 0;
    const intakeVal = intake[key] ?? 0;
    const ratio = targetVal > 0 ? Math.min(intakeVal / targetVal, 1) : 1;
    evaluatedScoreSum += ratio * 6;
  }

  let micronutrients = 0;
  if (evaluatedCount > 0) {
    micronutrients = (evaluatedScoreSum / (evaluatedCount * 6)) * 30;
  }

  // 6. Moderation (max 10: Sodium 4pts, added sugar 3pts, fried items 3pts)
  let sodiumScore = 4;
  if (targets.sodiumUpperGuide > 0 && (intake.sodium ?? 0) > targets.sodiumUpperGuide) {
    const excess = (intake.sodium ?? 0) - targets.sodiumUpperGuide;
    sodiumScore = Math.max(0, 4 * (1 - excess / targets.sodiumUpperGuide));
  }

  let sugarScore = 3;
  if (targets.addedSugarUpperGuide > 0 && (intake.addedSugar ?? 0) > targets.addedSugarUpperGuide) {
    const excess = (intake.addedSugar ?? 0) - targets.addedSugarUpperGuide;
    sugarScore = Math.max(0, 3 * (1 - excess / targets.addedSugarUpperGuide));
  }

  const friedCount = intake.friedItemCount ?? 0;
  const friedScore = Math.max(0, 3 - friedCount);

  const moderation = sodiumScore + sugarScore + friedScore;

  const total = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        calorieAdequacy +
          macroBalance +
          proteinVsTarget +
          fibreVsTarget +
          micronutrients +
          moderation
      )
    )
  );

  return {
    calorieAdequacy: Math.round(calorieAdequacy * 10) / 10,
    macroBalance: Math.round(macroBalance * 10) / 10,
    proteinVsTarget: Math.round(proteinVsTarget * 10) / 10,
    fibreVsTarget: Math.round(fibreVsTarget * 10) / 10,
    micronutrients: Math.round(micronutrients * 10) / 10,
    moderation: Math.round(moderation * 10) / 10,
    total,
  };
}

// Backward compatibility helper
export function calculateNutritionScore(
  intake: DailyIntake,
  profileOrTargets: Profile | NutrientTarget
): ScoreBreakdown {
  const targets =
    'kcalTarget' in profileOrTargets
      ? profileOrTargets
      : calculateNutrientTargets(profileOrTargets);
  return calculateScore(intake, targets);
}
