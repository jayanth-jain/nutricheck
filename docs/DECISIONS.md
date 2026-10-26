# NutriCheck — Architectural & Technical Decisions

This document records the foundational scientific, ethical, and architectural decisions made throughout the design and implementation of NutriCheck.

---

## 1. Mifflin-St Jeor over Harris-Benedict Formula
- **Context:** Selecting an appropriate basal metabolic rate (BMR) prediction equation for Indian adults.
- **Decision:** Use the Mifflin-St Jeor equation rather than the legacy Harris-Benedict formula.
- **Rationale:** Multiple clinical evaluations demonstrate that Harris-Benedict overestimates resting energy expenditure by 5–15% in contemporary Indian adults due to differences in fat-free mass and body fat percentage at equivalent BMIs. ICMR-NIN 2020 updated reference adult weights (65kg male, 55kg female) and lowered metabolic baselines. Mifflin-St Jeor aligns significantly closer to measured indirect calorimetry in Indian populations.

---

## 2. Asian Indian BMI Cutoffs (23 / 25) vs. Western Cutoffs (25 / 30)
- **Context:** Defining healthy, overweight, and obesity weight thresholds for users.
- **Decision:** Implement consensus Asian Indian BMI classifications:
  - Underweight: $< 18.5$
  - Healthy Weight: $18.5 - 22.9$
  - Overweight: $23.0 - 24.9$
  - Obese: $\ge 25.0$
- **Rationale:** Asian Indian populations experience high visceral adiposity, hyperinsulinemia, and cardiovascular risk at significantly lower BMI thresholds than Caucasian populations ("thin-fat Indian phenotype"). Standard WHO international cutoffs (overweight at 25, obese at 30) fail to identify substantial cardiometabolic risk in Indian individuals.

---

## 3. Practical Protein Target (1.0 g/kg/day) vs. Physiological RDA (0.83 g/kg/day)
- **Context:** Evaluating dietary protein adequacy in cereal-dominant diets.
- **Decision:** Display the physiological RDA (0.83 g/kg/day) alongside an adjusted practical target of 1.0 g/kg/day. Use the practical target for intake adequacy calculations.
- **Rationale:** The physiological RDA of 0.83 g/kg/day assumes complete reference protein with optimal digestibility. Because typical Indian diets derive over 60% of protein from cereals and pulses with lower Digestible Indispensable Amino Acid Scores (DIAAS) and high phytate binding, ICMR-NIN Dietary Guidelines 2024 recommend 1.0 g/kg/day for cereal-dominant eating patterns to ensure adequate amino acid delivery.
- **BMI ≥ 25 Correction:** For users with BMI ≥ 25, protein target is calculated from a reference mass capped at BMI 25 for their height, avoiding artificially elevated protein burdens.

---

## 4. SessionStorage Exclusivity vs. LocalStorage / Remote Databases
- **Context:** Persisting user biometrics, meals, and results during analysis.
- **Decision:** Exclusively use browser `sessionStorage`, never `localStorage` or cloud database synchronization.
- **Rationale:** Guarantees absolute ephemeral privacy. Closing the browser tab or clicking "Retake Analysis" permanently erases all personal medical, physical, and dietary information from the device. Users can inspect their browser's Developer Tools (`Application → Session Storage`) to independently audit this zero-retention policy.

---

## 5. Strict Limitation to 2 Verified Statistics on Landing Page
- **Context:** Presenting epidemiologic statistics on the Landing page.
- **Decision:** Display only the 2 verified statistics from the National Family Health Survey (NFHS-5, 2019–21):
  - 57% of Indian women aged 15–49 are anaemic.
  - 25% of Indian men aged 15–49 are anaemic.
- **Rationale:** Never invent or fabricate health statistics for marketing persuasion. All statistical claims in NutriCheck are verified against national governmental epidemiological surveys and display exact primary source citations.

---

## 6. Standardized Katori Portion Assumption (150 ml)
- **Context:** Accommodating traditional Indian kitchen utensils in dietary recall.
- **Decision:** Standardize 1 katori to approximately 150 ml / 150–160g cooked portion across all gravies, dals, rice, and vegetables, with documented transparency.
- **Rationale:** Indian household bowls vary from 100 ml to 200 ml. Forcing users to enter grams on a digital kitchen scale causes massive entry friction and abandonment. A standardized 150 ml katori offers the optimal compromise between real-world usability and clinical nutritional estimation.

---

## 7. HashRouter for Static Client-Side Deployment
- **Context:** Client-side routing behavior across hosting platforms.
- **Decision:** Use `HashRouter` instead of `BrowserRouter`.
- **Rationale:** Prevents 404 routing errors on page refresh or deep-linking on static hosts (e.g. GitHub Pages, static CDNs) that lack server-side URL rewrite support.

---

## 8. Mobile-First Meals Recall Interface & Fixed Day Totals
- **Context:** UX constraints during a 4-meal dietary recall on mobile viewports (375px).
- **Decision:** Render a tabbed interface for Breakfast, Lunch, Dinner, and Snacks on mobile (<768px) with badge counters and a persistent bottom progress bar, while rendering a 2-column layout on desktop (≥768px).
- **Rationale:** Eliminates extensive scrolling fatigue while keeping current calorie progress and nutrient checks visible at all times.

---

## 9. Adolescent (13–17y) & Underweight Clinical Guardrails
- **Context:** Ethical protection for growing teenagers and underweight individuals.
- **Decision:**
  - Withhold adult BMI classifications for users aged 13–17; show supportive adolescent development disclaimers.
  - Completely disable calorie deficit / weight-loss goals for all minors (<18y) and individuals with BMI < 18.5.
- **Rationale:** Prevents inappropriate calorie restriction during adolescent growth spurts and eliminates clinical harm in underweight individuals.

---

## 10. Cooking Source Adjustment Factor (Home vs. Restaurant)
- **Context:** Factoring in higher fat and sodium density in restaurant / takeaway meals.
- **Decision:** Provide a source toggle per meal entry ("Home-cooked" vs "Restaurant / Takeaway"), applying a 1.2× fat and 1.3× sodium multiplier.
- **Rationale:** Restaurant preparations in India incorporate substantial extra cooking oil, ghee, and salt compared to home cooking. This factor provides more realistic sodium and fat tracking without requiring separate duplicate food entries.
