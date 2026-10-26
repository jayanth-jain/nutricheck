// src/constants/rda.ts
// Source: ICMR-NIN "Nutrient Requirements for Indians — RDA and EAR 2020"
// Source: ICMR-NIN "Dietary Guidelines for Indians 2024"

export interface RDAEntry {
  value: number;
  unit: string;
  source: string;
  year: number;
  status: 'confirmed' | 'verify';
  notes?: string;
}

export interface NutrientRDA {
  male: RDAEntry;
  female: RDAEntry;
}

export const RDA = {
  // Protein: 0.83 g/kg/day RDA; 1.0 g/kg/day practical target for cereal-based diets
  proteinPerKg: {
    male: { value: 0.83, unit: 'g/kg/day', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'confirmed' as const },
    female: { value: 0.83, unit: 'g/kg/day', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'confirmed' as const },
  },
  proteinPracticalPerKg: {
    male: { value: 1.0, unit: 'g/kg/day', source: 'ICMR-NIN Dietary Guidelines 2024 (cereal-based diet adjustment)', year: 2024, status: 'confirmed' as const },
    female: { value: 1.0, unit: 'g/kg/day', source: 'ICMR-NIN Dietary Guidelines 2024 (cereal-based diet adjustment)', year: 2024, status: 'confirmed' as const },
  },
  iron: {
    male: { value: 19, unit: 'mg/day', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'confirmed' as const },
    female: { value: 29, unit: 'mg/day', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'confirmed' as const },
  },
  calcium: {
    male: { value: 1000, unit: 'mg/day', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'confirmed' as const },
    female: { value: 1000, unit: 'mg/day', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'confirmed' as const },
  },
  iodine: {
    male: { value: 150, unit: 'µg/day', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'confirmed' as const },
    female: { value: 150, unit: 'µg/day', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'confirmed' as const },
  },
  folate: {
    male: { value: 300, unit: 'µg DFE/day', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'confirmed' as const },
    female: { value: 220, unit: 'µg DFE/day', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'confirmed' as const },
  },
  vitaminC: {
    male: { value: 80, unit: 'mg/day', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'verify' as const },
    female: { value: 65, unit: 'mg/day', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'verify' as const },
  },
  vitaminB12: {
    male: { value: 2.2, unit: 'µg/day', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'verify' as const },
    female: { value: 2.2, unit: 'µg/day', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'verify' as const },
  },
  vitaminD: {
    male: { value: 15, unit: 'µg/day (600 IU)', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'verify' as const },
    female: { value: 15, unit: 'µg/day (600 IU)', source: 'ICMR-NIN RDA 2020', year: 2020, status: 'verify' as const },
  },
  // Fibre: 40g per 2000 kcal; min 25g. Computed dynamically from calorie target.
  fibreBasePer2000kcal: {
    male: { value: 40, unit: 'g per 2000 kcal (min 25g)', source: 'ICMR-NIN Dietary Guidelines 2024', year: 2024, status: 'verify' as const },
    female: { value: 40, unit: 'g per 2000 kcal (min 25g)', source: 'ICMR-NIN Dietary Guidelines 2024', year: 2024, status: 'verify' as const },
  },
  // Limits (upper guides)
  sodiumUpperGuide: {
    male: { value: 2000, unit: 'mg/day', source: 'ICMR-NIN Dietary Guidelines 2024', year: 2024, status: 'verify' as const },
    female: { value: 2000, unit: 'mg/day', source: 'ICMR-NIN Dietary Guidelines 2024', year: 2024, status: 'verify' as const },
  },
  addedSugarUpperGuide: {
    male: { value: 25, unit: 'g/day', source: 'ICMR-NIN Dietary Guidelines 2024', year: 2024, status: 'verify' as const },
    female: { value: 25, unit: 'g/day', source: 'ICMR-NIN Dietary Guidelines 2024', year: 2024, status: 'verify' as const },
  },
  saltUpperGuide: {
    male: { value: 5, unit: 'g/day', source: 'ICMR-NIN Dietary Guidelines 2024', year: 2024, status: 'confirmed' as const },
    female: { value: 5, unit: 'g/day', source: 'ICMR-NIN Dietary Guidelines 2024', year: 2024, status: 'confirmed' as const },
  },
  // Energy distribution (informational)
  energyDistribution: {
    carbsMin: 45,
    carbsMax: 60,
    proteinMin: 10,
    proteinMax: 15,
    fatMin: 20,
    fatMax: 30,
    source: 'ICMR-NIN Dietary Guidelines 2024',
    year: 2024,
    status: 'verify' as const,
    unit: '% of energy',
  },
} as const;

