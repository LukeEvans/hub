"use client"

import { Utensils, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useApi } from "@/lib/use-api"
import { parseSafeDate } from "@/lib/utils"

export function MenuWidget() {
  const router = useRouter()
  const { data, isLoading } = useApi<any>('/api/mealplan')
  const meals = data?.meals || []

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center bg-[var(--widget-pink)]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/50" />
      </Card>
    )
  }

  // Find today's date
  const todayDate = new Date().toISOString().split('T')[0]
  
  // Sort meals by date
  const sortedMeals = [...meals].sort((a, b) => {
    const dateA = parseSafeDate(a.date).getTime()
    const dateB = parseSafeDate(b.date).getTime()
    return dateA - dateB
  })

  // Get next 7 days starting from today
  const next7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() + i)
    return d.toISOString().split('T')[0]
  })

  // Group meals by date
  const groupedMeals = meals.reduce((acc: any, meal: any) => {
    const dateStr = meal.date.split('T')[0]
    if (!acc[dateStr]) acc[dateStr] = []
    acc[dateStr].push(meal)
    return acc
  }, {})

  return (
    <Link 
      href="/recipes" 
      prefetch={false}
      className="block h-full active:scale-[0.98] transition-transform"
      draggable={false}
      onClick={(e) => {
        e.preventDefault()
        router.push('/recipes')
      }}
    >
      <Card className="h-full p-6 bg-[var(--widget-pink)] hover:shadow-lg transition-all border-none flex flex-col">
        <div className="flex items-center gap-3 mb-4">
          <Utensils className="w-7 h-7 text-foreground/70" />
          <h3 className="text-2xl font-bold text-foreground">Weekly Menu</h3>
        </div>
        
        <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide flex-1">
          {next7Days.map((dateStr: string) => {
            const date = parseSafeDate(dateStr)
            const dayName = date.toLocaleDateString([], { weekday: 'short' })
            const isToday = dateStr === todayDate
            const mealsForDay = groupedMeals[dateStr] || []

            return (
              <div key={dateStr} className={`flex flex-col min-w-[200px] p-4 rounded-2xl transition-colors ${isToday ? 'bg-white/40 shadow-md ring-2 ring-white/20' : 'bg-black/5'}`}>
                <div className="text-xs font-bold text-foreground/70 uppercase mb-3 flex justify-between tracking-wider">
                  <span>{isToday ? 'Today' : dayName}</span>
                  <span className="opacity-60">{date.toLocaleDateString([], { month: 'numeric', day: 'numeric' })}</span>
                </div>
                <div className="space-y-4 flex-1">
                  {mealsForDay.length === 0 ? (
                    <div className="text-xs text-foreground/40 italic py-4">No meals</div>
                  ) : (
                    mealsForDay.map((meal: any, idx: number) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-black/10 flex-shrink-0 shadow-md">
                          <img 
                            src={meal.imageUrl || '/placeholder.jpg'} 
                            alt={meal.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.jpg'
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-foreground line-clamp-2 leading-tight mb-1">
                            {meal.name}
                          </div>
                          <div className="text-[10px] text-foreground/60 uppercase font-bold tracking-tight">
                            {meal.mealType}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </Link>
  )
}

