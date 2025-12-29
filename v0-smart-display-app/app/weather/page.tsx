"use client"

import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge, Loader2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { useState, useEffect } from "react"

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWeather() {
      try {
        const res = await fetch('/api/weather')
        if (res.ok) {
          const data = await res.json()
          setWeatherData(data)
        }
      } catch (err) {
        console.error('Failed to fetch weather', err)
      } finally {
        setLoading(false)
      }
    }
    fetchWeather()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  const current = weatherData?.current || {}
  const daily = weatherData?.daily || []
  const hourly = weatherData?.hourly?.slice(0, 12) || []

  return (
    <div className="min-h-screen p-8 bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-full bg-[var(--widget-peach)] flex items-center justify-center">
            <Cloud className="w-7 h-7 text-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Weather</h1>
            <p className="text-muted-foreground text-lg">Current Location</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather - Large Card */}
        <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-[var(--widget-peach)] to-[var(--widget-yellow)]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-8xl font-bold text-foreground mb-2">
                {current.temp !== undefined ? Math.round(current.temp) : '--'}°
              </div>
              <div className="text-2xl text-foreground/80 mb-1">
                {current.weather?.[0]?.main || 'Unknown'}
              </div>
              <div className="text-lg text-foreground/70">
                Feels like {current.feels_like !== undefined ? Math.round(current.feels_like) : '--'}°
              </div>
            </div>
            <Sun className="w-24 h-24 text-foreground/80" />
          </div>
          <div className="flex gap-6 text-foreground/80">
            <div>
              <span className="text-sm">High: </span>
              <span className="font-semibold text-lg">{daily[0]?.temp?.max !== undefined ? Math.round(daily[0].temp.max) : '--'}°</span>
            </div>
            <div>
              <span className="text-sm">Low: </span>
              <span className="font-semibold text-lg">{daily[0]?.temp?.min !== undefined ? Math.round(daily[0].temp.min) : '--'}°</span>
            </div>
            <div>
              <span className="text-sm">Humidity: </span>
              <span className="font-semibold text-lg">{current.humidity ?? '--'}%</span>
            </div>
          </div>
        </Card>

        {/* Weather Details Grid */}
        <div className="space-y-4">
          <Card className="p-4 bg-[var(--widget-blue)]">
            <div className="flex items-center gap-3 mb-2">
              <Wind className="w-5 h-5 text-foreground/70" />
              <span className="text-sm text-foreground/70">Wind</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{current.wind_speed !== undefined ? Math.round(current.wind_speed) : '--'} mph</div>
          </Card>

          <Card className="p-4 bg-[var(--widget-mint)]">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="w-5 h-5 text-foreground/70" />
              <span className="text-sm text-foreground/70">Humidity</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{current.humidity ?? '--'}%</div>
          </Card>

          <Card className="p-4 bg-[var(--widget-lavender)]">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-foreground/70" />
              <span className="text-sm text-foreground/70">Visibility</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{current.visibility !== undefined ? (current.visibility / 1609).toFixed(1) : '--'} mi</div>
          </Card>

          <Card className="p-4 bg-[var(--widget-pink)]">
            <div className="flex items-center gap-3 mb-2">
              <Gauge className="w-5 h-5 text-foreground/70" />
              <span className="text-sm text-foreground/70">Pressure</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{current.pressure !== undefined ? (current.pressure * 0.02953).toFixed(2) : '--'} in</div>
          </Card>
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Hourly Forecast</h2>
        <Card className="p-6">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {hourly.map((hour: any, index: number) => {
              return (
                <div key={index} className="flex flex-col items-center min-w-[100px] gap-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    {new Date(hour.dt * 1000).toLocaleTimeString([], { hour: 'numeric' })}
                  </div>
                  <Cloud className="w-8 h-8 text-primary" />
                  <div className="text-2xl font-bold">{hour.temp !== undefined ? Math.round(hour.temp) : '--'}°</div>
                  <div className="text-xs text-muted-foreground text-center">{hour.weather?.[0]?.main || 'Unknown'}</div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* 7-Day Forecast */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">7-Day Forecast</h2>
        <Card className="p-6">
          <div className="space-y-3">
            {daily.map((day: any, index: number) => {
              return (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-24 font-semibold">
                      {index === 0 ? 'Today' : new Date(day.dt * 1000).toLocaleDateString([], { weekday: 'long' })}
                    </div>
                    <Sun className="w-6 h-6 text-primary" />
                    <div className="text-sm text-muted-foreground flex-1">{day.weather?.[0]?.main || 'Unknown'}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground">{day.temp?.min !== undefined ? Math.round(day.temp.min) : '--'}°</div>
                    <div className="w-24 h-2 bg-gradient-to-r from-[var(--widget-blue)] to-[var(--widget-peach)] rounded-full" />
                    <div className="font-semibold">{day.temp?.max !== undefined ? Math.round(day.temp.max) : '--'}°</div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>
    </div>
  )
}
