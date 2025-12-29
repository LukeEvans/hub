"use client"

import { Utensils, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import Link from "next/link"

export function MenuWidget() {
  const [meals, setMeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMealPlan() {
      try {
        const res = await fetch('/api/mealie/mealplan')
        if (res.ok) {
          const data = await res.json()
          setMeals(data.mealPlan?.meals || [])
        }
      } catch (err) {
        console.error('Failed to fetch meal plan', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMealPlan()
  }, [])

  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center bg-[var(--widget-pink)]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/50" />
      </Card>
    )
  }

  // Group meals by day if needed, or just show them in order
  const sortedMeals = [...meals].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <Link href="/recipes" className="block h-full">
      <Card className="h-full p-4 bg-[var(--widget-pink)] hover:shadow-lg transition-all border-none flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Utensils className="w-5 h-5 text-foreground/70" />
          <h3 className="font-bold text-foreground">Weekly Menu</h3>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {sortedMeals.length === 0 ? (
            <div className="text-sm text-foreground/60 italic py-2">No meals planned</div>
          ) : (
            sortedMeals.map((meal, i) => {
              const date = new Date(meal.date)
              const dayName = date.toLocaleDateString([], { weekday: 'short' })
              const isToday = new Date().toDateString() === date.toDateString()

              return (
                <div key={i} className={`flex flex-col min-w-[120px] p-2 rounded-xl transition-colors ${isToday ? 'bg-white/20' : 'bg-black/5'}`}>
                  <div className="text-[10px] font-bold text-foreground/70 uppercase mb-1">
                    {isToday ? 'Today' : dayName}
                  </div>
                  <div className="text-xs font-semibold text-foreground line-clamp-2 leading-tight">
                    {meal.name}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </Card>
    </Link>
  )
}

