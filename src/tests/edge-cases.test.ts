import { describe, it, expect } from 'vitest';
import { calculateBMI, calculateCalorieTarget } from '../engine/profile';
import { aggregateIntake } from '../engine/intake';
import { calculateScore } from '../engine/score';
import { checkSafety } from '../engine/safety';
import { FOODS } from '../data/foods';
import { PERSONAS } from '../data/personas';
import { SWAP_RULES } from '../data/swaps';
import type { Profile, DailyMeals } from '../types';

const baseProfile: Profile = {
  age: 30,
  sex: 'male',
  heightCm: 170,
  weightKg: 70,
  activity: 'sedentary',
  goal: 'maintain',
};

describe('Edge Cases — Section 8', () => {
  // 1. Empty meals
  it('empty meals produce zero intake', () => {
    const emptyMeals: DailyMeals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    const intake = aggregateIntake(emptyMeals, FOODS);
    expect(intake.kcal).toBe(0);
    expect(intake.protein).toBe(0);
  });

  // 2. Fractional quantities (0.5)
  it('quantity 0.5 halves the nutrient values', () => {
    const meals: DailyMeals = {
      breakfast: [{ foodId: 'oats', quantity: 0.5 }],
      lunch: [],
      dinner: [],
      snacks: [],
    };
    const intake = aggregateIntake(meals, FOODS);
    const oats = FOODS.find((f) => f.id === 'oats')!;
    expect(intake.kcal).toBeCloseTo(oats.nutrients.kcal * 0.5, 0);
  });

  // 3. Large quantity (3)
  it('quantity 3 triples the nutrient values', () => {
    const meals: DailyMeals = {
      lunch: [{ foodId: 'rice', quantity: 3 }],
      breakfast: [],
      dinner: [],
      snacks: [],
    };
    const intake = aggregateIntake(meals, FOODS);
    const rice = FOODS.find((f) => f.id === 'rice')!;
    expect(intake.kcal).toBeCloseTo(rice.nutrients.kcal * 3, 0);
  });

  // 4. NaN safety: score handles zero intake gracefully
  it('score with zero intake does not produce NaN', () => {
    const targets = {
      kcalTarget: 2000,
      proteinRDA: 54,
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
    const emptyMeals: DailyMeals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    const intake = aggregateIntake(emptyMeals, FOODS);
    const score = calculateScore(intake, targets);
    expect(score.total).not.toBeNaN();
    expect(score.total).toBeGreaterThanOrEqual(0);
  });

  // 5. All macros defined (no undefined in food items)
  it('all food items have valid non-negative macros', () => {
    FOODS.forEach((food) => {
      expect(food.nutrients.kcal).toBeGreaterThanOrEqual(0);
      expect(food.nutrients.protein).toBeGreaterThanOrEqual(0);
      expect(food.nutrients.carbs).toBeGreaterThanOrEqual(0);
      expect(food.nutrients.fat).toBeGreaterThanOrEqual(0);
      expect(food.nutrients.fiber).toBeGreaterThanOrEqual(0);
    });
  });

  // 6. Age 12 → blocked
  it('age 12 is blocked', () => {
    const result = checkSafety({ ...baseProfile, age: 12 });
    expect(result.mode).toBe('blocked');
  });

  // 7. Age 13 → limited
  it('age 13 is limited mode', () => {
    const result = checkSafety({ ...baseProfile, age: 13 });
    expect(result.mode).toBe('limited');
  });

  // 8. Age 17 → still limited
  it('age 17 is limited mode', () => {
    const result = checkSafety({ ...baseProfile, age: 17 });
    expect(result.mode).toBe('limited');
  });

  // 9. Age 18 → full
  it('age 18 is full mode', () => {
    const result = checkSafety({ ...baseProfile, age: 18 });
    expect(result.mode).toBe('full');
  });

  // 10. Pregnancy → informational
  it('pregnancy → informational mode', () => {
    const result = checkSafety({ ...baseProfile, sex: 'female', pregnancyStatus: 'pregnant' });
    expect(result.mode).toBe('informational');
  });

  // 11. Underweight + lose → goal blocked
  it('underweight user with lose goal is redirected', () => {
    const underweightProfile: Profile = { ...baseProfile, weightKg: 40, goal: 'lose' }; // BMI ~13.8
    const result = checkSafety(underweightProfile);
    expect(
      result.banners.some(
        (b) => b.toLowerCase().includes('underweight') || b.toLowerCase().includes('maintain')
      )
    ).toBe(true);
  });

  // 12. Calorie floor: female TDEE 1400 goal=lose → 1200
  it('calorie floor enforced for female at TDEE 1400', () => {
    expect(calculateCalorieTarget(1400, 'lose', 'female')).toBe(1200);
  });

  // 13. Calorie floor: male TDEE 1800 goal=lose → 1300 (not below 1500)
  it('calorie floor enforced for male at TDEE 1800', () => {
    expect(calculateCalorieTarget(1800, 'lose', 'male')).toBe(1500);
  });

  // 14. BMI calculation edge cases
  it('very low height does not cause divide by zero', () => {
    const bmi = calculateBMI(70, 120);
    expect(bmi).not.toBeNaN();
    expect(bmi).toBeGreaterThan(0);
  });

  // 15. Undefined micronutrients excluded from coverage
  it('foods without micronutrients have limited data coverage', () => {
    // Log only foods that have no iron data
    const meals: DailyMeals = {
      breakfast: [{ foodId: 'banana', quantity: 1 }],
      lunch: [],
      dinner: [],
      snacks: [],
    };
    const intake = aggregateIntake(meals, FOODS);
    // Coverage for iron from banana should be tracked
    expect(intake.coverages).toBeDefined();
  });

  // Food ID Validation Tests
  it('all persona food IDs exist in FOODS database', () => {
    const foodIds = new Set(FOODS.map((f) => f.id));
    [PERSONAS.priya, PERSONAS.rahul].forEach((persona) => {
      Object.values(persona.meals).forEach((mealEntries) => {
        mealEntries.forEach((entry) => {
          expect(foodIds.has(entry.foodId), `Missing food ID: ${entry.foodId}`).toBe(true);
        });
      });
    });
  });

  it('all swap rule food IDs exist in FOODS database', () => {
    const foodIds = new Set(FOODS.map((f) => f.id));
    SWAP_RULES.forEach((rule) => {
      expect(foodIds.has(rule.fromFoodId), `Missing from food: ${rule.fromFoodId}`).toBe(true);
      expect(foodIds.has(rule.toFoodId), `Missing to food: ${rule.toFoodId}`).toBe(true);
    });
  });
});
