import React from 'react';

function ParasiticLoadNote({ winterTempC, parasiticFraction, biogasGross, biogasNet }) {
  if (parasiticFraction <= 0 || biogasGross <= 0) return null;

  const deducted = biogasGross - biogasNet;
  const pct = Math.round(parasiticFraction * 100);

  return (
    <div className="rounded-lg border border-stone-200 bg-stone-50 p-3 text-sm">
      <p className="font-medium text-stone-600">
        Parasitic load (cold climate): Ambient winter temp {winterTempC}°C &lt; 5°C → {pct}% of biogas energy deducted for digester heating.
      </p>
      <p className="text-stone-600 mt-1">
        Net biogas energy after self-heating: <strong>{biogasNet.toLocaleString('en-US', { maximumFractionDigits: 0 })} kWh/yr</strong> (≈{deducted.toLocaleString('en-US', { maximumFractionDigits: 0 })} kWh used for heating).
      </p>
    </div>
  );
}

export default ParasiticLoadNote;
