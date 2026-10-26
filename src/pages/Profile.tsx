import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnalysis } from '../state/AnalysisContext';
import type {
  Profile,
  Sex,
  ActivityLevel,
  Goal,
  DietType,
  Region,
  Allergen,
} from '../types';
import { calculateBMI, getBMICategory, calculateNutrientTargets } from '../engine/profile';
import { checkSafety } from '../engine/safety';
import ProgressStepper from '../components/ui/ProgressStepper';
import SafetyBanner from '../components/ui/SafetyBanner';
import BMICard from '../components/ui/BMICard';
import CalorieCard from '../components/ui/CalorieCard';
import { ChevronDown, ChevronUp, Lock } from 'lucide-react';

function formatCmToFeetInches(cm: number): string {
  if (!cm || cm < 50 || cm > 300) return '';
  const totalInches = cm / 2.54;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  return `${feet} ft ${inches} in`;
}

type HealthCondition = NonNullable<Profile['conditions']>[number];

const ALLERGEN_OPTIONS: { id: Allergen; label: string }[] = [
  { id: 'milk', label: 'Milk / Dairy' },
  { id: 'egg', label: 'Eggs' },
  { id: 'peanut', label: 'Peanuts' },
  { id: 'tree_nut', label: 'Tree nuts' },
  { id: 'gluten', label: 'Gluten / Wheat' },
  { id: 'fish', label: 'Fish / Seafood' },
  { id: 'soy', label: 'Soy' },
  { id: 'sesame', label: 'Sesame' },
];

