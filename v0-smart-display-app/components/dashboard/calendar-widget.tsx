"use client"

import { Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useApi } from "@/lib/use-api"

export function CalendarWidget() {
  const router = useRouter()
  const { data, isLoading } = useApi<any>('/api/calendar/events')
  
  const events = data?.events ? data.events.filter((e: any) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const start = new Date(e.start)
    return start >= today && start < tomorrow
  }).sort((a: any, b: any) => new Date(a.start).getTime() - new Date(b.start).getTime()) : []

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
          <h3 className="font-bold text-foreground">Today's Schedule</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide">
          {events.length === 0 ? (
            <div className="text-sm text-foreground/60 italic py-4">No events today</div>
          ) : (
            events.map((event: any, i: number) => {
              const start = new Date(event.start)
              const time = start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })
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

