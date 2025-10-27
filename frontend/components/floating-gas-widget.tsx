"use client"

import { useState } from "react"
import { Flame, X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FloatingGasWidget() {
  const [isExpanded, setIsExpanded] = useState(false)
  const currentGas = 0.148
  const gasLevel = currentGas < 20 ? "low" : currentGas < 50 ? "medium" : "high"
  const gasColor = gasLevel === "low" ? "bg-success" : gasLevel === "medium" ? "bg-warning" : "bg-destructive"
  const iconColor = gasLevel === "low" ? "text-success" : gasLevel === "medium" ? "text-warning" : "text-destructive"

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isExpanded ? (
        <button
          onClick={() => setIsExpanded(true)}
          className={`w-16 h-16 rounded-full ${gasColor} shadow-lg hover:scale-105 transition-transform flex items-center justify-center font-bold text-sm animate-pulse-border`}
        >
          <div className="flex flex-col items-center text-white">
            <Flame className="w-6 h-6 mb-0.5" />
            <span className="text-xs">{currentGas}</span>
          </div>
        </button>
      ) : (
        <div className="w-72 rounded-2xl bg-card border border-border shadow-2xl backdrop-blur-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Flame className={`w-5 h-5 ${iconColor}`} />
              Gas Prices
            </h3>
            <Button variant="ghost" size="icon" onClick={() => setIsExpanded(false)} className="h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Safe</span>
              <span className="font-semibold text-foreground">0.148 Gwei</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Standard</span>
              <span className="font-semibold text-foreground">0.148 Gwei</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <span className="text-sm text-muted-foreground">Fast</span>
              <span className="font-semibold text-foreground">0.163 Gwei</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/20">
            <Check className="w-5 h-5 text-success" />
            <span className="text-sm font-medium text-success">Good time to transact!</span>
          </div>
        </div>
      )}
    </div>
  )
}
