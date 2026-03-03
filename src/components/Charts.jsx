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
      {/* Modern Energy Generation Breakdown */}
      <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-white/60 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/5 rounded-full -mr-16 -mt-16 blur-2xl" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Energy Generation</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Annual output by source</p>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase">Efficiency Target</span>
              <span className="text-xl font-black text-emerald-600">
                {formatNumber(totalEnergyFormatted.value)} <span className="text-xs">{totalEnergyFormatted.unit}</span>
              </span>
            </div>
            <div className="w-px h-10 bg-slate-200" />
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-slate-400 uppercase">Operational Need</span>
              <span className="text-xl font-black text-slate-800">
                {formatNumber(requiredEnergyFormatted.value)} <span className="text-xs">{requiredEnergyFormatted.unit}</span>
              </span>
            </div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={energySourceData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              barGap={12}
            >
              <defs>
                <linearGradient id="biogasGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="solarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="gridGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>

              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />

              <XAxis
                dataKey="source"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                dy={15}
              />

              <YAxis
                hide
              />

              <Tooltip
                cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const formatted = formatEnergy(data.energy);
                    return (
                      <div className="glass-card rounded-2xl p-4 shadow-2xl border-white/80 animate-in fade-in zoom-in duration-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{data.source} Output</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-black text-slate-900">{formatNumber(formatted.value)}</span>
                          <span className="text-sm font-bold text-slate-500 uppercase">{formatted.unit}/yr</span>
                        </div>
                        <div
                          className="h-1.5 w-full rounded-full mt-3 overflow-hidden bg-slate-100"
                        >
                          <div
                            className="h-full rounded-full transition-all duration-1000"
                            style={{
                              width: `${Math.min(100, (data.energy / totalEnergyRequired) * 100)}%`,
                              backgroundColor: data.color
                            }}
                          />
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 mt-2">
                          COVERS {Math.round((data.energy / totalEnergyRequired) * 100)}% OF TOTAL LOAD
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Bar
                dataKey="energy"
                radius={[12, 12, 12, 12]}
                barSize={60}
                animationBegin={200}
                animationDuration={1500}
              >
                {energySourceData.map((entry, index) => {
                  let fill = "url(#biogasGradient)";
                  if (entry.source === 'Solar') fill = "url(#solarGradient)";
                  if (entry.source === 'Grid') fill = "url(#gridGradient)";
                  return <Cell key={`cell-${index}`} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Improved Legend and Summary */}
        <div className="mt-8 grid grid-cols-3 gap-6 pt-6 border-t border-slate-100">
          <div className="group/item cursor-default">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <p className="text-[10px] font-black text-emerald-800 uppercase tracking-widest">Biogas</p>
            </div>
            <p className="text-lg font-black text-slate-800 group-hover/item:text-emerald-700 transition-colors">
              {formatNumber(biogasFormatted.value)} <span className="text-[10px] text-slate-400">{biogasFormatted.unit}</span>
            </p>
          </div>

          <div className="group/item cursor-default">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Solar</p>
            </div>
            <p className="text-lg font-black text-slate-800 group-hover/item:text-amber-600 transition-colors">
              {formatNumber(solarFormatted.value)} <span className="text-[10px] text-slate-400">{solarFormatted.unit}</span>
            </p>
          </div>

          <div className="group/item cursor-default">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
              <p className="text-[10px] font-black text-rose-800 uppercase tracking-widest">From Grid</p>
            </div>
            <p className="text-lg font-black text-slate-800 group-hover/item:text-rose-600 transition-colors">
              {formatNumber(formatEnergy(Math.max(0, totalEnergyRequired - totalEnergy)).value)} <span className="text-[10px] text-slate-400">{formatEnergy(Math.max(0, totalEnergyRequired - totalEnergy)).unit}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Modern Water and Carbon Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Water Analysis Donut */}
        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-white/60 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Water Analysis</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Self-sufficiency ratio</p>
            </div>
            <div className="p-2 bg-cyan-50 rounded-xl text-cyan-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
              </svg>
            </div>
          </div>

          <div className="h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="reqGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#94a3b8" />
                    <stop offset="100%" stopColor="#64748b" />
                  </linearGradient>
                  <linearGradient id="harvGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#0891b2" />
                  </linearGradient>
                </defs>
                <Pie
                  data={waterData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {waterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "url(#reqGradient)" : "url(#harvGradient)"} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const formatted = formatWater(data.value);
                      return (
                        <div className="glass-card rounded-xl p-3 shadow-xl border-white/80">
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{data.name}</p>
                          <p className="text-lg font-black text-slate-800">{formatNumber(formatted.value)} {formatted.unit}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Harvested</span>
              <span className="text-2xl font-black text-slate-900 leading-none">
                {Math.round((waterHarvest / waterRequired) * 100)}%
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100/50 pt-4">
            <div className="text-center">
              <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Total Needed</p>
              <p className="text-sm font-black text-slate-700">{formatNumber(waterRequiredFormatted.value)} {waterRequiredFormatted.unit}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-cyan-600 uppercase mb-1">Harvested</p>
              <p className="text-sm font-black text-cyan-700">{formatNumber(waterFormatted.value)} {waterFormatted.unit}</p>
            </div>
          </div>
        </div>

        {/* Carbon Impact Donut */}
        <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-white/60 relative overflow-hidden group">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Carbon Balance</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Net environmental offset</p>
            </div>
            <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
              </svg>
            </div>
          </div>

          <div className="h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  <linearGradient id="seqGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="avoidGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#0284c7" />
                  </linearGradient>
                </defs>
                <Pie
                  data={carbonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={8}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {carbonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "url(#seqGradient)" : "url(#avoidGradient)"} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const formatted = formatCarbon(data.value);
                      return (
                        <div className="glass-card rounded-xl p-3 shadow-xl border-white/80">
                          <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{data.name}</p>
                          <p className="text-lg font-black text-slate-800">{formatNumber(formatted.value)} {formatted.unit}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Offset</span>
              <span className="text-2xl font-black text-emerald-600 leading-none">
                {Math.abs(carbonFormatted.value) > 1000 ? (carbonFormatted.value / 1000).toFixed(1) + 'k' : formatNumber(carbonFormatted.value)}
              </span>
              <span className="text-[10px] font-bold text-slate-500 uppercase">{carbonFormatted.unit}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100/50 pt-4">
            <div className="text-center">
              <p className="text-[10px] font-bold text-emerald-600 uppercase mb-1">Sequestered</p>
              <p className="text-sm font-black text-slate-700">{formatNumber(formatCarbon(carbonSequestered).value)} {formatCarbon(carbonSequestered).unit}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold text-sky-600 uppercase mb-1">Avoided</p>
              <p className="text-sm font-black text-sky-700">{formatNumber(formatCarbon(co2Avoided).value)} {formatCarbon(co2Avoided).unit}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Financial Breakdown */}
      <div className="bg-white/40 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-white/60 relative overflow-hidden group">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Financial Yield</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Annual savings breakdown</p>
          </div>
          <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
        </div>

        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={financialData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
              <defs>
                <linearGradient id="finEnergyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#fcd34d" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
                <linearGradient id="finWaterGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#67e8f9" />
                  <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.5} />
              <XAxis
                dataKey="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
                dy={10}
              />
              <YAxis hide />
              <Tooltip
                cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-card rounded-xl p-3 shadow-xl border-white/80">
                        <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{data.category}</p>
                        <p className="text-lg font-black text-slate-800">{formatCurrency(data.amount)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="amount"
                radius={[10, 10, 10, 10]}
                barSize={80}
                animationDuration={1500}
              >
                {financialData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? "url(#finEnergyGradient)" : "url(#finWaterGradient)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-4 pt-6 border-t border-slate-100/50">
          <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/50 transition-all hover:bg-amber-50">
            <p className="text-[10px] font-black text-amber-800 uppercase tracking-widest mb-1">Energy Saving</p>
            <p className="text-xl font-black text-slate-900">{formatCurrency(energySavings)}</p>
          </div>
          <div className="bg-cyan-50/50 rounded-2xl p-4 border border-cyan-100/50 transition-all hover:bg-cyan-50">
            <p className="text-[10px] font-black text-cyan-800 uppercase tracking-widest mb-1">Water Saving</p>
            <p className="text-xl font-black text-slate-900">{formatCurrency(waterSavings)}</p>
          </div>
          <div className="bg-emerald-600 rounded-2xl p-4 shadow-lg shadow-emerald-200/50 transition-all hover:scale-[1.02] hover:bg-emerald-700">
            <p className="text-[10px] font-black text-emerald-100 uppercase tracking-widest mb-1">Gross Yield</p>
            <p className="text-xl font-black text-white">{formatCurrency(financialSavings)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Charts;
