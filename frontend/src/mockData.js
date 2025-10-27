// Mock data for development and testing
export const MOCK_ENABLED = false;

export const mockSavingsData = {
  totalSavings: -434.74,  // Negative = overpaid (matches transaction sum below)
  totalGasPaid: 558.89,   // Total of all gasPaid
  optimalGasPaid: 124.15, // Total of all optimalGas
  transactionCount: 15,   // Actual number of transactions
  period: 90,
  averageOverpayment: 28.98,  // Average per transaction
  savingsPercentage: -77.8  // Overall percentage overpaid
};

export const mockTransactions = [
  // EXCELLENT timing - saved money!
  {
    hash: "0x1234...5678",
    timestamp: Date.now() - 86400000 * 2,
    gasPaid: 8.45,
    optimalGas: 7.89,
    overpayment: -0.56,  // Actually saved vs average!
    overpaymentPercentage: -6.6,
    type: "Uniswap Swap",
    value: "0.5 ETH"
  },
  // GOOD timing - minimal overpayment
  {
    hash: "0x2345...6789",
    timestamp: Date.now() - 86400000 * 4,
    gasPaid: 12.34,
    optimalGas: 9.12,
    overpayment: 3.22,
    overpaymentPercentage: 26.1,
    type: "Token Approval",
    value: "0"
  },
  // NEUTRAL timing - moderate overpayment
  {
    hash: "0x3456...7890",
    timestamp: Date.now() - 86400000 * 7,
    gasPaid: 28.67,
    optimalGas: 18.23,
    overpayment: 10.44,
    overpaymentPercentage: 36.4,
    type: "Aave Deposit",
    value: "1.2 ETH"
  },
  // BAD timing - high overpayment
  {
    hash: "0x4567...8901",
    timestamp: Date.now() - 86400000 * 9,
    gasPaid: 68.43,
    optimalGas: 8.89,
    overpayment: 59.54,
    overpaymentPercentage: 87.0,
    type: "NFT Mint",
    value: "0.08 ETH"
  },
  // GOOD timing again
  {
    hash: "0x5678...9012",
    timestamp: Date.now() - 86400000 * 12,
    gasPaid: 15.56,
    optimalGas: 11.45,
    overpayment: 4.11,
    overpaymentPercentage: 26.4,
    type: "Curve Swap",
    value: "0.3 ETH"
  },
  // TERRIBLE timing - peak hours
  {
    hash: "0x6789...0123",
    timestamp: Date.now() - 86400000 * 15,
    gasPaid: 95.89,
    optimalGas: 6.78,
    overpayment: 89.11,
    overpaymentPercentage: 92.9,
    type: "OpenSea Purchase",
    value: "0.15 ETH"
  },
  // NEUTRAL timing
  {
    hash: "0x7890...1234",
    timestamp: Date.now() - 86400000 * 18,
    gasPaid: 32.12,
    optimalGas: 19.01,
    overpayment: 13.11,
    overpaymentPercentage: 40.8,
    type: "ENS Registration",
    value: "0.002 ETH"
  },
  // BAD timing
  {
    hash: "0x8901...2345",
    timestamp: Date.now() - 86400000 * 22,
    gasPaid: 72.87,
    optimalGas: 7.12,
    overpayment: 65.75,
    overpaymentPercentage: 90.2,
    type: "Yield Harvest",
    value: "0"
  },
  // GOOD timing
  {
    hash: "0x9012...3456",
    timestamp: Date.now() - 86400000 * 25,
    gasPaid: 14.23,
    optimalGas: 10.34,
    overpayment: 3.89,
    overpaymentPercentage: 27.3,
    type: "Token Swap",
    value: "0.2 ETH"
  },
  // VERY BAD timing - worst one
  {
    hash: "0x0123...4567",
    timestamp: Date.now() - 86400000 * 28,
    gasPaid: 78.45,
    optimalGas: 8.23,
    overpayment: 70.22,
    overpaymentPercentage: 89.5,
    type: "Uniswap V3 LP",
    value: "2.5 ETH"
  },
  // EXCELLENT timing
  {
    hash: "0x1111...5555",
    timestamp: Date.now() - 86400000 * 32,
    gasPaid: 9.12,
    optimalGas: 8.56,
    overpayment: 0.56,
    overpaymentPercentage: 6.1,
    type: "Claim Rewards",
    value: "0"
  },
  // NEUTRAL
  {
    hash: "0x2222...6666",
    timestamp: Date.now() - 86400000 * 35,
    gasPaid: 25.67,
    optimalGas: 16.34,
    overpayment: 9.33,
    overpaymentPercentage: 36.3,
    type: "Balancer Swap",
    value: "0.4 ETH"
  },
  // BAD timing
  {
    hash: "0x3333...7777",
    timestamp: Date.now() - 86400000 * 40,
    gasPaid: 58.91,
    optimalGas: 7.45,
    overpayment: 51.46,
    overpaymentPercentage: 87.4,
    type: "NFT List for Sale",
    value: "0"
  },
  // GOOD timing
  {
    hash: "0x4444...8888",
    timestamp: Date.now() - 86400000 * 45,
    gasPaid: 11.23,
    optimalGas: 8.12,
    overpayment: 3.11,
    overpaymentPercentage: 27.7,
    type: "Approve USDC",
    value: "0"
  },
  // VERY BAD timing
  {
    hash: "0x5555...9999",
    timestamp: Date.now() - 86400000 * 50,
    gasPaid: 58.34,
    optimalGas: 6.89,
    overpayment: 51.45,
    overpaymentPercentage: 88.2,
    type: "Mint NFT",
    value: "0.05 ETH"
  }
];

// Total overpayment breakdown:
// -0.56 + 3.22 + 10.44 + 59.54 + 4.11 + 89.11 + 13.11 + 65.75 + 3.89 + 70.22 + 0.56 + 9.33 + 51.46 + 3.11 + 51.45 = $434.74
// Mix: 2 excellent, 4 good, 3 neutral, 4 bad, 2 very bad = realistic variety!

export const mockForecast = {
  current: 12.5,
  trend: "falling",
  predictions: [
    { time: "Now", price: 12.5 },
    { time: "+1h", price: 11.2 },
    { time: "+2h", price: 9.8 },
    { time: "+3h", price: 8.5 },
    { time: "+4h", price: 7.2 }
  ],
  recommendation: "Wait 3-4 hours for optimal gas price",
  potentialSavings: 42.4
};

// Helper function to use mock data conditionally
export const useMockData = (realData, mockData) => {
  return MOCK_ENABLED ? mockData : realData;
};
