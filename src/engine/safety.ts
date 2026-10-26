import type { Profile, SafetyResult } from '../types';
import { calculateBMI } from './profile';

export function checkSafety(profile: Profile): SafetyResult {
  const banners: string[] = [];
  const disabledFeatures: string[] = [];

  // 1. Age < 13: blocked
  if (profile.age < 13) {
    return {
      mode: 'blocked',
      banners: [
        'NutriCheck is intended for individuals aged 13 and older. For young children, please consult a paediatrician.',
      ],
      disabledFeatures: ['analysis', 'plan', 'scoring', 'deficit_goal', 'surplus_goal'],
    };
  }

  let mode: SafetyResult['mode'] = 'full';

  // 2. Age 13–17: limited
  if (profile.age < 18) {
    mode = 'limited';
    banners.push(
      'Growing adolescents have unique nutritional requirements. Adult reference values may not apply — please consult a qualified healthcare professional.'
    );
    disabledFeatures.push('deficit_goal', 'weight_loss_advice', 'adult_bmi');
  }

  // 3. Pregnancy / breastfeeding: informational
  if (
    profile.pregnancyStatus === 'pregnant' ||
    profile.pregnancyStatus === 'breastfeeding'
  ) {
    mode = 'informational';
    banners.push(
      'Nutritional requirements during pregnancy and breastfeeding differ substantially. Recommendations are informational only — please consult your obstetrician or clinical dietitian.'
    );
    disabledFeatures.push('plan', 'scoring', 'weight_loss_goals', 'deficit_goal');
  }

  // 4. Conditions: diabetes / kidney_disease: informational
  if (
    profile.conditions?.includes('diabetes') ||
    profile.conditions?.includes('kidney_disease')
  ) {
    mode = 'informational';
    banners.push(
      'You have selected a condition (diabetes or kidney disease) requiring personalized medical supervision. General nutritional advice is informational only; please consult your physician.'
    );
    disabledFeatures.push('plan', 'goal_calorie_advice', 'deficit_goal');
  }

  // 5. Underweight + goal=lose: block weight-loss goal
  const bmi = calculateBMI(profile.weightKg, profile.heightCm);
  if (bmi < 18.5 && profile.goal === 'lose') {
    banners.push('Weight loss is not recommended when your BMI indicates underweight.');
    if (!disabledFeatures.includes('deficit_goal')) {
      disabledFeatures.push('deficit_goal');
    }
  }

  return {
    mode,
    banners,
    disabledFeatures,
  };
}

// Backward compatibility alias
export function evaluateSafety(profile: Profile): SafetyResult {
  return checkSafety(profile);
}
