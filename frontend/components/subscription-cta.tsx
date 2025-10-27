"use client"

import { Sparkles, Gift, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  "Real-time price alerts",
  "AI-powered predictions",
  "90-day savings tracking",
  "Telegram notifications",
]

export function SubscriptionCTA() {
  return (
    <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-card to-card border border-primary/30 p-6 backdrop-blur-sm space-y-6">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warning/20 text-warning text-xs font-bold">
          <Gift className="w-3.5 h-3.5" />
          14-day free trial
        </div>
        <div className="text-4xl font-bold text-foreground">
          $7.99<span className="text-lg text-muted-foreground">/month</span>
        </div>
      </div>

      <div className="space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
              <Check className="w-3.5 h-3.5 text-success" strokeWidth={3} />
            </div>
            <span className="text-foreground">{feature}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <Button className="w-full h-12 text-base font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
          <Sparkles className="w-5 h-5 mr-2" />
          Start Free Trial
        </Button>
        <p className="text-xs text-center text-muted-foreground">No credit card required</p>
      </div>
    </div>
  )
}
