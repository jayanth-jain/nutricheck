import type { SwapRule } from '../types';

export const SWAP_RULES: SwapRule[] = [
  {
    fromFoodId: 'rice',
    toFoodId: 'brown_rice',
    reason: 'Brown rice offers 3x the dietary fibre and higher micronutrients with a lower glycemic response.',
  },
  {
    fromFoodId: 'paratha',
    toFoodId: 'roti',
    reason: 'Roti is dry-roasted, cutting fat by over 75% compared to shallow-fried paratha.',
  },
  {
    fromFoodId: 'aloo_paratha',
    toFoodId: 'roti',
    reason: 'Switching from stuffed fried paratha to whole wheat roti cuts fat and calorie density.',
  },
  {
    fromFoodId: 'samosa',
    toFoodId: 'sprouts',
    reason: 'Sprouts provide over double the protein, zero deep-frying, and 10x less sodium than a samosa.',
  },
  {
    fromFoodId: 'samosa',
    toFoodId: 'fruit_chaat',
    reason: 'Fruit chaat cuts saturated fat and sodium while providing essential Vitamin C and fibre.',
  },
  {
    fromFoodId: 'pakora',
    toFoodId: 'sprouts',
    reason: 'Sprouts provide clean plant protein and fiber without the heavy saturated fat of deep-fried pakoras.',
  },
  {
    fromFoodId: 'vada_pav',
    toFoodId: 'sprouts',
    reason: 'Replacing fried potato and refined pav with sprouted legumes provides 2x protein with minimal sodium.',
  },
  {
    fromFoodId: 'namkeen',
    toFoodId: 'sprouts',
    reason: 'Fresh sprouts eliminate high sodium and fried oils while boosting bioavailable micronutrients.',
  },
  {
    fromFoodId: 'namkeen',
    toFoodId: 'peanuts',
    reason: 'Roasted peanuts offer healthy monounsaturated fats and protein without the added sodium of namkeen.',
  },
  {
    fromFoodId: 'cornflakes_milk',
    toFoodId: 'oats',
    reason: 'Oats provide slow-digesting beta-glucan fiber and no added sugar compared to ultra-processed cornflakes.',
  },
  {
    fromFoodId: 'biscuits',
    toFoodId: 'peanuts',
    reason: 'Peanuts provide satisfying protein and healthy fats instead of refined flour and sugar.',
  },
  {
    fromFoodId: 'biscuits',
    toFoodId: 'dry_fruits',
    reason: 'Dry fruits provide natural sweetness, iron, and fiber without refined hydrogenated fats and sugar.',
  },
];
