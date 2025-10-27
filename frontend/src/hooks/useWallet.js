import { useState, useEffect } from 'react';

export function useWallet() {
  const [wallet, setWallet] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  // Connect wallet
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      setError('install_metamask');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setWallet(accounts[0]);
        localStorage.setItem('connectedWallet', accounts[0]);
        setError(null); // Clear any errors
      }
    } catch (err) {
      setError(err.message);
      console.error('Failed to connect wallet:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setWallet(null);
    localStorage.removeItem('connectedWallet');
  };

  // Auto-reconnect on page load if previously connected
  useEffect(() => {
    const savedWallet = localStorage.getItem('connectedWallet');
    if (savedWallet && isMetaMaskInstalled()) {
      window.ethereum
        .request({ method: 'eth_accounts' })
        .then(accounts => {
          if (accounts.includes(savedWallet)) {
            setWallet(savedWallet);
          }
        })
        .catch(console.error);
    }
  }, []);

  // Listen for account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setWallet(accounts[0]);
        localStorage.setItem('connectedWallet', accounts[0]);
      } else {
        disconnectWallet();
      }
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  // Clear error
  const clearError = () => {
    setError(null);
  };

  return {
    wallet,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    clearError,
    isMetaMaskInstalled: isMetaMaskInstalled()
  };
}
