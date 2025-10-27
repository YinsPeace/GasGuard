import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, Loader2 } from 'lucide-react'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function Success() {
  const [status, setStatus] = useState('verifying') // verifying, success, error
  const [message, setMessage] = useState('Verifying your subscription...')
  const navigate = useNavigate()

  useEffect(() => {
    const verifySubscription = async () => {
      // Get session_id from URL
      const urlParams = new URLSearchParams(window.location.search)
      const sessionId = urlParams.get('session_id')

      if (!sessionId) {
        setStatus('error')
        setMessage('No session ID found. Please contact support.')
        return
      }

      try {
        console.log('🔍 Verifying Stripe session:', sessionId)

        // Call backend to verify and activate subscription
        const response = await axios.post(`${API_URL}/api/stripe/verify-session`, {
          sessionId
        })

        console.log('✅ Verification response:', response.data)

        if (response.data.success) {
          setStatus('success')
          setMessage(response.data.data.message || 'Subscription activated successfully!')

          // Redirect to home after 3 seconds
          setTimeout(() => {
            navigate('/')
            // Force reload to fetch new subscription status
            window.location.reload()
          }, 3000)
        } else {
          setStatus('error')
          setMessage(response.data.error || 'Failed to activate subscription')
        }
      } catch (error) {
        console.error('❌ Verification error:', error)
        setStatus('error')
        setMessage(error.response?.data?.error || 'Failed to verify subscription')
      }
    }

    verifySubscription()
  }, [navigate])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="rounded-2xl bg-card border border-border p-8 backdrop-blur-sm text-center space-y-6">
          {status === 'verifying' && (
            <>
              <Loader2 className="w-16 h-16 mx-auto animate-spin text-primary" />
              <h1 className="text-2xl font-bold text-foreground">Verifying Subscription</h1>
              <p className="text-muted-foreground">{message}</p>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-green-500" />
              <h1 className="text-2xl font-bold text-foreground">🎉 Welcome to GasGuard Pro!</h1>
              <p className="text-muted-foreground">{message}</p>
              <div className="mt-4 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                <p className="text-sm text-green-500 font-medium">
                  Redirecting you to the dashboard...
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
                <span className="text-3xl">❌</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Verification Failed</h1>
              <p className="text-muted-foreground">{message}</p>
              <button
                onClick={() => navigate('/')}
                className="mt-4 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition"
              >
                Return to Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
