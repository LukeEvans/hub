"use client"

import { Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks, startOfMonth, addMonths, subMonths, addDays as addDaysFn, subDays } from "date-fns"

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
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }) // Start week on Monday

  useEffect(() => {
    async function fetchCalendarData() {
      try {
        setLoading(true)
        // Fetch a wide range around the current date
        const start = startOfMonth(subMonths(currentDate, 1)).toISOString()
        const end = startOfMonth(addMonths(currentDate, 2)).toISOString()
        
        const [eventsRes, weatherRes] = await Promise.all([
          fetch(`/api/calendar/events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`),
          fetch('/api/weather')
        ])

        if (eventsRes.ok) {
          const data = await eventsRes.json()
          setEvents(data.events || [])
        }

        if (weatherRes.ok) {
          const weatherData = await weatherRes.json()
          if (weatherData.current?.temp !== undefined) {
            setCurrentTemp(Math.round(weatherData.current.temp))
          }
        }
      } catch (err) {
        console.error('Failed to fetch calendar data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchCalendarData()
  }, [currentDate]) // Refetch when date changes

  const currentTime = format(new Date(), "h:mm a")
  const currentMonthYear = format(currentDate, "MMMM yyyy")

  const handlePrevious = () => {
    if (view === "Week") setCurrentDate(subWeeks(currentDate, 1))
    else if (view === "Day") setCurrentDate(subDays(currentDate, 1))
    else if (view === "Month") setCurrentDate(subMonths(currentDate, 1))
  }

  const handleNext = () => {
    if (view === "Week") setCurrentDate(addWeeks(currentDate, 1))
    else if (view === "Day") setCurrentDate(addDaysFn(currentDate, 1))
    else if (view === "Month") setCurrentDate(addMonths(currentDate, 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Group events by day (yyyy-MM-dd)
  const eventsByDay: Record<string, { timed: CalendarEvent[], allDay: CalendarEvent[] }> = {}
  events.forEach(event => {
    const isAllDay = !event.start.includes('T')
    const dateStr = isAllDay ? event.start : format(parseISO(event.start), 'yyyy-MM-dd')
    
    if (!eventsByDay[dateStr]) {
      eventsByDay[dateStr] = { timed: [], allDay: [] }
    }
    
    if (isAllDay) {
      eventsByDay[dateStr].allDay.push(event)
    } else {
      eventsByDay[dateStr].timed.push(event)
    }
  })

  const getDaysForView = () => {
    if (view === "Day") {
      const dateStr = format(currentDate, 'yyyy-MM-dd')
      return [{
        name: format(currentDate, 'EEEE'),
        date: format(currentDate, 'd'),
        dateStr,
        isToday: isSameDay(currentDate, new Date()),
        events: eventsByDay[dateStr] || { timed: [], allDay: [] }
      }]
    }
    
    if (view === "Month") {
      const monthStart = startOfMonth(currentDate)
      const monthDays = []
      // Find the Monday of the week containing the 1st of the month
      const start = startOfWeek(monthStart, { weekStartsOn: 1 })
      
      for (let i = 0; i < 42; i++) { // 6 weeks
        const date = addDays(start, i)
        const dateStr = format(date, 'yyyy-MM-dd')
        monthDays.push({
          name: format(date, 'EEE'),
          date: format(date, 'd'),
          dateStr,
          isToday: isSameDay(date, new Date()),
          isCurrentMonth: date.getMonth() === currentDate.getMonth(),
          events: eventsByDay[dateStr] || { timed: [], allDay: [] }
        })
      }
      return monthDays
    }

    // Default: Week
    const start = startOfWeek(currentDate, { weekStartsOn: 1 })
    return Array.from({ length: 7 }).map((_, i) => {
      const date = addDays(start, i)
      const dateStr = format(date, 'yyyy-MM-dd')
      return {
        name: format(date, 'EEE'),
        date: format(date, 'd'),
        dateStr,
        isToday: isSameDay(date, new Date()),
        events: eventsByDay[dateStr] || { timed: [], allDay: [] }
      }
    })
  }

  const viewDays = getDaysForView()

  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null)
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null)
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY })
  }
  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY })
  }
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distanceX = touchStart.x - touchEnd.x
    const distanceY = touchStart.y - touchEnd.y
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY)
    
    if (isHorizontalSwipe && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) handleNext()
      else handlePrevious()
    }
  }

  return (
    <div 
      className="min-h-screen p-8 bg-background overflow-hidden flex flex-col"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
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
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handlePrevious}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" className="text-sm font-medium" onClick={handleToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={handleNext}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="flex-1 overflow-hidden flex flex-col p-6">
          {view === "Month" ? (
            <div className="grid grid-cols-7 h-full gap-px bg-border flex-1 border border-border">
              {/* Day headers */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                <div key={day} className="bg-muted p-2 text-center text-sm font-medium border-b border-border">
                  {day}
                </div>
              ))}
              {/* Calendar cells */}
              {viewDays.map((day) => (
                <div 
                  key={day.dateStr} 
                  className={`bg-background p-2 min-h-0 flex flex-col gap-1 overflow-hidden border-r border-b border-border ${!day.isCurrentMonth ? "opacity-40" : ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${day.isToday ? "bg-primary text-primary-foreground w-6 h-6 rounded-full flex items-center justify-center" : ""}`}>
                      {day.date}
                    </span>
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                    {[...day.events.allDay, ...day.events.timed].slice(0, 4).map(event => (
                      <div key={event.id} className="text-[10px] px-1 py-0.5 bg-primary/10 rounded truncate border-l-2 border-primary">
                        {event.summary}
                      </div>
                    ))}
                    {(day.events.allDay.length + day.events.timed.length) > 4 && (
                      <div className="text-[10px] text-muted-foreground pl-1">
                        +{(day.events.allDay.length + day.events.timed.length) - 4} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* Day/Week View Header */}
              <div className={`grid ${view === 'Day' ? 'grid-cols-[100px_1fr]' : 'grid-cols-[100px_repeat(7,1fr)]'} gap-4 mb-4 shrink-0`}>
                <div className="text-sm font-medium text-muted-foreground">Time</div>
                {viewDays.map((day) => (
                  <div key={day.dateStr} className="text-center">
                    <div className="text-2xl font-bold mb-1">
                      {day.name} <span className={day.isToday ? "text-primary" : ""}>{day.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* All-Day Events Row */}
              <div className={`grid ${view === 'Day' ? 'grid-cols-[100px_1fr]' : 'grid-cols-[100px_repeat(7,1fr)]'} gap-4 mb-4 shrink-0`}>
                <div className="text-[10px] uppercase font-bold text-muted-foreground self-center">All Day</div>
                {viewDays.map((day) => (
                  <div key={day.dateStr} className="flex flex-col gap-1">
                    {day.events.allDay.map(event => (
                      <div key={event.id} className="bg-primary/20 text-primary-foreground border-l-4 border-primary px-2 py-1 rounded text-xs font-semibold">
                        {event.summary}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Time Grid Scrollable Area */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar touch-pan-y pointer-events-auto min-h-0">
                <div className={`grid ${view === 'Day' ? 'grid-cols-[100px_1fr]' : 'grid-cols-[100px_repeat(7,1fr)]'} gap-4 relative`}>
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
                  {viewDays.map((day) => (
                    <div key={day.dateStr} className="relative min-h-[1536px] border-l border-border">
                      {/* Hour horizontal lines */}
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="absolute w-full border-t border-border/50" 
                          style={{ top: `${i * 96}px` }}
                        />
                      ))}
                      
                      {day.events.timed.map((event) => {
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
            </>
          )}
        </Card>
      )}
    </div>
  )
}
