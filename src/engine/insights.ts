import type {
  DailyMeals,
  Profile,
  NutrientTarget,
  DailyIntake,
  FoodItem,
  Insight,
  StructuredInsights,
} from '../types';
import { FOODS } from '../data/foods';
import { MEAL_DISTRIBUTION } from '../constants/rda';
import { aggregateIntake } from './intake';
import { calculateNutrientTargets } from './profile';

export type { Insight, StructuredInsights };

export function getMealDistributionInsights(intake: DailyIntake): string[] {
  const insights: string[] = [];
  if (intake.kcal <= 0) return insights;

  const dinnerPct = (intake.mealBreakdown.dinner.kcal / intake.kcal) * 100;
  const breakfastPct = (intake.mealBreakdown.breakfast.kcal / intake.kcal) * 100;
  const snacksPct = (intake.mealBreakdown.snacks.kcal / intake.kcal) * 100;

  if (dinnerPct > MEAL_DISTRIBUTION.dinnerHeavyThreshold) {
    insights.push(
      `Dinner provides over 40% of your daily calories (${Math.round(dinnerPct)}%). Heavy late dinners may impact metabolic health and digestion.`
    );
  }

  if (breakfastPct < MEAL_DISTRIBUTION.breakfastLightThreshold) {
    insights.push(
      `Breakfast provides less than 12% of daily calories (${Math.round(breakfastPct)}%). A protein-rich breakfast can sustain energy levels through the morning.`
    );
  }

  if (snacksPct > MEAL_DISTRIBUTION.snacksHeavyThreshold) {
    insights.push(
      `Snacks contribute more than 25% of your total daily calories (${Math.round(snacksPct)}%). Consider swapping calorie-dense snacks for whole-food alternatives.`
    );
  }

  return insights;
}

