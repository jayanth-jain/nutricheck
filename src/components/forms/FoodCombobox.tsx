import React, { useState, useRef, useEffect, useId } from 'react';
import type { FoodItem, MealKey, Profile } from '../../types';
import { FOODS } from '../../data/foods';
import { matchesFoodQuery } from '../../data/aliases';
import { Search, X, Filter } from 'lucide-react';

interface FoodComboboxProps {
  mealKey: MealKey;
  userProfile: Profile | null;
  onSelectFood: (food: FoodItem) => void;
  placeholder?: string;
}

export const FoodCombobox: React.FC<FoodComboboxProps> = ({
  userProfile,
  onSelectFood,
  placeholder = 'Search foods (e.g. rice, dal, roti)...',
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showOutsideDiet, setShowOutsideDiet] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  const userDiet = userProfile?.dietType;
  const userAllergies = React.useMemo(() => userProfile?.allergies || [], [userProfile?.allergies]);
  const hasDietConstraints = !!userDiet || userAllergies.length > 0;

  // Filter foods based on query, dietType, and allergies
  const filteredFoods = React.useMemo(() => {
    let list = FOODS;

    // Apply diet/allergen filtering if not overridden
    if (hasDietConstraints && !showOutsideDiet) {
      list = list.filter((item) => {
        // Diet check
        if (userDiet && !item.dietTags.includes(userDiet)) {
          return false;
        }
        // Allergens check - exclude foods containing allergens user has
        if (userAllergies.length > 0 && item.allergens.some((a) => userAllergies.includes(a))) {
          return false;
        }
        return true;
      });
    }

    if (!query.trim()) {
      return list.slice(0, 12);
    }

    return list.filter((item) => matchesFoodQuery(item, query)).slice(0, 20);
  }, [query, hasDietConstraints, showOutsideDiet, userDiet, userAllergies]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < filteredFoods.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : filteredFoods.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < filteredFoods.length) {
          const item = filteredFoods[activeIndex];
          if (item) {
            handleSelect(item);
          }
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        break;
    }
  };

  const handleSelect = (food: FoodItem) => {
    onSelectFood(food);
    setQuery('');
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const getVegIndicator = (food: FoodItem) => {
    const isEggetarian = food.dietTags.includes('eggetarian') && !food.dietTags.includes('vegetarian');
    const isNonVeg = !food.dietTags.includes('vegetarian') && !isEggetarian;

    if (isNonVeg) {
      return (
        <span
          className="w-3.5 h-3.5 border border-red-600 dark:border-red-500 rounded-xs flex items-center justify-center shrink-0"
          title="Non-Vegetarian"
          aria-label="Non-Vegetarian"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-500" />
        </span>
      );
    }

    if (isEggetarian) {
      return (
        <span
          className="w-3.5 h-3.5 border border-amber-600 dark:border-amber-500 rounded-xs flex items-center justify-center shrink-0"
          title="Contains Egg"
          aria-label="Contains Egg"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 dark:bg-amber-500" />
        </span>
      );
    }

    return (
      <span
        className="w-3.5 h-3.5 border border-secondary-600 dark:border-secondary-500 rounded-xs flex items-center justify-center shrink-0"
        title="Vegetarian"
        aria-label="Vegetarian"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-secondary-600 dark:bg-secondary-500" />
      </span>
    );
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search
          className="absolute left-3.5 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 && filteredFoods[activeIndex]
              ? `option-${filteredFoods[activeIndex].id}`
              : undefined
          }
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setActiveIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full min-h-[44px] pl-10 pr-10 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Clear food search"
            className="absolute right-2.5 min-h-[44px] min-w-[44px] inline-flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Diet Filter Toggle Note */}
      {hasDietConstraints && (
        <div className="flex items-center justify-between mt-1 px-1 text-[11px] text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-primary-500" />
            Filtered by your profile ({userDiet || 'diet preferences'})
          </span>
          <button
            type="button"
            onClick={() => setShowOutsideDiet((p) => !p)}
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium min-h-[44px] inline-flex items-center"
          >
            {showOutsideDiet ? 'Show diet-matching only' : 'Show foods outside my diet'}
          </button>
        </div>
      )}

      {/* Dropdown Options */}
      {isOpen && (
        <ul
          id={listboxId}
          ref={listboxRef}
          role="listbox"
          aria-label="Food options"
          className="absolute z-40 left-0 right-0 mt-1.5 max-h-64 overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl py-1.5 divide-y divide-gray-100 dark:divide-gray-750"
        >
          {filteredFoods.length > 0 ? (
            filteredFoods.map((food, idx) => {
              const isActive = idx === activeIndex;
              return (
                <li
                  key={food.id}
                  id={`option-${food.id}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setActiveIndex(idx)}
                  onClick={() => handleSelect(food)}
                  className={`min-h-[48px] px-3.5 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-orange-50 dark:bg-gray-700/80 text-primary-950 dark:text-white'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-750 text-gray-800 dark:text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {getVegIndicator(food)}
                    <span className="text-xl shrink-0" aria-hidden="true">
                      {food.emoji}
                    </span>
                    <div className="min-w-0">
                      <span className="block text-sm font-medium truncate">{food.name}</span>
                      <span className="block text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {food.servingLabel} {food.gramsPerServing ? `(${food.gramsPerServing}g)` : ''}
                      </span>
                    </div>
                  </div>

                  <span className="shrink-0 ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-100/70 dark:bg-gray-700 text-primary-800 dark:text-primary-300">
                    {food.nutrients.kcal} kcal
                  </span>
                </li>
              );
            })
          ) : (
            <li className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 text-center">
              No matching foods found for &ldquo;{query}&rdquo;.
              {hasDietConstraints && !showOutsideDiet && (
                <button
                  type="button"
                  onClick={() => setShowOutsideDiet(true)}
                  className="block mx-auto mt-1 text-primary-600 dark:text-primary-400 font-medium underline"
                >
                  Search outside your diet
                </button>
              )}
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default FoodCombobox;
