"use client"

import { Trophy, Tv, Users, Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"

export default function SportsPage() {
  const [sportsData, setSportsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSports() {
      try {
        const res = await fetch('/api/sports')
        if (res.ok) {
          const data = await res.json()
          setSportsData(data)
        }
      } catch (err) {
        console.error('Failed to fetch sports data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchSports()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  const teams = [
    { id: 'nba', name: 'Nuggets', data: sportsData?.nba, color: 'from-[#0E2240] to-[#FEC524]' },
    { id: 'nfl', name: 'Broncos', data: sportsData?.nfl, color: 'from-[#FB4F14] to-[#002244]' },
    { id: 'nhl', name: 'Avalanche', data: sportsData?.nhl, color: 'from-[#6F263D] to-[#236192]' },
  ]

  return (
    <div className="min-h-screen p-8 bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-full bg-[var(--widget-blue)] flex items-center justify-center">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Sports</h1>
            <p className="text-muted-foreground text-lg">Upcoming Schedules</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {teams.map((team) => {
          const nextEvents = team.data?.nextEvent || []
          
          return (
            <div key={team.id} className="space-y-6">
              <div className="flex items-center gap-3 px-2">
                <div className="relative w-12 h-12">
                  <img 
                    src={team.data?.logos[0].href} 
                    alt={team.name} 
                    className="object-contain w-full h-full"
                  />
                </div>
                <h2 className="text-2xl font-bold">{team.name}</h2>
              </div>

              <div className="space-y-4">
                {nextEvents.length > 0 ? (
                  nextEvents.map((event: any, idx: number) => {
                    const comp = event.competitions[0]
                    const opponent = comp.competitors.find((c: any) => c.team.id !== team.data.id)
                    const isHome = comp.competitors.find((c: any) => c.team.id === team.data.id).homeAway === "home"
                    const gameDate = new Date(event.date)
                    const broadcast = comp.broadcasts?.[0]?.names?.[0] || "Check local"
                    const opponentRecord = opponent.record?.[0]?.summary || "N/A"

                    return (
                      <Card key={event.id} className={`overflow-hidden border-none`}>
                        <div className={`h-1.5 bg-gradient-to-r ${team.color}`} />
                        <div className="p-5 space-y-4">
                          <div className="flex justify-between items-start">
                            <div className="space-y-1">
                              <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
                                {gameDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}
                              </div>
                              <div className="text-2xl font-black">
                                {gameDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold px-2 py-1 rounded bg-muted">
                                {isHome ? "HOME" : "AWAY"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 py-2">
                            <div className="relative w-14 h-14 bg-muted rounded-full p-2">
                              <img 
                                src={opponent.team.logos[0].href} 
                                alt={opponent.team.displayName} 
                                className="object-contain w-full h-full"
                              />
                            </div>
                            <div>
                              <div className="text-xs font-medium text-muted-foreground uppercase">Opponent</div>
                              <div className="text-xl font-bold leading-tight">{opponent.team.displayName}</div>
                              <div className="text-sm text-muted-foreground font-medium">Record: {opponentRecord}</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                            <div className="flex items-center gap-2">
                              <Tv className="w-4 h-4 text-primary" />
                              <span className="text-sm font-semibold truncate">{broadcast}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4 text-primary" />
                              <span className="text-sm font-semibold truncate">{comp.venue.address?.city || comp.venue.fullName}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )
                  })
                ) : (
                  <Card className="p-8 text-center text-muted-foreground">
                    No upcoming games scheduled
                  </Card>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

