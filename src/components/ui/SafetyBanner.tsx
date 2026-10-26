import React from 'react';
import type { SafetyMode } from '../../types';
import { AlertTriangle, Info, AlertOctagon } from 'lucide-react';

interface SafetyBannerProps {
  banners: string[];
  mode?: SafetyMode;
}

export const SafetyBanner: React.FC<SafetyBannerProps> = ({ banners, mode = 'informational' }) => {
  if (!banners || banners.length === 0) return null;

  const modeStyles: Record<
    SafetyMode,
    {
      bg: string;
      border: string;
      text: string;
      icon: React.ReactNode;
      label: string;
    }
  > = {
    blocked: {
      bg: 'bg-red-50 dark:bg-red-950/40',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      icon: <AlertOctagon className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" aria-hidden="true" />,
      label: 'Safety Notice',
    },
    limited: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-800 dark:text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />,
      label: 'Adolescent & Health Guidance',
    },
    informational: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />,
      label: 'Clinical & Dietary Note',
    },
    full: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" aria-hidden="true" />,
      label: 'Note',
    },
  };

  const style = modeStyles[mode] || modeStyles.informational;

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`rounded-xl border p-4 mb-4 ${style.bg} ${style.border} ${style.text} transition-colors`}
    >
      <div className="flex items-start gap-3">
        {style.icon}
        <div className="space-y-1.5 text-xs sm:text-sm">
          <span className="font-semibold block">{style.label}</span>
          {banners.map((banner, idx) => (
            <p key={idx} className="leading-relaxed">
              {banner}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SafetyBanner;
