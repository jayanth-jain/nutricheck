import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({ score, size = 180 }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  const prefersReducedMotion =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

  // Number count-up animation
  useEffect(() => {
    if (prefersReducedMotion) {
      setAnimatedScore(score);
      return;
    }

    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / duration);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.round(eased * score);
      setAnimatedScore(start);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const reqId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(reqId);
  }, [score, prefersReducedMotion]);

  // Radius 45 on viewBox 0 0 120 120
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const targetOffset = circumference - (score / 100) * circumference;

  // Color selection
  let strokeColor = '#ef4444'; // Red < 50
  let textColorClass = 'text-red-600 dark:text-red-400';
  let bgColorClass = 'text-red-100 dark:text-red-950/40';

  if (score >= 80) {
    strokeColor = '#16a34a'; // Green >= 80
    textColorClass = 'text-emerald-600 dark:text-emerald-400';
    bgColorClass = 'text-emerald-100 dark:text-emerald-950/40';
  } else if (score >= 50) {
    strokeColor = '#f59e0b'; // Amber 50-79
    textColorClass = 'text-amber-600 dark:text-amber-400';
    bgColorClass = 'text-amber-100 dark:text-amber-950/40';
  }

  return (
    <div
      className="relative flex items-center justify-center inline-block"
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Nutrition Score: ${score} out of 100`}
    >
      <svg
        className="w-full h-full transform -rotate-90"
        viewBox="0 0 120 120"
        aria-hidden="true"
      >
        {/* Background track circle */}
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="currentColor"
          className={bgColorClass}
          strokeWidth="10"
        />
        {/* Animated progress stroke circle */}
        <motion.circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={
            prefersReducedMotion
              ? { duration: 0 }
              : { duration: 1.2, ease: 'easeOut' }
          }
        />
      </svg>
      {/* Centered score number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className={`text-4xl sm:text-5xl font-heading font-extrabold tracking-tight ${textColorClass}`}
        >
          {animatedScore}
        </span>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-0.5">
          out of 100
        </span>
      </div>
    </div>
  );
};

export default ScoreGauge;
