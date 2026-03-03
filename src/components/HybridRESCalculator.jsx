import React from 'react';
import { formatNumber } from '../utils/unitConverter';

function HybridRESCalculator({
    methaneGeneratedM3,
    biogasPowerGeneratedKwh,
    dailyPvKwh,
    dailyLoadKwh,
    suggestion
}) {
    const getSuggestionColors = (status) => {
        switch (status) {
            case 'success':
                return 'bg-emerald-50 border-emerald-200 text-emerald-800';
            case 'warning':
                return 'bg-amber-50 border-amber-200 text-amber-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            default:
                return 'bg-stone-50 border-stone-200 text-stone-800';
        }
    };

    return (
        <div className="bg-white rounded-xl p-6 shadow-lg border border-emerald-100 mb-8">
            <h3 className="text-xl font-bold text-emerald-950 mb-1">Hybrid RES Calculator (Daily Balance)</h3>
            <p className="text-sm text-emerald-800 mb-6">Calculates optimal mix of solar and biogas to meet daily load.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-stone-50 rounded-lg p-4 border border-stone-200">
                    <p className="text-sm text-stone-600 mb-1">Methane Generated</p>
                    <p className="text-2xl font-bold text-emerald-950">
                        {formatNumber(methaneGeneratedM3)} m³
                    </p>
                </div>

                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
                    <p className="text-sm text-emerald-800 mb-1">Biogas Power potential</p>
                    <p className="text-2xl font-bold text-emerald-900">
                        {formatNumber(biogasPowerGeneratedKwh)} kWh
                    </p>
                </div>

                <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <p className="text-sm text-amber-800 mb-1">Daily Solar generated</p>
                    <p className="text-2xl font-bold text-amber-900">
                        {formatNumber(dailyPvKwh)} kWh
                    </p>
                </div>
            </div>

            <div className={`rounded-xl border p-5 ${getSuggestionColors(suggestion.status)}`}>
                <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{suggestion.title}</h4>
                    <span className="text-sm font-medium bg-white/50 px-3 py-1 rounded-full border border-black/5">
                        Load: {formatNumber(dailyLoadKwh)} kWh
                    </span>
                </div>
                <p className="text-base mb-4 font-medium">{suggestion.message}</p>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-black/5 text-sm">
                    <div>
                        <p className="opacity-80">Biogas Used Today</p>
                        <p className="font-bold text-lg">{formatNumber(suggestion.biogasUsed)} kWh</p>
                    </div>
                    {suggestion.surplus_solar > 0 && (
                        <div>
                            <p className="opacity-80">Surplus Solar</p>
                            <p className="font-bold text-lg">{formatNumber(suggestion.surplus_solar)} kWh</p>
                        </div>
                    )}
                    {suggestion.surplus_biogas > 0 && (
                        <div>
                            <p className="opacity-80">Remaining Biogas Power</p>
                            <p className="font-bold text-lg">{formatNumber(suggestion.surplus_biogas)} kWh</p>
                        </div>
                    )}
                    {suggestion.extraPowerNeeded > 0 && (
                        <div>
                            <p className="text-red-600 opacity-90">Deficit Power</p>
                            <p className="font-bold text-lg text-red-700">{formatNumber(suggestion.extraPowerNeeded)} kWh</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default HybridRESCalculator;
