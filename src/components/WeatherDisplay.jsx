import React from 'react';

function WeatherDisplay({ location, temperature, humidity }) {
  return (
    <div className="flex items-center gap-5 px-4 py-2.5">
      <div className="flex flex-col">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">Station</span>
        <span className="text-sm font-bold text-slate-700">{location}</span>
      </div>

      <div className="h-8 w-px bg-slate-200" />

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-400/10 flex items-center justify-center text-amber-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4.22 1.22a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zm4.56 4.56a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 10a1 1 0 11-2 0 1 1 0 012 0zm-1.22 4.22a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM10 17a1 1 0 110 2 1 1 0 010-2zm-4.22-1.22a1 1 0 01-1.414 0l-.707-.707a1 1 0 111.414-1.414l.707.707a1 1 0 010 1.414zm-4.56-4.56a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM3 10a1 1 0 112 0 1 1 0 01-2 0zm1.22-4.22a1 1 0 010-1.414l.707-.707a1 1 0 011.414 1.414l-.707.707a1 1 0 01-1.414 0zM10 7a3 3 0 100 6 3 3 0 000-6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Temp</span>
            <span className="text-sm font-black text-white">{temperature}°C</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-sky-50 flex items-center justify-center text-sky-500">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.53 4.47a1 1 0 10-1.414 1.414 5 5 0 007.888 0 1 1 0 10-1.414-1.414 3 3 0 01-5.06 0z" />
            </svg>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Humid</span>
            <span className="text-sm font-black text-white">{humidity}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeatherDisplay;

