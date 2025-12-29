"use client"

import { useState, useEffect } from "react"
import { PhotoWidget } from "@/components/dashboard/photo-widget"
import { WeatherWidget } from "@/components/dashboard/weather-widget"
import { CalendarWidget } from "@/components/dashboard/calendar-widget"
import { MenuWidget } from "@/components/dashboard/menu-widget"

export default function DashboardPage() {
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const timeString = currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
  const dateString = currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="min-h-screen p-8 bg-background flex flex-col gap-8">
      {/* Header with real-time clock and date */}
      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-6xl font-black tracking-tighter">{timeString}</h1>
          <p className="text-2xl text-muted-foreground font-medium">{dateString}</p>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
        {/* Left Column: Rotating Photo (2/3 width on large screens) */}
        <div className="lg:col-span-2 relative h-[500px]">
          <PhotoWidget />
        </div>

        {/* Right Column: Weather and Calendar */}
        <div className="flex flex-col gap-8">
          <div className="flex-1 min-h-[280px]">
            <WeatherWidget />
          </div>
          <div className="flex-1 min-h-[280px]">
            <CalendarWidget />
          </div>
        </div>
      </div>

      {/* Bottom Row: Weekly Menu */}
      <div className="h-48">
        <MenuWidget />
      </div>
    </div>
  )
}
