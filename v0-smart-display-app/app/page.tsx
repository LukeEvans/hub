"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { WeatherWidget } from "@/components/dashboard/weather-widget"
import { CalendarWidget } from "@/components/dashboard/calendar-widget"
import { MenuWidget } from "@/components/dashboard/menu-widget"
import { SportsWidget } from "@/components/dashboard/sports-widget"
import { useApi } from "@/lib/use-api"
import { parseSafeDate, cn } from "@/lib/utils"
import { Cake, PartyPopper } from "lucide-react"
import { useOrientation } from "@/lib/orientation-context"

export default function DashboardPage() {
  const router = useRouter()
  const { orientation } = useOrientation()
  const [currentTime, setCurrentTime] = useState(new Date())
  const { data: calendarData } = useApi<any>('/api/calendar/events')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const timeString = currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

  const todaysBirthdays = calendarData?.events?.filter((event: any) => {
    const start = parseSafeDate(event.start)
    const today = new Date()
    return start.toDateString() === today.toDateString() && 
           event.summary?.toLowerCase().includes('birthday')
  }) || []

  return (
    <div className={cn(
      "min-h-screen bg-background flex flex-col gap-4 transition-all duration-300",
      orientation === 'landscape' ? "p-8" : "p-4 pb-24"
    )}>
      {/* Header with real-time clock and date */}
      <div className="flex flex-col border-b pb-6 gap-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className={cn(
              "font-black tracking-tighter transition-all duration-300",
              orientation === 'landscape' ? "text-8xl" : "text-6xl"
            )}>{timeString}</h1>
            <p className={cn(
              "text-muted-foreground font-medium transition-all duration-300",
              orientation === 'landscape' ? "text-3xl" : "text-xl"
            )}>{dateString}</p>
          </div>
        </div>

        {todaysBirthdays.length > 0 && (
          <div className="flex items-center gap-4 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/20 p-4 rounded-2xl border border-pink-500/30 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="w-12 h-12 rounded-full bg-pink-500 flex items-center justify-center shadow-lg shadow-pink-500/20 animate-bounce">
              <Cake className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-pink-700 dark:text-pink-300 flex items-center gap-2">
                Happy Birthday! <PartyPopper className="w-5 h-5" />
              </h2>
              <p className="text-pink-600/80 dark:text-pink-400/80 font-medium">
                Celebrating: {todaysBirthdays.map((b: any) => b.summary.replace(/birthday/i, '').trim()).join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main Dashboard Grid */}
      <div className={cn(
        "grid gap-8 overflow-hidden",
        orientation === 'landscape' ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
      )}>
        {/* Left/Top Column: Weather */}
        <div className={cn(
          orientation === 'landscape' ? "lg:col-span-1 h-[600px]" : "h-auto min-h-[300px]"
        )}>
          <WeatherWidget />
        </div>

        {/* Right/Middle Column: Calendar */}
        <div className={cn(
          orientation === 'landscape' ? "lg:col-span-2 h-[600px]" : "h-auto min-h-[400px]"
        )}>
          <CalendarWidget />
        </div>
      </div>

      {/* Bottom Row: Nuggets Schedule and Weekly Menu */}
      <div className={cn(
        "grid gap-8",
        orientation === 'landscape' ? "grid-cols-1 md:grid-cols-4 h-40" : "grid-cols-1 h-auto"
      )}>
        <div className={cn(
          orientation === 'landscape' ? "md:col-span-1" : "h-auto"
        )}>
          <SportsWidget />
        </div>
        <div className={cn(
          orientation === 'landscape' ? "md:col-span-3" : "h-auto"
        )}>
          <MenuWidget />
        </div>
      </div>
    </div>
  )
}
