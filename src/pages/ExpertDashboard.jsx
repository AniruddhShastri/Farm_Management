import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import KPICards from '../components/KPICards';
import Charts from '../components/Charts';
import WeatherDisplay from '../components/WeatherDisplay';
import LocationMap from '../components/LocationMap';
import Assumptions from '../components/Assumptions';
import RecipeCheckWarning from '../components/RecipeCheckWarning';
import DigestateCard from '../components/DigestateCard';
import RevenueStack from '../components/RevenueStack';
import ParasiticLoadNote from '../components/ParasiticLoadNote';
import logo from '../assets/logo.png';
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
} from '../utils/calculator';
import locationData from '../../locationData.json';

function ExpertDashboard() {
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

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--voneng-bg)' }}>
      {/* Expert Dashboard top bar */}
      <div
        className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ background: '#030a06', borderBottom: '1px solid rgba(34,197,94,0.15)' }}
      >
        <div className="flex items-center gap-3">
          <img src={logo} alt="VONeng" className="h-7 w-auto" />
          <span className="text-green-400 text-xs font-bold uppercase tracking-widest">Expert Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/advisor" className="text-slate-400 hover:text-green-400 text-xs font-medium transition-colors">
            Farmer Advisor
          </Link>
          <Link to="/" className="text-slate-400 hover:text-green-400 text-xs font-medium transition-colors">
            Back to Site
          </Link>
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity animate-in fade-in duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        inputs={inputs}
        onInputChange={handleInputChange}
        locationOptions={locationOptions}
        calculatedRainfall={calculatedRainfall}
        isRainfallManual={inputs.isRainfallManual}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto relative min-w-0">
        {/* Mobile Header Toolbar */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-[#030a06]/80 backdrop-blur-md border-b border-white/10/10">
          <img src={logo} alt="Logo" className="h-9 w-auto object-contain" />
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-green-400/10 text-green-400 rounded-xl active:scale-95 transition-all"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-green-400/10 to-transparent -z-10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-yellow-400/10 to-transparent -z-10 blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 animate-fade-in relative z-10">
          {/* 1. Header Section: Heading, Subheading, Location & Temp */}
          <header className="mb-8 lg:mb-12">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 lg:gap-8 mb-8">
              <div className="flex-1 w-full">
                <div className="hidden lg:flex items-center gap-3 mb-4">

                  <div>
                    <img src={logo} alt="VonEng" className="h-8 lg:h-10 w-auto object-contain mb-1" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Circular Systems Hub</p>
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white mb-2 leading-tight">
                  Future-Ready Farm Modeling
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed mb-6">
                  Unlock the hidden value in your farm's ecosystem. Model energy, water, and waste flows to achieve climate-positive operations at <span className="text-white font-bold underline decoration-green-400/50 underline-offset-4">{inputs.location}</span>.
                </p>

                <div className="bg-yellow-400/10 backdrop-blur-sm border border-yellow-400/20 rounded-2xl p-4 sm:p-5 flex items-start gap-4 flex-row max-w-2xl shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-2xl pt-0.5" role="img" aria-label="Waving hand">👋</span>
                  <div className="flex flex-col gap-1">
                    <h4 className="text-sm font-black text-yellow-400 tracking-tight">Hey there, changemaker!</h4>
                    <p className="text-[11px] sm:text-xs text-yellow-200/80 leading-relaxed font-medium">
                      Just a heads up, this is an early prototype we're excitedly tinkering with! While these numbers are grounded in solid research, think of them as a <span className="font-bold underline decoration-yellow-400">brilliant educated guess</span> rather than a 100% guarantee. Have fun exploring the possibilities!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 w-full lg:w-auto">
                <div className="glass-card rounded-[1.5rem] sm:rounded-[2rem] p-1 shadow-xl border-white/10/10 w-full sm:w-auto overflow-x-auto">
                  <WeatherDisplay
                    location={inputs.location}
                    temperature={weather.temperature}
                    humidity={weather.humidity}
                  />
                </div>
                <div className="flex gap-2 w-full lg:justify-end">
                  <span className="px-3 py-1 bg-green-400/10 text-green-400 text-[9px] sm:text-[10px] font-bold rounded-full border border-green-400/20 uppercase tracking-wider">
                    {weather.coordinates?.lat}, {weather.coordinates?.lng}
                  </span>
                  <span className="px-3 py-1 bg-yellow-400/10 text-yellow-400 text-[9px] sm:text-[10px] font-bold rounded-full border border-yellow-400/20 uppercase tracking-wider font-mono">
                    {solarIrradiance} kWh/m²/day
                  </span>
                </div>
              </div>
            </div>

            {/* Location Map: Responsive height */}
            <div className="glass-card rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-white/10/10 h-[250px] sm:h-[350px] lg:h-[420px] mb-8 lg:mb-12 group relative">

              <div className="absolute inset-0 bg-green-400/5 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
              <LocationMap
                location={inputs.location}
                coordinates={weather.coordinates}
              />
            </div>
          </header>

          {/* 2. Stats Section: Three Cards */}
          <section className="mb-10 sm:mb-12">
            <div className="flex items-center gap-3 mb-6 px-1 lg:px-0">
              <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
              <h3 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight">System Performance</h3>
            </div>
            <KPICards
              financialSavings={financialSavings}
              energyIndependence={energyIndependence}
              carbonImpact={totalCarbonImpact}
            />
          </section>

          {/* 3. Graphs and Insight Analysis Section */}
          <section className="mb-10 sm:mb-12">
            <div className="flex items-center gap-3 mb-8 px-1 lg:px-0">
              <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
              <div className="flex flex-col">
                <h3 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight leading-none mb-1">Insight Analytics</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time optimization data</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">
              {/* Secondary Insight Cards integrated into Analysis Section */}
              <div className="flex flex-col gap-6 order-2 lg:order-1">
                <div className="glass-card rounded-[2rem] shadow-xl border-white/10/10 overflow-hidden transform transition-all hover:scale-[1.02]">
                  <DigestateCard digestateLiters={digestateLiters} digestateSavingsEur={digestateSavingsEur} />
                </div>
                <div className="glass-card rounded-[2rem] shadow-xl border-white/10/10 overflow-hidden transform transition-all hover:scale-[1.02]">
                  <RevenueStack revenue={revenue} />
                </div>

                {/* Warnings and Notes moved here to be part of "Insight Analysis" */}
                <RecipeCheckWarning recipeCheck={recipeCheck} />
                <div className="glass-card rounded-2xl p-4 sm:p-5 shadow-sm border-yellow-400/10 bg-yellow-400/5">
                  <ParasiticLoadNote
                    winterTempC={winterTempC}
                    parasiticFraction={parasiticFraction}
                    biogasGross={biogasRaw}
                    biogasNet={biogasEnergy}
                  />
                </div>
              </div>

              {/* Main Charts */}
              <div className="lg:col-span-2 glass-card rounded-[2rem] lg:rounded-[2.5rem] p-4 sm:p-6 shadow-2xl border-white/10/10 bg-[#0a1a0f]/5 backdrop-blur-sm order-1 lg:order-2">
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
              <div className="mb-10 p-5 sm:p-6 bg-emerald-600 rounded-[2rem] shadow-xl shadow-emerald-200/50 text-white flex flex-col md:flex-row items-center gap-4 sm:gap-6 transform transition-all hover:scale-[1.01]">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0a1a0f]/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10/30 flex-shrink-0">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                </div>
                <div className="text-center md:text-left">
                  <h4 className="text-base sm:text-lg font-black mb-1 italic">Climate Impact Milestone</h4>
                  <p className="text-emerald-50 text-[11px] sm:text-sm font-medium leading-relaxed">
                    By switching from <strong>{inputs.manureManagement === 'open_lagoon' ? 'Open Lagoon' : 'Field Spreading'}</strong> to controlled digestion, you are avoiding <span className="bg-[#0a1a0f] text-green-400 px-3 py-1 rounded-full font-black mx-1 inline-block whitespace-nowrap">{methaneSavingsCo2e} tons CO₂e</span> of methane emissions annually.
                  </p>
                </div>
              </div>
            )}

            {/* Scenario Control */}
            <div className="glass-card rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 shadow-2xl border-green-400/10 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-80 h-80 bg-green-400/5 rounded-full -mr-40 -mt-40 blur-3xl transition-all group-hover:bg-green-400/10" />
              <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8 text-center lg:text-left">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 justify-center lg:justify-start">
                    <span className="w-2 h-2 rounded-full bg-green-400/100 animate-pulse" />
                    <h3 className="text-xl lg:text-2xl font-black text-white italic uppercase">Scenario Control</h3>
                  </div>
                  <p className="text-[11px] sm:text-sm text-slate-400 max-w-md mx-auto lg:mx-0">
                    Lock in your variables to establish a performance baseline, then experiment with parameters to find your farm's optimal ecosystem balance.
                  </p>
                </div>
                <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
                  <button
                    type="button"
                    onClick={saveAsBaseline}
                    className="w-full lg:w-auto px-8 py-4 bg-green-400 text-white hover:bg-green-500 rounded-2xl hover:bg-black text-sm lg:text-base font-black transition-all shadow-xl shadow-green-400/20 active:scale-95 flex items-center justify-center gap-3"
                  >
                    <span>SAVE BASELINE</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                  </button>
                  {baselineInputs && (
                    <div className="px-4 py-2 bg-green-400/10 rounded-xl text-[10px] font-black text-green-400 border border-green-400/20 flex items-center gap-2 whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400/100" />
                      ACTIVE COMPARISON ON
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Footer: Assumptions and Sources */}
          <footer className="mt-12 lg:mt-20 pt-8 sm:pt-10 border-t border-white/10/10">
            <Assumptions />
          </footer>
        </div>
      </div>
      </div>
    </div>
  );
}

export default ExpertDashboard;
