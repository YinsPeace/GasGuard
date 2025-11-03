import { useState, useEffect } from 'react'
import { Flame, X, TrendingDown, TrendingUp, Crown, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCurrentGasPrices, getSubscriptionStatus, getGasForecast } from '@/api/gasApi'

export function FloatingGasWidget({ walletAddress = null }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [gasData, setGasData] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showTooltip, setShowTooltip] = useState(true) // Show tooltip on first load
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prices, forecastData] = await Promise.all([
          getCurrentGasPrices(),
          getGasForecast()
        ])
        setGasData(prices)
        setForecast(forecastData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 30000) // Update every 30s

    // Hide tooltip after 5 seconds
    const tooltipTimer = setTimeout(() => setShowTooltip(false), 5000)

    return () => {
      clearInterval(interval)
      clearTimeout(tooltipTimer)
    }
  }, [])

  useEffect(() => {
    const checkSubscription = async () => {
      if (walletAddress) {
        try {
          const status = await getSubscriptionStatus(walletAddress)
          setSubscription(status)
        } catch (error) {
          console.error('Failed to check subscription:', error)
        }
      }
    }

    checkSubscription()
  }, [walletAddress])

  if (loading || !gasData) {
    return (
      <div className="fixed bottom-8 right-8 w-20 h-20 rounded-full bg-muted animate-pulse z-50" />
    )
  }

  const hasSubscription = subscription?.status === 'active' || subscription?.status === 'trialing'
  const currentPrice = gasData.proposed || gasData.standard || 0
  
  // Use forecast recommendation if available, otherwise fall back to price threshold
  const forecastAction = forecast?.recommendation?.action || 'NEUTRAL'
  let status = 'normal'
  
  if (forecastAction === 'SEND NOW') {
    status = 'cheap'
  } else if (forecastAction === 'WAIT') {
    status = 'expensive'
  } else {
    // Fallback to price-based logic if no forecast
    status = currentPrice < 10 ? 'cheap' : currentPrice < 30 ? 'normal' : 'expensive'
  }

  const statusConfig = {
    cheap: {
      color: 'bg-green-500',
      shadowColor: 'shadow-green-500/50',
      icon: TrendingDown,
      message: 'Great time to transact!',
      textColor: 'text-green-400'
    },
    normal: {
      color: 'bg-yellow-500',
      shadowColor: 'shadow-yellow-500/50',
      icon: Flame,
      message: 'Normal gas prices',
      textColor: 'text-yellow-400'
    },
    expensive: {
      color: 'bg-red-500',
      shadowColor: 'shadow-red-500/50',
      icon: TrendingUp,
      message: 'Wait for better prices',
      textColor: 'text-red-400'
    }
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <>
      {/* Collapsed widget */}
      {!isExpanded && (
        <div
          className="fixed bottom-6 right-4 md:bottom-8 md:right-8 z-50"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          {/* Tooltip - Hidden on mobile to prevent covering content */}
          {showTooltip && (
            <div
              className="hidden md:block absolute bottom-full right-0 mb-2 px-3 py-2 bg-card border border-border rounded-lg whitespace-nowrap animate-fade-in shadow-xl"
              style={{
                animation: 'fadeIn 0.3s ease-out'
              }}
            >
              <div className="text-sm font-semibold text-foreground">{currentPrice.toFixed(3)} Gwei</div>
              {hasSubscription ? (
                <div className={`text-xs ${config.textColor}`}>{config.message}</div>
              ) : (
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Insights with Premium</span>
                </div>
              )}
            </div>
          )}

          {/* Widget button */}
          <button
            onClick={() => setIsExpanded(true)}
            className={`
              w-16 h-16 md:w-20 md:h-20 rounded-full ${config.color} ${config.shadowColor}
              shadow-2xl
              flex flex-col items-center justify-center
              hover:scale-110 transition-transform duration-300
              border-2 border-white/30 dark:border-white/30
              relative
            `}
            style={{
              animation: 'pulseSlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
            }}
          >
            <Flame className="w-6 h-6 md:w-8 md:h-8 text-white mb-0.5 md:mb-1" />
            <span className="text-white text-xs md:text-sm font-bold">
              {currentPrice.toFixed(1)}
            </span>
          </button>
        </div>
      )}

      {/* Expanded widget */}
      {isExpanded && (
        <div
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 bg-card border border-border rounded-2xl p-4 md:p-6 shadow-2xl w-[calc(100vw-2rem)] max-w-sm md:w-80"
          style={{
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className={`w-6 h-6 ${config.textColor}`} />
              <h3 className="text-lg font-bold text-foreground">Gas Prices</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground hover:text-foreground transition-colors h-8 w-8"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Safe</span>
              <span className="font-semibold text-foreground">{(gasData.safe || gasData.low || 0).toFixed(3)} Gwei</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Standard</span>
              <span className="font-semibold text-foreground">{(gasData.proposed || gasData.standard || 0).toFixed(3)} Gwei</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Fast</span>
              <span className="font-semibold text-foreground">{(gasData.fast || gasData.rapid || 0).toFixed(3)} Gwei</span>
            </div>
          </div>

          {hasSubscription ? (
            <div className={`mt-4 p-3 rounded-lg ${config.color}/20 border border-${config.color}/30`}>
              <div className="flex items-center gap-2">
                <StatusIcon className={`w-5 h-5 ${config.textColor}`} />
                <p className={`text-sm ${config.textColor} font-semibold`}>
                  {config.message}
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-primary" />
                <p className="text-sm text-primary font-semibold">
                  Unlock Smart Insights
                </p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Get real-time recommendations and alerts when it's the best time to transact.
              </p>
              <button
                onClick={() => {
                  const subscriptionSection = document.getElementById('subscription')
                  if (subscriptionSection) {
                    const headerOffset = 80
                    const elementPosition = subscriptionSection.getBoundingClientRect().top
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
                    setIsExpanded(false)
                  }
                }}
                className="w-full px-3 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold transition-all"
              >
                Start Free Trial
              </button>
            </div>
          )}
        </div>
      )}

      {/* CSS animations injected as a style tag */}
      <style>{`
        @keyframes pulseSlow {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}
