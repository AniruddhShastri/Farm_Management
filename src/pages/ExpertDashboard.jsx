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
  getCappedBiogasAnnualM3,
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
  getIrrigationEnergy,
  getDigestateLiters,
  getDigestateSavingsEur,
  getRecipeCheck,
  getRevenueStack,
  getMethaneSavingsCo2e,
  getDigesterVolume,
  getEffectiveDigesterVolume,
  getRawDigesterVolume,
  getBiogasCHPSplit,
  getBESSCapacity,
  getInfrastructureCosts,
} from '../utils/calculator';
import { getElectricityPrice } from '../utils/electricityPrice';
import locationData from '../../locationData.json';

/* ── Small reusable metric card ── */
function MetricCard({ label, value, unit, sub, accent = '#22c55e', icon }) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-1 hover:scale-[1.02] transition-transform">
      <div className="flex items-center justify-between mb-1">
        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <div className="font-black text-2xl" style={{ color: accent }}>
        {value}<span className="text-base font-semibold ml-1 text-slate-400">{unit}</span>
      </div>
      {sub && <div className="text-slate-500 text-xs mt-1">{sub}</div>}
    </div>
  );
}

/* ── Energy flow bar ── */
function EnergyFlowBar({ label, kwh, total, color }) {
  const pct = total > 0 ? Math.min((kwh / total) * 100, 100) : 0;
  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-slate-400 font-semibold">{label}</span>
        <span className="text-white font-bold">{kwh.toLocaleString()} kWh</span>
      </div>
      <div className="h-2 rounded-full bg-slate-800">
        <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="text-right text-xs text-slate-600 mt-0.5">{pct.toFixed(1)}%</div>
    </div>
  );
}

