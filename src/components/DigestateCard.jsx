import React from 'react';
import { formatNumber } from '../utils/unitConverter';

function DigestateCard({ digestateLiters, digestateSavingsEur }) {
  if (digestateLiters <= 0) return null;

  return (
    <div className="rounded-xl border border-green-400/20 bg-green-400/5 p-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">Bio-Fertilizer</h3>
        <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center text-white text-xl border border-green-500/30">🌱</div>
      </div>
      <p className="text-2xl font-black text-white leading-none">
        {formatNumber(digestateLiters).toLocaleString()} L/year
      </p>
      <p className="text-[10px] font-bold text-green-400 uppercase tracking-widest mt-1 mb-3">Digestate Output</p>
      <div className="pt-3 border-t border-green-400/20">
        <p className="text-sm font-bold text-white">
          Avoided Fertilizer: <span className="text-green-400">€{digestateSavingsEur.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </p>
      </div>
    </div>
  );
}

export default DigestateCard;
