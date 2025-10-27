"use client"

import { useEffect, useState } from "react"
import { Bell, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SavingsHero() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-primary/10 border border-border p-8 backdrop-blur-sm">
      <div className="relative z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <DollarSign className="w-12 h-12 text-destructive" />
            <div className={`text-6xl font-bold text-destructive ${mounted ? "animate-count-up" : ""}`}>-0.48</div>
          </div>
          <p className="text-lg text-muted-foreground">
            You overpaid <span className="font-semibold text-foreground">93.5%</span> on gas fees
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <div className="px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm text-sm font-medium">3 Transactions</div>
          <div className="px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm text-sm font-medium">
            0 Optimal Timings
          </div>
          <div className="px-4 py-2 rounded-full bg-muted/50 backdrop-blur-sm text-sm font-medium">Last 90 Days</div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Optimal</span>
            <span className="font-semibold text-success">$0.03</span>
          </div>
          <div className="relative h-8 rounded-full bg-muted overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-[6%] bg-gradient-to-r from-success to-success/80 rounded-full" />
            <div className="absolute inset-y-0 left-0 w-full flex items-center justify-end pr-3">
              <span className="text-xs font-medium text-foreground">Actually Paid: $0.51</span>
            </div>
          </div>
        </div>

        <Button className="w-full h-12 text-base font-semibold" size="lg">
          <Bell className="w-5 h-5 mr-2" />
          Get Alerts to Save 90%
        </Button>
      </div>
    </div>
  )
}
