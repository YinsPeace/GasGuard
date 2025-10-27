// Shared chain configuration for frontend and backend
const CHAIN_CONFIG = {
  ethereum: {
    id: 'ethereum',
    name: 'Ethereum',
    chainId: 1,
    icon: '⟠',
    color: '#627EEA',
    currency: 'ETH',
    explorer: 'https://etherscan.io',
    averageGas: 30, // Gwei
    blockTime: 12, // seconds
  },
  bsc: {
    id: 'bsc',
    name: 'BNB Chain',
    chainId: 56,
    icon: '🔶',
    color: '#F0B90B',
    currency: 'BNB',
    explorer: 'https://bscscan.com',
    averageGas: 3,
    blockTime: 3,
  },
  polygon: {
    id: 'polygon',
    name: 'Polygon',
    chainId: 137,
    icon: '💜',
    color: '#8247E5',
    currency: 'MATIC',
    explorer: 'https://polygonscan.com',
    averageGas: 50,
    blockTime: 2,
  },
  arbitrum: {
    id: 'arbitrum',
    name: 'Arbitrum',
    chainId: 42161,
    icon: '🔵',
    color: '#28A0F0',
    currency: 'ETH',
    explorer: 'https://arbiscan.io',
    averageGas: 0.1,
    blockTime: 0.25,
  },
  optimism: {
    id: 'optimism',
    name: 'Optimism',
    chainId: 10,
    icon: '🔴',
    color: '#FF0420',
    currency: 'ETH',
    explorer: 'https://optimistic.etherscan.io',
    averageGas: 0.001,
    blockTime: 2,
  },
  base: {
    id: 'base',
    name: 'Base',
    chainId: 8453,
    icon: '🔷',
    color: '#0052FF',
    currency: 'ETH',
    explorer: 'https://basescan.org',
    averageGas: 0.001,
    blockTime: 2,
  },
  avalanche: {
    id: 'avalanche',
    name: 'Avalanche',
    chainId: 43114,
    icon: '🔺',
    color: '#E84142',
    currency: 'AVAX',
    explorer: 'https://snowtrace.io',
    averageGas: 25,
    blockTime: 2,
  },
  gnosis: {
    id: 'gnosis',
    name: 'Gnosis',
    chainId: 100,
    icon: '🦉',
    color: '#04795B',
    currency: 'xDAI',
    explorer: 'https://gnosisscan.io',
    averageGas: 2,
    blockTime: 5,
  },
};

// For node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CHAIN_CONFIG;
}

// For browser environments
if (typeof window !== 'undefined') {
  window.CHAIN_CONFIG = CHAIN_CONFIG;
}
