// src/i18n/hi.ts
// Hindi localization dictionary
import type { Translation } from './en';

export const hi: Translation = {
  app_name: 'न्यूट्रिचैक (NutriCheck)',
  tagline: 'जानिए आपकी थाली में क्या कमी है',
  cta_analyze: 'मेरी थाली की जाँच करें — मुफ़्त',
  nav_home: 'होम',
  nav_analyze: 'जाँच करें',
  nav_about: 'हमारे बारे में',
  footer_powered_by: 'ICMR-NIN संदर्भ डेटा द्वारा संचालित',
  footer_disclaimer: 'शैक्षिक उपकरण, कोई चिकित्सीय सलाह नहीं।',
  footer_privacy: 'कोई भी डेटा किसी सर्वर पर नहीं भेजा जाता।',

  app: {
    name: 'NutriCheck',
    tagline: 'जानिए आपकी थाली में क्या कमी है',
  },
  nav: {
    home: 'होम',
    analyze: 'जाँच करें',
    about: 'हमारे बारे में',
  },
  landing: {
    hero: {
      title: 'जानिए आपकी थाली में क्या कमी है',
      cta: 'मेरी थाली की जाँच करें — मुफ़्त',
      trySample: 'नमूना दिन आज़माएं',
    },
    stats: {
      source: 'स्रोत: NFHS-5, 2019–21',
    },
  },
  profile: {
    title: 'आपके बारे में',
    stepLabel: 'चरण 1 का 3',
    nextBtn: 'आगे बढ़ें →',
  },
  meals: {
    title: 'आज आपने क्या खाया?',
    stepLabel: 'चरण 2 का 3',
    analyzeBtn: 'मेरी थाली का विश्लेषण करें',
  },
  results: {
    title: 'आपका पोषण विश्लेषण',
    stepLabel: 'चरण 3 का 3',
    downloadPdf: 'पीडीएफ रिपोर्ट डाउनलोड करें',
    retake: 'पुनः विश्लेषण करें',
  },
  about: {
    title: 'NutriCheck कैसे काम करता है',
  },
  disclaimer: 'शैक्षिक उपकरण, कोई चिकित्सीय सलाह नहीं।',
  privacy: 'कोई भी डेटा किसी सर्वर पर नहीं भेजा जाता।',
  nutrient: {
    protein: 'प्रोटीन (Protein)',
    fiber: 'फाइबर (Fibre)',
    iron: 'आयरन (Iron)',
    calcium: 'कैल्शियम (Calcium)',
    vitC: 'विटामिन सी (Vitamin C)',
    vitD: 'विटामिन डी (Vitamin D)',
    b12: 'विटामिन बी12 (Vitamin B12)',
    sodium: 'सोडियम (Sodium)',
    addedSugar: 'अतिरिक्त चीनी (Added Sugar)',
  },
  status: {
    adequate: 'पर्याप्त लग रहा है',
    likely_low: 'आज कम मात्रा की संभावना है',
    very_low: 'आज बहुत कम मात्रा',
  },
};
