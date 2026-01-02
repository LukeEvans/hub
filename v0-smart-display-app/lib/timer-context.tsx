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
  
  // Use the same reliable sound as the settings page
  const ALARM_URL = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"

  const initAudio = useCallback(() => {
    if (!audioRef.current) {
      const audio = new Audio(ALARM_URL)
      audio.loop = true
      audio.preload = "auto"
      audioRef.current = audio
    }
    return audioRef.current
  }, [])

  const addTimer = useCallback((durationInSeconds: number, label?: string) => {
    // Force unlock audio on user interaction
    const audio = initAudio()
    audio.play().then(() => {
      // Only pause if there are no already completed timers
      setTimers(prev => {
        if (!prev.some(t => t.isComplete)) {
          audio.pause()
          audio.currentTime = 0
        }
        return prev
      })
    }).catch(e => {
      console.log("Audio unlock attempted:", e)
    })

    const newTimer: Timer = {
      id: Math.random().toString(36).substring(2, 9),
      label,
      endTime: Date.now() + durationInSeconds * 1000,
      initialDuration: durationInSeconds,
      isComplete: false,
    }
    setTimers((prev) => [...prev, newTimer])
  }, [initAudio])

  const testSound = useCallback(() => {
    const audio = initAudio()
    audio.play().then(() => {
      toast.info("Playing test sound...")
      setTimeout(() => {
        setTimers(prev => {
          if (!prev.some(t => t.isComplete)) {
            audio.pause()
            audio.currentTime = 0
          }
          return prev
        })
      }, 3000)
    }).catch(e => {
      console.error("Test sound failed:", e)
      toast.error(`Audio failed: ${e.message}. Try interacting with the page first.`)
    })
  }, [initAudio])

  const removeTimer = useCallback((id: string) => {
    setTimers((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const clearCompleted = useCallback(() => {
    setTimers((prev) => prev.filter((t) => !t.isComplete))
  }, [])

  // Handle audio playback based on timer states
  useEffect(() => {
    const hasActiveCompleted = timers.some(t => t.isComplete)
    
    if (hasActiveCompleted) {
      if (audioRef.current && audioRef.current.paused) {
        audioRef.current.play().catch(e => {
          console.error("Audio playback failed (likely autoplay block):", e)
        })
      }
    } else {
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [timers])

  // Check timers every second
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now()

      setTimers((prev) => {
        const nextTimers = prev.map((timer) => {
          if (!timer.isComplete && now >= timer.endTime) {
            return { ...timer, isComplete: true }
          }
          return timer
        })
        return nextTimers
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

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

