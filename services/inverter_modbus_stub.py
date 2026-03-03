"""
Stub for Modbus/SunSpec inverter integration.
Use pymodbus or pySunSpec to read/write data to inverters.

  pip install pymodbus pysunspec

The app cannot just "suggest" things; it must talk to the hardware.
This module is intended to run on an edge device (Raspberry Pi/PLC) or backend.
"""

# Example: read inverter power via Modbus (pymodbus)
# from pymodbus.client import ModbusTcpClient
# client = ModbusTcpClient('192.168.1.100', port=502)
# result = client.read_holding_registers(address=0, count=10, unit=1)
# client.close()

# Example: SunSpec compliant inverters (pySunSpec)
# import sunspec2.modbus.client as client
# sd = client.SunSpecClientDevice(client.TCP, host='192.168.1.100', port=502)
# sd.connect()
# models = sd.get_point_values()
# sd.close()

def read_inverter_power_kw(host: str = "192.168.1.100", port: int = 502) -> float:
    """Read current AC power output from inverter (kW). Stub: returns 0."""
    # TODO: implement with pymodbus or pySunSpec
    return 0.0


def read_inverter_capacity_kw(host: str, port: int = 502) -> float:
    """Read inverter rated capacity (kW). Stub: returns 0."""
    # TODO: implement with pymodbus or pySunSpec
    return 0.0
