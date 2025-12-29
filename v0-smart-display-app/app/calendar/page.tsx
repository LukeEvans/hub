"use client"

import { Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

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
  
  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/calendar/events')
        if (res.ok) {
          const data = await res.json()
          setEvents(data.events || [])
        }
      } catch (err) {
        console.error('Failed to fetch events', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  // Group events by day
  const eventsByDay: Record<string, CalendarEvent[]> = {}
  events.forEach(event => {
    const day = new Date(event.start).toLocaleDateString('en-US', { weekday: 'short' })
    if (!eventsByDay[day]) eventsByDay[day] = []
    eventsByDay[day].push(event)
  })

  const weekDays = ["Wed", "Thu", "Fri", "Sat", "Sun"].map(name => ({
    name,
    date: 18 + ["Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(name), // Mocking dates for now to match UI layout
    events: eventsByDay[name] || []
  }))

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
              <p className="text-muted-foreground text-lg">{currentTime} • 80°</p>
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
          <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-4 mb-4">
            <div className="text-sm font-medium text-muted-foreground">Time</div>
            {weekDays.map((day) => (
              <div key={day.name} className="text-center">
                <div className="text-2xl font-bold mb-1">
                  {day.name} <span className={day.name === "Wed" ? "text-primary" : ""}>{day.date}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-4 relative">
            {/* Time Labels */}
            <div className="space-y-32">
              {["9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM"].map((time) => (
                <div key={time} className="text-sm text-muted-foreground font-medium h-8">
                  {time}
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {weekDays.map((day) => (
              <div key={day.name} className="relative min-h-[800px] border-l border-border">
                {day.events.map((event, idx) => {
                  const startDate = new Date(event.start)
                  const startHour = startDate.getHours()
                  const startMinutes = startDate.getMinutes()
                  const top = (startHour - 9) * 160 + (startMinutes / 60) * 160 // 160px per hour approx based on space-y-32
                  
                  return (
                    <div 
                      key={event.id} 
                      className="absolute left-2 right-2"
                      style={{ top: `${top}px` }}
                    >
                      <Card className="p-3 bg-[var(--widget-blue)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                        <div className="font-semibold text-sm text-foreground truncate">{event.summary}</div>
                        <div className="text-xs text-foreground/70">
                          {new Date(event.start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} - 
                          {new Date(event.end).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </div>
                      </Card>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
