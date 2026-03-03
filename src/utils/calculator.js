import farmData from '../../farmData.json';
import biomassProxy from '../data/biomassProxy.json';

/**
 * Get annual biogas volume in m³ (for digestate and parasitic calculations)
 */
export function getBiogasAnnualM3(numCows = 0, numPigs = 0, numChickens = 0) {
  const { livestock } = farmData;
  const cowBiogas = numCows * livestock.dairy_cow.daily_manure_kg * livestock.dairy_cow.biogas_yield_m3_per_kg;
  const pigBiogas = numPigs * livestock.pig.daily_manure_kg * livestock.pig.biogas_yield_m3_per_kg;
  const chickenBiogas = numChickens * livestock.chicken.daily_manure_kg * livestock.chicken.biogas_yield_m3_per_kg;
  return (cowBiogas + pigBiogas + chickenBiogas) * 365;
}

/**
 * Parasitic load: fraction of biogas energy deducted for tank heating when ambient < 5°C.
 * If winterTemp >= 5°C returns 0; otherwise 20–30% (colder = higher).
 */
export function getParasiticLoadFraction(winterTempC) {
  const { parasitic_load } = farmData;
  if (winterTempC >= parasitic_load.ambient_temp_threshold_c) return 0;
  const range = parasitic_load.fraction_deduct_max - parasitic_load.fraction_deduct_min;
  const coldness = Math.min(parasitic_load.ambient_temp_threshold_c - winterTempC, 15);
  const fraction = parasitic_load.fraction_deduct_min + (range * coldness) / 15;
  return Math.min(fraction, parasitic_load.fraction_deduct_max);
}

/**
 * Calculate biogas energy generation from livestock (gross, before parasitic load)
 */
export function getBiogasEnergyRaw(numCows = 0, numPigs = 0, numChickens = 0) {
  const { energy } = farmData;
  const annualBiogasM3 = getBiogasAnnualM3(numCows, numPigs, numChickens);
  const annualEnergyKwh = annualBiogasM3 * energy.biogas_energy_density_kwh_per_m3 * energy.generator_efficiency;
  return Math.round(annualEnergyKwh * 100) / 100;
}

/**
 * Calculate biogas energy generation from livestock (net after parasitic load for heating)
 * @param {number} numCows - Number of dairy cows
 * @param {number} numPigs - Number of pigs
 * @param {number} numChickens - Number of chickens
 * @param {number} winterTempC - Winter minimum ambient temp (°C); if < 5°C, 20–30% deducted for self-heating
 * @returns {number} Net energy in kWh per year
 */
export function getBiogasEnergy(numCows = 0, numPigs = 0, numChickens = 0, winterTempC = null) {
  const raw = getBiogasEnergyRaw(numCows, numPigs, numChickens);
  if (winterTempC === null || winterTempC === undefined) return raw;
  const fraction = getParasiticLoadFraction(winterTempC);
  const net = raw * (1 - fraction);
  return Math.round(net * 100) / 100;
}

/**
 * Calculate solar energy generation based on location
 * @param {number} solarArea - Solar panel area in m²
 * @param {number} solarIrradiance - Solar irradiance in kWh/m²/day (location-specific)
 * @returns {number} Total energy in kWh per year
 */
export function getSolarEnergy(solarArea = 0, solarIrradiance = 4.5) {
  const dailyEnergy = solarArea * solarIrradiance;
  const annualEnergy = dailyEnergy * 365;
  return Math.round(annualEnergy * 100) / 100;
}

/**
 * Solar with inverter clipping: if inverter capacity (kW) is set and panels could exceed it, cap annual generation.
 * Common when e.g. 60 kWp panels on a 50 kW inverter (winter optimization).
 */
export function getSolarEnergyClipped(solarArea = 0, solarIrradiance = 4.5, inverterCapacityKW = 0) {
  const rawAnnualKwh = getSolarEnergy(solarArea, solarIrradiance);
  if (!inverterCapacityKW || inverterCapacityKW <= 0) return rawAnnualKwh;
  const peakKW = solarArea * 0.2;
  if (peakKW <= inverterCapacityKW) return rawAnnualKwh;
  const capacityFactor = 0.17;
  const maxFromInverter = inverterCapacityKW * 8760 * capacityFactor;
  return Math.round(Math.min(rawAnnualKwh, maxFromInverter) * 100) / 100;
}

/**
 * Calculate total energy generation (biogas net + solar, with optional clipping)
 */
