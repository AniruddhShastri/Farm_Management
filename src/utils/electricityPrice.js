/**
 * Dynamic electricity pricing utility.
 * Attempts to fetch real-time 3-month average prices.
 * Falls back to regional averages derived from IEA / Eurostat data.
 *
 * To integrate a live API (e.g. ENTSO-E for Europe, EIA for USA):
 *   1. Add the API key to Vercel env vars (e.g. VITE_ENTSOE_API_KEY)
 *   2. Route the call through a serverless function in /api/ to keep the key server-side
 *   3. Replace the fetchLivePrice() body below with the real fetch logic
 */

/* Regional fallback prices in EUR/kWh (IEA 2024 averages) */
const REGIONAL_FALLBACK = {
  // Europe
  germany: 0.32, france: 0.22, spain: 0.18, italy: 0.26,
  portugal: 0.20, netherlands: 0.28, belgium: 0.28, austria: 0.24,
  sweden: 0.11, norway: 0.10, denmark: 0.35, finland: 0.13,
  poland: 0.16, czechia: 0.18, romania: 0.14, hungary: 0.15,
  greece: 0.20, uk: 0.28, ireland: 0.30, switzerland: 0.22,
  // Asia
  india: 0.08, china: 0.09, japan: 0.22, southkorea: 0.11,
  indonesia: 0.07, thailand: 0.10, vietnam: 0.08, pakistan: 0.09,
  // Americas
  usa: 0.14, canada: 0.10, brazil: 0.12, mexico: 0.11, argentina: 0.05,
  // Africa / Middle East
  nigeria: 0.04, southafrica: 0.10, kenya: 0.16, egypt: 0.03,
  saudiarabia: 0.05, uae: 0.08,
  // Oceania
  australia: 0.22, newzealand: 0.18,
  // Default
  default: 0.20,
};

function matchRegion(locationStr = '') {
  const lower = locationStr.toLowerCase().replace(/[\s,]/g, '');
  for (const [key, price] of Object.entries(REGIONAL_FALLBACK)) {
    if (key === 'default') continue;
    if (lower.includes(key)) return { price, key };
  }
  return { price: REGIONAL_FALLBACK.default, key: 'default' };
}

/**
 * Placeholder for a live API call.
 * Replace this with a real API call routed through /api/ serverless function.
 */
async function fetchLivePrice(_locationStr) {
  // Example future integration:
  // const res = await fetch(`/api/electricity-price?location=${encodeURIComponent(_locationStr)}`);
  // const data = await res.json();
  // return data.avg3MonthEurPerKwh;
  return null; // not yet integrated
}

/**
 * Get electricity price for a location.
 * Tries live API first, falls back to regional average.
 *
 * @param {string} locationStr - e.g. "Madrid, Spain" or "Berlin, Germany"
 * @param {number} [staticFallback] - price from locationData.json if available
 * @returns {Promise<{ price: number, source: string, label: string }>}
 */
export async function getElectricityPrice(locationStr, staticFallback = null) {
  try {
    const livePrice = await fetchLivePrice(locationStr);
    if (livePrice && livePrice > 0) {
      return {
        price: livePrice,
        source: 'live_api',
        label: '3-month avg (live)',
      };
    }
  } catch (_) { /* fall through */ }

  // Use the more specific static value from locationData if available
  if (staticFallback && staticFallback > 0) {
    return {
      price: staticFallback,
      source: 'location_data',
      label: 'Regional avg',
    };
  }

  const { price, key } = matchRegion(locationStr);
  return {
    price,
    source: 'regional_fallback',
    label: key === 'default' ? 'Global avg' : 'Regional avg',
  };
}
