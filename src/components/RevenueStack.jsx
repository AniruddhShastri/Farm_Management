import React from 'react';
import { formatCurrencyEuro } from '../utils/unitConverter';

function RevenueStack({ revenue }) {
  if (!revenue) return null;

  const { avoidedCostEur, exportRevenueEur, carbonCreditsEur, totalEur, exportKwh, selfConsumedKwh } = revenue;

  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-black text-emerald-950 mb-3 uppercase tracking-wider">Revenue Stack</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 p-3">
          <div>
            <p className="text-xs font-bold text-slate-700">Avoided cost</p>
            <p className="text-[10px] text-slate-400">({selfConsumedKwh?.toLocaleString?.() || 0} kWh self-used)</p>
          </div>
          <span className="text-lg font-black text-slate-700">{formatCurrencyEuro(avoidedCostEur)}/yr</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-emerald-50 border border-emerald-100 p-3">
          <div>
            <p className="text-xs font-bold text-emerald-800">Export revenue</p>
            <p className="text-[10px] text-emerald-600">({exportKwh?.toLocaleString?.() || 0} kWh exported)</p>
          </div>
          <span className="text-lg font-black text-emerald-800">{formatCurrencyEuro(exportRevenueEur)}/yr</span>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-teal-50 border border-teal-100 p-3">
          <div>
            <p className="text-xs font-bold text-teal-800">Carbon credits</p>
            <p className="text-[10px] text-teal-600">Green attributes revenue</p>
          </div>
          <span className="text-lg font-black text-teal-800">{formatCurrencyEuro(carbonCreditsEur)}/yr</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center px-1">
        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Annual Total</span>
        <span className="text-xl font-black text-emerald-600">{formatCurrencyEuro(totalEur)}</span>
      </div>
    </div>
  );
}

export default RevenueStack;
