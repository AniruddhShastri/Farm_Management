import farmData from '../../farmData.json';
import biomassProxy from '../data/biomassProxy.json';

/* ─────────────────────────────────────────────────────────
   DIGESTER VOLUME & CAPACITY (120 m³ max)
───────────────────────────────────────────────────────── */

/**
 * Annual biogas volume in m³ from livestock (uncapped)
 */
export function getBiogasAnnualM3(numCows = 0, numPigs = 0, numChickens = 0) {
  const { livestock } = farmData;
  const cowBiogas = numCows * livestock.dairy_cow.daily_manure_kg * livestock.dairy_cow.biogas_yield_m3_per_kg;
  const pigBiogas = numPigs * livestock.pig.daily_manure_kg * livestock.pig.biogas_yield_m3_per_kg;
  const chickenBiogas = numChickens * livestock.chicken.daily_manure_kg * livestock.chicken.biogas_yield_m3_per_kg;
  return (cowBiogas + pigBiogas + chickenBiogas) * 365;
}

/**
 * Required digester volume before applying the 120 m³ cap.
 * Slurry model (Book1.xlsx): manure diluted 1:1 with water at slurry
 * density 1 t/m³, held for a Hydraulic Retention Time of 50 days.
 */
export function getRawDigesterVolume(numCows = 0, numPigs = 0, numChickens = 0) {
  const { livestock } = farmData;
  const dailyManureKg =
    numCows * livestock.dairy_cow.daily_manure_kg +
    numPigs * livestock.pig.daily_manure_kg +
    numChickens * livestock.chicken.daily_manure_kg;
  const dailySlurryM3 = (dailyManureKg / 1000) * 2; // 1:1 dilution, 1 t/m³
  const HRT = 50; // days
  return Math.round(dailySlurryM3 * HRT * 100) / 100;
}

/**
 * Fraction of the farm's manure the 120 m³ digester can actually process.
 */
export function getManureHandledFraction(numCows = 0, numPigs = 0, numChickens = 0) {
  const rawVolume = getRawDigesterVolume(numCows, numPigs, numChickens);
  if (rawVolume <= 0) return 0;
  return Math.min(1, 120 / rawVolume);
}

/**
 * Actual digester volume — capped at 120 m³ maximum.
 */
export function getDigesterVolume(numCows = 0, numPigs = 0, numChickens = 0) {
  return Math.min(getRawDigesterVolume(numCows, numPigs, numChickens), 120);
}

/**
 * Net effective digester volume: 90% of total (10% headspace reserved for gas).
 */
export function getEffectiveDigesterVolume(numCows = 0, numPigs = 0, numChickens = 0) {
  return Math.round(getDigesterVolume(numCows, numPigs, numChickens) * 0.9 * 100) / 100;
}

/**
 * Biogas the 120 m³ digester can actually produce per year.
 * Only the manure fraction that fits the digester (slurry × 50-day HRT)
 * is digested — this caps BOTH energy and digestate output (Book1.xlsx).
 */
export function getCappedBiogasAnnualM3(numCows = 0, numPigs = 0, numChickens = 0) {
  const rawM3 = getBiogasAnnualM3(numCows, numPigs, numChickens);
  const fraction = getManureHandledFraction(numCows, numPigs, numChickens);
  return Math.round(rawM3 * fraction);
}

/* ─────────────────────────────────────────────────────────
   PARASITIC LOAD
───────────────────────────────────────────────────────── */

/**
 * Fraction of biogas energy deducted for tank heating when ambient < 5°C.
 */
export function getParasiticLoadFraction(winterTempC) {
  const { parasitic_load } = farmData;
  if (winterTempC >= parasitic_load.ambient_temp_threshold_c) return 0;
  const range = parasitic_load.fraction_deduct_max - parasitic_load.fraction_deduct_min;
  const coldness = Math.min(parasitic_load.ambient_temp_threshold_c - winterTempC, 15);
  const fraction = parasitic_load.fraction_deduct_min + (range * coldness) / 15;
  return Math.min(fraction, parasitic_load.fraction_deduct_max);
}

