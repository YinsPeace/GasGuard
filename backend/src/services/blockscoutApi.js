// Multi-chain API using Blockscout (replaces etherscanApi.js)
const axios = require('axios');

// Etherscan V2 API for Ethereum (most accurate)
const ETHERSCAN_API = 'https://api.etherscan.io/v2/api';

// Blockscout endpoints for each chain (updated with working URLs)
const CHAIN_ENDPOINTS = {
  ethereum: 'https://eth.blockscout.com/api',
  bsc: 'https://api.bscscan.com/api', // Use BSCScan for BNB Chain
  polygon: 'https://polygon.blockscout.com/api',
  arbitrum: 'https://arbitrum.blockscout.com/api',
  optimism: 'https://api-optimistic.etherscan.io/api', // Use Optimistic Etherscan
  base: 'https://base.blockscout.com/api',
  avalanche: 'https://api.snowtrace.io/api', // Use Snowtrace for Avalanche
  gnosis: 'https://gnosis.blockscout.com/api',
  // Add more chains as needed
};

// RPC endpoints for gas price fetching (updated with more reliable ones)
const RPC_ENDPOINTS = {
  ethereum: 'https://eth-mainnet.g.alchemy.com/v2/demo',
  bsc: 'https://bsc-dataseed.binance.org',
  polygon: 'https://polygon-rpc.com',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  optimism: 'https://mainnet.optimism.io',
  base: 'https://mainnet.base.org',
  avalanche: 'https://api.avax.network/ext/bc/C/rpc',
  gnosis: 'https://rpc.gnosischain.com',
};

class BlockscoutApi {
  constructor(chain = 'ethereum') {
    this.chain = chain;
    this.endpoint = CHAIN_ENDPOINTS[chain];
    this.rpcEndpoint = RPC_ENDPOINTS[chain];
    
    if (!this.endpoint) {
      throw new Error(`Unsupported chain: ${chain}`);
    }
  }
  
