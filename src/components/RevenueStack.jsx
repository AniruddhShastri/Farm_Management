import React from 'react';
import { formatCurrencyEuro } from '../utils/unitConverter';

function RevenueStack({ revenue }) {
  if (!revenue) return null;

  const { avoidedCostEur, exportRevenueEur, carbonCreditsEur, totalEur, exportKwh, selfConsumedKwh } = revenue;

  return (
    <div className="rounded-xl border border-green-400/20 bg-[#0a1a0f] p-4 shadow-sm">
      <h3 className="text-xl font-black text-white mb-4 uppercase tracking-wider">Revenue Stack</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-white/5 border border-white/10 p-3">
          <div>
            <p className="text-sm font-bold text-white">Avoided cost</p>
            <p className="text-xs text-slate-400">({selfConsumedKwh?.toLocaleString?.() || 0} kWh self-used)</p>
          </div>
          <span className="text-lg font-black text-white">{formatCurrencyEuro(avoidedCostEur)}/yr</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-green-400/10 border border-green-400/20 p-3">
          <div>
            <p className="text-sm font-bold text-green-400">Export revenue</p>
            <p className="text-xs text-green-500/70">({exportKwh?.toLocaleString?.() || 0} kWh exported)</p>
          </div>
          <span className="text-lg font-black text-green-400">{formatCurrencyEuro(exportRevenueEur)}/yr</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-blue-400/10 border border-blue-400/20 p-3">
          <div>
            <p className="text-sm font-bold text-blue-400">Carbon credits</p>
            <p className="text-xs text-blue-500/70">Green attributes revenue</p>
          </div>
          <span className="text-lg font-black text-blue-400">{formatCurrencyEuro(carbonCreditsEur)}/yr</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center px-1">
        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Annual Total</span>
        <span className="text-2xl font-black text-green-400">{formatCurrencyEuro(totalEur)}</span>
      </div>
    </div>
  );
}

export default RevenueStack;
