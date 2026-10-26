import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MacroDonutProps {
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

const COLORS = {
  Carbohydrates: '#f97316', // Orange
  Protein: '#3b82f6', // Blue
  Fat: '#eab308', // Amber/Yellow
};

export const MacroDonut: React.FC<MacroDonutProps> = ({
  proteinGrams,
  carbsGrams,
  fatGrams,
}) => {
  const pEnergy = Math.max(0, proteinGrams * 4);
  const cEnergy = Math.max(0, carbsGrams * 4);
  const fEnergy = Math.max(0, fatGrams * 9);
  const totalEnergy = pEnergy + cEnergy + fEnergy;

  const pPct = totalEnergy > 0 ? Math.round((pEnergy / totalEnergy) * 100) : 0;
  const cPct = totalEnergy > 0 ? Math.round((cEnergy / totalEnergy) * 100) : 0;
  const fPct = totalEnergy > 0 ? Math.max(0, 100 - pPct - cPct) : 0;

  const data = [
    { name: 'Carbohydrates', value: cPct, grams: carbsGrams, kcal: Math.round(cEnergy), color: COLORS.Carbohydrates },
    { name: 'Protein', value: pPct, grams: proteinGrams, kcal: Math.round(pEnergy), color: COLORS.Protein },
    { name: 'Fat', value: fPct, grams: fatGrams, kcal: Math.round(fEnergy), color: COLORS.Fat },
  ];

  const hasData = totalEnergy > 0;

  return (
    <div className="flex flex-col items-center w-full">
      {/* Visual Chart */}
      <div className="w-full h-56 relative flex items-center justify-center">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                aria-label="Macronutrient energy percentage chart"
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: number, name: string) => [`${val}% of energy`, name]}
                contentStyle={{
                  backgroundColor: '#1f2937',
                  borderRadius: '0.75rem',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                itemStyle={{ color: '#ffffff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center text-sm text-gray-400">
            No macronutrient data logged
          </div>
        )}
        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
            Energy
          </span>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            {Math.round(totalEnergy)} <span className="text-xs font-normal text-gray-500">kcal</span>
          </span>
        </div>
      </div>

      {/* Legend Chips */}
      <div className="flex flex-wrap justify-center gap-4 mt-2 mb-4 text-xs font-medium">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
          <span className="text-gray-700 dark:text-gray-300">Carbs: {cPct}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
          <span className="text-gray-700 dark:text-gray-300">Protein: {pPct}%</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block" />
          <span className="text-gray-700 dark:text-gray-300">Fat: {fPct}%</span>
        </div>
      </div>

      {/* Accessible Table Fallback for Screen Readers & Clarity */}
      <div className="w-full mt-2 overflow-x-auto">
        <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300 border-collapse">
          <caption className="sr-only">Macronutrient Distribution and Reference Comparison</caption>
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-900 dark:text-white">
              <th scope="col" className="py-2 pr-3">Macronutrient</th>
              <th scope="col" className="py-2 px-3 text-right">Intake (g)</th>
              <th scope="col" className="py-2 px-3 text-right">Energy (kcal)</th>
              <th scope="col" className="py-2 px-3 text-right">Actual %</th>
              <th scope="col" className="py-2 pl-3 text-right">ICMR-NIN Range</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            <tr>
              <td className="py-2 pr-3 font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                Carbohydrates
              </td>
              <td className="py-2 px-3 text-right">{carbsGrams.toFixed(1)} g</td>
              <td className="py-2 px-3 text-right">{Math.round(cEnergy)}</td>
              <td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-white">{cPct}%</td>
              <td className="py-2 pl-3 text-right text-gray-500">45% – 60%</td>
            </tr>
            <tr>
              <td className="py-2 pr-3 font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                Protein
              </td>
              <td className="py-2 px-3 text-right">{proteinGrams.toFixed(1)} g</td>
              <td className="py-2 px-3 text-right">{Math.round(pEnergy)}</td>
              <td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-white">{pPct}%</td>
              <td className="py-2 pl-3 text-right text-gray-500">10% – 15%</td>
            </tr>
            <tr>
              <td className="py-2 pr-3 font-medium flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                Fat
              </td>
              <td className="py-2 px-3 text-right">{fatGrams.toFixed(1)} g</td>
              <td className="py-2 px-3 text-right">{Math.round(fEnergy)}</td>
              <td className="py-2 px-3 text-right font-semibold text-gray-900 dark:text-white">{fPct}%</td>
              <td className="py-2 pl-3 text-right text-gray-500">20% – 30%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MacroDonut;
