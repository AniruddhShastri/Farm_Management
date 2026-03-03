"""
Stub for market price APIs: ENTSO-E (Europe) or OpenEI (US).
Integrate day-ahead pricing so the battery arbitrage and revenue stack use real prices.

ENTSO-E: https://transparency.entsoe.eu/ - requires API token.
OpenEI: https://openei.org/wiki/Utility_Rate_Database
"""

# ENTSO-E day-ahead prices (Europe)
# https://transparency.entsoe.eu/content/static_content/Static%20content/web%20api/Guide.html

def get_day_ahead_prices_entsoe(area_code: str, start: str, end: str, api_key: str) -> list:
    """Fetch day-ahead prices for a bidding zone. Returns list of (timestamp, price_eur_per_mwh)."""
    # TODO: implement GET request to ENTSO-E API
    return []


def get_day_ahead_prices_openei(utility_id: str, start: str, end: str) -> list:
    """Fetch utility rates (US). Returns list of (timestamp, price_usd_per_kwh)."""
    # TODO: implement OpenEI or utility API
    return []
