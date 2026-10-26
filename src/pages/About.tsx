import { RDA, ACTIVITY_MULTIPLIERS } from '../constants/rda';
import { ShieldCheck, Info, AlertTriangle, BookOpen, Calculator, Sparkles, ExternalLink, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ReferenceRow {
  nutrient: string;
  men: string;
  women: string;
  status: 'confirmed' | 'verify';
  source: string;
}

const REFERENCE_TABLE: ReferenceRow[] = [
  {
    nutrient: 'Iron',
    men: `${RDA.iron.male.value} ${RDA.iron.male.unit}`,
    women: `${RDA.iron.female.value} ${RDA.iron.female.unit}`,
    status: RDA.iron.male.status,
    source: RDA.iron.male.source,
  },
  {
    nutrient: 'Calcium',
    men: `${RDA.calcium.male.value} ${RDA.calcium.male.unit}`,
    women: `${RDA.calcium.female.value} ${RDA.calcium.female.unit}`,
    status: RDA.calcium.male.status,
    source: RDA.calcium.male.source,
  },
  {
    nutrient: 'Protein (Physiological RDA)',
    men: `${RDA.proteinPerKg.male.value} ${RDA.proteinPerKg.male.unit}`,
    women: `${RDA.proteinPerKg.female.value} ${RDA.proteinPerKg.female.unit}`,
    status: RDA.proteinPerKg.male.status,
    source: RDA.proteinPerKg.male.source,
  },
  {
    nutrient: 'Protein (Practical Target)',
    men: `${RDA.proteinPracticalPerKg.male.value} ${RDA.proteinPracticalPerKg.male.unit}`,
    women: `${RDA.proteinPracticalPerKg.female.value} ${RDA.proteinPracticalPerKg.female.unit}`,
    status: RDA.proteinPracticalPerKg.male.status,
    source: RDA.proteinPracticalPerKg.male.source,
  },
  {
    nutrient: 'Iodine',
    men: `${RDA.iodine.male.value} ${RDA.iodine.male.unit}`,
    women: `${RDA.iodine.female.value} ${RDA.iodine.female.unit}`,
    status: RDA.iodine.male.status,
    source: RDA.iodine.male.source,
  },
  {
    nutrient: 'Folate',
    men: `${RDA.folate.male.value} ${RDA.folate.male.unit}`,
    women: `${RDA.folate.female.value} ${RDA.folate.female.unit}`,
    status: RDA.folate.male.status,
    source: RDA.folate.male.source,
  },
  {
    nutrient: 'Vitamin C',
    men: `${RDA.vitaminC.male.value} ${RDA.vitaminC.male.unit}`,
    women: `${RDA.vitaminC.female.value} ${RDA.vitaminC.female.unit}`,
    status: RDA.vitaminC.male.status,
    source: RDA.vitaminC.male.source,
  },
  {
    nutrient: 'Vitamin B12',
    men: `${RDA.vitaminB12.male.value} ${RDA.vitaminB12.male.unit}`,
    women: `${RDA.vitaminB12.female.value} ${RDA.vitaminB12.female.unit}`,
    status: RDA.vitaminB12.male.status,
    source: RDA.vitaminB12.male.source,
  },
  {
    nutrient: 'Vitamin D',
    men: `${RDA.vitaminD.male.value} ${RDA.vitaminD.male.unit}`,
    women: `${RDA.vitaminD.female.value} ${RDA.vitaminD.female.unit}`,
    status: RDA.vitaminD.male.status,
    source: RDA.vitaminD.male.source,
  },
  {
    nutrient: 'Fibre',
    men: `${RDA.fibreBasePer2000kcal.male.value} ${RDA.fibreBasePer2000kcal.male.unit}`,
    women: `${RDA.fibreBasePer2000kcal.female.value} ${RDA.fibreBasePer2000kcal.female.unit}`,
    status: RDA.fibreBasePer2000kcal.male.status,
    source: RDA.fibreBasePer2000kcal.male.source,
  },
  {
    nutrient: 'Sodium (Upper Guide)',
    men: `≤ ${RDA.sodiumUpperGuide.male.value} ${RDA.sodiumUpperGuide.male.unit}`,
    women: `≤ ${RDA.sodiumUpperGuide.female.value} ${RDA.sodiumUpperGuide.female.unit}`,
    status: RDA.sodiumUpperGuide.male.status,
    source: RDA.sodiumUpperGuide.male.source,
  },
  {
    nutrient: 'Added Sugar (Upper Guide)',
    men: `≤ ${RDA.addedSugarUpperGuide.male.value} ${RDA.addedSugarUpperGuide.male.unit}`,
    women: `≤ ${RDA.addedSugarUpperGuide.female.value} ${RDA.addedSugarUpperGuide.female.unit}`,
    status: RDA.addedSugarUpperGuide.male.status,
    source: RDA.addedSugarUpperGuide.male.source,
  },
  {
    nutrient: 'Salt (Upper Guide)',
    men: `≤ ${RDA.saltUpperGuide.male.value} ${RDA.saltUpperGuide.male.unit}`,
    women: `≤ ${RDA.saltUpperGuide.female.value} ${RDA.saltUpperGuide.female.unit}`,
    status: RDA.saltUpperGuide.male.status,
    source: RDA.saltUpperGuide.male.source,
  },
];

export default function About() {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
      {/* Hero Section */}
      <header className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/40 text-primary-700 dark:text-primary-300 text-xs font-semibold uppercase tracking-wider mb-4">
          <BookOpen className="w-3.5 h-3.5" />
          Evidence-Based Nutrition
        </div>
        <h1 className="text-4xl sm:text-5xl font-heading font-extrabold text-gray-900 dark:text-white tracking-tight">
          How NutriCheck Works
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Methodology, data sources, limitations, and privacy.
        </p>
      </header>

      {/* Main Disclaimer Banner */}
      <section className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-4">
        <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h2 className="text-base font-semibold text-amber-900 dark:text-amber-200">
            Educational Tool &amp; Clinical Disclaimer
          </h2>
          <p className="mt-1 text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
            NutriCheck is an educational tool, not medical advice. The results are estimates based on a one-day food recall and the ICMR-NIN 2020 reference values. They do not constitute a diagnosis. Always consult a qualified doctor or registered dietitian for personalized health and nutrition guidance.
          </p>
        </div>
      </section>

      {/* 1. Data Sources Section */}
      <section className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
            🏛️
          </span>
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            Data Sources
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
            <h3 className="font-heading font-bold text-base text-gray-900 dark:text-white mb-1">
              1. ICMR-NIN RDA and EAR 2020
            </h3>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-2">
              National Institute of Nutrition, Hyderabad. Indian Council of Medical Research.
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <strong>Reference values used:</strong> Protein, Iron, Calcium, Iodine, Folate, Vitamin C, B12, Vitamin D.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
            <h3 className="font-heading font-bold text-base text-gray-900 dark:text-white mb-1">
              2. ICMR-NIN Dietary Guidelines 2024
            </h3>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-2">
              National Institute of Nutrition, Hyderabad.
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <strong>Used for:</strong> Energy distribution recommendations, fibre targets, sodium limits, and added sugar upper guides.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
            <h3 className="font-heading font-bold text-base text-gray-900 dark:text-white mb-1">
              3. Indian Food Composition Tables 2017 (IFCT 2017)
            </h3>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-2">
              Longvah T. et al. National Institute of Nutrition, Hyderabad.
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <strong>Used for:</strong> Micronutrient estimates in the food database. Values marked &quot;Approximate&quot; are estimates based on IFCT 2017 ranges.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-700">
            <h3 className="font-heading font-bold text-base text-gray-900 dark:text-white mb-1">
              4. National Family Health Survey 5 (NFHS-5, 2019–21)
            </h3>
            <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-2">
              Ministry of Health &amp; Family Welfare, Government of India.
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
              <strong>Used for:</strong> Anaemia prevalence statistics on the landing page (57% in women, 25% in men aged 15–49).
            </p>
          </div>
        </div>
      </section>

      {/* 2. Reference Values Section */}
      <section className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400">
              📊
            </span>
            <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
              ICMR-NIN Reference Values
            </h2>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Adult benchmarks (19–50 years)
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          The table below lists the primary reference standards utilized in NutriCheck. Note: &quot;confirmed&quot; values are taken directly from the ICMR-NIN 2020 primary documentation; &quot;verify&quot; values represent best clinical estimates pending full primary source consensus.
        </p>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <th className="py-3 px-4">Nutrient</th>
                <th className="py-3 px-4">Men</th>
                <th className="py-3 px-4">Women</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
              {REFERENCE_TABLE.map((row) => (
                <tr key={row.nutrient} className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
                    {row.nutrient}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {row.men}
                  </td>
                  <td className="py-3 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {row.women}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        row.status === 'confirmed'
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500 dark:text-gray-400">
                    {row.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. BMR and TDEE Formula Section */}
      <section className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
            <Calculator className="w-5 h-5" />
          </span>
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            BMR &amp; TDEE Equations
          </h2>
        </div>

        <div className="space-y-4 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            NutriCheck calculates your Basal Metabolic Rate (BMR) using the validated <strong>Mifflin-St Jeor equation</strong>:
          </p>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 font-mono text-xs sm:text-sm text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 space-y-2">
            <div>
              <strong>Men:</strong> BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age + 5
            </div>
            <div>
              <strong>Women:</strong> BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age − 161
            </div>
          </div>

          <div className="p-4 rounded-xl bg-orange-50/60 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900 text-xs sm:text-sm space-y-2">
            <h4 className="font-heading font-semibold text-primary-800 dark:text-primary-300 flex items-center gap-1.5">
              <Info className="w-4 h-4 shrink-0" /> Why Mifflin-St Jeor instead of Harris-Benedict?
            </h4>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              ICMR-NIN 2020 revised the reference Indian adult weights (65 kg for men, 55 kg for women) and lowered baseline metabolic assumptions compared to older Western tables. Clinical studies show that the classic Harris-Benedict formula routinely overestimates calorie needs by 5–15% in Indian individuals, whereas Mifflin-St Jeor provides closer fidelity to actual measured indirect calorimetry.
            </p>
          </div>

          <p className="pt-2">
            <strong>Total Daily Energy Expenditure (TDEE):</strong> TDEE is obtained by multiplying BMR by the physical activity factor:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">Sedentary</div>
              <div className="font-heading font-bold text-base text-gray-900 dark:text-white">× {ACTIVITY_MULTIPLIERS.sedentary}</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">Lightly Active</div>
              <div className="font-heading font-bold text-base text-gray-900 dark:text-white">× {ACTIVITY_MULTIPLIERS.light}</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">Moderately Active</div>
              <div className="font-heading font-bold text-base text-gray-900 dark:text-white">× {ACTIVITY_MULTIPLIERS.moderate}</div>
            </div>
            <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">Very Active</div>
              <div className="font-heading font-bold text-base text-gray-900 dark:text-white">× {ACTIVITY_MULTIPLIERS.very_active}</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Protein RDA & Practical Target */}
      <section className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            🥩
          </span>
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            Protein RDA vs. Practical Target
          </h2>
        </div>

        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          <p>
            • <strong>ICMR-NIN RDA is 0.83 g/kg/day</strong> for high-quality reference protein with complete amino acid bioavailability.
          </p>
          <p>
            • Because typical Indian diets are predominantly cereal-pulse based with lower overall protein digestibility and DIAAS scores, ICMR-NIN Dietary Guidelines 2024 recommend an adjusted practical target of <strong>1.0 g/kg/day</strong>.
          </p>
          <p>
            • Results compare your intake to the <strong>practical target (1.0 g/kg/day)</strong> and label it clearly alongside the physiological RDA.
          </p>
          <p>
            • <strong>Reference weight correction:</strong> For users with BMI ≥ 25 (obesity threshold for Asian Indian populations), the protein target is calculated from a reference weight corresponding to BMI = 25 for their height rather than unadjusted total body mass, preventing inflated protein targets.
          </p>
        </div>
      </section>

      {/* 5. Score Formula Section */}
      <section className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-6">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
            <Sparkles className="w-5 h-5" />
          </span>
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            Transparent 0–100 Nutrition Score Formula
          </h2>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          Unlike opaque proprietary health scores, NutriCheck computes an open, reproducible 6-component score out of 100 points:
        </p>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <th className="py-3 px-4">Component</th>
                <th className="py-3 px-4 text-center">Max Points</th>
                <th className="py-3 px-4">Rule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-750">
              <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50">
                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Calorie adequacy</td>
                <td className="py-3 px-4 text-center font-bold text-primary-600 dark:text-primary-400">20</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-xs">
                  Full marks if intake is 90–110% of target; linear scale to 0 at ≤50% or ≥150%
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50">
                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Macro balance</td>
                <td className="py-3 px-4 text-center font-bold text-primary-600 dark:text-primary-400">15</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-xs">
                  5 pts each for carbs/protein/fat % of energy; ICMR-NIN ranges: carbs 45–60%, protein 10–15%, fat 20–30%
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50">
                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Protein vs target</td>
                <td className="py-3 px-4 text-center font-bold text-primary-600 dark:text-primary-400">15</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-xs">
                  Proportional to practical protein target (1.0 g/kg)
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50">
                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Fibre vs target</td>
                <td className="py-3 px-4 text-center font-bold text-primary-600 dark:text-primary-400">10</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-xs">
                  Proportional to fibre target (40g per 2000 kcal, min 25g)
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50">
                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Micronutrients</td>
                <td className="py-3 px-4 text-center font-bold text-primary-600 dark:text-primary-400">30</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-xs">
                  Iron, Calcium, Vitamin C, B12, Vitamin D: 6pts each; nutrients with &lt;60% data coverage are excluded and remaining rescaled to 30
                </td>
              </tr>
              <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-750/50">
                <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">Moderation</td>
                <td className="py-3 px-4 text-center font-bold text-primary-600 dark:text-primary-400">10</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-300 text-xs">
                  Sodium (4pts), Added sugar (3pts), Fried items (3pts)
                </td>
              </tr>
              <tr className="bg-orange-50/50 dark:bg-gray-900/60 font-bold border-t border-gray-200 dark:border-gray-700">
                <td className="py-3 px-4 text-gray-900 dark:text-white">Total</td>
                <td className="py-3 px-4 text-center text-primary-600 dark:text-primary-400">100</td>
                <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">Sum of all 6 components</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 6. Status Thresholds Section */}
      <section className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
        <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
          Nutrient Status Thresholds
        </h2>

        <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Range</th>
                <th className="py-3 px-4">User Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-750 text-sm">
              <tr>
                <td className="py-3 px-4 font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <span>✅</span> Adequate
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">≥ 80% of target</td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">&quot;Looks adequate&quot;</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-amber-600 dark:text-amber-400 flex items-center gap-2">
                  <span>⚠️</span> Likely low
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">50–79% of target</td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">&quot;Likely low intake today&quot;</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-medium text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <span>🔴</span> Very low
                </td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">&lt; 50% of target</td>
                <td className="py-3 px-4 text-gray-700 dark:text-gray-300">&quot;Very low intake today&quot;</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Note: These thresholds indicate today&apos;s intake relative to daily requirements. A single day cannot diagnose a nutritional deficiency — blood tests are needed for that.
        </p>
      </section>

      {/* 7. Absorption Rules Section */}
      <section className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
        <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
          Absorption &amp; Bioavailability Rules
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          Nutrition is not merely what you swallow, but what your body absorbs. NutriCheck inspects common dietary interactions highlighted by ICMR-NIN:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">☕ Tea &amp; Coffee Polyphenols</h3>
            <p className="text-xs leading-relaxed">
              Tannins and polyphenols in tea/coffee bind non-heme iron and reduce absorption by up to 60%. Enjoy chai/coffee between meals rather than alongside food.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">🍋 Vitamin C Synergy</h3>
            <p className="text-xs leading-relaxed">
              Ascorbic acid converts ferric iron to ferrous iron, dramatically boosting plant-iron absorption from dals and leafy greens. Squeeze lemon over your dal!
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">🌱 Plant-Based (Non-Heme) Iron</h3>
            <p className="text-xs leading-relaxed">
              Plant-based iron has 2–5% bioavailability compared to 15–35% for meat-based heme iron, which is why vegetarian diets require careful planning and higher intake.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">🥛 Calcium &amp; Iron Competition</h3>
            <p className="text-xs leading-relaxed">
              High calcium intakes compete with iron at intestinal transport channels. Space high-dose dairy (like milk or paneer) away from primary iron-rich meals.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">☀️ Vitamin D Limitations</h3>
            <p className="text-xs leading-relaxed">
              Natural food sources rarely provide enough Vitamin D to satisfy ICMR-NIN requirements (600 IU/day). Adequate sun exposure or clinical supplements are essential.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/60 border border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">🔬 Vitamin B12 Exclusivity</h3>
            <p className="text-xs leading-relaxed">
              Vitamin B12 is synthesized exclusively by bacteria and present in bioavailable amounts only in animal-origin foods and dairy. Vegetarians and vegans should consider routine serum testing.
            </p>
          </div>
        </div>
      </section>

      {/* 8. Assumptions & Limitations */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <HelpCircle className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
              Assumptions
            </h2>
          </div>
          <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-2.5 list-disc list-inside leading-relaxed">
            <li>Serving sizes are approximate. A &quot;katori&quot; varies roughly 100–200 ml between households (standardized to 150ml here).</li>
            <li>Micronutrient values are estimates based on IFCT 2017 ranges, not exact measured laboratory values.</li>
            <li>Restaurant food factor: dishes marked &quot;restaurant&quot; add 20% more fat and 30% more sodium (approximate).</li>
            <li>Calorie calculations assume average Indian body composition using Mifflin-St Jeor.</li>
          </ul>
        </div>

        <div className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-heading font-bold text-gray-900 dark:text-white">
              Limitations
            </h2>
          </div>
          <ul className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 space-y-2.5 list-disc list-inside leading-relaxed">
            <li>One-day food recall cannot diagnose a nutritional deficiency. Blood tests are required.</li>
            <li>NutriCheck counts food intake only. Supplements are not included in the analysis.</li>
            <li>For users under 18, pregnant/breastfeeding, or with medical conditions (diabetes, kidney disease, celiac, etc.), results are shown in a limited or informational mode only.</li>
            <li>Food database contains 46 common Indian foods. Many regional and seasonal foods are not yet included.</li>
          </ul>
        </div>
      </section>

      {/* 9. Privacy Section */}
      <section className="p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </span>
          <h2 className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
            100% Client-Side Privacy Guarantee
          </h2>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 space-y-3 leading-relaxed">
          <p>
            • NutriCheck stores your data only in your browser&apos;s <code>sessionStorage</code> — temporary storage that is automatically cleared when you close the tab or click &quot;Retake Analysis&quot;.
          </p>
          <p>
            • No data is sent to any server. The PDF report is generated entirely in your browser using client-side JavaScript.
          </p>
          <p>
            • No analytics, no tracking, no cookies.
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            <strong>To verify:</strong> Open your browser Developer Tools (F12) → Application → Session Storage after completing your analysis. You will see that data lives only inside your device session and makes zero network calls.
          </p>
        </div>
      </section>

      {/* 10. Report an Issue & Metadata */}
      <footer className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div>
          <p className="font-semibold text-gray-700 dark:text-gray-300">
            NutriCheck v1.0.0 — Open Informatics
          </p>
          <p className="mt-0.5">
            Data last reviewed: October 2025 • Aligned with ICMR-NIN 2020 / 2024
          </p>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium"
          >
            Report an issue <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <Link
            to="/analyze/profile"
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium"
          >
            Start Analysis
          </Link>
        </div>
      </footer>
    </div>
  );
}
