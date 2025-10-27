import { useState } from 'react';

// Chain configuration
const CHAINS = [
  { id: 'ethereum', name: 'Ethereum', icon: '⟠', color: '#627EEA', popular: true },
  { id: 'bsc', name: 'BNB Chain', icon: '🔶', color: '#F0B90B', popular: true },
  { id: 'polygon', name: 'Polygon', icon: '💜', color: '#8247E5', popular: true },
  { id: 'arbitrum', name: 'Arbitrum', icon: '🔵', color: '#28A0F0', popular: true },
  { id: 'optimism', name: 'Optimism', icon: '🔴', color: '#FF0420', popular: false },
  { id: 'base', name: 'Base', icon: '🔷', color: '#0052FF', popular: true },
  { id: 'avalanche', name: 'Avalanche', icon: '🔺', color: '#E84142', popular: false },
  { id: 'gnosis', name: 'Gnosis', icon: '🦉', color: '#04795B', popular: false },
];

export function ChainSelector({ selectedChain, onChainSelect, showAll = false }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Show popular chains by default, all chains when expanded
  const visibleChains = showAll || isExpanded 
    ? CHAINS 
    : CHAINS.filter(c => c.popular);
  
  const selected = CHAINS.find(c => c.id === selectedChain) || CHAINS[0];
  
  return (
    <div className="space-y-4">
      {/* Selected Chain Display */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Analyzing on</span>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10"
               style={{ borderColor: selected.color, borderWidth: '2px' }}>
            <span className="text-lg">{selected.icon}</span>
            <span className="font-semibold text-foreground">{selected.name}</span>
          </div>
        </div>
        
        {!showAll && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {isExpanded ? 'Show Less' : 'More Chains'}
          </button>
        )}
      </div>
      
      {/* Chain Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {visibleChains.map((chain) => (
          <button
            key={chain.id}
            onClick={() => onChainSelect(chain.id)}
            className={`
              relative group p-3 rounded-xl transition-all duration-200
              ${selectedChain === chain.id 
                ? 'bg-primary/10 border-2 shadow-lg scale-105' 
                : 'bg-card border-2 border-border hover:border-muted-foreground hover:shadow-md'
              }
            `}
            style={{
              borderColor: selectedChain === chain.id ? chain.color : undefined
            }}
          >
            {/* Popular badge */}
            {chain.popular && selectedChain !== chain.id && (
              <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full bg-primary/20 border border-primary/30">
                <span className="text-xs text-primary font-semibold">Popular</span>
              </div>
            )}
            
            {/* Chain content */}
            <div className="flex flex-col items-center gap-2">
              <span className="text-2xl">{chain.icon}</span>
              <span className={`text-sm font-medium ${
                selectedChain === chain.id ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
              }`}>
                {chain.name}
              </span>
            </div>
            
            {/* Selected indicator */}
            {selectedChain === chain.id && (
              <div className="absolute inset-0 rounded-xl pointer-events-none"
                   style={{
                     background: `radial-gradient(circle at center, ${chain.color}15 0%, transparent 70%)`
                   }}>
              </div>
            )}
          </button>
        ))}
      </div>
      
      {/* Chain Stats */}
      {selectedChain && (
        <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-muted/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Avg Gas</p>
            <p className="text-lg font-bold text-foreground">
              {getChainAvgGas(selectedChain)} Gwei
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Block Time</p>
            <p className="text-lg font-bold text-foreground">
              {getChainBlockTime(selectedChain)}s
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">Status</p>
            <p className="text-lg font-bold text-green-500">Active</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Helper functions
function getChainAvgGas(chainId) {
  const avgGas = {
    ethereum: 30,
    bsc: 3,
    polygon: 50,
    arbitrum: 0.1,
    optimism: 0.001,
    base: 0.001,
    avalanche: 25,
    gnosis: 2,
  };
  return avgGas[chainId] || 30;
}

function getChainBlockTime(chainId) {
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
  return blockTimes[chainId] || 12;
}