export function generateInsights(
  meals: DailyMeals,
  profile: Profile,
  targets?: NutrientTarget,
  intake?: DailyIntake,
  foodDatabase: FoodItem[] = FOODS
): StructuredInsights {
  const foodMap = new Map<string, FoodItem>(foodDatabase.map((f) => [f.id, f]));
  const effectiveTargets = targets ?? calculateNutrientTargets(profile);
  const effectiveIntake = intake ?? aggregateIntake(meals, foodDatabase);

  const insights: Insight[] = [];
  const ironTips: string[] = [];
  const b12Tips: string[] = [];
  const vitDTips: string[] = [];
  const calciumTips: string[] = [];
  const sodiumFlags: string[] = [];
  const supplementNotes: Record<string, string> = {};

  // 1. Meal interaction rules: Tea/coffee with Iron vs Vitamin C with Iron
  const mealKeys: Array<keyof DailyMeals> = ['breakfast', 'lunch', 'dinner', 'snacks'];
  let teaIronWarningAdded = false;
  let vitCIronSynergyAdded = false;

  for (const mealKey of mealKeys) {
    const entries = meals[mealKey] || [];
    let hasTeaOrCoffee = false;
    let nonTeaIron = 0;
    let mealVitC = 0;

    for (const entry of entries) {
      if (entry.quantity <= 0) continue;
      const food = entry.custom
        ? { nutrients: entry.custom.nutrients, hasTeaOrCoffee: false }
        : foodMap.get(entry.foodId);
      if (!food) continue;

      if (food.hasTeaOrCoffee || entry.foodId === 'tea_with_milk' || entry.foodId === 'coffee_with_milk') {
        hasTeaOrCoffee = true;
      } else {
        nonTeaIron += (food.nutrients.iron ?? 0) * entry.quantity;
      }
      mealVitC += (food.nutrients.vitC ?? 0) * entry.quantity;
    }

    if (hasTeaOrCoffee && nonTeaIron >= 1.0 && !teaIronWarningAdded) {
      const msg =
        'Tannins and polyphenols in tea/coffee inhibit non-heme iron absorption by up to 60%. Try having tea/coffee at least 1 hour away from main meals.';
      insights.push({
        id: 'iron-tea-inhibition',
        type: 'warning',
        message: msg,
      });
      ironTips.push(msg);
      teaIronWarningAdded = true;
    }

    if (nonTeaIron >= 1.5 && mealVitC >= 10 && !vitCIronSynergyAdded) {
      const msg =
        'Pairing iron-rich foods with Vitamin C enhances non-heme iron absorption significantly. Excellent meal combination!';
      insights.push({
        id: 'iron-vitc-synergy',
        type: 'positive',
        message: msg,
      });
      ironTips.push(msg);
      vitCIronSynergyAdded = true;
    }
  }

  // 2. Vegetarian / Vegan with low iron
  const isPlantBased =
    profile.dietType === 'vegetarian' ||
    profile.dietType === 'vegan' ||
    profile.dietType === 'jain';

  if (isPlantBased && (effectiveIntake.iron ?? 0) < effectiveTargets.iron) {
    const msg =
      'Plant-based (non-heme) iron has lower bioavailability. Combine pulses and greens with vitamin C sources (lemon, amla, tomato) to boost absorption.';
    insights.push({
      id: 'plant-iron-bioavailability',
      type: 'info',
      message: msg,
    });
    ironTips.push(msg);
  }

  // 3. Low B12 in vegetarian/vegan/jain
  if (isPlantBased && (effectiveIntake.b12 ?? 0) < effectiveTargets.b12) {
    const msg =
      'Vitamin B12 is virtually absent in unfortified plant foods. Consider discussing B12 supplementation or fortified foods with your doctor.';
    insights.push({
      id: 'low-b12-guidance',
      type: 'warning',
      message: msg,
    });
    b12Tips.push(msg);
  } else if ((effectiveIntake.b12 ?? 0) < effectiveTargets.b12) {
    b12Tips.push('Include dairy, eggs, or fortified foods to support daily Vitamin B12 intake.');
  }

  // 4. Vitamin D & Sunlight
  if (profile.sunExposure === 'low') {
    const msg =
      'With low daily sunlight exposure, dietary intake alone rarely meets Vitamin D requirements. Consult a doctor regarding 25(OH)D testing and supplementation.';
    insights.push({
      id: 'vitd-sun-exposure',
      type: 'info',
      message: msg,
    });
    vitDTips.push(msg);
  } else if ((effectiveIntake.vitD ?? 0) < effectiveTargets.vitD) {
    const msg =
      'Most Indians get Vitamin D primarily from sunlight synthesis (15–20 minutes mid-day). Very few Indian foods naturally contain Vitamin D.';
    insights.push({
      id: 'vitd-diet-note',
      type: 'info',
      message: msg,
    });
    vitDTips.push(msg);
  }

  // 5. Calcium tips
  if ((effectiveIntake.calcium ?? 0) < effectiveTargets.calcium) {
    calciumTips.push(
      'Distribute calcium-rich foods like curd, milk, ragi, or sesame seeds across meals for optimal absorption.'
    );
  }

  // 6. Sodium spikes & Maggi / Namkeen check
  let hasHighSodiumItem = false;
  const specificHighSodiumLogged: string[] = [];
  for (const mealKey of mealKeys) {
    for (const entry of meals[mealKey] || []) {
      if (entry.quantity <= 0) continue;
      if (entry.foodId === 'maggi') {
        specificHighSodiumLogged.push('Instant Noodles (Maggi)');
      } else if (entry.foodId === 'namkeen') {
        specificHighSodiumLogged.push('Namkeen');
      }
      const food = entry.custom ? { nutrients: entry.custom.nutrients } : foodMap.get(entry.foodId);
      if (food && (food.nutrients.sodium ?? 0) >= 350) {
        hasHighSodiumItem = true;
      }
    }
  }

  if (hasHighSodiumItem || (effectiveIntake.sodium ?? 0) > effectiveTargets.sodiumUpperGuide) {
    const msg =
      'High sodium intake detected from packaged snacks or salty gravies. Keeping daily sodium under 2,000 mg supports healthy blood pressure.';
    insights.push({
      id: 'sodium-spike-warning',
      type: 'warning',
      message: msg,
    });
    sodiumFlags.push(msg);
  }

  if (specificHighSodiumLogged.length > 0) {
    const uniqueItems = Array.from(new Set(specificHighSodiumLogged)).join(' and ');
    const note = `Logged packaged items (${uniqueItems}) contribute heavily to sodium intake. Consider choosing lower-sodium alternatives.`;
    sodiumFlags.push(note);
  }

  // 7. Supplement notes
  if (profile.takesSupplements?.iron) {
    supplementNotes.iron = 'You take an iron supplement; this analysis counts food only.';
  }
  if (profile.takesSupplements?.b12) {
    supplementNotes.b12 = 'You take a Vitamin B12 supplement; this analysis counts food only.';
  }
  if (profile.takesSupplements?.vitD) {
    supplementNotes.vitD = 'You take a Vitamin D supplement; this analysis counts food only.';
  }
  if (profile.takesSupplements?.calcium) {
    supplementNotes.calcium = 'You take a Calcium supplement; this analysis counts food only.';
  }

  // 8. Meal distribution insights
  const distributionNotes = getMealDistributionInsights(effectiveIntake);
  distributionNotes.forEach((note, idx) => {
    insights.push({
      id: `meal-distribution-${idx}`,
      type: 'info',
      message: note,
    });
  });

  const generalInsights = insights.map((i) => i.message);

  const structured = Object.assign(insights, {
    ironTips,
    b12Tips,
    vitDTips,
    calciumTips,
    sodiumFlags,
    supplementNotes,
    mealDistribution: distributionNotes,
    generalInsights,
  });

  return structured as StructuredInsights;
}