/* ─────────────────────────────────────────────────────────
   BIOGAS ENERGY & CHP SPLIT
   30% direct use | 70% to Micro-CHP generator
───────────────────────────────────────────────────────── */

export function getBiogasEnergyRaw(numCows = 0, numPigs = 0, numChickens = 0) {
  const { energy } = farmData;
  // Only biogas from manure the 120 m³ digester can process counts toward
  // energy — production beyond digester capacity is never digested.
  const annualBiogasM3 = getCappedBiogasAnnualM3(numCows, numPigs, numChickens);
  const annualEnergyKwh = annualBiogasM3 * energy.biogas_energy_density_kwh_per_m3 * energy.generator_efficiency;
  return Math.round(annualEnergyKwh * 100) / 100;
}

export function getBiogasEnergy(numCows = 0, numPigs = 0, numChickens = 0, winterTempC = null) {
  const raw = getBiogasEnergyRaw(numCows, numPigs, numChickens);
  if (winterTempC === null || winterTempC === undefined) return raw;
  const fraction = getParasiticLoadFraction(winterTempC);
  return Math.round(raw * (1 - fraction) * 100) / 100;
}

/**
 * Split biogas net energy into direct use (30%) and Micro-CHP (70%).
 */
export function getBiogasCHPSplit(numCows = 0, numPigs = 0, numChickens = 0, winterTempC = null) {
  const net = getBiogasEnergy(numCows, numPigs, numChickens, winterTempC);
  return {
    directUseKwh: Math.round(net * 0.30),
    chpKwh: Math.round(net * 0.70),
    totalKwh: Math.round(net),
  };
}

/* ─────────────────────────────────────────────────────────
   SOLAR ENERGY
───────────────────────────────────────────────────────── */

/* Panel efficiency 21% (Trina Vertex S 400 W); 4.875 m² per kWp installed */
export const SOLAR_PANEL_EFFICIENCY = 0.21;
export const SOLAR_KWP_PER_M2 = 1 / 4.875; // ≈ 0.205 kWp/m²

export function getSolarEnergy(solarArea = 0, solarIrradiance = 3.5) {
  return Math.round(solarArea * solarIrradiance * SOLAR_PANEL_EFFICIENCY * 365 * 100) / 100;
}

export function getSolarPeakKwp(solarArea = 0) {
  return Math.round(solarArea * SOLAR_KWP_PER_M2 * 100) / 100;
}

export function getSolarEnergyClipped(solarArea = 0, solarIrradiance = 3.5, inverterCapacityKW = 0) {
  const rawAnnualKwh = getSolarEnergy(solarArea, solarIrradiance);
  if (!inverterCapacityKW || inverterCapacityKW <= 0) return rawAnnualKwh;
  const peakKW = getSolarPeakKwp(solarArea);
  if (peakKW <= inverterCapacityKW) return rawAnnualKwh;
  const maxFromInverter = inverterCapacityKW * 8760 * 0.17;
  return Math.round(Math.min(rawAnnualKwh, maxFromInverter) * 100) / 100;
}

export function getTotalEnergy(numCows = 0, numPigs = 0, numChickens = 0, solarArea = 0, solarIrradiance = 3.5, winterTempC = null, inverterCapacityKW = 0) {
  const biogasEnergy = getBiogasEnergy(numCows, numPigs, numChickens, winterTempC);
  const solarEnergy = inverterCapacityKW > 0
    ? getSolarEnergyClipped(solarArea, solarIrradiance, inverterCapacityKW)
    : getSolarEnergy(solarArea, solarIrradiance);
  return biogasEnergy + solarEnergy;
}

/* ─────────────────────────────────────────────────────────
   BESS — Battery Energy Storage System
   PV to BESS ratio: 1 kWp solar : 3 kWh battery
───────────────────────────────────────────────────────── */

