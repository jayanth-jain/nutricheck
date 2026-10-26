import { describe, it, expect } from 'vitest';
import { runAnalysis } from '../engine/analysis';
import { PERSONAS } from '../data/personas';
import { generatePDFReport } from '../pdf/report';

describe('Phase 3 Results & Analysis Runner Tests', () => {
  it('Priya persona produces expected gaps', () => {
    const result = runAnalysis(PERSONAS.priya.profile, PERSONAS.priya.meals);
    // Priya should have iron likely_low or very_low
    const ironPct = ((result.intake.iron ?? 0) / result.targets.iron) * 100;
    expect(ironPct).toBeLessThan(80); // iron should be flagged
  });

  it('Rahul persona has dinner heavy insight', () => {
    const result = runAnalysis(PERSONAS.rahul.profile, PERSONAS.rahul.meals);
    // Rahul's dinner is heavy
    const dinnerKcal = result.intake.mealBreakdown.dinner.kcal;
    const totalKcal = result.intake.kcal;
    expect((dinnerKcal / totalKcal) * 100).toBeGreaterThan(40);
  });

  it('Score for empty meals is < 30', () => {
    const emptyMeals = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    const result = runAnalysis(PERSONAS.priya.profile, emptyMeals);
    expect(result.score.total).toBeLessThan(30);
  });

  it('Priya persona generates vegetarian top foods and swaps', () => {
    const result = runAnalysis(PERSONAS.priya.profile, PERSONAS.priya.meals);
    expect(result.swaps.length).toBeGreaterThan(0);
    // None of Priya's swaps should include meat or egg
    result.swaps.forEach((swap) => {
      expect(swap.toFood.dietTags).toContain('vegetarian');
      expect(swap.toFood.allergens).not.toContain('meat');
    });

    // Top foods for iron should respect Priya's vegetarian diet
    const topIron = result.topFoods.iron ?? [];
    expect(topIron.length).toBeGreaterThan(0);
    topIron.forEach((tf) => {
      expect(tf.food.dietTags).toContain('vegetarian');
    });
  });

  it('Rahul persona triggers sodium flag due to packaged namkeen', () => {
    const result = runAnalysis(PERSONAS.rahul.profile, PERSONAS.rahul.meals);
    expect(result.insights.sodiumFlags.length).toBeGreaterThan(0);
    const hasNamkeenOrPackaged = result.insights.sodiumFlags.some(
      (flag) => flag.includes('Namkeen') || flag.includes('sodium')
    );
    expect(hasNamkeenOrPackaged).toBe(true);
  });

  it('PDF report generates without throwing error', async () => {
    const result = runAnalysis(PERSONAS.priya.profile, PERSONAS.priya.meals);
    await expect(generatePDFReport(result)).resolves.not.toThrow();
  });
});
