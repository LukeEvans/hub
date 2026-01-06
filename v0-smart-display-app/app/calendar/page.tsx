"use client"

import { Calendar, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { format, startOfWeek, addDays, isSameDay, parseISO, addWeeks, subWeeks, startOfMonth, addMonths, subMonths, addDays as addDaysFn, subDays, endOfMonth } from "date-fns"
import { useApi } from "@/lib/use-api"
import useEmblaCarousel from 'embla-carousel-react'

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
}

function CalendarView({ view, days }: { view: string, days: any[] }) {
  if (view === "Month") {
    return (
      <div className="grid grid-cols-7 h-full gap-px bg-border flex-1 border border-border">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="bg-muted p-2 text-center text-sm font-medium border-b border-border">
            {day}
          </div>
        ))}
        {days.map((day) => (
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
                <div key={event.id} className="text-[10px] px-1 py-0.5 bg-primary/10 rounded truncate border-l-2 border-primary shrink-0">
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
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Day/Week View Header */}
      <div className={`grid ${view === 'Day' ? 'grid-cols-[100px_1fr]' : 'grid-cols-[100px_repeat(7,1fr)]'} gap-4 mb-2 shrink-0`}>
        <div className="text-sm font-medium text-muted-foreground">Time</div>
        {days.map((day) => (
          <div key={day.dateStr} className="text-center">
            <div className="text-2xl font-bold mb-1">
              {day.name} <span className={day.isToday ? "text-primary" : ""}>{day.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* All-Day Events Row */}
      <div className={`grid ${view === 'Day' ? 'grid-cols-[100px_1fr]' : 'grid-cols-[100px_repeat(7,1fr)]'} gap-4 mb-2 shrink-0 max-h-[120px] overflow-y-auto custom-scrollbar`}>
        <div className="text-[10px] uppercase font-bold text-muted-foreground pt-2">All Day</div>
        {days.map((day) => (
          <div key={day.dateStr} className="flex flex-col gap-1 py-1">
            {day.events.allDay.map(event => (
              <div key={event.id} className="bg-primary/20 text-primary-foreground border-l-4 border-primary px-2 py-1 rounded text-[10px] sm:text-xs font-semibold truncate">
                {event.summary}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Time Grid Area */}
      <div className="flex-1 min-h-0 pointer-events-auto">
        <div className={`grid ${view === 'Day' ? 'grid-cols-[100px_1fr]' : 'grid-cols-[100px_repeat(7,1fr)]'} gap-4 h-full relative`}>
          {/* Time Labels */}
          <div className="flex flex-col h-full">
            {Array.from({ length: 16 }).map((_, i) => {
              const hour = 7 + i
              const ampm = hour >= 12 ? "PM" : "AM"
              const displayHour = hour > 12 ? hour - 12 : hour
              return (
                <div key={hour} className="text-sm text-muted-foreground font-medium flex-1 flex items-start pt-0 border-t border-transparent">
                  {displayHour} {ampm}
                </div>
              )
            })}
          </div>

          {/* Day Columns */}
          {days.map((day) => (
            <div key={day.dateStr} className="relative h-full border-l border-border flex flex-col">
              {/* Hour horizontal lines */}
              {Array.from({ length: 16 }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-1 border-t border-border/50" 
                />
              ))}
              
              {/* Overlay for events */}
              <div className="absolute inset-0 pointer-events-none">
                {day.events.timed.map((event: CalendarEvent) => {
                  const startDate = parseISO(event.start)
                  const endDate = parseISO(event.end)
                  const startHour = startDate.getHours()
                  const startMinutes = startDate.getMinutes()
                  
                  if (startHour < 7 || startHour >= 23) return null

                  const totalHours = 16
                  const top = ((startHour - 7) + (startMinutes / 60)) / totalHours * 100
                  
                  const durationMs = endDate.getTime() - startDate.getTime()
                  const durationHours = durationMs / (1000 * 60 * 60)
                  const height = (durationHours / totalHours) * 100
                  
                  return (
                    <div 
                      key={event.id} 
                      className="absolute left-1 right-1 z-10 pointer-events-auto"
                      style={{ 
                        top: `${top}%`,
                        height: `calc(${height}% - 2px)`
                      }}
                    >
                      <Card className="h-full p-1 sm:p-2 bg-[var(--widget-blue)] overflow-hidden cursor-pointer hover:shadow-md transition-shadow border-none shadow-sm flex flex-col">
                        <div className="font-semibold text-[9px] sm:text-xs text-foreground leading-tight break-words line-clamp-2">
                          {event.summary}
                        </div>
                        {height > 8 && (
                          <div className="text-[8px] sm:text-[10px] text-foreground/70 mt-auto shrink-0">
                            {format(startDate, 'h:mm a')}
                          </div>
                        )}
                      </Card>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const [view, setView] = useState("Week")
  const [currentDate, setCurrentDate] = useState(new Date())

  // Calculate range for SWR key
  const start = startOfMonth(subMonths(currentDate, 1)).toISOString()
  const end = startOfMonth(addMonths(currentDate, 2)).toISOString()

  const { data: eventsData, isLoading: eventsLoading } = useApi<any>(
    `/api/calendar/events?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`
  )
  const { data: weatherData } = useApi<any>('/api/weather')

  const events = eventsData?.events || []
  const currentTemp = weatherData?.current?.temp !== undefined ? Math.round(weatherData.current.temp) : null

  const currentTime = format(new Date(), "h:mm a")
  const currentMonthYear = format(currentDate, "MMMM yyyy")

  // Group events by day (yyyy-MM-dd)
  const eventsByDay = useMemo(() => {
    const grouped: Record<string, { timed: CalendarEvent[], allDay: CalendarEvent[] }> = {}
    events.forEach(event => {
      const isAllDay = !event.start.includes('T')
      const dateStr = isAllDay ? event.start : format(parseISO(event.start), 'yyyy-MM-dd')
      
      if (!grouped[dateStr]) {
        grouped[dateStr] = { timed: [], allDay: [] }
      }
      
      if (isAllDay) {
        grouped[dateStr].allDay.push(event)
      } else {
        grouped[dateStr].timed.push(event)
      }
    })
    return grouped
  }, [events])

  const getDaysForDate = useCallback((date: Date, currentView: string) => {
    if (currentView === "Day") {
      const dateStr = format(date, 'yyyy-MM-dd')
      return [{
        name: format(date, 'EEEE'),
        date: format(date, 'd'),
        dateStr,
        isToday: isSameDay(date, new Date()),
        isCurrentMonth: true,
        events: eventsByDay[dateStr] || { timed: [], allDay: [] }
      }]
    }
    
    if (currentView === "Month") {
      const monthStart = startOfMonth(date)
      const monthDays = []
      const start = startOfWeek(monthStart, { weekStartsOn: 1 })
      
      for (let i = 0; i < 42; i++) {
        const d = addDays(start, i)
        const dateStr = format(d, 'yyyy-MM-dd')
        monthDays.push({
          name: format(d, 'EEE'),
          date: format(d, 'd'),
          dateStr,
          isToday: isSameDay(d, new Date()),
          isCurrentMonth: d.getMonth() === date.getMonth(),
          events: eventsByDay[dateStr] || { timed: [], allDay: [] }
        })
      }
      return monthDays
    }

    const start = startOfWeek(date, { weekStartsOn: 1 })
    return Array.from({ length: 7 }).map((_, i) => {
      const d = addDays(start, i)
      const dateStr = format(d, 'yyyy-MM-dd')
      return {
        name: format(d, 'EEE'),
        date: format(d, 'd'),
        dateStr,
        isToday: isSameDay(d, new Date()),
        isCurrentMonth: true,
        events: eventsByDay[dateStr] || { timed: [], allDay: [] }
      }
    })
  }, [eventsByDay])

  const handlePrevious = useCallback(() => {
    if (view === "Week") setCurrentDate(prev => subWeeks(prev, 1))
    else if (view === "Day") setCurrentDate(prev => subDays(prev, 1))
    else if (view === "Month") setCurrentDate(prev => subMonths(prev, 1))
  }, [view])

  const handleNext = useCallback(() => {
    if (view === "Week") setCurrentDate(prev => addWeeks(prev, 1))
    else if (view === "Day") setCurrentDate(prev => addDaysFn(prev, 1))
    else if (view === "Month") setCurrentDate(prev => addMonths(prev, 1))
  }, [view])

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  // Embla setup
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    loop: false,
    startIndex: 1,
    skipSnaps: true,
    watchDrag: !eventsLoading
  })

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    const index = emblaApi.selectedScrollSnap()
    if (index === 0) {
      handlePrevious()
      emblaApi.scrollTo(1, false)
    } else if (index === 2) {
      handleNext()
      emblaApi.scrollTo(1, false)
    }
  }, [emblaApi, handlePrevious, handleNext])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  // Re-center when view changes
  useEffect(() => {
    if (emblaApi) emblaApi.scrollTo(1, false)
  }, [view, emblaApi])

  const getDateForIndex = (index: number) => {
    if (index === 0) {
      if (view === "Week") return subWeeks(currentDate, 1)
      if (view === "Day") return subDays(currentDate, 1)
      return subMonths(currentDate, 1)
    }
    if (index === 2) {
      if (view === "Week") return addWeeks(currentDate, 1)
      if (view === "Day") return addDaysFn(currentDate, 1)
      return addMonths(currentDate, 1)
    }
    return currentDate
  }

  const navigatePrevious = () => {
    if (emblaApi) emblaApi.scrollPrev()
    else handlePrevious()
  }

  const navigateNext = () => {
    if (emblaApi) emblaApi.scrollNext()
    else handleNext()
  }

  return (
    <div className="h-screen p-4 sm:p-6 bg-background overflow-hidden flex flex-col">
      {/* Header */}
      <div className="mb-2 shrink-0">
        <div className="flex items-center justify-between mb-2">
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
            <Button variant="ghost" size="icon" className="rounded-full" onClick={navigatePrevious}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" className="text-sm font-medium" onClick={handleToday}>
              Today
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={navigateNext}>
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {eventsLoading && events.length === 0 ? (
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : (
        <Card className="flex-1 overflow-hidden flex flex-col p-4">
          <div className="flex-1 overflow-hidden" ref={emblaRef}>
            <div className="flex h-full">
              {[0, 1, 2].map((index) => (
                <div key={index} className="flex-[0_0_100%] min-w-0 h-full">
                  <CalendarView 
                    view={view} 
                    days={getDaysForDate(getDateForIndex(index), view)} 
                  />
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
