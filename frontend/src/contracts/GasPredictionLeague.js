// GasPredictionLeague Contract Details (v2 with decimal support)
export const CONTRACT_ADDRESS = '0xA18F113ADC48B3823057ED892989320b5FD5C055';
export const CHAIN_ID = 97; // BSC Testnet

export const CONTRACT_ABI = [
  // Core functions we'll use
  {
    "inputs": [
      {"internalType": "uint256", "name": "_chainId", "type": "uint256"},
      {"internalType": "uint256", "name": "_targetTimestamp", "type": "uint256"},
      {"internalType": "uint256", "name": "_predictedMilliGwei", "type": "uint256"}
    ],
    "name": "makePrediction",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "predictionId", "type": "uint256"}],
    "name": "getPrediction",
    "outputs": [
      {"internalType": "address", "name": "predictor", "type": "address"},
      {"internalType": "uint256", "name": "chainId", "type": "uint256"},
      {"internalType": "uint256", "name": "targetTimestamp", "type": "uint256"},
      {"internalType": "uint256", "name": "predictedMilliGwei", "type": "uint256"},
      {"internalType": "uint256", "name": "actualMilliGwei", "type": "uint256"},
      {"internalType": "bool", "name": "resolved", "type": "bool"},
      {"internalType": "uint256", "name": "accuracyScore", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "user", "type": "address"}],
    "name": "getUserStats",
    "outputs": [
      {"internalType": "uint256", "name": "totalPredictions", "type": "uint256"},
      {"internalType": "uint256", "name": "averageScore", "type": "uint256"},
      {"internalType": "uint256", "name": "perfectPredictions", "type": "uint256"},
      {"internalType": "uint256", "name": "currentStreak", "type": "uint256"},
      {"internalType": "uint256", "name": "bestStreak", "type": "uint256"}
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "chainId", "type": "uint256"}],
    "name": "getChainName",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "predictionCount",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  // Events
  {
    "anonymous": false,
    "inputs": [
      {"indexed": true, "internalType": "uint256", "name": "predictionId", "type": "uint256"},
      {"indexed": true, "internalType": "address", "name": "predictor", "type": "address"},
      {"indexed": false, "internalType": "uint256", "name": "chainId", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "targetTimestamp", "type": "uint256"},
      {"indexed": false, "internalType": "uint256", "name": "predictedGwei", "type": "uint256"}
    ],
    "name": "PredictionMade",
    "type": "event"
  }
];

// Chain configurations
export const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH', color: '#627EEA' },
  { id: 56, name: 'BNB Chain', symbol: 'BNB', color: '#F3BA2F' },
  { id: 137, name: 'Polygon', symbol: 'MATIC', color: '#8247E5' },
  { id: 42161, name: 'Arbitrum', symbol: 'ARB', color: '#2D374B' },
  { id: 10, name: 'Optimism', symbol: 'OP', color: '#FF0420' },
  { id: 8453, name: 'Base', symbol: 'BASE', color: '#0052FF' }
];
