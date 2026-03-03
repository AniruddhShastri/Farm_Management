import React from 'react';
import { formatCurrency, formatCarbon, formatNumber } from '../utils/unitConverter';

function KPICards({ financialSavings, energyIndependence, carbonImpact }) {
  const carbonFormatted = formatCarbon(Math.abs(carbonImpact));
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Bio/Waste (Financial) - Emerald */}
      <div className="bg-gradient-to-br from-emerald-100 to-white border border-emerald-300 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-emerald-900">Financial Savings</h3>
          <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl">$</span>
          </div>
        </div>
        <div className="text-4xl font-bold text-emerald-900 mb-2">
          {formatCurrency(financialSavings)}
        </div>
        <p className="text-sm text-emerald-800">Annual savings from energy & water</p>
      </div>

      {/* Solar/Energy - Amber/Sage */}
      <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-200 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-amber-900">Energy Independence</h3>
          <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl">⚡</span>
          </div>
        </div>
        <div className="text-4xl font-bold text-amber-900 mb-2">
          {parseFloat(energyIndependence.toFixed(3))}%
        </div>
        <p className="text-sm text-amber-800">Self-generated energy</p>
      </div>

      {/* Water - Teal/Sky */}
      <div className="bg-gradient-to-br from-teal-50 to-white border border-teal-200 rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-teal-900">Carbon Impact</h3>
          <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl">🌱</span>
          </div>
        </div>
        <div className={`text-4xl font-bold mb-2 ${carbonImpact < 0 ? 'text-teal-700' : 'text-teal-900'}`}>
          {carbonImpact < 0 ? '-' : '+'}{formatNumber(carbonFormatted.value)} {carbonFormatted.unit} CO₂e
        </div>
        <p className="text-sm text-teal-800">
          {carbonImpact < 0 ? 'Carbon negative' : 'Net emissions'}
        </p>
      </div>
    </div>
  );
}

export default KPICards;

