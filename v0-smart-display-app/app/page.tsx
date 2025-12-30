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
    <div className="min-h-screen p-8 bg-background flex flex-col gap-4">
      {/* Header with real-time clock and date */}
      <div className="flex justify-between items-end border-b pb-6">
        <div>
          <h1 className="text-6xl font-black tracking-tighter">{timeString}</h1>
          <p className="text-2xl text-muted-foreground font-medium">{dateString}</p>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
        {/* Left Column: Rotating Photo (Now 1/3 width for portrait photos) */}
        <div className="lg:col-span-1 relative h-[500px]">
          <PhotoWidget />
        </div>

        {/* Right Column: Weather and Calendar (Now 2/3 width, side-by-side) */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="h-[500px]">
            <WeatherWidget />
          </div>
          <div className="h-[500px]">
            <CalendarWidget />
          </div>
        </div>
      </div>

      {/* Bottom Row: Weekly Menu */}
      <div className="h-40">
        <MenuWidget />
      </div>
    </div>
  )
}
