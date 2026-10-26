# NutriCheck — Build Walkthrough

## Overview

NutriCheck is an offline-capable, client-only Indian diet analyzer anchored in ICMR-NIN 2020 RDA benchmarks and the Dietary Guidelines for Indians (2024). It computes nutritional adequacy across macronutrients and essential micronutrients, identifies potential absorption bottlenecks (e.g., tea with meals, phytates), highlights dietary gaps, and suggests culturally tailored food swaps without transmitting any personal data to remote servers.

---

## What Was Built Across All Phases

### Phase 0: System Groundwork & Architecture Scaffolding
- **Strict TypeScript Setup:** Fully strict typing (`strict: true`, `noImplicitAny: true`, clean tsconfig).
- **Client-Side SPA Architecture:** `HashRouter` routing prevents 404s on static hosting.
- **Layer Separation:** Clean demarcation between:
  - `src/constants/`: Grounded reference values with mandatory source citations and years.
  - `src/data/`: 46 core Indian foods, aliases, swap rules, plan templates, and demo personas.
  - `src/engine/`: Pure deterministic calculation functions with zero DOM or UI dependencies.
  - `src/state/`: Ephemeral `AnalysisContext` backed exclusively by `sessionStorage`.
  - `src/components/` & `src/pages/`: Accessible, responsive React 18 UI components.
  - `src/pdf/`: In-browser PDF generation via `jspdf` and `jspdf-autotable`.

### Phase 1: Pure Scientific Engine & Verified Constants
- **Basal Metabolic Rate (BMR):** Mifflin-St Jeor equation calibrated for Indian adult body composition.
- **Total Daily Energy Expenditure (TDEE):** Activity multiplier factors from 1.2 (sedentary) to 1.725 (very active).
- **Asian Indian BMI Classification:** Consensus thresholds:
  - Underweight: < 18.5
  - Healthy Weight: 18.5 – 22.9
  - Overweight: 23.0 – 24.9
  - Obese: ≥ 25.0
- **Safety Floors & Gating:**
  - Strict female calorie floor: 1,200 kcal/day.
  - Strict male calorie floor: 1,500 kcal/day.
  - Under-13: `blocked` mode with paediatrician consultation guidance.
  - Adolescents (13–17): `limited` mode with adult BMI suppressed and weight-loss deficit disabled.
  - Pregnancy/Lactation: `informational` mode with clinical advisory.
  - Underweight users (BMI < 18.5): weight loss goal disabled.
- **Protein Targets:**
  - Reference weight adjustment capping at BMI 25 to avoid excess burden.
  - Dual targets: Physiological RDA (0.83 g/kg) and Practical Target (1.0 g/kg) adjusting for lower cereal-pulse DIAAS bioavailability.
- **Dietary Fibre:** Target calculated as `max(25g, (40g × kcalTarget) / 2000 kcal)`.
- **Transparent 6-Component Score (0–100):**
  - Calorie Adequacy: 20 points
  - Macronutrient Balance: 15 points
  - Protein vs Practical Target: 15 points
  - Fibre vs Target: 10 points
  - Essential Micronutrients: 30 points (Iron, Calcium, Vitamin C, B12, Vitamin D with data coverage weighting)
  - Moderation: 10 points (Sodium ≤ 2000mg, Added Sugar ≤ 25g, Fried items ≤ 3)

### Phase 2: Core User Experience & Flows
- **Landing Page (`/`):** Hero section, NFHS-5 verified statistics (57% anaemic women, 25% anaemic men), feature highlights, 3-step walkthrough, and one-click Priya demo persona launcher.
- **Biometric Profile (`/analyze/profile`):** Age, sex, height (with cm to ft/in conversion), weight, activity level, goal, diet type, region, lifestyle factors, allergies, and clinical conditions. Live BMI & Calorie cards with ARIA live updates.
- **Meal Recall (`/analyze/meals`):** 4 meal buckets (Breakfast, Lunch, Dinner, Snacks), natural Indian portions (katori, roti, plate, glass, piece), alias search with regional phonetic mapping, home vs. restaurant preparation toggle, and custom food additions.
- **Analysis State Management:** Ephemeral `sessionStorage` persistence with instant reset capability.

### Phase 3: Results Visualization, Insights & PDF Export
- **Results Page (`/analyze/results`):**
  - Animated Score Gauge with qualitative status badge.
  - Score breakdown table with interactive formula disclosure.
  - Macro energy percentage donut chart and comparative reference bars.
  - Calorie intake vs. expenditure comparison bar.
  - 9 detailed Nutrient Check cards (Protein, Fibre, Iron, Calcium, Vitamin C, Vitamin D, Vitamin B12, Sodium, Added Sugar).
  - Bioavailability insights (tannin inhibitors, Vitamin C enhancers, calcium competition).
  - Meal-wise distribution table and timing insights.
  - Computed Smart Food Swaps tailored to logged meals and dietary preferences.
- **Client-Side PDF Generator:** Single-page A4 summary report generated directly in the browser via `jspdf` and `jspdf-autotable`.

### Phase 4: Polish, Design System, & Accessibility
- **Styling & Theming:** Tailwind CSS with custom palette (primary orange, secondary green, warm cream), dark mode toggle with persistent session state.
- **Mobile-First UX:** Minimum touch target sizes of 44×44px, sticky mobile action bars, collapsible detailed sections.
- **Accessibility:** Semantic HTML5 landmarks, ARIA labels on all icon-only buttons, explicit `htmlFor`/`id` form label associations, WCAG AA color contrast, and `role="status"` live regions.

