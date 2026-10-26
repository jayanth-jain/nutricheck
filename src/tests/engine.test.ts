import { describe, it, expect } from 'vitest';
import {
  calculateBMI,
  getBMICategory,
  getBMICategoryLabel,
  calculateBMR,
  calculateTDEE,
  calculateCalorieTarget,
  calculateNutrientTargets,
  getProteinReferenceWeight,
} from '../engine/profile';
import { aggregateIntake } from '../engine/intake';
import { calculateScore } from '../engine/score';
import { checkSafety } from '../engine/safety';
import { getSwaps } from '../engine/swaps';
import { getTopFoodsForNutrient } from '../engine/topFoods';
import { generateInsights, getMealDistributionInsights } from '../engine/insights';
import { getNutrientStatus, getScoreLabel } from '../constants/thresholds';
import { FOODS } from '../data/foods';
import type { Profile, DailyMeals, DailyIntake, NutrientTarget, FoodItem } from '../types';

// ==========================================
// 1. BMI Calculations
// ==========================================
describe('1. BMI Calculations', () => {
  it('bmi(70, 170) ≈ 24.2 → Overweight (Asian cutoffs)', () => {
    const bmi = calculateBMI(70, 170);
    expect(bmi).toBeCloseTo(24.22, 1);
    expect(getBMICategory(bmi)).toBe('overweight');
    expect(getBMICategoryLabel('overweight')).toBe('Overweight');
  });

  it('correctly categorizes underweight, healthy, and obese under Asian cutoffs', () => {
    // Underweight: < 18.5
    const bmiUnder = calculateBMI(45, 160); // 17.58
    expect(getBMICategory(bmiUnder)).toBe('underweight');
    expect(getBMICategoryLabel('underweight')).toBe('Underweight');

    // Healthy: 18.5 – 22.9
    const bmiHealthy = calculateBMI(55, 160); // 21.48
    expect(getBMICategory(bmiHealthy)).toBe('healthy');
    expect(getBMICategoryLabel('healthy')).toBe('Healthy weight');

    // Obese: >= 25.0
    const bmiObese = calculateBMI(80, 170); // 27.68
    expect(getBMICategory(bmiObese)).toBe('obese');
    expect(getBMICategoryLabel('obese')).toBe('Obese');
  });

  it('handles invalid or zero height gracefully', () => {
    expect(calculateBMI(70, 0)).toBe(0);
    expect(calculateBMI(70, -10)).toBe(0);
  });
});

// ==========================================
// 2. BMR + TDEE Calculations
// ==========================================
describe('2. BMR and TDEE Calculations', () => {
  it('male 30yo 70kg 170cm: BMR = 1617.5', () => {
    expect(calculateBMR('male', 70, 170, 30)).toBeCloseTo(1617.5, 0);
  });

  it('male sedentary TDEE ≈ 1941', () => {
    const bmr = calculateBMR('male', 70, 170, 30);
    expect(calculateTDEE(bmr, 'sedentary')).toBeCloseTo(1941, 0);
  });

  it('female 25yo 55kg 160cm: BMR = 1264', () => {
    expect(calculateBMR('female', 55, 160, 25)).toBeCloseTo(1264, 0);
  });

  it('female light TDEE ≈ 1738', () => {
    const bmr = calculateBMR('female', 55, 160, 25);
    expect(calculateTDEE(bmr, 'light')).toBeCloseTo(1738, 0);
  });

  it('calculates targets for male with correct rounded protein and fiber', () => {
    const profile: Profile = {
      age: 30,
      sex: 'male',
      heightCm: 170,
      weightKg: 70,
      activity: 'sedentary',
      goal: 'maintain',
    };
    const targets = calculateNutrientTargets(profile);
    expect(targets.kcalTarget).toBe(1941);
    // Male 70kg, BMI 24.22 < 25 -> ref weight = 70kg
    // proteinRDA = 70 * 0.83 = 58.1g
    expect(targets.proteinRDA).toBeCloseTo(58.1, 1);
    // practical = 70 * 1.0 = 70g
    expect(targets.proteinPractical).toBe(70);
    // fiber: 40 * 1941 / 2000 = 38.8g
    expect(targets.fiberTarget).toBeCloseTo(38.8, 1);
  });
});