/**
 * BESS capacity in kWh based on PV:BESS = 1:3 ratio.
 * @param {number} solarAreaM2 - Solar panel area in m²
 * @returns {number} BESS capacity in kWh
 */
export function getBESSCapacity(solarAreaM2 = 0) {
  const solarKwp = solarAreaM2 * SOLAR_KWP_PER_M2; // 4.875 m² per kWp
  return Math.round(solarKwp * 3);                 // 1:3 ratio
}

/* ─────────────────────────────────────────────────────────
   DIGESTATE (FERTILIZER) — capped by digester volume
───────────────────────────────────────────────────────── */

export function getDigestateLiters(annualBiogasM3) {
  const { digestate } = farmData;
  return Math.round(annualBiogasM3 * digestate.liters_per_m3_biogas);
}

export function getDigestateSavingsEur(annualBiogasM3) {
  const liters = getDigestateLiters(annualBiogasM3);
  const { digestate } = farmData;
  return Math.round(liters * digestate.fertilizer_value_eur_per_liter * 100) / 100;
}

/* ─────────────────────────────────────────────────────────
   RECIPE CHECK (C:N balance)
───────────────────────────────────────────────────────── */

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

  if (acidic) return { ok: false, warning: 'Feedstock too acidic. Add manure or straw to balance.', cNRatio: Math.round(weightedCN * 10) / 10, recommendation: recipe.recommendation };
  if (cnOutOfRange) return { ok: false, warning: `C:N ratio (${weightedCN.toFixed(1)}) outside ideal 20–30. Add manure or straw.`, cNRatio: Math.round(weightedCN * 10) / 10, recommendation: recipe.recommendation };
  return { ok: true, warning: null, cNRatio: Math.round(weightedCN * 10) / 10 };
}

/* ─────────────────────────────────────────────────────────
   METHANE BASELINE
───────────────────────────────────────────────────────── */

export function getMethaneSavingsCo2e(annualBiogasM3, manureManagement = 'open_lagoon') {
  const baseline = farmData.methane_baseline;
  const kgPerM3 = manureManagement === 'open_lagoon'
    ? baseline.open_lagoon_kg_co2e_per_m3_biogas_avoided
    : baseline.spread_field_kg_co2e_per_m3_biogas_avoided;
  return Math.round((annualBiogasM3 * kgPerM3 / 1000) * 100) / 100;
}

/* ─────────────────────────────────────────────────────────
   REVENUE STACK
───────────────────────────────────────────────────────── */

export function getRevenueStack({
  totalGeneratedKwh = 0,
  totalRequiredKwh = 0,
  gridExportLimitKW = 0,
  electricityPriceEurPerKwh = 0.25,
  exportPriceEurPerKwh = 0.07,
  carbonCreditEurPerKwh = 0.0175
}) {
  const selfConsumed = Math.min(totalGeneratedKwh, totalRequiredKwh);
  const avoidedCostEur = selfConsumed * electricityPriceEurPerKwh;
  const potentialExportKwh = Math.max(0, totalGeneratedKwh - totalRequiredKwh);
  const maxExportKwhPerYear = gridExportLimitKW > 0 ? gridExportLimitKW * 8760 * 0.15 : 0;
  const exportKwh = Math.min(potentialExportKwh, maxExportKwhPerYear);
  const exportRevenueEur = exportKwh * exportPriceEurPerKwh;
  const carbonCreditsEur = totalGeneratedKwh * carbonCreditEurPerKwh;
  return {
    avoidedCostEur: Math.round(avoidedCostEur * 100) / 100,
    exportRevenueEur: Math.round(exportRevenueEur * 100) / 100,
    carbonCreditsEur: Math.round(carbonCreditsEur * 100) / 100,
    totalEur: Math.round((avoidedCostEur + exportRevenueEur + carbonCreditsEur) * 100) / 100,
    exportKwh,
    selfConsumedKwh: selfConsumed
  };
}

