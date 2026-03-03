/**
 * Smart unit conversion utilities
 * Automatically converts to higher units when numbers are too large
 */

/**
 * Convert energy (kWh to MWh or GWh)
 * @param {number} value - Value in kWh
 * @returns {object} { value: number, unit: string }
 */
export function formatEnergy(value) {
  if (value >= 1000000) {
    // Convert to GWh
    return {
      value: parseFloat((value / 1000000).toFixed(3)),
      unit: 'GWh',
      original: value
    };
  } else if (value >= 1000) {
    // Convert to MWh
    return {
      value: parseFloat((value / 1000).toFixed(3)),
      unit: 'MWh',
      original: value
    };
  } else {
    return {
      value: parseFloat(value.toFixed(3)),
      unit: 'kWh',
      original: value
    };
  }
}

/**
 * Convert water (Liters to kL or ML)
 * @param {number} value - Value in liters
 * @returns {object} { value: number, unit: string }
 */
export function formatWater(value) {
  if (value >= 1000000) {
    // Convert to ML (Mega Liters)
    return {
      value: parseFloat((value / 1000000).toFixed(3)),
      unit: 'ML',
      original: value
    };
  } else if (value >= 1000) {
    // Convert to kL
    return {
      value: parseFloat((value / 1000).toFixed(3)),
      unit: 'kL',
      original: value
    };
  } else {
    return {
      value: parseFloat(value.toFixed(3)),
      unit: 'L',
      original: value
    };
  }
}

/**
 * Convert carbon (tons to kTons)
 * @param {number} value - Value in tons
 * @returns {object} { value: number, unit: string }
 */
export function formatCarbon(value) {
  if (value >= 1000) {
    // Convert to kTons
    return {
      value: parseFloat((value / 1000).toFixed(3)),
      unit: 'kTons',
      original: value
    };
  } else {
    return {
      value: parseFloat(value.toFixed(3)),
      unit: 'Tons',
      original: value
    };
  }
}

/**
 * Format currency with up to 3 decimals
 * @param {number} value - Value in USD
 * @returns {string} Formatted string
 */
export function formatCurrency(value) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(3)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(3)}K`;
  } else {
    return `$${value.toFixed(3)}`;
  }
}

/**
 * Format currency in Euros (e.g. digestate savings, revenue stack)
 */
export function formatCurrencyEuro(value) {
  if (value >= 1000000) {
    return `€${(value / 1000000).toFixed(3)}M`;
  } else if (value >= 1000) {
    return `€${(value / 1000).toFixed(3)}K`;
  } else {
    return `€${value.toFixed(2)}`;
  }
}

/**
 * Format number with up to 3 decimals
 * @param {number} value - Number to format
 * @returns {string} Formatted string
 */
export function formatNumber(value) {
  return parseFloat(value.toFixed(3)).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3
  });
}

