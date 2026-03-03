# Backend / Edge Services

The software must talk to hardware and market APIs. This folder holds stubs and integration notes.

## Tech stack

- **Modbus / SunSpec:** Use Python libraries `pymodbus` or `pySunSpec` to read/write inverter data.
- **Market prices:** ENTSO-E (Europe) or OpenEI (US) for day-ahead pricing.
- **Carbon intensity:** Electricity Maps or WattTime to prove battery charged when grid was "green".

## Python environment

```bash
pip install pymodbus pysunspec  # inverters
# ENTSO-E: requires API token from https://transparency.entsoe.eu/
# OpenEI: https://openei.org/wiki/Utility_Rate_Database
```

## Battery deadband

- Do **not** discharge the battery for a profit of less than €0.02/kWh (configurable in `farmData.json` → `electrical.battery_min_profit_eur_per_kwh`).
- Critical control (safety, battery management) should run **locally** (Raspberry Pi / PLC). Only reporting and price checks need the cloud.

## Grid export limit

- If "Grid Export Limit" is set to **0** in the app, the software acts in **Self-Consumption Only** mode (no export to grid).
