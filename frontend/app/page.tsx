"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/header"
import { SavingsHero } from "@/components/savings-hero"
import { FloatingGasWidget } from "@/components/floating-gas-widget"
import { AIForecast } from "@/components/ai-forecast"
import { TransactionList } from "@/components/transaction-list"
import { SettingsCard } from "@/components/settings-card"
import { SubscriptionCTA } from "@/components/subscription-cta"
import { MobileNav } from "@/components/mobile-nav"

export default function DashboardPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark")
  const [activeSection, setActiveSection] = useState<string>("savings")

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null
    if (savedTheme) {
      setTheme(savedTheme)
      document.documentElement.classList.remove("dark", "light")
      document.documentElement.classList.add(savedTheme)
    } else {
      document.documentElement.classList.add("dark")
    }
  }, [])

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-100px 0px -66% 0px",
      threshold: 0,
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)

    const sections = ["savings", "forecast", "transactions", "alerts", "subscription"]
    sections.forEach((id) => {
      const element = document.getElementById(id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.remove("dark", "light")
    document.documentElement.classList.add(newTheme)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header theme={theme} onToggleTheme={toggleTheme} activeSection={activeSection} />

      <main className="container mx-auto px-4 pt-24 pb-32 space-y-8 max-w-7xl">
        <div id="savings">
          <SavingsHero />
        </div>

        <div id="forecast">
          <AIForecast />
        </div>

        <div id="transactions">
          <TransactionList />
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div id="alerts">
            <SettingsCard />
          </div>
          <div id="subscription">
            <SubscriptionCTA />
          </div>
        </div>
      </main>

      <FloatingGasWidget />

      <MobileNav activeSection={activeSection} />
    </div>
  )
}
