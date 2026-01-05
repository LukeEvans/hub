"use client"

import { useState, useEffect } from "react"
import { Loader2, CheckCircle2 } from "lucide-react"
import { useApi } from "@/lib/use-api"
import { cn } from "@/lib/utils"

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  // Pre-fetch all essential data
  const calendar = useApi<any>('/api/calendar/events')
  const weather = useApi<any>('/api/weather')
  const photos = useApi<any>('/api/photos')
  const sports = useApi<any>('/api/sports')
  const mealplan = useApi<any>('/api/mealplan')
  const ha = useApi<any>('/api/homeassistant/states')

  const allLoaded = !calendar.isLoading && 
                    !weather.isLoading && 
                    !photos.isLoading && 
                    !sports.isLoading && 
                    !mealplan.isLoading && 
                    !ha.isLoading

  useEffect(() => {
    // Safety timeout: 15 seconds
    const timeout = setTimeout(() => {
      handleDismiss()
    }, 15000)

    if (allLoaded) {
      // Add a tiny delay for visual polish
      const delay = setTimeout(() => {
        handleDismiss()
      }, 800)
      return () => {
        clearTimeout(timeout)
        clearTimeout(delay)
      }
    }

    return () => clearTimeout(timeout)
  }, [allLoaded])

  const handleDismiss = () => {
    setIsFadingOut(true)
    setTimeout(() => {
      setIsVisible(false)
    }, 500) // Match duration-500 in CSS
  }

  if (!isVisible) return null

  const statusItems = [
    { label: "Calendar", loaded: !calendar.isLoading },
    { label: "Weather", loaded: !weather.isLoading },
    { label: "Photos", loaded: !photos.isLoading },
    { label: "Sports", loaded: !sports.isLoading },
    { label: "Meals", loaded: !mealplan.isLoading },
    { label: "Home", loaded: !ha.isLoading },
  ]

  return (
    <div 
      className={cn(
        "fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out",
        isFadingOut ? "opacity-0 pointer-events-none" : "opacity-100"
      )}
    >
      <div className="flex flex-col items-center max-w-xs w-full">
        <div className="relative mb-8">
          <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
          <Loader2 className="w-16 h-16 animate-spin text-primary absolute inset-0 [animation-duration:3s]" />
        </div>
        
        <h1 className="text-2xl font-bold mb-2 tracking-tight">Initializing Hub</h1>
        <p className="text-muted-foreground text-sm mb-8">Pre-fetching your dashboard data...</p>

        <div className="grid grid-cols-2 gap-4 w-full">
          {statusItems.map((item) => (
            <div 
              key={item.label}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-300",
                item.loaded 
                  ? "bg-primary/5 border-primary/20 text-primary" 
                  : "bg-muted/50 border-transparent text-muted-foreground"
              )}
            >
              {item.loaded ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground animate-spin" />
              )}
              <span className="text-xs font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="absolute bottom-12 left-0 right-0 flex justify-center">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40 font-bold">
          Smart Home Display v1.0
        </p>
      </div>
    </div>
  )
}

