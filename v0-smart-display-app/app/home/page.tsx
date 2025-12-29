"use client"

import { HomeIcon, Lightbulb, Thermometer, Lock, Camera, Zap, Wind, Tv, DoorClosed, Speaker, Power } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"

const rooms = [
  {
    id: 1,
    name: "Living Room",
    devices: 5,
    temperature: 72,
    lightsOn: 3,
    color: "bg-[var(--widget-blue)]",
  },
  {
    id: 2,
    name: "Kitchen",
    devices: 4,
    temperature: 70,
    lightsOn: 2,
    color: "bg-[var(--widget-mint)]",
  },
  {
    id: 3,
    name: "Bedroom",
    devices: 6,
    temperature: 68,
    lightsOn: 1,
    color: "bg-[var(--widget-lavender)]",
  },
  {
    id: 4,
    name: "Office",
    devices: 3,
    temperature: 71,
    lightsOn: 2,
    color: "bg-[var(--widget-peach)]",
  },
]

export default function HomeAssistantPage() {
  const [livingRoomLights, setLivingRoomLights] = useState(true)
  const [kitchenLights, setKitchenLights] = useState(false)
  const [thermostat, setThermostat] = useState(72)
  const [doorLocked, setDoorLocked] = useState(true)

  return (
    <div className="min-h-screen p-8 bg-background">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--widget-blue)] to-[var(--widget-mint)] flex items-center justify-center">
            <HomeIcon className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">Smart Home</h1>
            <p className="text-muted-foreground text-lg">Home Assistant Dashboard</p>
          </div>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8 max-w-7xl">
        <Card className="p-4 bg-[var(--widget-blue)]">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-5 h-5 text-foreground/70" />
            <span className="text-sm text-foreground/70">Lights</span>
          </div>
          <div className="text-2xl font-bold text-foreground">8 On</div>
          <div className="text-xs text-foreground/60">of 16 total</div>
        </Card>

        <Card className="p-4 bg-[var(--widget-mint)]">
          <div className="flex items-center gap-3 mb-2">
            <Thermometer className="w-5 h-5 text-foreground/70" />
            <span className="text-sm text-foreground/70">Temperature</span>
          </div>
          <div className="text-2xl font-bold text-foreground">72°F</div>
          <div className="text-xs text-foreground/60">Comfortable</div>
        </Card>

        <Card className="p-4 bg-[var(--widget-peach)]">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-foreground/70" />
            <span className="text-sm text-foreground/70">Security</span>
          </div>
          <div className="text-2xl font-bold text-foreground">Secure</div>
          <div className="text-xs text-foreground/60">All locked</div>
        </Card>

        <Card className="p-4 bg-[var(--widget-lavender)]">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-foreground/70" />
            <span className="text-sm text-foreground/70">Energy</span>
          </div>
          <div className="text-2xl font-bold text-foreground">2.4 kW</div>
          <div className="text-xs text-foreground/60">Current usage</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl">
        {/* Main Controls */}
        <div className="lg:col-span-2 space-y-6">
          {/* Climate Control */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--widget-mint)] flex items-center justify-center">
                  <Thermometer className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Climate Control</h2>
                  <p className="text-sm text-muted-foreground">Main thermostat</p>
                </div>
              </div>
              <div className="text-4xl font-bold">{thermostat}°</div>
            </div>
            <Slider
              value={[thermostat]}
              min={60}
              max={80}
              step={1}
              onValueChange={(value) => setThermostat(value[0] || 72)}
              className="mb-4"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Cool
              </Button>
              <Button variant="outline" size="sm">
                Heat
              </Button>
              <Button variant="outline" size="sm">
                Auto
              </Button>
              <Button variant="ghost" size="sm">
                <Wind className="w-4 h-4 mr-2" />
                Fan
              </Button>
            </div>
          </Card>

          {/* Lighting Controls */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--widget-yellow)] flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Lighting</h2>
                <p className="text-sm text-muted-foreground">Control room lights</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">Living Room</div>
                    <div className="text-sm text-muted-foreground">3 lights</div>
                  </div>
                </div>
                <Switch checked={livingRoomLights} onCheckedChange={setLivingRoomLights} />
              </div>
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <Lightbulb className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">Kitchen</div>
                    <div className="text-sm text-muted-foreground">2 lights</div>
                  </div>
                </div>
                <Switch checked={kitchenLights} onCheckedChange={setKitchenLights} />
              </div>
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--widget-pink)] flex items-center justify-center">
                <Lock className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Security</h2>
                <p className="text-sm text-muted-foreground">Locks and cameras</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <DoorClosed className="w-5 h-5 text-muted-foreground" />
                  <Switch checked={doorLocked} onCheckedChange={setDoorLocked} />
                </div>
                <div className="font-semibold">Front Door</div>
                <div className="text-sm text-muted-foreground">{doorLocked ? "Locked" : "Unlocked"}</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Camera className="w-5 h-5 text-muted-foreground" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="font-semibold">Front Camera</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <DoorClosed className="w-5 h-5 text-muted-foreground" />
                  <Switch checked={true} disabled />
                </div>
                <div className="font-semibold">Garage Door</div>
                <div className="text-sm text-muted-foreground">Locked</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <Camera className="w-5 h-5 text-muted-foreground" />
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                </div>
                <div className="font-semibold">Backyard Camera</div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar - Rooms and Quick Actions */}
        <div className="space-y-6">
          {/* Rooms */}
          <div>
            <h2 className="text-xl font-bold mb-4">Rooms</h2>
            <div className="space-y-3">
              {rooms.map((room) => (
                <Card key={room.id} className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${room.color}`}>
                  <div className="font-semibold text-foreground mb-1">{room.name}</div>
                  <div className="text-sm text-foreground/70 mb-2">{room.devices} devices</div>
                  <div className="flex items-center justify-between text-xs text-foreground/60">
                    <span>{room.temperature}°F</span>
                    <span>{room.lightsOn} lights on</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                <Power className="w-5 h-5" />
                <span className="text-xs">All Off</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                <Tv className="w-5 h-5" />
                <span className="text-xs">Movie Mode</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                <Speaker className="w-5 h-5" />
                <span className="text-xs">Party Mode</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col gap-2 bg-transparent">
                <HomeIcon className="w-5 h-5" />
                <span className="text-xs">Away Mode</span>
              </Button>
            </div>
          </div>

          {/* Energy Monitor */}
          <Card className="p-4 bg-gradient-to-br from-[var(--widget-yellow)] to-[var(--widget-peach)]">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-foreground" />
              <span className="font-semibold text-foreground">Energy Usage</span>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">2.4 kW</div>
            <div className="text-sm text-foreground/70">$0.32 per hour</div>
            <div className="mt-4 pt-4 border-t border-foreground/20 text-xs text-foreground/60">
              Today: 42.3 kWh • $5.64
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