function ExpertDashboard() {
  const locationOptions = Object.keys(locationData.locations);

  const [inputs, setInputs] = useState(() => {
    const defaultLocation = locationOptions[0] || 'Stockholm, Sweden';
    const locationInfo = locationData.locations[defaultLocation];
    const defaultCrops = locationInfo?.crops || ['wheat', 'barley', 'corn'];
    const cropInputs = {};
    defaultCrops.forEach(crop => { cropInputs[`crop_${crop}`] = 0; });
    return {
      location: defaultLocation,
      cows: 10, pigs: 20, chickens: 100,
      roofArea: 500, solarArea: 200,
      rainfall: 0, isRainfallManual: false,
      inverterCapacityKW: 0, gridExportLimitKW: 0,
      manureManagement: 'open_lagoon',
      feedstock_dry_straw: 0, feedstock_green_leafy: 0,
      feedstock_root_starch: 0, feedstock_sugary_fruit: 0,
      feedstock_manure: 50,
      ...cropInputs
    };
  });

  const [baselineInputs, setBaselineInputs] = useState(null);
  const [electricityPriceInfo, setElectricityPriceInfo] = useState({ price: 0.15, label: 'Loading…' });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const calculateRainfallFromLocation = (location) => {
    const loc = locationData.locations[location];
    if (!loc) return 0;
    if (loc.annual_rainfall_mm != null) return loc.annual_rainfall_mm;
    const data = loc.rainfall_3year;
    if (!data?.length) return 0;
    return Math.round(data.reduce((s, v) => s + v, 0) / data.length);
  };

  const getSolarIrradiance = (location) =>
    locationData.locations[location]?.solar_irradiance_kwh_m2_day || 4.5;

  const buildCropAreas = () => {
    const cropAreas = {};
    Object.keys(inputs).forEach(key => {
      if (key.startsWith('crop_')) {
        const cropName = key.replace('crop_', '');
        const area = inputs[key] || 0;
        if (area > 0) cropAreas[cropName] = area;
      }
    });
    return cropAreas;
  };

  useEffect(() => {
    const calculatedRainfall = calculateRainfallFromLocation(inputs.location);
    setInputs(prev => ({ ...prev, rainfall: calculatedRainfall, isRainfallManual: false }));
  }, [inputs.location]);

  // Fetch dynamic electricity price when location changes
  useEffect(() => {
    const locData = locationData.locations[inputs.location];
    const staticFallback = locData?.electricity_price_eur || null;
    getElectricityPrice(inputs.location, staticFallback).then(setElectricityPriceInfo);
  }, [inputs.location]);

  const getWeatherData = () => {
    const locationInfo = locationData.locations[inputs.location];
    if (locationInfo) return {
      temperature: locationInfo.temperature,
      humidity: locationInfo.humidity,
      coordinates: locationInfo.coordinates,
      solarIrradiance: locationInfo.solar_irradiance_kwh_m2_day
    };
    return { temperature: 0, humidity: 0, coordinates: null, solarIrradiance: 4.5 };
  };

  const weather = getWeatherData();
  const calculatedRainfall = calculateRainfallFromLocation(inputs.location);
  const solarIrradiance = getSolarIrradiance(inputs.location);
  const cropAreas = buildCropAreas();
  const winterTempC = locationData.locations[inputs.location]?.winter_temperature_min_c ?? 5;
  const elecPrice = electricityPriceInfo.price;

  const handleInputChange = (key, value) => setInputs(prev => ({ ...prev, [key]: value }));
  const saveAsBaseline = () => setBaselineInputs({ ...inputs });

  /* ── Core calculations ── */
  const biogasRaw       = getBiogasEnergyRaw(inputs.cows, inputs.pigs, inputs.chickens);
  const biogasEnergy    = getBiogasEnergy(inputs.cows, inputs.pigs, inputs.chickens, winterTempC);
  const parasiticFraction = getParasiticLoadFraction(winterTempC);
  const chpSplit        = getBiogasCHPSplit(inputs.cows, inputs.pigs, inputs.chickens, winterTempC);
  const solarEnergy     = getSolarEnergy(inputs.solarArea, solarIrradiance);
  const totalEnergy     = getTotalEnergy(inputs.cows, inputs.pigs, inputs.chickens, inputs.solarArea, solarIrradiance, winterTempC, inputs.inverterCapacityKW || 0);
  const irrigationKwh   = getIrrigationEnergy(cropAreas);
  const totalEnergyRequired = getEnergyRequirement(inputs.cows, inputs.pigs, inputs.chickens, cropAreas);
  const waterHarvest    = getWaterHarvest(inputs.roofArea, inputs.rainfall);
  const waterRequired   = getWaterRequirement(inputs.cows, inputs.pigs, inputs.chickens, cropAreas);
  const carbonSequestered = getCarbonImpact(cropAreas); // returns 0 (biochar removed)
  const co2Avoided      = getCO2Avoided(totalEnergy);
  const totalCarbonImpact = getTotalCarbonImpact(cropAreas, totalEnergy);
  const financialSavings = getFinancials(totalEnergy, waterHarvest);
  const energyIndependence = getEnergyIndependence(totalEnergy, totalEnergyRequired);

  /* ── Digester & BESS ── */
  const digesterVolume  = getDigesterVolume(inputs.cows, inputs.pigs, inputs.chickens);
  const effectiveVolume = getEffectiveDigesterVolume(inputs.cows, inputs.pigs, inputs.chickens);
  const rawVolume       = getRawDigesterVolume(inputs.cows, inputs.pigs, inputs.chickens);
  const isCapped        = rawVolume > 120;
  const bessCapacity    = getBESSCapacity(inputs.solarArea);

  /* ── Digestate (capped by digester volume) ── */
  const annualBiogasM3  = getCappedBiogasAnnualM3(inputs.cows, inputs.pigs, inputs.chickens);
  const digestateLiters = getDigestateLiters(annualBiogasM3);
  const digestateSavingsEur = getDigestateSavingsEur(annualBiogasM3);

  /* ── CAPEX ── */
  const capex = getInfrastructureCosts(inputs.solarArea, inputs.cows, inputs.pigs, inputs.chickens);

  /* ── Recipe & revenue ── */
  const feedstockMix = {
    dry_straw: inputs.feedstock_dry_straw || 0, green_leafy: inputs.feedstock_green_leafy || 0,
    root_starch: inputs.feedstock_root_starch || 0, sugary_fruit: inputs.feedstock_sugary_fruit || 0,
    manure: inputs.feedstock_manure || 0
  };
  const recipeCheck = getRecipeCheck(feedstockMix);
  const revenue = getRevenueStack({
    totalGeneratedKwh: totalEnergy,
    totalRequiredKwh: totalEnergyRequired,
    gridExportLimitKW: inputs.gridExportLimitKW || 0,
    electricityPriceEurPerKwh: elecPrice,
    exportPriceEurPerKwh: elecPrice * 0.4,
    carbonCreditEurPerKwh: 0.02
  });
  const methaneSavingsCo2e = getMethaneSavingsCo2e(annualBiogasM3, inputs.manureManagement || 'open_lagoon');

  /* ── Simple payback estimate (internal use only) ── */
  const annualNetBenefit = revenue.totalEur + digestateSavingsEur;
  const paybackYears = annualNetBenefit > 0 ? (capex.total / annualNetBenefit).toFixed(1) : '—';

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--voneng-bg)' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 flex-shrink-0"
        style={{ background: '#030a06', borderBottom: '1px solid rgba(34,197,94,0.15)' }}>
        <div className="flex items-center gap-3">
          <img src={logo} alt="VONeng" className="h-7 w-auto" />
          <span className="text-green-400 text-xs font-bold uppercase tracking-widest">Expert Dashboard</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/advisor" className="text-slate-400 hover:text-green-400 text-xs font-medium transition-colors">Farmer Advisor</Link>
          <Link to="/" className="text-slate-400 hover:text-green-400 text-xs font-medium transition-colors">Back to Site</Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
        )}
        <Sidebar inputs={inputs} onInputChange={handleInputChange} locationOptions={locationOptions}
          calculatedRainfall={calculatedRainfall} isRainfallManual={inputs.isRainfallManual}
          isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 overflow-y-auto relative min-w-0">
          {/* Mobile toolbar */}
          <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#030a06]/90 backdrop-blur-md border-b border-white/10">
            <img src={logo} alt="Logo" className="h-7 w-auto object-contain" />
            <div className="flex items-center gap-2">
              <Link to="/advisor" className="text-slate-400 hover:text-green-400 text-xs font-medium transition-colors px-2 py-1">Advisor</Link>
              <Link to="/" className="text-slate-400 hover:text-green-400 text-xs font-medium transition-colors px-2 py-1">Home</Link>
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-green-400/10 text-green-400 rounded-xl ml-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-green-400/10 to-transparent -z-10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-yellow-400/10 to-transparent -z-10 blur-3xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 sm:py-8 relative z-10">

            {/* ── Header ── */}
            <header className="mb-8 lg:mb-12">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
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
                  <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed mb-4">
                    Model energy, water, and resource flows for climate-positive operations at <span className="text-white font-bold">{inputs.location}</span>.
                  </p>
                  {/* Electricity price badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                    style={{ background: 'rgba(22,163,74,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#4ade80' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Electricity price: €{elecPrice.toFixed(3)}/kWh — {electricityPriceInfo.label}
                  </div>

                  <div className="mt-4 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl p-4 flex items-start gap-4 max-w-2xl">
                    <span className="text-2xl">👋</span>
                    <p className="text-[11px] sm:text-xs text-yellow-200/80 leading-relaxed font-medium">
                      Early prototype — numbers are grounded in solid research but treat them as a <span className="font-bold underline decoration-yellow-400">brilliant educated guess</span> pending on-site validation.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 w-full lg:w-auto">
                  <div className="glass-card rounded-[1.5rem] p-1 shadow-xl w-full sm:w-auto overflow-x-auto">
                    <WeatherDisplay location={inputs.location} temperature={weather.temperature} humidity={weather.humidity} />
                  </div>
                  <div className="flex gap-2 w-full lg:justify-end flex-wrap">
                    <span className="px-3 py-1 bg-green-400/10 text-green-400 text-[9px] font-bold rounded-full border border-green-400/20 uppercase tracking-wider">
                      {weather.coordinates?.lat}, {weather.coordinates?.lng}
                    </span>
                    <span className="px-3 py-1 bg-yellow-400/10 text-yellow-400 text-[9px] font-bold rounded-full border border-yellow-400/20 uppercase tracking-wider font-mono">
                      {solarIrradiance} kWh/m²/day
                    </span>
                  </div>
                </div>
              </div>

              <div className="glass-card rounded-[2rem] overflow-hidden shadow-2xl h-[250px] sm:h-[350px] lg:h-[420px] mb-8 lg:mb-12">
                <LocationMap location={inputs.location} coordinates={weather.coordinates} />
              </div>
            </header>

            {/* ── 1. SYSTEM PERFORMANCE KPIs ── */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                <h3 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight">System Performance</h3>
              </div>
              <KPICards financialSavings={financialSavings} energyIndependence={energyIndependence} carbonImpact={totalCarbonImpact} />
            </section>

            {/* ── 2. SYSTEM SIZING ── */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                <h3 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight">System Sizing</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <MetricCard
                  label="Digester Volume" icon="🫧"
                  value={digesterVolume} unit="m³"
                  sub={isCapped ? `⚠ Capped from ${rawVolume.toFixed(0)} m³` : `Effective: ${effectiveVolume} m³`}
                  accent={isCapped ? '#f59e0b' : '#22c55e'}
                />
                <MetricCard label="Effective Volume" icon="📦" value={effectiveVolume} unit="m³" sub="90% of total (10% headspace)" accent="#22c55e" />
                <MetricCard label="BESS Capacity" icon="🔋" value={bessCapacity} unit="kWh" sub={`PV:BESS = 1:3 · ${(inputs.solarArea * 0.2).toFixed(1)} kWp solar`} accent="#818cf8" />
                <MetricCard label="Solar Peak" icon="☀️" value={(inputs.solarArea * 0.2).toFixed(1)} unit="kWp" sub={`${inputs.solarArea} m² @ 20% eff.`} accent="#fbbf24" />
              </div>

              {/* Digester volume bar */}
              {rawVolume > 0 && (
                <div className="glass-card rounded-2xl p-5">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Digester Load vs Capacity</div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-4 rounded-full bg-slate-800 overflow-hidden">
                      <div className="h-4 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min((rawVolume / 120) * 100, 100)}%`, background: isCapped ? 'linear-gradient(90deg,#f59e0b,#ef4444)' : 'linear-gradient(90deg,#22c55e,#4ade80)' }} />
                    </div>
                    <span className="text-xs font-black text-white whitespace-nowrap">
                      {Math.min(rawVolume, 120).toFixed(0)} / 120 m³ {isCapped && <span className="text-yellow-400">CAPPED</span>}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-2">
                    {isCapped
                      ? `Farm requires ${rawVolume.toFixed(0)} m³ but system is capped at 120 m³. Biogas and fertilizer output are scaled proportionally.`
                      : `${((rawVolume / 120) * 100).toFixed(0)}% of maximum digester capacity utilised.`}
                  </p>
                </div>
              )}
            </section>

            {/* ── 3. ENERGY FLOW ANALYSIS ── */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-yellow-400 rounded-full" />
                <h3 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight">Energy Flow Analysis</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Generation breakdown */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Generation Sources</div>
                  <EnergyFlowBar label="Biogas → Direct Use (30%)" kwh={chpSplit.directUseKwh} total={totalEnergy} color="#22c55e" />
                  <EnergyFlowBar label="Biogas → Micro-CHP (70%)" kwh={chpSplit.chpKwh} total={totalEnergy} color="#4ade80" />
                  <EnergyFlowBar label="Solar PV" kwh={Math.round(solarEnergy)} total={totalEnergy} color="#fbbf24" />
                  <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-sm">
                    <span className="text-slate-400 font-semibold">Total Generated</span>
                    <span className="text-white font-black">{totalEnergy.toLocaleString()} kWh/yr</span>
                  </div>
                </div>

                {/* Demand breakdown */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Demand Breakdown</div>
                  <EnergyFlowBar label="Livestock Operations" kwh={Math.round(inputs.cows * 500 + inputs.pigs * 50 + inputs.chickens * 2)} total={totalEnergyRequired} color="#818cf8" />
                  <EnergyFlowBar label="Crop Processing" kwh={Math.round(Object.values(cropAreas).reduce((s, v) => s + v, 0) * 600 * 9/12)} total={totalEnergyRequired} color="#a78bfa" />
                  <EnergyFlowBar label="Irrigation Pumping" kwh={irrigationKwh} total={totalEnergyRequired} color="#60a5fa" />
                  <EnergyFlowBar label="Base Infrastructure" kwh={2000} total={totalEnergyRequired} color="#94a3b8" />
                  <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-sm">
                    <span className="text-slate-400 font-semibold">Total Required</span>
                    <span className="text-white font-black">{totalEnergyRequired.toLocaleString()} kWh/yr</span>
                  </div>
                </div>
              </div>

              {/* BESS storage detail */}
              {bessCapacity > 0 && (
                <div className="mt-4 glass-card rounded-2xl p-5 flex items-center gap-6 flex-wrap">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-xl">🔋</div>
                  <div>
                    <div className="text-white font-bold text-sm">Battery Energy Storage System</div>
                    <div className="text-slate-400 text-xs mt-0.5">{bessCapacity} kWh capacity · PV:BESS ratio 1:3 · Enables 24/7 power availability</div>
                  </div>
                  <div className="ml-auto flex gap-6 text-center">
                    <div><div className="text-indigo-400 font-black text-lg">{bessCapacity}</div><div className="text-slate-500 text-xs">kWh stored</div></div>
                    <div><div className="text-indigo-400 font-black text-lg">{(bessCapacity / 24).toFixed(1)}</div><div className="text-slate-500 text-xs">avg kW</div></div>
                  </div>
                </div>
              )}
            </section>

            {/* ── 4. INSIGHT ANALYTICS ── */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-6 bg-emerald-600 rounded-full" />
                <div>
                  <h3 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight leading-none mb-1">Insight Analytics</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Real-time optimisation data</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="flex flex-col gap-6 order-2 lg:order-1">
                  <div className="glass-card rounded-[2rem] shadow-xl overflow-hidden hover:scale-[1.02] transition-transform">
                    <DigestateCard digestateLiters={digestateLiters} digestateSavingsEur={digestateSavingsEur} />
                  </div>
                  <div className="glass-card rounded-[2rem] shadow-xl overflow-hidden hover:scale-[1.02] transition-transform">
                    <RevenueStack revenue={revenue} />
                  </div>
                  <RecipeCheckWarning recipeCheck={recipeCheck} />
                  <div className="glass-card rounded-2xl p-4 border-yellow-400/10 bg-yellow-400/5">
                    <ParasiticLoadNote winterTempC={winterTempC} parasiticFraction={parasiticFraction} biogasGross={biogasRaw} biogasNet={biogasEnergy} />
                  </div>
                </div>

                <div className="lg:col-span-2 glass-card rounded-[2rem] lg:rounded-[2.5rem] p-4 sm:p-6 shadow-2xl bg-[#0a1a0f]/5 backdrop-blur-sm order-1 lg:order-2">
                  <Charts
                    biogasEnergy={biogasEnergy} solarEnergy={solarEnergy}
                    totalEnergy={totalEnergy} totalEnergyRequired={totalEnergyRequired}
                    waterHarvest={waterHarvest} waterRequired={waterRequired}
                    carbonSequestered={carbonSequestered} co2Avoided={co2Avoided}
                    financialSavings={financialSavings}
                  />
                </div>
              </div>

              {annualBiogasM3 > 0 && (
                <div className="mb-6 p-5 sm:p-6 bg-emerald-600 rounded-[2rem] shadow-xl text-white flex flex-col md:flex-row items-center gap-4 hover:scale-[1.01] transition-transform">
                  <div className="w-12 h-12 bg-[#0a1a0f]/20 rounded-2xl flex items-center justify-center border border-white/30 flex-shrink-0">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                    </svg>
                  </div>
                  <div className="text-center md:text-left">
                    <h4 className="text-base sm:text-lg font-black mb-1 italic">Climate Impact Milestone</h4>
                    <p className="text-emerald-50 text-xs sm:text-sm font-medium leading-relaxed">
                      By switching from <strong>{inputs.manureManagement === 'open_lagoon' ? 'Open Lagoon' : 'Field Spreading'}</strong> to controlled digestion, avoiding{' '}
                      <span className="bg-[#0a1a0f] text-green-400 px-3 py-1 rounded-full font-black mx-1 inline-block whitespace-nowrap">{methaneSavingsCo2e} t CO₂e</span> of methane annually.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* ── 5. FINANCIAL ROI ── */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-green-400 rounded-full" />
                <h3 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight">Financial ROI</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CAPEX breakdown */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Capital Expenditure (CAPEX)</div>
                  {[
                    { label: `Anaerobic Digester (${digesterVolume.toFixed(0)} m³ + 15 kW Micro-CHP)`, val: capex.digester, color: '#22c55e' },
                    { label: `Solar PV Array (${(inputs.solarArea * 0.2).toFixed(1)} kWp)`, val: capex.solar, color: '#fbbf24' },
                    { label: `BESS (${bessCapacity} kWh @ 1:3 ratio)`, val: capex.bess, color: '#818cf8' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="mb-3">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{label}</span>
                        <span className="font-bold text-white">${val.toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-800">
                        <div className="h-1.5 rounded-full" style={{ width: `${capex.total > 0 ? (val / capex.total) * 100 : 0}%`, background: color }} />
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between">
                    <span className="text-slate-300 font-bold text-sm">Total CAPEX</span>
                    <span className="text-white font-black text-lg">${capex.total.toLocaleString()}</span>
                  </div>
                  <p className="text-slate-600 text-xs mt-2">Ref: 120 m³ digester + 15 kW CHP = $40,000. Linear scaling applied.</p>
                </div>

                {/* Annual returns & payback */}
                <div className="glass-card rounded-2xl p-6">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Annual Returns</div>
                  {[
                    { label: 'Electricity avoided', val: revenue.avoidedCostEur, color: '#22c55e' },
                    { label: 'Grid export revenue', val: revenue.exportRevenueEur, color: '#4ade80' },
                    { label: 'Carbon credits', val: revenue.carbonCreditsEur, color: '#34d399' },
                    { label: 'Digestate (fertilizer)', val: digestateSavingsEur, color: '#6ee7b7' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                        <span className="text-slate-400 text-xs">{label}</span>
                      </div>
                      <span className="text-white font-bold text-sm">€{val.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-slate-300 font-bold text-sm">Total Annual Benefit</span>
                    <span className="text-green-400 font-black text-xl">€{(revenue.totalEur + digestateSavingsEur).toLocaleString()}</span>
                  </div>
                  <div className="mt-4 p-3 rounded-xl bg-green-400/10 border border-green-400/20 flex justify-between items-center">
                    <span className="text-green-400 text-xs font-bold uppercase tracking-wider">Est. Payback Period</span>
                    <span className="text-green-400 font-black text-lg">{paybackYears} yrs</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── 6. RESOURCE YIELDS ── */}
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1.5 h-6 bg-teal-400 rounded-full" />
                <h3 className="text-lg lg:text-xl font-black text-white uppercase tracking-tight">Resource Yields</h3>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard label="Digestate Output" icon="🌿" value={digestateLiters.toLocaleString()} unit="L/yr" sub="Capped by digester volume" accent="#22c55e" />
                <MetricCard label="Water Harvested" icon="💧" value={(waterHarvest / 1000).toFixed(0)} unit="kL/yr" sub={`From ${inputs.roofArea} m² roof`} accent="#38bdf8" />
                <MetricCard label="Water Needed" icon="🚿" value={(waterRequired / 1000).toFixed(0)} unit="kL/yr" sub="Livestock + irrigation" accent="#94a3b8" />
                <MetricCard label="Biogas Produced" icon="⚗️" value={annualBiogasM3.toLocaleString()} unit="m³/yr" sub={`${isCapped ? 'Volume-capped' : 'Full capacity'}`} accent={isCapped ? '#f59e0b' : '#22c55e'} />
              </div>
              <div className="mt-4 grid grid-cols-2 lg:grid-cols-3 gap-4">
                <MetricCard label="Irrigation Energy" icon="🏗️" value={irrigationKwh.toLocaleString()} unit="kWh/yr" sub="Pump energy for cultivated land" accent="#60a5fa" />
                <MetricCard label="CO₂ Avoided" icon="🌍" value={co2Avoided} unit="t/yr" sub="Grid displacement, no biochar" accent="#34d399" />
                <MetricCard label="Methane Saved" icon="🔥" value={methaneSavingsCo2e} unit="t CO₂e/yr" sub="vs open lagoon / field spread" accent="#f97316" />
              </div>
            </section>

            {/* ── 7. SCENARIO CONTROL ── */}
            <section className="mb-10">
              <div className="glass-card rounded-[2rem] lg:rounded-[2.5rem] p-6 lg:p-8 shadow-2xl border-green-400/10 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-green-400/5 rounded-full -mr-40 -mt-40 blur-3xl group-hover:bg-green-400/10 transition-all" />
                <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 justify-center lg:justify-start">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <h3 className="text-xl lg:text-2xl font-black text-white italic uppercase">Scenario Control</h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto lg:mx-0">
                      Lock in variables to establish a performance baseline, then experiment to find your farm's optimal balance.
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-4 w-full lg:w-auto">
                    <button type="button" onClick={saveAsBaseline}
                      className="w-full lg:w-auto px-8 py-4 bg-green-400 text-white hover:bg-green-500 rounded-2xl text-sm font-black transition-all shadow-xl shadow-green-400/20 active:scale-95 flex items-center justify-center gap-3">
                      <span>SAVE BASELINE</span>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                      </svg>
                    </button>
                    {baselineInputs && (
                      <div className="px-4 py-2 bg-green-400/10 rounded-xl text-[10px] font-black text-green-400 border border-green-400/20 flex items-center gap-2 whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> ACTIVE COMPARISON ON
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <footer className="mt-12 pt-8 border-t border-white/10">
              <Assumptions />
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpertDashboard;