// ==========================================
// 3. Calorie Floor Enforcement
// ==========================================
describe('3. Calorie Floor Enforcement', () => {
  it('female TDEE 1500 goal=lose → target 1200 (not 1000)', () => {
    // 1500 - 500 = 1000, but floor is 1200
    expect(calculateCalorieTarget(1500, 'lose', 'female')).toBe(1200);
  });

  it('male TDEE 1800 goal=lose → target 1500 (not 1300)', () => {
    // 1800 - 500 = 1300, but floor is 1500
    expect(calculateCalorieTarget(1800, 'lose', 'male')).toBe(1500);
  });

  it('applies deficit without floor clipping when safe', () => {
    // 2200 - 500 = 1700 (> 1200 floor)
    expect(calculateCalorieTarget(2200, 'lose', 'female')).toBe(1700);
  });

  it('applies surplus for weight gain', () => {
    // 2000 + 300 = 2300
    expect(calculateCalorieTarget(2000, 'gain', 'female')).toBe(2300);
  });
});

// ==========================================
// 4. Protein Target with High BMI (BMI >= 25)
// ==========================================
describe('4. Protein Target with High BMI', () => {
  it('90kg 170cm → ref weight = 72.25kg → RDA 59.97g, practical 72.25g', () => {
    // 90 / (1.7^2) = 31.14 >= 25 -> ref weight = 25 * 1.7 * 1.7 = 72.25kg
    const refWeight = getProteinReferenceWeight(90, 170);
    expect(refWeight).toBeCloseTo(72.25, 2);

    const profile: Profile = {
      age: 35,
      sex: 'male',
      heightCm: 170,
      weightKg: 90,
      activity: 'moderate',
      goal: 'lose',
    };
    const targets = calculateNutrientTargets(profile);
    expect(targets.proteinRDA).toBeCloseTo(60.0, 1); // 0.83 * 72.25 = 59.9675 -> rounded 60.0
    expect(targets.proteinPractical).toBeCloseTo(72.3, 1); // 1.0 * 72.25 = 72.25 -> rounded 72.3
  });

  it('uses actual weight when BMI is under 25', () => {
    // 65kg 170cm -> BMI = 22.49 < 25
    expect(getProteinReferenceWeight(65, 170)).toBe(65);
  });
});

// ==========================================
// 5. Intake Aggregation
// ==========================================
describe('5. Intake Aggregation', () => {
  it('aggregates intake with fractional quantities correctly', () => {
    const meals: DailyMeals = {
      breakfast: [],
      lunch: [
        { foodId: 'dal', quantity: 1.5, source: 'home' },
        { foodId: 'roti', quantity: 2.5, source: 'home' },
      ],
      dinner: [],
      snacks: [],
    };

    const intake = aggregateIntake(meals, FOODS);
    // dal: 150 kcal, 9g protein, 20g carbs, 3g fat, 4g fiber * 1.5 = 225 kcal, 13.5g P, 30g C, 4.5g F, 6g fiber
    // roti: 120 kcal, 4g protein, 20g carbs, 3g fat, 2g fiber * 2.5 = 300 kcal, 10g P, 50g C, 7.5g F, 5g fiber
    // total: 525 kcal, 23.5g protein, 80g carbs, 12g fat, 11g fiber
    expect(intake.kcal).toBe(525);
    expect(intake.protein).toBe(23.5);
    expect(intake.carbs).toBe(80);
    expect(intake.fat).toBe(12);
    expect(intake.fiber).toBe(11);

    // mealBreakdown check
    expect(intake.mealBreakdown.lunch.kcal).toBe(525);
    expect(intake.mealBreakdown.lunch.protein).toBe(23.5);
    expect(intake.mealBreakdown.breakfast.kcal).toBe(0);
  });

  it('tracks fried item count from meal entries', () => {
    const meals: DailyMeals = {
      breakfast: [{ foodId: 'samosa', quantity: 2, source: 'home' }],
      lunch: [],
      dinner: [],
      snacks: [{ foodId: 'namkeen', quantity: 1, source: 'home' }],
    };
    const intake = aggregateIntake(meals, FOODS);
    expect(intake.friedItemCount).toBe(3); // 2 samosas + 1 namkeen
  });

  it('handles custom foods seamlessly', () => {
    const meals: DailyMeals = {
      breakfast: [
        {
          foodId: 'custom-millet-bowl',
          quantity: 1,
          custom: {
            name: 'Millet Porridge',
            servingLabel: '1 bowl',
            isCustom: true,
            nutrients: {
              kcal: 180,
              protein: 6,
              carbs: 32,
              fat: 2,
              fiber: 4,
              iron: 2.5,
              calcium: 30,
            },
          },
        },
      ],
      lunch: [],
      dinner: [],
      snacks: [],
    };
    const intake = aggregateIntake(meals, FOODS);
    expect(intake.kcal).toBe(180);
    expect(intake.protein).toBe(6);
    expect(intake.iron).toBe(2.5);
  });
});

