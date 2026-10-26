import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Sparkles } from 'lucide-react';
import { useInView } from 'framer-motion';
import { useAnalysis } from '../state/AnalysisContext';
import { PERSONAS } from '../data/personas';
import { VERIFIED_STATS, CREDIBILITY_CARDS } from '../constants/stats';

function AnimatedCounter({ value, duration = 1500 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const prefersReducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion) {
      setCount(value);
      return;
    }
    let start = 0;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(Math.round(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value, duration, prefersReducedMotion]);

  return <span ref={ref}>{count}</span>;
}

export default function Landing() {
  const { dispatch } = useAnalysis();
  const navigate = useNavigate();

  const handleTrySample = () => {
    const priya = PERSONAS.find((p) => p.id === 'priya');
    if (priya) {
      dispatch({ type: 'SET_PROFILE', profile: priya.profile });
      dispatch({ type: 'SET_MEALS', meals: priya.meals });
      dispatch({ type: 'SET_STEP', step: 3 });
      navigate('/analyze/results');
    }
  };

  const handleScrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-primary-500 to-secondary-600 text-white py-20 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center">
          {/* NutriCheck Wordmark */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-sm font-semibold tracking-wide mb-6 shadow-xs border border-white/30">
            <span className="text-xl">🍽️</span>
            <span className="font-heading font-extrabold tracking-tight">NutriCheck</span>
            <span className="text-white/80 font-normal">|</span>
            <span className="text-xs uppercase font-bold tracking-wider text-orange-100 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Indian Diet Analyzer
            </span>
          </div>

          {/* Tagline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-heading font-extrabold text-white tracking-tight leading-tight max-w-4xl drop-shadow-xs">
            Discover What Your Plate is Missing
          </h1>

          {/* Subheading */}
          <p className="mt-6 text-lg sm:text-2xl text-orange-50 max-w-3xl font-normal leading-relaxed text-balance">
            Analyze your Indian diet against ICMR-NIN 2020 nutritional requirements — free, private, and takes 2 minutes.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md sm:max-w-none">
            <Link
              to="/analyze/profile"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white hover:bg-orange-50 text-primary-700 font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 min-h-[52px]"
            >
              Analyze My Diet — Free
              <ArrowRight className="w-5 h-5 text-primary-600" />
            </Link>

            <button
              type="button"
              onClick={handleScrollToHowItWorks}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-4 rounded-xl bg-black/15 hover:bg-black/25 text-white font-medium text-base border border-white/30 backdrop-blur-sm transition-colors min-h-[52px]"
            >
              How it works
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Demo Persona Quick Launch */}
          <div className="mt-5">
            <button
              type="button"
              onClick={handleTrySample}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-100 hover:text-white underline underline-offset-4 transition-colors py-1 px-3 rounded-lg hover:bg-white/10"
            >
              <span>👩🏽</span>
              <span>Try a sample day (Priya, 28y Vegetarian) →</span>
            </button>
          </div>

          {/* Trust Badges Row */}
          <div className="mt-12 pt-8 border-t border-white/20 w-full flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm font-medium text-white/95">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/15 backdrop-blur-xs border border-white/20">
              🔒 100% Private
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/15 backdrop-blur-xs border border-white/20">
              🇮🇳 Indian foods &amp; portions
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/15 backdrop-blur-xs border border-white/20">
              📊 ICMR-NIN data
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/15 backdrop-blur-xs border border-white/20">
              ⚡ 2 minutes
            </span>
          </div>
        </div>
      </section>

      {/* Statistics & Credibility Section */}
      <section className="w-full max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs uppercase font-bold tracking-widest text-primary-600 dark:text-primary-400">
            Scientifically Anchored Data
          </span>
          <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white mt-1">
            Why Indian Diet Analysis Matters
          </h2>
        </div>

        {/* 2 Stat Cards side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {VERIFIED_STATS.map((stat) => (
            <div
              key={stat.id}
              className="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-orange-100 dark:border-gray-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="text-5xl sm:text-6xl font-heading font-extrabold text-primary-600 dark:text-primary-400">
                  <AnimatedCounter value={stat.value} />{stat.unit}
                </div>
                <p className="mt-3 text-lg font-medium text-gray-800 dark:text-gray-100 leading-snug">
                  {stat.text}
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                Source: {stat.source}, {stat.year}
              </div>
            </div>
          ))}
        </div>

        {/* 2 Credibility Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CREDIBILITY_CARDS.map((card) => (
            <div
              key={card.id}
              className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-lg mb-3">
                  {card.id === 'icmr-nin' ? '🏛️' : '🥣'}
                </div>
                <h3 className="font-heading font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {card.headline}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {card.detail}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400 dark:text-gray-500">
                Verified Indian Reference Standard
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-6">
          Source: National Family Health Survey 5 (NFHS-5), 2019–21.
        </p>
      </section>

      {/* "Why NutriCheck?" Section */}
      <section className="w-full bg-orange-50/50 dark:bg-gray-900/40 border-y border-orange-100 dark:border-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-heading font-bold text-gray-900 dark:text-white">
              Most of us think we eat well
            </h2>
            <p className="text-base text-gray-600 dark:text-gray-300 mt-2 max-w-2xl mx-auto">
              Home-cooked Indian meals are hearty, but dietary staples often leave critical micronutrient blind spots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
              <span className="text-4xl mb-4" role="img" aria-label="Thinking face">
                🤔
              </span>
              <h3 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-3">
                You might be missing more than you think
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Most people eating Indian home-cooked meals still have gaps in iron, calcium, vitamin D and B12 — without knowing it.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
              <span className="text-4xl mb-4" role="img" aria-label="India flag">
                🇮🇳
              </span>
              <h3 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-3">
                Built for Indian diets
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                Uses ICMR-NIN 2020 reference values and Indian food portions — not generic Western nutrition databases.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col">
              <span className="text-4xl mb-4" role="img" aria-label="Padlock">
                🔒
              </span>
              <h3 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-3">
                Your data never leaves your device
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                All analysis runs in your browser. Nothing is stored or sent to any server.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* "How It Works" Section */}
      <section id="how-it-works" className="w-full max-w-6xl mx-auto py-20 px-4 sm:px-6 lg:px-8 scroll-mt-20">
        <div className="text-center mb-14">
          <span className="text-xs uppercase font-bold tracking-widest text-primary-600 dark:text-primary-400">
            Simple &amp; Fast
          </span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-gray-900 dark:text-white mt-1">
            Three steps to understand your plate
          </h2>
          <p className="text-base text-gray-600 dark:text-gray-300 mt-2">
            No registration, no calorie counting obsession — just an honest look at your daily nutrition.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm relative flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-heading font-bold flex items-center justify-center text-lg">
                1
              </span>
              <span className="text-3xl" role="img" aria-label="Clipboard">
                📋
              </span>
            </div>
            <h3 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-3">
              Tell us about yourself
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Age, height, weight, activity level, and diet preferences. Takes 30 seconds.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm relative flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-heading font-bold flex items-center justify-center text-lg">
                2
              </span>
              <span className="text-3xl" role="img" aria-label="Bento lunchbox">
                🍱
              </span>
            </div>
            <h3 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-3">
              Log what you ate today
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Pick from 46 Indian foods — rice, dal, roti, idli, chicken curry and more — with serving units in katori, roti, and piece.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm relative flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <span className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 font-heading font-bold flex items-center justify-center text-lg">
                3
              </span>
              <span className="text-3xl" role="img" aria-label="Bar chart">
                📊
              </span>
            </div>
            <h3 className="font-heading font-semibold text-xl text-gray-900 dark:text-white mb-3">
              See your results
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Instant comparison against ICMR-NIN requirements. Score, nutrient gaps, food swaps, and more.
            </p>
          </div>
        </div>

        {/* Mid-page Call to Action */}
        <div className="mt-12 text-center">
          <Link
            to="/analyze/profile"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-base shadow-lg shadow-orange-500/25 transition-all transform hover:-translate-y-0.5"
          >
            Start Your Free Analysis
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Trust & Limitations Section */}
      <section className="w-full max-w-4xl mx-auto pb-16 px-4 sm:px-6">
        <div className="p-6 rounded-2xl bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            NutriCheck is an educational tool. Results are based on a one-day food recall and are not a medical diagnosis. Always consult a doctor or registered dietitian for personal health guidance.
          </p>
        </div>
      </section>
    </div>
  );
}
