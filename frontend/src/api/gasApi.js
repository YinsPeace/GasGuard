import axios from 'axios';

// API base URL from environment
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Gas Prices
export const getCurrentGasPrices = async () => {
  const response = await axios.get(`${API_URL}/api/gas/current`);
  return response.data.data;
};

export const getGasForecast = async () => {
  const response = await axios.get(`${API_URL}/api/gas/forecast`);
  return response.data.data;
};

// Transactions & Savings
export const getUserSavings = async (walletAddress) => {
  const response = await axios.get(`${API_URL}/api/transactions/savings/${walletAddress}`);
  return response.data.data;
};

// Stripe
export const createCheckoutSession = async (walletAddress) => {
  const response = await axios.post(`${API_URL}/api/stripe/create-checkout-session`, {
    walletAddress
  });
  return response.data.data;
};

export const getSubscriptionStatus = async (walletAddress) => {
  const response = await axios.get(`${API_URL}/api/stripe/subscription-status/${walletAddress}`);
  return response.data.data;
};

// Telegram
export const getTelegramStatus = async (walletAddress) => {
  const response = await axios.get(`${API_URL}/api/alerts/status/${walletAddress}`);
  return response.data.data;
};

export const connectTelegram = async (walletAddress) => {
  const botUsername = 'GasGuardAppBot';
  return {
    botUrl: `https://t.me/${botUsername}?start=${walletAddress}`,
    message: 'Click the link to connect to the Telegram bot'
  };
};

// Update gas threshold
export const updateGasThreshold = async (walletAddress, threshold) => {
  const response = await axios.post(`${API_URL}/api/alerts/threshold`, {
    walletAddress,
    gasThreshold: threshold
  });
  return response.data;
};

// Update alert settings
export const updateAlertSettings = async (walletAddress, settings) => {
  const response = await axios.post(`${API_URL}/api/alerts/settings`, {
    walletAddress,
    ...settings
  });
  return response.data;
};

// Send test alert
export const sendTestAlert = async (walletAddress) => {
  const response = await axios.post(`${API_URL}/api/alerts/test`, {
    walletAddress
  });
  return response.data;
};

export default {
  getCurrentGasPrices,
  getGasForecast,
  getUserSavings,
  createCheckoutSession,
  getSubscriptionStatus,
  getTelegramStatus,
  connectTelegram,
  updateGasThreshold,
  updateAlertSettings,
  sendTestAlert
};
