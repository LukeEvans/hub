"use client"

import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import Link from "next/link"

export function CalendarWidget() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/calendar/events')
        if (res.ok) {
          const data = await res.json()
          // Filter for today's events and sort them
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)

          const filtered = data.events.filter((e: any) => {
            const start = new Date(e.start)
            return start >= today && start < tomorrow
          }).sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime())

          setEvents(filtered)
        }
      } catch (err) {
        console.error('Failed to fetch events', err)
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  if (loading) {
    return (
      <Card className="h-full flex items-center justify-center bg-[var(--widget-blue)]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/50" />
      </Card>
    )
  }

  return (
    <Link href="/calendar" className="block h-full">
      <Card className="h-full p-4 bg-[var(--widget-blue)] hover:shadow-lg transition-all border-none overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <CalendarIcon className="w-5 h-5 text-foreground/70" />
          <h3 className="font-bold text-foreground">Today's Schedule</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
          {events.length === 0 ? (
            <div className="text-sm text-foreground/60 italic py-4">No events today</div>
          ) : (
            events.map((event, i) => {
              const start = new Date(event.start)
              const time = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
              const isAllDay = event.start.length <= 10 // Date string format YYYY-MM-DD
              
              return (
                <div key={i} className="flex gap-3 items-start">
                  <div className="text-[10px] font-bold text-foreground/70 w-12 pt-1 uppercase">
                    {isAllDay ? 'All Day' : time}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">{event.summary}</div>
                    {event.location && (
                      <div className="text-[10px] text-foreground/60 truncate">{event.location}</div>
                    )}
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

