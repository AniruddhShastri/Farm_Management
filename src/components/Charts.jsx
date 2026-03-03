import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  ComposedChart,
  Line
} from 'recharts';
import { formatEnergy, formatWater, formatCarbon, formatCurrency, formatNumber } from '../utils/unitConverter';

function Charts({ 
  biogasEnergy, 
  solarEnergy, 
  totalEnergy,
  totalEnergyRequired,
  waterHarvest, 
  waterRequired,
  carbonSequestered, 
  co2Avoided,
  financialSavings 
}) {
  // Format energy values
  const biogasFormatted = formatEnergy(biogasEnergy);
  const solarFormatted = formatEnergy(solarEnergy);
  const totalEnergyFormatted = formatEnergy(totalEnergy);
  const requiredEnergyFormatted = formatEnergy(totalEnergyRequired);

  // Energy breakdown data showing required vs generated
  const energyBreakdownData = [
    { 
      category: 'Required', 
      value: totalEnergyRequired,
      generated: 0,
      deficit: 0
    },
    { 
      category: 'Generated', 
      value: totalEnergy,
      generated: totalEnergy,
      deficit: Math.max(0, totalEnergyRequired - totalEnergy)
    }
  ];

  // Energy source breakdown - nature-inspired palette
  const energySourceData = [
    { source: 'Biogas', energy: biogasEnergy, color: '#059669' },
    { source: 'Solar', energy: solarEnergy, color: '#D97706' },
    { source: 'Grid', energy: Math.max(0, totalEnergyRequired - totalEnergy), color: '#B91C1C' }
  ];

  // Water data - required vs harvested
  const waterData = [
    { name: 'Required', value: waterRequired, color: '#57534E' },
    { name: 'Harvested', value: waterHarvest, color: '#0891B2' }
  ];
  const waterFormatted = formatWater(waterHarvest);
  const waterRequiredFormatted = formatWater(waterRequired);

  // Carbon breakdown for donut chart
  const carbonData = [
    { name: 'Sequestered', value: Math.max(0, carbonSequestered), color: '#059669' },
    { name: 'Avoided', value: Math.max(0, co2Avoided), color: '#0891B2' },
  ];
  const carbonFormatted = formatCarbon(carbonSequestered + co2Avoided);

  // Financial breakdown
  const energySavings = totalEnergy * 0.15;
  const waterSavings = waterHarvest * 0.0015;
  const financialData = [
    { category: 'Energy Savings', amount: energySavings, color: '#D97706' },
    { category: 'Water Savings', amount: waterSavings, color: '#0891B2' }
  ];

  const COLORS = ['#059669', '#D97706', '#0891B2', '#B91C1C', '#57534E'];

  return (
    <div className="space-y-8">
      {/* Energy Generation Breakdown */}
      <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
        <h3 className="text-xl font-bold text-emerald-950 mb-4">Energy Generation Breakdown</h3>
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
              <p className="text-sm text-stone-600 mb-1">Total Required</p>
              <p className="text-2xl font-bold text-emerald-950">
                {formatNumber(requiredEnergyFormatted.value)} {requiredEnergyFormatted.unit}/year
              </p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
              <p className="text-sm text-emerald-800 mb-1">Total Generated</p>
              <p className="text-2xl font-bold text-emerald-900">
                {formatNumber(totalEnergyFormatted.value)} {totalEnergyFormatted.unit}/year
              </p>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={energySourceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="source" />
            <YAxis 
              width={100}
              label={{ value: `Energy (${totalEnergyFormatted.unit}/year)`, angle: -90, position: 'left', dx: 25, style: { textAnchor: 'middle' } }}
            />
            <Tooltip 
              formatter={(value) => {
                const formatted = formatEnergy(value);
                return [`${formatNumber(formatted.value)} ${formatted.unit}/year`, 'Energy'];
              }}
            />
            <Legend />
            <Bar dataKey="energy" name="Energy Generation" fill="#059669">
              {energySourceData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-emerald-800">Biogas</p>
            <p className="text-lg font-semibold text-emerald-700">
              {formatNumber(biogasFormatted.value)} {biogasFormatted.unit}
            </p>
          </div>
          <div>
            <p className="text-sm text-amber-800">Solar</p>
            <p className="text-lg font-semibold text-amber-700">
              {formatNumber(solarFormatted.value)} {solarFormatted.unit}
            </p>
          </div>
          <div>
            <p className="text-sm text-stone-600">From Grid</p>
            <p className="text-lg font-semibold text-red-700">
              {formatNumber(formatEnergy(Math.max(0, totalEnergyRequired - totalEnergy)).value)} {formatEnergy(Math.max(0, totalEnergyRequired - totalEnergy)).unit}
            </p>
          </div>
        </div>
      </div>

      {/* Water and Carbon Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
          <h3 className="text-xl font-bold text-emerald-950 mb-4">Water Usage Analysis</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={waterData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {waterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => {
                  const formatted = formatWater(value);
                  return [`${formatNumber(formatted.value)} ${formatted.unit}/year`, ''];
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconSize={12}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-4 text-center">
            <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
              <p className="text-xs text-stone-600 mb-1">Required</p>
              <p className="text-lg font-bold text-stone-700">
                {formatNumber(waterRequiredFormatted.value)} {waterRequiredFormatted.unit}
              </p>
            </div>
            <div className="bg-cyan-50 rounded-lg p-3 border border-cyan-200">
              <p className="text-xs text-cyan-800 mb-1">Harvested</p>
              <p className="text-lg font-bold text-cyan-700">
                {formatNumber(waterFormatted.value)} {waterFormatted.unit}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
          <h3 className="text-xl font-bold text-emerald-950 mb-4">Carbon Impact Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={carbonData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={110}
                innerRadius={60}
                fill="#8884d8"
                dataKey="value"
              >
                {carbonData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => {
                  const formatted = formatCarbon(value);
                  return [`${formatNumber(formatted.value)} ${formatted.unit} CO₂e`, ''];
                }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconSize={12}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-emerald-800">Total Carbon Impact</p>
            <p className={`text-2xl font-bold ${(carbonSequestered + co2Avoided) > 0 ? 'text-emerald-700' : 'text-stone-600'}`}>
              {formatNumber(carbonFormatted.value)} {carbonFormatted.unit} CO₂e
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100">
        <h3 className="text-xl font-bold text-emerald-950 mb-4">Financial Savings Breakdown</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={financialData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" />
            <YAxis 
              width={100}
              label={{ value: 'Savings (USD/year)', angle: -90, position: 'left', dx: 25, style: { textAnchor: 'middle' } }}
            />
            <Tooltip 
              formatter={(value) => [formatCurrency(value), 'Savings']}
            />
            <Legend />
            <Bar dataKey="amount" name="Savings (USD/year)">
              {financialData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800 mb-1">Energy Savings</p>
            <p className="text-2xl font-bold text-amber-900">
              {formatCurrency(energySavings)}
            </p>
          </div>
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <p className="text-sm text-cyan-800 mb-1">Water Savings</p>
            <p className="text-2xl font-bold text-cyan-800">
              {formatCurrency(waterSavings)}
            </p>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-sm text-emerald-800 mb-1">Total Savings</p>
            <p className="text-2xl font-bold text-emerald-900">
              {formatCurrency(financialSavings)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Charts;