// Reference body weights used by ICMR-NIN 2020 for RDA calculations
export const ICMR_REFERENCE_WEIGHTS = {
  male: { value: 65, unit: 'kg', source: 'ICMR-NIN RDA 2020', year: 2020 },
  female: { value: 55, unit: 'kg', source: 'ICMR-NIN RDA 2020', year: 2020 },
};

// Calorie floors (safety — never recommend below)
export const CALORIE_FLOOR = {
  female: { value: 1200, unit: 'kcal/day', source: 'Standard clinical practice', year: 2020, status: 'verify' as const },
  male: { value: 1500, unit: 'kcal/day', source: 'Standard clinical practice', year: 2020, status: 'verify' as const },
};

// Weight change goals
export const GOAL_ADJUSTMENTS = {
  deficitLose: { value: -500, unit: 'kcal/day', source: 'Standard clinical guideline (~0.5 kg/week)', year: 2020, status: 'verify' as const },
  surplusGain: { value: 300, unit: 'kcal/day', source: 'Standard clinical guideline', year: 2020, status: 'verify' as const },
};

// Meal distribution guidance
export const MEAL_DISTRIBUTION = {
  breakfast: { min: 20, max: 25, unit: '% of daily energy', source: 'ICMR-NIN Dietary Guidelines 2024', year: 2024, status: 'verify' as const },
  lunch: { min: 30, max: 35, unit: '% of daily energy', source: 'ICMR-NIN Dietary Guidelines 2024', year: 2024, status: 'verify' as const },
  dinner: { min: 25, max: 30, unit: '% of daily energy', source: 'ICMR-NIN Dietary Guidelines 2024', year: 2024, status: 'verify' as const },
  snacks: { min: 10, max: 15, unit: '% of daily energy', source: 'ICMR-NIN Dietary Guidelines 2024', year: 2024, status: 'verify' as const },
  dinnerHeavyThreshold: 40,
  breakfastLightThreshold: 12,
  snacksHeavyThreshold: 25,
};

// Activity multipliers for TDEE
export const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
} as const;

// BMI cutoffs (Asian Indian populations)
export const BMI_CUTOFFS = {
  underweight: { max: 18.5, label: 'Underweight' },
  healthy: { min: 18.5, max: 22.9, label: 'Healthy weight' },
  overweight: { min: 23, max: 24.9, label: 'Overweight' },
  obese: { min: 25, label: 'Obese' },
  source: 'Consensus guidelines for Asian Indian populations',
  year: 2009,
  status: 'confirmed' as const,
};

// Backward compatibility constants
export const RDA_PROTEIN_RDA = RDA.proteinPerKg.male;
export const RDA_PROTEIN_PRACTICAL = RDA.proteinPracticalPerKg.male;

// Build-time warning for verify entries
const verifyEntries: string[] = [];
function checkVerify(key: string, entry: { status: 'confirmed' | 'verify' }) {
  if (entry.status === 'verify') verifyEntries.push(key);
}

interface VerifyCandidate {
  status?: 'confirmed' | 'verify';
  male?: { status: 'confirmed' | 'verify' };
  female?: { status: 'confirmed' | 'verify' };
}

// Check all entries
Object.entries(RDA).forEach(([key, val]) => {
  const candidate = val as unknown as VerifyCandidate;
  if (candidate.male && candidate.female) {
    checkVerify(`${key}.male`, candidate.male);
    checkVerify(`${key}.female`, candidate.female);
  } else if (candidate.status) {
    checkVerify(key, candidate as { status: 'confirmed' | 'verify' });
  }
});
if (verifyEntries.length > 0 && typeof console !== 'undefined') {
  console.warn('[NutriCheck] The following RDA values have status=verify and should be confirmed against primary sources:', verifyEntries);
}
