"use client"

import { Zap, TrendingDown, Moon, Sun, DollarSign, TrendingUp, FileText, Bell, Sparkles, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"

interface HeaderProps {
  theme: "dark" | "light"
  onToggleTheme: () => void
  activeSection?: string
}

export function Header({ theme, onToggleTheme, activeSection }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
      setMobileMenuOpen(false)
    }
  }

  const navItems = [
    { id: "savings", label: "Savings", icon: DollarSign },
    { id: "forecast", label: "Forecast", icon: TrendingUp },
    { id: "transactions", label: "Transactions", icon: FileText },
    { id: "alerts", label: "Alerts", icon: Bell },
    { id: "subscription", label: "Subscription", icon: Sparkles },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border backdrop-blur-md bg-card/80">
      <div className="container mx-auto px-4 h-full flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-3 mr-8">
          <div className="relative flex items-center justify-center w-8 h-8">
            <Zap className="w-6 h-6 text-blue-500 absolute" fill="currentColor" />
            <TrendingDown className="w-4 h-4 text-green-500 absolute translate-x-1 translate-y-1" strokeWidth={3} />
          </div>
          <span className="text-xl font-bold text-foreground">GasGuardAI</span>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`flex items-center gap-2 py-1 text-base font-medium border-b-2 transition-all duration-300 ${
                  isActive
                    ? "text-blue-500 border-blue-500"
                    : "text-muted-foreground border-transparent hover:text-blue-400 hover:border-blue-400/50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block w-px h-6 bg-border" />

          <Button variant="ghost" size="icon" onClick={onToggleTheme} className="rounded-full">
            {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted text-sm font-mono">
            0xd727...9F6b
          </div>

          <Button variant="outline" size="sm" className="hidden sm:inline-flex bg-transparent">
            Disconnect
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden rounded-full"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 border-b border-border backdrop-blur-md bg-card/95 shadow-lg">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2 max-w-7xl">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeSection === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-all duration-300 ${
                    isActive
                      ? "text-blue-500 bg-blue-500/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}
