import { useState, useEffect } from 'react'
import axios from 'axios'
import { useWallet } from '@/hooks/useWallet'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';
import { Header } from '@/components/header'
import { SavingsHero } from '@/components/savings-hero'
import { Forecast } from '@/components/forecast'
import { SubscriptionCTA } from '@/components/subscription-cta'
import { FloatingGasWidget } from '@/components/floating-gas-widget'
import Footer from '@/components/Footer'
import LandingPage from '@/components/LandingPage'
import TrialExpiredPaywall from '@/components/TrialExpiredPaywall'
import { CheckCircle, Loader2 } from 'lucide-react'
import { getSubscriptionStatus } from '@/api/gasApi'
import { MultiChainGasDisplay } from '@/components/multi-chain-gas-display'
import { PredictionLeague } from '@/components/prediction-league'

export default function App() {
  const { wallet, connectWallet, disconnectWallet, isMetaMaskInstalled, error, clearError } = useWallet()
  const [theme, setTheme] = useState('dark')
  const [activeSection, setActiveSection] = useState('multichain') // Start with multichain active
  const [debugWallet, setDebugWallet] = useState('')
  const [showDebugInput, setShowDebugInput] = useState(false)
  const [verifyingSubscription, setVerifyingSubscription] = useState(false)
  const [subscriptionVerified, setSubscriptionVerified] = useState(false)
  const [subscriptionStatus, setSubscriptionStatus] = useState(null)
  const [checkingSubscription, setCheckingSubscription] = useState(true)
  const [selectedChains, setSelectedChains] = useState(['ethereum', 'bsc', 'polygon', 'arbitrum', 'optimism', 'base'])

  // Check for Stripe redirect (session_id in URL)
  useEffect(() => {
    const verifyStripeSession = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const sessionId = urlParams.get('session_id')

      if (sessionId) {
        console.log('🔍 Stripe session detected:', sessionId)
        setVerifyingSubscription(true)

        try {
          const response = await axios.post(`${API_URL}/api/stripe/verify-session`, {
            sessionId
          })

          console.log('✅ Subscription verified:', response.data)
          setSubscriptionVerified(true)

          // Remove session_id from URL
          window.history.replaceState({}, document.title, '/')

          // Show success message for 3 seconds, then reload
          setTimeout(() => {
            window.location.reload()
          }, 3000)
        } catch (error) {
          console.error('❌ Subscription verification failed:', error)
          setVerifyingSubscription(false)
        }
      }
    }

    verifyStripeSession()
  }, [])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Setup intersection observer for sections
  useEffect(() => {
    const handleScroll = () => {
      const sections = ['multichain', 'prediction-league', 'savings', 'forecast', 'subscription']
      
      // Find which section is currently in view
      for (const sectionId of sections) {
        const element = document.getElementById(sectionId)
        if (element) {
          const rect = element.getBoundingClientRect()
          // Check if section is in viewport (top 30% of screen)
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(sectionId)
            break
          }
        }
      }
    }

    // Initial check
    handleScroll()
    
    // Listen to scroll events
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const activeWallet = debugWallet || wallet

  // Check subscription status when wallet is connected
  useEffect(() => {
    const checkSubscription = async () => {
      if (activeWallet) {
        setCheckingSubscription(true)
        try {
          const status = await getSubscriptionStatus(activeWallet)
          setSubscriptionStatus(status)
        } catch (error) {
          console.error('Failed to check subscription:', error)
        } finally {
          setCheckingSubscription(false)
        }
      } else {
        setSubscriptionStatus(null)
        setCheckingSubscription(false)
      }
    }

    checkSubscription()
  }, [activeWallet])

  // Show subscription verification overlay
  if (verifyingSubscription || subscriptionVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="rounded-2xl bg-card border border-border p-8 backdrop-blur-sm text-center space-y-6">
            {verifyingSubscription && !subscriptionVerified && (
              <>
                <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
                <h1 className="text-2xl font-bold text-foreground">Activating Your Subscription</h1>
                <p className="text-muted-foreground">Verifying your payment with Stripe...</p>
              </>
            )}

            {subscriptionVerified && (
              <>
                <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
                <h1 className="text-2xl font-bold text-foreground">🎉 Welcome to GasGuard Pro!</h1>
                <p className="text-muted-foreground">Your 14-day free trial has started!</p>
                <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <p className="text-sm text-green-500 font-medium">
                    Redirecting to your dashboard...
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Check if trial has expired (has used trial but not subscribed)
  const hasTrialExpired = subscriptionStatus && 
    !subscriptionStatus.isSubscribed && 
    subscriptionStatus.hasHadTrial

  // If wallet not connected OR MetaMask not installed, show landing page
  if (!wallet && !debugWallet) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          walletAddress={null}
          onConnect={connectWallet}
          onDisconnect={disconnectWallet}
          theme={theme}
          onToggleTheme={toggleTheme}
          activeSection={activeSection}
        />
        <LandingPage onConnectWallet={connectWallet} />
        <Footer />
        <FloatingGasWidget walletAddress={null} />
        
        {/* MetaMask Install Prompt */}
        {error === 'install_metamask' && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-2xl p-8 max-w-md w-full space-y-6 shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">MetaMask Required</h2>
                <p className="text-muted-foreground mb-6">
                  Please install MetaMask to connect your wallet and start tracking your gas savings.
                </p>
                <div className="space-y-3">
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-semibold"
                  >
                    Install MetaMask
                  </a>
                  <button
                    onClick={clearError}
                    className="block w-full px-6 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Other Errors */}
        {error && error !== 'install_metamask' && (
          <div className="fixed bottom-4 right-4 p-4 bg-destructive text-destructive-foreground rounded-lg shadow-lg max-w-sm">
            {error}
          </div>
        )}

        {/* Debug Mode (Development only) */}
        {import.meta.env.DEV && (
          <button
            onClick={() => setShowDebugInput(!showDebugInput)}
            className="fixed bottom-4 left-4 w-8 h-8 text-xs text-muted-foreground hover:text-foreground opacity-20 hover:opacity-100 transition-opacity"
            title="Debug Mode"
          >
            🐛
          </button>
        )}

        {showDebugInput && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Debug Mode</h3>
                <button
                  onClick={() => setShowDebugInput(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter wallet address (0x...)"
                value={debugWallet}
                onChange={(e) => setDebugWallet(e.target.value)}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground text-sm font-mono"
              />
              <button
                onClick={() => {
                  if (debugWallet.match(/^0x[a-fA-F0-9]{40}$/)) {
                    setShowDebugInput(false)
                  } else {
                    alert('Invalid Ethereum address')
                  }
                }}
                disabled={!debugWallet.match(/^0x[a-fA-F0-9]{40}$/)}
                className="w-full px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground rounded-lg transition-colors disabled:cursor-not-allowed text-sm"
              >
                Load Test Wallet
              </button>
              <p className="text-xs text-muted-foreground">
                Try: 0x28C6c06298d514Db089934071355E5743bf21d60
              </p>
            </div>
          </div>
        )}
      </div>
    )
  }

  const handleDisconnect = () => {
    if (debugWallet) {
      setDebugWallet('')
    } else {
      disconnectWallet()
    }
  }

  // If trial has expired, show paywall
  if (hasTrialExpired) {
    return <TrialExpiredPaywall walletAddress={activeWallet} onDisconnect={handleDisconnect} />
  }

  return (
    <div className={`min-h-screen bg-background ${theme === 'dark' ? 'dark' : ''}`}>
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        activeSection={activeSection}
        walletAddress={activeWallet}
        onDisconnect={handleDisconnect}
      />

      <main className="container mx-auto px-4 pt-24 pb-32 space-y-8 max-w-7xl">
        {debugWallet && (
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-lg p-3 text-center">
            <p className="text-sm text-amber-400">
              🔧 Debug Mode Active - Testing with wallet: {debugWallet.slice(0, 10)}...{debugWallet.slice(-8)}
            </p>
          </div>
        )}

        <section id="multichain" className="mb-8">
          <MultiChainGasDisplay 
            selectedChains={selectedChains} 
            onChainsChange={setSelectedChains}
          />
        </section>

        <section id="prediction-league" className="mb-8">
          <PredictionLeague walletAddress={activeWallet} />
        </section>

        <section id="savings">
          <SavingsHero walletAddress={activeWallet} />
        </section>

        <section id="forecast">
          <Forecast walletAddress={activeWallet} />
        </section>

        <section id="subscription">
          <SubscriptionCTA walletAddress={activeWallet} />
        </section>
      </main>

      <Footer />
      <FloatingGasWidget walletAddress={activeWallet} />
    </div>
  )
}
