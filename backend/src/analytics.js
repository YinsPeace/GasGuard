const User = require('./models/User');

/**
 * Analytics helper functions for tracking key metrics
 */

// Get total user count
async function getTotalUsers() {
  try {
    return await User.countDocuments();
  } catch (error) {
    console.error('Error getting total users:', error);
    return 0;
  }
}

// Get active subscribers count
async function getActiveSubscribers() {
  try {
    return await User.countDocuments({
      'subscriptionStatus.isSubscribed': true,
      'subscriptionStatus.status': { $in: ['active', 'trialing'] }
    });
  } catch (error) {
    console.error('Error getting active subscribers:', error);
    return 0;
  }
}

// Get users who connected Telegram
async function getTelegramConnectedUsers() {
  try {
    return await User.countDocuments({
      telegramChatId: { $ne: null, $exists: true }
    });
  } catch (error) {
    console.error('Error getting telegram users:', error);
    return 0;
  }
}

// Get new users in last N days
async function getNewUsersInDays(days = 7) {
  try {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);
    
    return await User.countDocuments({
      createdAt: { $gte: dateThreshold }
    });
  } catch (error) {
    console.error('Error getting new users:', error);
    return 0;
  }
}

// Get trial conversion rate
async function getTrialConversionRate() {
  try {
    const totalTrials = await User.countDocuments({
      'subscriptionStatus.trialEnd': { $exists: true }
    });
    
    const converted = await User.countDocuments({
      'subscriptionStatus.trialEnd': { $exists: true },
      'subscriptionStatus.isSubscribed': true,
      'subscriptionStatus.status': 'active'
    });
    
    const rate = totalTrials > 0 ? ((converted / totalTrials) * 100).toFixed(1) : 0;
    
    return {
      totalTrials,
      converted,
      rate: `${rate}%`
    };
  } catch (error) {
    console.error('Error calculating conversion rate:', error);
    return { totalTrials: 0, converted: 0, rate: '0%' };
  }
}

// Get all key metrics at once
async function getAnalyticsSummary() {
  const [
    totalUsers,
    activeSubscribers,
    telegramUsers,
    newUsersLast7Days,
    conversionData
  ] = await Promise.all([
    getTotalUsers(),
    getActiveSubscribers(),
    getTelegramConnectedUsers(),
    getNewUsersInDays(7),
    getTrialConversionRate()
  ]);

  const telegramConnectionRate = totalUsers > 0 
    ? ((telegramUsers / totalUsers) * 100).toFixed(1) 
    : 0;

  return {
    totalUsers,
    activeSubscribers,
    telegramUsers,
    telegramConnectionRate: `${telegramConnectionRate}%`,
    newUsersLast7Days,
    conversionRate: conversionData.rate,
    trialData: {
      total: conversionData.totalTrials,
      converted: conversionData.converted
    },
    timestamp: new Date().toISOString()
  };
}

// Log analytics summary (useful for cron jobs or monitoring)
async function logAnalyticsSummary() {
  const summary = await getAnalyticsSummary();
  
  console.log('\n📊 === GasGuard Analytics Summary ===');
  console.log(`👥 Total Users: ${summary.totalUsers}`);
  console.log(`💳 Active Subscribers: ${summary.activeSubscribers}`);
  console.log(`📱 Telegram Connected: ${summary.telegramUsers} (${summary.telegramConnectionRate})`);
  console.log(`🆕 New Users (7 days): ${summary.newUsersLast7Days}`);
  console.log(`📈 Trial Conversion: ${summary.conversionRate}`);
  console.log(`⏰ Generated: ${new Date(summary.timestamp).toLocaleString()}`);
  console.log('=====================================\n');
  
  return summary;
}

module.exports = {
  getTotalUsers,
  getActiveSubscribers,
  getTelegramConnectedUsers,
  getNewUsersInDays,
  getTrialConversionRate,
  getAnalyticsSummary,
  logAnalyticsSummary
};
