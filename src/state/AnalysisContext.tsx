import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Profile, DailyMeals, MealKey } from '../types';

const SESSION_KEY = 'nutricheck_session';

export interface AnalysisState {
  profile: Profile | null;
  meals: DailyMeals;
  step: number; // 1 = profile, 2 = meals, 3 = results
}

const emptyMeals: DailyMeals = {
  breakfast: [],
  lunch: [],
  dinner: [],
  snacks: [],
};

const initialState: AnalysisState = {
  profile: null,
  meals: emptyMeals,
  step: 1,
};

type Action =
  | { type: 'SET_PROFILE'; profile: Profile }
  | { type: 'SET_MEALS'; meals: DailyMeals }
  | { type: 'ADD_MEAL_ENTRY'; meal: MealKey; entry: import('../types').MealEntry }
  | { type: 'REMOVE_MEAL_ENTRY'; meal: MealKey; index: number }
  | { type: 'UPDATE_MEAL_ENTRY'; meal: MealKey; index: number; entry: import('../types').MealEntry }
  | { type: 'SET_STEP'; step: number }
  | { type: 'RESET' };

function reducer(state: AnalysisState, action: Action): AnalysisState {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, profile: action.profile };
    case 'SET_MEALS':
      return { ...state, meals: action.meals };
    case 'ADD_MEAL_ENTRY':
      return {
        ...state,
        meals: { ...state.meals, [action.meal]: [...state.meals[action.meal], action.entry] },
      };
    case 'REMOVE_MEAL_ENTRY':
      return {
        ...state,
        meals: {
          ...state.meals,
          [action.meal]: state.meals[action.meal].filter((_, i) => i !== action.index),
        },
      };
    case 'UPDATE_MEAL_ENTRY': {
      const entries = [...state.meals[action.meal]];
      entries[action.index] = action.entry;
      return { ...state, meals: { ...state.meals, [action.meal]: entries } };
    }
    case 'SET_STEP':
      return { ...state, step: action.step };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

const AnalysisContext = createContext<{
  state: AnalysisState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      return saved ? JSON.parse(saved) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
  }, [state]);

  return (
    <AnalysisContext.Provider value={{ state, dispatch }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error('useAnalysis must be used inside AnalysisProvider');
  return ctx;
}

export function useTotalMealCount(meals: DailyMeals) {
  return Object.values(meals).reduce((sum, m) => sum + (m?.length || 0), 0);
}
