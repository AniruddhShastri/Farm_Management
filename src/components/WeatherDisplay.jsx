import React from 'react';

function WeatherDisplay({ location, temperature, humidity }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-emerald-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-stone-600 mb-1">Location</p>
          <p className="text-lg font-semibold text-stone-800">{location}</p>
        </div>
        <div className="flex gap-6">
          <div className="text-right">
            <p className="text-sm text-stone-600 mb-1">Temperature</p>
            <p className="text-xl font-bold text-amber-600">{temperature}°C</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-stone-600 mb-1">Humidity</p>
            <p className="text-xl font-bold text-cyan-600">{humidity}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherDisplay;

