import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Activity, Crown } from 'lucide-react'
import { getGasForecast, getSubscriptionStatus } from '@/api/gasApi'
import PaywallOverlay from './PaywallOverlay'

export function Forecast({ walletAddress }) {
  const [forecast, setForecast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [subscription, setSubscription] = useState(null)

  useEffect(() => {
    const fetchForecast = async () => {
      try {
        const data = await getGasForecast()
        setForecast(data)
      } catch (error) {
        console.error('Failed to fetch forecast:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchForecast()
    const interval = setInterval(fetchForecast, 60000) // Update every minute

    return () => clearInterval(interval)
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

  if (loading) {
    return (
      <div className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!forecast) return null

  // Extract data from forecast object
  const currentPrice = forecast.current?.price || 0
  const next4hrData = forecast.next4hr || {}
  const next4hrPrice = next4hrData.price || 0
  const next4hrChange = next4hrData.change || 0
  const confidence = next4hrData.confidence || 75

  const bestTime = forecast.bestTime || {}
  const bestTimeStart = bestTime.startHour !== undefined ? bestTime.startHour : 2
  const bestTimeEnd = bestTime.endHour !== undefined ? bestTime.endHour : 5
  const potentialSavings = bestTime.potentialSavings || 4

  const recommendation = forecast.recommendation || {}
  const action = recommendation.action || 'NEUTRAL'
  const reason = recommendation.reason || 'Okay to send now'

  const isIncrease = next4hrChange > 0

  const hasSubscription = subscription?.status === 'active' || subscription?.status === 'trialing'

  // Format action text and determine colors
  const actionText = action.replace(/_/g, ' ')
  const actionConfig = {
    'SEND NOW': {
      bg: 'bg-green-500/20',
      border: 'border-green-500/30',
      text: 'text-green-500',
      icon: 'text-green-500'
    },
    'WAIT': {
      bg: 'bg-red-500/20',
      border: 'border-red-500/30',
      text: 'text-red-500',
      icon: 'text-red-500'
    },
    'NEUTRAL': {
      bg: 'bg-muted/50',
      border: 'border-transparent',
      text: 'text-foreground',
      icon: 'text-muted-foreground'
    }
  }
  const currentConfig = actionConfig[actionText] || actionConfig['NEUTRAL']

  return (
    <div className="rounded-2xl bg-card border border-border p-4 md:p-6 backdrop-blur-sm space-y-4 relative">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 md:w-6 md:h-6 text-primary" />
          <h2 className="text-lg md:text-xl font-bold text-foreground">Smart Gas Price Forecast</h2>
        </div>
        {hasSubscription && (
          <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full font-semibold flex items-center gap-1">
            <Crown className="w-3 h-3" />
            PRO
          </span>
        )}
      </div>

      <div className={`grid sm:grid-cols-2 gap-4 transition-all ${!hasSubscription ? 'blur-sm select-none' : ''}`}>
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Next 4 Hours</div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl md:text-2xl font-bold text-foreground whitespace-nowrap">
              {next4hrPrice ? next4hrPrice.toFixed(3) : '0.000'} Gwei
            </span>
            <span className={`flex items-center gap-1 text-sm font-medium ${isIncrease ? 'text-red-500' : 'text-green-500'}`}>
              {isIncrease ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {Math.abs(next4hrChange).toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full"
              style={{ width: `${confidence}%` }}
            />
          </div>
          <div className="text-xs text-muted-foreground">{confidence}% Confidence</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Best Time Today</div>
          <div className="text-lg font-semibold text-foreground">
            {bestTimeStart}:00 - {bestTimeEnd}:00 UTC
          </div>
          <div className="text-sm text-green-500 font-medium">
            Expected savings: {Math.abs(potentialSavings).toFixed(1)}%
          </div>
        </div>
      </div>

      <div className={`flex flex-col sm:flex-row items-center justify-center gap-2 p-3 rounded-lg ${currentConfig.bg} border ${currentConfig.border} transition-all ${!hasSubscription ? 'blur-sm select-none' : ''}`}>
        <div className="flex items-center gap-2">
          <TrendingUp className={`w-5 h-5 ${currentConfig.icon}`} />
          <span className={`font-semibold ${currentConfig.text}`}>{actionText}</span>
        </div>
        <span className="text-sm text-muted-foreground text-center">- {reason}</span>
      </div>

      {!hasSubscription && <PaywallOverlay featureName="Unlock AI-powered gas forecasts to save even more" showButton={true} />}
    </div>
  )
}
