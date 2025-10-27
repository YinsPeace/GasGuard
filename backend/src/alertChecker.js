const telegramBot = require('./telegramBot');
const predictor = require('./gasPricePredictor');

// Track which users received which alerts recently to prevent spam
const alertHistory = new Map();

// Check if we're in an optimal window
function isOptimalWindow(forecast) {
  if (!forecast.bestTime.expectedPrice) return false;

  const currentHour = new Date().getHours();
  const { startHour, endHour } = forecast.bestTime;

  // Check if current time is within the optimal window
  if (startHour <= endHour) {
    return currentHour >= startHour && currentHour < endHour;
  } else {
    // Handle overnight windows (e.g., 22:00 - 02:00)
    return currentHour >= startHour || currentHour < endHour;
  }
}

// Check all users and send alerts if conditions are met
async function checkAndSendAlerts(currentPrices) {
  const users = await telegramBot.getAllUsers();

  console.log(`🔔 [ALERTS] Checking alerts... (${users.size} users registered, current price: ${currentPrices.proposed.toFixed(3)} Gwei)`);

  if (users.size === 0) {
    console.log('⏭️  [ALERTS] No users registered yet. Skipping alert checks.');
    return;
  }

  const forecast = predictor.getForecast();

  users.forEach((userData, walletAddress) => {
    // Skip if user is not connected to Telegram (no chatId)
    if (!userData.chatId) {
      console.log(`⏭️  [ALERTS] Skipping ${walletAddress} - not connected to Telegram`);
      return;
    }

    const userThreshold = userData.threshold || 50; // Default to 50 if not set
    console.log(`🔍 [ALERTS] User ${walletAddress.substring(0, 8)}... threshold: ${userThreshold} Gwei`);

    // 1. Threshold Alert
    if (currentPrices.proposed <= userThreshold) {
      const savingsPercent = ((userThreshold - currentPrices.proposed) / userThreshold * 100).toFixed(0);

      console.log(`🚨 [ALERTS] Sending threshold alert to ${walletAddress.substring(0, 8)}... (${currentPrices.proposed} <= ${userThreshold})`);

      telegramBot.sendGasAlert(walletAddress, {
        type: 'THRESHOLD',
        currentPrice: currentPrices.proposed,
        threshold: userThreshold,
        savingsPercent
      });
    }

    // 2. Best Time Alert (if enabled and within optimal window)
    if (userData.bestTimeAlerts && isOptimalWindow(forecast)) {
      telegramBot.sendGasAlert(walletAddress, {
        type: 'BEST_TIME',
        currentPrice: currentPrices.proposed,
        windowEnd: forecast.bestTime.endHour
      });
    }

    // 3. Trend Reversal Alert (if enabled and strong recommendation)
    if (userData.trendAlerts && forecast.recommendation) {
      const { action, reason, confidence } = forecast.recommendation;

      // Only send if high confidence and clear action
      if (confidence >= 70 && action !== 'NEUTRAL') {
        telegramBot.sendGasAlert(walletAddress, {
          type: 'TREND_REVERSAL',
          currentPrice: currentPrices.proposed,
          reason
        });
      }
    }
  });
}

module.exports = {
  checkAndSendAlerts
};
