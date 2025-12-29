"use client"

import { Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { format, startOfWeek, addDays, isSameDay, parseISO } from "date-fns"

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
}

export default function CalendarPage() {
  const [view, setView] = useState("Week")
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentTemp, setCurrentTemp] = useState<number | null>(null)
  
  const today = new Date()
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }) // Start week on Monday

  useEffect(() => {
    async function fetchCalendarData() {
      try {
        const [eventsRes, weatherRes] = await Promise.all([
          fetch('/api/calendar/events'),
          fetch('/api/weather')
        ])

        if (eventsRes.ok) {
          const data = await eventsRes.json()
          setEvents(data.events || [])
        }

        if (weatherRes.ok) {
          const weatherData = await weatherRes.json()
          setCurrentTemp(Math.round(weatherData.current?.temp))
        }
      } catch (err) {
        console.error('Failed to fetch calendar data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCalendarData()
  }, [])

  const currentTime = format(today, "h:mm a")
  const currentMonthYear = format(today, "MMMM yyyy")

  // Group events by day (yyyy-MM-dd)
  const eventsByDay: Record<string, CalendarEvent[]> = {}
  events.forEach(event => {
    const dateStr = format(parseISO(event.start), 'yyyy-MM-dd')
    if (!eventsByDay[dateStr]) eventsByDay[dateStr] = []
    eventsByDay[dateStr].push(event)
  })

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(weekStart, i)
    const dateStr = format(date, 'yyyy-MM-dd')
    return {
      name: format(date, 'EEE'),
      date: format(date, 'd'),
      dateStr,
      isToday: isSameDay(date, today),
      events: eventsByDay[dateStr] || []
    }
  })

  return (
    <div className="min-h-screen p-8 bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <Calendar className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Evans Family</h1>
              <p className="text-muted-foreground text-lg">
                {currentTime} • {currentTemp !== null ? `${currentTemp}°` : "--°"} • {currentMonthYear}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-muted rounded-lg p-1 mr-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className={`px-3 h-8 rounded-md ${view === "Day" ? "bg-background shadow-sm" : ""}`}
                onClick={() => setView("Day")}
              >
                Day
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`px-3 h-8 rounded-md ${view === "Week" ? "bg-background shadow-sm" : ""}`}
                onClick={() => setView("Week")}
              >
                Week
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className={`px-3 h-8 rounded-md ${view === "Month" ? "bg-background shadow-sm" : ""}`}
                onClick={() => setView("Month")}
              >
                Month
              </Button>
            </div>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium">Today</span>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="p-6">
          {/* Week Days Header */}
          <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-4 mb-4">
            <div className="text-sm font-medium text-muted-foreground">Time</div>
            {weekDays.map((day) => (
              <div key={day.dateStr} className="text-center">
                <div className="text-2xl font-bold mb-1">
                  {day.name} <span className={day.isToday ? "text-primary" : ""}>{day.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid Scrollable Area */}
          <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-[100px_repeat(7,1fr)] gap-4 relative">
              {/* Time Labels */}
              <div className="relative">
                {Array.from({ length: 16 }).map((_, i) => {
                  const hour = 7 + i
                  const ampm = hour >= 12 ? "PM" : "AM"
                  const displayHour = hour > 12 ? hour - 12 : hour
                  return (
                    <div key={hour} className="text-sm text-muted-foreground font-medium h-24 flex items-start pt-0">
                      {displayHour} {ampm}
                    </div>
                  )
                })}
              </div>

              {/* Day Columns */}
              {weekDays.map((day) => (
                <div key={day.dateStr} className="relative min-h-[1536px] border-l border-border">
                  {/* Hour horizontal lines */}
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="absolute w-full border-t border-border/50" 
                      style={{ top: `${i * 96}px` }}
                    />
                  ))}
                  
                  {day.events.map((event) => {
                    const startDate = parseISO(event.start)
                    const endDate = parseISO(event.end)
                    const startHour = startDate.getHours()
                    const startMinutes = startDate.getMinutes()
                    
                    // Only show if it overlaps with our 7 AM - 10 PM range
                    if (startHour < 7 || startHour >= 23) return null

                    const hourHeight = 96 // Matching h-24 (24 * 4 = 96px)
                    const top = (startHour - 7) * hourHeight + (startMinutes / 60) * hourHeight
                    
                    const durationMs = endDate.getTime() - startDate.getTime()
                    const height = Math.max((durationMs / (1000 * 60 * 60)) * hourHeight, 40) // Min height 40px
                    
                    return (
                      <div 
                        key={event.id} 
                        className="absolute left-1 right-1 z-10"
                        style={{ 
                          top: `${top}px`,
                          height: `${height - 4}px` // Small gap between events
                        }}
                      >
                        <Card className="h-full p-2 bg-[var(--widget-blue)] overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-none shadow-sm">
                          <div className="font-semibold text-xs text-foreground leading-tight mb-1">{event.summary}</div>
                          <div className="text-[10px] text-foreground/70">
                            {format(startDate, 'h:mm a')}
                          </div>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
