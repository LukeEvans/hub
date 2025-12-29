import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sample family members
const familyMembers = [
  { name: "Dad", initial: "D", avatar: "/dad-avatar.png", events: 3 },
  { name: "Mom", initial: "M", avatar: "/diverse-mom-avatars.png", events: 5 },
  { name: "Emma", initial: "E", avatar: "/diverse-girl-avatar.png", events: 2 },
  { name: "Luke", initial: "L", avatar: "/boy-avatar.png", events: 4 },
]

// Sample events with colors and family member assignments
const events = [
  {
    id: 1,
    title: "Grocery Run",
    day: "Wed",
    time: "10:00 - 11:30 AM",
    color: "bg-[var(--widget-mint)]",
    member: "Dad",
  },
  {
    id: 2,
    title: "Coffee With Diane",
    day: "Wed",
    time: "9:45 - 11:00 AM",
    color: "bg-[var(--widget-pink)]",
    member: "Mom",
  },
  {
    id: 3,
    title: "Camping Trip",
    day: "Wed",
    time: "All Day",
    color: "bg-[var(--widget-mint)]",
    member: "Dad",
  },
  {
    id: 4,
    title: "Pickup Dry Cleaning",
    day: "Fri",
    time: "9:30 - 10:15 AM",
    color: "bg-[var(--widget-mint)]",
    member: "Mom",
  },
  {
    id: 5,
    title: "History Test",
    day: "Fri",
    time: "10:30 - 11:00 AM",
    color: "bg-[var(--widget-pink)]",
    member: "Emma",
  },
  {
    id: 6,
    title: "Dog's Big Bath Day!",
    day: "Thu",
    time: "11:00 AM - 12:00 PM",
    color: "bg-[var(--widget-yellow)]",
    member: "Luke",
  },
  {
    id: 7,
    title: "Amelia's Baby Shower",
    day: "Wed",
    time: "12:00 - 1:30 PM",
    color: "bg-[var(--widget-pink)]",
    member: "Mom",
  },
  {
    id: 8,
    title: "House Cleaner",
    day: "Fri",
    time: "11:30 AM - 1:15 PM",
    color: "bg-[var(--widget-pink)]",
    member: "Mom",
  },
  {
    id: 9,
    title: "Tutoring",
    day: "Thu",
    time: "12:30 - 4:00 PM",
    color: "bg-[var(--widget-lavender)]",
    member: "Emma",
  },
  {
    id: 10,
    title: "Study Group",
    day: "Fri",
    time: "12:00 - 1:30 PM",
    color: "bg-[var(--widget-mint)]",
    member: "Luke",
  },
  {
    id: 11,
    title: "Emma's Birthday Party!",
    day: "Sat",
    time: "10:30 AM - 12:00 PM",
    color: "bg-[var(--widget-pink)]",
    member: "Emma",
  },
  {
    id: 12,
    title: "Lunch With Mom",
    day: "Sat",
    time: "12:00 PM",
    color: "bg-[var(--widget-mint)]",
    member: "Luke",
  },
  {
    id: 13,
    title: "Guitar Lesson",
    day: "Sat",
    time: "11:00 AM - 12:30 PM",
    color: "bg-[var(--widget-mint)]",
    member: "Luke",
  },
  {
    id: 14,
    title: "Golf",
    day: "Sat",
    time: "10:30 - 11:45 AM",
    color: "bg-[var(--widget-mint)]",
    member: "Dad",
  },
  {
    id: 15,
    title: "Pottery Class",
    day: "Sun",
    time: "12:30 PM",
    color: "bg-[var(--widget-pink)]",
    member: "Emma",
  },
]

const weekDays = [
  { name: "Wed", date: 18, events: "Camping Trip" },
  { name: "Thu", date: 19, events: null },
  { name: "Fri", date: 20, events: null },
  { name: "Sat", date: 21, events: "Family weekend" },
  { name: "Sun", date: 22, events: null },
]

