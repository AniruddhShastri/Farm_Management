import React from 'react';
import farmData from '../../farmData.json';
import locationData from '../../locationData.json';
import biomassProxy from '../data/biomassProxy.json';

const SectionIcon = ({ type }) => {
  switch (type) {
    case 'location':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    case 'livestock':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      );
    case 'crops':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case 'infrastructure':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      );
    default:
      return null;
  }
};

import logo from '../assets/logo.png';

function Sidebar({ inputs, onInputChange, locationOptions, calculatedRainfall, isRainfallManual, isOpen, onClose }) {
  const getLocationCrops = () => {
    const locationInfo = locationData.locations[inputs.location];
    return locationInfo?.crops || ['wheat', 'barley', 'corn'];
  };

  const availableCrops = getLocationCrops();
  const biomassBucketKeys = Object.keys(biomassProxy.buckets);
  const cropLabels = {
    wheat: 'Wheat', barley: 'Barley', corn: 'Corn', potatoes: 'Potatoes',
    soy: 'Soy', sunflower: 'Sunflower', rapeseed: 'Rapeseed', sugar_beet: 'Sugar Beet',
    rye: 'Rye', oats: 'Oats', tomatoes: 'Tomatoes', olives: 'Olives',
    grapes: 'Grapes', rice: 'Rice', cotton: 'Cotton', onions: 'Onions', grass: 'Grass'
  };

  const inputClasses = "w-full px-5 py-3 bg-[#f3f7f4] border-none rounded-2xl text-[#2d5a4c] placeholder-[#a5c0b1] focus:ring-2 focus:ring-[#10b981] focus:bg-white transition-all outline-none shadow-inner appearance-none cursor-pointer";
  const labelClasses = "block text-[10px] font-bold uppercase tracking-[0.12em] text-[#4a7c66] mb-2 px-2";

  return (
    <div className={`
      fixed inset-y-0 left-0 lg:relative lg:flex
      w-80 bg-[#fbfcfa] border-none p-8 overflow-y-auto h-screen 
      shadow-[25px_0_60px_-15px_rgba(45,90,76,0.12)] z-50 
      lg:rounded-tr-[4rem] lg:rounded-br-[4rem] no-scrollbar
      transition-transform duration-500 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="w-full">
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden absolute top-6 right-6 p-2 bg-emerald-50 text-emerald-600 rounded-xl"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="mb-14 px-2">
          <div className="flex flex-col gap-1">
            <img src={logo} alt="Logo" className="h-10 w-auto object-contain self-start" />
            <p className="text-[10px] font-black text-[#a5c0b1] uppercase tracking-[0.2em] mt-1">Smart Module</p>
          </div>
        </div>

        <div className="space-y-16 pb-12">
          {/* Section: Geography */}
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-6 text-[#10b981]">
              <div className="p-2 bg-[#e8f3ee] rounded-xl">
                <SectionIcon type="location" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#2d5a4c]">Region</h3>
            </div>
            <div className="px-1 group">
              <label className={labelClasses}>Primary Location</label>
              <div className="relative">
                <select
                  value={inputs.location}
                  onChange={(e) => {
                    onInputChange('location', e.target.value);
                    availableCrops.forEach(crop => onInputChange(`crop_${crop}`, 0));
                  }}
                  className={inputClasses}
                >
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#10b981] transition-transform group-focus-within:rotate-180">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Livestock */}
          <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-6 text-[#10b981]">
              <div className="p-2 bg-[#e8f3ee] rounded-xl">
                <SectionIcon type="livestock" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#2d5a4c]">Livestock</h3>
            </div>
            <div className="space-y-6 px-1">
              {[
                { id: 'cows', label: 'Dairy Cattle' },
                { id: 'pigs', label: 'Swine Units' },
                { id: 'chickens', label: 'Poultry' }
              ].map(item => (
                <div key={item.id}>
                  <label className={labelClasses}>{item.label}</label>
                  <input
                    type="number" min="0"
                    value={inputs[item.id] || ''}
                    onChange={(e) => onInputChange(item.id, parseInt(e.target.value) || 0)}
                    className={inputClasses}
                    placeholder="0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Crops */}
          <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6 text-[#10b981]">
              <div className="p-2 bg-[#e8f3ee] rounded-xl">
                <SectionIcon type="crops" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#2d5a4c]">Cropland</h3>
            </div>
            <div className="space-y-6 px-1">
              {availableCrops.map((crop) => (
                <div key={crop}>
                  <label className={labelClasses}>{cropLabels[crop] || crop} (ha)</label>
                  <input
                    type="number" min="0" step="0.1"
                    value={inputs[`crop_${crop}`] || ''}
                    onChange={(e) => onInputChange(`crop_${crop}`, parseFloat(e.target.value) || 0)}
                    className={inputClasses}
                    placeholder="0.0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Resources */}
          <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-6 text-[#10b981]">
              <div className="p-2 bg-[#e8f3ee] rounded-xl">
                <SectionIcon type="infrastructure" />
              </div>
              <h3 className="text-sm font-black uppercase tracking-widest text-[#2d5a4c]">Resources</h3>
            </div>
            <div className="space-y-6 px-1">
              {[
                { id: 'roofArea', label: 'Roof Surface (m²)' },
                { id: 'solarArea', label: 'Solar Array (m²)' },
                { id: 'rainfall', label: 'Rain Depth (mm)', sub: !isRainfallManual && calculatedRainfall > 0 ? 'AUTO' : null },
                { id: 'inverterCapacityKW', label: 'Inverter (kW)', placeholder: 'Max' },
                { id: 'gridExportLimitKW', label: 'Export Limit', placeholder: 'None' }
              ].map(item => (
                <div key={item.id}>
                  <div className="flex justify-between items-center mb-1">
                    <label className={labelClasses.replace('mb-2', 'mb-0')}>{item.label}</label>
                    {item.sub && <span className="text-[9px] font-black text-[#10b981] bg-[#e8f3ee] px-2 rounded-lg">{item.sub}</span>}
                  </div>
                  <input
                    type="number" min="0" step="0.1"
                    value={inputs[item.id] || ''}
                    onChange={(e) => {
                      onInputChange(item.id, parseFloat(e.target.value) || 0);
                      if (item.id === 'rainfall') onInputChange('isRainfallManual', true);
                    }}
                    className={inputClasses}
                    placeholder={item.placeholder || "0.0"}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Section: Circularity */}
          <div className="animate-fade-in pt-12 border-t border-[#edf2ee]" style={{ animationDelay: '0.4s' }}>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#a5c0b1] mb-8 text-center">Circularity Strategy</h4>

            <div className="mb-10 px-1 group">
              <label className={labelClasses}>Manure Cycle</label>
              <div className="relative">
                <select
                  value={inputs.manureManagement || 'open_lagoon'}
                  onChange={(e) => onInputChange('manureManagement', e.target.value)}
                  className={inputClasses}
                >
                  <option value="open_lagoon">Storage Lagoon</option>
                  <option value="spread_field">Field Application</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#10b981] transition-transform group-focus-within:rotate-180">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-6 px-1">
              <h5 className="text-[9px] font-black text-[#a5c0b1] uppercase tracking-[0.2em] mb-4">Output Recipe (%)</h5>
              {biomassBucketKeys.map((key) => {
                const val = inputs[`feedstock_${key}`] ?? (key === 'manure' ? 50 : 0);
                return (
                  <div key={key}>
                    <label className={labelClasses}>{biomassProxy.buckets[key].name}</label>
                    <input
                      type="number" min="0" max="100" step="5"
                      value={val || ''}
                      onChange={(e) => onInputChange(`feedstock_${key}`, parseFloat(e.target.value) || 0)}
                      className={inputClasses}
                      placeholder="0"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
