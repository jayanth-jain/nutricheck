# NutriCheck — Technical Specification

## 1. System Architecture

NutriCheck is an offline-capable, client-only single-page application built using React 18, TypeScript (strict mode), Vite, and Tailwind CSS. The application does not communicate with any external backend API, database, or analytics service.

### Layer Separation
1. **`src/constants/` (Scientific Grounding):** Immutable reference tables from official public health bodies (ICMR-NIN 2020 RDA, ICMR-NIN Dietary Guidelines 2024, NFHS-5). Every entry records `value`, `unit`, `source`, `year`, and `status: 'confirmed' | 'verify'`.
2. **`src/data/` (Food Informatics):** Food composition database (46 common Indian foods with portion sizes and IFCT 2017 micronutrient estimates), regional aliases, pre-computed swap rules, and demo personas.
3. **`src/engine/` (Pure Calculation Engine):** Pure, deterministic functions with zero React or browser DOM dependencies. Covers BMR, TDEE, BMI, nutrient target calculations, meal totals, safety checks, smart swaps, and the 6-component nutrition score.
4. **`src/state/` (State Management):** Ephemeral `AnalysisContext` syncing state to `sessionStorage` (`nutricheck_session`). State is immediately cleared when the tab is closed or when "Retake Analysis" is selected.
5. **`src/components/` & `src/pages/` (Presentation Layer):** Accessible UI components designed mobile-first (375px viewport target), supporting dark mode and minimum touch targets of 44×44px.
6. **`src/pdf/` (Export Layer):** Pure client-side PDF synthesis via `jspdf` and `jspdf-autotable`.

---

## 2. Pages & Routing

Routing is powered by `react-router-dom` using `HashRouter` to prevent 404 routing errors on static web servers.

| Route | Page Component | Purpose |
|---|---|---|
| `/` | `Landing.tsx` | Hero banner, NFHS-5 statistics, value propositions, 3-step walkthrough, Priya demo launcher. |
| `/analyze/profile` | `Profile.tsx` | Step 1: User biometric inputs (age, sex, height, weight, activity level, goal, diet type). Dynamic Asian Indian BMI calculation and safety gating. |
| `/analyze/meals` | `Meals.tsx` | Step 2: 4-meal recall (Breakfast, Lunch, Dinner, Snacks) with natural Indian units, alias search, and cooking source factor. |
| `/analyze/results` | `Results.tsx` | Step 3: Nutrition score (0–100), nutrient adequacy cards, bioavailability alerts, computed swaps, and PDF export. |
| `/about` | `About.tsx` | Comprehensive methodology, scientific citations, formulas, absorption rules, and privacy verification. |
| `*` | `NotFound.tsx` | 404 catch-all redirecting to `/`. |

---

## 3. Data Model

```typescript
export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active';
export type Goal = 'lose' | 'maintain' | 'gain' | 'analyze';
export type DietType = 'vegetarian' | 'eggetarian' | 'non_vegetarian' | 'vegan' | 'jain';
export type MealKey = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export interface Profile {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
  dietType?: DietType;
  region?: string;
  occupation?: string;
  sunExposure?: 'low' | 'moderate' | 'high';
  teaCoffeeCupsPerDay?: number;
  conditions?: Array<string>;
  pregnancyStatus?: 'none' | 'pregnant' | 'breastfeeding';
}

export interface Nutrients {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron?: number;
  calcium?: number;
  vitC?: number;
  b12?: number;
  vitD?: number;
  sodium?: number;
  addedSugar?: number;
}

export interface MealEntry {
  foodId: string;
  quantity: number;
  source?: 'home' | 'restaurant';
}

export type DailyMeals = Record<MealKey, MealEntry[]>;
```

---

## 4. Scientific Engine Formulas

### 4.1. Body Mass Index (BMI) & Asian Indian Cutoffs
$$\text{BMI} = \frac{\text{Weight (kg)}}{(\text{Height (m)})^2}$$

- **Underweight:** $< 18.5\text{ kg/m}^2$
- **Healthy Weight:** $18.5 - 22.9\text{ kg/m}^2$
- **Overweight:** $23.0 - 24.9\text{ kg/m}^2$
- **Obese:** $\ge 25.0\text{ kg/m}^2$  
*Source: Consensus guidelines for Asian Indian populations (2009).*

