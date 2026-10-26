# NutriCheck — Scope Document

## In Scope (MVP)
- Profile form (age, sex, height, weight, activity, goal)
- Meal logger (4 meals, 46 Indian foods, portions in katori/roti/piece)
- ICMR-NIN 2020 RDA-based nutrient analysis
- Transparent 0–100 nutrition score (6-component formula)
- Nutrient cards with status, top foods, absorption tips
- Smart food swaps (computed from database)
- Meal distribution analysis
- PDF report download (browser-generated, jsPDF)
- Privacy: sessionStorage only, no network calls
- Dark mode, mobile-first, accessibility
- Two demo personas (Priya, Rahul)
- About / Methodology page

## Out of Scope (Phase 0)
- All existing health-screener content (removed)

## STRETCH (Phase 5)
- Diet plan generator (template-based)
- Framer Motion animations
- Full i18n (Hindi, Telugu)
- Extended food database (100+ foods)
- Restaurant factor UI toggle

## LATER (Not building; see README roadmap)
- Family profiles
- Photo food recognition
- Weekly tracking
- Offline PWA
- Dietitian review workflow
- IFCT full integration
- Disease-specific plans

## Assumptions
- All food database values are estimates from IFCT 2017 ranges unless confirmed
- "Katori" standardized to approximately 150ml for this tool
- Protein practical target (1.0 g/kg) used for assessment
- Asian Indian BMI cutoffs applied (Overweight ≥ 23, Obese ≥ 25)
