"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Settings, Send } from "lucide-react"

const presets = [
  { label: "Super Cheap", price: "$1.50" },
  { label: "Cheap", price: "$3.00" },
  { label: "Normal", price: "$5.00" },
  { label: "Fast", price: "$8.00" },
]

export function SettingsCard() {
  const [selected, setSelected] = useState(1)
  const [telegramConnected, setTelegramConnected] = useState(true)

  return (
    <div className="rounded-2xl bg-card border border-border p-6 backdrop-blur-sm space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Alert Settings</h2>
      </div>

      <div className="p-4 rounded-xl border-2 border-border bg-muted/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5" style={{ color: telegramConnected ? "#0088cc" : undefined }} />
            <span className="text-base font-semibold text-foreground">Telegram Notifications</span>
          </div>
          <div
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
              telegramConnected ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
            }`}
          >
            {telegramConnected ? "Connected" : "Not Connected"}
          </div>
        </div>

        {telegramConnected ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">@GasGuardBot</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTelegramConnected(false)}
                className="bg-transparent text-xs"
              >
                Disconnect
              </Button>
              <Button variant="outline" size="sm" className="bg-transparent text-xs">
                Test Alert
              </Button>
            </div>
          </div>
        ) : (
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Connect Telegram</Button>
        )}
      </div>

      <div>
        <div className="text-sm text-muted-foreground mb-3">Gas Threshold</div>
        <div className="grid grid-cols-2 gap-3">
          {presets.map((preset, index) => (
            <button
              key={index}
              onClick={() => setSelected(index)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selected === index ? "border-primary bg-primary/10" : "border-border bg-muted/30 hover:bg-muted/50"
              }`}
            >
              <div className="font-semibold text-foreground text-sm">{preset.label}</div>
              <div className="text-lg font-bold text-foreground mt-1">{preset.price}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
