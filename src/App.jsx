import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import KPICards from './components/KPICards';
import Charts from './components/Charts';
import WeatherDisplay from './components/WeatherDisplay';
import LocationMap from './components/LocationMap';
import Assumptions from './components/Assumptions';
import RecipeCheckWarning from './components/RecipeCheckWarning';
import DigestateCard from './components/DigestateCard';
import RevenueStack from './components/RevenueStack';
import ParasiticLoadNote from './components/ParasiticLoadNote';
import {
  getBiogasEnergy,
  getBiogasEnergyRaw,
  getBiogasAnnualM3,
  getParasiticLoadFraction,
  getSolarEnergy,
  getTotalEnergy,
  getWaterHarvest,
  getWaterRequirement,
  getCarbonImpact,
  getCO2Avoided,
  getTotalCarbonImpact,
  getFinancials,
  getEnergyIndependence,
  getEnergyRequirement,
  getDigestateLiters,
  getDigestateSavingsEur,
  getRecipeCheck,
  getRevenueStack,
  getMethaneSavingsCo2e
} from './utils/calculator';
import locationData from '../locationData.json';

function App() {
  // Get location options
  const locationOptions = Object.keys(locationData.locations);

  // Initialize state with default values
  const [inputs, setInputs] = useState(() => {
    const defaultLocation = locationOptions[0] || 'Stockholm, Sweden';
    const locationInfo = locationData.locations[defaultLocation];
    const defaultCrops = locationInfo?.crops || ['wheat', 'barley', 'corn'];

    const cropInputs = {};
    defaultCrops.forEach(crop => {
      cropInputs[`crop_${crop}`] = 0;
    });

    return {
      location: defaultLocation,
      cows: 10,
      pigs: 20,
      chickens: 100,
      roofArea: 500,
      solarArea: 200,
      rainfall: 0,
      isRainfallManual: false,
      inverterCapacityKW: 0,
      gridExportLimitKW: 0,
      manureManagement: 'open_lagoon',
      feedstock_dry_straw: 0,
      feedstock_green_leafy: 0,
      feedstock_root_starch: 0,
      feedstock_sugary_fruit: 0,
      feedstock_manure: 50,
      ...cropInputs
    };
  });

  const [baselineInputs, setBaselineInputs] = useState(null);

  // Annual rainfall = avg of last 3 years (from locationData)
  const calculateRainfallFromLocation = (location) => {
    const loc = locationData.locations[location];
    if (!loc) return 0;
    if (loc.annual_rainfall_mm != null) return loc.annual_rainfall_mm;
    const rainfallData = loc.rainfall_3year;
    if (!rainfallData?.length) return 0;
    const average = rainfallData.reduce((sum, val) => sum + val, 0) / rainfallData.length;
    return Math.round(average);
  };

  // Get solar irradiance for location
  const getSolarIrradiance = (location) => {
    const locationInfo = locationData.locations[location];
    return locationInfo?.solar_irradiance_kwh_m2_day || 4.5;
  };

  // Build crop areas object from inputs
  const buildCropAreas = () => {
    const cropAreas = {};
    Object.keys(inputs).forEach(key => {
      if (key.startsWith('crop_')) {
        const cropName = key.replace('crop_', '');
        const area = inputs[key] || 0;
        if (area > 0) {
          cropAreas[cropName] = area;
        }
      }
    });
    return cropAreas;
  };

  // When location changes, always set annual rainfall to that location's avg (last 3 years)
  useEffect(() => {
    const calculatedRainfall = calculateRainfallFromLocation(inputs.location);
    setInputs(prev => ({
      ...prev,
      rainfall: calculatedRainfall,
      isRainfallManual: false
    }));
  }, [inputs.location]);

  // Get weather data for current location
  const getWeatherData = () => {
    const locationInfo = locationData.locations[inputs.location];
    if (locationInfo) {
      return {
        temperature: locationInfo.temperature,
        humidity: locationInfo.humidity,
        coordinates: locationInfo.coordinates,
        solarIrradiance: locationInfo.solar_irradiance_kwh_m2_day
      };
    }
    return { temperature: 0, humidity: 0, coordinates: null, solarIrradiance: 4.5 };
  };

  const weather = getWeatherData();
  const calculatedRainfall = calculateRainfallFromLocation(inputs.location);
  const solarIrradiance = getSolarIrradiance(inputs.location);
  const cropAreas = buildCropAreas();
  const winterTempC = locationData.locations[inputs.location]?.winter_temperature_min_c ?? 5;

  const handleInputChange = (key, value) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const saveAsBaseline = () => {
    setBaselineInputs({ ...inputs });
  };

  const biogasRaw = getBiogasEnergyRaw(inputs.cows, inputs.pigs, inputs.chickens);
  const biogasEnergy = getBiogasEnergy(inputs.cows, inputs.pigs, inputs.chickens, winterTempC);
  const parasiticFraction = getParasiticLoadFraction(winterTempC);
  const totalEnergy = getTotalEnergy(
    inputs.cows, inputs.pigs, inputs.chickens,
    inputs.solarArea, solarIrradiance,
    winterTempC,
    inputs.inverterCapacityKW || 0
  );
  const solarEnergy = totalEnergy - biogasEnergy;
  const totalEnergyRequired = getEnergyRequirement(inputs.cows, inputs.pigs, inputs.chickens, cropAreas);
  const waterHarvest = getWaterHarvest(inputs.roofArea, inputs.rainfall);
  const waterRequired = getWaterRequirement(inputs.cows, inputs.pigs, inputs.chickens, cropAreas);
  const carbonSequestered = getCarbonImpact(cropAreas);
  const co2Avoided = getCO2Avoided(totalEnergy);
  const totalCarbonImpact = getTotalCarbonImpact(cropAreas, totalEnergy);
  const financialSavings = getFinancials(totalEnergy, waterHarvest);
  const energyIndependence = getEnergyIndependence(totalEnergy, totalEnergyRequired);

  const annualBiogasM3 = getBiogasAnnualM3(inputs.cows, inputs.pigs, inputs.chickens);
  const digestateLiters = getDigestateLiters(annualBiogasM3);
  const digestateSavingsEur = getDigestateSavingsEur(annualBiogasM3);
  const feedstockMix = {
    dry_straw: inputs.feedstock_dry_straw || 0,
    green_leafy: inputs.feedstock_green_leafy || 0,
    root_starch: inputs.feedstock_root_starch || 0,
    sugary_fruit: inputs.feedstock_sugary_fruit || 0,
    manure: inputs.feedstock_manure || 0
  };
  const recipeCheck = getRecipeCheck(feedstockMix);
  const revenue = getRevenueStack({
    totalGeneratedKwh: totalEnergy,
    totalRequiredKwh: totalEnergyRequired,
    gridExportLimitKW: inputs.gridExportLimitKW || 0,
    electricityPriceEurPerKwh: 0.15,
    exportPriceEurPerKwh: 0.10,
    carbonCreditEurPerKwh: 0.02
  });
  const methaneSavingsCo2e = getMethaneSavingsCo2e(annualBiogasM3, inputs.manureManagement || 'open_lagoon');

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        inputs={inputs}
        onInputChange={handleInputChange}
        locationOptions={locationOptions}
        calculatedRainfall={calculatedRainfall}
        isRainfallManual={inputs.isRainfallManual}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative bg-[#f8fafc]">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-emerald-100/30 to-transparent -z-10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-amber-100/20 to-transparent -z-10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto p-8 animate-fade-in">
          {/* 1. Header Section: Heading, Subheading, Location & Temp */}
          <header className="mb-10">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-200/50">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none mb-1">
                      Eco<span className="text-emerald-600">Synergy</span>
                    </h1>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Circular Systems Hub</p>
                  </div>
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2 leading-tight">
                  Future-Ready Farm Modeling
                </h2>
                <p className="text-sm text-slate-500 max-w-2xl leading-relaxed">
                  Unlock the hidden value in your farm's ecosystem. Model energy, water, and waste flows to achieve climate-positive operations at <span className="text-slate-800 font-bold underline decoration-emerald-200 underline-offset-4">{inputs.location}</span>.
                </p>
              </div>

              <div className="flex flex-col items-end gap-4">
                <div className="glass-card rounded-[2rem] p-1 shadow-xl border-white/60">
                  <WeatherDisplay
                    location={inputs.location}
                    temperature={weather.temperature}
                    humidity={weather.humidity}
                  />
                </div>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100 uppercase tracking-wider">
                    {weather.coordinates?.lat}, {weather.coordinates?.lng}
                  </span>
                  <span className="px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-100 uppercase tracking-wider">
                    {solarIrradiance} kWh/m²/day
                  </span>
                </div>
              </div>
            </div>

            {/* Location Map: Increased height for better visibility as requested */}
            <div className="glass-card rounded-[2.5rem] overflow-hidden shadow-2xl border-white/40 h-[420px] mb-10 group relative">
              <div className="absolute top-4 left-6 z-20 pointer-events-none">
                <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md text-slate-900 text-[10px] font-black rounded-full border border-white shadow-lg uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Satellite View
                </span>
              </div>
              <div className="absolute inset-0 bg-emerald-900/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
              <LocationMap
                location={inputs.location}
                coordinates={weather.coordinates}
              />
            </div>
          </header>

          {/* 2. Stats Section: Three Cards */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">System Performance</h3>
            </div>
            <KPICards
              financialSavings={financialSavings}
              energyIndependence={energyIndependence}
              carbonImpact={totalCarbonImpact}
            />
          </section>

          {/* 3. Graphs and Insight Analysis Section */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
              <div className="flex flex-col">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight leading-none mb-1">Insight Analytics</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time optimization data</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Secondary Insight Cards integrated into Analysis Section */}
              <div className="flex flex-col gap-6">
                <div className="glass-card rounded-[2rem] shadow-xl border-white/50 overflow-hidden transform transition-all hover:scale-[1.02]">
                  <DigestateCard digestateLiters={digestateLiters} digestateSavingsEur={digestateSavingsEur} />
                </div>
                <div className="glass-card rounded-[2rem] shadow-xl border-white/50 overflow-hidden transform transition-all hover:scale-[1.02]">
                  <RevenueStack revenue={revenue} />
                </div>

                {/* Warnings and Notes moved here to be part of "Insight Analysis" */}
                <RecipeCheckWarning recipeCheck={recipeCheck} />
                <div className="glass-card rounded-2xl p-5 shadow-sm border-amber-100/50 bg-amber-50/20">
                  <ParasiticLoadNote
                    winterTempC={winterTempC}
                    parasiticFraction={parasiticFraction}
                    biogasGross={biogasRaw}
                    biogasNet={biogasEnergy}
                  />
                </div>
              </div>

              {/* Main Charts */}
              <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-6 shadow-2xl border-white/60 bg-white/40 backdrop-blur-sm">
                <Charts
                  biogasEnergy={biogasEnergy}
                  solarEnergy={solarEnergy}
                  totalEnergy={totalEnergy}
                  totalEnergyRequired={totalEnergyRequired}
                  waterHarvest={waterHarvest}
                  waterRequired={waterRequired}
                  carbonSequestered={carbonSequestered}
                  co2Avoided={co2Avoided}
                  financialSavings={financialSavings}
                />
              </div>
            </div>

            {annualBiogasM3 > 0 && (
              <div className="mb-10 p-6 bg-emerald-600 rounded-[2rem] shadow-xl shadow-emerald-200/50 text-white flex flex-col md:flex-row items-center gap-6 transform transition-all hover:scale-[1.01]">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-black mb-1 italic">Climate Impact Milestone</h4>
                  <p className="text-emerald-50 text-sm font-medium leading-relaxed">
                    By switching from <strong>{inputs.manureManagement === 'open_lagoon' ? 'Open Lagoon' : 'Field Spreading'}</strong> to controlled digestion, you are avoiding <span className="bg-white text-emerald-700 px-3 py-1 rounded-full font-black mx-1 inline-block">{methaneSavingsCo2e} tons CO₂e</span> of methane emissions annually.
                  </p>
                </div>
              </div>
            )}

            {/* Scenario Control integrated at the bottom of Analysis */}
            <div className="glass-card rounded-[2rem] p-8 shadow-2xl border-emerald-100/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/5 rounded-full -mr-40 -mt-40 blur-3xl transition-all group-hover:bg-emerald-400/10" />
              <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1 text-center md:text-left">
                  <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-2xl font-black text-slate-900 italic">Advanced Scenario Control</h3>
                  </div>
                  <p className="text-sm text-slate-500 max-w-md">
                    Lock in your current variables to establish a performance baseline, then experiment with parameters to find your farm's optimal ecosystem balance.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <button
                    type="button"
                    onClick={saveAsBaseline}
                    className="px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-black text-base font-black transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center gap-3"
                  >
                    <span>SAVE BASELINE</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                  </button>
                  {baselineInputs && (
                    <div className="px-5 py-2.5 bg-emerald-50 rounded-xl text-xs font-black text-emerald-700 border border-emerald-100 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      ACTIVE COMPARISON: {baselineInputs.cows} COWS / {baselineInputs.solarArea}m² SOLAR
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Footer: Assumptions and Sources */}
          <footer className="mt-20 pt-10 border-t border-slate-100">
            <Assumptions />
          </footer>
        </div>
      </div >
    </div >
  );
}

export default App;
