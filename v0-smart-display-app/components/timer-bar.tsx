"use client"

import React, { useState, useEffect } from "react"
import { Timer as TimerIcon, X, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTimer, Timer } from "@/lib/timer-context"
import { cn } from "@/lib/utils"
import { CustomTimerDialog } from "./custom-timer-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Bell } from "lucide-react"

export function TimerBar() {
  const { timers, addTimer, removeTimer, clearCompleted } = useTimer()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  
  const completedTimers = timers.filter(t => t.isComplete)
  const isCompleteDialogOpen = completedTimers.length > 0
  
  const presets = [
    { label: "1m", seconds: 60 },
    { label: "5m", seconds: 300 },
    { label: "7m", seconds: 420 },
    { label: "10m", seconds: 600 },
    { label: "15m", seconds: 900 },
  ]

  return (
    <div className="fixed top-0 left-0 md:left-28 right-0 h-20 bg-background/80 backdrop-blur-md border-b border-border z-40 flex items-center px-6 justify-between">
      <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-2 pl-12 md:pl-0">
        <div className="flex items-center gap-3 pr-4 border-r border-border mr-2 shrink-0">
          <TimerIcon className="w-6 h-6 text-primary" />
          <span className="font-bold text-lg hidden sm:inline">Timers</span>
        </div>
        
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant="outline"
            size="lg"
            onClick={() => addTimer(preset.seconds, preset.label)}
            className="rounded-full px-6 h-12 text-base font-semibold"
          >
            {preset.label}
          </Button>
        ))}
        
        <Button
          variant="secondary"
          size="lg"
          onClick={() => setIsDialogOpen(true)}
          className="rounded-full px-6 h-12 text-base font-semibold gap-2"
        >
          <Plus className="w-5 h-5" />
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

      <Dialog open={isCompleteDialogOpen} onOpenChange={(open) => !open && clearCompleted()}>
        <DialogContent className="sm:max-w-[425px] border-destructive border-4 bg-destructive/5">
          <DialogHeader className="items-center gap-4 py-8">
            <div className="w-20 h-20 rounded-full bg-destructive flex items-center justify-center animate-bounce">
              <Bell className="w-10 h-10 text-white" />
            </div>
            <DialogTitle className="text-4xl font-black text-destructive text-center leading-tight">
              {completedTimers.length > 1 ? "Multiple Timers Done!" : `${completedTimers[0]?.label || "Timer"} Complete!`}
            </DialogTitle>
          </DialogHeader>
          <Button 
            size="lg" 
            variant="destructive"
            className="h-24 text-3xl font-black rounded-2xl shadow-xl active:scale-95 transition-transform"
            onClick={() => clearCompleted()}
          >
            DISMISS
          </Button>
        </DialogContent>
      </Dialog>
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
        "flex items-center gap-3 px-4 py-2 rounded-full border transition-all animate-in fade-in slide-in-from-right-4 h-12",
        isExpired 
          ? "bg-destructive/20 border-destructive text-destructive animate-pulse" 
          : "bg-primary/10 border-primary/20 text-primary"
      )}
    >
      <Clock className={cn("w-4 h-4", isExpired && "animate-spin")} />
      <span className="text-base font-mono font-bold whitespace-nowrap">
        {timer.label && <span className="mr-1.5 opacity-70 font-sans">{timer.label}:</span>}
        {isExpired ? "0:00" : `${minutes}:${seconds.toString().padStart(2, "0")}`}
      </span>
      <Button 
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="ml-1 h-10 w-10 rounded-full hover:bg-black/10 transition-colors"
      >
        <X className="w-5 h-5" />
      </Button>
    </div>
  )
}

