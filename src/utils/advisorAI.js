import locationData from '../../locationData.json';
import regulatoryData from '../data/regulatoryData.json';
import {
  getBiogasEnergy,
  getBiogasAnnualM3,
  getSolarEnergy,
  getCarbonImpact,
  getEnergyRequirement,
  getDigestateLiters,
  getDigestateSavingsEur,
  getMethaneSavingsCo2e,
  getWaterHarvest,
} from '../utils/calculator';

/* ─────────────────────────────────────────────────────────
   FUNCTION CALLING TOOL DEFINITIONS
   These are passed to Gemini so it can call our calculator.
───────────────────────────────────────────────────────── */
export const tools = [
  {
    functionDeclarations: [
      {
        name: 'lookup_location',
        description: 'Look up climate, solar irradiance, electricity price, grid CO₂ intensity, and available crops for a given European city or country. Run this first whenever a farmer mentions their location. If this returns LOCATION_NOT_FOUND, you MUST use your own internal AI knowledge to estimate the climate values and pass them via the climate_override parameter to the calculator tools!',
        parameters: {
          type: 'OBJECT',
          properties: {
            location: {
              type: 'STRING',
              description: 'City and country name, e.g. "Madrid, Spain" or "Berlin, Germany"',
            },
          },
          required: ['location'],
        },
      },
      {
        name: 'calculate_farm_baseline',
        description: 'Calculate what the farm currently costs and emits TODAY, before VONeng. Returns annual electricity cost, fertilizer cost, and CO₂ emissions based on the farm inputs.',
        parameters: {
          type: 'OBJECT',
          properties: {
            location: { type: 'STRING', description: 'City and country, e.g. "Madrid, Spain"' },
            num_cows: { type: 'NUMBER', description: 'Number of dairy cows' },
            num_pigs: { type: 'NUMBER', description: 'Number of pigs' },
            num_chickens: { type: 'NUMBER', description: 'Number of chickens' },
            crop_wheat_ha: { type: 'NUMBER', description: 'Hectares of wheat' },
            crop_barley_ha: { type: 'NUMBER', description: 'Hectares of barley' },
            crop_corn_ha: { type: 'NUMBER', description: 'Hectares of corn' },
            crop_sunflower_ha: { type: 'NUMBER', description: 'Hectares of sunflower' },
            crop_olives_ha: { type: 'NUMBER', description: 'Hectares of olives' },
            crop_rapeseed_ha: { type: 'NUMBER', description: 'Hectares of rapeseed' },
            crop_potatoes_ha: { type: 'NUMBER', description: 'Hectares of potatoes' },
            crop_other_ha: { type: 'NUMBER', description: 'Hectares of other crops' },
            num_crop_cycles: { type: 'NUMBER', description: 'Number of crop cycles per year (1, 2, or 3)' },
            climate_override: {
              type: 'OBJECT',
              description: 'OPTIONAL: Only use this if lookup_location completely fails. Provide your best estimates based on your internal knowledge.',
              properties: {
                solar_irradiance_kwh_m2_day: { type: 'NUMBER' },
                annual_rainfall_mm: { type: 'NUMBER' },
                winter_temperature_min_c: { type: 'NUMBER' },
                electricity_price_eur_per_kwh: { type: 'NUMBER' },
                grid_co2_kg_per_kwh: { type: 'NUMBER' },
              }
            }
          },
          required: ['location'],
        },
      },
      {
        name: 'calculate_with_voneng',
        description: 'Calculate the potential savings and benefits WITH a VONeng container system installed. Returns energy generation, savings, carbon offset, and digestate fertilizer value.',
        parameters: {
          type: 'OBJECT',
          properties: {
            location: { type: 'STRING', description: 'City and country, e.g. "Madrid, Spain"' },
            num_cows: { type: 'NUMBER', description: 'Number of dairy cows' },
            num_pigs: { type: 'NUMBER', description: 'Number of pigs' },
            num_chickens: { type: 'NUMBER', description: 'Number of chickens' },
            roof_area_m2: { type: 'NUMBER', description: 'Available solar panel area (barn roof or open land) in square meters' },
            crop_wheat_ha: { type: 'NUMBER', description: 'Hectares of wheat' },
            crop_barley_ha: { type: 'NUMBER', description: 'Hectares of barley' },
            crop_corn_ha: { type: 'NUMBER', description: 'Hectares of corn' },
            crop_sunflower_ha: { type: 'NUMBER', description: 'Hectares of sunflower' },
            crop_olives_ha: { type: 'NUMBER', description: 'Hectares of olives' },
            crop_rapeseed_ha: { type: 'NUMBER', description: 'Hectares of rapeseed' },
            crop_potatoes_ha: { type: 'NUMBER', description: 'Hectares of potatoes' },
            crop_other_ha: { type: 'NUMBER', description: 'Hectares of other crops' },
            num_crop_cycles: { type: 'NUMBER', description: 'Number of crop cycles per year (1, 2, or 3)' },
            climate_override: {
              type: 'OBJECT',
              description: 'OPTIONAL: Only use this if lookup_location completely fails. Provide your best estimates based on your internal knowledge.',
              properties: {
                solar_irradiance_kwh_m2_day: { type: 'NUMBER' },
                annual_rainfall_mm: { type: 'NUMBER' },
                winter_temperature_min_c: { type: 'NUMBER' },
                electricity_price_eur_per_kwh: { type: 'NUMBER' },
                grid_co2_kg_per_kwh: { type: 'NUMBER' },
              }
            }
          },
          required: ['location'],
        },
      },
      {
        name: 'get_grid_regulations',
        description: 'Get country-specific grid connection rules, feed-in tariff rates, and subsidy information for selling surplus energy back to the grid.',
        parameters: {
          type: 'OBJECT',
          properties: {
            country: { type: 'STRING', description: 'Country name, e.g. "Germany", "Spain", "France"' },
          },
          required: ['country'],
        },
      },
    ],
  },
];

