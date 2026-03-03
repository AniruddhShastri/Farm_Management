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
import HybridRESCalculator from './components/HybridRESCalculator';
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
  getMethaneSavingsCo2e,
  getRTFMethane,
  getRTFPower,
  getHybridRESSuggestion
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
      cattleType: 'Dairy',
      amountBiomassTonsDay: 0,
      dailyLoadKwh: 100,
      insufficientBiomassChoice: 'add_biomass',
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

  // Hybrid RES variables
  const { cattleType, amountBiomassTonsDay, dailyLoadKwh, insufficientBiomassChoice } = inputs;
  const dailyPvKwh = solarEnergy / 365;
  const rtfMethaneM3 = getRTFMethane(cattleType, inputs.cows, amountBiomassTonsDay);
  const rtfPowerKwh = getRTFPower(rtfMethaneM3);
  const rtfSuggestion = getHybridRESSuggestion(dailyPvKwh, dailyLoadKwh || 0, rtfPowerKwh, insufficientBiomassChoice === 'add_biomass', cattleType);

  return (
    <div className="flex h-screen bg-green-50">
      {/* Sidebar */}
      <Sidebar
        inputs={inputs}
        onInputChange={handleInputChange}
        locationOptions={locationOptions}
        calculatedRainfall={calculatedRainfall}
        isRainfallManual={inputs.isRainfallManual}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Header with Weather Display and Map */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50 15 L85 35 L50 55 L15 35 Z" fill="#4F73FF" stroke="white" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M15 35 L50 55 L50 95 L15 75 Z" fill="#FFD34C" stroke="white" strokeWidth="4" strokeLinejoin="round" />
                  <path d="M50 55 L85 35 L85 75 L50 95 Z" fill="#00C266" stroke="white" strokeWidth="4" strokeLinejoin="round" />
                </svg>
                <div className="text-4xl tracking-tight text-black flex items-center mt-1">
                  <span className="font-extrabold">VON</span>
                  <span className="font-medium">ENG</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-emerald-950 mb-2">
                EcoSynergy: Circular Farm Systems Integrator
              </h2>
              <p className="text-emerald-800">
                Modeling energy, water, and biological waste flows in agricultural ecosystems
              </p>
            </div>
            <div className="w-80 ml-6">
              <WeatherDisplay
                location={inputs.location}
                temperature={weather.temperature}
                humidity={weather.humidity}
              />
            </div>
          </div>
          <div className="mt-4">
            <LocationMap
              location={inputs.location}
              coordinates={weather.coordinates}
            />
          </div>
        </div>

        {/* Recipe check warning (acidification risk) */}
        <RecipeCheckWarning recipeCheck={recipeCheck} />

        {/* Parasitic load note (cold climate) */}
        <div className="mb-6">
          <ParasiticLoadNote
            winterTempC={winterTempC}
            parasiticFraction={parasiticFraction}
            biogasGross={biogasRaw}
            biogasNet={biogasEnergy}
          />
        </div>

        {/* KPI Cards */}
        <KPICards
          financialSavings={financialSavings}
          energyIndependence={energyIndependence}
          carbonImpact={totalCarbonImpact}
        />

        {/* Hybrid RES Calculator Integration */}
        <HybridRESCalculator
          methaneGeneratedM3={rtfMethaneM3}
          biogasPowerGeneratedKwh={rtfPowerKwh}
          dailyPvKwh={dailyPvKwh}
          dailyLoadKwh={dailyLoadKwh || 0}
          suggestion={rtfSuggestion}
        />

        {/* Digestate & Revenue Stack row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <DigestateCard digestateLiters={digestateLiters} digestateSavingsEur={digestateSavingsEur} />
          <RevenueStack revenue={revenue} />
        </div>
        {annualBiogasM3 > 0 && (
          <p className="text-sm text-emerald-800 mb-6">
            <strong>Methane baseline:</strong> Based on &quot;{inputs.manureManagement === 'open_lagoon' ? 'Open lagoon' : 'Spread on field'}&quot; — methane avoided: <strong>{methaneSavingsCo2e} tons CO₂e/yr</strong>.
          </p>
        )}

        {/* What-If scenario */}
        <div className="mb-8 flex flex-wrap items-center gap-4 rounded-xl border border-emerald-200 bg-white/80 p-4">
          <p className="text-emerald-800">
            <strong>What-If mode:</strong> Change inputs in the sidebar (e.g. +50 cows, more solar) to see ROI and tank size update instantly.
          </p>
          <button
            type="button"
            onClick={saveAsBaseline}
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 font-medium"
          >
            Save current as baseline
          </button>
          {baselineInputs && (
            <span className="text-sm text-emerald-800">
              Baseline saved ({baselineInputs.cows} cows, {baselineInputs.solarArea} m² solar). Edit inputs to compare.
            </span>
          )}
        </div>

        {/* Charts */}
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

        {/* Assumptions and Sources */}
        <Assumptions />
      </div>
    </div>
  );
}

export default App;