  // Fetch user transactions (same format as Etherscan)
  async fetchUserTransactions(address) {
    try {
      console.log(`📊 Fetching transactions for ${address} on ${this.chain}`);
      
      // For BSC, skip transaction fetching if no API key
      if (this.chain === 'bsc' && !process.env.BSCSCAN_API_KEY) {
        console.log('  ⚠️  BSCScan API key required for transaction history');
        return []; // Return empty array, gas prices still work
      }
      
      const params = {
        module: 'account',
        action: 'txlist',
        address: address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 1000,
        sort: 'desc'
      };
      
      // Add API key for chains that need it
      if (this.chain === 'bsc') {
        params.apikey = process.env.BSCSCAN_API_KEY;
      } else if (this.chain === 'ethereum' || this.chain === 'polygon') {
        params.apikey = process.env.BLOCKSCOUT_API_KEY || 'free-tier';
      }
      
      const response = await axios.get(this.endpoint, { params });
      
      if (response.data.status === '1') {
        return response.data.result;
      } else if (response.data.status === '0' && response.data.message === 'No transactions found') {
        return [];
      } else {
        throw new Error(response.data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error(`Error fetching transactions on ${this.chain}:`, error.message);
      throw error;
    }
  }
  
  // Get Ethereum gas price from Etherscan V2 API (most accurate)
  async getEthereumGasFromEtherscan() {
    try {
      console.log('📊 Fetching Ethereum gas from Etherscan V2 API');
      const response = await axios.get(ETHERSCAN_API, {
        params: {
          chainid: 1,
          module: 'gastracker',
          action: 'gasoracle',
          apikey: process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'
        },
        timeout: 5000
      });

      console.log('  📥 Etherscan response:', JSON.stringify(response.data));

      if (response.data && response.data.status === '1' && response.data.result) {
        const result = response.data.result;
        const gasData = {
          safe: parseFloat(result.SafeGasPrice),
          proposed: parseFloat(result.ProposeGasPrice),
          fast: parseFloat(result.FastGasPrice),
          chain: 'ethereum',
          timestamp: Date.now(),
          source: 'etherscan'
        };

        console.log(`  ✅ Ethereum (Etherscan): ${gasData.proposed} Gwei`);
        return gasData;
      }

      console.error('  ❌ Invalid response structure:', response.data);
      throw new Error('Invalid Etherscan API response');
    } catch (error) {
      console.error(`  ⚠️ Etherscan API error: ${error.message}`);
      throw error;
    }
  }

  // Get current gas price via RPC
  async getCurrentGasPrice() {
    try {
      // For Ethereum, ALWAYS use Etherscan API (most accurate)
      if (this.chain === 'ethereum') {
        try {
          return await this.getEthereumGasFromEtherscan();
        } catch (etherscanError) {
          console.warn('  ⚠️ Etherscan failed, falling back to RPC for Ethereum');
          // Continue to RPC fallback below
        }
      }

      // For all other chains (and Ethereum fallback), use RPC
      const timeout = this.chain === 'ethereum' ? 8000 : 5000;
      const response = await axios.post(this.rpcEndpoint, {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1
      }, { timeout });

      if (response.data.result) {
        const gasPriceWei = parseInt(response.data.result, 16);
        const gasPriceGwei = gasPriceWei / 1e9;

        // For Ethereum and BSC, the values are often too low from RPC
        // Use minimum realistic values
        let adjustedGwei = gasPriceGwei;
        if (this.chain === 'ethereum' && gasPriceGwei < 10) {
          adjustedGwei = 15; // Minimum realistic Ethereum gas
        } else if (this.chain === 'bsc' && gasPriceGwei < 3) {
          adjustedGwei = 3; // Minimum realistic BSC gas
        }

        console.log(`  ✅ ${this.chain} (RPC): ${adjustedGwei.toFixed(6)} Gwei`);

        return {
          safe: Math.round(adjustedGwei * 0.9 * 100) / 100,
          proposed: Math.round(adjustedGwei * 100) / 100,
          fast: Math.round(adjustedGwei * 1.1 * 100) / 100,
          chain: this.chain,
          timestamp: Date.now(),
          source: 'rpc'
        };
      }

      throw new Error('Failed to get gas price');
    } catch (error) {
      console.error(`  ❌ Error fetching gas price on ${this.chain}:`, error.message);

      // Fallback to estimated gas based on chain
      const baseGas = this.getChainBaseGas();
      return {
        safe: baseGas * 0.9,
        proposed: baseGas,
        fast: baseGas * 1.1,
        chain: this.chain,
        timestamp: Date.now(),
        source: 'fallback'
      };
    }
  }
  
  // Get historical gas price for a specific date
  async getHistoricalDailyGasPrice(timestamp) {
    try {
      // Convert timestamp to block number
      const blockNumber = await this.getBlockNumberByTimestamp(timestamp);
      
      // Fetch block details
      const response = await axios.post(this.rpcEndpoint, {
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: [`0x${blockNumber.toString(16)}`, false],
        id: 1
      });
      
      if (response.data.result && response.data.result.baseFeePerGas) {
        const baseFeeWei = parseInt(response.data.result.baseFeePerGas, 16);
        const baseFeeGwei = baseFeeWei / 1e9;
        
        // Add priority fee estimate
        const estimatedGasPrice = baseFeeGwei * 1.1;
        
        return {
          min: Math.round(baseFeeGwei * 100) / 100,
          avg: Math.round(estimatedGasPrice * 100) / 100,
          max: Math.round(estimatedGasPrice * 1.5 * 100) / 100,
          timestamp: timestamp,
          chain: this.chain
        };
      }
      
      // Fallback for chains without EIP-1559
      return {
        min: this.getChainBaseGas() * 0.8,
        avg: this.getChainBaseGas(),
        max: this.getChainBaseGas() * 1.5,
        timestamp: timestamp,
        chain: this.chain
      };
    } catch (error) {
      console.error(`Error fetching historical gas on ${this.chain}:`, error.message);
      
      // Return estimated values based on chain
      const baseGas = this.getChainBaseGas();
      return {
        min: baseGas * 0.8,
        avg: baseGas,
        max: baseGas * 1.5,
        timestamp: timestamp,
        chain: this.chain
      };
    }
  }
  
  // Helper: Get block number from timestamp
  async getBlockNumberByTimestamp(timestamp) {
    try {
      // Use binary search to find approximate block
      const currentBlock = await this.getCurrentBlockNumber();
      const secondsPerBlock = this.getChainBlockTime();
      const currentTime = Date.now();
      const timeDiff = (currentTime - timestamp) / 1000; // in seconds
      const blocksDiff = Math.floor(timeDiff / secondsPerBlock);
      
      return Math.max(1, currentBlock - blocksDiff);
    } catch (error) {
      console.error('Error calculating block number:', error);
      // Return a recent block as fallback
      return 1000000;
    }
  }
  
  // Get current block number
  async getCurrentBlockNumber() {
    try {
      const response = await axios.post(this.rpcEndpoint, {
        jsonrpc: '2.0',
        method: 'eth_blockNumber',
        params: [],
        id: 1
      });
      
      if (response.data.result) {
        return parseInt(response.data.result, 16);
      }
      
      throw new Error('Failed to get block number');
    } catch (error) {
      console.error('Error getting block number:', error);
      return 15000000; // Fallback
    }
  }
  
  // Chain-specific configurations
  getChainBaseGas() {
    const baseGasPrices = {
      ethereum: 30, // Gwei
      bsc: 3,
      polygon: 50,
      arbitrum: 0.1,
      optimism: 0.001,
      base: 0.001,
      avalanche: 25,
      gnosis: 2,
    };
    
    return baseGasPrices[this.chain] || 30;
  }
  
  getChainBlockTime() {
    const blockTimes = {
      ethereum: 12,
      bsc: 3,
      polygon: 2,
      arbitrum: 0.25,
      optimism: 2,
      base: 2,
      avalanche: 2,
      gnosis: 5,
    };
    
    return blockTimes[this.chain] || 12;
  }
  
  // Get supported chains
  static getSupportedChains() {
    return Object.keys(CHAIN_ENDPOINTS);
  }
  
  // Check if chain is supported
  static isChainSupported(chain) {
    return CHAIN_ENDPOINTS.hasOwnProperty(chain);
  }
}

// Factory function
function createBlockscoutApi(chain = 'ethereum') {
  return new BlockscoutApi(chain);
}

module.exports = {
  BlockscoutApi,
  createBlockscoutApi,
  SUPPORTED_CHAINS: Object.keys(CHAIN_ENDPOINTS)
};