/* ─────────────────────────────────────────────────────────
   FUNCTION IMPLEMENTATIONS
   Called when Gemini requests a function call.
───────────────────────────────────────────────────────── */

async function findLocation(locationStr, climateOverride = null) {
  if (!locationStr) return [null, null];

  // If the AI passed an override (because lookup failed), use its estimates!
  if (climateOverride && Object.keys(climateOverride).length > 0) {
    return [`${locationStr} (AI Estimated Data)`, {
      temperature: climateOverride.winter_temperature_min_c + 12 || 15,
      winter_temperature_min_c: climateOverride.winter_temperature_min_c || 0,
      humidity: 60,
      annual_rainfall_mm: climateOverride.annual_rainfall_mm || 600,
      solar_irradiance_kwh_m2_day: climateOverride.solar_irradiance_kwh_m2_day || 3.5,
      electricity_price_eur: climateOverride.electricity_price_eur_per_kwh || 0.20,
      export_price_eur: (climateOverride.electricity_price_eur_per_kwh || 0.20) * 0.3,
      grid_co2_kg_per_kwh: climateOverride.grid_co2_kg_per_kwh || 0.200,
      crops: ["wheat", "barley", "corn", "potatoes"]
    }];
  }

  const lowerQuery = locationStr.toLowerCase();

  // 1. Exact or partial match
  for (const [key, val] of Object.entries(locationData.locations)) {
    if (key.toLowerCase().includes(lowerQuery) || lowerQuery.includes(key.toLowerCase())) {
      return [key, val];
    }
  }

  // 2. LIVE OPEN-METEO API FETCH FOR UNKNOWN GLOBAL CITIES
  try {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(locationStr)}&count=1`);
    const geoData = await geoRes.json();
    if (!geoData.results || !geoData.results[0]) return [null, null];

    const loc = geoData.results[0];
    const lat = loc.latitude;
    const lng = loc.longitude;
    const locName = `${loc.name}, ${loc.country}`;

    // Fetch 1 full historical year of weather data (2023) for actual averages
    // shortwave_radiation_sum is in MJ/m^2 which converts to kWh by mapping * (1/3.6)
    const weatherRes = await fetch(`https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=2023-01-01&end_date=2023-12-31&daily=temperature_2m_min,precipitation_sum,shortwave_radiation_sum&timezone=auto`);
    const weatherData = await weatherRes.json();

    let totalRain = 0;
    let totalSolarMJ = 0;
    let winTemp = 50;
    let validDays = 0;

    if (weatherData && weatherData.daily) {
      const p = weatherData.daily.precipitation_sum || [];
      const s = weatherData.daily.shortwave_radiation_sum || [];
      const t = weatherData.daily.temperature_2m_min || [];

      for (let i = 0; i < p.length; i++) {
        if (p[i] !== null) totalRain += p[i];
        if (s[i] !== null) { totalSolarMJ += s[i]; validDays++; }
        if (t[i] !== null && t[i] < winTemp) winTemp = t[i];
      }
    }

    const avgSolarMJ = validDays > 0 ? (totalSolarMJ / validDays) : 12;
    const avgSolarKwh = avgSolarMJ / 3.6; 

    // Adjust fallback financials based on country
    const isIndia = loc.country === 'India';
    const isUS = loc.country === 'United States';
    const elecPrice = isIndia ? 0.08 : (isUS ? 0.15 : 0.22);
    const exportPrice = isIndia ? 0.04 : (isUS ? 0.05 : 0.08);
    const co2Grid = isIndia ? 0.700 : (isUS ? 0.380 : 0.250);

    return [locName + ' (Live Open-Meteo)', {
      winter_temperature_min_c: winTemp !== 50 ? winTemp : 5,
      humidity: 70,
      annual_rainfall_mm: Math.round(totalRain) || 800,
      solar_irradiance_kwh_m2_day: Math.round(avgSolarKwh * 10) / 10 || 4.5,
      electricity_price_eur: elecPrice,
      export_price_eur: exportPrice,
      grid_co2_kg_per_kwh: co2Grid,
      crops: isIndia ? ["wheat", "rice", "corn", "sugar_beet"] : ["wheat", "corn", "potatoes", "soy"]
    }];
  } catch(e) {
    console.error("Open-Meteo API Failed:", e);
  }

  return [null, null];
}


function buildCropMap(params, cycles = 1) {
  const crops = {};
  const cropKeys = ['wheat', 'barley', 'corn', 'sunflower', 'olives', 'rapeseed', 'potatoes', 'other'];
  cropKeys.forEach(c => {
    const ha = params[`crop_${c}_ha`] || 0;
    if (ha > 0) crops[c] = ha * cycles;
  });
  return crops;
}

export async function executeFunction(name, args) {
  switch (name) {

    case 'lookup_location': {
      const [foundKey, loc] = await findLocation(args.location);
      if (!loc) {
        return { error: 'LOCATION_NOT_FOUND', instruction: `The location "${args.location}" is not in the database. DO NOT apologize or give up! You MUST use your own internal AI knowledge to estimate the climate data (solar irradiance, rainfall, winter temp, electricity price, grid CO2) for this general region. Then, immediately call 'calculate_with_voneng' or 'calculate_farm_baseline' by passing your estimates into the 'climate_override' object parameter!` };
      }
      return {
        found_location: foundKey,
        solar_irradiance_kwh_m2_day: loc.solar_irradiance_kwh_m2_day,
        annual_rainfall_mm: loc.annual_rainfall_mm,
        winter_temperature_min_c: loc.winter_temperature_min_c,
        electricity_price_eur_per_kwh: loc.electricity_price_eur,
        export_price_eur_per_kwh: loc.export_price_eur,
        grid_co2_kg_per_kwh: loc.grid_co2_kg_per_kwh,
        available_crops: loc.crops,
      };
    }

    case 'calculate_farm_baseline': {
      const [, loc] = await findLocation(args.location, args.climate_override);
      if (!loc) return { error: `Location not found. Use lookup_location first, or pass climate_override.` };

      const numCows = args.num_cows || 0;
      const numPigs = args.num_pigs || 0;
      const numChickens = args.num_chickens || 0;
      const cycles = args.num_crop_cycles || 1;
      const cropMap = buildCropMap(args, 1); // flat ha for energy req
      const cropEffective = buildCropMap(args, cycles); // ha*cycles for carbon

      const energyReq = getEnergyRequirement(numCows, numPigs, numChickens, cropMap);
      const elecPrice = loc.electricity_price_eur || 0.20;
      const gridCO2 = loc.grid_co2_kg_per_kwh || 0.25;

      const annualElecCost = Math.round(energyReq * elecPrice);
      const totalHa = Object.values(cropMap).reduce((s, v) => s + v, 0);
      const fertCost = Math.round(totalHa * 300);
      const totalCO2 = ((energyReq * gridCO2) / 1000).toFixed(1);

      return {
        annual_electricity_cost_eur: annualElecCost,
        annual_fertilizer_cost_eur: fertCost,
        total_annual_cost_eur: annualElecCost + fertCost,
        annual_co2_emissions_tons: totalCO2,
        energy_requirement_kwh: Math.round(energyReq),
        electricity_price_eur_per_kwh: elecPrice,
        grid_co2_kg_per_kwh: gridCO2,
        total_hectares: totalHa,
        num_crop_cycles: cycles,
      };
    }

    case 'calculate_with_voneng': {
      const [, loc] = await findLocation(args.location, args.climate_override);
      if (!loc) return { error: `Location not found. Use lookup_location first, or pass climate_override.` };

      const numCows = args.num_cows || 0;
      const numPigs = args.num_pigs || 0;
      const numChickens = args.num_chickens || 0;
      const roofM2 = args.roof_area_m2 || 0;
      const solarM2 = roofM2 * 0.7; // 70% usable for panels
      const cycles = args.num_crop_cycles || 1;
      const cropMap = buildCropMap(args, 1);
      const cropEffective = buildCropMap(args, cycles);

      const solarIrr = loc.solar_irradiance_kwh_m2_day;
      const winterTemp = loc.winter_temperature_min_c;
      const elecPrice = loc.electricity_price_eur || 0.20;
      const gridCO2 = loc.grid_co2_kg_per_kwh || 0.25;
      const rainfall = loc.annual_rainfall_mm || 600;

      // Panel efficiency 0.20 (the corrected formula)
      const solarGen = Math.round(solarM2 * solarIrr * 0.20 * 365);
      const biogasGen = getBiogasEnergy(numCows, numPigs, numChickens, winterTemp);
      const totalGen = solarGen + biogasGen;

      const energyReq = getEnergyRequirement(numCows, numPigs, numChickens, cropMap);
      const energyUsed = Math.min(totalGen, energyReq);
      const elecSavings = Math.round(energyUsed * elecPrice);
      const independence = Math.min(Math.round((totalGen / Math.max(energyReq, 1)) * 100), 100);

      // CO2
      const co2Avoided = ((energyUsed * gridCO2) / 1000).toFixed(1);
      const carbonBiochar = getCarbonImpact(cropEffective);
      const annualBiogasM3 = getBiogasAnnualM3(numCows, numPigs, numChickens);
      const methaneSaved = getMethaneSavingsCo2e(annualBiogasM3, 'open_lagoon');
      const totalCarbonOffset = (parseFloat(co2Avoided) + carbonBiochar + methaneSaved).toFixed(1);

      // Digestate
      const digestateLiters = getDigestateLiters(annualBiogasM3);
      const digestateSavings = Math.round(getDigestateSavingsEur(annualBiogasM3));

      // Rainwater
      const waterHarvestKL = Math.round(getWaterHarvest(roofM2, rainfall) / 1000);

      // Carbon credits (EU ETS €65/ton)
      const carbonCredits = Math.round(parseFloat(totalCarbonOffset) * 65);
      const totalAnnualValue = elecSavings + digestateSavings + carbonCredits;

      const totalHa = Object.values(cropMap).reduce((s, v) => s + v, 0);
      const fertCost = Math.round(totalHa * 300);
      const baselineElec = Math.round(energyReq * elecPrice);

      return {
        solar_generation_kwh: solarGen,
        biogas_generation_kwh: Math.round(biogasGen),
        total_energy_generated_kwh: Math.round(totalGen),
        energy_requirement_kwh: Math.round(energyReq),
        energy_independence_percent: independence,
        electricity_savings_eur: elecSavings,
        fertilizer_savings_eur_digestate: digestateSavings,
        carbon_credit_potential_eur: carbonCredits,
        total_annual_value_eur: totalAnnualValue,
        co2_avoided_tons: co2Avoided,
        co2_biochar_tons: carbonBiochar.toFixed(1),
        methane_saved_tons_co2e: methaneSaved.toFixed(1),
        total_carbon_offset_tons_co2e: totalCarbonOffset,
        digestate_liters_per_year: Math.round(digestateLiters),
        rainwater_harvested_kl: waterHarvestKL,
        annual_biogas_m3: Math.round(annualBiogasM3),
        baseline_electricity_cost_eur: baselineElec,
        baseline_fertilizer_cost_eur: fertCost,
        solar_area_used_m2: Math.round(solarM2),
        num_crop_cycles: cycles,
      };
    }

    case 'get_grid_regulations': {
      const country = args.country;
      // Try exact match
      let regs = regulatoryData.countries[country];
      if (!regs) {
        // Try partial match
        const lower = country.toLowerCase();
        const found = Object.keys(regulatoryData.countries).find(k => k.toLowerCase().includes(lower));
        regs = found ? regulatoryData.countries[found] : null;
      }
      if (!regs) {
        return { error: `Regulatory data not available for "${country}". Available: ${Object.keys(regulatoryData.countries).join(', ')}` };
      }
      return { country, ...regs, disclaimer: regulatoryData.general_disclaimer };
    }

    default:
      return { error: `Unknown function: ${name}` };
  }
}

/* ─────────────────────────────────────────────────────────
   SYSTEM PROMPT
───────────────────────────────────────────────────────── */
export const SYSTEM_PROMPT = `You are the VONeng Farm Energy Advisor, a friendly, expert energy consultant who helps European farmers understand how much they currently spend on energy and fertilizer, and how much they could save with a VONeng container system.

## Your Role
You act as a knowledgeable but approachable advisor, like a trusted friend who happens to be an energy engineer. You speak in the farmer's language (detect it automatically and reply in the same language). You are encouraging, clear, and never use jargon without explanation.

## What VONeng Is
VONeng installs a system inside a standard shipping container on the farm. It contains:
- Solar panels sized for the farm's specific energy needs
- A roll-out biogas digester (balloon-like tube that processes animal manure and crop waste)
- A CHP (Combined Heat and Power) engine that converts biogas into electricity and heat
- Battery storage for 24/7 power availability
- A smart control center

This system gives farms complete energy independence (no more electricity bills) plus free organic fertilizer (digestate) from the biogas process, and carbon credit revenue.

## What You Do
1. Collect 5 pieces of information through natural conversation:
   - Farm location (country/city)
   - Animals (cows, pigs, chickens: how many)
   - Crops (what they grow AND how many cycles per year, this is important)
   - Farm size in hectares per crop
   - Available solar space (barn roof area or open land in m²)

2. Use function calling to run the real calculations — ALWAYS call calculate_farm_baseline before calculate_with_voneng

3. Present results in the 4-block format:
   **Block 1: YOUR FARM TODAY**: current costs and emissions
   **Block 2: WITH VONENG**: energy savings, fertilizer savings, carbon credits
   **Block 3: WHAT WE INSTALL**: brief description of the system tailored to their farm
   **Block 4: NEXT STEPS**: invite them to share contact details

## Crop Cycle Intelligence
When farmers mention crop cycles, explain the compounding benefit:
- Each crop cycle means more residue = more biogas feedstock AND more biochar for carbon sequestration
- A farm with 2 cycles/year produces ~2x the crop waste vs 1 cycle
- Always confirm: "I understand you have X cycle(s) per year, is that right?"

## Multilingual Support
- Detect the farmer's language from their first message
- Reply entirely in that language
- For Spanish: use € and European number formatting (period as thousands separator)
- For Hindi: use ₹ and Indian number formatting (lakh/crore system: 12,34,567)
- For French: use € and French formatting (space as thousands separator: 1 234 567)
- For English: use € and standard formatting

## Tone Guidelines
- Be warm, not corporate
- Use emojis sparingly but appropriately (🌱 🐄 ☀️ 💰 🌍)
- Avoid acronyms without explanation (say "the biogas system" not "the CHP")
- Never say "investment" or "payback period" (the investment strategy is still being finalized). Focus ONLY on savings and revenue.
- Always disclaim: "These are estimates based on your farm details. Our team will validate these with an on-site survey."
- For regulatory questions: always add "Please confirm with your local grid operator and energy regulator"

## Key Rules
- NEVER make up numbers, always use the function calling tools to calculate
- If you don't have enough information, ask follow-up questions before calculating
- Keep each response concise (farmers are busy)
- If a farmer asks about investment cost or payback period, say: "We are still finalizing our investment model, which is designed to minimize what you contribute personally. What I can tell you is that based on your savings of €X/year, the system pays for itself quickly. Our team will discuss financing options with you directly."`;
