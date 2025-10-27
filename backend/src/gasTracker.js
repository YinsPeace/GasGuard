const axios = require('axios');
const predictor = require('./gasPricePredictor');
const alertChecker = require('./alertChecker');

const API_KEY = process.env.ETHERSCAN_API_KEY;
const ETHERSCAN_URL = 'https://api.etherscan.io/v2/api';
const gasPriceHistory = [];
const MAX_HISTORY = 100;

// Fetch current gas prices from Etherscan V2 API
async function getCurrentGasPrices() {
  const response = await axios.get(`${ETHERSCAN_URL}?chainid=1&module=gastracker&action=gasoracle&apikey=${API_KEY}`);
  console.log('Etherscan API response:', JSON.stringify(response.data, null, 2));

  if (response.data.status !== '1') {
    throw new Error(`Failed to fetch gas prices: ${response.data.message || 'Unknown error'}`);
  }

  const { SafeGasPrice, ProposeGasPrice, FastGasPrice } = response.data.result;
  const prices = {
    safe: parseFloat(SafeGasPrice),
    proposed: parseFloat(ProposeGasPrice),
    fast: parseFloat(FastGasPrice),
    timestamp: Date.now()
  };

  gasPriceHistory.push(prices);
  if (gasPriceHistory.length > MAX_HISTORY) gasPriceHistory.shift();

  // Record data point for forecasting
  predictor.recordDataPoint(prices);

  return prices;
}

// Predict gas trend using moving average
function predictGasTrend() {
  if (gasPriceHistory.length < 10) return { suggestion: 'wait', reason: 'Collecting data...' };

  const recent = gasPriceHistory.slice(-10);
  const avgRecent = recent.reduce((sum, p) => sum + p.proposed, 0) / 10;
  const current = gasPriceHistory[gasPriceHistory.length - 1].proposed;

  if (current < avgRecent * 0.9) {
    return { suggestion: 'send_now', reason: 'Gas prices are below recent average', currentGwei: current };
  } else if (current > avgRecent * 1.1) {
    return { suggestion: 'wait', reason: 'Gas prices are above recent average', currentGwei: current };
  }
  return { suggestion: 'neutral', reason: 'Gas prices are stable', currentGwei: current };
}

function getHistory() {
  return gasPriceHistory;
}

// Start tracking gas prices every 30 seconds
function startTracking() {
  console.log('⏱️  [GAS TRACKER] Starting gas price tracking (30s interval)');

  // Fetch immediately on startup
  (async () => {
    try {
      console.log('🚀 [GAS TRACKER] Fetching initial gas prices...');
      const prices = await getCurrentGasPrices();
      console.log(`✅ [GAS TRACKER] Gas prices updated: ${prices.proposed.toFixed(3)} Gwei`);

      // Check and send alerts after updating prices
      alertChecker.checkAndSendAlerts(prices);
    } catch (error) {
      console.error('❌ [GAS TRACKER] Error fetching initial gas prices:', error.message);
    }
  })();

  // Then continue every 30 seconds
  setInterval(async () => {
    try {
      const prices = await getCurrentGasPrices();
      console.log(`✅ [GAS TRACKER] Gas prices updated: ${prices.proposed.toFixed(3)} Gwei`);

      // Check and send alerts after updating prices
      alertChecker.checkAndSendAlerts(prices);
    } catch (error) {
      console.error('❌ [GAS TRACKER] Error tracking gas:', error.message);
    }
  }, 30000);
}

module.exports = { getCurrentGasPrices, predictGasTrend, getHistory, startTracking };
