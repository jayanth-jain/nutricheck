# NutriCheck — Data Verification & Audit TODO

This document tracks all scientific constants and food composition entries currently flagged with status `verify` or `estimate`. Prior to clinical deployment or production certification, these values should be cross-referenced against primary references:
1. **ICMR-NIN 2020:** "Nutrient Requirements for Indians — Recommended Dietary Allowances (RDA) and Estimated Average Requirements (EAR)"
2. **ICMR-NIN 2024:** "Dietary Guidelines for Indians"
3. **IFCT 2017:** "Indian Food Composition Tables", National Institute of Nutrition (ICMR).

---

## 1. Constants Requiring Primary Source Verification (`verify` status)

| Constant | Current Value | Unit | Source Listed | Verification Need |
|---|---|---|---|---|
| Vitamin C (Male) | 80 | mg/day | ICMR-NIN RDA 2020 | Confirm EAR vs RDA cutoff for adult male |
| Vitamin C (Female) | 65 | mg/day | ICMR-NIN RDA 2020 | Confirm EAR vs RDA cutoff for adult female |
| Vitamin B12 (Male) | 2.2 | µg/day | ICMR-NIN RDA 2020 | Confirm RDA across adult age groups |
| Vitamin B12 (Female) | 2.2 | µg/day | ICMR-NIN RDA 2020 | Confirm RDA across adult age groups |
| Vitamin D (Male) | 15 (600 IU) | µg/day | ICMR-NIN RDA 2020 | Verify minimal dietary vs sunlight assumptions |
| Vitamin D (Female) | 15 (600 IU) | µg/day | ICMR-NIN RDA 2020 | Verify minimal dietary vs sunlight assumptions |
| Fibre Target Base | 40g / 2000 kcal | g (min 25g) | ICMR-NIN Guidelines 2024 | Confirm dynamic calorie scaling formula |
| Sodium Upper Guide | 2000 | mg/day | ICMR-NIN Guidelines 2024 | WHO/ICMR alignment on maximum recommended ceiling |
| Added Sugar Upper Guide | 25 | g/day | ICMR-NIN Guidelines 2024 | ~5% of daily energy guideline |
| Calorie Floor (Female) | 1200 | kcal/day | Standard clinical practice | Confirm safety floor boundary |
| Calorie Floor (Male) | 1500 | kcal/day | Standard clinical practice | Confirm safety floor boundary |
| Deficit Target (Lose) | -500 | kcal/day | Standard clinical practice | Standard 0.5 kg/week deficit |
| Surplus Target (Gain) | +300 | kcal/day | Standard clinical practice | Lean mass gain baseline surplus |
| Meal Distribution: Breakfast | 20–25% | % daily energy | ICMR-NIN Guidelines 2024 | Confirm timing & macronutrient split |
| Meal Distribution: Lunch | 30–35% | % daily energy | ICMR-NIN Guidelines 2024 | Confirm timing & macronutrient split |
| Meal Distribution: Dinner | 25–30% | % daily energy | ICMR-NIN Guidelines 2024 | Confirm timing & macronutrient split |
| Meal Distribution: Snacks | 10–15% | % daily energy | ICMR-NIN Guidelines 2024 | Confirm timing & macronutrient split |

---

## 2. Food Database Micronutrient Audit (`estimate` status)

The macronutrient values (kcal, protein, carbs, fat, fiber) for all 46 foods below are standardized from the NutriCheck specification. All micronutrient values (iron, calcium, vitC, b12, vitD, sodium, addedSugar) are informed estimates derived from IFCT 2017 composite ranges and must be audited against specific IFCT 2017 food codes.

