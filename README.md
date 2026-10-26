# NutriCheck — Indian Diet Analyzer

> Discover What Your Plate is Missing 🍽️

NutriCheck analyzes your daily Indian food intake against ICMR-NIN 2020 nutritional reference values. 100% private — everything runs in your browser.

## Screenshots
*[Screenshot placeholder]*

## Quick Start

```bash
# Install dependencies
npm install

# Start local development server (http://localhost:5173)
npm run dev

# Run unit tests
npm run test

# Run linter
npm run lint

# Build for production
npm run build
```

## Data Sources
- **ICMR-NIN "Nutrient Requirements for Indians — RDA and EAR 2020"** — National Institute of Nutrition, Hyderabad. Reference values for Protein, Iron, Calcium, Iodine, Folate, Vitamin C, Vitamin B12, and Vitamin D.
- **ICMR-NIN "Dietary Guidelines for Indians 2024"** — National Institute of Nutrition, Hyderabad. Energy distribution ratios, dietary fibre targets, sodium limits, and practical protein adjustments.
- **Indian Food Composition Tables 2017 (IFCT 2017)** — Longvah T. et al., NIN Hyderabad. Food database macro- and micronutrient composition.
- **National Family Health Survey 5 (NFHS-5, 2019–21)** — Ministry of Health & Family Welfare, Government of India. Epidemiological statistics on anaemia prevalence.

## Limitations
- **One-day food recall:** Cannot diagnose clinical nutrient deficiencies; blood tests are required.
- **Database scope:** 46 common Indian foods in current database; regional and seasonal coverage is growing.
- **Micronutrient estimation:** Micronutrient values are estimates based on IFCT 2017 ranges.
- **Educational only:** Not a substitute for professional medical advice, clinical diagnosis, or medical nutrition therapy.

## Privacy Guarantee
- **`sessionStorage` only:** Data is stored strictly in temporary browser session storage and cleared when you close the tab or click "Retake Analysis".
- **Zero telemetry:** No analytics, no cookies, no tracking pixels, and zero server network calls.
- **Client-side PDF:** Comprehensive nutrition report is synthesized entirely within the browser using jsPDF.

## Roadmap
- **[STRETCH (Phase 5)]:** Template-based diet plan generator, Framer Motion transitions, extended food database (100+ foods), full Hindi/Telugu localization.
- **[LATER]:** Family profiles, camera photo food recognition, multi-day/weekly tracking, offline PWA with service workers, dietitian review workflow, 500+ regional foods database.

## License
MIT License

## Report a Data Issue
Have an update or correction for a food nutrient value or regional portion size?  
[Submit an issue on GitHub](https://github.com/placeholder/nutricheck/issues) or reach out to the project maintainers.
