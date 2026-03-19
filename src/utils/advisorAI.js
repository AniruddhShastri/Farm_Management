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
        description: 'Look up climate, solar irradiance, electricity price, grid CO₂ intensity, and available crops for a given European city or country. Use this whenever a farmer mentions their location.',
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

function findLocation(locationStr) {
  // Try exact match first
  if (locationData.locations[locationStr]) return [locationStr, locationData.locations[locationStr]];
  // Try partial / country match
  const lowerQuery = locationStr.toLowerCase();
  for (const [key, val] of Object.entries(locationData.locations)) {
    if (key.toLowerCase().includes(lowerQuery) || lowerQuery.includes(key.toLowerCase().split(',')[1]?.trim() || '')) {
      return [key, val];
    }
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

export function executeFunction(name, args) {
  switch (name) {

    case 'lookup_location': {
      const [foundKey, loc] = findLocation(args.location);
      if (!loc) {
        return { error: `Location "${args.location}" not found. Available locations: ${Object.keys(locationData.locations).join(', ')}` };
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
      const [, loc] = findLocation(args.location);
      if (!loc) return { error: 'Location not found' };

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
      const [, loc] = findLocation(args.location);
      if (!loc) return { error: 'Location not found' };

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