/* ─────────────────────────────────────────────────────────
   WATER
───────────────────────────────────────────────────────── */

export function getWaterHarvest(roofArea = 0, rainfall = 0) {
  const { water } = farmData;
  return Math.round(roofArea * rainfall * water.roof_runoff_coefficient);
}

export function getWaterRequirement(numCows = 0, numPigs = 0, numChickens = 0, cropAreas = {}) {
  const livestockWater = (numCows * 100 + numPigs * 15 + numChickens * 0.3) * 365;
  const totalCropArea = Object.values(cropAreas).reduce((s, v) => s + (v || 0), 0);
  const cropWater = totalCropArea * 5000000 * (9 / 12);
  return Math.round(livestockWater + cropWater);
}

/* ─────────────────────────────────────────────────────────
   IRRIGATION ENERGY
   Energy required to pump irrigation water to crops.
───────────────────────────────────────────────────────── */

/**
 * Electricity consumed for irrigation based on crop type and area.
 * @param {object} cropAreas - { cropName: hectares }
 * @returns {number} Irrigation energy in kWh/year
 */
export function getIrrigationEnergy(cropAreas = {}) {
  // Book1.xlsx reference values (electric sprinkler, groundwater):
  // rice 1850, corn 2200, potatoes 1300, wheat 1200, rapeseed 1000 kWh/ha·yr.
  // Crops not referenced in the sheet use comparable EU estimates.
  const irrigationKwhPerHa = {
    wheat: 1200,
    barley: 1100,
    corn: 2200,
    sunflower: 600,
    olives: 700,
    rapeseed: 1000,
    potatoes: 1300,
    rice: 1850,
    other: 1200,
  };
  let total = 0;
  Object.entries(cropAreas).forEach(([crop, ha]) => {
    total += (ha || 0) * (irrigationKwhPerHa[crop] || irrigationKwhPerHa.other);
  });
  return Math.round(total);
}

/* ─────────────────────────────────────────────────────────
   CARBON IMPACT
   Bio-char sequestration removed per system spec.
   Only grid CO₂ avoidance is credited.
───────────────────────────────────────────────────────── */

/**
 * Bio-char sequestration removed from calculations per system spec.
 * Returns 0. Function retained for interface compatibility.
 */
export function getCarbonImpact(_cropAreas = {}) {
  return 0;
}

export function getCO2Avoided(energyKwh = 0) {
  const { energy } = farmData;
  return Math.round((energyKwh * energy.grid_co2_intensity_kg_per_kwh / 1000) * 100) / 100;
}

export function getTotalCarbonImpact(_cropAreas = {}, energyKwh = 0) {
  return getCO2Avoided(energyKwh);
}

/* ─────────────────────────────────────────────────────────
   ENERGY REQUIREMENT (includes irrigation)
───────────────────────────────────────────────────────── */

/* Grain/produce yields (t/ha·yr) for crop-processing energy.
   Wheat 6, grain maize 7, rapeseed 3 from Book1.xlsx; others are EU-typical. */
const CROP_YIELD_T_PER_HA = {
  wheat: 6, barley: 5, corn: 7, oats: 4, rye: 4, rapeseed: 3,
  potatoes: 35, sugar_beet: 70, sunflower: 2.5, olives: 3, grapes: 8,
  tomatoes: 60, rice: 6, soy: 3, onions: 40, cotton: 1.5, grass: 7,
  other: 5,
};

/**
 * Crop processing energy: 45 kWh per tonne of production,
 * active 9 of 12 months (Book1.xlsx).
 */
export function getCropProcessingEnergy(cropAreas = {}) {
  let tonnes = 0;
  Object.entries(cropAreas).forEach(([crop, ha]) => {
    tonnes += (ha || 0) * (CROP_YIELD_T_PER_HA[crop] || CROP_YIELD_T_PER_HA.other);
  });
  return Math.round(tonnes * 45 * (9 / 12));
}

