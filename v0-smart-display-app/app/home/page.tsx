"use client"

import { HomeIcon, Lightbulb, Thermometer, Lock, Camera, Zap, Wind, Tv, DoorClosed, Speaker, Power, Loader2, Settings as SettingsIcon, RefreshCw } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { MenuWidget } from "@/components/dashboard/menu-widget"
import { useApi } from "@/lib/use-api"
import { useState, useMemo } from "react"
import { toast } from "sonner"
import Link from "next/link"
import { useOrientation } from "@/lib/orientation-context"
import { cn } from "@/lib/utils"

export default function HomeAssistantPage() {
  const { data, isLoading, mutate } = useApi<any>('/api/homeassistant/states')
  const { orientation } = useOrientation()
  const [optimisticStates, setOptimisticStates] = useState<Record<string, any>>({})

  const entities = data?.entities || []
  const areas = data?.areas || []
  const areaEntitiesMap = data?.areaEntities || {}
  const isConfigured = data?.isConfigured !== false

  const getEntityState = (entityId: string) => {
    if (optimisticStates[entityId] !== undefined) return optimisticStates[entityId]
    return entities.find((e: any) => e.entity_id === entityId)?.state
  }

  const getEntityAttribute = (entityId: string, attr: string) => {
    return entities.find((e: any) => e.entity_id === entityId)?.attributes?.[attr]
  }

  const callService = async (domain: string, service: string, serviceData: any) => {
    const entityId = serviceData.entity_id
    
    // Optimistic UI update
    if (entityId) {
      if (service === 'turn_on') setOptimisticStates(prev => ({ ...prev, [entityId]: 'on' }))
      if (service === 'turn_off') setOptimisticStates(prev => ({ ...prev, [entityId]: 'off' }))
      if (service === 'lock') setOptimisticStates(prev => ({ ...prev, [entityId]: 'locked' }))
      if (service === 'unlock') setOptimisticStates(prev => ({ ...prev, [entityId]: 'unlocked' }))
    }

    try {
      const res = await fetch('/api/homeassistant/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain, service, serviceData })
      })
      if (!res.ok) throw new Error('Failed to control device')
      mutate() // Refresh data
    } catch (err: any) {
      toast.error(err.message)
      // Revert optimistic update
      if (entityId) {
        setOptimisticStates(prev => {
          const newState = { ...prev }
          delete newState[entityId]
          return newState
        })
      }
    }
  }

  const lights = useMemo(() => entities.filter((e: any) => e.entity_id.startsWith('light.')), [entities])
  const climate = useMemo(() => entities.filter((e: any) => e.entity_id.startsWith('climate.')), [entities])
  const locks = useMemo(() => entities.filter((e: any) => e.entity_id.startsWith('lock.')), [entities])
  const sensors = useMemo(() => entities.filter((e: any) => e.entity_id.startsWith('sensor.')), [entities])
  const cameras = useMemo(() => entities.filter((e: any) => e.entity_id.startsWith('camera.')), [entities])
  const switches = useMemo(() => entities.filter((e: any) => e.entity_id.startsWith('switch.')), [entities])

  const lightsOnCount = useMemo(() => lights.filter((e: any) => e.state === 'on').length, [lights])
  const avgTemp = useMemo(() => {
    const temps = climate.map((e: any) => e.attributes.current_temperature).filter((t: any) => t !== undefined)
    if (temps.length === 0) return 72
    return Math.round(temps.reduce((a: number, b: number) => a + b, 0) / temps.length)
  }, [climate])

  const energyUsage = useMemo(() => {
    const sensor = sensors.find((s: any) => s.entity_id.includes('energy') || s.entity_id.includes('power'))
    return sensor ? `${sensor.state} ${sensor.attributes.unit_of_measurement || 'kW'}` : '0.0 kW'
  }, [sensors])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className={cn(
      "min-h-screen bg-background transition-all duration-300",
      orientation === 'landscape' ? "p-8" : "p-4 pb-24"
    )}>
      {/* Header */}
      <div className="mb-8">
        <div className={cn(
          "flex items-center justify-between mb-2",
          orientation === 'portrait' && "flex-col gap-4 text-center"
        )}>
          <div className={cn(
            "flex items-center gap-4",
            orientation === 'portrait' && "flex-col"
          )}>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--widget-blue)] to-[var(--widget-mint)] flex items-center justify-center">
              <HomeIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">Smart Home</h1>
              <p className="text-muted-foreground text-lg">Home Assistant Dashboard</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => mutate()} 
            className="w-12 h-12 rounded-xl"
            disabled={isLoading}
          >
            <RefreshCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        {!isConfigured && (
          <div className="mt-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-200 text-sm">
            <strong>Home Assistant not configured:</strong> Check your .env file on the Pi for HOME_ASSISTANT_URL and HOME_ASSISTANT_TOKEN.
          </div>
        )}
        {isConfigured && entities.length === 0 && (
          <div className="mt-4 p-6 bg-blue-500/10 border border-blue-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-blue-200">
              <SettingsIcon className="w-8 h-8" />
              <div>
                <p className="font-bold">No entities selected</p>
                <p className="text-sm opacity-80">Go to Settings to pick which devices you want to see here.</p>
              </div>
            </div>
            <Link href="/settings">
              <Button variant="secondary" className="gap-2">
                Configure Dashboard
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Quick Status Cards */}
      <div className={cn(
        "grid gap-4 mb-8 transition-all duration-300",
        orientation === 'landscape' ? "grid-cols-4" : "grid-cols-2"
      )}>
        <Card className="p-4 bg-[var(--widget-blue)]">
          <div className="flex items-center gap-3 mb-2">
            <Lightbulb className="w-5 h-5 text-foreground/70" />
            <span className="text-sm text-foreground/70">Lights</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{lightsOnCount} On</div>
          <div className="text-xs text-foreground/60">of {lights.length} total</div>
        </Card>

        <Card className="p-4 bg-[var(--widget-mint)]">
          <div className="flex items-center gap-3 mb-2">
            <Thermometer className="w-5 h-5 text-foreground/70" />
            <span className="text-sm text-foreground/70">Temperature</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{avgTemp}°F</div>
          <div className="text-xs text-foreground/60">Comfortable</div>
        </Card>

        <Card className="p-4 bg-[var(--widget-peach)]">
          <div className="flex items-center gap-3 mb-2">
            <Lock className="w-5 h-5 text-foreground/70" />
            <span className="text-sm text-foreground/70">Security</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {locks.every((l: any) => l.state === 'locked') ? 'Secure' : 'Unlocked'}
          </div>
          <div className="text-xs text-foreground/60">
            {locks.filter((l: any) => l.state === 'unlocked').length} alerts
          </div>
        </Card>

        <Card className="p-4 bg-[var(--widget-lavender)]">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-foreground/70" />
            <span className="text-sm text-foreground/70">Energy</span>
          </div>
          <div className="text-2xl font-bold text-foreground">{energyUsage}</div>
          <div className="text-xs text-foreground/60">Current usage</div>
        </Card>
      </div>

      <div className={cn(
        "grid gap-6 transition-all duration-300",
        orientation === 'landscape' ? "grid-cols-1 lg:grid-cols-3" : "grid-cols-1"
      )}>
        {/* Main Controls */}
        <div className={cn(
          "space-y-6",
          orientation === 'landscape' ? "lg:col-span-2" : ""
        )}>
          {/* Climate Control */}
          {climate.slice(0, 1).map((entity: any) => (
            <Card key={entity.entity_id} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[var(--widget-mint)] flex items-center justify-center">
                    <Thermometer className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{entity.attributes.friendly_name || 'Climate'}</h2>
                    <p className="text-sm text-muted-foreground">{entity.state}</p>
                  </div>
                </div>
                <div className="text-4xl font-bold">{entity.attributes.temperature || entity.attributes.current_temperature}°</div>
              </div>
              <Slider
                value={[entity.attributes.temperature || 72]}
                min={60}
                max={85}
                step={1}
                onValueChange={(value) => {
                  callService('climate', 'set_temperature', {
                    entity_id: entity.entity_id,
                    temperature: value[0]
                  })
                }}
                className="mb-4"
              />
              <div className="flex gap-2">
                {['cool', 'heat', 'auto', 'off'].map((mode) => (
                  <Button 
                    key={mode}
                    variant={entity.state === mode ? "default" : "outline"} 
                    size="sm"
                    onClick={() => callService('climate', 'set_hvac_mode', {
                      entity_id: entity.entity_id,
                      hvac_mode: mode
                    })}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </Button>
                ))}
              </div>
            </Card>
          ))}

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
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {lights.length === 0 && <p className="text-muted-foreground italic">No lights found</p>}
              {lights.map((light: any) => (
                <div key={light.entity_id} className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Lightbulb className={`w-5 h-5 ${light.state === 'on' ? 'text-yellow-500' : 'text-muted-foreground'}`} />
                    <div>
                      <div className="font-semibold">{light.attributes.friendly_name}</div>
                      <div className="text-sm text-muted-foreground">{light.state === 'on' ? `Brightness: ${Math.round((light.attributes.brightness || 0) / 2.55)}%` : 'Off'}</div>
                    </div>
                  </div>
                  <Switch 
                    checked={light.state === 'on'} 
                    onCheckedChange={(checked) => callService('light', checked ? 'turn_on' : 'turn_off', {
                      entity_id: light.entity_id
                    })} 
                  />
                </div>
              ))}
            </div>
          </Card>

          {/* Security */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[var(--widget-pink)] flex items-center justify-center">
                <Lock className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Security & Cameras</h2>
                <p className="text-sm text-muted-foreground">Locks and cameras</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {locks.map((lock: any) => (
                <div key={lock.entity_id} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <DoorClosed className="w-5 h-5 text-muted-foreground" />
                    <Switch 
                      checked={lock.state === 'locked'} 
                      onCheckedChange={(checked) => callService('lock', checked ? 'lock' : 'unlock', {
                        entity_id: lock.entity_id
                      })} 
                    />
                  </div>
                  <div className="font-semibold">{lock.attributes.friendly_name}</div>
                  <div className="text-sm text-muted-foreground">{lock.state === 'locked' ? 'Locked' : 'Unlocked'}</div>
                </div>
              ))}
              {cameras.map((camera: any) => (
                <div key={camera.entity_id} className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Camera className="w-5 h-5 text-muted-foreground" />
                    <div className={`w-2 h-2 rounded-full ${camera.state !== 'unavailable' ? 'bg-green-500' : 'bg-red-500'}`} />
                  </div>
                  <div className="font-semibold">{camera.attributes.friendly_name}</div>
                  <div className="text-sm text-muted-foreground">{camera.state}</div>
                </div>
              ))}
              {locks.length === 0 && cameras.length === 0 && (
                <p className="text-muted-foreground italic col-span-2 text-center py-4">No security devices found</p>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar - Rooms and Quick Actions */}
        <div className="space-y-6">
          {/* Rooms */}
          <div>
            <h2 className="text-xl font-bold mb-4">Rooms</h2>
            <div className="space-y-3">
              {areas.length === 0 && <p className="text-muted-foreground italic">No areas configured in HA</p>}
              {areas.map((area: any, index: number) => {
                const areaEntities = areaEntitiesMap[area.area_id] || []
                const areaStateEntities = entities.filter((e: any) => areaEntities.includes(e.entity_id))
                const areaLightsOn = areaStateEntities.filter((e: any) => e.entity_id.startsWith('light.') && e.state === 'on').length
                const areaTempEntity = areaStateEntities.find((e: any) => e.entity_id.startsWith('sensor.') && e.attributes.device_class === 'temperature')
                const colors = ["bg-[var(--widget-blue)]", "bg-[var(--widget-mint)]", "bg-[var(--widget-lavender)]", "bg-[var(--widget-peach)]"]
                
                return (
                  <Card key={area.area_id} className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${colors[index % colors.length]}`}>
                    <div className="font-semibold text-foreground mb-1">{area.name}</div>
                    <div className="text-sm text-foreground/70 mb-2">{areaEntities.length} devices</div>
                    <div className="flex items-center justify-between text-xs text-foreground/60">
                      <span>{areaTempEntity?.state ? `${areaTempEntity.state}°F` : '--°F'}</span>
                      <span>{areaLightsOn} lights on</span>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col gap-2 bg-transparent"
                onClick={() => callService('light', 'turn_off', { entity_id: 'all' })}
              >
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
            <div className="text-3xl font-bold text-foreground mb-1">{energyUsage}</div>
            <div className="text-sm text-foreground/70">Real-time monitoring</div>
            <div className="mt-4 pt-4 border-t border-foreground/20 text-xs text-foreground/60">
              Connected via Home Assistant
            </div>
          </Card>

          {/* Weekly Menu */}
          <MenuWidget />
        </div>
      </div>
    </div>
  )
}
