"use client"

import { Trophy, Tv, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useApi } from "@/lib/use-api"

export function SportsWidget() {
  const { data, isLoading } = useApi<any>("/api/sports")
  const nuggetsData = data?.nba

  if (isLoading || !nuggetsData) {
    return (
      <Card className="h-full bg-muted animate-pulse flex items-center justify-center">
        <Trophy className="w-8 h-8 text-muted-foreground/50" />
      </Card>
    )
  }

  const nextEvent = nuggetsData.nextEvent?.[0]
  if (!nextEvent) return null

  const opponent = nextEvent.competitions[0].competitors.find(
    (c: any) => c.team.id !== nuggetsData.id
  )
  const isHome = nextEvent.competitions[0].competitors.find(
    (c: any) => c.team.id === nuggetsData.id
  ).homeAway === "home"

  const gameDate = new Date(nextEvent.date)
  const timeString = gameDate.toLocaleTimeString([], { 
    hour: "numeric", 
    minute: "2-digit", 
    hour12: true 
  })
  const dateString = gameDate.toLocaleDateString([], { 
    weekday: "short", 
    month: "short", 
    day: "numeric" 
  })

  const broadcast = nextEvent.competitions[0].broadcasts?.[0]?.names?.[0] || "Check local listings"
  
  // Helper to get record summary
  const getRecord = (competitor: any) => {
    if (competitor.record) return competitor.record[0]?.summary
    if (competitor.records) return competitor.records[0]?.summary
    return "N/A"
  }

  const opponentRecord = getRecord(opponent)
  const nuggetsRecord = nuggetsData.record?.items?.[0]?.summary || "N/A"

  return (
    <Link href="/sports" className="block h-full">
      <Card className="h-full p-4 bg-gradient-to-br from-[#0E2240] to-[#FEC524] text-white border-none overflow-hidden relative cursor-pointer hover:opacity-90 transition-opacity">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[#FEC524]" />
            <span className="text-xs font-bold uppercase tracking-wider text-white/80">Next Nuggets Game</span>
          </div>
          <div className="text-[10px] font-medium bg-white/20 px-2 py-0.5 rounded-full">
            {isHome ? "HOME" : "AWAY"}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 mt-2">
          <div className="flex-1 flex flex-col items-center">
            <div className="relative w-12 h-12 mb-1">
              <img 
                src={nuggetsData.logos[0].href} 
                alt="Nuggets" 
                className="object-contain w-full h-full"
              />
            </div>
            <span className="text-[10px] font-bold truncate w-full text-center">NUGGETS</span>
            <span className="text-[8px] text-white/70">({nuggetsRecord})</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-lg font-black italic">VS</span>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold">{timeString}</span>
              <span className="text-[8px] text-white/70 uppercase">{dateString}</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col items-center">
            <div className="relative w-12 h-12 mb-1">
              <img 
                src={opponent.team.logos[0].href} 
                alt={opponent.team.displayName} 
                className="object-contain w-full h-full"
              />
            </div>
            <span className="text-[10px] font-bold truncate w-full text-center uppercase">
              {opponent.team.shortDisplayName}
            </span>
            <span className="text-[8px] text-white/70">({opponentRecord})</span>
          </div>
        </div>

        <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Tv className="w-3 h-3 text-[#FEC524]" />
            <span className="text-[10px] font-medium">{broadcast}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="w-3 h-3 text-[#FEC524]" />
            <span className="text-[10px] font-medium">{nextEvent.competitions[0].venue.fullName}</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