// ==========================================
// 6. Micronutrient Coverage Tracking
// ==========================================
describe('6. Micronutrient Coverage Tracking', () => {
  it('excludes undefined micronutrients from coverage and flags isLimitedData (<0.6)', () => {
    const mockFoods: FoodItem[] = [
      {
        id: 'food_with_iron',
        name: 'Iron Rich Item',
        emoji: '🌿',
        category: 'main',
        servingLabel: '1 serving',
        nutrients: { kcal: 100, protein: 5, carbs: 15, fat: 2, fiber: 2, iron: 3.0 },
        dataQuality: { kcal: 'ifct', iron: 'estimate' },
        dietTags: ['vegetarian'],
        allergens: [],
        region: ['pan_indian'],
      },
      {
        id: 'food_without_iron',
        name: 'Item Missing Iron',
        emoji: '🍞',
        category: 'main',
        servingLabel: '1 serving',
        nutrients: { kcal: 100, protein: 3, carbs: 20, fat: 1, fiber: 1 }, // iron is undefined!
        dataQuality: { kcal: 'ifct' },
        dietTags: ['vegetarian'],
        allergens: [],
        region: ['pan_indian'],
      },
    ];

    const meals: DailyMeals = {
      breakfast: [{ foodId: 'food_with_iron', quantity: 1 }],
      lunch: [
        { foodId: 'food_without_iron', quantity: 1 },
        { foodId: 'food_without_iron', quantity: 1 },
      ],
      dinner: [],
      snacks: [],
    };

    const intake = aggregateIntake(meals, mockFoods);
    // 3 logged items, only 1 has iron data -> coverage = 1 / 3 ≈ 0.33 (< 0.6)
    expect(intake.coverages.iron?.coverage).toBeCloseTo(0.33, 2);
    expect(intake.coverages.iron?.isLimitedData).toBe(true);

    // Kcal has 3 / 3 = 1.0 coverage
    expect(intake.coverages.kcal?.coverage).toBe(1.0);
    expect(intake.coverages.kcal?.isLimitedData).toBe(false);
  });
});

