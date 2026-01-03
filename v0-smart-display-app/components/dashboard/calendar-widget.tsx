"use client"

import { Calendar as CalendarIcon, Loader2, Cake, PartyPopper } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useApi } from "@/lib/use-api"
import { parseSafeDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

export function CalendarWidget() {
  const router = useRouter()
  const { data, isLoading } = useApi<any>('/api/calendar/events')
  
  const events = data?.events ? data.events.filter((e: any) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    const start = parseSafeDate(e.start)
    return start >= today && start < nextWeek
  }).sort((a: any, b: any) => parseSafeDate(a.start).getTime() - parseSafeDate(b.start).getTime()) : []

  const isBirthday = (summary: string) => 
    summary?.toLowerCase().includes('birthday')

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center bg-[var(--widget-blue)]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/50" />
      </Card>
    )
  }

  return (
    <Link 
      href="/calendar" 
      prefetch={false}
      className="block h-full active:scale-[0.98] transition-transform"
      draggable={false}
      onClick={(e) => {
        e.preventDefault()
        router.push('/calendar')
      }}
    >
      <Card className="h-full p-4 bg-[var(--widget-blue)] hover:shadow-lg transition-all border-none overflow-hidden flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <CalendarIcon className="w-5 h-5 text-foreground/70" />
          <h3 className="font-bold text-foreground">Weekly Schedule</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
          {events.length === 0 ? (
            <div className="text-sm text-foreground/60 italic py-4">No events this week</div>
          ) : (
            events.map((event: any, i: number) => {
              const start = parseSafeDate(event.start)
              const time = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
              const isAllDay = event.start.length <= 10 // Date string format YYYY-MM-DD
              const eventIsBirthday = isBirthday(event.summary)
              
              // Show day header if it's the first event or the day has changed
              const prevEvent = i > 0 ? events[i-1] : null
              const showDayHeader = !prevEvent || 
                parseSafeDate(prevEvent.start).toDateString() !== start.toDateString()

              // Check if this day has any birthdays
              const dayHasBirthday = showDayHeader && events.some((e: any) => 
                parseSafeDate(e.start).toDateString() === start.toDateString() && isBirthday(e.summary)
              )

              return (
                <div key={i} className="space-y-2">
                  {showDayHeader && (
                    <div className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider border-b border-foreground/5 pb-1 mt-2 flex items-center justify-between">
                      <span>{start.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                      {dayHasBirthday && <PartyPopper className="w-3 h-3 text-pink-500 animate-bounce" />}
                    </div>
                  )}
                  <div className={cn(
                    "flex gap-3 items-start p-1 rounded-md transition-colors",
                    eventIsBirthday && "bg-pink-500/10 border border-pink-500/20 shadow-sm"
                  )}>
                    <div className={cn(
                      "text-[10px] font-bold w-12 pt-1 uppercase",
                      eventIsBirthday ? "text-pink-600 dark:text-pink-400" : "text-foreground/70"
                    )}>
                      {isAllDay ? 'All Day' : time}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "text-sm font-semibold truncate flex items-center gap-1.5",
                        eventIsBirthday ? "text-pink-700 dark:text-pink-300" : "text-foreground"
                      )}>
                        {event.summary}
                        {eventIsBirthday && <Cake className="w-3.5 h-3.5 text-pink-500 animate-pulse" />}
                      </div>
                      {event.location && (
                        <div className="text-[10px] text-foreground/60 truncate">{event.location}</div>
                      )}
                    </div>
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

