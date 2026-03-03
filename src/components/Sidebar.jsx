import React from 'react';
import farmData from '../../farmData.json';
import locationData from '../../locationData.json';
import biomassProxy from '../data/biomassProxy.json';

function Sidebar({ inputs, onInputChange, locationOptions, calculatedRainfall, isRainfallManual }) {
  // Get location-specific crops
  const getLocationCrops = () => {
    const locationInfo = locationData.locations[inputs.location];
    if (locationInfo && locationInfo.crops) {
      return locationInfo.crops;
    }
    return ['wheat', 'barley', 'corn']; // Default fallback
  };

  const availableCrops = getLocationCrops();
  const biomassBucketKeys = Object.keys(biomassProxy.buckets);
  const cropLabels = {
    wheat: 'Wheat',
    barley: 'Barley',
    corn: 'Corn',
    potatoes: 'Potatoes',
    soy: 'Soy',
    sunflower: 'Sunflower',
    rapeseed: 'Rapeseed',
    sugar_beet: 'Sugar Beet',
    rye: 'Rye',
    oats: 'Oats',
    tomatoes: 'Tomatoes',
    olives: 'Olives',
    grapes: 'Grapes',
    rice: 'Rice',
    cotton: 'Cotton',
    onions: 'Onions',
    grass: 'Grass'
  };

  return (
    <div className="w-80 bg-emerald-900 border-r border-emerald-800 p-6 overflow-y-auto h-screen">
      <h2 className="text-2xl font-bold text-white mb-6">Farm Inputs</h2>

      <div className="space-y-6">
        {/* Location Section */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-100 mb-4">Location</h3>
          <div>
            <label className="block text-sm font-medium text-emerald-100 mb-2">
              Farm Location
            </label>
            <select
              value={inputs.location}
              onChange={(e) => {
                onInputChange('location', e.target.value);
                const newCrops = {};
                availableCrops.forEach(crop => {
                  newCrops[crop] = 0;
                });
                Object.keys(inputs).forEach(key => {
                  if (key.startsWith('crop_')) {
                    onInputChange(key, 0);
                  }
                });
              }}
              className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
            >
              {locationOptions.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
            <p className="text-xs text-emerald-100/80 mt-1">
              Crops available: {availableCrops.map(c => cropLabels[c] || c).join(', ')}
            </p>
          </div>
        </div>

        {/* Livestock Section */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-100 mb-4">Livestock</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-2">Dairy Cows</label>
              <input
                type="number"
                min="0"
                value={inputs.cows === 0 ? '' : inputs.cows}
                onChange={(e) => {
                  const val = e.target.value;
                  onInputChange('cows', val === '' ? 0 : parseInt(val) || 0);
                }}
                className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-2">Pigs</label>
              <input
                type="number"
                min="0"
                value={inputs.pigs === 0 ? '' : inputs.pigs}
                onChange={(e) => {
                  const val = e.target.value;
                  onInputChange('pigs', val === '' ? 0 : parseInt(val) || 0);
                }}
                className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-2">Chickens</label>
              <input
                type="number"
                min="0"
                value={inputs.chickens === 0 ? '' : inputs.chickens}
                onChange={(e) => {
                  const val = e.target.value;
                  onInputChange('chickens', val === '' ? 0 : parseInt(val) || 0);
                }}
                className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Crops Section */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-100 mb-4">Crops (Hectares) - 3 Season Rotation</h3>
          <p className="text-xs text-emerald-100/80 mb-3">
            Each crop grows for 4 months, with 1 month fallow between seasons
          </p>
          <div className="space-y-4">
            {availableCrops.map((crop) => {
              const cropKey = `crop_${crop}`;
              const cropValue = inputs[cropKey] || 0;
              return (
                <div key={crop}>
                  <label className="block text-sm font-medium text-emerald-100 mb-2">
                    {cropLabels[crop] || crop}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={cropValue === 0 ? '' : cropValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      onInputChange(cropKey, val === '' ? 0 : parseFloat(val) || 0);
                    }}
                    className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
                    placeholder="0"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Infrastructure Section */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-100 mb-4">Infrastructure</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-2">Roof Area (m²)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={inputs.roofArea === 0 ? '' : inputs.roofArea}
                onChange={(e) => {
                  const val = e.target.value;
                  onInputChange('roofArea', val === '' ? 0 : parseFloat(val) || 0);
                }}
                className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-2">Solar Panel Area (m²)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={inputs.solarArea === 0 ? '' : inputs.solarArea}
                onChange={(e) => {
                  const val = e.target.value;
                  onInputChange('solarArea', val === '' ? 0 : parseFloat(val) || 0);
                }}
                className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
                placeholder="0"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-emerald-100">Annual rainfall (mm) — avg of last 3 years</label>
                {!isRainfallManual && calculatedRainfall > 0 && (
                  <span className="text-xs text-emerald-300">Auto-calculated</span>
                )}
              </div>
              <input
                type="number"
                min="0"
                step="0.1"
                value={inputs.rainfall === 0 ? '' : inputs.rainfall}
                onChange={(e) => {
                  const val = e.target.value;
                  onInputChange('rainfall', val === '' ? 0 : parseFloat(val) || 0);
                  onInputChange('isRainfallManual', true);
                }}
                onFocus={() => onInputChange('isRainfallManual', true)}
                className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
                placeholder={calculatedRainfall > 0 ? calculatedRainfall.toFixed(1) : "0"}
              />
              {!isRainfallManual && calculatedRainfall > 0 && (
                <p className="text-xs text-emerald-100/80 mt-1">
                  Avg of last 3 years for {inputs.location}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-2">Inverter capacity (kW)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={inputs.inverterCapacityKW === 0 ? '' : inputs.inverterCapacityKW}
                onChange={(e) => {
                  const val = e.target.value;
                  onInputChange('inverterCapacityKW', val === '' ? 0 : parseFloat(val) || 0);
                }}
                className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
                placeholder="0 = no clipping"
              />
              <p className="text-xs text-emerald-100/80 mt-1">Leave 0 for no clipping (e.g. 50 kW inverter, 60 kWp panels)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-2">Grid export limit (kW)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={inputs.gridExportLimitKW === 0 ? '' : inputs.gridExportLimitKW}
                onChange={(e) => {
                  const val = e.target.value;
                  onInputChange('gridExportLimitKW', val === '' ? 0 : parseFloat(val) || 0);
                }}
                className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
                placeholder="0 = self-consumption only"
              />
              <p className="text-xs text-emerald-100/80 mt-1">0 = Self-Consumption Only mode</p>
            </div>
          </div>
        </div>

        {/* Manure management */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-100 mb-4">Methane baseline (consultant)</h3>
          <label className="block text-sm font-medium text-emerald-100 mb-2">
            How do you currently manage manure?
          </label>
          <select
            value={inputs.manureManagement || 'open_lagoon'}
            onChange={(e) => onInputChange('manureManagement', e.target.value)}
            className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
          >
            <option value="open_lagoon">Open lagoon / storage</option>
            <option value="spread_field">Spread on field</option>
          </select>
          <p className="text-xs text-emerald-100/80 mt-1">Affects methane savings and carbon credits</p>
        </div>

        {/* Hybrid RES Calculator Inputs */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-100 mb-4">Hybrid RES Calculator</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-2">Cattle Manure Type</label>
              <select
                value={inputs.cattleType || 'Dairy'}
                onChange={(e) => onInputChange('cattleType', e.target.value)}
                className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
              >
                <option value="Dairy">Dairy</option>
                <option value="Beef">Beef</option>
                <option value="Feedlot">Feedlot</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-2">Additional Biomass (tons/day)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={inputs.amountBiomassTonsDay === 0 ? '' : (inputs.amountBiomassTonsDay || '')}
                onChange={(e) => {
                  const val = e.target.value;
                  onInputChange('amountBiomassTonsDay', val === '' ? 0 : parseFloat(val) || 0);
                }}
                className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
                placeholder="0"
              />
              <p className="text-xs text-emerald-100/80 mt-1">Calculated if cows = 0</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-2">Daily Load Demand (kWh)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={inputs.dailyLoadKwh === 0 ? '' : (inputs.dailyLoadKwh || '')}
                onChange={(e) => {
                  const val = e.target.value;
                  onInputChange('dailyLoadKwh', val === '' ? 0 : parseFloat(val) || 0);
                }}
                className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
                placeholder="Manual daily load"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-emerald-100 mb-2">If Biomass is Insufficient:</label>
              <select
                value={inputs.insufficientBiomassChoice || 'add_biomass'}
                onChange={(e) => onInputChange('insufficientBiomassChoice', e.target.value)}
                className="w-full px-4 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
              >
                <option value="add_biomass">Add more biomass</option>
                <option value="use_diesel">Use Diesel Generator</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feedstock mix */}
        <div>
          <h3 className="text-lg font-semibold text-emerald-100 mb-4">Feedstock mix (Recipe check)</h3>
          <p className="text-xs text-emerald-100/80 mb-3">Share of each type (0–100%). Used for C:N balance warning.</p>
          <div className="space-y-3">
            {biomassBucketKeys.map((key) => {
              const bucket = biomassProxy.buckets[key];
              const val = inputs[`feedstock_${key}`] ?? (key === 'manure' ? 50 : 0);
              return (
                <div key={key}>
                  <label className="block text-sm font-medium text-emerald-100 mb-1">
                    {bucket.name} (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="5"
                    value={val === 0 ? '' : val}
                    onChange={(e) => {
                      const v = e.target.value;
                      onInputChange(`feedstock_${key}`, v === '' ? 0 : parseFloat(v) || 0);
                    }}
                    className="w-full px-3 py-2 border border-emerald-800 rounded-lg focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-emerald-800 text-white"
                    placeholder="0"
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