// ==========================================
// 7. Score Monotonicity & Scoring Engine
// ==========================================
describe('7. Score Monotonicity & Scoring Engine', () => {
  const dummyTargets: NutrientTarget = {
    kcalTarget: 2000,
    proteinRDA: 55,
    proteinPractical: 65,
    fiberTarget: 40,
    iron: 19,
    calcium: 1000,
    vitC: 80,
    b12: 2.2,
    vitD: 15,
    sodiumUpperGuide: 2000,
    addedSugarUpperGuide: 25,
  };

  function createMockIntake(overrides: Partial<DailyIntake>): DailyIntake {
    return {
      kcal: 2000,
      protein: 50,
      carbs: 275,
      fat: 60,
      fiber: 25,
      iron: 15,
      calcium: 800,
      vitC: 60,
      b12: 1.8,
      vitD: 10,
      sodium: 1800,
      addedSugar: 20,
      friedItemCount: 0,
      mealBreakdown: {
        breakfast: { kcal: 500, protein: 12, carbs: 70, fat: 15, fiber: 6 },
        lunch: { kcal: 700, protein: 20, carbs: 95, fat: 20, fiber: 9 },
        dinner: { kcal: 600, protein: 15, carbs: 80, fat: 20, fiber: 8 },
        snacks: { kcal: 200, protein: 3, carbs: 30, fat: 5, fiber: 2 },
      },
      coverages: {},
      ...overrides,
    };
  }

  it('score monotonicity: adding protein never reduces protein component', () => {
    const intake1 = createMockIntake({ protein: 40 });
    const intake2 = createMockIntake({ protein: 50 });
    const intake3 = createMockIntake({ protein: 65 });
    const intake4 = createMockIntake({ protein: 80 });

    const score1 = calculateScore(intake1, dummyTargets);
    const score2 = calculateScore(intake2, dummyTargets);
    const score3 = calculateScore(intake3, dummyTargets);
    const score4 = calculateScore(intake4, dummyTargets);

    expect(score2.proteinVsTarget).toBeGreaterThanOrEqual(score1.proteinVsTarget);
    expect(score3.proteinVsTarget).toBeGreaterThanOrEqual(score2.proteinVsTarget);
    expect(score4.proteinVsTarget).toBe(15); // capped at max 15
  });

  it('score monotonicity: adding fibre never reduces fibre component', () => {
    const intake1 = createMockIntake({ fiber: 20 });
    const intake2 = createMockIntake({ fiber: 30 });
    const intake3 = createMockIntake({ fiber: 40 });
    const intake4 = createMockIntake({ fiber: 55 });

    const score1 = calculateScore(intake1, dummyTargets);
    const score2 = calculateScore(intake2, dummyTargets);
    const score3 = calculateScore(intake3, dummyTargets);
    const score4 = calculateScore(intake4, dummyTargets);

    expect(score2.fibreVsTarget).toBeGreaterThanOrEqual(score1.fibreVsTarget);
    expect(score3.fibreVsTarget).toBeGreaterThanOrEqual(score2.fibreVsTarget);
    expect(score4.fibreVsTarget).toBe(10); // capped at max 10
  });

  it('caloric adequacy yields 20 points for 0.9 <= r <= 1.1 and drops smoothly', () => {
    // Exactly on target (2000 / 2000 = 1.0)
    const onTarget = calculateScore(createMockIntake({ kcal: 2000 }), dummyTargets);
    expect(onTarget.calorieAdequacy).toBe(20);

    // At 0.95 ratio
    const closeTarget = calculateScore(createMockIntake({ kcal: 1900 }), dummyTargets);
    expect(closeTarget.calorieAdequacy).toBe(20);

    // Below 0.5 ratio -> 0 points
    const veryLow = calculateScore(createMockIntake({ kcal: 900 }), dummyTargets); // 0.45 ratio
    expect(veryLow.calorieAdequacy).toBe(0);

    // Above 1.5 ratio -> 0 points
    const veryHigh = calculateScore(createMockIntake({ kcal: 3200 }), dummyTargets); // 1.6 ratio
    expect(veryHigh.calorieAdequacy).toBe(0);
  });
});

// ==========================================
// 8. Status and Score Thresholds
// ==========================================
describe('8. Status and Score Thresholds', () => {
  it('verifies status thresholds at 49%, 50%, 79%, 80%', () => {
    expect(getNutrientStatus(49)).toBe('very_low');
    expect(getNutrientStatus(49.9)).toBe('very_low');
    expect(getNutrientStatus(50)).toBe('likely_low');
    expect(getNutrientStatus(79)).toBe('likely_low');
    expect(getNutrientStatus(79.9)).toBe('likely_low');
    expect(getNutrientStatus(80)).toBe('adequate');
    expect(getNutrientStatus(120)).toBe('adequate');
  });

  it('verifies score labels for good, needs_attention, and needs_a_lot', () => {
    expect(getScoreLabel(80).label).toBe('Good');
    expect(getScoreLabel(95).label).toBe('Good');
    expect(getScoreLabel(79).label).toBe('Needs attention');
    expect(getScoreLabel(50).label).toBe('Needs attention');
    expect(getScoreLabel(49).label).toBe('Needs a lot of attention');
    expect(getScoreLabel(20).label).toBe('Needs a lot of attention');
  });
});