### 4.2. Basal Metabolic Rate (BMR) — Mifflin-St Jeor
- **Men:** $\text{BMR} = 10 \times \text{Weight(kg)} + 6.25 \times \text{Height(cm)} - 5 \times \text{Age} + 5$
- **Women:** $\text{BMR} = 10 \times \text{Weight(kg)} + 6.25 \times \text{Height(cm)} - 5 \times \text{Age} - 161$  
*Rationale: Harris-Benedict overestimates Indian adult BMR by 5–15%.*

### 4.3. Total Daily Energy Expenditure (TDEE) & Calorie Target
$$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier}$$
- Sedentary: $\times 1.2$
- Lightly Active: $\times 1.375$
- Moderately Active: $\times 1.55$
- Very Active: $\times 1.725$

**Goal Adjustments:**
- Weight Loss: $\text{TDEE} - 500\text{ kcal/day}$
- Weight Gain: $\text{TDEE} + 300\text{ kcal/day}$
- Maintain / Analyze: $\text{TDEE}$
- **Safety Floor:** Minimum 1,200 kcal/day (female) or 1,500 kcal/day (male).

### 4.4. Protein Target & Reference Weight Correction
- Physiological RDA: $0.83\text{ g/kg/day}$ (ICMR-NIN 2020)
- Practical Target: $1.0\text{ g/kg/day}$ (ICMR-NIN Guidelines 2024, cereal-based digestibility adjustment)
- If $\text{BMI} \ge 25$, calculate protein against reference mass: $\text{Weight}_{\text{ref}} = 25 \times (\text{Height in m})^2$.

### 4.5. Dietary Fibre Target
$$\text{Fibre Target} = \max\left(25\text{ g}, \frac{40\text{ g} \times \text{Target kcal}}{2000\text{ kcal}}\right)$$

### 4.6. Transparent 0–100 Nutrition Score Formula
The total score is the sum of 6 components:
1. **Calorie Adequacy (Max 20 pts):**
   - Let $r = \text{Intake kcal} / \text{Target kcal}$.
   - Full 20 pts if $0.90 \le r \le 1.10$.
   - Linear decay to 0 if $0.50 < r < 0.90$ or $1.10 < r < 1.50$.
   - 0 pts if $r \le 0.50$ or $r \ge 1.50$.
2. **Macronutrient Balance (Max 15 pts):**
   - 5 pts each for Carbohydrates (45–60% energy), Protein (10–15% energy), Fat (20–30% energy).
   - Linear penalty up to 10 percentage points deviation outside boundary.
3. **Protein vs Target (Max 15 pts):**
   $$\min\left(\frac{\text{Protein Intake}}{\text{Protein Practical Target}}, 1\right) \times 15$$
4. **Fibre vs Target (Max 10 pts):**
   $$\min\left(\frac{\text{Fibre Intake}}{\text{Fibre Target}}, 1\right) \times 10$$
5. **Essential Micronutrients (Max 30 pts):**
   - 5 micronutrients evaluated: Iron, Calcium, Vitamin C, Vitamin B12, Vitamin D (6 pts each).
   - Nutrients with $< 60\%$ data coverage are excluded from evaluation, and remaining evaluated nutrients are proportionally rescaled to 30.
6. **Moderation (Max 10 pts):**
   - Sodium ceiling (≤2000mg): up to 4 pts.
   - Added sugar ceiling (≤25g): up to 3 pts.
   - Fried item limit: $\max(0, 3 - \text{fried item count})$ (up to 3 pts).

---

## 5. Safety Engine & Cohort Guardrails

| Mode | Trigger Condition | System Behavior |
|---|---|---|
| **Blocked** | Age < 13 | Complete blocking banner; all analysis and scoring features disabled; referral to paediatrician. |
| **Limited** | Age 13–17 (Adolescents) | Adult BMI category withheld; adolescent disclaimer shown; weight loss goals disabled. |
| **Informational** | Pregnancy / Lactation | High-visibility maternal nutrition disclaimer; scoring and deficit goals disabled. |
| **Informational** | Diabetes / Kidney Disease | Clinical supervision banner; dietary advice framed as informational only; meal plans disabled. |
| **Floor Enforcement** | Underweight ($\text{BMI} < 18.5$) | Weight loss option disabled; calorie floor enforced at 1200/1500 kcal. |