export default function CalendarPage() {
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })

  return (
    <div className="min-h-screen p-8 bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
              <Calendar className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Miller Family</h1>
              <p className="text-muted-foreground text-lg">{currentTime} • 80°</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-sm font-medium">Today</span>
            <Button variant="ghost" size="icon" className="rounded-full">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Family Members */}
        <div className="flex gap-4">
          {familyMembers.map((member) => (
            <Card
              key={member.name}
              className="px-4 py-2 flex items-center gap-3 hover:shadow-md transition-shadow cursor-pointer"
            >
              <Avatar className="w-8 h-8">
                <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">{member.initial}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-semibold text-sm">{member.name}</div>
                <div className="text-xs text-muted-foreground">{member.events} events</div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Calendar Week View */}
      <Card className="p-6">
        {/* Week Days Header */}
        <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-4 mb-4">
          <div className="text-sm font-medium text-muted-foreground">Time</div>
          {weekDays.map((day) => (
            <div key={day.name} className="text-center">
              <div className="text-2xl font-bold mb-1">
                {day.name} <span className={day.name === "Wed" ? "text-primary" : ""}>{day.date}</span>
              </div>
              {day.events && (
                <div className="text-xs text-muted-foreground bg-[var(--widget-mint)] rounded px-2 py-1 inline-block">
                  {day.events}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div className="grid grid-cols-[100px_repeat(5,1fr)] gap-4 relative">
          {/* Time Labels */}
          <div className="space-y-20">
            {["9 AM", "10 AM", "11 AM", "12 PM", "1 PM"].map((time) => (
              <div key={time} className="text-sm text-muted-foreground font-medium">
                {time}
              </div>
            ))}
          </div>

          {/* Wednesday Events */}
          <div className="relative min-h-[500px] border-l border-border">
            <div className="absolute top-2 left-2 right-2">
              <Card className="p-3 bg-[var(--widget-pink)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm text-foreground">Coffee With Diane</div>
                <div className="text-xs text-foreground/70">9:45 - 11:00 AM</div>
              </Card>
            </div>
            <div className="absolute top-20 left-2 right-2">
              <Card className="p-3 bg-[var(--widget-mint)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm text-foreground">Grocery Run</div>
                <div className="text-xs text-foreground/70">10:00 - 11:30 AM</div>
              </Card>
            </div>
            <div className="absolute top-[240px] left-2 right-2">
              <Card className="p-3 bg-[var(--widget-pink)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm text-foreground">Amelia's Baby Shower</div>
                <div className="text-xs text-foreground/70">12:00 - 1:30 PM</div>
              </Card>
            </div>
          </div>

          {/* Thursday Events */}
          <div className="relative min-h-[500px] border-l border-border">
            <div className="absolute top-40 left-2 right-2">
              <Card className="p-3 bg-[var(--widget-yellow)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm text-foreground">Dog's Big Bath Day!</div>
                <div className="text-xs text-foreground/70">11:00 AM - 12:00 PM</div>
              </Card>
            </div>
            <div className="absolute top-[260px] left-2 right-2">
              <Card className="p-3 bg-[var(--widget-lavender)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm text-foreground">Tutoring</div>
                <div className="text-xs text-foreground/70">12:30 - 4:00 PM</div>
              </Card>
            </div>
          </div>

          {/* Friday Events */}
          <div className="relative min-h-[500px] border-l border-border">
            <div className="absolute top-6 left-2 right-2">
              <Card className="p-3 bg-[var(--widget-mint)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm text-foreground">Pickup Dry Cleaning</div>
                <div className="text-xs text-foreground/70">9:30 - 10:15 AM</div>
              </Card>
            </div>
            <div className="absolute top-24 left-2 right-2">
              <Card className="p-3 bg-[var(--widget-pink)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm text-foreground">History Test</div>
                <div className="text-xs text-foreground/70">10:30 - 11:00 AM</div>
              </Card>
            </div>
            <div className="absolute top-44 left-2 right-2">
              <Card className="p-3 bg-[var(--widget-pink)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm text-foreground">House Cleaner</div>
                <div className="text-xs text-foreground/70">11:30 AM - 1:15 PM</div>
              </Card>
            </div>
            <div className="absolute top-[240px] left-2 right-2">
              <Card className="p-3 bg-[var(--widget-mint)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm text-foreground">Study Group</div>
                <div className="text-xs text-foreground/70">12:00 - 1:30 PM</div>
              </Card>
            </div>
          </div>

          {/* Saturday Events */}
          <div className="relative min-h-[500px] border-l border-border">
            <div className="absolute top-24 left-2 right-2">
              <Card className="p-3 bg-[var(--widget-pink)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm text-foreground">Emma's Birthday Party!</div>
                <div className="text-xs text-foreground/70">10:30 AM - 12:00 PM</div>
              </Card>
            </div>
            <div className="absolute top-32 left-2 right-2">
              <Card className="p-3 bg-[var(--widget-mint)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm text-foreground">Golf</div>
                <div className="text-xs text-foreground/70">10:30 - 11:45 AM</div>
              </Card>
            </div>
            <div className="absolute top-40 left-2 right-2">
              <Card className="p-3 bg-[var(--widget-mint)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm text-foreground">Guitar Lesson</div>
                <div className="text-xs text-foreground/70">11:00 AM - 12:30 PM</div>
              </Card>
            </div>
            <div className="absolute top-[240px] left-2 right-2">
              <Card className="p-3 bg-[var(--widget-mint)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm text-foreground">Lunch With Mom</div>
                <div className="text-xs text-foreground/70">12:00 PM</div>
              </Card>
            </div>
          </div>

          {/* Sunday Events */}
          <div className="relative min-h-[500px] border-l border-border">
            <div className="absolute top-[260px] left-2 right-2">
              <Card className="p-3 bg-[var(--widget-pink)] mb-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className="font-semibold text-sm text-foreground">Pottery Class</div>
                <div className="text-xs text-foreground/70">12:30 PM</div>
              </Card>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