// ==========================================
// 9. Safety Rules Engine
// ==========================================
describe('9. Safety Rules Engine', () => {
  const baseProfile: Profile = {
    age: 25,
    sex: 'female',
    heightCm: 160,
    weightKg: 55,
    activity: 'moderate',
    goal: 'maintain',
  };

  it('age 12 → blocked', () => {
    const safety = checkSafety({ ...baseProfile, age: 12 });
    expect(safety.mode).toBe('blocked');
    expect(safety.banners.length).toBeGreaterThan(0);
    expect(safety.disabledFeatures).toContain('scoring');
  });

  it('age 16 → limited (no calorie deficit, no adult BMI)', () => {
    const safety = checkSafety({ ...baseProfile, age: 16 });
    expect(safety.mode).toBe('limited');
    expect(safety.disabledFeatures).toContain('deficit_goal');
    expect(safety.disabledFeatures).toContain('adult_bmi');
  });

  it('pregnant/breastfeeding → informational mode (no diet plan, no score)', () => {
    const safety = checkSafety({
      ...baseProfile,
      pregnancyStatus: 'pregnant',
    });
    expect(safety.mode).toBe('informational');
    expect(safety.disabledFeatures).toContain('plan');
    expect(safety.disabledFeatures).toContain('scoring');
  });

  it('diabetes or kidney_disease → informational mode', () => {
    const safety = checkSafety({
      ...baseProfile,
      conditions: ['diabetes'],
    });
    expect(safety.mode).toBe('informational');
    expect(safety.disabledFeatures).toContain('plan');
  });

  it('underweight (BMI < 18.5) + goal=lose → deficit goal blocked', () => {
    // 40kg, 160cm -> BMI = 15.62 (< 18.5)
    const safety = checkSafety({
      ...baseProfile,
      weightKg: 40,
      heightCm: 160,
      goal: 'lose',
    });
    expect(safety.disabledFeatures).toContain('deficit_goal');
    expect(safety.banners.some((b) => b.includes('underweight'))).toBe(true);
  });
});

// ==========================================
// 10. Smart Swaps Engine
// ==========================================
describe('10. Smart Swaps Engine', () => {
  const baseProfile: Profile = {
    age: 28,
    sex: 'female',
    heightCm: 160,
    weightKg: 55,
    activity: 'sedentary',
    goal: 'maintain',
    dietType: 'vegetarian',
  };

  it('no swap when from-food is not logged in meals', () => {
    const meals: DailyMeals = {
      breakfast: [{ foodId: 'oats', quantity: 1 }],
      lunch: [{ foodId: 'roti', quantity: 2 }],
      dinner: [],
      snacks: [],
    };
    const swaps = getSwaps(meals, baseProfile, FOODS);
    // Rice was not logged, so rice->brown_rice swap should NOT appear
    expect(swaps.some((s) => s.fromFood.id === 'rice')).toBe(false);
  });

  it('produces swap with delta when from-food is logged', () => {
    const meals: DailyMeals = {
      breakfast: [],
      lunch: [{ foodId: 'rice', quantity: 2 }],
      dinner: [],
      snacks: [],
    };
    const swaps = getSwaps(meals, baseProfile, FOODS);
    const riceSwap = swaps.find((s) => s.fromFood.id === 'rice');
    expect(riceSwap).toBeDefined();
    expect(riceSwap?.toFood.id).toBe('brown_rice');
    // Brown rice has 3g fiber, white rice has 1g fiber -> delta = +2g
    expect(riceSwap?.delta.fiber).toBe(2);
  });

  it('vegan user never receives dairy or egg swaps', () => {
    const veganProfile: Profile = { ...baseProfile, dietType: 'vegan' };
    const meals: DailyMeals = {
      breakfast: [],
      lunch: [{ foodId: 'samosa', quantity: 1 }],
      dinner: [],
      snacks: [],
    };
    const swaps = getSwaps(meals, veganProfile, FOODS);
    swaps.forEach((swap) => {
      expect(swap.toFood.dietTags).toContain('vegan');
      expect(swap.toFood.allergens).not.toContain('milk');
      expect(swap.toFood.allergens).not.toContain('egg');
    });
  });

  it('user with celiac condition never receives gluten swaps', () => {
    const celiacProfile: Profile = {
      ...baseProfile,
      conditions: ['celiac'],
      allergies: ['gluten'],
    };
    const meals: DailyMeals = {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [{ foodId: 'namkeen', quantity: 1 }],
    };
    const swaps = getSwaps(meals, celiacProfile, FOODS);
    swaps.forEach((swap) => {
      expect(swap.toFood.containsGluten).toBeFalsy();
      expect(swap.toFood.allergens).not.toContain('gluten');
    });
  });
});