export function getTotalEnergy(numCows = 0, numPigs = 0, numChickens = 0, solarArea = 0, solarIrradiance = 4.5, winterTempC = null, inverterCapacityKW = 0) {
  const biogasEnergy = getBiogasEnergy(numCows, numPigs, numChickens, winterTempC);
  const solarEnergy = inverterCapacityKW > 0
    ? getSolarEnergyClipped(solarArea, solarIrradiance, inverterCapacityKW)
    : getSolarEnergy(solarArea, solarIrradiance);
  return biogasEnergy + solarEnergy;
}

/**
 * Digestate (liquid fertilizer) produced from biogas: liters per year and estimated savings (€/yr)
 */
export function getDigestateLiters(annualBiogasM3) {
  const { digestate } = farmData;
  const liters = annualBiogasM3 * digestate.liters_per_m3_biogas;
  return Math.round(liters);
}

export function getDigestateSavingsEur(annualBiogasM3) {
  const liters = getDigestateLiters(annualBiogasM3);
  const { digestate } = farmData;
  const savings = liters * digestate.fertilizer_value_eur_per_liter;
  return Math.round(savings * 100) / 100;
}

/**
 * Recipe check (C:N balance). feedstockMix: { dry_straw, green_leafy, root_starch, sugary_fruit, manure } shares (0–1).
 * Returns { ok, warning, cNRatio }.
 */
export function getRecipeCheck(feedstockMix = {}) {
  const buckets = biomassProxy.buckets;
  const recipe = biomassProxy.recipe;
  const total = Object.values(feedstockMix).reduce((s, v) => s + (v || 0), 0);
  if (total <= 0) return { ok: true, warning: null, cNRatio: null };

  let weightedCN = 0;
  Object.entries(feedstockMix).forEach(([key, share]) => {
    if (buckets[key] && share) weightedCN += buckets[key].c_n_ratio * (share / total);
  });
  const sugaryShare = (feedstockMix.sugary_fruit || 0) / total;
  const acidic = sugaryShare >= recipe.acidification_warning_if_sugary_share_above;
  const cnOutOfRange = weightedCN < recipe.ideal_c_n_min || weightedCN > recipe.ideal_c_n_max;

  if (acidic) {
    return {
      ok: false,
      warning: 'Feedstock too acidic. Please add manure or straw to balance.',
      cNRatio: Math.round(weightedCN * 10) / 10,
      recommendation: recipe.recommendation
    };
  }
  if (cnOutOfRange) {
    return {
      ok: false,
      warning: `C:N ratio (${(weightedCN).toFixed(1)}) is outside ideal range 20–30. Add manure or straw to balance.`,
      cNRatio: Math.round(weightedCN * 10) / 10,
      recommendation: recipe.recommendation
    };
  }
  return { ok: true, warning: null, cNRatio: Math.round(weightedCN * 10) / 10 };
}

/**
 * Methane baseline: CO2e avoided (tons) based on how manure was previously managed.
 * manureManagement: 'open_lagoon' | 'spread_field'
 */
export function getMethaneSavingsCo2e(annualBiogasM3, manureManagement = 'open_lagoon') {
  const baseline = farmData.methane_baseline;
  const kgPerM3 = manureManagement === 'open_lagoon'
    ? baseline.open_lagoon_kg_co2e_per_m3_biogas_avoided
    : baseline.spread_field_kg_co2e_per_m3_biogas_avoided;
  const tons = (annualBiogasM3 * kgPerM3) / 1000;
  return Math.round(tons * 100) / 100;
}

/**
 * Revenue stacking: avoided cost, export revenue, carbon credits (€/yr).
 * gridExportLimitKW: max export in kW; 0 = self-consumption only.
 */
export function getRevenueStack({
  totalGeneratedKwh = 0,
  totalRequiredKwh = 0,
  gridExportLimitKW = 0,
  electricityPriceEurPerKwh = 0.15,
  exportPriceEurPerKwh = 0.10,
  carbonCreditEurPerKwh = 0.02
}) {
  const selfConsumed = Math.min(totalGeneratedKwh, totalRequiredKwh);
  const avoidedCostEur = selfConsumed * electricityPriceEurPerKwh;
  const potentialExportKwh = Math.max(0, totalGeneratedKwh - totalRequiredKwh);
  const maxExportKwhPerYear = gridExportLimitKW > 0 ? gridExportLimitKW * 8760 * 0.15 : 0;
  const exportKwh = Math.min(potentialExportKwh, maxExportKwhPerYear);
  const exportRevenueEur = exportKwh * exportPriceEurPerKwh;
  const greenKwh = totalGeneratedKwh;
  const carbonCreditsEur = greenKwh * carbonCreditEurPerKwh;
  return {
    avoidedCostEur: Math.round(avoidedCostEur * 100) / 100,
    exportRevenueEur: Math.round(exportRevenueEur * 100) / 100,
    carbonCreditsEur: Math.round(carbonCreditsEur * 100) / 100,
    totalEur: Math.round((avoidedCostEur + exportRevenueEur + carbonCreditsEur) * 100) / 100,
    exportKwh,
    selfConsumedKwh: selfConsumed
  };
}

