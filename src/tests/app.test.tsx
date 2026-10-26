import { describe, it, expect } from 'vitest';
import { calculateBMI, calculateBMR } from '../engine/profile';

describe('Phase 0 Sanity Tests', () => {
  it('calculates BMI correctly', () => {
    // 70 kg, 170 cm -> 70 / (1.7^2) = 24.221...
    expect(calculateBMI(70, 170)).toBeCloseTo(24.22, 1);
  });

  it('calculates BMR for male correctly using Mifflin-St Jeor', () => {
    // male age 30, 70 kg, 170 cm: 10*70 + 6.25*170 - 5*30 + 5 = 700 + 1062.5 - 150 + 5 = 1617.5
    const bmr = calculateBMR({
      age: 30,
      sex: 'male',
      heightCm: 170,
      weightKg: 70,
      activity: 'sedentary',
      goal: 'maintain',
    });
    expect(bmr).toBe(1617.5);
  });
});
