import React, { useState, useEffect } from 'react';
import type { FoodItem, MealKey } from '../../types';
import { X, Check } from 'lucide-react';

interface QuantityModalProps {
  isOpen: boolean;
  mealKey: MealKey;
  food: FoodItem | null;
  initialQuantity?: number;
  initialSource?: 'home' | 'restaurant';
  isEditing?: boolean;
  onConfirm: (quantity: number, source: 'home' | 'restaurant') => void;
  onClose: () => void;
}

const PRESET_QUANTITIES = [0.5, 1, 1.5, 2, 3];

export const QuantityModal: React.FC<QuantityModalProps> = ({
  isOpen,
  mealKey,
  food,
  initialQuantity = 1,
  initialSource = 'home',
  isEditing = false,
  onConfirm,
  onClose,
}) => {
  const [quantity, setQuantity] = useState<number>(initialQuantity);
  const [isCustom, setIsCustom] = useState<boolean>(!PRESET_QUANTITIES.includes(initialQuantity));
  const [customValue, setCustomValue] = useState<string>(String(initialQuantity));
  const [source, setSource] = useState<'home' | 'restaurant'>(initialSource);

  // Sync state when food/initial values change
  useEffect(() => {
    if (isOpen) {
      setQuantity(initialQuantity);
      setIsCustom(!PRESET_QUANTITIES.includes(initialQuantity));
      setCustomValue(String(initialQuantity));
      setSource(initialSource);
    }
  }, [isOpen, initialQuantity, initialSource]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !food) return null;

  const mealLabels: Record<MealKey, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snacks: 'Snacks',
  };

  const currentQuantity = isCustom ? parseFloat(customValue) || 0 : quantity;
  const baseKcal = food.nutrients.kcal;
  const estimatedKcal = Math.round(baseKcal * Math.max(0, currentQuantity));

  const handlePresetClick = (val: number) => {
    setQuantity(val);
    setIsCustom(false);
    setCustomValue(String(val));
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomValue(e.target.value);
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val > 0) {
      setQuantity(val);
    }
  };

  const handleSave = () => {
    const finalQuantity = isCustom ? parseFloat(customValue) : quantity;
    if (isNaN(finalQuantity) || finalQuantity <= 0) return;
    onConfirm(finalQuantity, source);
  };

  const isValid = !isNaN(currentQuantity) && currentQuantity > 0 && currentQuantity <= 50;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quantity-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-200"
    >
      <div
        className="w-full sm:max-w-md bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-3xl border border-gray-100 dark:border-gray-700 shadow-2xl p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              {food.emoji}
            </span>
            <div>
              <h3
                id="quantity-modal-title"
                className="text-base sm:text-lg font-heading font-bold text-gray-900 dark:text-white"
              >
                {food.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                1 serving = {food.servingLabel}{' '}
                {food.gramsPerServing ? `(~${food.gramsPerServing}g)` : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 inline-flex items-center justify-center"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Serving Quantity Selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
            Select Number of Servings:
          </label>
          <div className="grid grid-cols-5 gap-1.5" role="group" aria-label="Quick quantity presets">
            {PRESET_QUANTITIES.map((val) => {
              const selected = !isCustom && quantity === val;
              return (
                <button
                  type="button"
                  key={val}
                  onClick={() => handlePresetClick(val)}
                  aria-pressed={selected}
                  className={`min-h-[44px] rounded-xl font-semibold text-sm border transition-all focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
                    selected
                      ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
                      : 'bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-650 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {val}
                </button>
              );
            })}
          </div>

          {/* Custom option */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsCustom(true)}
              className={`w-full min-h-[44px] px-3 py-2 rounded-xl border text-xs font-medium flex items-center justify-between transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
                isCustom
                  ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/30 text-primary-900 dark:text-primary-100 font-semibold'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-600 dark:text-gray-300'
              }`}
            >
              <span>Custom amount</span>
              {isCustom && <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />}
            </button>

            {isCustom && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.25"
                  value={customValue}
                  onChange={handleCustomChange}
                  autoFocus
                  aria-label="Custom serving quantity"
                  placeholder="e.g. 2.5"
                  className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-primary-500 bg-white dark:bg-gray-750 text-sm text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0 font-medium">
                  {food.servingLabel}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Source: Home vs Restaurant */}
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-200">
            Preparation Source:
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSource('home')}
              className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
                source === 'home'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-900 dark:text-primary-100 font-semibold'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-300'
              }`}
            >
              🏡 Home-cooked
            </button>
            <button
              type="button"
              onClick={() => setSource('restaurant')}
              className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-medium transition-colors focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
                source === 'restaurant'
                  ? 'border-primary-600 bg-primary-50 dark:bg-primary-950/40 text-primary-900 dark:text-primary-100 font-semibold'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-300'
              }`}
            >
              🏪 Restaurant / Takeaway
            </button>
          </div>
          {source === 'restaurant' && (
            <p className="text-[11px] text-amber-700 dark:text-amber-400">
              * Applies 20% higher fat and 30% higher sodium multiplier per ICMR food service standards.
            </p>
          )}
        </div>

        {/* Live Estimated Energy preview */}
        <div className="p-3 bg-orange-50/70 dark:bg-gray-750 rounded-2xl flex items-center justify-between border border-orange-100 dark:border-gray-700">
          <span className="text-xs text-gray-600 dark:text-gray-300">Total Energy:</span>
          <span className="text-base font-bold text-primary-700 dark:text-primary-300">
            ~{estimatedKcal} kcal
          </span>
        </div>

        {/* Action Button */}
        <button
          type="button"
          disabled={!isValid}
          onClick={handleSave}
          className={`w-full min-h-[48px] py-3 px-4 rounded-2xl font-semibold text-sm transition-all focus:outline-hidden focus:ring-2 focus:ring-primary-500 ${
            isValid
              ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-md active:scale-98'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
        >
          {isEditing
            ? `Update ${mealLabels[mealKey]}`
            : `Add to ${mealLabels[mealKey]}`}
        </button>
      </div>
    </div>
  );
};

export default QuantityModal;
