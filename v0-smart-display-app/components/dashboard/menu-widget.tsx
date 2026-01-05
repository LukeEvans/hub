"use client"

import { Utensils, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useApi } from "@/lib/use-api"
import { parseSafeDate } from "@/lib/utils"

export function MenuWidget() {
  const router = useRouter()
  const { data, isLoading } = useApi<any>('/api/mealie/mealplan')
  const meals = data?.mealPlan?.meals || []

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

  // Group meals by date
  const groupedMeals = sortedMeals.reduce((acc: any, meal: any) => {
    const dateStr = meal.date.split('T')[0]
    if (!acc[dateStr]) acc[dateStr] = []
    acc[dateStr].push(meal)
    return acc
  }, {})

  const dates = Object.keys(groupedMeals).sort()

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
      <Card className="h-full p-4 bg-[var(--widget-pink)] hover:shadow-lg transition-all border-none flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <Utensils className="w-5 h-5 text-foreground/70" />
          <h3 className="font-bold text-foreground">Weekly Menu</h3>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide flex-1">
          {dates.length === 0 ? (
            <div className="text-sm text-foreground/60 italic py-2">No meals planned for this week</div>
          ) : (
            dates.map((dateStr: string) => {
              const date = parseSafeDate(dateStr)
              const dayName = date.toLocaleDateString([], { weekday: 'short' })
              const isToday = dateStr === todayDate
              const mealsForDay = groupedMeals[dateStr]

              return (
                <div key={dateStr} className={`flex flex-col min-w-[160px] p-3 rounded-xl transition-colors ${isToday ? 'bg-white/40 shadow-sm ring-1 ring-white/20' : 'bg-black/5'}`}>
                  <div className="text-[10px] font-bold text-foreground/70 uppercase mb-2 flex justify-between">
                    <span>{isToday ? 'Today' : dayName}</span>
                    <span className="opacity-60">{date.toLocaleDateString([], { month: 'numeric', day: 'numeric' })}</span>
                  </div>
                  <div className="space-y-2">
                    {mealsForDay.map((meal: any, idx: number) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-black/10 flex-shrink-0 shadow-sm">
                          <img 
                            src={`/api/mealie/image/${meal.recipeId}`} 
                            alt={meal.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.jpg'
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-foreground line-clamp-2 leading-tight">
                            {meal.name}
                          </div>
                          <div className="text-[9px] text-foreground/60 uppercase font-medium">
                            {meal.mealType}
                          </div>
                        </div>
                      </div>
                    ))}
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

