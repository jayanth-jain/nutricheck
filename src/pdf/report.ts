import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AnalysisResult, DailyMeals, Profile } from '../types';
import { runAnalysis } from '../engine/analysis';

export async function generatePDFReport(result: AnalysisResult): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const today = new Date().toISOString().split('T')[0] ?? 'today';

  // Helper for last autoTable finalY
  const getLastY = (fallback: number): number => {
    const last = (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable;
    return last && typeof last.finalY === 'number' ? last.finalY : fallback;
  };

  // 1. Header
  doc.setFontSize(22);
  doc.setTextColor(249, 115, 22); // Primary orange #f97316
  doc.text('NutriCheck', 15, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Indian Diet Analyzer — Report generated: ${today}`, 15, 27);

  // Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Educational tool only. Not medical advice. Based on one-day food recall.', 15, 33);

  let yPos = 42;

  // 2. Profile Summary
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Profile Summary', 15, yPos);
  yPos += 6;

  const { profile, targets, intake, score } = result;

  autoTable(doc, {
    startY: yPos,
    head: [['Field', 'Value']],
    body: [
      ['Age', `${profile.age} years`],
      ['Sex', profile.sex === 'male' ? 'Male' : 'Female'],
      ['Height', `${profile.heightCm} cm`],
      ['Weight', `${profile.weightKg} kg`],
      ['Activity Level', profile.activity.replace('_', ' ')],
      ['Goal', profile.goal],
      ['Diet Type', profile.dietType ?? 'Not specified'],
      ['Daily Calorie Target', `${targets.kcalTarget} kcal/day`],
      ['Daily Protein Target', `${targets.proteinPractical} g/day (practical)`],
    ],
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22] },
    margin: { left: 15, right: 15 },
  });

  yPos = getLastY(yPos + 40) + 10;

  // 3. Nutrition Score
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text(`Nutrition Score: ${score.total}/100`, 15, yPos);
  yPos += 6;

  autoTable(doc, {
    startY: yPos,
    head: [['Component', 'Score Earned', 'Max Points']],
    body: [
      ['Calorie adequacy', score.calorieAdequacy.toFixed(1), '20'],
      ['Macro balance', score.macroBalance.toFixed(1), '15'],
      ['Protein vs target', score.proteinVsTarget.toFixed(1), '15'],
      ['Fibre vs target', score.fibreVsTarget.toFixed(1), '10'],
      ['Micronutrients', score.micronutrients.toFixed(1), '30'],
      ['Moderation', score.moderation.toFixed(1), '10'],
      ['Total Score', score.total.toString(), '100'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [22, 163, 74] },
    margin: { left: 15, right: 15 },
  });

  yPos = getLastY(yPos + 40) + 10;

  // Check page overflow
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // 4. Nutrient Status Table
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59);
  doc.text('Nutrient Intake vs ICMR Target', 15, yPos);
  yPos += 6;

  const nutrientRows: string[][] = [
    [
      'Calories (kcal)',
      intake.kcal.toFixed(0),
      targets.kcalTarget.toString(),
      targets.kcalTarget > 0 ? `${((intake.kcal / targets.kcalTarget) * 100).toFixed(0)}%` : 'N/A',
    ],
    [
      'Protein (g)',
      intake.protein.toFixed(1),
      targets.proteinPractical.toFixed(1),
      targets.proteinPractical > 0
        ? `${((intake.protein / targets.proteinPractical) * 100).toFixed(0)}%`
        : 'N/A',
    ],
    [
      'Fibre (g)',
      intake.fiber.toFixed(1),
      targets.fiberTarget.toFixed(1),
      targets.fiberTarget > 0
        ? `${((intake.fiber / targets.fiberTarget) * 100).toFixed(0)}%`
        : 'N/A',
    ],
    [
      'Iron (mg)',
      intake.iron !== undefined ? `~${intake.iron.toFixed(1)}` : 'N/A',
      targets.iron.toString(),
      intake.iron !== undefined && targets.iron > 0
        ? `${((intake.iron / targets.iron) * 100).toFixed(0)}%`
        : 'N/A',
    ],
    [
      'Calcium (mg)',
      intake.calcium !== undefined ? `~${intake.calcium.toFixed(0)}` : 'N/A',
      targets.calcium.toString(),
      intake.calcium !== undefined && targets.calcium > 0
        ? `${((intake.calcium / targets.calcium) * 100).toFixed(0)}%`
        : 'N/A',
    ],
    [
      'Vitamin C (mg)',
      intake.vitC !== undefined ? `~${intake.vitC.toFixed(0)}` : 'N/A',
      targets.vitC.toString(),
      intake.vitC !== undefined && targets.vitC > 0
        ? `${((intake.vitC / targets.vitC) * 100).toFixed(0)}%`
        : 'N/A',
    ],
    [
      'Vitamin B12 (µg)',
      intake.b12 !== undefined ? `~${intake.b12.toFixed(1)}` : 'N/A',
      targets.b12.toString(),
      intake.b12 !== undefined && targets.b12 > 0
        ? `${((intake.b12 / targets.b12) * 100).toFixed(0)}%`
        : 'N/A',
    ],
    [
      'Vitamin D (µg)',
      intake.vitD !== undefined ? `~${intake.vitD.toFixed(1)}` : 'N/A',
      targets.vitD.toString(),
      intake.vitD !== undefined && targets.vitD > 0
        ? `${((intake.vitD / targets.vitD) * 100).toFixed(0)}%`
        : 'N/A',
    ],
    [
      'Sodium (mg)',
      intake.sodium !== undefined ? `~${intake.sodium.toFixed(0)}` : 'N/A',
      `≤${targets.sodiumUpperGuide}`,
      intake.sodium !== undefined && intake.sodium > targets.sodiumUpperGuide ? 'Above guide' : 'Within guide',
    ],
    [
      'Added Sugar (g)',
      intake.addedSugar !== undefined ? `~${intake.addedSugar.toFixed(0)}` : 'N/A',
      `≤${targets.addedSugarUpperGuide}`,
      intake.addedSugar !== undefined && intake.addedSugar > targets.addedSugarUpperGuide
        ? 'Above guide'
        : 'Within guide',
    ],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['Nutrient', 'Intake', 'Target / Guide', '% of Target / Status']],
    body: nutrientRows,
    theme: 'striped',
    headStyles: { fillColor: [249, 115, 22] },
    margin: { left: 15, right: 15 },
  });

  yPos = getLastY(yPos + 60) + 10;
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // 5. Smart Swaps
  if (result.swaps.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Smart Food Swaps', 15, yPos);
    yPos += 6;

    autoTable(doc, {
      startY: yPos,
      head: [['Instead of', 'Try', 'Reason']],
      body: result.swaps.slice(0, 6).map((s) => [s.fromFood.name, s.toFood.name, s.reason]),
      theme: 'striped',
      headStyles: { fillColor: [22, 163, 74] },
      margin: { left: 15, right: 15 },
    });

    yPos = getLastY(yPos + 30) + 10;
  }

  // 6. Data Sources and Limitations
  if (yPos > 230) {
    doc.addPage();
    yPos = 20;
  }

  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text('Scientific Data Sources', 15, yPos);
  yPos += 6;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  const sources = [
    '• ICMR-NIN "Nutrient Requirements for Indians — RDA and EAR 2020"',
    '• ICMR-NIN "Dietary Guidelines for Indians 2024"',
    '• Indian Food Composition Tables 2017 (IFCT), Longvah T. et al., NIN Hyderabad',
    '• NFHS-5 National Family Health Survey 2019–21',
  ];
  sources.forEach((s) => {
    doc.text(s, 15, yPos);
    yPos += 5;
  });

  yPos += 4;
  doc.setFontSize(8);
  doc.text(
    'Limitations: This is a one-day food recall estimate. Micronutrient values are approximate (IFCT 2017 estimates).',
    15,
    yPos,
    { maxWidth: 180 }
  );
  yPos += 6;
  doc.text(
    'Disclaimer: NutriCheck is an educational tool, not medical advice. Consult a doctor or registered dietitian for personal guidance.',
    15,
    yPos,
    { maxWidth: 180 }
  );

  // 7. Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Page ${i} of ${pageCount} — NutriCheck Report`, 105, 292, { align: 'center' });
  }

  doc.save(`NutriCheck-Report-${today}.pdf`);
}

// Backward compatibility stub
export async function generatePdfReport(
  profile: Profile,
  meals: DailyMeals
): Promise<Blob | null> {
  const result = runAnalysis(profile, meals);
  await generatePDFReport(result);
  return null;
}
