import React from 'react';
import { formatCurrencyEuro } from '../utils/unitConverter';

function RevenueStack({ revenue }) {
  if (!revenue) return null;

  const { avoidedCostEur, exportRevenueEur, carbonCreditsEur, totalEur, exportKwh, selfConsumedKwh } = revenue;

  return (
    <div className="rounded-xl border border-emerald-200 bg-white p-6 shadow-lg">
      <h3 className="text-xl font-bold text-emerald-950 mb-4">Revenue Stack</h3>
      <p className="text-sm text-emerald-800 mb-4">Three lines of income from your energy system</p>
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg bg-stone-100 border border-stone-200 p-4">
          <div>
            <p className="font-medium text-stone-700">Avoided cost</p>
            <p className="text-sm text-stone-600">Money saved by not buying from the grid ({selfConsumedKwh?.toLocaleString?.() || 0} kWh self-consumed)</p>
          </div>
          <span className="text-xl font-bold text-stone-700">{formatCurrencyEuro(avoidedCostEur)}/yr</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-green-100 border border-green-200 p-4">
          <div>
            <p className="font-medium text-green-800">Export revenue</p>
            <p className="text-sm text-green-700">Money made by selling to the grid ({exportKwh?.toLocaleString?.() || 0} kWh exported)</p>
          </div>
          <span className="text-xl font-bold text-green-800">{formatCurrencyEuro(exportRevenueEur)}/yr</span>
        </div>
        <div className="flex items-center justify-between rounded-lg bg-teal-50 border border-teal-200 p-4">
          <div>
            <p className="font-medium text-teal-800">Carbon credits (Green attributes)</p>
            <p className="text-sm text-teal-700">Potential revenue from selling the &quot;Green Attributes&quot;</p>
          </div>
          <span className="text-xl font-bold text-teal-800">{formatCurrencyEuro(carbonCreditsEur)}/yr</span>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-emerald-200 flex justify-between items-center">
        <span className="font-semibold text-emerald-900">Total revenue (€/yr)</span>
        <span className="text-2xl font-bold text-emerald-950">{formatCurrencyEuro(totalEur)}</span>
      </div>
    </div>
  );
}

export default RevenueStack;