---

## 7. Smart Food Swaps & Top Foods Engine

### 7.1. Smart Food Swaps
The swap engine identifies foods in the user's meal log that have targeted healthier substitutes based on rule-based associations (`src/data/swaps.ts`):
- Deep-fried snacks (samosa, pakora, namkeen, vada pav) → Boiled sprouts, fruit chaat, roasted peanuts.
- Refined carbs (white rice, shallow-fried paratha) → Brown rice, dry-roasted roti.
- Filter criteria: strictly respects user's dietary preferences (vegetarian, vegan, jain, allergies).

### 7.2. Top Food Sources for Nutrients
When a nutrient is flagged as `likely_low` or `very_low`, the top food engine queries the local food database for the top 3 highest-density food sources compatible with the user's diet preferences and allergies.

---

## 8. Edge Cases & Boundary Validation Rules

1. **Empty Meals:** Empty meal logs produce zero energy and nutrient intake without crashing.
2. **Fractional Quantities:** Half servings (0.5) proportionally halve all macro and micronutrient values.
3. **Multi-serving Quantities:** Quantities > 1 (e.g. 3 plates of rice) scale linearly without overflow.
4. **Zero Intake Score Handling:** Score calculations with zero intake do not produce `NaN` or unhandled exceptions; output cleanly stays ≥ 0.
5. **Non-negative Macronutrients:** Every food entry in the database contains non-negative macros (kcal ≥ 0, protein ≥ 0, carbs ≥ 0, fat ≥ 0, fiber ≥ 0).
6. **Under-13 Age Gate:** Age < 13 triggers `blocked` mode with a paediatrician referral banner and disables all analysis features.
7. **Adolescent Age Gate (13–17):** Triggers `limited` mode; suppresses adult BMI categories and disables calorie-deficit weight loss goals.
8. **Adult Transition (Age 18+):** Operates in `full` mode with all goals and standard adult Indian BMI categories enabled.
9. **Maternal Nutrition (Pregnancy/Breastfeeding):** Triggers `informational` mode, disabling scoring and deficit goals and displaying clinical guidance.
10. **Clinical Comorbidity (Diabetes/Kidney Disease):** Triggers clinical advisory banner; emphasizes physician consultation.
11. **Underweight Deficit Prohibition:** Users with BMI < 18.5 are prohibited from selecting the "Lose weight" goal, redirecting to maintenance/gain.
12. **Female Calorie Floor:** Minimum daily calorie target for females is strictly floored at 1,200 kcal/day regardless of calculated deficit.
13. **Male Calorie Floor:** Minimum daily calorie target for males is strictly floored at 1,500 kcal/day regardless of calculated deficit.
14. **Extreme Height Values:** Low or edge-case heights do not trigger divide-by-zero errors in BMI or protein calculations.
15. **Micronutrient Data Coverage:** Foods missing micronutrient data have their coverage tracked and are excluded from score denominator to prevent unfair score penalties.
16. **Food ID Integrity:** All food IDs referenced in demo personas (`PERSONAS`) and swap rules (`SWAP_RULES`) must exist in the `FOODS` database.

---

## 9. Client-Side PDF Generation

PDF export is executed strictly on the client using `jspdf` and `jspdf-autotable`:
- Generates a formatted single-page A4 nutrition summary.
- Includes user profile summary, daily score, macro breakdown table, nutrient check matrix, and clinical disclaimer.
- Operates entirely offline with zero network transfer.

---

## 10. Multi-Language Support (i18n)

NutriCheck provides client-side localization across three major Indian languages:
- **English (`en`):** Default interface language.
- **Hindi (`hi`):** Core UI labels, meal names, and guidance.
- **Telugu (`te`):** Regional terminology and guidance.
- Active language is stored in `sessionStorage` (`nutricheck_lang`) and synchronizes with `document.documentElement.lang`.

---

## 11. Ephemeral Privacy Architecture

