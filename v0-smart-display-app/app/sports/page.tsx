"use client"

import { Trophy, Tv, Users, Calendar as CalendarIcon, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { isToday, isYesterday, parseISO } from "date-fns"

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

  const getRecord = (competitor: any) => {
    if (competitor.record) return competitor.record[0]?.summary
    if (competitor.records) return competitor.records[0]?.summary
    return "N/A"
  }

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
            <p className="text-muted-foreground text-lg">Season Schedules</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {teams.map((team) => {
          const schedule = team.data?.fullSchedule || []
          const teamRecord = team.data?.record?.items?.[0]?.summary || "N/A"
          
          // Find the start index: current game or next game
          // We also want to include "yesterday's" game if it just finished
          const now = new Date()
          let startIndex = schedule.findIndex((event: any) => {
            const gameDate = parseISO(event.date)
            const status = event.competitions[0].status.type.name
            // Include if it's today, in the future, or currently in progress
            return gameDate >= now || status === 'STATUS_IN_PROGRESS' || isToday(gameDate)
          })

          // If we found a start index, check if the game before it was yesterday
          if (startIndex > 0) {
            const prevGameDate = parseISO(schedule[startIndex - 1].date)
            if (isYesterday(prevGameDate)) {
              startIndex -= 1
            }
          } else if (startIndex === -1) {
            // If all games are in the past, maybe just show the last few?
            startIndex = Math.max(0, schedule.length - 5)
          }

          const displaySchedule = schedule.slice(startIndex)
          
          return (
            <div key={team.id} className="space-y-6 flex flex-col h-full">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12">
                    <img 
                      src={team.data?.logos[0].href} 
                      alt={team.name} 
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold leading-tight">{team.name}</h2>
                    <div className="text-sm font-medium text-muted-foreground">Record: {teamRecord}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4 overflow-y-auto pr-2 max-h-[calc(100vh-250px)] scrollbar-hide">
                {displaySchedule.length > 0 ? (
                  displaySchedule.map((event: any, idx: number) => {
                    const comp = event.competitions[0]
                    const opponent = comp.competitors.find((c: any) => c.team.id !== team.data.id)
                    const teamCompetitor = comp.competitors.find((c: any) => c.team.id === team.data.id)
                    const isHome = teamCompetitor.homeAway === "home"
                    const gameDate = parseISO(event.date)
                    const broadcast = comp.broadcasts?.[0]?.names?.[0] || "Check local"
                    const opponentRecord = getRecord(opponent)
                    const status = comp.status.type.name
                    const isFinished = status === 'STATUS_FINAL'
                    
                    // Score hiding logic:
                    // "If the game finished 'yesterday', show the score. 
                    // I don't want to see scores on the screen and spoil the game if I'm recording it."
                    // -> Show score if finished AND (yesterday OR older).
                    // -> Hide score if finished today OR ongoing.
                    const shouldShowScore = isFinished && !isToday(gameDate)
                    const teamScore = teamCompetitor.score?.displayValue || teamCompetitor.score
                    const opponentScore = opponent.score?.displayValue || opponent.score

                    return (
                      <Card key={event.id || idx} className={`overflow-hidden border-none ${isToday(gameDate) ? 'bg-primary/5 ring-1 ring-primary/20' : 'bg-muted/30'}`}>
                        <div className={`h-1 bg-gradient-to-r ${team.color}`} />
                        <div className="p-4 space-y-3">
                          <div className="flex justify-between items-start">
                            <div className="space-y-0.5">
                              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                {gameDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                {isToday(gameDate) && <span className="ml-2 text-primary">● TODAY</span>}
                                {isYesterday(gameDate) && <span className="ml-2 text-muted-foreground">YESTERDAY</span>}
                              </div>
                              <div className="text-lg font-black">
                                {gameDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true })}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              <div className="text-xs font-bold px-2 py-0.5 rounded bg-background/50 border border-border">
                                {isHome ? "HOME" : "AWAY"}
                              </div>
                              {status === 'STATUS_IN_PROGRESS' && (
                                <div className="text-[10px] font-bold text-red-500 animate-pulse">LIVE</div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between py-1">
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className="relative w-10 h-10 bg-background rounded-full p-1.5 border border-border shrink-0">
                                <img 
                                  src={opponent.team.logos[0].href} 
                                  alt={opponent.team.displayName} 
                                  className="object-contain w-full h-full"
                                />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-bold leading-tight truncate">{opponent.team.displayName}</div>
                                <div className="text-[10px] text-muted-foreground font-medium truncate">Record: {opponentRecord}</div>
                              </div>
                            </div>

                            {isFinished && (
                              <div className="flex flex-col items-end ml-4">
                                {shouldShowScore ? (
                                  <div className="text-lg font-black tabular-nums">
                                    <span className={Number(teamScore) > Number(opponentScore) ? 'text-green-500' : ''}>
                                      {teamScore}
                                    </span>
                                    <span className="text-muted-foreground mx-1">-</span>
                                    <span>{opponentScore}</span>
                                  </div>
                                ) : (
                                  <div className="text-[10px] font-bold bg-muted px-2 py-1 rounded text-muted-foreground">
                                    SCORE HIDDEN
                                  </div>
                                )}
                                <div className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">FINAL</div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Tv className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] font-semibold truncate text-muted-foreground">{broadcast}</span>
                            </div>
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Users className="w-3 h-3 text-muted-foreground" />
                              <span className="text-[10px] font-semibold truncate text-muted-foreground">
                                {comp.venue.address?.city || comp.venue.fullName.split(' ').pop()}
                              </span>
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
