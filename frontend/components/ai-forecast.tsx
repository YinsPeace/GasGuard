"use client"

import { TrendingDown, TrendingUp, Activity } from "lucide-react"

export function AIForecast() {
  return (
    <div className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">AI Gas Price Forecast</h2>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Next 4 Hours</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-foreground">0.134 Gwei</span>
            <span className="flex items-center gap-1 text-success text-sm font-medium">
              <TrendingDown className="w-4 h-4" />
              -3.6%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full w-[75%] bg-gradient-to-r from-primary to-primary/60 rounded-full" />
          </div>
          <div className="text-xs text-muted-foreground">75% Confidence</div>
        </div>

        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Best Time Today</div>
          <div className="text-lg font-semibold text-foreground">9:00 AM - 12:00 PM UTC</div>
          <div className="text-sm text-success font-medium">Expected savings: 4%</div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-muted/50">
        <TrendingUp className="w-5 h-5 text-muted-foreground" />
        <span className="font-semibold text-foreground">NEUTRAL</span>
        <span className="text-sm text-muted-foreground">- Okay to send now</span>
      </div>
    </div>
  )
}
