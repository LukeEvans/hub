"use client"

import { Laptop, Smartphone, Speaker, Radio, Monitor, Check } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export interface SpotifyDevice {
  id: string
  is_active: boolean
  is_private_session: boolean
  is_restricted: boolean
  name: string
  type: string
  volume_percent: number
  supports_volume: boolean
}

interface DevicePickerProps {
  devices: SpotifyDevice[]
  onSelect: (deviceId: string) => void
  isOpen: boolean
  onClose: () => void
}

const getDeviceIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "computer":
      return Laptop
    case "smartphone":
      return Smartphone
    case "speaker":
    case "cast_audio":
      return Speaker
    case "audio_dongle":
      return Radio
    case "tv":
      return Monitor
    default:
      return Speaker
  }
}

export function DevicePicker({ devices, onSelect, isOpen, onClose }: DevicePickerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect to a device</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {devices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No devices found. Open Spotify on a device to see it here.
            </div>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => {
                const Icon = getDeviceIcon(device.type)
                return (
                  <Button
                    key={device.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-4 h-16 px-4 rounded-xl",
                      device.is_active && "bg-primary/10 text-primary hover:bg-primary/20"
                    )}
                    onClick={() => onSelect(device.id)}
                  >
                    <Icon className="w-6 h-6" />
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{device.name}</div>
                      <div className="text-xs opacity-70">
                        {device.is_active ? "Currently playing" : "Spotify Connect"}
                      </div>
                    </div>
                    {device.is_active && <Check className="w-5 h-5" />}
                  </Button>
                )
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

