// src/i18n/en.ts
// English localization dictionary

export const en = {
  // Flat legacy keys
  app_name: 'NutriCheck',
  tagline: 'Discover What Your Plate is Missing',
  cta_analyze: 'Analyze My Diet — Free',
  nav_home: 'Home',
  nav_analyze: 'Analyze',
  nav_about: 'About',
  footer_powered_by: 'Powered by ICMR-NIN reference data',
  footer_disclaimer: 'Educational tool, not medical advice.',
  footer_privacy: 'No data stored or sent to any server.',

  // Structured keys for components
  app: {
    name: 'NutriCheck',
    tagline: 'Discover What Your Plate is Missing',
  },
  nav: {
    home: 'Home',
    analyze: 'Analyze',
    about: 'About',
  },
  landing: {
    hero: {
      title: 'Discover What Your Plate is Missing',
      cta: 'Analyze My Diet — Free',
      trySample: 'Try a sample day',
    },
    stats: {
      source: 'Source: NFHS-5, 2019–21',
    },
  },
  profile: {
    title: 'About You',
    stepLabel: 'Step 1 of 3',
    nextBtn: 'Next →',
  },
  meals: {
    title: 'What did you eat today?',
    stepLabel: 'Step 2 of 3',
    analyzeBtn: 'Analyze My Diet',
  },
  results: {
    title: 'Your Nutrition Analysis',
    stepLabel: 'Step 3 of 3',
    downloadPdf: 'Download PDF Report',
    retake: 'Retake Analysis',
  },
  about: {
    title: 'How NutriCheck Works',
  },
  disclaimer: 'Educational tool, not medical advice.',
  privacy: 'No data stored or sent to any server.',
  nutrient: {
    protein: 'Protein',
    fiber: 'Fibre',
    iron: 'Iron',
    calcium: 'Calcium',
    vitC: 'Vitamin C',
    vitD: 'Vitamin D',
    b12: 'Vitamin B12',
    sodium: 'Sodium',
    addedSugar: 'Added Sugar',
  },
  status: {
    adequate: 'Looks adequate',
    likely_low: 'Likely low intake today',
    very_low: 'Very low intake today',
  },
};

export type Translation = typeof en;