### Phase 5: Stretch Enhancements
- **Internationalization (i18n):** Multi-language support across English (`en`), Hindi (`hi`), and Telugu (`te`), updating document language attributes dynamically.
- **Fluid UI Transitions:** Framer Motion page entrance/exit animations with `prefers-reduced-motion` detection.
- **Sample Plan Data:** Calibrated Indian meal plan templates.

### Phase 6: Hardening & Resilience (This Phase)
- **React Error Boundary (`src/components/ui/ErrorBoundary.tsx`):** Uncaught rendering errors are caught gracefully with a recovery screen offering a "Start Over" button.
- **Print Optimization (`src/index.css`):** Dedicated `@media print` rules; applied `no-print` classes to Navbar, Footer, and action controls on Results page.
- **Direct Navigation Guard:** Visiting `/#/analyze/results` without an initialized profile safely redirects to `/analyze/profile`.
- **Comprehensive Edge Case Test Suite (`src/tests/edge-cases.test.ts`):** 17 tests validating all Section 8 edge cases (empty meals, fractions, quantities, score NaN safety, age gates, calorie floors, underweight protection, divide-by-zero safety, and food ID integrity).
- **Document Synchronization:** Updated `docs/spec.md` with complete Sections 7–15.

---

## Test Results

### Test Suite Summary
- **Total Test Files:** 5 (`src/tests/engine.test.ts`, `src/tests/edge-cases.test.ts`, `src/tests/pages.test.tsx`, `src/tests/results.test.ts`, `src/tests/app.test.tsx`)
- **Total Tests Passing:** 83+ tests passing with zero failures.
  - `src/tests/engine.test.ts`: 45 tests (BMR, TDEE, BMI, targets, scoring, safety, swaps, top foods, insights)
  - `src/tests/edge-cases.test.ts`: 17 tests (empty meals, fractions, 3x quantities, zero-intake score NaN safety, macro validity, safety age gating 12/13/17/18, pregnancy mode, underweight goal redirection, female/male calorie floors, height divide-by-zero, coverage tracking, persona food ID validity, swap rule food ID validity)
  - `src/tests/pages.test.tsx`: 14 tests (Profile form rendering, BMI dynamic calc, adolescent safety, meals logging, aliases)
  - `src/tests/results.test.ts`: 5 tests (Priya gaps, Rahul dinner heavy, empty meal score, vegetarian swap tags, PDF report generation)
  - `src/tests/app.test.tsx`: 2 tests (Phase 0 sanity checks)

---

## Known Limitations & Scientific Assumptions

1. **One-Day Recall Window:** A single day of food recall serves as an educational snapshot; it does not replace multi-day weighed records or clinical biomarkers (e.g. serum ferritin, 25-hydroxy vitamin D).
2. **Standardized Portion Estimates:** A standard household "katori" is approximated at 150ml (~150–160g cooked portion). Actual household volumes vary from 100ml to 200ml.
3. **Micronutrient Data Availability:** Food composition values are derived from IFCT 2017. For certain complex composite Indian preparations, micronutrient estimates reflect culinary ingredient averages. Nutrients with < 60% database coverage are dynamically excluded from scoring penalties.
4. **No Medical Claims:** NutriCheck is explicitly an educational assessment tool and does not provide clinical diagnoses or replace consulting with registered dietitians or physicians.

---

## Definition of Done Checklist (Spec Section 15)

| # | Checklist Item | Status | Verification Detail |
|---|---|---|---|
| 1 | **Strict TypeScript Mode** | Complete | Strict mode enabled; zero TypeScript errors across codebase. |
| 2 | **Zero Linter Warnings** | Complete | Clean ESLint configuration with zero errors and zero warnings. |
| 3 | **Automated Test Suite** | Complete | 83+ tests passing across 5 test suites. |
| 4 | **Client-Side Only Architecture** | Complete | Zero fetch / XHR calls outside static assets; fully offline-capable. |
| 5 | **Strict Ephemeral Privacy** | Complete | All state confined to browser `sessionStorage`; wiped on tab close. |
| 6 | **Verified Scientific Citations** | Complete | All numbers derived from ICMR-NIN 2020/2024 and NFHS-5; 0 fabricated statistics. |
| 7 | **Enforced Calorie Floor** | Complete | 1,200 kcal floor (female) and 1,500 kcal floor (male) strictly maintained. |
| 8 | **Cohort Safety Gating** | Complete | Age < 13 blocked; 13–17 limited mode; pregnancy/breastfeeding informational. |
| 9 | **Underweight Goal Protection** | Complete | BMI < 18.5 users blocked from selecting weight loss. |
| 10 | **Asian Indian BMI Standards** | Complete | 18.5 / 23.0 / 25.0 cutoffs applied; adolescent adult categories withheld. |
| 11 | **Transparent 6-Component Score** | Complete | 0–100 score fully explainable, resilient to zero intake, and NaN-safe. |
| 12 | **Indian Portion Measures** | Complete | All 46 food items calibrated in katoris, rotis, plates, pieces, and glasses. |
| 13 | **Offline PDF Synthesis** | Complete | Single-page nutrition summary generated in-browser via jsPDF. |
| 14 | **Accessible UI & Touch Standards**| Complete | Touch targets ≥ 44×44px, ARIA live regions, `htmlFor`/`id` labels, and reduced motion support. |
| 15 | **Hardening & Resilience** | Complete | React Error Boundary, direct navigation guard, and print stylesheet implemented. |

---

## Next Steps (Roadmap & Enhancements)

- **Extended Food Catalog:** Expand beyond the 46 core foods to 100+ regional dishes using IFCT 2017 composite tables.
- **Offline Progressive Web App (PWA):** Register service worker for complete home-screen installability.
- **Family / Multi-Day Recall:** Support saving up to 3 days of food records locally to provide rolling averages.
