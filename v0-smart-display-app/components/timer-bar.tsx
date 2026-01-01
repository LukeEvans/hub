"use client"

import React, { useState, useEffect } from "react"
import { Timer as TimerIcon, X, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTimer, Timer } from "@/lib/timer-context"
import { cn } from "@/lib/utils"
import { CustomTimerDialog } from "./custom-timer-dialog"

export function TimerBar() {
  const { timers, addTimer, removeTimer } = useTimer()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const presets = [
    { label: "1m", seconds: 60 },
    { label: "5m", seconds: 300 },
    { label: "7m", seconds: 420 },
    { label: "10m", seconds: 600 },
    { label: "15m", seconds: 900 },
  ]

  return (
    <div className="fixed top-0 left-0 md:left-28 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-40 flex items-center px-6 justify-between">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-2 pl-12 md:pl-0">
        <div className="flex items-center gap-2 pr-4 border-r border-border mr-2 shrink-0">
          <TimerIcon className="w-5 h-5 text-primary" />
          <span className="font-semibold hidden sm:inline">Timers</span>
        </div>
        
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="sm"
            onClick={() => addTimer(preset.seconds, preset.label)}
            className="rounded-full px-4 h-9"
          >
            {preset.label}
          </Button>
        ))}
        
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsDialogOpen(true)}
          className="rounded-full px-4 h-9 gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Custom</span>
        </Button>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pl-4 ml-4 border-l border-border max-w-[50%]">
        {timers.length === 0 ? (
          <span className="text-sm text-muted-foreground italic whitespace-nowrap">No active timers</span>
        ) : (
          timers.map((timer) => (
            <ActiveTimer key={timer.id} timer={timer} onRemove={() => removeTimer(timer.id)} />
          ))
        )}
      </div>

      <CustomTimerDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        onAddTimer={(seconds, label) => {
          addTimer(seconds, label)
          setIsDialogOpen(false)
        }} 
      />
    </div>
  )
}

function ActiveTimer({ timer, onRemove }: { timer: Timer; onRemove: () => void }) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const update = () => {
      const rem = Math.max(0, Math.ceil((timer.endTime - Date.now()) / 1000))
      setRemaining(rem)
    }
    
    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [timer.endTime])

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const isExpired = remaining === 0 || timer.isComplete

  return (
    <div 
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all animate-in fade-in slide-in-from-right-4",
        isExpired 
          ? "bg-destructive/20 border-destructive text-destructive animate-pulse" 
          : "bg-primary/10 border-primary/20 text-primary"
      )}
    >
      <Clock className={cn("w-3.5 h-3.5", isExpired && "animate-spin")} />
      <span className="text-sm font-mono font-bold whitespace-nowrap">
        {timer.label && <span className="mr-1.5 opacity-70 font-sans">{timer.label}:</span>}
        {isExpired ? "0:00" : `${minutes}:${seconds.toString().padStart(2, "0")}`}
      </span>
      <button 
        onClick={onRemove}
        className="ml-1 p-0.5 hover:bg-black/10 rounded-full transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

