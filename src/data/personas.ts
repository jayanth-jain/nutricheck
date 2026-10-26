// src/data/personas.ts
// Demo personas for offline testing, demos, and walkthroughs
import type { Profile, DailyMeals } from '../types';

export interface Persona {
  id: string;
  name: string;
  avatar: string;
  role: string;
  profile: Profile;
  meals: DailyMeals;
  description: string;
}

const PERSONAS_LIST: Persona[] = [
  {
    id: 'priya',
    name: 'Priya',
    avatar: '👩🏽',
    role: 'Software Engineer, Bangalore',
    description: '28-year-old vegetarian professional eating home-cooked staples with evening tea and samosa.',
    profile: {
      age: 28,
      sex: 'female',
      heightCm: 160,
      weightKg: 58,
      activity: 'sedentary',
      goal: 'analyze',
      dietType: 'vegetarian',
      occupation: 'desk',
      teaCoffeeCupsPerDay: 2,
    },
    meals: {
      breakfast: [
        { foodId: 'tea_with_milk', quantity: 1, source: 'home' },
        { foodId: 'poha', quantity: 1, source: 'home' },
      ],
      lunch: [
        { foodId: 'rice', quantity: 2, source: 'home' },
        { foodId: 'dal', quantity: 1, source: 'home' },
        { foodId: 'salad', quantity: 1, source: 'home' },
      ],
      snacks: [
        { foodId: 'samosa', quantity: 1, source: 'home' },
      ],
      dinner: [
        { foodId: 'rice', quantity: 1, source: 'home' },
        { foodId: 'aloo_gobhi', quantity: 1, source: 'home' },
        { foodId: 'curd', quantity: 1, source: 'home' },
      ],
    },
  },
  {
    id: 'rahul',
    name: 'Rahul',
    avatar: '👨🏽',
    role: 'Product Manager, Mumbai',
    description: '34-year-old non-vegetarian with sedentary lifestyle, frequent savory snacks, and calorie-dense dinners.',
    profile: {
      age: 34,
      sex: 'male',
      heightCm: 175,
      weightKg: 76,
      activity: 'sedentary',
      goal: 'maintain',
      dietType: 'non_vegetarian',
      occupation: 'desk',
    },
    meals: {
      breakfast: [
        { foodId: 'coffee_with_milk', quantity: 1, source: 'home' },
      ],
      lunch: [
        { foodId: 'rice', quantity: 1, source: 'home' },
        { foodId: 'dal', quantity: 1, source: 'home' },
      ],
      snacks: [
        { foodId: 'namkeen', quantity: 1, source: 'home' },
      ],
      dinner: [
        { foodId: 'biryani', quantity: 2, source: 'restaurant' },
        { foodId: 'raita', quantity: 1, source: 'restaurant' },
        { foodId: 'chicken_curry', quantity: 1, source: 'restaurant' },
      ],
    },
  },
];

export const PERSONAS: Persona[] & { priya: Persona; rahul: Persona } = Object.assign(
  [...PERSONAS_LIST],
  {
    priya: PERSONAS_LIST[0]!,
    rahul: PERSONAS_LIST[1]!,
  }
);

