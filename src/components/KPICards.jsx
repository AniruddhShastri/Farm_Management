import React from 'react';
import { formatCurrency, formatCarbon, formatNumber } from '../utils/unitConverter';

function KPICard({ title, value, unit, subtitle, icon, colorClass, gradientFrom }) {
  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden group transition-all duration-500 hover:shadow-xl hover:-translate-y-1 border-white/10/10">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradientFrom} to-transparent opacity-10 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150`} />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</h3>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${colorClass} text-white transform transition-transform group-hover:rotate-12`}>
            {icon}
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-3xl font-black tracking-tight text-white leading-none">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">
              {unit}
            </span>
          )}
        </div>

        <p className="text-[10px] font-bold text-slate-400 tracking-wide uppercase">{subtitle}</p>
      </div>
    </div>
  );
}

function KPICards({ financialSavings, energyIndependence, carbonImpact }) {
  const carbonFormatted = formatCarbon(Math.abs(carbonImpact));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <KPICard
        title="Annual Savings"
        value={formatCurrency(financialSavings).replace('$', '')}
        unit="$"
        subtitle="Saved through efficiency"
        icon={<span className="text-lg font-bold">$</span>}
        colorClass="bg-emerald-600 shadow-emerald-200"
        gradientFrom="from-emerald-400"
      />

      <KPICard
        title="Energy Autonomy"
        value={parseFloat(energyIndependence.toFixed(1))}
        unit="%"
        subtitle="Self-generated power"
        icon={<span className="text-lg">⚡</span>}
        colorClass="bg-yellow-400/100 shadow-amber-200"
        gradientFrom="from-amber-400"
      />

      <KPICard
        title="Carbon Balance"
        value={`${carbonImpact < 0 ? '-' : '+'}${formatNumber(carbonFormatted.value)}`}
        unit={carbonFormatted.unit}
        subtitle={carbonImpact < 0 ? 'Climate Positive' : 'Net Emissions'}
        icon={<span className="text-lg">🌱</span>}
        colorClass="bg-sky-600 shadow-sky-200"
        gradientFrom="from-sky-400"
      />
    </div>
  );
}

export default KPICards;

