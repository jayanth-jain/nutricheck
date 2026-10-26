import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAnalysis, useTotalMealCount } from '../state/AnalysisContext';
import { runAnalysis } from '../engine/analysis';
import { generatePDFReport } from '../pdf/report';
import { generateDayPlan } from '../engine/planner';
import { getNutrientStatus } from '../constants/thresholds';
import ProgressStepper from '../components/ui/ProgressStepper';
import SafetyBanner from '../components/ui/SafetyBanner';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import ScoreGauge from '../components/charts/ScoreGauge';
import MacroDonut from '../components/charts/MacroDonut';
import NutrientCard from '../components/results/NutrientCard';
import SwapCard from '../components/results/SwapCard';
import {
  Download,
  RotateCcw,
  Share2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Check,
  Calendar,
} from 'lucide-react';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function Results() {
  const { state, dispatch } = useAnalysis();
  const navigate = useNavigate();
  const totalItems = useTotalMealCount(state.meals);

  const [isLoading, setIsLoading] = useState(true);
  const [showFormula, setShowFormula] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Redirect if profile is missing
  useEffect(() => {
    if (!state.profile) {
      navigate('/analyze/profile', {
        replace: true,
        state: { message: 'Please complete your profile first.' },
      });
    }
  }, [state.profile, navigate]);

  // Loading timer respecting prefers-reduced-motion
  useEffect(() => {
    const mediaQuery =
      typeof window !== 'undefined' && typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-reduced-motion: reduce)')
        : null;
    if (mediaQuery?.matches) {
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Compute full analysis result memoized
  const result = useMemo(() => {
    if (!state.profile) return null;
    return runAnalysis(state.profile, state.meals);
  }, [state.profile, state.meals]);

  const prefersReducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  const dayPlan = useMemo(() => {
    if (!result) return null;
    const canShow =
      result.safety.mode === 'full' && !result.safety.disabledFeatures.includes('plan');
    if (!canShow) return null;

    const list: string[] = [];
    if (
      result.targets.proteinPractical > 0 &&
      result.intake.protein / result.targets.proteinPractical < 0.8
    )
      list.push('protein');
    if (
      result.targets.fiberTarget > 0 &&
      result.intake.fiber / result.targets.fiberTarget < 0.8
    )
      list.push('fiber');
    if (result.targets.iron > 0 && (result.intake.iron ?? 0) / result.targets.iron < 0.8)
      list.push('iron');
    if (
      result.targets.calcium > 0 &&
      (result.intake.calcium ?? 0) / result.targets.calcium < 0.8
    )
      list.push('calcium');
    if (result.targets.vitC > 0 && (result.intake.vitC ?? 0) / result.targets.vitC < 0.8)
      list.push('vitC');
    if (result.targets.b12 > 0 && (result.intake.b12 ?? 0) / result.targets.b12 < 0.8)
      list.push('b12');
    if (result.targets.vitD > 0 && (result.intake.vitD ?? 0) / result.targets.vitD < 0.8)
      list.push('vitD');

    return generateDayPlan(result.profile, result.targets, list);
  }, [result]);

  if (!state.profile || !result) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Redirecting to profile setup…
        </p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSkeleton onSkip={() => setIsLoading(false)} />;
  }

  const { profile, targets, intake, score, safety, swaps, topFoods, mealDistributionInsights, insights } = result;

  // Calorie calculations
  const calorieRatio = targets.kcalTarget > 0 ? intake.kcal / targets.kcalTarget : 1;
  const caloriePercent = Math.round(calorieRatio * 100);
  const calorieDiff = intake.kcal - targets.kcalTarget;

  // Weight goal deficit/surplus allowed by safety
  const canShowDeficitAdvice =
    !safety.disabledFeatures.includes('deficit_goal') &&
    !safety.disabledFeatures.includes('weight_loss_advice');

  // Macro percentages
  const pEnergy = intake.protein * 4;
  const cEnergy = intake.carbs * 4;
  const fEnergy = intake.fat * 9;
  const totalMacroKcal = pEnergy + cEnergy + fEnergy;
  const carbsPct = totalMacroKcal > 0 ? Math.round((cEnergy / totalMacroKcal) * 100) : 0;
  const proteinPct = totalMacroKcal > 0 ? Math.round((pEnergy / totalMacroKcal) * 100) : 0;
  const fatPct = totalMacroKcal > 0 ? Math.round((fEnergy / totalMacroKcal) * 100) : 0;

  // Macro text summaries
  let carbsStatus = 'within the recommended range of 45–60%';
  if (carbsPct > 60) carbsStatus = `above the recommended range of 45–60% (${carbsPct}% of energy)`;
  else if (carbsPct < 45) carbsStatus = `below the usual range of 45–60% (${carbsPct}% of energy)`;

  let proteinStatus = 'within the recommended range of 10–15%';
  if (proteinPct > 15) proteinStatus = `above 15% (${proteinPct}% of energy), supporting muscle recovery`;
  else if (proteinPct < 10) proteinStatus = `below the recommended 10–15% (${proteinPct}% of energy)`;

  // Score label configuration
  let scoreBadge: { label: string; icon: React.ReactNode; colorClass: string };
  if (score.total >= 80) {
    scoreBadge = {
      label: 'Good',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      colorClass: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    };
  } else if (score.total >= 50) {
    scoreBadge = {
      label: 'Needs attention',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      colorClass: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    };
  } else {
    scoreBadge = {
      label: 'Needs a lot of attention',
      icon: <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />,
      colorClass: 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    };
  }

  // PDF Export
  const handleDownloadPdf = async () => {
    try {
      setIsExportingPdf(true);
      await generatePDFReport(result);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  // Retake analysis
  const handleRetake = () => {
    dispatch({ type: 'RESET' });
    try {
      sessionStorage.removeItem('nutricheck_session');
    } catch {
      // Ignore storage errors
    }
    navigate('/');
  };

  // Share summary
  const handleShare = async () => {
    const shareText = `NutriCheck Analysis: My Daily Nutrition Score is ${score.total}/100. Check your Indian diet nutritional adequacy on NutriCheck!`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NutriCheck Nutrition Report',
          text: shareText,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(shareText);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } catch {
        // Clipboard failed
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 pb-28 md:pb-16">
      <ProgressStepper currentStep={3} steps={['Profile', 'Meals', 'Results']} />

      {/* Top Results Header & Disclaimer */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-gray-900 dark:text-white">
              Your Nutrition Analysis
            </h1>
            <p className="text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400">
              Educational tool, not medical advice
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-900/40 text-primary-800 dark:text-primary-200">
            <Calendar className="w-3.5 h-3.5" />
            1-Day Food Recall
          </span>
        </div>

        {/* Disclaimer Alert Box */}
        <div className="p-3.5 rounded-2xl bg-orange-50/80 dark:bg-orange-950/30 border border-orange-200/70 dark:border-orange-800/50 text-xs text-primary-900 dark:text-primary-200 flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-primary-600 dark:text-primary-400" />
          <p>
            Based on one day of food you entered. This is an educational estimate, not a medical diagnosis. All values are calculated from ICMR-NIN RDA (2020) and Dietary Guidelines for Indians (2024).
          </p>
        </div>
      </div>

      {/* Safety Banners if applicable */}
      {safety.banners.length > 0 && (
        <div className="mb-6">
          <SafetyBanner banners={safety.banners} mode={safety.mode} />
        </div>
      )}

      {/* Animated container for staggered card reveal */}
      <motion.div
        variants={containerVariants}
        initial={prefersReducedMotion ? 'visible' : 'hidden'}
        animate="visible"
      >
        {/* SECTION A: Daily Nutrition Score */}
        <motion.div variants={cardVariants}>
          <section className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm" aria-labelledby="score-heading">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Gauge & Score */}
          <div className="flex flex-col items-center text-center">
            <h2 id="score-heading" className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-3">
              Daily Nutrition Score
            </h2>

            {totalItems < 3 ? (
              <div className="p-6 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center max-w-xs">
                <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  Add more meals for a reliable score
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  At least 3 meal items are needed to calculate a balanced score.
                </p>
              </div>
            ) : (
              <>
                <ScoreGauge score={score.total} size={170} />
                <div
                  className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${scoreBadge.colorClass}`}
                >
                  {scoreBadge.icon}
                  <span>{scoreBadge.label}</span>
                </div>
              </>
            )}
          </div>

          {/* Breakdown Table */}
          <div className="w-full md:w-3/5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Score Breakdown (100 Points Total)
              </h3>
              <button
                type="button"
                onClick={() => setShowFormula((prev) => !prev)}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 font-medium"
              >
                <span>How is this calculated?</span>
                {showFormula ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700">
              <table className="w-full text-left text-xs border-collapse">
                <caption className="sr-only">Score component points</caption>
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-100 dark:border-gray-700">
                    <th scope="col" className="py-2.5 px-3">Component</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Points Earned</th>
                    <th scope="col" className="py-2.5 px-3 text-right">Max</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-600 dark:text-gray-300">
                  <tr>
                    <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Calorie adequacy</td>
                    <td className="py-2 px-3 text-right font-semibold text-primary-600 dark:text-primary-400">
                      {score.calorieAdequacy.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-400">20</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Macro balance</td>
                    <td className="py-2 px-3 text-right font-semibold text-primary-600 dark:text-primary-400">
                      {score.macroBalance.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-400">15</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Protein vs target</td>
                    <td className="py-2 px-3 text-right font-semibold text-primary-600 dark:text-primary-400">
                      {score.proteinVsTarget.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-400">15</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Fibre vs target</td>
                    <td className="py-2 px-3 text-right font-semibold text-primary-600 dark:text-primary-400">
                      {score.fibreVsTarget.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-400">10</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Micronutrients</td>
                    <td className="py-2 px-3 text-right font-semibold text-primary-600 dark:text-primary-400">
                      {score.micronutrients.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-400">30</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">Moderation (Sodium/Sugar/Fried)</td>
                    <td className="py-2 px-3 text-right font-semibold text-primary-600 dark:text-primary-400">
                      {score.moderation.toFixed(1)}
                    </td>
                    <td className="py-2 px-3 text-right text-gray-400">10</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Collapsible formula explanation */}
            {showFormula && (
              <div className="mt-3 p-3.5 rounded-xl bg-gray-50 dark:bg-gray-750 text-xs text-gray-600 dark:text-gray-300 space-y-1.5 leading-relaxed">
                <p className="font-semibold text-gray-800 dark:text-gray-200">Formula Details:</p>
                <p>• <strong>Calorie Adequacy (20 pts):</strong> 20 points if within 90%–110% of target; scales to 0 at &lt;50% or &gt;150%.</p>
                <p>• <strong>Macro Balance (15 pts):</strong> 5 pts each for Carbohydrates (45–60%), Protein (10–15%), and Fat (20–30%).</p>
                <p>• <strong>Protein vs Target (15 pts):</strong> Proportional to reaching your practical target ({targets.proteinPractical}g/day).</p>
                <p>• <strong>Fibre vs Target (10 pts):</strong> Proportional to reaching {targets.fiberTarget}g/day based on ICMR-NIN 2024 guidance.</p>
                <p>• <strong>Micronutrients (30 pts):</strong> 6 pts each across Iron, Calcium, Vitamin C, B12, and Vitamin D. Nutrients with limited coverage are excluded and rescaled.</p>
                <p>• <strong>Moderation (10 pts):</strong> 4 pts for staying under 2,000mg sodium, 3 pts for &le;25g added sugar, and 3 pts for avoiding frequent deep-fried foods.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </motion.div>

    {/* SECTION B: Macronutrient Breakdown */}
    <motion.div variants={cardVariants}>
      <section className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm" aria-labelledby="macros-heading">
        <h2 id="macros-heading" className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-2">
          Macronutrient Breakdown
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Distribution of energy from carbs, protein, and fat compared with ICMR-NIN recommended ranges.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Donut chart */}
          <MacroDonut
            proteinGrams={intake.protein}
            carbsGrams={intake.carbs}
            fatGrams={intake.fat}
          />

          {/* Bar comparisons & Plain summary */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Diet vs. Reference Range
            </h3>

            {/* Carbs */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Carbohydrates</span>
                <span className="text-gray-500 dark:text-gray-400">
                  Actual: <strong className="text-orange-600 dark:text-orange-400">{carbsPct}%</strong> | Target: 45%–60%
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-orange-500 h-full rounded-full" style={{ width: `${Math.min(100, carbsPct)}%` }} />
              </div>
            </div>

            {/* Protein */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Protein</span>
                <span className="text-gray-500 dark:text-gray-400">
                  Actual: <strong className="text-blue-600 dark:text-blue-400">{proteinPct}%</strong> | Target: 10%–15%
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min(100, proteinPct * 3)}%` }} />
              </div>
            </div>

            {/* Fat */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-gray-700 dark:text-gray-300">Fat</span>
                <span className="text-gray-500 dark:text-gray-400">
                  Actual: <strong className="text-yellow-600 dark:text-yellow-400">{fatPct}%</strong> | Target: 20%–30%
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div className="bg-yellow-500 h-full rounded-full" style={{ width: `${Math.min(100, fatPct * 2)}%` }} />
              </div>
            </div>

            {/* Plain language summary */}
            <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-750 text-xs text-gray-600 dark:text-gray-300 space-y-1.5 border border-gray-100 dark:border-gray-700">
              <p>• Carbohydrates make up {carbsStatus}.</p>
              <p>• Protein makes up {proteinStatus}.</p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>

    {/* SECTION C: Calorie Analysis */}
    <motion.div variants={cardVariants}>
      <section className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm" aria-labelledby="calorie-heading">
        <h2 id="calorie-heading" className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-2">
          Calorie Intake Analysis
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Comparison between food energy consumed and your daily estimated expenditure.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Consumed Today</span>
            <span className="text-2xl font-heading font-bold text-gray-900 dark:text-white">
              {Math.round(intake.kcal)} <span className="text-xs font-normal text-gray-500">kcal</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">
              {profile.goal === 'lose' ? 'Weight Loss Target' : profile.goal === 'gain' ? 'Weight Gain Target' : 'Maintenance Need'}
            </span>
            <span className="text-2xl font-heading font-bold text-primary-600 dark:text-primary-400">
              {targets.kcalTarget} <span className="text-xs font-normal text-gray-500">kcal</span>
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 text-center">
            <span className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Net Difference</span>
            <span
              className={`text-2xl font-heading font-bold ${
                Math.abs(calorieDiff) <= 100
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : calorieDiff > 0
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-blue-600 dark:text-blue-400'
              }`}
            >
              {calorieDiff > 0 ? `+${Math.round(calorieDiff)}` : Math.round(calorieDiff)}{' '}
              <span className="text-xs font-normal text-gray-500">kcal</span>
            </span>
          </div>
        </div>

        {/* Visual Progress Bar (capped at 150%) */}
        <div>
          <div className="flex justify-between text-xs mb-1 font-medium">
            <span className="text-gray-600 dark:text-gray-300">Intake Progress</span>
            <span className="text-gray-900 dark:text-white font-semibold">{caloriePercent}% of daily target</span>
          </div>
          <div
            className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.min(150, caloriePercent)}
            aria-valuemin={0}
            aria-valuemax={150}
            aria-label={`Calorie intake: ${Math.round(intake.kcal)} out of ${targets.kcalTarget} kcal`}
          >
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                caloriePercent >= 90 && caloriePercent <= 110
                  ? 'bg-emerald-500'
                  : caloriePercent < 90
                    ? 'bg-blue-500'
                    : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, (caloriePercent / 150) * 100)}%` }}
            />
          </div>
        </div>

        {/* Weight goal guidance if permitted by safety */}
        {profile.goal !== 'analyze' && profile.goal !== 'maintain' && canShowDeficitAdvice && (
          <div className="mt-4 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/30 text-xs text-blue-900 dark:text-blue-200">
            {profile.goal === 'lose' && (
              <p>
                Your target incorporates a recommended 500 kcal/day deficit to promote sustainable weight management, keeping above the safe floor of {profile.sex === 'male' ? '1,500' : '1,200'} kcal.
              </p>
            )}
            {profile.goal === 'gain' && (
              <p>
                Your target incorporates a recommended 300 kcal/day surplus to support gradual, healthy muscle and weight gain.
              </p>
            )}
          </div>
        )}
      </section>
    </motion.div>

    {/* SECTION D: Nutrient Check (KEY SECTION) */}
    <motion.div variants={cardVariants}>
      <section className="mb-8" aria-labelledby="nutrients-heading">
        <div className="mb-4">
          <h2 id="nutrients-heading" className="text-lg font-heading font-bold text-gray-900 dark:text-white">
            Nutrient Check
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Status of essential macronutrients, micronutrients, and limits based on ICMR-NIN RDA 2020.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Protein */}
          <NutrientCard
            name="Protein"
            emoji="🍗"
            intake={intake.protein}
            target={targets.proteinPractical}
            unit="g"
            isLimitedData={false}
            isEstimate={false}
            status={getNutrientStatus((intake.protein / targets.proteinPractical) * 100)}
            whyItMatters="Protein helps build and repair muscle, supports immunity, and keeps you feeling full."
            topFoods={topFoods.protein}
            hasSupplement={false}
          />

          {/* 2. Dietary Fibre */}
          <NutrientCard
            name="Dietary Fibre"
            emoji="🌾"
            intake={intake.fiber}
            target={targets.fiberTarget}
            unit="g"
            isLimitedData={false}
            isEstimate={false}
            status={getNutrientStatus((intake.fiber / targets.fiberTarget) * 100)}
            whyItMatters="Fibre supports digestion, heart health, and helps manage blood sugar levels."
            topFoods={topFoods.fiber}
            hasSupplement={false}
          />

          {/* 3. Iron */}
          <NutrientCard
            name="Iron"
            emoji="🩸"
            intake={intake.iron}
            target={targets.iron}
            unit="mg"
            isLimitedData={!!intake.coverages?.iron?.isLimitedData}
            isEstimate={true}
            status={getNutrientStatus(((intake.iron ?? 0) / targets.iron) * 100)}
            whyItMatters="Iron carries oxygen in the blood. Low intake may leave you feeling tired."
            absorptionTip={insights.ironTips[0]}
            topFoods={topFoods.iron}
            hasSupplement={!!profile.takesSupplements?.iron}
          />

          {/* 4. Calcium */}
          <NutrientCard
            name="Calcium"
            emoji="🥛"
            intake={intake.calcium}
            target={targets.calcium}
            unit="mg"
            isLimitedData={!!intake.coverages?.calcium?.isLimitedData}
            isEstimate={true}
            status={getNutrientStatus(((intake.calcium ?? 0) / targets.calcium) * 100)}
            whyItMatters="Calcium keeps bones and teeth strong and supports muscle function."
            absorptionTip={insights.calciumTips[0]}
            topFoods={topFoods.calcium}
            hasSupplement={!!profile.takesSupplements?.calcium}
          />

          {/* 5. Vitamin C */}
          <NutrientCard
            name="Vitamin C"
            emoji="🍋"
            intake={intake.vitC}
            target={targets.vitC}
            unit="mg"
            isLimitedData={!!intake.coverages?.vitC?.isLimitedData}
            isEstimate={true}
            status={getNutrientStatus(((intake.vitC ?? 0) / targets.vitC) * 100)}
            whyItMatters="Vitamin C supports immunity, skin health, and helps absorb iron from plant foods."
            topFoods={topFoods.vitC}
            hasSupplement={false}
          />

          {/* 6. Vitamin D */}
          <NutrientCard
            name="Vitamin D"
            emoji="☀️"
            intake={intake.vitD}
            target={targets.vitD}
            unit="µg"
            isLimitedData={!!intake.coverages?.vitD?.isLimitedData}
            isEstimate={true}
            status={getNutrientStatus(((intake.vitD ?? 0) / targets.vitD) * 100)}
            whyItMatters="Vitamin D supports bone health, immunity, and mood."
            absorptionTip={insights.vitDTips[0]}
            topFoods={topFoods.vitD}
            hasSupplement={!!profile.takesSupplements?.vitD}
          />

          {/* 7. Vitamin B12 */}
          <NutrientCard
            name="Vitamin B12"
            emoji="🧬"
            intake={intake.b12}
            target={targets.b12}
            unit="µg"
            isLimitedData={!!intake.coverages?.b12?.isLimitedData}
            isEstimate={true}
            status={getNutrientStatus(((intake.b12 ?? 0) / targets.b12) * 100)}
            whyItMatters="Vitamin B12 is essential for nerve function and making red blood cells."
            absorptionTip={insights.b12Tips[0]}
            topFoods={topFoods.b12}
            hasSupplement={!!profile.takesSupplements?.b12}
          />

          {/* 8. Sodium (Limit card) */}
          <NutrientCard
            name="Sodium (Upper Guide)"
            emoji="🧂"
            intake={intake.sodium}
            target={targets.sodiumUpperGuide}
            unit="mg"
            isLimitedData={false}
            isEstimate={true}
            isLimit={true}
            status={(intake.sodium ?? 0) <= targets.sodiumUpperGuide ? 'adequate' : 'very_low'}
            whyItMatters="Excess sodium is linked with elevated blood pressure. Recommended upper intake is 2,000 mg/day."
            absorptionTip={insights.sodiumFlags.join(' ')}
            hasSupplement={false}
          />

          {/* 9. Added Sugar (Limit card) */}
          <NutrientCard
            name="Added Sugar (Upper Guide)"
            emoji="🍬"
            intake={intake.addedSugar}
            target={targets.addedSugarUpperGuide}
            unit="g"
            isLimitedData={false}
            isEstimate={true}
            isLimit={true}
            status={(intake.addedSugar ?? 0) <= targets.addedSugarUpperGuide ? 'adequate' : 'very_low'}
            whyItMatters="Limiting added sugars supports healthy metabolic markers and prevents empty calorie intake."
            hasSupplement={false}
          />
        </div>
      </section>
    </motion.div>

    {/* SECTION E: Meal-wise Breakdown */}
    <motion.div variants={cardVariants}>
      <section className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm" aria-labelledby="meals-breakdown-heading">
        <h2 id="meals-breakdown-heading" className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-2">
          Meal-wise Breakdown
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Nutrient contribution by each meal of the day.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <caption className="sr-only">Meal breakdown table</caption>
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-750 text-gray-900 dark:text-white font-semibold border-b border-gray-100 dark:border-gray-700">
                <th scope="col" className="py-2.5 px-3">Meal</th>
                <th scope="col" className="py-2.5 px-3 text-right">Energy (kcal)</th>
                <th scope="col" className="py-2.5 px-3 text-right">Protein (g)</th>
                <th scope="col" className="py-2.5 px-3 text-right">Carbs (g)</th>
                <th scope="col" className="py-2.5 px-3 text-right">Fat (g)</th>
                <th scope="col" className="py-2.5 px-3 text-right">Fibre (g)</th>
                <th scope="col" className="py-2.5 px-3 text-right">% of Day&apos;s kcal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((mealKey) => {
                const m = intake.mealBreakdown[mealKey];
                const pct = intake.kcal > 0 ? Math.round((m.kcal / intake.kcal) * 100) : 0;
                const labels: Record<string, string> = {
                  breakfast: '☕ Breakfast',
                  lunch: '🍛 Lunch',
                  dinner: '🍲 Dinner',
                  snacks: '🥪 Snacks',
                };

                return (
                  <tr key={mealKey}>
                    <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-white">{labels[mealKey]}</td>
                    <td className="py-2.5 px-3 text-right">{Math.round(m.kcal)}</td>
                    <td className="py-2.5 px-3 text-right">{m.protein.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-right">{m.carbs.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-right">{m.fat.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-right">{m.fiber.toFixed(1)}</td>
                    <td className="py-2.5 px-3 text-right font-semibold text-gray-900 dark:text-white">{pct}%</td>
                  </tr>
                );
              })}
              {/* Total row */}
              <tr className="bg-gray-50/70 dark:bg-gray-750/70 font-semibold border-t-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white">
                <td className="py-3 px-3">Total Daily Intake</td>
                <td className="py-3 px-3 text-right">{Math.round(intake.kcal)}</td>
                <td className="py-3 px-3 text-right">{intake.protein.toFixed(1)}</td>
                <td className="py-3 px-3 text-right">{intake.carbs.toFixed(1)}</td>
                <td className="py-3 px-3 text-right">{intake.fat.toFixed(1)}</td>
                <td className="py-3 px-3 text-right">{intake.fiber.toFixed(1)}</td>
                <td className="py-3 px-3 text-right">100%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Meal distribution insights */}
        {mealDistributionInsights.length > 0 && (
          <div className="mt-4 space-y-2">
            {mealDistributionInsights.map((note, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>{note}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>

    {/* SECTION F: Smart Swaps */}
    <motion.div variants={cardVariants}>
      <section className="mb-8" aria-labelledby="swaps-heading">
        <div className="mb-4">
          <h2 id="swaps-heading" className="text-lg font-heading font-bold text-gray-900 dark:text-white">
            Smart Food Swaps
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Targeted substitutes calculated specifically for foods in your meal log.
          </p>
        </div>

        {swaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {swaps.slice(0, 6).map((s, idx) => (
              <SwapCard key={`${s.fromFood.id}-${s.toFood.id}-${idx}`} swap={s} />
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
            No swaps needed — your logged choices look well-balanced!
          </div>
        )}
      </section>
    </motion.div>

    {/* SECTION G: Sample Diet Plan */}
    {dayPlan && (
      <motion.div variants={cardVariants}>
        <section
          className="mb-8 p-6 sm:p-8 rounded-3xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
          aria-labelledby="plan-heading"
        >
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2
                id="plan-heading"
                className="text-lg font-heading font-bold text-gray-900 dark:text-white flex items-center gap-2"
              >
                <span>📅</span> Sample Balanced Diet Plan
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Structured day plan matched to your diet type and nutrient preferences.
              </p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
              A sample day, not a prescription.
            </span>
          </div>

          {/* 5 Meal Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            {[
              dayPlan.breakfast,
              dayPlan.midMorning,
              dayPlan.lunch,
              dayPlan.eveningSnack,
              dayPlan.dinner,
            ].map((meal, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-primary-600 dark:text-primary-400 mb-2">
                    {meal.name}
                  </h3>
                  <ul className="space-y-1.5 mb-3 text-xs">
                    {meal.items.map((item, itemIdx) => (
                      <li
                        key={itemIdx}
                        className="text-gray-800 dark:text-gray-200 flex items-start gap-1"
                      >
                        <span className="shrink-0">{item.food.emoji}</span>
                        <div className="leading-tight">
                          <span className="font-medium">{item.food.name}</span>
                          <span className="text-gray-400 text-[11px] block">
                            {item.quantity} {item.food.servingLabel}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                    <span>{Math.round(meal.kcal)} kcal</span>
                    <span>{meal.protein.toFixed(1)}g P</span>
                  </div>
                  {meal.note && (
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 italic mt-1 leading-snug">
                      {meal.note}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Daily totals row */}
          <div className="p-4 rounded-2xl bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-primary-900 dark:text-primary-200">
              Sample Day Totals:
            </span>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 font-bold text-gray-800 dark:text-gray-100">
              <span>
                Energy:{' '}
                <strong className="text-primary-600 dark:text-primary-400">
                  {Math.round(dayPlan.totalKcal)} kcal
                </strong>{' '}
                / {targets.kcalTarget} kcal target
              </span>
              <span>
                Protein:{' '}
                <strong className="text-primary-600 dark:text-primary-400">
                  {dayPlan.totalProtein.toFixed(1)}g
                </strong>{' '}
                / {targets.proteinPractical}g target
              </span>
            </div>
          </div>

          {/* Soft disclaimer text */}
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3 text-center">
            {dayPlan.disclaimer}
          </p>
        </section>
      </motion.div>
    )}

    {/* SECTION H: Download & Share Actions */}
    <motion.div variants={cardVariants}>
      <section className="no-print p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-orange-500/10 via-amber-500/5 to-emerald-500/10 dark:from-orange-950/30 dark:via-gray-900 dark:to-emerald-950/30 border border-orange-100 dark:border-gray-700 text-center">
        <h2 className="text-lg font-heading font-bold text-gray-900 dark:text-white mb-2">
          Save or Share Your Analysis
        </h2>
        <p className="text-xs text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
          Export your complete one-day nutrition report as an offline PDF or share your summary with family.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Download PDF button */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExportingPdf}
            className="no-print inline-flex items-center gap-2 min-h-[44px] px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white text-sm font-semibold shadow-md shadow-orange-500/20 transition-colors"
          >
            <Download className="w-4 h-4" />
            {isExportingPdf ? 'Generating PDF…' : 'Download PDF Report'}
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            className="no-print inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-700 dark:text-gray-200 text-sm font-medium transition-colors"
          >
            {shareSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-gray-500" />
                <span>Share Summary</span>
              </>
            )}
          </button>

          {/* Retake analysis button */}
          <button
            type="button"
            onClick={handleRetake}
            className="no-print inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-medium transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Retake Analysis</span>
          </button>
        </div>
      </section>
    </motion.div>
  </motion.div>
</div>
);
}