/**
 * Calculate rainwater harvesting potential
 * @param {number} roofArea - Roof area in m²
 * @param {number} rainfall - Annual rainfall in mm
 * @returns {number} Total water in liters per year
 */
export function getWaterHarvest(roofArea = 0, rainfall = 0) {
  const { water } = farmData;
  // Convert mm to liters: 1 mm = 1 liter per m²
  const totalWaterLiters = roofArea * rainfall * water.roof_runoff_coefficient;
  return Math.round(totalWaterLiters);
}

/**
 * Calculate water requirement for the farm
 * Based on livestock and crops (accounting for seasonal rotation)
 * @param {number} numCows - Number of dairy cows
 * @param {number} numPigs - Number of pigs
 * @param {number} numChickens - Number of chickens
 * @param {object} cropAreas - Object with crop names as keys and hectares as values
 * @returns {number} Total water requirement in liters per year
 */
export function getWaterRequirement(numCows = 0, numPigs = 0, numChickens = 0, cropAreas = {}) {
  // Average water consumption per animal per day (liters)
  const cowWaterPerDay = 100; // liters per cow per day
  const pigWaterPerDay = 15; // liters per pig per day
  const chickenWaterPerDay = 0.3; // liters per chicken per day

  // Average irrigation requirement per hectare per year (liters)
  // Accounting for 3 seasons (4 months each) and 1 month fallow per season
  const cropWaterPerHa = 5000000; // Average 5000 m³ = 5,000,000 L per hectare per year

  // Calculate livestock water requirement
  const livestockWater = (numCows * cowWaterPerDay + numPigs * pigWaterPerDay + numChickens * chickenWaterPerDay) * 365;

  // Calculate crop irrigation requirement (sum of all crop areas)
  const totalCropArea = Object.values(cropAreas).reduce((sum, area) => sum + (area || 0), 0);
  // Account for seasonal rotation: 3 seasons of 4 months = 9 months active, 3 months fallow
  const activeCropMonths = 9; // 3 seasons × 3 months active (4 months crop - 1 month fallow)
  const cropWater = totalCropArea * cropWaterPerHa * (activeCropMonths / 12);

  const totalWaterRequired = livestockWater + cropWater;
  return Math.round(totalWaterRequired);
}

/**
 * Calculate carbon sequestration from biochar (accounting for seasonal rotation)
 * @param {object} cropAreas - Object with crop names as keys and hectares as values
 * @returns {number} Total CO2 sequestered in tons per year
 */
export function getCarbonImpact(cropAreas = {}) {
  const { crops, seasons } = farmData;

  let totalBiochar = 0;

  // Calculate biochar from each crop, accounting for seasonal rotation
  Object.entries(cropAreas).forEach(([cropName, hectares]) => {
    if (crops[cropName] && hectares > 0) {
      const cropData = crops[cropName];
      const cropBiochar = hectares * cropData.residue_yield_tons_per_ha * cropData.biochar_conversion_rate;

      // Account for seasonal rotation: crops are only active during their season
      // 3 seasons per year, each crop grows in 1 season (4 months), with 1 month fallow
      // So each crop is active for 3 months per season = 9 months total per year
      const activeMonths = 9; // 3 seasons × 3 active months
      const adjustedBiochar = cropBiochar * (activeMonths / 12);

      totalBiochar += adjustedBiochar;
    }
  });

  // Calculate CO2 sequestered (using first crop's coefficient as all are the same)
  const co2Sequestered = totalBiochar * crops.wheat.co2_sequestered_per_ton_biochar;

  return Math.round(co2Sequestered * 100) / 100;
}

/**
 * Calculate CO2 emissions avoided from energy generation
 * @param {number} energyKwh - Energy generated in kWh
 * @returns {number} CO2 avoided in tons
 */
