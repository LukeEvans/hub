"use client"

import { Cloud, Sun, CloudRain, Wind, Droplets, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useApi } from "@/lib/use-api"

export function WeatherWidget() {
  const router = useRouter()
  const { data: weatherData, isLoading } = useApi<any>('/api/weather')

  if (isLoading) {
    return (
      <Card className="h-full flex items-center justify-center bg-gradient-to-br from-[var(--widget-peach)] to-[var(--widget-yellow)]">
        <Loader2 className="w-8 h-8 animate-spin text-foreground/50" />
      </Card>
    )
  }

  const current = weatherData?.current || {}
  const daily = weatherData?.daily?.slice(0, 7) || []
  const hourly = weatherData?.hourly?.slice(0, 7) || []

  const getWeatherIcon = (main: string) => {
    switch (main?.toLowerCase()) {
      case 'clear': return <Sun className="w-full h-full" />;
      case 'rain': return <CloudRain className="w-full h-full" />;
      default: return <Cloud className="w-full h-full" />;
    }
  }

  return (
    <Link 
      href="/weather" 
      prefetch={false}
      className="block h-full"
      draggable={false}
      onClick={(e) => {
        e.preventDefault()
        router.push('/weather')
      }}
    >
      <Card className="h-full p-4 bg-gradient-to-br from-[var(--widget-peach)] to-[var(--widget-yellow)] hover:shadow-lg transition-all border-none flex flex-col">
        <div className="flex justify-between items-start mb-4 shrink-0">
          <div>
            <div className="text-5xl font-bold text-foreground">
              {current.temp !== undefined ? Math.round(current.temp) : '--'}°
            </div>
            <div className="text-sm text-foreground/80 font-medium capitalize">
              {current.weather?.[0]?.description || 'Unknown'}
            </div>
          </div>
          <div className="w-12 h-12 text-foreground/80">
            {getWeatherIcon(current.weather?.[0]?.main)}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Hourly */}
          <div className="flex-1 flex items-center min-h-0">
            <div className="w-full flex justify-between items-center overflow-x-auto pb-4 scrollbar-hide">
              {hourly.map((hour: any, i: number) => (
                <div key={i} className="flex flex-col items-center min-w-[50px] gap-1">
                  <span className="text-[10px] text-foreground/70">
                    {new Date(hour.dt * 1000).toLocaleTimeString([], { hour: 'numeric', hour12: true })}
                  </span>
                  <div className="w-5 h-5 text-foreground/80">
                    {getWeatherIcon(hour.weather?.[0]?.main)}
                  </div>
                  <span className="text-xs font-bold">{Math.round(hour.temp)}°</span>
                </div>
              ))}
            </div>
          </div>

          {/* 7-Day Daily */}
          <div className="flex-1 flex items-center min-h-0 pt-4 border-t border-foreground/10">
            <div className="w-full flex justify-between items-center overflow-x-auto scrollbar-hide">
              {daily.map((day: any, i: number) => (
                <div key={i} className="flex flex-col items-center min-w-[50px] gap-1">
                  <span className="text-[10px] font-medium text-foreground/70 uppercase">
                    {i === 0 ? 'Today' : new Date(day.dt * 1000).toLocaleDateString([], { weekday: 'short' })}
                  </span>
                  <div className="w-6 h-6 text-foreground/80">
                    {getWeatherIcon(day.weather?.[0]?.main)}
                  </div>
                  <div className="flex flex-col items-center leading-none">
                    <span className="text-sm font-bold">{Math.round(day.temp.max)}°</span>
                    <span className="text-[10px] text-foreground/60">{Math.round(day.temp.min)}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