const CONDITION_OPTIONS: { id: HealthCondition; label: string }[] = [
  { id: 'diabetes', label: 'Type 2 Diabetes' },
  { id: 'hypertension', label: 'Hypertension' },
  { id: 'thyroid', label: 'Thyroid' },
  { id: 'kidney_disease', label: 'Kidney Disease' },
  { id: 'celiac', label: 'Celiac Disease' },
  { id: 'lactose_intolerance', label: 'Lactose Intolerance' },
  { id: 'pcos', label: 'PCOS' },
  { id: 'diagnosed_anaemia', label: 'Diagnosed Anaemia' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectNotice = (location.state as { message?: string } | null)?.message;
  const { state, dispatch } = useAnalysis();
  const existing = state.profile;

  // Form state initialized with existing profile if any
  const [age, setAge] = useState<string>(existing?.age ? String(existing.age) : '');
  const [sex, setSex] = useState<Sex | ''>(existing?.sex || '');
  const [heightCm, setHeightCm] = useState<string>(
    existing?.heightCm ? String(existing.heightCm) : ''
  );
  const [weightKg, setWeightKg] = useState<string>(
    existing?.weightKg ? String(existing.weightKg) : ''
  );
  const [activity, setActivity] = useState<ActivityLevel | ''>(existing?.activity || '');
  const [goal, setGoal] = useState<Goal | ''>(existing?.goal || '');

  // Optional fields
  const [dietType, setDietType] = useState<DietType | ''>(existing?.dietType || '');
  const [region, setRegion] = useState<Region | ''>(existing?.region || '');
  const [occupation, setOccupation] = useState<
    'desk' | 'standing_light' | 'physical_labour' | 'shift_night' | 'student' | 'homemaker' | ''
  >(existing?.occupation || '');
  const [sunExposure, setSunExposure] = useState<'low' | 'moderate' | 'high' | ''>(
    existing?.sunExposure || ''
  );
  const [teaCoffeeCups, setTeaCoffeeCups] = useState<string>(
    existing?.teaCoffeeCupsPerDay !== undefined ? String(existing.teaCoffeeCupsPerDay) : ''
  );
  const [supplements, setSupplements] = useState<{
    iron: boolean;
    b12: boolean;
    vitD: boolean;
    calcium: boolean;
  }>({
    iron: !!existing?.takesSupplements?.iron,
    b12: !!existing?.takesSupplements?.b12,
    vitD: !!existing?.takesSupplements?.vitD,
    calcium: !!existing?.takesSupplements?.calcium,
  });
  const [allergies, setAllergies] = useState<Allergen[]>(existing?.allergies || []);
  const [conditions, setConditions] = useState<HealthCondition[]>(existing?.conditions || []);
  const [pregnancyStatus, setPregnancyStatus] = useState<'none' | 'pregnant' | 'breastfeeding'>(
    existing?.pregnancyStatus || 'none'
  );

  const [optionalOpen, setOptionalOpen] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Parse numeric values
  const parsedAge = age ? parseInt(age, 10) : NaN;
  const parsedHeight = heightCm ? parseFloat(heightCm) : NaN;
  const parsedWeight = weightKg ? parseFloat(weightKg) : NaN;
  const parsedTea = teaCoffeeCups !== '' ? parseInt(teaCoffeeCups, 10) : undefined;

  // Validation errors
  const errors = useMemo(() => {
    const errs: Record<string, string> = {};

    if (age !== '') {
      if (isNaN(parsedAge) || parsedAge < 13 || parsedAge > 100) {
        errs.age = 'Age must be between 13 and 100 years.';
      }
    } else if (touched.age) {
      errs.age = 'Please enter your age.';
    }

    if (heightCm !== '') {
      if (isNaN(parsedHeight) || parsedHeight < 120 || parsedHeight > 230) {
        errs.heightCm = 'Height must be between 120 and 230 cm.';
      }
    } else if (touched.heightCm) {
      errs.heightCm = 'Please enter your height in cm.';
    }

    if (weightKg !== '') {
      if (isNaN(parsedWeight) || parsedWeight < 25 || parsedWeight > 250) {
        errs.weightKg = 'Weight must be between 25 and 250 kg.';
      }
    } else if (touched.weightKg) {
      errs.weightKg = 'Please enter your weight in kg.';
    }

    if (teaCoffeeCups !== '' && (isNaN(parsedTea!) || parsedTea! < 0 || parsedTea! > 10)) {
      errs.teaCoffee = 'Cups must be between 0 and 10.';
    }

    return errs;
  }, [age, heightCm, weightKg, teaCoffeeCups, parsedAge, parsedHeight, parsedWeight, parsedTea, touched]);

  // Derived BMI
  const bmi = useMemo(() => {
    if (!isNaN(parsedWeight) && !isNaN(parsedHeight) && parsedHeight > 0) {
      return calculateBMI(parsedWeight, parsedHeight);
    }
    return 0;
  }, [parsedWeight, parsedHeight]);

  const isUnder18 = !isNaN(parsedAge) && parsedAge < 18;
  const isUnderweight = bmi > 0 && bmi < 18.5;

  const bmiCategory = useMemo(() => {
    if (bmi <= 0 || isUnder18) return null;
    return getBMICategory(bmi);
  }, [bmi, isUnder18]);

  // If user is under 18 or underweight and has 'lose' selected, automatically adjust
  React.useEffect(() => {
    if ((isUnder18 || isUnderweight) && goal === 'lose') {
      setGoal('maintain');
    }
  }, [isUnder18, isUnderweight, goal]);

  // Temporary profile for safety check and calorie estimate
  const currentProfile = useMemo<Profile | null>(() => {
    if (
      !isNaN(parsedAge) &&
      parsedAge >= 13 &&
      parsedAge <= 100 &&
      sex !== '' &&
      !isNaN(parsedHeight) &&
      parsedHeight >= 120 &&
      parsedHeight <= 230 &&
      !isNaN(parsedWeight) &&
      parsedWeight >= 25 &&
      parsedWeight <= 250 &&
      activity !== '' &&
      goal !== ''
    ) {
      return {
        age: parsedAge,
        sex,
        heightCm: parsedHeight,
        weightKg: parsedWeight,
        activity,
        goal,
        dietType: dietType || undefined,
        region: region || undefined,
        occupation: occupation || undefined,
        sunExposure: sunExposure || undefined,
        teaCoffeeCupsPerDay: parsedTea,
        takesSupplements: supplements,
        allergies: allergies.length > 0 ? allergies : undefined,
        conditions: conditions.length > 0 ? conditions : undefined,
        pregnancyStatus: sex === 'female' ? pregnancyStatus : 'none',
      };
    }
    return null;
  }, [
    parsedAge,
    sex,
    parsedHeight,
    parsedWeight,
    activity,
    goal,
    dietType,
    region,
    occupation,
    sunExposure,
    parsedTea,
    supplements,
    allergies,
    conditions,
    pregnancyStatus,
  ]);

  // Safety checks
  const safety = useMemo(() => {
    if (currentProfile) {
      return checkSafety(currentProfile);
    }
    // Partial safety check if age or conditions are present
    const partialBanners: string[] = [];
    if (!isNaN(parsedAge) && parsedAge < 13) {
      return {
        mode: 'blocked' as const,
        banners: [
          'NutriCheck is intended for individuals aged 13 and older. For young children, please consult a paediatrician.',
        ],
        disabledFeatures: ['analysis'],
      };
    }
    if (!isNaN(parsedAge) && parsedAge >= 13 && parsedAge < 18) {
      partialBanners.push(
        'Growing adolescents have unique nutritional requirements. Adult reference values may not apply — please consult a qualified healthcare professional.'
      );
    }
    if (sex === 'female' && pregnancyStatus !== 'none') {
      partialBanners.push(
        'Nutritional requirements during pregnancy and breastfeeding differ substantially. Recommendations are informational only — please consult your obstetrician or clinical dietitian.'
      );
    }
    if (conditions.includes('diabetes') || conditions.includes('kidney_disease')) {
      partialBanners.push(
        'You have selected a condition (diabetes or kidney disease) requiring personalized medical supervision. General nutritional advice is informational only; please consult your physician.'
      );
    }
    if (partialBanners.length > 0) {
      return {
        mode: 'informational' as const,
        banners: partialBanners,
        disabledFeatures: [],
      };
    }
    return null;
  }, [currentProfile, parsedAge, sex, pregnancyStatus, conditions]);

  // Calorie estimate
  const calorieTarget = useMemo(() => {
    if (!currentProfile) return null;
    try {
      const targets = calculateNutrientTargets(currentProfile);
      return targets.kcalTarget;
    } catch {
      return null;
    }
  }, [currentProfile]);

  const isValid =
    currentProfile !== null &&
    Object.keys(errors).length === 0 &&
    safety?.mode !== 'blocked';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || !currentProfile) return;

    dispatch({ type: 'SET_PROFILE', profile: currentProfile });
    dispatch({ type: 'SET_STEP', step: 2 });
    navigate('/analyze/meals');
  };

  const toggleAllergy = (allergenId: Allergen) => {
    setAllergies((prev) =>
      prev.includes(allergenId) ? prev.filter((a) => a !== allergenId) : [...prev, allergenId]
    );
  };

  const toggleCondition = (condId: HealthCondition) => {
    setConditions((prev) =>
      prev.includes(condId) ? prev.filter((c) => c !== condId) : [...prev, condId]
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6">
      <ProgressStepper currentStep={1} steps={['Profile', 'Meals', 'Results']} />

      {redirectNotice && (
        <div
          role="alert"
          className="mb-4 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 font-medium"
        >
          {redirectNotice}
        </div>
      )}

      {/* Header & Privacy Notice */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900 dark:text-white">
          About You
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Personalized Indian RDA targets based on ICMR-NIN 2020 &amp; 2024 guidelines.
        </p>
        <div className="mt-3 flex items-center gap-2 text-xs text-secondary-800 dark:text-secondary-300 bg-secondary-50 dark:bg-secondary-950/40 border border-secondary-200 dark:border-secondary-900 px-3 py-2 rounded-xl">
          <Lock className="w-3.5 h-3.5 shrink-0 text-secondary-600 dark:text-secondary-400" />
          <span>All data stays on your device — nothing is sent to any server.</span>
        </div>
      </div>

      {/* Dynamic Safety Banner */}
      {safety && <SafetyBanner banners={safety.banners} mode={safety.mode} />}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Core Measurements Card */}
        <div className="p-5 sm:p-6 bg-white dark:bg-gray-800 rounded-3xl border border-orange-100 dark:border-gray-700 shadow-sm space-y-5">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Basic Measurements
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Age */}
            <div>
              <label
                htmlFor="profile-age"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1"
              >
                Age (years) <span className="text-red-500">*</span>
              </label>
              <input
                id="profile-age"
                type="number"
                min={13}
                max={100}
                required
                value={age}
                onChange={(e) => setAge(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, age: true }))}
                aria-invalid={!!errors.age}
                aria-describedby={errors.age ? 'profile-age-error' : undefined}
                placeholder="e.g. 28"
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
                  errors.age
                    ? 'border-red-400 dark:border-red-500 focus:border-red-500'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              />
              {errors.age && (
                <p id="profile-age-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                  {errors.age}
                </p>
              )}
            </div>

            {/* Sex */}
            <div>
              <fieldset>
                <legend className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Biological Sex <span className="text-red-500">*</span>
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {(['male', 'female'] as const).map((s) => (
                    <label
                      key={s}
                      htmlFor={`profile-sex-${s}`}
                      className={`min-h-[44px] flex items-center justify-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium cursor-pointer transition-colors ${
                        sex === s
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-900 dark:text-primary-100 font-semibold ring-2 ring-primary-500 ring-offset-1'
                          : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <input
                        id={`profile-sex-${s}`}
                        type="radio"
                        name="sex"
                        value={s}
                        checked={sex === s}
                        onChange={() => setSex(s)}
                        className="sr-only"
                      />
                      <span className="capitalize">{s}</span>
                    </label>
                  ))}
                </div>
                <span className="block mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                  Used for ICMR-NIN reference metabolic values.
                </span>
              </fieldset>
            </div>

            {/* Height */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="profile-height"
                  className="block text-xs font-semibold text-gray-700 dark:text-gray-200"
                >
                  Height (cm) <span className="text-red-500">*</span>
                </label>
                {!isNaN(parsedHeight) && (
                  <span className="text-xs text-primary-700 dark:text-primary-300 font-medium">
                    {formatCmToFeetInches(parsedHeight)}
                  </span>
                )}
              </div>
              <input
                id="profile-height"
                type="number"
                min={120}
                max={230}
                step="0.5"
                required
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, heightCm: true }))}
                aria-invalid={!!errors.heightCm}
                aria-describedby={errors.heightCm ? 'profile-height-error' : undefined}
                placeholder="e.g. 165"
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
                  errors.heightCm
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              />
              {errors.heightCm && (
                <p id="profile-height-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                  {errors.heightCm}
                </p>
              )}
            </div>

            {/* Weight */}
            <div>
              <label
                htmlFor="profile-weight"
                className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1"
              >
                Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                id="profile-weight"
                type="number"
                min={25}
                max={250}
                step="0.1"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                onBlur={() => setTouched((p) => ({ ...p, weightKg: true }))}
                aria-invalid={!!errors.weightKg}
                aria-describedby={errors.weightKg ? 'profile-weight-error' : undefined}
                placeholder="e.g. 62"
                className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-sm bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
                  errors.weightKg
                    ? 'border-red-400 dark:border-red-500'
                    : 'border-gray-200 dark:border-gray-600'
                }`}
              />
              {errors.weightKg && (
                <p id="profile-weight-error" className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
                  {errors.weightKg}
                </p>
              )}
            </div>
          </div>

          {/* Live BMI & Calorie cards */}
          <div
            role="status"
            aria-live="polite"
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2"
          >
            <BMICard bmi={bmi} category={bmiCategory} age={parsedAge} />
            <CalorieCard target={calorieTarget} />
          </div>
        </div>

        {/* Activity Level Card */}
        <div className="p-5 sm:p-6 bg-white dark:bg-gray-800 rounded-3xl border border-orange-100 dark:border-gray-700 shadow-sm space-y-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Daily Physical Activity <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Select the option closest to your typical daily movement.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Physical Activity Level">
            {[
              {
                id: 'sedentary' as ActivityLevel,
                title: 'Sedentary',
                desc: 'Desk job, mostly sitting, little intentional exercise',
                icon: '🪑',
              },
              {
                id: 'light' as ActivityLevel,
                title: 'Lightly Active',
                desc: 'Walking, light housework, 1–2 light workouts/week',
                icon: '🚶🏽',
              },
              {
                id: 'moderate' as ActivityLevel,
                title: 'Moderately Active',
                desc: 'Regular exercise 3–5 days/week, active standing job',
                icon: '🏃🏽',
              },
              {
                id: 'very_active' as ActivityLevel,
                title: 'Very Active',
                desc: 'Heavy physical work or daily high-intensity training',
                icon: '🏋🏽',
              },
            ].map((item) => {
              const selected = activity === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setActivity(item.id)}
                  role="radio"
                  aria-checked={selected}
                  className={`min-h-[56px] text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
                    selected
                      ? 'border-primary-600 bg-primary-50/70 dark:bg-primary-950/40 ring-2 ring-primary-500 ring-offset-1'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <span className="text-2xl shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                      {item.title}
                    </span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400 leading-snug mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Goal Card */}
        <div className="p-5 sm:p-6 bg-white dark:bg-gray-800 rounded-3xl border border-orange-100 dark:border-gray-700 shadow-sm space-y-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Primary Dietary Goal <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Shapes calorie targets and macronutrient balance guidelines.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-label="Dietary Goal">
            {[
              {
                id: 'lose' as Goal,
                title: 'Lose weight',
                desc: 'Gentle calorie deficit (~500 kcal/day)',
                disabled: isUnder18 || isUnderweight,
                disabledReason: isUnder18
                  ? 'Not available for under-18s.'
                  : isUnderweight
                  ? 'For underweight users, please choose Maintain or Gain weight.'
                  : undefined,
              },
              {
                id: 'maintain' as Goal,
                title: 'Maintain weight',
                desc: 'Balance energy intake with daily expenditure',
                disabled: false,
              },
              {
                id: 'gain' as Goal,
                title: 'Gain weight',
                desc: 'Supportive surplus (~300 kcal/day) for muscle and health',
                disabled: false,
              },
              {
                id: 'analyze' as Goal,
                title: 'Just analyze my diet',
                desc: 'Focus on micronutrient gaps and diet quality without weight targets',
                disabled: false,
              },
            ]
              // Safety rule: Never show "Lose" as an option to under-17s
              .filter((g) => !(isUnder18 && g.id === 'lose'))
              .map((item) => {
                const selected = goal === item.id;
                return (
                  <button
                    type="button"
                    key={item.id}
                    disabled={item.disabled}
                    onClick={() => setGoal(item.id)}
                    role="radio"
                    aria-checked={selected}
                    aria-disabled={item.disabled}
                    className={`min-h-[56px] text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
                      item.disabled
                        ? 'opacity-40 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800'
                        : selected
                        ? 'border-primary-600 bg-primary-50/70 dark:bg-primary-950/40 ring-2 ring-primary-500 ring-offset-1'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-750 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div>
                      <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                        {item.title}
                      </span>
                      <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                        {item.desc}
                      </span>
                    </div>
                    {item.disabledReason && (
                      <span className="block text-[11px] text-amber-700 dark:text-amber-400 mt-1 font-medium">
                        {item.disabledReason}
                      </span>
                    )}
                  </button>
                );
              })}
          </div>
        </div>

        {/* Collapsible "Improve accuracy (optional)" section */}
        <div className="rounded-3xl border border-orange-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setOptionalOpen((prev) => !prev)}
            aria-expanded={optionalOpen}
            className="w-full min-h-[52px] p-5 flex items-center justify-between text-left hover:bg-orange-50/40 dark:hover:bg-gray-750 transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500"
          >
            <div>
              <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                Improve Accuracy (Optional)
              </span>
              <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Diet type, regional staples, allergies, conditions &amp; supplements
              </span>
            </div>
            <div className="text-gray-400 dark:text-gray-300 p-1">
              {optionalOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </button>

          {optionalOpen && (
            <div className="p-5 sm:p-6 border-t border-orange-100 dark:border-gray-700 space-y-5 bg-gray-50/40 dark:bg-gray-800/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Diet Type */}
                <div>
                  <label
                    htmlFor="profile-diet-type"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Diet Type
                  </label>
                  <select
                    id="profile-diet-type"
                    value={dietType}
                    onChange={(e) => setDietType(e.target.value as DietType | '')}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select diet preference</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="eggetarian">Eggetarian</option>
                    <option value="non_vegetarian">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="jain">Jain</option>
                  </select>
                </div>

                {/* Region */}
                <div>
                  <label
                    htmlFor="profile-region"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Region (Food Staples)
                  </label>
                  <select
                    id="profile-region"
                    value={region}
                    onChange={(e) => setRegion(e.target.value as Region | '')}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select region</option>
                    <option value="pan_indian">Pan-Indian</option>
                    <option value="north">North India</option>
                    <option value="south">South India</option>
                    <option value="east">East India</option>
                    <option value="west">West India</option>
                    <option value="central">Central India</option>
                    <option value="northeast">Northeast India</option>
                  </select>
                </div>

                {/* Occupation */}
                <div>
                  <label
                    htmlFor="profile-occupation"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Daily Occupation Pattern
                  </label>
                  <select
                    id="profile-occupation"
                    value={occupation}
                    onChange={(e) =>
                      setOccupation(
                        e.target.value as
                          | 'desk'
                          | 'standing_light'
                          | 'physical_labour'
                          | 'shift_night'
                          | 'student'
                          | 'homemaker'
                          | ''
                      )
                    }
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select occupation</option>
                    <option value="desk">Desk job</option>
                    <option value="standing_light">Standing (light)</option>
                    <option value="physical_labour">Physical labour</option>
                    <option value="shift_night">Night shift</option>
                    <option value="student">Student</option>
                    <option value="homemaker">Homemaker</option>
                  </select>
                </div>

                {/* Sun Exposure */}
                <div>
                  <label
                    htmlFor="profile-sun"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Sun Exposure (Vitamin D synthesis)
                  </label>
                  <select
                    id="profile-sun"
                    value={sunExposure}
                    onChange={(e) => setSunExposure(e.target.value as 'low' | 'moderate' | 'high' | '')}
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select sun exposure</option>
                    <option value="low">Low (&lt; 15 mins direct midday sun/day)</option>
                    <option value="moderate">Moderate (15–30 mins/day)</option>
                    <option value="high">High (&gt; 30 mins outdoor work/day)</option>
                  </select>
                </div>

                {/* Tea / Coffee cups */}
                <div>
                  <label
                    htmlFor="profile-tea"
                    className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1"
                  >
                    Tea / Coffee (cups per day)
                  </label>
                  <input
                    id="profile-tea"
                    type="number"
                    min={0}
                    max={10}
                    value={teaCoffeeCups}
                    onChange={(e) => setTeaCoffeeCups(e.target.value)}
                    placeholder="e.g. 2"
                    className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                  />
                  {errors.teaCoffee && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.teaCoffee}</p>
                  )}
                  <span className="block mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    Tannins in tea/coffee affect plant non-heme iron absorption.
                  </span>
                </div>

                {/* Pregnancy / Lactation status - only if sex === female */}
                {sex === 'female' && (
                  <div>
                    <label
                      htmlFor="profile-pregnancy"
                      className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1"
                    >
                      Pregnancy / Lactation Status
                    </label>
                    <select
                      id="profile-pregnancy"
                      value={pregnancyStatus}
                      onChange={(e) =>
                        setPregnancyStatus(e.target.value as 'none' | 'pregnant' | 'breastfeeding')
                      }
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 text-sm bg-white dark:bg-gray-750 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="none">Not applicable</option>
                      <option value="pregnant">Pregnant</option>
                      <option value="breastfeeding">Breastfeeding</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Supplements */}
              <div>
                <span className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Active Daily Supplements
                </span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                  If you take supplements, they won&apos;t be counted in your food analysis.
                </p>
                <div className="flex flex-wrap gap-2">
                  {(
                    [
                      { key: 'iron', label: 'Iron' },
                      { key: 'b12', label: 'Vitamin B12' },
                      { key: 'vitD', label: 'Vitamin D' },
                      { key: 'calcium', label: 'Calcium' },
                    ] as const
                  ).map((sup) => (
                    <label
                      key={sup.key}
                      htmlFor={`profile-sup-${sup.key}`}
                      className={`min-h-[44px] inline-flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                        supplements[sup.key]
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-800 dark:text-primary-200 font-semibold'
                          : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <input
                        id={`profile-sup-${sup.key}`}
                        type="checkbox"
                        checked={supplements[sup.key]}
                        onChange={(e) =>
                          setSupplements((p) => ({ ...p, [sup.key]: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span>{sup.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Allergies multi-select chips */}
              <div>
                <span className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Food Allergies &amp; Intolerances
                </span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                  Foods with these allergens will be filtered or marked with warning chips.
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALLERGEN_OPTIONS.map((item) => {
                    const active = allergies.includes(item.id);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleAllergy(item.id)}
                        aria-pressed={active}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
                          active
                            ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-semibold'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                        }`}
                      >
                        {item.label} {active ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Health conditions multi-select chips */}
              <div>
                <span className="block text-xs font-semibold text-gray-700 dark:text-gray-200 mb-1">
                  Clinical Health Conditions
                </span>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-2">
                  Triggers clinical safety banners and custom macro warnings.
                </p>
                <div className="flex flex-wrap gap-2">
                  {CONDITION_OPTIONS.map((item) => {
                    const active = conditions.includes(item.id);
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => toggleCondition(item.id)}
                        aria-pressed={active}
                        className={`min-h-[44px] px-3.5 py-2 rounded-xl border text-xs font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
                          active
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-950/40 text-primary-900 dark:text-primary-200 font-semibold'
                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                        }`}
                      >
                        {item.label} {active ? '✓' : '+'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {!isValid && (
              <span>Please fill in all required fields (marked with *) to proceed.</span>
            )}
          </div>
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full sm:w-auto min-h-[48px] px-8 py-3 rounded-2xl font-semibold text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
              isValid
                ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg active:scale-98'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue to Meals →
          </button>
        </div>
      </form>
    </div>
  );
}
