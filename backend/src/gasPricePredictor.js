const gasTracker = require('./gasTracker');

// Store extended history for pattern analysis (7 days worth)
const extendedHistory = [];
const MAX_EXTENDED_HISTORY = 2016; // 7 days * 24 hours * 12 (5-min intervals)

// Add data point to extended history
function recordDataPoint(prices) {
  extendedHistory.push({
    timestamp: Date.now(),
    price: prices.proposed,
    safe: prices.safe,
    fast: prices.fast,
    hour: new Date().getHours(),
    dayOfWeek: new Date().getDay()
  });

  if (extendedHistory.length > MAX_EXTENDED_HISTORY) {
    extendedHistory.shift();
  }
}

// Calculate moving average for given timeframe
function getMovingAverage(minutes) {
  const dataPoints = Math.ceil(minutes / 5); // Assuming 5-min intervals
  const recent = extendedHistory.slice(-dataPoints);

  if (recent.length === 0) return null;

  const sum = recent.reduce((acc, point) => acc + point.price, 0);
  return sum / recent.length;
}

// Determine trend direction
function getTrend() {
  const last30min = getMovingAverage(30);
  const last60min = getMovingAverage(60);

  if (!last30min || !last60min) return 'stable';

  const change = ((last30min - last60min) / last60min) * 100;

  if (change < -5) return 'down';
  if (change > 5) return 'up';
  return 'stable';
}

// Find best time window based on historical patterns
function getBestTimeToday() {
  const currentHour = new Date().getHours();
  const currentDay = new Date().getDay();

  // Get historical data for same day of week
  const sameDayData = extendedHistory.filter(point => point.dayOfWeek === currentDay);

  if (sameDayData.length < 48) {
    // Not enough data, return generic best time (2-5 AM UTC)
    return {
      startHour: 2,
      endHour: 5,
      expectedPrice: extendedHistory.length > 0 ? Math.min(...extendedHistory.map(p => p.price)) : null,
      confidence: 50
    };
  }

  // Calculate average price for each 3-hour window
  const windows = [];
  for (let hour = 0; hour < 24; hour += 3) {
    const windowData = sameDayData.filter(point =>
      point.hour >= hour && point.hour < hour + 3
    );

    if (windowData.length > 0) {
      const avgPrice = windowData.reduce((sum, p) => sum + p.price, 0) / windowData.length;
      windows.push({
        startHour: hour,
        endHour: hour + 3,
        avgPrice,
        dataPoints: windowData.length
      });
    }
  }

  // Find window with lowest average price (excluding windows that already passed today)
  const futureWindows = windows.filter(w => w.startHour > currentHour);
  const todayWindows = futureWindows.length > 0 ? futureWindows : windows;

  if (todayWindows.length === 0) {
    return {
      startHour: 2,
      endHour: 5,
      expectedPrice: null,
      confidence: 40
    };
  }

  const bestWindow = todayWindows.reduce((best, current) =>
    current.avgPrice < best.avgPrice ? current : best
  );

  return {
    startHour: bestWindow.startHour,
    endHour: bestWindow.endHour,
    expectedPrice: bestWindow.avgPrice,
    confidence: Math.min(85, 50 + (bestWindow.dataPoints / 10))
  };
}

// Predict gas prices for next N hours
function predictNextHours(hours) {
  const currentPrice = extendedHistory.length > 0
    ? extendedHistory[extendedHistory.length - 1].price
    : null;

  if (!currentPrice) {
    return { price: null, change: 0, confidence: 0 };
  }

  const trend = getTrend();
  const movingAvg4hr = getMovingAverage(240); // 4 hours
  const movingAvg24hr = getMovingAverage(1440); // 24 hours

  // Prediction using moving averages and trend
  let predictedPrice = currentPrice;
  let confidence = 50;

  if (movingAvg4hr && movingAvg24hr) {
    // Weight recent trends more heavily
    if (trend === 'down') {
      predictedPrice = currentPrice * 0.85 + movingAvg4hr * 0.15;
      confidence = 72;
    } else if (trend === 'up') {
      predictedPrice = currentPrice * 0.85 + movingAvg4hr * 0.15 + (currentPrice - movingAvg4hr) * 0.3;
      confidence = 68;
    } else {
      predictedPrice = movingAvg4hr;
      confidence = 75;
    }

    // Adjust confidence based on data availability
    const dataAge = extendedHistory.length;
    if (dataAge < 288) confidence *= 0.8; // Less than 24 hours of data
    if (dataAge >= 1440) confidence = Math.min(85, confidence * 1.1); // 5+ days of data
  }

  const change = ((predictedPrice - currentPrice) / currentPrice) * 100;

  return {
    price: parseFloat(predictedPrice.toFixed(4)),
    change: parseFloat(change.toFixed(1)),
    trend,
    confidence: Math.round(confidence)
  };
}

// Get comprehensive forecast
function getForecast() {
  const currentPrice = extendedHistory.length > 0
    ? extendedHistory[extendedHistory.length - 1].price
    : null;

  const next1hr = predictNextHours(1);
  const next4hr = predictNextHours(4);
  const bestTime = getBestTimeToday();
  const trend = getTrend();

  // Determine recommendation
  let recommendation = 'NEUTRAL';
  let recommendationReason = 'Gas prices are stable';
  let potentialSavings = 0;

  if (currentPrice && bestTime.expectedPrice) {
    potentialSavings = ((currentPrice - bestTime.expectedPrice) / currentPrice) * 100;

    if (trend === 'down' && next4hr.change < -10) {
      recommendation = 'WAIT';
      recommendationReason = `Gas prices are dropping. Expected to decrease ${Math.abs(next4hr.change)}% in next 4 hours.`;
    } else if (trend === 'up' && next4hr.change > 10) {
      recommendation = 'SEND_NOW';
      recommendationReason = `Gas prices are rising. Expected to increase ${next4hr.change}% in next 4 hours.`;
    } else if (currentPrice < bestTime.expectedPrice * 0.9) {
      recommendation = 'SEND_NOW';
      recommendationReason = `Current price is ${potentialSavings.toFixed(0)}% below today's average. Good time to send!`;
    } else if (potentialSavings > 20) {
      recommendation = 'WAIT';
      recommendationReason = `Wait for better rates. Best time: ${bestTime.startHour}:00-${bestTime.endHour}:00 UTC (save ~${potentialSavings.toFixed(0)}%)`;
    }
  }

  return {
    current: {
      price: currentPrice,
      timestamp: Date.now()
    },
    next1hr,
    next4hr,
    bestTime: {
      startHour: bestTime.startHour,
      endHour: bestTime.endHour,
      expectedPrice: bestTime.expectedPrice ? parseFloat(bestTime.expectedPrice.toFixed(4)) : null,
      potentialSavings: parseFloat(potentialSavings.toFixed(1)),
      confidence: bestTime.confidence
    },
    recommendation: {
      action: recommendation,
      reason: recommendationReason,
      confidence: next4hr.confidence
    },
    dataPoints: extendedHistory.length,
    trend
  };
}

// Get historical data for transaction analysis
function getHistoricalData() {
  return extendedHistory;
}

module.exports = {
  recordDataPoint,
  getForecast,
  getMovingAverage,
  getTrend,
  getHistoricalData
};
