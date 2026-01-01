"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { toast } from "sonner"

export interface Timer {
  id: string
  label?: string
  endTime: number // Timestamp in ms
  initialDuration: number // Duration in seconds
  isComplete: boolean
}

interface TimerContextType {
  timers: Timer[]
  addTimer: (durationInSeconds: number, label?: string) => void
  removeTimer: (id: string) => void
  clearCompleted: () => void
  testSound: () => void
}

const TimerContext = createContext<TimerContextType | undefined>(undefined)

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>([])
  const audioRef = useRef<HTMLAudioElement | null>(null)
  
  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("/timer-alert.mp3")
    audioRef.current.loop = true
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const addTimer = useCallback((durationInSeconds: number, label?: string) => {
    // Unlock audio on user interaction
    if (audioRef.current && audioRef.current.paused) {
      audioRef.current.play().then(() => {
        audioRef.current?.pause()
        audioRef.current!.currentTime = 0
      }).catch(e => console.log("Initial audio unlock failed (expected on first run):", e))
    }

    const newTimer: Timer = {
      id: Math.random().toString(36).substring(2, 9),
      label,
      endTime: Date.now() + durationInSeconds * 1000,
      initialDuration: durationInSeconds,
      isComplete: false,
    }
    setTimers((prev) => [...prev, newTimer])
    toast.success(`Timer set for ${Math.floor(durationInSeconds / 60)}m ${durationInSeconds % 60}s`)
  }, [])

  const testSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => {
        console.error("Test sound failed:", e)
        toast.error("Audio playback blocked. Please interact with the page first.")
      })
      setTimeout(() => {
        audioRef.current?.pause()
        audioRef.current!.currentTime = 0
      }, 2000)
    }
  }, [])

  const removeTimer = useCallback((id: string) => {
    setTimers((prev) => {
      const timerToRemove = prev.find(t => t.id === id)
      if (timerToRemove?.isComplete) {
        // Stop audio if this was the only completed timer playing
        const otherCompleted = prev.filter(t => t.id !== id && t.isComplete)
        if (otherCompleted.length === 0 && audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        }
      }
      return prev.filter((t) => t.id !== id)
    })
  }, [])

  const clearCompleted = useCallback(() => {
    setTimers((prev) => prev.filter((t) => !t.isComplete))
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [])

  // Check timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()
      let newlyCompleted = false

      setTimers((prev) => {
        const nextTimers = prev.map((timer) => {
          if (!timer.isComplete && now >= timer.endTime) {
            newlyCompleted = true
            return { ...timer, isComplete: true }
          }
          return timer
        })

        // If any timer is complete and not yet playing sound, start playing
        const hasActiveCompleted = nextTimers.some(t => t.isComplete)
        if (hasActiveCompleted && audioRef.current && audioRef.current.paused) {
          audioRef.current.play().catch(e => console.error("Audio playback failed:", e))
        }

        return nextTimers
      })

      if (newlyCompleted) {
        toast.info("Timer complete!", {
          duration: Infinity,
          action: {
            label: "Dismiss",
            onClick: () => clearCompleted(),
          },
        })
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [clearCompleted])

  return (
    <TimerContext.Provider value={{ timers, addTimer, removeTimer, clearCompleted, testSound }}>
      {children}
    </TimerContext.Provider>
  )
}

export function useTimer() {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error("useTimer must be used within a TimerProvider")
  }
  return context
}