// ==========================================
// 11. Top Foods Ranking
// ==========================================
describe('11. Top Foods Ranking Engine', () => {
  it('ranks foods by nutrient per serving and tie-breaks by nutrient per 100 kcal', () => {
    const profile: Profile = {
      age: 30,
      sex: 'male',
      heightCm: 175,
      weightKg: 70,
      activity: 'moderate',
      goal: 'maintain',
    };
    const topProtein = getTopFoodsForNutrient('protein', profile, 5, FOODS);
    expect(topProtein.length).toBe(5);

    for (let i = 0; i < topProtein.length - 1; i++) {
      const curr = topProtein[i]!;
      const next = topProtein[i + 1]!;
      if (curr.nutrientPerServing === next.nutrientPerServing) {
        expect(curr.nutrientPer100kcal).toBeGreaterThanOrEqual(next.nutrientPer100kcal);
      } else {
        expect(curr.nutrientPerServing).toBeGreaterThanOrEqual(next.nutrientPerServing);
      }
    }
  });

  it('respects vegan diet filter strictly', () => {
    const veganProfile: Profile = {
      age: 26,
      sex: 'female',
      heightCm: 165,
      weightKg: 58,
      activity: 'sedentary',
      goal: 'maintain',
      dietType: 'vegan',
    };
    const topCalcium = getTopFoodsForNutrient('calcium', veganProfile, 5, FOODS);
    topCalcium.forEach((item) => {
      expect(item.food.dietTags).toContain('vegan');
      expect(item.food.allergens).not.toContain('milk');
    });
  });

  it('respects peanut and nut allergies strictly', () => {
    const allergyProfile: Profile = {
      age: 25,
      sex: 'male',
      heightCm: 170,
      weightKg: 68,
      activity: 'sedentary',
      goal: 'maintain',
      allergies: ['peanut', 'tree_nut'],
    };
    const topProtein = getTopFoodsForNutrient('protein', allergyProfile, 10, FOODS);
    topProtein.forEach((item) => {
      expect(item.food.allergens).not.toContain('peanut');
      expect(item.food.allergens).not.toContain('tree_nut');
    });
  });
});

// ==========================================
// 12. Food Database Validation & Integrity
// ==========================================
describe('12. Food Database Integrity and Spec Compliance', () => {
  it('contains exactly the 46 foods defined in the specification', () => {
    expect(FOODS.length).toBe(46);
  });

  it('every food has valid positive macros and non-negative micronutrients', () => {
    FOODS.forEach((food) => {
      expect(food.nutrients.kcal).toBeGreaterThan(0);
      expect(food.nutrients.protein).toBeGreaterThanOrEqual(0);
      expect(food.nutrients.carbs).toBeGreaterThanOrEqual(0);
      expect(food.nutrients.fat).toBeGreaterThanOrEqual(0);
      expect(food.nutrients.fiber).toBeGreaterThanOrEqual(0);

      // Verify no negative micronutrient numbers
      if (food.nutrients.iron !== undefined) expect(food.nutrients.iron).toBeGreaterThanOrEqual(0);
      if (food.nutrients.calcium !== undefined) expect(food.nutrients.calcium).toBeGreaterThanOrEqual(0);
      if (food.nutrients.vitC !== undefined) expect(food.nutrients.vitC).toBeGreaterThanOrEqual(0);
      if (food.nutrients.b12 !== undefined) expect(food.nutrients.b12).toBeGreaterThanOrEqual(0);
      if (food.nutrients.vitD !== undefined) expect(food.nutrients.vitD).toBeGreaterThanOrEqual(0);
      if (food.nutrients.sodium !== undefined) expect(food.nutrients.sodium).toBeGreaterThanOrEqual(0);
      if (food.nutrients.addedSugar !== undefined) expect(food.nutrients.addedSugar).toBeGreaterThanOrEqual(0);
    });
  });

  it('CRITICAL RULE: B12 must be 0 for ALL plant-based foods', () => {
    const animalFoodIds = new Set([
      'egg_omelette',
      'egg_curry',
      'chicken_curry',
      'fish_curry',
      'glass_of_milk',
      'curd',
      'raita',
      'paneer_sabzi',
      'palak_paneer',
      'lassi_sweet',
      'buttermilk',
      'tea_with_milk',
      'coffee_with_milk',
      'cornflakes_milk',
      'bread_toast',
      'biryani',
    ]);

    FOODS.forEach((food) => {
      if (!animalFoodIds.has(food.id)) {
        expect(
          food.nutrients.b12,
          `Food ${food.name} (${food.id}) is plant-based and must have b12=0`
        ).toBe(0);
      }
    });
  });

  it('all foods have non-empty dietTags, region, category, and servingLabel', () => {
    FOODS.forEach((food) => {
      expect(food.dietTags.length).toBeGreaterThan(0);
      expect(food.region.length).toBeGreaterThan(0);
      expect(food.category).toBeDefined();
      expect(food.servingLabel.trim().length).toBeGreaterThan(0);
    });
  });

  it('verifies exact macro values from specification for key Indian foods', () => {
    const poha = FOODS.find((f) => f.id === 'poha')!;
    expect(poha.nutrients).toMatchObject({ kcal: 250, protein: 5, carbs: 45, fat: 6, fiber: 3 });

    const dal = FOODS.find((f) => f.id === 'dal')!;
    expect(dal.nutrients).toMatchObject({ kcal: 150, protein: 9, carbs: 20, fat: 3, fiber: 4 });

    const samosa = FOODS.find((f) => f.id === 'samosa')!;
    expect(samosa.nutrients).toMatchObject({ kcal: 260, protein: 4, carbs: 30, fat: 14, fiber: 2 });
    expect(samosa.isFried).toBe(true);

    const maggi = FOODS.find((f) => f.id === 'maggi')!;
    expect(maggi.nutrients).toMatchObject({ kcal: 350, protein: 8, carbs: 45, fat: 15, fiber: 2 });
  });
});

