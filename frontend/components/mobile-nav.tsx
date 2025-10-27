"use client"

import { TrendingUp, Activity, FileText, Settings, Gift } from "lucide-react"

interface MobileNavProps {
  activeSection: string
}

export function MobileNav({ activeSection }: MobileNavProps) {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerOffset = 80
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }

  const navItems = [
    { id: "savings", label: "Savings", icon: TrendingUp },
    { id: "forecast", label: "Forecast", icon: Activity },
    { id: "transactions", label: "Txns", icon: FileText },
    { id: "alerts", label: "Alerts", icon: Settings },
    { id: "subscription", label: "Pro", icon: Gift },
  ]

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border backdrop-blur-md bg-card/95">
      <div className="h-full flex items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive ? "text-blue-500" : "text-muted-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "fill-blue-500/20" : ""}`} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