export function getCO2Avoided(energyKwh = 0) {
  const { energy } = farmData;
  // Convert kg to tons
  const co2AvoidedKg = energyKwh * energy.grid_co2_intensity_kg_per_kwh;
  const co2AvoidedTons = co2AvoidedKg / 1000;
  return Math.round(co2AvoidedTons * 100) / 100;
}

/**
 * Calculate total carbon impact (sequestration + avoided emissions)
 * @param {object} cropAreas - Object with crop names as keys and hectares as values
 * @param {number} energyKwh - Energy generated in kWh
 * @returns {number} Net CO2 impact in tons (negative = carbon negative)
 */
export function getTotalCarbonImpact(cropAreas = {}, energyKwh = 0) {
  const sequestered = getCarbonImpact(cropAreas);
  const avoided = getCO2Avoided(energyKwh);
  const total = sequestered + avoided;
  return Math.round(total * 100) / 100;
}

/**
 * Calculate financial savings (operational savings only, excludes infrastructure costs)
 * @param {number} energyKwh - Energy generated in kWh
 * @param {number} waterLiters - Water harvested in liters
 * @returns {number} Total operational savings in USD per year
 */
export function getFinancials(energyKwh = 0, waterLiters = 0) {
  const { energy, water } = farmData;

  // Operational savings only (energy and water costs avoided)
  const energySavings = energyKwh * energy.electricity_cost_usd_per_kwh;
  const waterSavings = waterLiters * water.water_pumping_cost_usd_per_liter;

  const totalSavings = energySavings + waterSavings;
  return Math.round(totalSavings * 100) / 100;
}

/**
 * Calculate infrastructure costs (one-time CAPEX)
 * @param {number} solarArea - Solar panel area in m²
 * @param {number} numCows - Number of dairy cows (for biogas plant sizing)
 * @returns {object} Infrastructure costs breakdown
 */
export function getInfrastructureCosts(solarArea = 0, numCows = 0) {
  const { energy } = farmData;

  const solarCost = solarArea * energy.solar_pv_cost_per_m2_usd;
  const biogasCost = numCows * energy.biogas_plant_cost_per_cow_usd;

  return {
    solar: Math.round(solarCost),
    biogas: Math.round(biogasCost),
    total: Math.round(solarCost + biogasCost)
  };
}

/**
 * Calculate energy independence percentage
 * @param {number} generatedEnergy - Energy generated in kWh
 * @param {number} totalEnergyNeeded - Total energy needed in kWh
 * @returns {number} Energy independence percentage
 */
export function getEnergyIndependence(generatedEnergy = 0, totalEnergyNeeded = 10000) {
  if (totalEnergyNeeded === 0) return 0;
  const percentage = (generatedEnergy / totalEnergyNeeded) * 100;
  return Math.min(Math.round(percentage * 100) / 100, 100);
}

/**
 * Calculate total energy requirement for the farm
 * Based on livestock, crops, and infrastructure
 * @param {number} numCows - Number of dairy cows
 * @param {number} numPigs - Number of pigs
 * @param {number} numChickens - Number of chickens
 * @param {object} cropAreas - Object with crop names as keys and hectares as values
 * @returns {number} Total energy requirement in kWh per year
 */
export function getEnergyRequirement(numCows = 0, numPigs = 0, numChickens = 0, cropAreas = {}) {
  // Base energy consumption per animal per year (kWh)
  const cowEnergyPerYear = 500; // kWh per cow per year (milking, cooling, etc.)
  const pigEnergyPerYear = 50; // kWh per pig per year
  const chickenEnergyPerYear = 2; // kWh per chicken per year

  // Energy for crop processing per hectare per year (kWh)
  // Accounting for seasonal rotation: 9 months active per year
  const cropEnergyPerHa = 600; // kWh per hectare per year (average)
  const totalCropArea = Object.values(cropAreas).reduce((sum, area) => sum + (area || 0), 0);
  const activeCropMonths = 9; // 3 seasons × 3 active months
  const cropEnergy = totalCropArea * cropEnergyPerHa * (activeCropMonths / 12);

  // Base farm infrastructure energy (lighting, equipment, etc.)
  const baseInfrastructureEnergy = 2000; // kWh per year

  // Calculate total requirement
  const livestockEnergy = (numCows * cowEnergyPerYear) + (numPigs * pigEnergyPerYear) + (numChickens * chickenEnergyPerYear);

  const totalEnergyRequired = livestockEnergy + cropEnergy + baseInfrastructureEnergy;
  return Math.round(totalEnergyRequired);
}
