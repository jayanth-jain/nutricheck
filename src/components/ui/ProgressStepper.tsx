import React from 'react';
import { Check } from 'lucide-react';

interface ProgressStepperProps {
  currentStep: number;
  steps: string[];
}

export const ProgressStepper: React.FC<ProgressStepperProps> = ({ currentStep, steps }) => {
  const progressPercent = Math.round(((currentStep - 1) / (steps.length - 1)) * 100);

  return (
    <nav aria-label="Progress" className="w-full mb-6">
      <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
        <span className="font-semibold text-primary-700 dark:text-primary-300">
          Step {currentStep} of {steps.length}
        </span>
        <span className="text-gray-600 dark:text-gray-300 font-medium">
          {steps[currentStep - 1]}
        </span>
      </div>

      {/* Visual progress bar */}
      <div
        role="progressbar"
        aria-valuenow={currentStep}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-valuetext={`Step ${currentStep} of ${steps.length}: ${steps[currentStep - 1]}`}
        className="w-full h-2 bg-orange-100 dark:bg-gray-700 rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-primary-600 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${Math.max(10, progressPercent)}%` }}
        />
      </div>

      {/* Accessible Stepper list */}
      <ol className="flex items-center justify-between mt-3 px-1 text-xs" role="list">
        {steps.map((stepName, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <li
              key={stepName}
              className={`flex items-center gap-1.5 ${
                isCurrent
                  ? 'text-primary-600 dark:text-primary-400 font-bold'
                  : isCompleted
                  ? 'text-secondary-700 dark:text-secondary-400 font-medium'
                  : 'text-gray-400 dark:text-gray-500 font-normal'
              }`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              <span
                className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                  isCompleted
                    ? 'bg-secondary-100 dark:bg-secondary-900/50 text-secondary-700 dark:text-secondary-300'
                    : isCurrent
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" aria-hidden="true" /> : stepNumber}
              </span>
              <span className="hidden sm:inline">{stepName}</span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default ProgressStepper;
