import { Cloud, CloudRain, Sun, Wind, Droplets, Eye, Gauge } from "lucide-react"
import { Card } from "@/components/ui/card"

const hourlyForecast = [
  { time: "Now", temp: 72, icon: Sun, condition: "Sunny" },
  { time: "1 PM", temp: 73, icon: Sun, condition: "Sunny" },
  { time: "2 PM", temp: 74, icon: Sun, condition: "Sunny" },
  { time: "3 PM", temp: 75, icon: Cloud, condition: "Partly Cloudy" },
  { time: "4 PM", temp: 74, icon: Cloud, condition: "Cloudy" },
  { time: "5 PM", temp: 73, icon: Cloud, condition: "Cloudy" },
  { time: "6 PM", temp: 71, icon: Cloud, condition: "Cloudy" },
  { time: "7 PM", temp: 69, icon: CloudRain, condition: "Rain" },
]

const weeklyForecast = [
  { day: "Today", high: 75, low: 65, icon: Sun, condition: "Partly Cloudy" },
  { day: "Tuesday", high: 73, low: 64, icon: CloudRain, condition: "Rain Showers" },
  { day: "Wednesday", high: 71, low: 62, icon: Cloud, condition: "Cloudy" },
  { day: "Thursday", high: 74, low: 63, icon: Sun, condition: "Sunny" },
  { day: "Friday", high: 76, low: 65, icon: Sun, condition: "Sunny" },
  { day: "Saturday", high: 78, low: 66, icon: Sun, condition: "Mostly Sunny" },
  { day: "Sunday", high: 72, low: 64, icon: CloudRain, condition: "Rain" },
]

export default function WeatherPage() {
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
            <p className="text-muted-foreground text-lg">San Francisco, CA</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Weather - Large Card */}
        <Card className="lg:col-span-2 p-8 bg-gradient-to-br from-[var(--widget-peach)] to-[var(--widget-yellow)]">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="text-8xl font-bold text-foreground mb-2">72°</div>
              <div className="text-2xl text-foreground/80 mb-1">Partly Cloudy</div>
              <div className="text-lg text-foreground/70">Feels like 70°</div>
            </div>
            <Sun className="w-24 h-24 text-foreground/80" />
          </div>
          <div className="flex gap-6 text-foreground/80">
            <div>
              <span className="text-sm">High: </span>
              <span className="font-semibold text-lg">75°</span>
            </div>
            <div>
              <span className="text-sm">Low: </span>
              <span className="font-semibold text-lg">65°</span>
            </div>
            <div>
              <span className="text-sm">Precipitation: </span>
              <span className="font-semibold text-lg">10%</span>
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
            <div className="text-2xl font-bold text-foreground">8 mph</div>
            <div className="text-xs text-foreground/60">NW</div>
          </Card>

          <Card className="p-4 bg-[var(--widget-mint)]">
            <div className="flex items-center gap-3 mb-2">
              <Droplets className="w-5 h-5 text-foreground/70" />
              <span className="text-sm text-foreground/70">Humidity</span>
            </div>
            <div className="text-2xl font-bold text-foreground">62%</div>
          </Card>

          <Card className="p-4 bg-[var(--widget-lavender)]">
            <div className="flex items-center gap-3 mb-2">
              <Eye className="w-5 h-5 text-foreground/70" />
              <span className="text-sm text-foreground/70">Visibility</span>
            </div>
            <div className="text-2xl font-bold text-foreground">10 mi</div>
          </Card>

          <Card className="p-4 bg-[var(--widget-pink)]">
            <div className="flex items-center gap-3 mb-2">
              <Gauge className="w-5 h-5 text-foreground/70" />
              <span className="text-sm text-foreground/70">Pressure</span>
            </div>
            <div className="text-2xl font-bold text-foreground">30.12 in</div>
          </Card>
        </div>
      </div>

      {/* Hourly Forecast */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Hourly Forecast</h2>
        <Card className="p-6">
          <div className="flex gap-4 overflow-x-auto pb-2">
            {hourlyForecast.map((hour, index) => {
              const Icon = hour.icon
              return (
                <div key={index} className="flex flex-col items-center min-w-[100px] gap-2">
                  <div className="text-sm font-medium text-muted-foreground">{hour.time}</div>
                  <Icon className="w-8 h-8 text-primary" />
                  <div className="text-2xl font-bold">{hour.temp}°</div>
                  <div className="text-xs text-muted-foreground text-center">{hour.condition}</div>
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
            {weeklyForecast.map((day, index) => {
              const Icon = day.icon
              return (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-24 font-semibold">{day.day}</div>
                    <Icon className="w-6 h-6 text-primary" />
                    <div className="text-sm text-muted-foreground flex-1">{day.condition}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-muted-foreground">{day.low}°</div>
                    <div className="w-24 h-2 bg-gradient-to-r from-[var(--widget-blue)] to-[var(--widget-peach)] rounded-full" />
                    <div className="font-semibold">{day.high}°</div>
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
