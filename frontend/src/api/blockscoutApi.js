// Direct Blockscout API integration for multi-chain gas prices
import axios from 'axios';

// Etherscan API for accurate Ethereum gas prices
const ETHERSCAN_API = 'https://api.etherscan.io/api';

// Blockscout API endpoints for each chain
const BLOCKSCOUT_ENDPOINTS = {
  ethereum: 'https://eth.blockscout.com/api/v2',
  bsc: 'https://bscscan.com/api',
  polygon: 'https://polygon.blockscout.com/api/v2',
  arbitrum: 'https://arbitrum.blockscout.com/api/v2',
  optimism: 'https://optimism.blockscout.com/api/v2',
  base: 'https://base.blockscout.com/api/v2',
  gnosis: 'https://gnosis.blockscout.com/api/v2',
  avalanche: 'https://avalanche.blockscout.com/api/v2'
};

// Use public RPC endpoints for gas prices
const PUBLIC_RPC_ENDPOINTS = {
  ethereum: 'https://eth.llamarpc.com',
  bsc: 'https://bsc-dataseed1.binance.org',
  polygon: 'https://polygon-rpc.com',
  arbitrum: 'https://arb1.arbitrum.io/rpc',
  optimism: 'https://mainnet.optimism.io',
  base: 'https://mainnet.base.org',
  avalanche: 'https://api.avax.network/ext/bc/C/rpc',
  gnosis: 'https://rpc.gnosischain.com'
};

class BlockscoutDirectApi {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5000;
  }

  // Get from cache if fresh
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Set cache
  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  // Get Ethereum gas from Etherscan API (most accurate)
  async getEthereumGasFromEtherscan() {
    const cacheKey = 'etherscan-gas';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(ETHERSCAN_API, {
        params: {
          module: 'gastracker',
          action: 'gasoracle',
          apikey: 'YourApiKeyToken' // Works without key for limited requests
        },
        timeout: 3000
      });

      if (response.data && response.data.status === '1' && response.data.result) {
        const result = response.data.result;
        const gasData = {
          safe: parseFloat(result.SafeGasPrice),
          proposed: parseFloat(result.ProposeGasPrice),
          fast: parseFloat(result.FastGasPrice),
          timestamp: Date.now(),
          source: 'etherscan'
        };

        console.log('✅ ethereum (Etherscan):', gasData.proposed.toFixed(3), 'Gwei');
        this.setCache(cacheKey, gasData);
        return gasData;
      }
    } catch (error) {
      console.error('Etherscan API error:', error.message);
    }
    return null;
  }

  // Get gas price using Web3 RPC call
  async getGasPriceViaRPC(chain) {
    const cacheKey = `rpc-gas-${chain}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const rpcUrl = PUBLIC_RPC_ENDPOINTS[chain];
      if (!rpcUrl) throw new Error(`No RPC endpoint for ${chain}`);

      // Make eth_gasPrice RPC call
      const response = await axios.post(rpcUrl, {
        jsonrpc: '2.0',
        method: 'eth_gasPrice',
        params: [],
        id: 1
      }, {
        timeout: 2000,
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.data && response.data.result) {
        // Convert hex wei to gwei - PURE RPC VALUE, NO OVERRIDES
        const weiPrice = parseInt(response.data.result, 16);
        const gweiPrice = weiPrice / 1e9;
        
        console.log(`✅ ${chain}:`, gweiPrice.toFixed(6), 'Gwei (100% real RPC)');

        const gasData = {
          safe: gweiPrice * 0.9,  // 10% lower for safe
          proposed: gweiPrice,
          fast: gweiPrice * 1.1,   // 10% higher for fast
          timestamp: Date.now(),
          source: 'rpc-pure'
        };

        this.setCache(cacheKey, gasData);
        return gasData;
      }
    } catch (error) {
      console.error(`RPC error for ${chain}:`, error.message);
    }
    return null;
  }

  // Get gas price for a specific chain
  async getGasPrice(chain) {
    try {
      // For Ethereum, ALWAYS use Etherscan API (most accurate)
      if (chain === 'ethereum') {
        const etherscanData = await this.getEthereumGasFromEtherscan();
        if (etherscanData) return etherscanData;
        console.warn('⚠️ Etherscan failed, falling back to RPC for Ethereum');
      }

      // For all other chains (and Ethereum fallback), use RPC
      const rpcData = await this.getGasPriceViaRPC(chain);
      
      if (!rpcData) {
        console.warn(`❌ ${chain}: RPC returned no data`);
        throw new Error(`Failed to fetch gas price from ${chain}`);
      }
      
      return rpcData;
    } catch (error) {
      console.error(`❌ ${chain} error:`, error.message);
      throw error;
    }
  }

  // Get multiple chains at once with parallel requests
  async getMultiChainGasPrices(chains) {
    // Create promises with individual timeouts
    const promises = chains.map(chain =>
      Promise.race([
        this.getGasPrice(chain)
          .then(data => ({ chain, status: 'fulfilled', data, error: null }))
          .catch(error => ({ chain, status: 'rejected', data: null, error: error.message })),
        new Promise(resolve =>
          setTimeout(() => resolve({
            chain,
            status: 'rejected',
            data: null,
            error: 'Timeout'
          }), 3000)
        )
      ])
    );

    // Wait for all to complete (success or failure)
    return await Promise.all(promises);
  }
}

// Export singleton instance
export const blockscoutApi = new BlockscoutDirectApi();
export default blockscoutApi;