// ==========================================
// 13. Insights and Interaction Rules
// ==========================================
describe('13. Insights and Interaction Rules', () => {
  it('triggers warning when tea/coffee is consumed in same meal with iron', () => {
    const profile: Profile = {
      age: 28,
      sex: 'female',
      heightCm: 160,
      weightKg: 58,
      activity: 'sedentary',
      goal: 'analyze',
    };
    const meals: DailyMeals = {
      breakfast: [
        { foodId: 'tea_with_milk', quantity: 1 },
        { foodId: 'poha', quantity: 1 }, // poha has 2.0mg iron
      ],
      lunch: [],
      dinner: [],
      snacks: [],
    };
    const insights = generateInsights(meals, profile);
    const teaWarning = insights.find((i) => i.id === 'iron-tea-inhibition');
    expect(teaWarning).toBeDefined();
    expect(teaWarning?.type).toBe('warning');
  });

  it('triggers positive synergy note when high iron is paired with vitamin C', () => {
    const profile: Profile = {
      age: 28,
      sex: 'female',
      heightCm: 160,
      weightKg: 58,
      activity: 'sedentary',
      goal: 'analyze',
    };
    const meals: DailyMeals = {
      breakfast: [],
      lunch: [
        { foodId: 'dal', quantity: 1 }, // dal has 2.5mg iron
        { foodId: 'salad', quantity: 1 }, // salad has 18mg vitC
      ],
      dinner: [],
      snacks: [],
    };
    const insights = generateInsights(meals, profile);
    const synergy = insights.find((i) => i.id === 'iron-vitc-synergy');
    expect(synergy).toBeDefined();
    expect(synergy?.type).toBe('positive');
  });

  it('triggers meal distribution warnings when dinner is over 40%', () => {
    const mockIntake: DailyIntake = {
      kcal: 2000,
      protein: 50,
      carbs: 250,
      fat: 60,
      fiber: 25,
      coverages: {},
      friedItemCount: 0,
      mealBreakdown: {
        breakfast: { kcal: 200, protein: 5, carbs: 30, fat: 5, fiber: 2 },
        lunch: { kcal: 500, protein: 15, carbs: 70, fat: 15, fiber: 8 },
        dinner: { kcal: 1100, protein: 25, carbs: 130, fat: 35, fiber: 12 }, // 55% of calories!
        snacks: { kcal: 200, protein: 5, carbs: 20, fat: 5, fiber: 3 },
      },
    };
    const notes = getMealDistributionInsights(mockIntake);
    expect(notes.some((n) => n.includes('Dinner provides over 40%'))).toBe(true);
  });
});
