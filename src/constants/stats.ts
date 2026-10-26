// src/constants/stats.ts
// Verified statistics from NFHS-5

export interface VerifiedStat {
  id: string;
  value: number;
  unit: string;
  text: string;
  source: string;
  year: number;
  url: string;
}

export const VERIFIED_STATS: VerifiedStat[] = [
  {
    id: 'women-anaemia',
    value: 57,
    unit: '%',
    text: 'of Indian women aged 15–49 are anaemic',
    source: 'National Family Health Survey (NFHS-5)',
    year: 2021,
    url: 'http://rchiips.org/nfhs/NFHS-5_FCTS/India.pdf',
  },
  {
    id: 'men-anaemia',
    value: 25,
    unit: '%',
    text: 'of Indian men aged 15–49 are anaemic',
    source: 'National Family Health Survey (NFHS-5)',
    year: 2021,
    url: 'http://rchiips.org/nfhs/NFHS-5_FCTS/India.pdf',
  },
];

// Non-numeric credibility cards
export const CREDIBILITY_CARDS = [
  {
    id: 'icmr-nin',
    headline: 'Uses ICMR-NIN 2020 requirements',
    detail: 'Reference values from "Nutrient Requirements for Indians — RDA and EAR 2020" by the National Institute of Nutrition.',
  },
  {
    id: 'indian-portions',
    headline: 'Indian food portions',
    detail: 'Serving units in katori, roti, and pieces — not cups or ounces.',
  },
];