- **Zero Remote Storage:** No database, no backend server, no telemetry or third-party cookies.
- **Ephemeral Storage:** All session state resides exclusively in `sessionStorage` (`nutricheck_session`).
- **Complete Destruction:** Closing the tab or clicking "Retake Analysis" permanently erases all session data.

---

## 12. Accessibility & Touch Standards

- **Touch Targets:** All interactive buttons and inputs meet or exceed 44×44px touch targets.
- **Screen Reader Support:** Accessible `<label>` elements with `htmlFor`/`id` pairing, ARIA live regions (`role="status"`, `aria-live="polite"`), and clear semantic headings.
- **Reduced Motion:** Respects `prefers-reduced-motion` to disable non-essential animations.
- **Color Contrast:** WCAG AA compliant text and UI contrast ratios across light and dark modes.

---

## 13. Application Resilience & Error Handling

- **React Error Boundary:** Global `<ErrorBoundary>` wraps the page router, providing a graceful fallback with "Start Over" recovery in the event of uncaught rendering errors.
- **Direct Navigation Guards:** Direct deep-linking to results (`/#/analyze/results`) without an initialized profile redirects back to `/analyze/profile`.
- **Print Optimization:** Print stylesheet cleanly formats results for offline paper/PDF printing, suppressing navigation bars, footers, and interactive action buttons (`no-print`).

---

## 14. Test Suite Structure

- `src/tests/engine.test.ts`: 45+ pure unit tests verifying formulas, conversions, scoring, and safety gating.
- `src/tests/edge-cases.test.ts`: Section 8 edge cases, boundary checks, and ID integrity tests.
- `src/tests/pages.test.tsx`: Integration tests for Profile, Meals, and Results rendering.
- `src/tests/results.test.ts`: End-to-end persona evaluations (Priya, Rahul) and PDF synthesis.
- `src/tests/app.test.tsx`: Sanity and core calculation baseline tests.

---

## 15. Definition of Done Checklist

All 15 criteria must be satisfied for production readiness:

| # | Requirement | Verification Method | Status |
|---|---|---|---|
| 1 | **Strict TypeScript Mode** | Zero compile errors with `tsc --noEmit` and strict mode enabled in `tsconfig.json`. | Verified |
| 2 | **Zero Linter Warnings** | `npm run lint` passes with 0 errors and 0 warnings (`--max-warnings 0`). | Verified |
| 3 | **Automated Test Suite** | 66+ tests passing across engine, pages, results, and edge-cases suites. | Verified |
| 4 | **Client-Side Only Architecture** | 0 outgoing network requests for user data, biometrics, or meal items. | Verified |
| 5 | **Strict Ephemeral Privacy** | State confined to `sessionStorage`; cleared on reset and tab close. | Verified |
| 6 | **Verified Scientific Citations** | Every constant explicitly attributed to ICMR-NIN 2020, 2024, or NFHS-5; 0 fabricated statistics. | Verified |
| 7 | **Enforced Calorie Floor** | Safe floor enforced: 1,200 kcal/day (female) and 1,500 kcal/day (male). | Verified |
| 8 | **Cohort Safety Gating** | Under-13 blocked; 13–17 limited mode; pregnancy/diabetes informational mode. | Verified |
| 9 | **Underweight Goal Protection** | Users with BMI < 18.5 blocked from selecting "Lose weight". | Verified |
| 10 | **Asian Indian BMI Standards** | Cutoffs (18.5, 23.0, 25.0) implemented with adolescent guardrails. | Verified |
| 11 | **Transparent 6-Component Score** | 0–100 score mathematically robust, fully explainable, and NaN-safe. | Verified |
| 12 | **Indian Portion Measures** | All 46 food items calibrated in katori, roti, piece, plate, or glass. | Verified |
| 13 | **Offline PDF Synthesis** | jsPDF report export generated in-browser without server dependencies. | Verified |
| 14 | **Accessible UI & Touch Targets** | ≥ 44×44px touch targets, ARIA live regions, `htmlFor`/`id` labels, and reduced-motion support. | Verified |
| 15 | **Hardening & Resilience** | React Error Boundary, direct navigation guards, and print stylesheet implemented. | Verified |

