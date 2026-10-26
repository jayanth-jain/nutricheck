# NutriCheck — Product Requirements Document (PRD)

## 1. Executive Summary & Problem Statement
Urban and semi-urban Indian adults frequently consider their regular home-cooked diet healthy and balanced. However, extensive epidemiological evidence (including the National Family Health Survey NFHS-5) demonstrates widespread micronutrient gaps across the Indian population: 57% of women and 25% of men aged 15–49 are anaemic, while deficiencies in bioavailable iron, dietary fibre, calcium, vitamin B12, and vitamin D remain endemic even in calorie-sufficient households.

Existing dietary tracking solutions suffer from severe structural drawbacks for Indian consumers:
1. **Western-Centric Food Databases:** Portions are measured in ounces, grams, or cups rather than natural Indian kitchen units (katori, roti, piece, plate).
2. **Opaque or Inaccurate Standards:** Apps evaluate intake against generic USDA or WHO guidelines instead of ICMR-NIN (National Institute of Nutrition) reference intakes formulated for Indian adult body composition and cereal-dominant staple diets.
3. **Privacy Intrusion:** Commercial fitness platforms mandate phone number / cloud signups and monetize health data.

NutriCheck solves this by delivering an instant, privacy-first, client-only diet analyzer anchored in ICMR-NIN 2020 RDA benchmarks and Indian food portion sizes.

---

## 2. Target Users
- **Primary Persona:** Urban and semi-urban Indian adults (ages 18–60) who eat home-cooked meals, mess food, or regional staples and want to know whether they are meeting daily nutritional needs.
- **Secondary Persona:** Health-conscious individuals seeking actionable food swaps (e.g. replacing refined grains with whole pulses or adding citrus to boost iron absorption).
- **Special Cohorts (with Guardrails):**
  - Adolescents (ages 13–17): Provided with growth-supportive messaging without adult BMI stigmatization or weight-loss options.
  - Pregnant / Lactating users: Shifted to informational guidance emphasizing professional clinical consultation.

---

## 3. Goals & Success Metrics

### Product Goals
1. **Frictionless Entry:** Allow an Indian user to complete a 1-day food recall in under 2 minutes without registering or creating an account.
2. **Transparent Scientific Scoring:** Provide an open 0–100 nutrition score broken into 6 explainable components (Calories, Macros, Protein, Fibre, Micronutrients, Moderation).
3. **Actionable Indian Insights:** Suggest computed food swaps using locally available staples (e.g., roasted chana instead of fried namkeen).
4. **Complete Privacy:** 100% client-side computation with zero server storage, telemetry, or analytics.

### Success Metrics
- **Task Completion Time:** Average time from landing page to results view < 120 seconds.
- **Scoring Accuracy:** 100% algorithmic consistency between intake calculations and ICMR-NIN 2020 RDA tables across test suites.
- **Privacy Verification:** Zero outgoing network requests for profile or food data during the entire session lifecycle.
- **Export Utility:** Successful in-browser PDF report generation and download in under 3 seconds.

---

## 4. User Stories

1. **User Story 1 (Quick Dietary Health Check):**  
   *As an Indian software professional eating home-cooked roti, dal, and rice,*  
   *I want to quickly log what I ate today using natural measures like katoris and rotis,*  
   *So that I can see if my protein, iron, and calcium intake meet ICMR-NIN recommendations without weighing food on a scale.*

2. **User Story 2 (Discovering Micronutrient Gaps):**  
   *As a 28-year-old vegetarian woman,*  
   *I want to understand why my iron or B12 might be low despite eating three full meals a day,*  
   *So that I can learn about absorption inhibitors (like chai right after food) and enhancers (like lemon on dal).*

3. **User Story 3 (Actionable Food Swaps):**  
   *As an office worker struggling with evening snack choices,*  
   *I want to receive concrete, culturally relevant food swaps based on my low nutrients,*  
   *So that I can choose realistic alternatives (e.g., sprouts or paneer roll over samosas) without overhauling my entire lifestyle.*

4. **User Story 4 (Portable Results):**  
   *As a user consulting an independent nutritionist or doctor,*  
   *I want to download a clean, single-page PDF report of my daily intake and gaps directly from my browser,*  
   *So that I can discuss my dietary habits during my clinical appointment without sharing personal credentials.*

5. **User Story 5 (Adolescent / Underweight Protection):**  
   *As a 16-year-old student or an adult with BMI < 18.5,*  
   *I want the application to prevent me from selecting restrictive calorie-deficit diets,*  
   *So that I am guided safely toward nourishing weight gain and maintenance instead of disordered eating patterns.*

---

## 5. Non-Goals
- **No Medical Diagnosis:** NutriCheck does not diagnose nutritional deficiencies, anaemia, or medical illnesses. Blood laboratory tests are required for clinical diagnosis.
- **No Backend / Database Storage:** No cloud database, user login, social authentication, or server-side telemetry will be built.
- **No Users Under 13:** Children under 13 are strictly out of scope due to paediatric clinical complexity and COPPA/data governance principles.
- **No Commercial Endorsements:** No brand promotions, affiliate supplement sales, or sponsored food placements.

---

## 6. Risks & Mitigations

| Risk | Impact | Mitigation Strategy |
|---|---|---|
| **Medical Liability / Misinterpretation** | User interprets low intake score as clinical illness or relies on app instead of a doctor. | High-visibility educational disclaimers on Landing, About, and Results views; clear distinction between "one-day recall" and "laboratory diagnosis". |
| **Data Inaccuracy & Invented Values** | Food nutrient values or RDA benchmarks deviate from national standards. | Every single constant explicitly cites source and year (ICMR-NIN 2020/2024, IFCT 2017, NFHS-5). Only 2 verified statistics used on Landing. No fabricated numbers. |
| **Harmful Calorie Deficits** | Minors or underweight individuals attempt aggressive weight loss. | Safety engine enforces calorie floors (1200 kcal female, 1500 kcal male), hides "Lose weight" for users < 18 or BMI < 18.5, and shows adolescent-specific growth guidance. |
| **Portion Size Variation** | Household katoris vary from 100ml to 200ml, creating estimation error. | Clear assumptions documented on About page; standardized reference volume (~150ml katori); explicit notation that numbers are estimates. |
| **Privacy Leaks** | Ephemeral user data persisted inadvertently or leaked via network calls. | Exclusively uses `sessionStorage` (auto-cleared on tab close); zero third-party tracking scripts; client-side PDF generation via jsPDF. |