/**
 * Livestock energy demand per head per year (Book1.xlsx, 100 ha reference):
 * dairy cow 450 kWh, pig 70 kWh, chicken 5.2 kWh.
 */
export function getLivestockEnergy(numCows = 0, numPigs = 0, numChickens = 0) {
  return Math.round(numCows * 450 + numPigs * 70 + numChickens * 5.2);
}

/**
 * Fixed base load (office, security lighting, gate motors, workshop):
 * ~10% of the farm's other demand (Book1.xlsx).
 */
export function getBaseInfrastructureEnergy(numCows = 0, numPigs = 0, numChickens = 0, cropAreas = {}) {
  const others = getLivestockEnergy(numCows, numPigs, numChickens)
    + getCropProcessingEnergy(cropAreas)
    + getIrrigationEnergy(cropAreas);
  return Math.round(others * 0.10);
}

export function getEnergyRequirement(numCows = 0, numPigs = 0, numChickens = 0, cropAreas = {}) {
  const livestockEnergy = getLivestockEnergy(numCows, numPigs, numChickens);
  const cropProcessingEnergy = getCropProcessingEnergy(cropAreas);
  const irrigationEnergy = getIrrigationEnergy(cropAreas);
  const baseInfrastructure = getBaseInfrastructureEnergy(numCows, numPigs, numChickens, cropAreas);
  return Math.round(livestockEnergy + cropProcessingEnergy + irrigationEnergy + baseInfrastructure);
}

/* ─────────────────────────────────────────────────────────
   FINANCIAL SAVINGS
───────────────────────────────────────────────────────── */

export function getFinancials(energyKwh = 0, waterLiters = 0) {
  const { energy, water } = farmData;
  const energySavings = energyKwh * energy.electricity_cost_usd_per_kwh;
  const waterSavings = waterLiters * water.water_pumping_cost_usd_per_liter;
  return Math.round((energySavings + waterSavings) * 100) / 100;
}

/* ─────────────────────────────────────────────────────────
   INFRASTRUCTURE CAPEX
   Reference: 120 m³ tubular digester + 15 kW Micro-CHP = $40,000
   Solar: $800/kWp installed
   BESS: $350/kWh installed
───────────────────────────────────────────────────────── */

/* CAPEX reference (Book1.xlsx, bankable 100 ha system, EUR):
   digester + Micro-CHP €150,000 per 120 m³ · solar €840/kWp · BESS €80/kWh,
   plus ~30% for controls, balance-of-plant, install and contingency
   (validates to the sheet's €265,000 total for the reference farm). */
export function getInfrastructureCosts(solarArea = 0, numCows = 0, numPigs = 0, numChickens = 0) {
  const digesterVolume = getDigesterVolume(numCows, numPigs, numChickens);
  const digesterCost = Math.round((digesterVolume / 120) * 150000);

  const solarKwp = solarArea * SOLAR_KWP_PER_M2;
  const solarCost = Math.round(solarKwp * 840);

  const bessKwh = getBESSCapacity(solarArea);
  const bessCost = Math.round(bessKwh * 80);

  const equipmentSubtotal = digesterCost + solarCost + bessCost;
  const balanceOfPlant = Math.round(equipmentSubtotal * 0.30);

  return {
    digester: digesterCost,
    solar: solarCost,
    bess: bessCost,
    balanceOfPlant,
    total: equipmentSubtotal + balanceOfPlant,
  };
}

/* ─────────────────────────────────────────────────────────
   ENERGY INDEPENDENCE
───────────────────────────────────────────────────────── */

export function getEnergyIndependence(generatedEnergy = 0, totalEnergyNeeded = 10000) {
  if (totalEnergyNeeded === 0) return 0;
  return Math.min(Math.round((generatedEnergy / totalEnergyNeeded) * 10000) / 100, 100);
}
