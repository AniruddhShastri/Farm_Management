import React from 'react';
import { formatNumber } from '../utils/unitConverter';

function DigestateCard({ digestateLiters, digestateSavingsEur }) {
  if (digestateLiters <= 0) return null;

  return (
    <div className="rounded-xl border border-emerald-300 bg-gradient-to-r from-emerald-100 to-teal-50 p-6 shadow-sm shadow-emerald-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-emerald-900">Digestate (Organic Fertilizer)</h3>
        <div className="h-12 w-12 rounded-lg bg-emerald-600 flex items-center justify-center text-white text-2xl">🌱</div>
      </div>
      <p className="text-2xl font-bold text-emerald-900 mb-1">
        {formatNumber(digestateLiters).toLocaleString()} L/year
      </p>
      <p className="text-sm text-emerald-800 mb-2">Liquid fertilizer produced from biogas output</p>
      <p className="text-base font-medium text-emerald-900">
        Estimated savings on chemical fertilizer: <strong>€{digestateSavingsEur.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/yr</strong>
      </p>
    </div>
  );
}

export default DigestateCard;
