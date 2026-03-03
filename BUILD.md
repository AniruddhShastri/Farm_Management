# Smart Steps: Build Order for EcoSynergy

If building this system from scratch, this is the recommended order of operations.

## 1. Static calculator first
- **Input:** Location, livestock (cows/pigs/chickens), solar area.
- **Output:** Energy (biogas net of parasitic load, solar with optional inverter clipping).
- Validate the math: parasitic load when winter temp < 5°C, digestate liters and fertilizer savings, C:N recipe check.

## 2. Biomass database
- Use the **Biomass Proxy** JSON (`src/data/biomassProxy.json`) with 4–5 generic buckets:
  - Dry/Straw, Green/Leafy, Root/Starch, Sugary/Fruit, Manure.
- Users can map feedstocks to these when exact crop names are missing.

## 3. Time-series logic
- Move from **annual totals** to **hourly** (or 15-min) generation/load for a full year.
- Required to size the battery correctly and model self-consumption vs export.

## 4. Money layer
- Connect **ENTSO-E** (Europe) or **OpenEI** (US) for day-ahead / spot prices.
- Feed hourly prices into the time-series model to compute:
  - Avoided cost, export revenue, battery arbitrage (with deadband e.g. €0.02/kWh min profit).

## 5. Audit report
- Design a **PDF export** (or printable view) that a farmer can hand to a Nestlé/Danone sustainability officer:
  - Energy generated, digestate produced, methane baseline (manure management), carbon avoided, revenue stack.

## Already implemented in this app
- Parasitic load (winter temp < 5°C → 20–30% biogas deducted).
- Biomass proxy buckets and recipe check (C:N, acidification warning).
- Digestate calculator (liters, €/yr fertilizer savings).
- Revenue stack (avoided cost, export revenue, carbon credits).
- Grid export limit (0 = self-consumption only).
- Inverter clipping for solar.
- Methane baseline (open lagoon vs spread on field).
- What-If: change inputs → instant ROI and tank size update; optional “Save as baseline”.

## Edge / hardware (offline)
- Critical control (safety, battery management) should run **locally** (Raspberry Pi / PLC).
- Only reporting and price checks need the cloud; if the internet drops, the farm keeps running.
