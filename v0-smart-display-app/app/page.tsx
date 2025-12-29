import { Calendar, Cloud, ImageIcon, Utensils } from "lucide-react"
import { Card } from "@/components/ui/card"
import Link from "next/link"

export default function DashboardPage() {
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-5xl font-bold text-balance">Family Dashboard</h1>
          <div className="text-right">
            <div className="text-4xl font-bold">{currentTime}</div>
            <div className="text-lg text-muted-foreground">{currentDate}</div>
          </div>
        </div>
      </div>

      {/* Dashboard Grid - 2x2 for 4 widgets */}
      <div className="grid grid-cols-2 gap-6 max-w-7xl">
        {/* Calendar Widget */}
        <Link href="/calendar">
          <Card className="p-6 h-80 hover:shadow-lg transition-shadow cursor-pointer bg-[var(--widget-blue)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Calendar</h2>
            </div>
            <div className="space-y-3">
              <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3">
                <div className="text-sm font-medium text-foreground/80">10:00 AM</div>
                <div className="font-semibold text-foreground">Morning Meeting</div>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3">
                <div className="text-sm font-medium text-foreground/80">2:30 PM</div>
                <div className="font-semibold text-foreground">Dentist Appointment</div>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3">
                <div className="text-sm font-medium text-foreground/80">6:00 PM</div>
                <div className="font-semibold text-foreground">Family Dinner</div>
              </div>
            </div>
          </Card>
        </Link>

        {/* Weather Widget */}
        <Link href="/weather">
          <Card className="p-6 h-80 hover:shadow-lg transition-shadow cursor-pointer bg-[var(--widget-peach)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Cloud className="w-6 h-6 text-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Weather</h2>
            </div>
            <div className="flex flex-col items-center justify-center h-48">
              <div className="text-7xl font-bold text-foreground mb-2">72°</div>
              <div className="text-xl text-foreground/80">Partly Cloudy</div>
              <div className="mt-4 text-sm text-foreground/70">High: 75° • Low: 65°</div>
            </div>
          </Card>
        </Link>

        {/* Photos Widget */}
        <Link href="/photos">
          <Card className="p-6 h-80 hover:shadow-lg transition-shadow cursor-pointer bg-[var(--widget-mint)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Photos</h2>
            </div>
            <div className="grid grid-cols-3 gap-2 h-48">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white/40 backdrop-blur-sm rounded-lg aspect-square"
                  style={{
                    backgroundImage: `url(/placeholder.svg?height=120&width=120&query=family photo ${i})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}
            </div>
          </Card>
        </Link>

        {/* Recipes Widget */}
        <Link href="/recipes">
          <Card className="p-6 h-80 hover:shadow-lg transition-shadow cursor-pointer bg-[var(--widget-pink)]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Utensils className="w-6 h-6 text-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Recipes</h2>
            </div>
            <div className="space-y-3">
              <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3">
                <div className="font-semibold text-foreground">Chicken Parmesan</div>
                <div className="text-sm text-foreground/70">45 min • Italian</div>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3">
                <div className="font-semibold text-foreground">Salmon with Asparagus</div>
                <div className="text-sm text-foreground/70">30 min • Healthy</div>
              </div>
              <div className="bg-white/40 backdrop-blur-sm rounded-lg p-3">
                <div className="font-semibold text-foreground">Chocolate Cake</div>
                <div className="text-sm text-foreground/70">1 hr • Dessert</div>
              </div>
            </div>
          </Card>
        </Link>
      </div>

      {/* Quick Access Info Bar */}
      <div className="mt-8 max-w-7xl">
        <div className="flex gap-4">
          <Card className="flex-1 p-4 bg-card">
            <div className="text-sm text-muted-foreground mb-1">Next Event</div>
            <div className="font-semibold">Morning Meeting in 2 hours</div>
          </Card>
          <Card className="flex-1 p-4 bg-card">
            <div className="text-sm text-muted-foreground mb-1">Now Playing</div>
            <div className="font-semibold">No music playing</div>
          </Card>
          <Card className="flex-1 p-4 bg-card">
            <div className="text-sm text-muted-foreground mb-1">Smart Home</div>
            <div className="font-semibold">All systems normal</div>
          </Card>
        </div>
      </div>
    </div>
  )
}