| ID | Food Name | Portion | Macros Status | Estimated Micronutrients | Audit Notes |
|---|---|---|---|---|---|
| `poha` | Poha | 1 plate (180g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Verify iron content of flattened rice vs added peanuts |
| `paratha` | Paratha | 1 pc (80g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Oil/ghee absorption factor |
| `idli` | Idli | 2 pcs (100g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Fermentation bioavailability changes |
| `dosa` | Dosa | 1 plain (110g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Oil content for plain dosa |
| `upma` | Upma | 1 bowl (160g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Semolina (rava) micronutrient profile |
| `bread_toast` | Bread Toast + Butter | 2 slices (70g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Commercial white vs brown bread fortification |
| `oats` | Oats | 1 bowl (180g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Rolled oats cooked in water |
| `cornflakes_milk` | Cornflakes + Milk | 1 bowl (200g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Commercial brand sugar and fortification variance |
| `egg_omelette` | Egg Omelette | 2 eggs (120g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Whole egg micronutrients (IFCT Code: Egg, hen) |
| `aloo_paratha` | Aloo Paratha | 1 pc (120g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Potato stuffing sodium and fat |
| `chole_bhature` | Chole Bhature | 1 serving (260g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Deep-fry fat retention |
| `tea_with_milk` | Tea with milk | 1 cup (150g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Standard 1 tsp added sugar (5g) |
| `coffee_with_milk` | Coffee with milk | 1 cup (150g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Standard 1 tsp added sugar (5g) |
| `banana` | Banana | 1 (100g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | IFCT Cavendish banana values |
| `glass_of_milk` | Glass of Milk | 1 glass (200g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Buffalo vs cow milk calcium/fat differential |
| `rice` | Rice | 1 katori (150g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Polished raw/milled rice cooked |
| `brown_rice` | Brown Rice | 1 katori (150g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Unpolished whole grain rice |
| `roti` | Roti/Chapati | 1 pc (35g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Whole wheat atta dry tawa roasted |
| `dal` | Dal | 1 katori (150g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Cooked toor/moong dal with tadka |
| `rajma` | Rajma | 1 katori (160g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Cooked kidney beans gravy |
| `chole` | Chole | 1 katori (160g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Cooked chickpea masala |
| `paneer_sabzi` | Paneer Sabzi | 1 katori (150g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Paneer cooked in onion-tomato gravy |
| `chicken_curry` | Chicken Curry | 1 katori (160g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Bone-in chicken pieces in masala gravy |
| `fish_curry` | Fish Curry | 1 katori (160g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Fresh-water / marine Indian fish average |
| `egg_curry` | Egg Curry | 2 eggs (160g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Hard-boiled eggs in onion-tomato gravy |
| `mixed_veg` | Mixed Veg | 1 katori (150g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Seasonal vegetables cooked with spices |
| `aloo_gobhi` | Aloo Gobhi | 1 katori (150g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Potato and cauliflower dry sabzi |
| `palak_paneer` | Palak Paneer | 1 katori (160g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | High non-heme iron and calcium synergy |
| `curd` | Curd/Dahi | 1 katori (120g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Plain set curd |
| `raita` | Raita | 1 katori (120g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Diluted dahi with cucumber/boondi/spices |
| `salad` | Salad | 1 plate (100g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Raw cucumber, tomato, carrot, onion slices |
| `sambar` | Sambar | 1 katori (160g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Pigeon pea dal with tamarind and drumsticks/vegetables |
| `rasam` | Rasam | 1 katori (150g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Clear tamarind, tomato and pepper broth |
| `biryani` | Biryani | 1 plate (300g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Standard chicken/mutton spiced rice preparation |
| `samosa` | Samosa | 1 pc (80g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Deep-fried maida pastry with spiced potato |
| `pakora` | Pakora/Bhajiya | 5 pcs (100g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Besan-battered deep-fried onion/potato |
| `biscuits` | Biscuits | 4 pcs (40g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Commercial tea biscuits |
| `namkeen` | Namkeen/Mixture | 1 handful (35g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Deep-fried savory spiced mix |
| `fruit_chaat` | Fruit Chaat | 1 bowl (150g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Mixed chopped fruits with chaat masala |
| `sprouts` | Sprouts | 1 katori (100g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Sprouted moong beans raw/lightly steamed |
| `dry_fruits` | Dry Fruits | handful (35g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Almonds, cashews, raisins mix |
| `peanuts` | Peanuts | handful (30g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Roasted unsalted peanuts |
| `lassi_sweet` | Lassi sweet | 1 glass (250g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Curd blended with water and sugar |
| `buttermilk` | Buttermilk/Chaas | 1 glass (200g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Diluted curd with salt and cumin |
| `vada_pav` | Vada Pav | 1 pc (120g) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Deep-fried potato batata vada in pav |
| `maggi` | Maggi | 1 pack (70g dry) | `ifct` confirmed | Fe, Ca, VitC, B12, VitD, Na, Sugar | Instant fried noodles with tastemaker sodium |

---

## 3. Action Items for IFCT Audit
- [ ] Match each food item with its official IFCT 2017 Food Code.
- [ ] Record whether each entry is based on cooked vs raw weight.
- [ ] Implement restaurant cooking factor adjustments once laboratory baseline data is validated.
- [ ] Document phytate-to-iron and phytate-to-zinc molar ratios for regional staple diets.
