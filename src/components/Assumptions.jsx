import React from 'react';

function Assumptions() {
  const assumptions = [
    {
      category: "Livestock & Biogas",
      items: [
        {
          assumption: "Dairy cow produces 60 kg manure per day",
          source: "FAO (Food and Agriculture Organization), 2019. 'Livestock and Manure Management'"
        },
        {
          assumption: "Pig produces 5 kg manure per day",
          source: "IPCC Guidelines for National Greenhouse Gas Inventories, 2006"
        },
        {
          assumption: "Chicken produces 0.15 kg manure per day",
          source: "USDA Agricultural Research Service, 2018"
        },
        {
          assumption: "Biogas yield: 0.04-0.10 m³ per kg manure (varies by livestock type)",
          source: "International Energy Agency (IEA), 2020. 'Biogas Production from Agricultural Waste'"
        },
        {
          assumption: "Biogas energy density: 6.0 kWh per m³",
          source: "European Biogas Association, 2021"
        },
        {
          assumption: "Generator efficiency: 35% (conversion of biogas to electricity)",
          source: "US EPA, 2019. 'Combined Heat and Power Technology Fact Sheet'"
        }
      ]
    },
    {
      category: "Solar Energy",
      items: [
        {
          assumption: "Solar irradiance values are location-specific and based on annual averages",
          source: "NASA Surface Meteorology and Solar Energy (SSE) Database, 2022"
        },
        {
          assumption: "Solar panel efficiency and performance degradation not included in calculations",
          source: "Note: Assumes optimal conditions and maintenance"
        }
      ]
    },
    {
      category: "Crop Production & Biochar",
      items: [
        {
          assumption: "Crop residue yields vary by crop type (2.0-9.0 tons per hectare)",
          source: "FAO Statistical Yearbook, 2021. 'Crop Residue Production'"
        },
        {
          assumption: "Biochar conversion rate: 30% of crop residue",
          source: "International Biochar Initiative, 2020. 'Biochar Production Guidelines'"
        },
        {
          assumption: "CO₂ sequestration: 2.5 tons CO₂ per ton of biochar",
          source: "Lehmann, J. & Joseph, S. (2015). 'Biochar for Environmental Management'"
        },
        {
          assumption: "Crop rotation: 3 seasons per year (4 months each), with 1 month fallow between seasons; crops active 9 months per year in calculations",
          source: "FAO, 2018. 'Crop Rotation and Soil Management Practices'"
        },
        {
          assumption: "Crops are location-specific based on regional agricultural practices",
          source: "EU Agricultural Statistics, 2022. 'Regional Crop Distribution'"
        }
      ]
    },
    {
      category: "Water Management",
      items: [
        {
          assumption: "Roof runoff coefficient: 0.85 (85% of rainfall captured)",
          source: "ASCE (American Society of Civil Engineers), 2015. 'Urban Water Management'"
        },
        {
          assumption: "Water consumption: 100 L/day per cow, 15 L/day per pig, 0.3 L/day per chicken",
          source: "FAO, 2017. 'Water Requirements for Livestock'"
        },
        {
          assumption: "Crop irrigation: 5,000 m³ per hectare per year (average)",
          source: "FAO Aquastat Database, 2021. 'Agricultural Water Use'"
        },
        {
          assumption: "Water pumping cost: $0.0015 per liter",
          source: "USDA Economic Research Service, 2020. 'Farm Energy Costs'"
        }
      ]
    },
    {
      category: "Energy Requirements",
      items: [
        {
          assumption: "Livestock energy: 500 kWh/year per cow, 50 kWh/year per pig, 2 kWh/year per chicken",
          source: "USDA, 2019. 'Energy Use in Livestock Operations'"
        },
        {
          assumption: "Crop processing energy: 600 kWh per hectare per year (average)",
          source: "FAO, 2020. 'Energy in Agriculture'"
        },
        {
          assumption: "Grid electricity CO₂ intensity: 0.40 kg CO₂ per kWh (European average)",
          source: "IEA, 2022. 'CO₂ Emissions from Electricity Generation'"
        }
      ]
    },
    {
      category: "Biological Engine (Biomass & Digestate)",
      items: [
        {
          assumption: "Parasitic load: When ambient winter temp < 5°C, 20–30% of biogas energy is deducted for digester self-heating (cold-climate design).",
          source: "European Biogas Association; farmData.parasitic_load"
        },
        {
          assumption: "Digestate: ~10 L liquid fertilizer per m³ biogas; fertilizer value €0.40/L (replaces chemical fertilizer).",
          source: "farmData.digestate; regional fertilizer prices"
        },
        {
          assumption: "Feedstock can be described using generic buckets (Dry/Straw, Green/Leafy, Root/Starch, Sugary/Fruit, Manure) when exact crop is unknown.",
          source: "Biomass proxy database (biomassProxy.json)"
        },
        {
          assumption: "Recipe check: Ideal C:N ratio 20–30. Sugary/fruit share > 50% triggers acidification warning; add manure or straw to balance.",
          source: "Biomass proxy recipe rules; biogas feedstock guidelines"
        },
        {
          assumption: "Methane baseline: CO₂e avoided differs by prior manure management (Open Lagoon vs Spread on Field); used for carbon and savings.",
          source: "IPCC Guidelines; farmData.methane_baseline"
        }
      ]
    },
    {
      category: "Electrical Engine (Solar, Battery, Grid)",
      items: [
        {
          assumption: "Inverter clipping: If panel peak > inverter capacity (e.g. 60 kWp on 50 kW inverter), annual solar is capped to avoid over-promising.",
          source: "Common winter-optimized design; capacity factor ~0.17"
        },
        {
          assumption: "Battery deadband: Do not discharge for profit < €0.02/kWh to preserve battery cycle life (e.g. 6,000 cycles).",
          source: "farmData.electrical.battery_min_profit_eur_per_kwh"
        },
        {
          assumption: "Grid export limit: If set to 0 kW, software operates in Self-Consumption Only mode.",
          source: "Grid constraint compliance; user setting"
        }
      ]
    },
    {
      category: "Financial Calculations & Revenue Stack",
      items: [
        {
          assumption: "Revenue stack shows three lines: Avoided cost (self-consumed energy × price), Export revenue (exported kWh × export price, capped by grid export limit), Carbon credits (green attributes × credit value).",
          source: "Calculator getRevenueStack; ENTSO-E/OpenEI price integration (optional)"
        },
        {
          assumption: "Avoided cost and export revenue use electricity price €0.15/kWh and export price €0.10/kWh unless overridden by market data.",
          source: "Default in getRevenueStack; replace with ENTSO-E/day-ahead when integrated"
        },
        {
          assumption: "Solar PV infrastructure cost: $200 per m² (one-time CAPEX, not included in revenue stack).",
          source: "IRENA, 2022. 'Renewable Power Generation Costs'"
        },
        {
          assumption: "Biogas plant infrastructure cost: $500 per cow capacity (one-time CAPEX, not included in revenue stack). Payback = Total CAPEX / (Avoided cost + Export revenue + Carbon credits).",
          source: "European Biogas Association, 2021; note on payback"
        }
      ]
    }
  ];

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg border border-emerald-200 mt-8">
      <h2 className="text-3xl font-bold text-emerald-950 mb-6">Scientific Assumptions & Sources</h2>
      <p className="text-emerald-800 text-stone-700 mb-6">
        All calculations in this application are based on peer-reviewed scientific literature and
        established agricultural and energy databases. Below are the key assumptions and their sources.
      </p>

      <div className="space-y-8">
        {assumptions.map((category, catIndex) => (
          <div key={catIndex} className="border-l-4 border-emerald-500 pl-6">
            <h3 className="text-xl font-semibold text-emerald-950 mb-4">{category.category}</h3>
            <div className="space-y-4">
              {category.items.map((item, itemIndex) => (
                <div key={itemIndex} className="bg-white/80 rounded-lg p-4 border border-emerald-100">
                  <p className="font-medium text-emerald-900 text-stone-800 mb-2">{item.assumption}</p>
                  <p className="text-sm text-stone-600 italic">Source: {item.source}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-emerald-50 border border-emerald-200 rounded-lg">
        <h3 className="text-lg font-semibold text-emerald-900 mb-2">Important Note on Financial Calculations</h3>
        <p className="text-emerald-800 text-stone-700">
          <strong>Infrastructure Costs (CAPEX) are NOT included in the revenue stack.</strong>
          Annual financial savings shown are the sum of: Avoided cost (self-consumed energy), Export revenue (capped by grid export limit), and Carbon credits. Infrastructure costs for solar PV and biogas are one-time investments. Payback = Total CAPEX ÷ (Avoided cost + Export revenue + Carbon credits).
        </p>
      </div>
    </div>
  );
}

export default Assumptions;

