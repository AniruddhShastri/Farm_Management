import React from 'react';
import { formatNumber } from '../utils/unitConverter';

function DigestateCard({ digestateLiters, digestateSavingsEur }) {
  if (digestateLiters <= 0) return null;

  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black text-emerald-900 uppercase tracking-wider">Bio-Fertilizer</h3>
        <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-xl">🌱</div>
      </div>
      <p className="text-xl font-black text-emerald-900 leading-none">
        {formatNumber(digestateLiters).toLocaleString()} L/year
      </p>
      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1 mb-3">Digestate Output</p>
      <div className="pt-3 border-t border-emerald-100">
        <p className="text-xs font-bold text-emerald-900">
          Avoided Fertilizer: <span className="text-emerald-600">€{digestateSavingsEur.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </p>
      </div>
    </div>
  );
}

export default DigestateCard;
