/**
 * Earnings calculator module for TokMoney
 * Calculates estimated earnings for TikTok videos
 */

// Constants for revenue calculation
let RPM_LOW = 0.20;    // €0.20 per 1000 eligible views
let RPM_MEDIUM = 0.45; // €0.45 per 1000 eligible views
let RPM_HIGH = 0.70;   // €0.70 per 1000 eligible views
let currentRPM = RPM_MEDIUM; // Default RPM

// Percentage of views that are eligible for monetization
const ELIGIBLE_PERCENTAGE = 0.40; // 40% of views are eligible

/**
 * Format currency value
 * @param {number} amount - Amount to format
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount) {
  return amount.toFixed(2) + '€';
}

/**
 * Calculate earnings for a given number of views
 * @param {number} views - Total view count
 * @returns {number} - Estimated earnings
 */
function calculateEarnings(views) {
  const eligibleViews = views * ELIGIBLE_PERCENTAGE;
  return eligibleViews * currentRPM / 1000;
}

/**
 * Update the RPM value used for calculations
 * @param {number} newRPM - New RPM value
 */
function updateRPM(newRPM) {
  console.log(`Updating RPM: ${newRPM}€`);
  currentRPM = newRPM;
}

/**
 * Get current RPM value
 * @returns {number} - Current RPM value
 */
function getCurrentRPM() {
  return currentRPM;
}

/**
 * Get RPM preset values
 * @returns {Object} - RPM preset values
 */
function getRPMPresets() {
  return {
    low: RPM_LOW,
    medium: RPM_MEDIUM,
    high: RPM_HIGH
  };
}

// Export functions
export {
  calculateEarnings,
  formatCurrency,
  updateRPM,
  getCurrentRPM,
  getRPMPresets,
  ELIGIBLE_PERCENTAGE
};